# CMS Adapter Usage Guide

This guide shows developers how to use the CMS abstraction layer in StatusDock to write code that works with both PayloadCMS and Strapi.

## Overview

StatusDock uses an adapter pattern to abstract CMS operations. This allows the same code to work with either PayloadCMS or Strapi, depending on configuration.

## Basic Usage

### Importing the CMS Adapter

```typescript
import { getCMS } from '@/lib/cms'
import type { Service, Incident, Settings } from '@/lib/cms/types'
```

### Getting Data from Collections

#### Find Multiple Documents

```typescript
// Get all services
const cms = getCMS()
const services = await cms.find<Service>('services', {
  limit: 100,
  sort: '_order',
  depth: 1,
})

// services.docs contains the array of services
// services.totalDocs, services.page, etc. contain pagination info
```

#### Find with Filters

```typescript
// Get services with a specific status
const cms = getCMS()
const operationalServices = await cms.find<Service>('services', {
  where: {
    status: { equals: 'operational' },
  },
  limit: 50,
})

// Get incidents that are not resolved
const activeIncidents = await cms.find<Incident>('incidents', {
  where: {
    status: { not_equals: 'resolved' },
  },
  sort: '-createdAt',
})
```

#### Find One Document

```typescript
// Find a service by slug
const cms = getCMS()
const service = await cms.findOne<Service>('services', {
  slug: { equals: 'api-gateway' },
})

// Returns null if not found
if (service) {
  console.log(`Found service: ${service.name}`)
}
```

#### Find by ID

```typescript
// Get a specific incident by ID
const cms = getCMS()
const incident = await cms.findByID<Incident>('incidents', incidentId, 2)
// The third parameter is depth for populating relations
```

### Working with Global Settings

```typescript
import { getSettings, getEmailSettings, getSmsSettings } from '@/lib/cms/settings'

// Get site settings
const settings = await getSettings()
console.log(`Site name: ${settings.siteName}`)

// Get email configuration
const emailSettings = await getEmailSettings()
console.log(`SMTP host: ${emailSettings.smtpHost}`)

// Get SMS configuration
const smsSettings = await getSmsSettings()
console.log(`Twilio number: ${smsSettings.twilioPhoneNumber}`)
```

### Creating Documents

```typescript
// Create a new notification
const cms = getCMS()
const notification = await cms.create<Notification>('notifications', {
  title: 'Incident Update',
  relatedIncident: incidentId,
  channel: 'both',
  status: 'draft',
  subject: 'Service Degradation',
  emailBody: 'We are experiencing issues...',
  smsBody: 'Service issue detected',
})
```

### Updating Documents

```typescript
// Update an incident
const cms = getCMS()
const updatedIncident = await cms.update<Incident>('incidents', incidentId, {
  status: 'resolved',
  resolvedAt: new Date().toISOString(),
})
```

### Deleting Documents

```typescript
// Delete a notification
const cms = getCMS()
await cms.delete('notifications', notificationId)
```

### Queueing Background Jobs

```typescript
// Queue a notification to be sent
const cms = getCMS()
await cms.queueJob('sendNotificationFromCollection', {
  notificationId: notification.id,
  channel: 'both',
  subject: 'Incident Update',
  emailBody: 'Status has changed...',
  smsBody: 'Update: ...',
  itemTitle: incident.title,
  itemUrl: `${siteUrl}/i/${incident.shortId}`,
})
```

## Collection Names

The following collection names are supported:

- `service-groups` - Service groups
- `services` - Individual services
- `incidents` - Incident reports
- `maintenances` - Scheduled maintenance
- `notifications` - Notification queue
- `subscribers` - Email/SMS subscribers
- `users` - Admin users
- `media` - Media files

## Global Slugs

The following global settings slugs are supported:

- `settings` - General site settings
- `email-settings` - SMTP configuration
- `sms-settings` - Twilio configuration

## Query Operators

The adapter supports the following query operators in the `where` clause:

- `equals` - Exact match
- `not_equals` - Not equal to
- `greater_than` - Greater than
- `greater_than_equal` - Greater than or equal to
- `less_than` - Less than
- `less_than_equal` - Less than or equal to
- `like` / `contains` - Text contains
- `in` - Value in array
- `not_in` - Value not in array
- `exists` - Field exists/is not null

Example:

```typescript
const cms = getCMS()
const recentIncidents = await cms.find<Incident>('incidents', {
  where: {
    createdAt: { greater_than: '2024-01-01T00:00:00Z' },
    status: { in: ['investigating', 'identified'] },
  },
})
```

## Populating Relations

Use the `depth` parameter to control how deeply relations are populated:

```typescript
// Depth 0: Don't populate relations (only IDs)
const servicesNoRelations = await cms.find<Service>('services', { depth: 0 })

// Depth 1: Populate direct relations (default)
const servicesWithGroup = await cms.find<Service>('services', { depth: 1 })
// service.group is now the full ServiceGroup object

// Depth 2: Populate nested relations
const incidentsWithServices = await cms.find<Incident>('incidents', { depth: 2 })
// incident.affectedServices[0].group is now fully populated
```

## Complete Example: Frontend Page

Here's a complete example of using the CMS adapter in a Next.js page:

```typescript
import { getCMS } from '@/lib/cms'
import { getSettings } from '@/lib/cms/settings'
import type { Service, ServiceGroup, Incident } from '@/lib/cms/types'

export default async function StatusPage() {
  const cms = getCMS()
  const settings = await getSettings()

  // Get all service groups with their services
  const serviceGroups = await cms.find<ServiceGroup>('service-groups', {
    depth: 2,
    sort: '_order',
    limit: 100,
  })

  // Get all services
  const services = await cms.find<Service>('services', {
    depth: 1,
    sort: '_order',
    limit: 100,
  })

  // Get active incidents
  const incidents = await cms.find<Incident>('incidents', {
    where: {
      status: { not_equals: 'resolved' },
    },
    sort: '-createdAt',
    limit: 10,
  })

  return (
    <div>
      <h1>{settings.siteName} Status</h1>
      
      {/* Render service groups and services */}
      {serviceGroups.docs.map((group) => (
        <div key={group.id}>
          <h2>{group.name}</h2>
          {/* Render services for this group */}
        </div>
      ))}

      {/* Render active incidents */}
      {incidents.docs.length > 0 && (
        <div>
          <h2>Active Incidents</h2>
          {incidents.docs.map((incident) => (
            <div key={incident.id}>
              <h3>{incident.title}</h3>
              <p>Status: {incident.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Complete Example: API Route

Here's an example of using the CMS adapter in an API route:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCMS } from '@/lib/cms'
import type { Subscriber } from '@/lib/cms/types'

export async function POST(request: NextRequest) {
  try {
    const { email, services } = await request.json()

    const cms = getCMS()

    // Check if subscriber already exists
    const existing = await cms.findOne<Subscriber>('subscribers', {
      email: { equals: email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      )
    }

    // Create new subscriber
    const subscriber = await cms.create<Subscriber>('subscribers', {
      type: 'email',
      email,
      subscribedServices: services,
      verified: false,
      unsubscribeToken: generateToken(),
    })

    return NextResponse.json({ success: true, id: subscriber.id })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
```

## Type Safety

The CMS adapter is fully typed with TypeScript. Use the provided types from `@/lib/cms/types` for type safety:

```typescript
import type {
  Service,
  Incident,
  Maintenance,
  Notification,
  Subscriber,
  Settings,
  EmailSettings,
  SmsSettings,
} from '@/lib/cms/types'
```

## Best Practices

1. **Use the Adapter**: Always use `getCMS()` instead of directly importing Payload or Strapi clients
2. **Type Your Queries**: Always specify the type parameter: `cms.find<Service>(...)`
3. **Handle Nulls**: `findOne` can return `null`, always check before using
4. **Use Depth Wisely**: Deep population (depth > 2) can be slow, use only when needed
5. **Cache Settings**: Use the provided `getSettings()` helper which caches results
6. **Error Handling**: Wrap CMS operations in try-catch blocks
7. **Pagination**: Use `limit` and `page` parameters for large datasets

## Differences from Direct Payload Usage

If you're migrating existing code that used Payload directly:

### Before (Payload-specific):
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const services = await payload.find({
  collection: 'services',
  limit: 100,
})
```

### After (CMS-agnostic):
```typescript
import { getCMS } from '@/lib/cms'
import type { Service } from '@/lib/cms/types'

const cms = getCMS()
const services = await cms.find<Service>('services', {
  limit: 100,
})
```

## Testing

When testing, you can mock the CMS adapter:

```typescript
import { getCMS } from '@/lib/cms'

jest.mock('@/lib/cms', () => ({
  getCMS: jest.fn(() => ({
    find: jest.fn(),
    findByID: jest.fn(),
    create: jest.fn(),
    // ... other methods
  })),
}))
```

## Troubleshooting

### Issue: TypeScript errors about return types

**Solution**: Make sure you're importing types from `@/lib/cms/types` and specifying the type parameter in queries.

### Issue: Relations not populated

**Solution**: Increase the `depth` parameter or ensure relations are properly configured in your CMS.

### Issue: Query operators not working

**Solution**: Check that you're using the correct operator names (see Query Operators section above).

## Additional Resources

- [CMS Adapter Source Code](../src/lib/cms/)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Strapi v5 Documentation](https://docs.strapi.io/)
