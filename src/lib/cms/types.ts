/**
 * CMS Abstraction Layer Types
 * 
 * This file defines unified interfaces for both PayloadCMS and Strapi
 * to provide a consistent API regardless of the underlying CMS.
 */

// Core CMS provider types
export type CMSProvider = 'payload' | 'strapi'

// Common field types
export type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved'
export type MaintenanceStatus = 'upcoming' | 'in_progress' | 'completed'
export type NotificationChannel = 'email' | 'sms' | 'both'
export type NotificationStatus = 'draft' | 'sending' | 'sent' | 'failed'

// Collection Documents
export interface ServiceGroup {
  id: string | number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string | number
  name: string
  slug: string
  description?: string
  group: ServiceGroup | string | number
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface IncidentUpdate {
  status: IncidentStatus
  message: string
  createdAt: string
}

export interface Incident {
  id: string | number
  title: string
  shortId: string
  status: IncidentStatus
  resolvedAt?: string | null
  affectedServices?: Array<Service | string | number>
  updates: IncidentUpdate[]
  createdAt: string
  updatedAt: string
}

export interface MaintenanceUpdate {
  status: MaintenanceStatus
  message: string
  createdAt: string
}

export interface Maintenance {
  id: string | number
  title: string
  shortId: string
  description?: string
  status: MaintenanceStatus
  scheduledStartAt: string
  scheduledEndAt?: string | null
  duration?: string
  affectedServices?: Array<Service | string | number>
  updates?: MaintenanceUpdate[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string | number
  title: string
  relatedIncident?: Incident | string | number | null
  relatedMaintenance?: Maintenance | string | number | null
  updateIndex?: number
  channel: NotificationChannel
  status: NotificationStatus
  subject?: string
  emailBody?: string
  smsBody?: string
  sentAt?: string | null
  error?: string | null
  createdAt: string
  updatedAt: string
}

export interface Subscriber {
  id: string | number
  type: 'email' | 'sms'
  email?: string
  phoneNumber?: string
  subscribedServices?: Array<Service | string | number>
  verified: boolean
  verificationToken?: string
  unsubscribeToken: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string | number
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string | number
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}

// Global Settings
export interface Settings {
  id: string | number
  siteName: string
  metaTitle?: string
  metaDescription?: string
  logoLight?: Media | string | number
  logoDark?: Media | string | number
  footerText?: string
  maintenanceModeEnabled?: boolean
  updatedAt: string
}

export interface EmailSettings {
  id: string | number
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPassword?: string
  emailFrom?: string
  emailFromName?: string
  updatedAt: string
}

export interface SmsSettings {
  id: string | number
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
  templateIncidentNew?: string
  templateIncidentUpdate?: string
  templateMaintenanceNew?: string
  templateMaintenanceUpdate?: string
  templateTitleMaxLength?: number
  templateMessageMaxLength?: number
  updatedAt: string
}

// Query Options
export interface FindOptions {
  where?: Record<string, any>
  sort?: string
  limit?: number
  depth?: number
  page?: number
}

export interface FindResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// CMS Adapter Interface
export interface CMSAdapter {
  /**
   * Get the CMS provider type
   */
  getProvider(): CMSProvider

  /**
   * Find documents in a collection
   */
  find<T>(collection: string, options?: FindOptions): Promise<FindResult<T>>

  /**
   * Find one document by ID
   */
  findByID<T>(collection: string, id: string | number, depth?: number): Promise<T>

  /**
   * Find one document by field value
   */
  findOne<T>(collection: string, where: Record<string, any>, depth?: number): Promise<T | null>

  /**
   * Create a new document
   */
  create<T>(collection: string, data: Partial<T>): Promise<T>

  /**
   * Update a document by ID
   */
  update<T>(collection: string, id: string | number, data: Partial<T>): Promise<T>

  /**
   * Delete a document by ID
   */
  delete(collection: string, id: string | number): Promise<void>

  /**
   * Get a global settings document
   */
  findGlobal<T>(slug: string, depth?: number): Promise<T>

  /**
   * Update a global settings document
   */
  updateGlobal<T>(slug: string, data: Partial<T>): Promise<T>

  /**
   * Queue a job for background processing
   */
  queueJob(taskSlug: string, input: Record<string, any>): Promise<void>
}
