# 📋 MyForms - Modern Form Builder App 📝

A comprehensive, feature-complete form builder application that rivals Microsoft Forms and Google Forms. Create surveys, share them via generated links, and analyze responses through a comprehensive analytics dashboard.

## Features

### Form Builder Interface
- **Drag-and-Drop Interface**: Intuitive question ordering with visual feedback
- **Multiple Question Types**: 
  - Multiple Choice
  - Checkboxes
  - Short Answer
  - Long Answer
  - Dropdown
  - Linear Scale
  - Date/Time Pickers
  - File Upload
- **Real-time Preview**: See your form as you build it
- **Theme Customization**: Customize colors, fonts, and backgrounds
- **Conditional Logic**: Show/hide questions based on previous answers

### Form Management
- **Dashboard**: Organize and manage all your forms
- **Form Status**: Draft, Published, and Archived states
- **Duplication**: Clone existing forms with one click
- **Version Control**: Track form changes over time
- **Folder Organization**: Organize forms into folders

### Sharing & Distribution
- **Shareable URLs**: Unique links for each form
- **Password Protection**: Optional password protection
- **Expiration Dates**: Set form expiration dates
- **QR Code Generation**: Generate QR codes for easy mobile access
- **Embed Codes**: Embed forms in websites
- **Response Limits**: Control maximum number of responses

### Response Collection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Auto-save**: Prevents data loss with automatic saving
- **Progress Indicators**: Visual progress for multi-question forms
- **Validation**: Real-time validation with clear error messages
- **Accessibility**: WCAG compliant interface

### Analytics Dashboard
- **Response Metrics**: Total responses, completion rate, average time
- **Interactive Charts**: 
  - Bar charts for choice distributions
  - Pie charts for multiple choice questions
  - Line graphs for trends over time
- **Question-Level Analytics**: Detailed insights for each question
- **Data Export**: Export responses as CSV, Excel, or JSON
- **Custom Reports**: Filter by date range and questions

### Security & Privacy
- **Authentication**: JWT-based user authentication
- **Role-Based Access**: User and admin roles
- **Data Encryption**: Secure data handling
- **GDPR Compliance**: Privacy-focused design
- **Rate Limiting**: Protection against abuse

## Tech Stack

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication
- **RESTful API** architecture

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **dnd-kit** for drag-and-drop
- **React Hook Form** for form handling

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/swissmarley/myforms.git
   cd myforms
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/myforms?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:5173

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production server (backend)
cd backend
npm start
```

## Project Structure

```
myforms/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── utils/           # Utilities (Prisma client)
│   │   └── index.ts         # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app component
│   └── package.json
└── package.json             # Root package.json for workspace
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - Get all forms for user
- `GET /api/forms/:id` - Get form by ID
- `GET /api/forms/public/:shareableUrl` - Get public form
- `POST /api/forms` - Create new form
- `PATCH /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/duplicate` - Duplicate form

### Questions
- `GET /api/questions/form/:formId` - Get all questions for form
- `POST /api/questions/form/:formId` - Create question
- `PATCH /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `PATCH /api/questions/form/:formId/reorder` - Reorder questions

### Responses
- `POST /api/responses/submit` - Submit response (public)
- `GET /api/responses/form/:formId` - Get responses for form
- `GET /api/responses/:id` - Get single response
- `DELETE /api/responses/:id` - Delete response

### Analytics
- `GET /api/analytics/form/:formId` - Get form analytics
- `GET /api/analytics/form/:formId/export/csv` - Export CSV
- `GET /api/analytics/form/:formId/export/json` - Export JSON

## Deployment

### Backend Deployment

1. **Set environment variables** on your hosting platform
2. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Build and start**:
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy the `dist` folder** to your static hosting (Vercel, Netlify, etc.)
3. **Configure API proxy** to point to your backend URL

### Database Setup

For production, use a managed PostgreSQL database (AWS RDS, Heroku Postgres, etc.) and update the `DATABASE_URL` in your environment variables.

## Security Considerations

- Change `JWT_SECRET` to a strong random string in production
- Use HTTPS in production
- Set up proper CORS policies
- Implement CAPTCHA for public form submissions
- Regular security audits
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on the repository.
