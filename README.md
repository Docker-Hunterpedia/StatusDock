# StatusDock

A modern, self-hosted status page built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/).

[![Docker Build](https://github.com/Docker-Hunterpedia/StatusDock/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/Docker-Hunterpedia/StatusDock/actions/workflows/docker-publish.yml)
[![Documentation](https://github.com/Docker-Hunterpedia/StatusDock/actions/workflows/docs.yml/badge.svg)](https://docker-hunterpedia.github.io/StatusDock)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDocker-Hunterpedia%2FStatusDock&env=PAYLOAD_SECRET&envDescription=Required%20environment%20variables%20for%20StatusDock&project-name=statusdock&repository-name=statusdock&stores=%5B%7B%22type%22%3A%22postgres%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

> **Note**: After deploying to Vercel, make sure to add a **Vercel Blob** store in your project's Storage settings for media uploads to work.

## Features

- **Incident Management** — Track and communicate service disruptions with timeline updates
- **Scheduled Maintenance** — Plan and notify users about upcoming maintenance windows
- **Email & SMS Notifications** — Automatic subscriber notifications via SMTP and Twilio
- **Service Groups** — Organize services into logical groups
- **Beautiful UI** — Modern, responsive status page with dark mode support
- **Self-Hosted** — Full control over your data and infrastructure
- **Docker Ready** — Easy deployment with Docker and Docker Compose

## Quick Start

```bash
git clone https://github.com/Docker-Hunterpedia/StatusDock.git
cd StatusDock

# Start the services
docker compose up -d
```

Visit:

- **Status Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Documentation

📚 **[Full Documentation](https://oday-bakkour.com/statusdock)**

- [Installation Guide](https://oday-bakkour.com/statusdock/getting-started/installation/)
- [Configuration](https://oday-bakkour.com/statusdock/getting-started/configuration/)
- [Admin Guide](https://oday-bakkour.com/statusdock/admin/overview/)
- [API Reference](https://oday-bakkour.com/statusdock/api/rest/)
- [Local Development](https://oday-bakkour.com/statusdock/development/local-setup/)

## Tech Stack

| Component | Technology                                     |
| --------- | ---------------------------------------------- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| CMS       | [Payload CMS 3.x](https://payloadcms.com/)     |
| Database  | PostgreSQL                                     |
| Styling   | Tailwind CSS                                   |
| Email     | Nodemailer (SMTP)                              |
| SMS       | Twilio                                         |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on development setup, coding standards, and the pull request process.

## Security

For security concerns, please review our [Security Policy](SECURITY.md). Do not report security vulnerabilities through public GitHub issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
