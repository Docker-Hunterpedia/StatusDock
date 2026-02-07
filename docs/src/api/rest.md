# REST API

StatusDock provides a REST API for programmatic access to status data.

> **Note**: The API structure is consistent regardless of whether you're using Payload CMS or Strapi as your backend, thanks to the CMS adapter layer.

## Base URL

```
https://your-status-page.com/api
```

## Authentication

Most read endpoints are public. Admin endpoints require authentication via:

- Session cookie (from admin login)
- API key header: `Authorization: Bearer <api-key>`

## Endpoints

### Incidents

#### List Incidents

```http
GET /api/incidents
```

Query parameters:

| Parameter | Description |
|-----------|-------------|
| `limit` | Number of results (default: 10) |
| `page` | Page number (default: 1) |
| `where[status][equals]` | Filter by status |

#### Get Incident

```http
GET /api/incidents/:id
```

### Maintenances

#### List Maintenances

```http
GET /api/maintenances
```

Query parameters same as incidents.

#### Get Maintenance

```http
GET /api/maintenances/:id
```

### Services

#### List Services

```http
GET /api/services
```

#### Get Service

```http
GET /api/services/:id
```

### Service Groups

#### List Service Groups

```http
GET /api/service-groups
```

#### Get Service Group

```http
GET /api/service-groups/:id
```

### Subscribers

#### Subscribe

```http
POST /api/subscribe
Content-Type: application/json

{
  "type": "email",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription successful"
}
```

#### Unsubscribe

```http
POST /api/unsubscribe
Content-Type: application/json

{
  "token": "unsubscribe-token"
}
```

## CMS Backend API

Depending on your `CMS_PROVIDER` setting, additional CMS-specific API endpoints are available:

### Payload CMS

When using Payload CMS, the full Payload REST API is available at `/api`. See the [Payload documentation](https://payloadcms.com/docs/rest-api/overview) for complete details.

### Strapi v5

When using Strapi, access the Strapi API directly at your `STRAPI_URL`. See the [Strapi documentation](https://docs.strapi.io/dev-docs/api/rest) for details.

StatusDock's frontend uses the unified CMS adapter layer, so the status page works the same regardless of backend.

## Common Query Patterns

These patterns work with the StatusDock API endpoints:

#### Filtering

```http
GET /api/incidents?where[status][equals]=investigating
```

#### Sorting

```http
GET /api/incidents?sort=-createdAt
```

#### Pagination

```http
GET /api/incidents?limit=10&page=2
```

#### Field Selection

```http
GET /api/incidents?select[title]=true&select[status]=true
```

## GraphQL

GraphQL endpoints are available depending on your CMS backend:

**Payload CMS:**
```
POST /api/graphql
```

GraphQL Playground (development only):
```
GET /api/graphql-playground
```

**Strapi v5:**
- GraphQL plugin must be installed separately
- Available at `{STRAPI_URL}/graphql`

## Rate Limiting

Public endpoints are rate limited to prevent abuse:

- 100 requests per minute per IP for read endpoints
- 10 requests per minute per IP for subscribe endpoint

## Error Responses

All errors follow this format:

```json
{
  "errors": [
    {
      "message": "Error description"
    }
  ]
}
```

Common HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |
