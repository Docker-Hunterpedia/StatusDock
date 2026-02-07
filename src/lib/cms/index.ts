/**
 * CMS Factory
 * 
 * Creates and returns the appropriate CMS adapter based on configuration
 */

import { cache } from 'react'
import type { CMSAdapter, CMSProvider } from './types'
import { PayloadAdapter } from './payload-adapter'
import { StrapiAdapter } from './strapi-adapter'

/**
 * Get the configured CMS provider from environment
 */
export function getCMSProvider(): CMSProvider {
  const provider = (process.env.CMS_PROVIDER || 'payload').toLowerCase()
  
  if (provider !== 'payload' && provider !== 'strapi') {
    console.warn(
      `Invalid CMS_PROVIDER "${provider}". Defaulting to "payload". Valid options: payload, strapi`
    )
    return 'payload'
  }

  return provider as CMSProvider
}

/**
 * Create a CMS adapter instance based on the configured provider
 */
function createCMSAdapter(): CMSAdapter {
  const provider = getCMSProvider()

  switch (provider) {
    case 'strapi':
      return new StrapiAdapter()
    case 'payload':
    default:
      return new PayloadAdapter()
  }
}

/**
 * Get cached CMS adapter instance
 * Using React cache() ensures we only create one instance per request
 */
export const getCMS = cache((): CMSAdapter => {
  return createCMSAdapter()
})

/**
 * Legacy export for backward compatibility
 * Maps to the Payload-specific implementation
 */
export { getCachedPayload } from '../payload'
