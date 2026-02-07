/**
 * Strapi Adapter
 * 
 * Implements the CMS adapter interface for Strapi v5
 */

import type { CMSAdapter, CMSProvider, FindOptions, FindResult } from './types'

/**
 * Strapi API Client
 * Makes HTTP requests to Strapi REST API
 */
class StrapiClient {
  private baseUrl: string
  private apiToken: string
  private adminToken?: string

  constructor() {
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337'
    this.apiToken = process.env.STRAPI_API_TOKEN || ''
    this.adminToken = process.env.STRAPI_ADMIN_TOKEN
  }

  private getHeaders(useAdmin: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (useAdmin && this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`
    } else if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`
    }

    return headers
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
    useAdmin: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers = this.getHeaders(useAdmin)

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Strapi API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  async get<T>(path: string, useAdmin: boolean = false): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, useAdmin)
  }

  async post<T>(path: string, data: any, useAdmin: boolean = true): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      useAdmin
    )
  }

  async put<T>(path: string, data: any, useAdmin: boolean = true): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      useAdmin
    )
  }

  async delete<T>(path: string, useAdmin: boolean = true): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' }, useAdmin)
  }
}

/**
 * Collection name mapping from Payload to Strapi
 */
const COLLECTION_MAP: Record<string, string> = {
  'service-groups': 'service-groups',
  'services': 'services',
  'incidents': 'incidents',
  'maintenances': 'maintenances',
  'notifications': 'notifications',
  'subscribers': 'subscribers',
  'users': 'users',
  'media': 'upload/files',
}

/**
 * Global slug mapping from Payload to Strapi
 */
const GLOBAL_MAP: Record<string, string> = {
  'settings': 'setting',
  'email-settings': 'email-setting',
  'sms-settings': 'sms-setting',
}

export class StrapiAdapter implements CMSAdapter {
  private client: StrapiClient

  constructor() {
    this.client = new StrapiClient()
  }

  getProvider(): CMSProvider {
    return 'strapi'
  }

  /**
   * Convert Payload query options to Strapi format
   */
  private buildStrapiQuery(options: FindOptions = {}): string {
    const params = new URLSearchParams()

    // Pagination
    if (options.page) {
      params.append('pagination[page]', String(options.page))
    }
    if (options.limit) {
      params.append('pagination[pageSize]', String(options.limit))
    }

    // Sorting
    if (options.sort) {
      const sortField = options.sort.startsWith('-') ? options.sort.slice(1) : options.sort
      const sortOrder = options.sort.startsWith('-') ? 'desc' : 'asc'
      params.append('sort', `${sortField}:${sortOrder}`)
    }

    // Populate depth
    if (options.depth !== undefined && options.depth > 0) {
      params.append('populate', '*')
    }

    // Filters
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle complex queries like { not_equals: 'value' }
          Object.entries(value).forEach(([operator, operatorValue]) => {
            const strapiOperator = this.mapOperator(operator)
            params.append(`filters[${key}][${strapiOperator}]`, String(operatorValue))
          })
        } else {
          // Simple equality
          params.append(`filters[${key}][$eq]`, String(value))
        }
      })
    }

    return params.toString()
  }

  /**
   * Map Payload query operators to Strapi operators
   */
  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      'equals': '$eq',
      'not_equals': '$ne',
      'greater_than': '$gt',
      'greater_than_equal': '$gte',
      'less_than': '$lt',
      'less_than_equal': '$lte',
      'like': '$contains',
      'contains': '$contains',
      'in': '$in',
      'not_in': '$notIn',
      'exists': '$notNull',
    }
    return operatorMap[operator] || `$${operator}`
  }

  /**
   * Normalize Strapi response to Payload format
   */
  private normalizeStrapiDoc(doc: any): any {
    if (!doc) return null
    
    return {
      id: doc.id,
      ...doc.attributes,
      createdAt: doc.attributes?.createdAt || new Date().toISOString(),
      updatedAt: doc.attributes?.updatedAt || new Date().toISOString(),
    }
  }

  async find<T>(collection: string, options: FindOptions = {}): Promise<FindResult<T>> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    const query = this.buildStrapiQuery(options)
    const path = `/api/${strapiCollection}${query ? `?${query}` : ''}`

    const response = await this.client.get<{
      data: any[]
      meta: {
        pagination: {
          page: number
          pageSize: number
          pageCount: number
          total: number
        }
      }
    }>(path)

    const docs = response.data.map((doc) => this.normalizeStrapiDoc(doc) as T)
    const pagination = response.meta.pagination

    return {
      docs,
      totalDocs: pagination.total,
      limit: pagination.pageSize,
      totalPages: pagination.pageCount,
      page: pagination.page,
      pagingCounter: (pagination.page - 1) * pagination.pageSize + 1,
      hasPrevPage: pagination.page > 1,
      hasNextPage: pagination.page < pagination.pageCount,
      prevPage: pagination.page > 1 ? pagination.page - 1 : null,
      nextPage: pagination.page < pagination.pageCount ? pagination.page + 1 : null,
    }
  }

  async findByID<T>(collection: string, id: string | number, depth: number = 1): Promise<T> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    const populate = depth > 0 ? '?populate=*' : ''
    const path = `/api/${strapiCollection}/${id}${populate}`

    const response = await this.client.get<{ data: any }>(path)
    return this.normalizeStrapiDoc(response.data) as T
  }

  async count(collection: string, options: FindOptions = {}): Promise<{ totalDocs: number }> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    // Build query with filters but minimal data fetch
    const params = new URLSearchParams()
    
    // Add pagination to minimize data transfer (pageSize=1 is the smallest)
    params.append('pagination[pageSize]', '1')
    
    // Add filters if provided
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([operator, operatorValue]) => {
            const strapiOperator = this.mapOperator(operator)
            params.append(`filters[${key}][${strapiOperator}]`, String(operatorValue))
          })
        } else {
          params.append(`filters[${key}][$eq]`, String(value))
        }
      })
    }
    
    const path = `/api/${strapiCollection}?${params.toString()}`

    const response = await this.client.get<{
      meta: {
        pagination: {
          total: number
        }
      }
    }>(path)

    return { totalDocs: response.meta.pagination.total }
  }

  async findOne<T>(
    collection: string,
    where: Record<string, any>,
    depth: number = 1
  ): Promise<T | null> {
    const result = await this.find<T>(collection, {
      where,
      depth,
      limit: 1,
    })

    return result.docs.length > 0 ? result.docs[0] : null
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    const path = `/api/${strapiCollection}`

    const response = await this.client.post<{ data: any }>(path, { data })
    return this.normalizeStrapiDoc(response.data) as T
  }

  async update<T>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    const path = `/api/${strapiCollection}/${id}`

    const response = await this.client.put<{ data: any }>(path, { data })
    return this.normalizeStrapiDoc(response.data) as T
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const strapiCollection = COLLECTION_MAP[collection] || collection
    const path = `/api/${strapiCollection}/${id}`

    await this.client.delete(path)
  }

  async findGlobal<T>(slug: string, depth: number = 1): Promise<T> {
    const strapiSlug = GLOBAL_MAP[slug] || slug
    const populate = depth > 0 ? '?populate=*' : ''
    const path = `/api/${strapiSlug}${populate}`

    const response = await this.client.get<{ data: any }>(path)
    return this.normalizeStrapiDoc(response.data) as T
  }

  async updateGlobal<T>(slug: string, data: Partial<T>): Promise<T> {
    const strapiSlug = GLOBAL_MAP[slug] || slug
    const path = `/api/${strapiSlug}`

    const response = await this.client.put<{ data: any }>(path, { data })
    return this.normalizeStrapiDoc(response.data) as T
  }

  async queueJob(taskSlug: string, input: Record<string, any>): Promise<void> {
    // Strapi doesn't have built-in job queuing like Payload
    // We'll need to implement this using a custom endpoint or external service
    // For now, we'll call a custom endpoint that can handle job queuing
    const path = '/api/jobs/queue'
    
    await this.client.post(path, {
      task: taskSlug,
      input,
    })
  }
}
