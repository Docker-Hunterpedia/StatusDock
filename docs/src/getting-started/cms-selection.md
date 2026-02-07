# Choosing Your CMS Backend

StatusDock supports two powerful headless CMS backends: **Payload CMS 3.x** and **Strapi v5**. Both provide a full-featured admin panel for managing your status page content, and you can switch between them using the `CMS_PROVIDER` environment variable.

## Quick Comparison

| Feature | Payload CMS | Strapi v5 |
|---------|-------------|-----------|
| **Integration** | ✅ Built-in, zero config | ⚙️ Separate deployment |
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Moderate |
| **Admin UI** | Modern, React-based | Modern, React-based |
| **Type Safety** | ✅ Native TypeScript | ✅ TypeScript support |
| **Database** | PostgreSQL | PostgreSQL, MySQL, SQLite |
| **File Storage** | Local & Vercel Blob | Local & cloud providers |
| **API** | REST + GraphQL | REST + GraphQL |
| **Extensibility** | Hooks & Plugins | Plugins & Middlewares |
| **Community** | Growing | Established |
| **License** | MIT | MIT |

## Payload CMS (Default)

**Best for:** Users who want the simplest setup and don't need a separate CMS deployment.

### Advantages

- 🚀 **Zero Configuration** — Pre-configured and ready to use
- 📦 **Single Deployment** — CMS runs within the same Next.js application
- 🔄 **Automatic Migrations** — Database schema managed automatically
- 🎯 **Type-Safe** — Generated TypeScript types for all collections
- 🐳 **Docker-Friendly** — Works out of the box with Docker Compose
- 💰 **Cost-Effective** — Single server instance needed

### When to Choose Payload

- You want the fastest setup experience
- You're deploying with Docker or Vercel
- You prefer an integrated solution
- You want automatic type generation
- You're building a smaller-scale status page

### Setup

No additional setup required! Just set the environment variables:

```env
CMS_PROVIDER=payload  # or omit (payload is default)
DATABASE_URI=postgres://user:pass@host:5432/db
PAYLOAD_SECRET=your-32-character-secret-key
```

## Strapi v5

**Best for:** Teams already using Strapi or who need a completely separate CMS deployment.

### Advantages

- 🏢 **Enterprise-Ready** — Battle-tested in production
- 🔌 **Ecosystem** — Large plugin marketplace
- 👥 **Established Community** — Extensive documentation and support
- 🎨 **Flexible Architecture** — Completely decoupled from frontend
- 🗃️ **Database Options** — Supports PostgreSQL, MySQL, SQLite
- 🛡️ **RBAC** — Advanced role-based access control

### When to Choose Strapi

- You're already familiar with Strapi
- You want a completely decoupled architecture
- You need to reuse the CMS across multiple frontends
- You want access to Strapi's plugin ecosystem
- You prefer MySQL or need multi-database support

### Setup

Requires a separate Strapi deployment. See the [Strapi Setup Guide](../strapi-setup.md) for complete instructions.

```env
CMS_PROVIDER=strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

## Feature Parity

Both CMS backends provide full access to all StatusDock features:

- ✅ Service and service group management
- ✅ Incident creation and updates
- ✅ Maintenance scheduling
- ✅ Subscriber management
- ✅ Email and SMS notifications
- ✅ Rich text content editing
- ✅ Media uploads
- ✅ User authentication and RBAC

The CMS adapter layer ensures that regardless of which backend you choose, your status page works identically.

## Switching Between CMS Backends

You can switch between Payload and Strapi, but it requires data migration:

### From Payload to Strapi

1. Export data from Payload database
2. Set up Strapi instance
3. Import data into Strapi
4. Update `CMS_PROVIDER` to `strapi`
5. Add Strapi connection environment variables

### From Strapi to Payload

1. Export data from Strapi
2. Transform to Payload format
3. Update `CMS_PROVIDER` to `payload`
4. Run Payload migrations
5. Import data

> **Note:** There is no automated migration tool yet. Manual data migration is required when switching backends.

## Deployment Architectures

### Payload Deployment

```
┌──────────────────────────────────────┐
│     Single Next.js Application       │
├──────────────────────────────────────┤
│  Frontend Routes  │  Payload Admin   │
│  /                │  /admin          │
│  /i/*             │  /api/*          │
└──────────────────────────────────────┘
              │
              ▼
    ┌──────────────────┐
    │   PostgreSQL     │
    └──────────────────┘
```

### Strapi Deployment

```
┌─────────────────┐         ┌─────────────────┐
│  Next.js App    │◄───────►│  Strapi CMS     │
│  (Frontend)     │   API   │  (Headless)     │
│  Port 3000      │         │  Port 1337      │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           ▼
        │                   ┌──────────────┐
        │                   │  PostgreSQL  │
        │                   └──────────────┘
        ▼
┌──────────────┐
│  (Optional)  │
│  Payload DB  │
└──────────────┘
```

## Performance Considerations

### Payload
- Lower latency (no external API calls)
- Single process memory footprint
- Scales with your Next.js app

### Strapi
- Additional network hop for each CMS request
- Independent scaling of frontend and CMS
- CDN-friendly with proper caching

## Making Your Choice

**Choose Payload if:**
- ✅ You're starting fresh with StatusDock
- ✅ You want the simplest deployment
- ✅ You value tight integration
- ✅ You're using Vercel or simple Docker setups

**Choose Strapi if:**
- ✅ You're already invested in Strapi ecosystem
- ✅ You need complete architectural decoupling
- ✅ You want to reuse the CMS for other applications
- ✅ You need Strapi-specific plugins or features

## Next Steps

- **Payload Users:** Continue to [Configuration](configuration.md)
- **Strapi Users:** See [Strapi Setup Guide](../strapi-setup.md)
- **Developers:** Review [CMS Adapter Usage](../cms-adapter-usage.md)
