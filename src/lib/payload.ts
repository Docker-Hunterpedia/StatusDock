import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Setting } from '@/payload-types'
import { getCMS, getCMSProvider } from '@/lib/cms'
import type { Settings } from '@/lib/cms/types'

/**
 * Cached Payload instance getter
 * React's cache() ensures we only create one instance per request
 * 
 * @deprecated When using Strapi, this will throw an error. Use getCMS() instead.
 */
export const getCachedPayload = cache(async () => {
  const provider = getCMSProvider()
  if (provider !== 'payload') {
    throw new Error(
      'getCachedPayload() is only available when using PayloadCMS. ' +
      'Please use getCMS() from @/lib/cms instead for CMS-agnostic code.'
    )
  }
  return getPayload({ config })
})

/**
 * Cached settings getter (CMS-agnostic)
 * Deduplicates settings fetches within a single request
 * Works with both PayloadCMS and Strapi
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const provider = getCMSProvider()
  
  if (provider === 'payload') {
    const payload = await getCachedPayload()
    return payload.findGlobal({
      slug: 'settings',
      depth: 1,
    }) as Promise<Settings>
  } else {
    // Use CMS adapter for Strapi
    const cms = getCMS()
    return cms.findGlobal<Settings>('settings', 1)
  }
})
