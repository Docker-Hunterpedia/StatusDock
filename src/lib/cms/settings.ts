/**
 * CMS Settings Helper
 * 
 * Provides cached access to global settings using the CMS adapter
 */

import { cache } from 'react'
import { getCMS } from './index'
import type { Settings, EmailSettings, SmsSettings } from './types'

/**
 * Get site settings
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const cms = getCMS()
  return cms.findGlobal<Settings>('settings', 1)
})

/**
 * Get email settings
 */
export const getEmailSettings = cache(async (): Promise<EmailSettings> => {
  const cms = getCMS()
  return cms.findGlobal<EmailSettings>('email-settings', 1)
})

/**
 * Get SMS settings
 */
export const getSmsSettings = cache(async (): Promise<SmsSettings> => {
  const cms = getCMS()
  return cms.findGlobal<SmsSettings>('sms-settings', 1)
})
