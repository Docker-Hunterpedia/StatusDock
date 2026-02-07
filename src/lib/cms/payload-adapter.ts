/**
 * PayloadCMS Adapter
 * 
 * Implements the CMS adapter interface for PayloadCMS
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import type { CMSAdapter, CMSProvider, FindOptions, FindResult } from './types'

export class PayloadAdapter implements CMSAdapter {
  private payloadInstance: any = null

  /**
   * Get or create PayloadCMS instance
   */
  private async getPayloadInstance() {
    if (!this.payloadInstance) {
      this.payloadInstance = await getPayload({ config })
    }
    return this.payloadInstance
  }

  getProvider(): CMSProvider {
    return 'payload'
  }

  async find<T>(collection: string, options: FindOptions = {}): Promise<FindResult<T>> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.find({
      collection,
      where: options.where,
      sort: options.sort,
      limit: options.limit || 10,
      depth: options.depth !== undefined ? options.depth : 1,
      page: options.page || 1,
    })

    return result as FindResult<T>
  }

  async findByID<T>(collection: string, id: string | number, depth: number = 1): Promise<T> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.findByID({
      collection,
      id,
      depth,
    })

    return result as T
  }

  async findOne<T>(
    collection: string,
    where: Record<string, any>,
    depth: number = 1
  ): Promise<T | null> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.find({
      collection,
      where,
      depth,
      limit: 1,
    })

    return result.docs.length > 0 ? (result.docs[0] as T) : null
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.create({
      collection,
      data,
    })

    return result as T
  }

  async update<T>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.update({
      collection,
      id,
      data,
    })

    return result as T
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const payload = await this.getPayloadInstance()
    
    await payload.delete({
      collection,
      id,
    })
  }

  async findGlobal<T>(slug: string, depth: number = 1): Promise<T> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.findGlobal({
      slug,
      depth,
    })

    return result as T
  }

  async updateGlobal<T>(slug: string, data: Partial<T>): Promise<T> {
    const payload = await this.getPayloadInstance()
    
    const result = await payload.updateGlobal({
      slug,
      data,
    })

    return result as T
  }

  async queueJob(taskSlug: string, input: Record<string, any>): Promise<void> {
    const payload = await this.getPayloadInstance()
    
    await payload.jobs.queue({
      task: taskSlug,
      input,
    })
  }
}
