# Strapi v5 Setup Guide for StatusDock

This guide explains how to set up and use Strapi v5 as an alternative CMS for StatusDock.

## Overview

StatusDock supports both PayloadCMS and Strapi v5 as headless CMS backends. You can choose which one to use via the `CMS_PROVIDER` environment variable.

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16 or higher
- npm or yarn package manager

## Quick Start

### 1. Create a Strapi Project

```bash
# Create a new Strapi project in a separate directory
npx create-strapi-app@latest statusdock-strapi --quickstart

# Or with PostgreSQL from the start
npx create-strapi-app@latest statusdock-strapi \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=statusdock_strapi \
  --dbusername=postgres \
  --dbpassword=postgres
```

### 2. Install Required Plugins

```bash
cd statusdock-strapi
npm install @strapi/plugin-users-permissions
```

### 3. Configure Content Types

Strapi v5 requires you to define content types (equivalent to PayloadCMS collections). You can do this either:

#### Option A: Using the Admin Panel (Recommended for beginners)

1. Start Strapi: `npm run develop`
2. Access the admin panel at `http://localhost:1337/admin`
3. Create your first admin user
4. Navigate to Content-Type Builder
5. Create the following collection types and single types as detailed below

#### Option B: Using JSON Schema Files (Recommended for production)

Copy the schema files from `docs/strapi/schema/` directory to your Strapi project's `src/api/` directory.

## Content Type Schemas

### Collection Types

#### 1. Service Groups (`service-groups`)

```json
{
  "kind": "collectionType",
  "collectionName": "service_groups",
  "info": {
    "singularName": "service-group",
    "pluralName": "service-groups",
    "displayName": "Service Group"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "services": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::service.service",
      "mappedBy": "group"
    }
  }
}
```

#### 2. Services (`services`)

```json
{
  "kind": "collectionType",
  "collectionName": "services",
  "info": {
    "singularName": "service",
    "pluralName": "services",
    "displayName": "Service"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "group": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::service-group.service-group",
      "inversedBy": "services"
    },
    "status": {
      "type": "enumeration",
      "enum": ["operational", "degraded", "partial", "major", "maintenance"],
      "default": "operational",
      "required": true
    }
  }
}
```

#### 3. Incidents (`incidents`)

```json
{
  "kind": "collectionType",
  "collectionName": "incidents",
  "info": {
    "singularName": "incident",
    "pluralName": "incidents",
    "displayName": "Incident"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "shortId": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["investigating", "identified", "monitoring", "resolved"],
      "default": "investigating",
      "required": true
    },
    "resolvedAt": {
      "type": "datetime"
    },
    "affectedServices": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::service.service"
    },
    "updates": {
      "type": "json",
      "required": true
    }
  }
}
```

#### 4. Maintenances (`maintenances`)

```json
{
  "kind": "collectionType",
  "collectionName": "maintenances",
  "info": {
    "singularName": "maintenance",
    "pluralName": "maintenances",
    "displayName": "Maintenance"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "shortId": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "description": {
      "type": "text"
    },
    "status": {
      "type": "enumeration",
      "enum": ["upcoming", "in_progress", "completed"],
      "default": "upcoming",
      "required": true
    },
    "scheduledStartAt": {
      "type": "datetime",
      "required": true
    },
    "scheduledEndAt": {
      "type": "datetime"
    },
    "duration": {
      "type": "string"
    },
    "affectedServices": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::service.service"
    },
    "updates": {
      "type": "json"
    }
  }
}
```

#### 5. Notifications (`notifications`)

```json
{
  "kind": "collectionType",
  "collectionName": "notifications",
  "info": {
    "singularName": "notification",
    "pluralName": "notifications",
    "displayName": "Notification"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "relatedIncident": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::incident.incident"
    },
    "relatedMaintenance": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::maintenance.maintenance"
    },
    "updateIndex": {
      "type": "integer"
    },
    "channel": {
      "type": "enumeration",
      "enum": ["email", "sms", "both"],
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "sending", "sent", "failed"],
      "default": "draft",
      "required": true
    },
    "subject": {
      "type": "string"
    },
    "emailBody": {
      "type": "text"
    },
    "smsBody": {
      "type": "text"
    },
    "sentAt": {
      "type": "datetime"
    },
    "error": {
      "type": "text"
    }
  }
}
```

#### 6. Subscribers (`subscribers`)

```json
{
  "kind": "collectionType",
  "collectionName": "subscribers",
  "info": {
    "singularName": "subscriber",
    "pluralName": "subscribers",
    "displayName": "Subscriber"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "type": {
      "type": "enumeration",
      "enum": ["email", "sms"],
      "required": true
    },
    "email": {
      "type": "email"
    },
    "phoneNumber": {
      "type": "string"
    },
    "subscribedServices": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::service.service"
    },
    "verified": {
      "type": "boolean",
      "default": false,
      "required": true
    },
    "verificationToken": {
      "type": "string"
    },
    "unsubscribeToken": {
      "type": "string",
      "required": true
    }
  }
}
```

### Single Types (Globals)

#### 1. Settings (`setting`)

```json
{
  "kind": "singleType",
  "collectionName": "setting",
  "info": {
    "singularName": "setting",
    "pluralName": "settings",
    "displayName": "Settings"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "siteName": {
      "type": "string",
      "required": true,
      "default": "Status"
    },
    "metaTitle": {
      "type": "string"
    },
    "metaDescription": {
      "type": "text"
    },
    "logoLight": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "logoDark": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "footerText": {
      "type": "text"
    },
    "maintenanceModeEnabled": {
      "type": "boolean",
      "default": false
    }
  }
}
```

#### 2. Email Settings (`email-setting`)

```json
{
  "kind": "singleType",
  "collectionName": "email_setting",
  "info": {
    "singularName": "email-setting",
    "pluralName": "email-settings",
    "displayName": "Email Settings"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "smtpHost": {
      "type": "string"
    },
    "smtpPort": {
      "type": "integer"
    },
    "smtpSecure": {
      "type": "boolean",
      "default": true
    },
    "smtpUser": {
      "type": "string"
    },
    "smtpPassword": {
      "type": "password"
    },
    "emailFrom": {
      "type": "email"
    },
    "emailFromName": {
      "type": "string"
    }
  }
}
```

#### 3. SMS Settings (`sms-setting`)

```json
{
  "kind": "singleType",
  "collectionName": "sms_setting",
  "info": {
    "singularName": "sms-setting",
    "pluralName": "sms-settings",
    "displayName": "SMS Settings"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "twilioAccountSid": {
      "type": "string"
    },
    "twilioAuthToken": {
      "type": "password"
    },
    "twilioPhoneNumber": {
      "type": "string"
    },
    "templateIncidentNew": {
      "type": "text"
    },
    "templateIncidentUpdate": {
      "type": "text"
    },
    "templateMaintenanceNew": {
      "type": "text"
    },
    "templateMaintenanceUpdate": {
      "type": "text"
    },
    "templateTitleMaxLength": {
      "type": "integer",
      "default": 50
    },
    "templateMessageMaxLength": {
      "type": "integer",
      "default": 100
    }
  }
}
```

## Authentication & Security Setup

### 1. Generate API Tokens

1. In Strapi admin panel, navigate to Settings → API Tokens
2. Create a new API token with the following settings:
   - Name: `StatusDock API`
   - Token type: `Full access` (or customize per collection)
   - Duration: `Unlimited`
3. Copy the generated token and save it as `STRAPI_API_TOKEN` in your `.env` file

### 2. Configure Permissions

1. Navigate to Settings → Users & Permissions → Roles
2. For the **Public** role:
   - Enable `find` and `findOne` for: service-groups, services, incidents, maintenances
   - Enable `find` for: setting, email-setting (read-only for public display)
   - **DO NOT** enable any write operations for public
3. For the **Authenticated** role:
   - Enable all operations as needed for authenticated users

### 3. Enable CORS

Edit `config/middlewares.js` in your Strapi project:

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', process.env.SERVER_URL],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

## Configure StatusDock to Use Strapi

### 1. Update Environment Variables

In your StatusDock `.env` file:

```bash
# CMS Provider
CMS_PROVIDER=strapi

# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-generated-api-token
STRAPI_ADMIN_TOKEN=your-admin-token-if-needed

# Database (still needed for StatusDock operations)
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/statusdock_strapi

# Server
SERVER_URL=http://localhost:3000
```

### 2. Start Both Services

```bash
# Terminal 1: Start Strapi
cd statusdock-strapi
npm run develop

# Terminal 2: Start StatusDock
cd StatusDock
npm run dev
```

## Docker Deployment

See the updated `docker-compose.yml` for a complete example of running StatusDock with Strapi.

## Migration from PayloadCMS

If you're migrating from PayloadCMS:

1. Export data from PayloadCMS using the REST API
2. Transform the data to match Strapi's format
3. Import into Strapi using the REST API or admin panel
4. Update `CMS_PROVIDER` to `strapi`
5. Verify all functionality works as expected

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store API tokens in environment variables**, never in code
3. **Use short-lived JWT tokens** with regular rotation
4. **Limit API token permissions** to only what's needed
5. **Enable rate limiting** to prevent abuse
6. **Regularly update Strapi** to get security patches
7. **Use strong passwords** for admin accounts
8. **Enable 2FA** for admin accounts if available

## Troubleshooting

### Issue: API requests failing with 401 Unauthorized

**Solution**: Check that:
- `STRAPI_API_TOKEN` is set correctly
- The token has proper permissions in Strapi admin panel
- CORS is configured correctly

### Issue: Content not appearing on frontend

**Solution**: Verify:
- Public role has proper read permissions
- Content is published (if using draft & publish)
- Strapi is running and accessible

### Issue: Relations not populating

**Solution**: Ensure:
- Relations are properly configured in content types
- Using `?populate=*` in API queries
- The `depth` parameter is set appropriately

## Additional Resources

- [Strapi v5 Documentation](https://docs.strapi.io/)
- [Strapi REST API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Security Guide](https://docs.strapi.io/dev-docs/security)
