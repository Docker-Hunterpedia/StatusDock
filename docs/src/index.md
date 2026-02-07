# StatusDock

A modern, self-hosted status page with your choice of [Payload CMS](https://payloadcms.com/) or [Strapi v5](https://strapi.io/), built on [Next.js](https://nextjs.org/).

## Features

- 🚨 **Incident Management** - Track and communicate service disruptions
- 🔧 **Scheduled Maintenance** - Plan and notify users about upcoming maintenance
- 📧 **Email & SMS Notifications** - Automatic subscriber notifications via SMTP and Twilio
- 📊 **Service Groups** - Organize services into logical groups
- 🎨 **Beautiful UI** - Modern, responsive status page with dark mode support
- 🔒 **Self-Hosted** - Full control over your data and infrastructure
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose
- 🔄 **CMS Flexibility** - Choose between Payload CMS or Strapi v5

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Docker-Hunterpedia/StatusDock.git
cd StatusDock

# Start with Docker Compose
docker compose up -d
```

Visit `http://localhost:3000` to see your status page, and `http://localhost:3000/admin` to access the admin panel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      StatusDock                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  CMS Backend                 │
│  - Status Page               │  (Payload CMS or Strapi v5)  │
│  - Incident History          │  - Manage Services           │
│  - Subscribe Form            │  - Create Incidents          │
│                              │  - Schedule Maintenances     │
│                              │  - Send Notifications        │
├─────────────────────────────────────────────────────────────┤
│                     PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [Installation Guide](getting-started/installation.md) - Get started with StatusDock
- [Docker Compose Setup](getting-started/docker-compose.md) - Deploy with Docker
- [Admin Guide](admin/overview.md) - Learn how to manage your status page
- [Notification Workflow](admin/notifications.md) - Understand the notification system
