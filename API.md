# API Documentation

MyForms REST API documentation.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Or use cookies (set automatically on login/register).

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### Logout
```http
POST /auth/logout
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Forms

#### Get All Forms
```http
GET /forms?status=PUBLISHED&folderId=uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `folderId` (optional): Filter by folder

**Response:**
```json
{
  "forms": [
    {
      "id": "uuid",
      "title": "My Form",
      "status": "PUBLISHED",
      "_count": {
        "questions": 5,
        "responses": 10
      }
    }
  ]
}
```

#### Get Form by ID
```http
GET /forms/:id
Authorization: Bearer <token>
```

#### Get Public Form
```http
GET /forms/public/:shareableUrl
```

**Response:** Form with questions (no sensitive data)

#### Create Form
```http
POST /forms
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My New Form",
  "description": "Form description",
  "theme": {
    "colors": {
      "primary": "#0ea5e9"
    }
  }
}
```

#### Update Form
```http
PATCH /forms/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "PUBLISHED",
  "password": "optional-password",
  "expiresAt": "2024-12-31T23:59:59Z",
  "responseLimit": 100,
  "allowMultiple": false,
  "collectEmail": true,
  "showProgress": true,
  "confirmationMsg": "Thank you!",
  "folderId": "uuid"
}
```

#### Delete Form
```http
DELETE /forms/:id
Authorization: Bearer <token>
```

#### Duplicate Form
```http
POST /forms/:id/duplicate
Authorization: Bearer <token>
```

#### Get QR Code Data
```http
GET /forms/:id/qrcode
Authorization: Bearer <token>
```

**Response:**
```json
{
  "url": "https://example.com/form/abc123",
  "shareableUrl": "abc123"
}
```

---

### Questions

#### Get Questions for Form
```http
GET /questions/form/:formId
Authorization: Bearer <token>
```

#### Create Question
```http
POST /questions/form/:formId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "MULTIPLE_CHOICE",
  "title": "What is your favorite color?",
  "description": "Please select one",
  "required": true,
  "order": 0,
  "options": {
    "choices": ["Red", "Blue", "Green"]
  },
  "validation": {
    "minLength": 1,
    "maxLength": 100
  }
}
```

**Question Types:**
- `MULTIPLE_CHOICE`
- `CHECKBOXES`
- `SHORT_ANSWER`
- `LONG_ANSWER`
- `DROPDOWN`
- `LINEAR_SCALE`
- `DATE`
- `TIME`
- `DATETIME`
- `FILE_UPLOAD`
- `RICH_TEXT`

#### Update Question
```http
PATCH /questions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Question",
  "required": false
}
```

#### Delete Question
```http
DELETE /questions/:id
Authorization: Bearer <token>
```

#### Reorder Questions
```http
PATCH /questions/form/:formId/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### Duplicate Question
```http
POST /questions/:id/duplicate
Authorization: Bearer <token>
```

---

### Responses

#### Submit Response (Public)
```http
POST /responses/submit
Content-Type: application/json

{
  "formId": "uuid",
  "email": "respondent@example.com", // optional if form.collectEmail is true
  "answers": [
    {
      "questionId": "uuid",
      "value": "Answer text" // or array for checkboxes
    }
  ]
}
```

#### Get Responses for Form
```http
GET /responses/form/:formId?page=1&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "responses": [
    {
      "id": "uuid",
      "completedAt": "2024-01-01T12:00:00Z",
      "answers": [
        {
          "questionId": "uuid",
          "value": "Answer",
          "question": {
            "title": "Question Title"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### Get Single Response
```http
GET /responses/:id
Authorization: Bearer <token>
```

#### Delete Response
```http
DELETE /responses/:id
Authorization: Bearer <token>
```

---

### Analytics

#### Get Form Analytics
```http
GET /analytics/form/:formId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "formId": "uuid",
  "totalResponses": 100,
  "completedResponses": 95,
  "completionRate": 95.0,
  "averageCompletionTime": 180, // seconds
  "questionAnalytics": [
    {
      "questionId": "uuid",
      "questionTitle": "Question",
      "questionType": "MULTIPLE_CHOICE",
      "responseCount": 95,
      "choiceDistribution": [
        {
          "choice": "Option 1",
          "count": 50,
          "percentage": 52.6
        }
      ]
    }
  ],
  "trends": [
    {
      "date": "2024-01-01",
      "count": 10
    }
  ]
}
```

#### Export CSV
```http
GET /analytics/form/:formId/export/csv
Authorization: Bearer <token>
```

Returns CSV file download.

#### Export JSON
```http
GET /analytics/form/:formId/export/json
Authorization: Bearer <token>
```

Returns JSON file download.

---

### Templates

#### Get All Templates
```http
GET /templates?category=Events&publicOnly=true
```

#### Get Template by ID
```http
GET /templates/:id
```

#### Create Template
```http
POST /templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Event Registration",
  "description": "Template for events",
  "category": "Events",
  "formData": { /* form structure */ },
  "isPublic": true
}
```

---

### Webhooks

#### Get Webhooks for Form
```http
GET /webhooks/form/:formId
Authorization: Bearer <token>
```

#### Create Webhook
```http
POST /webhooks/form/:formId
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["response.submitted", "response.started"],
  "secret": "optional-secret"
}
```

#### Update Webhook
```http
PATCH /webhooks/:id
Authorization: Bearer <token>
```

#### Delete Webhook
```http
DELETE /webhooks/:id
Authorization: Bearer <token>
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Strict endpoints: 10 requests per 15 minutes per IP

---

## Webhooks

When a webhook event occurs, a POST request is sent to the configured URL:

```json
{
  "event": "response.submitted",
  "formId": "uuid",
  "responseId": "uuid",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    /* response data */
  }
}
```

The request includes a signature header for verification:
```
X-Webhook-Signature: <hmac-sha256-signature>
```

