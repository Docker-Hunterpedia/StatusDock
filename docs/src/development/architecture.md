# Architecture

StatusDock is built with modern technologies for reliability and developer experience.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS 3.x or Strapi v5 |
| CMS Adapter | Unified abstraction layer |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Rich Text | Lexical Editor (Payload) / Markdown (Strapi) |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  (Browsers, API Consumers, Email Clients, SMS)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Status Pages   │  │   Admin Panel   │  │  REST API   │ │
│  │  (Frontend)     │  │  (CMS Backend)  │  │  Endpoints  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      CMS Adapter Layer                       │
│  Unified interface for both Payload CMS and Strapi v5       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  getCMS() → PayloadAdapter | StrapiAdapter         │   │
│  │  • find() • findById() • create() • update()       │   │
│  │  • delete() • findGlobal() • updateGlobal()        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   CMS Backend (Choice)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Payload CMS Core    OR    Strapi v5 API           │   │
│  │  • Collections              • Content Types         │   │
│  │  • Globals                  • Single Types          │   │
│  │  • Jobs Queue               • Webhooks              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │   SMTP Server   │           │     Twilio      │         │
│  │   (Email)       │           │     (SMS)       │         │
│  └─────────────────┘           └─────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## CMS Adapter Layer

StatusDock uses an adapter pattern to support multiple CMS backends. The adapter layer provides a unified interface that works with both Payload CMS and Strapi v5.

### Key Benefits

- **CMS Agnostic Code** - Frontend and API routes work with either backend
- **Type Safety** - Shared TypeScript types across both CMS implementations  
- **Easy Migration** - Switch CMS backends with minimal code changes
- **Consistent API** - Same methods regardless of underlying CMS

### Adapter Interface

```typescript
interface CMSAdapter {
  // Collections
  find<T>(collection: string, options: FindOptions): Promise<PaginatedDocs<T>>
  findById<T>(collection: string, id: string, depth?: number): Promise<T>
  create<T>(collection: string, data: any): Promise<T>
  update<T>(collection: string, id: string, data: any): Promise<T>
  delete(collection: string, id: string): Promise<void>
  count(collection: string, where?: Where): Promise<number>
  
  // Globals (Settings)
  findGlobal<T>(slug: string): Promise<T>
  updateGlobal<T>(slug: string, data: any): Promise<T>
}
```

### Usage Example

```typescript
import { getCMS } from '@/lib/cms'

// Works with both Payload and Strapi
const cms = getCMS()  // Auto-detects based on CMS_PROVIDER env var
const services = await cms.find('services', { limit: 50 })
```

See the [CMS Adapter Usage Guide](../../cms-adapter-usage.md) for detailed documentation.

## Data Model

### Collections

```
┌─────────────────┐     ┌─────────────────┐
│  ServiceGroups  │────▶│    Services     │
│  - name         │     │  - name         │
│  - description  │     │  - status       │
│  - order        │     │  - group        │
└─────────────────┘     └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌─────────────────┐  ┌─────────────────┐
           │   Incidents     │  │  Maintenances   │
           │  - title        │  │  - title        │
           │  - status       │  │  - status       │
           │  - impact       │  │  - schedule     │
           │  - updates[]    │  │  - updates[]    │
           └─────────────────┘  └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────┐
                    │  Notifications  │
                    │  - title        │
                    │  - channel      │
                    │  - status       │
                    │  - content      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Subscribers   │
                    │  - type         │
                    │  - email/phone  │
                    │  - active       │
                    └─────────────────┘
```

### Globals

- **Settings** - Site configuration, SMTP, Twilio credentials

## Request Flow

### Status Page Request

```
Browser → Next.js → Server Component → CMS Adapter → CMS Backend → PostgreSQL
                          ↓
                    Rendered HTML
```

### Admin Panel Request

```
Browser → Next.js → CMS Admin UI → CMS API → PostgreSQL
                          ↓
                    React SPA
```

### Notification Flow

```
Save Incident → afterChange Hook → Create Notification Draft
                                          ↓
                              Admin Reviews Draft
                                          ↓
                              Click "Send Now"
                                          ↓
                              API Queues Job
                                          ↓
                              Jobs Queue Processes
                                          ↓
                              SMTP/Twilio Sends
                                          ↓
                              Update Notification Status
```

## Key Design Decisions

### Why Multiple CMS Options?

StatusDock offers both Payload CMS and Strapi v5 to provide flexibility:

**Payload CMS Benefits:**
- Modern, TypeScript-first CMS
- Zero-configuration setup
- Integrated deployment (single app)
- Excellent admin UI out of the box
- Built-in authentication
- Jobs queue for background tasks

**Strapi v5 Benefits:**
- Established, battle-tested platform
- Large plugin ecosystem
- Completely decoupled architecture
- Multi-database support
- Advanced RBAC
- Independent scaling

The CMS adapter layer ensures feature parity between both options.

### Why CMS Adapter Pattern?

- **Flexibility** - Switch CMS backends without rewriting frontend code
- **Maintainability** - Centralized CMS logic reduces duplication
- **Testing** - Easier to mock CMS operations in tests
- **Future-Proofing** - Can add more CMS backends (Directus, Contentful, etc.)

### Why Next.js App Router?

- Server components for performance
- Streaming and suspense support
- Built-in API routes
- Excellent developer experience

### Why PostgreSQL?

- Robust and reliable
- Excellent JSON support
- Widely supported
- Easy to backup and scale

### Why Separate Notifications Collection?

- Audit trail of all notifications
- Review before sending
- Retry failed notifications
- Clear status tracking

## Scaling Considerations

### Horizontal Scaling

- Application is stateless
- Can run multiple instances behind load balancer
- Shared PostgreSQL database

### Database

- Connection pooling (PgBouncer)
- Read replicas for high traffic
- Regular backups

### Jobs Queue

- Can add dedicated worker processes
- Automatic retries on failure
- Scales with subscriber count
