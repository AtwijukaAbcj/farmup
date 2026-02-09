# Farm Support Admin Dashboard

A comprehensive admin dashboard and API system for managing agricultural support programs including farmer registration, loan management, activity tracking, and land records.

## Project Structure

```
farm_support_admin/
├── server/                 # Node.js/Express API Server
│   ├── models/            # MongoDB models (User, Farmer, Loan, Activity, Land)
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication and validation middleware
│   └── server.js          # Main server file
├── client/                # React Admin Dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── services/      # API services
│   └── public/
├── package.json
└── README.md
```

## Features

### Backend API Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Farmer Management**: Registration, verification, and profile management
- **Loan System**: Application processing, approval workflow, disbursement, and repayment tracking
- **Activity Tracking**: Farm activity logging and monitoring
- **Land Records**: Land registration, mapping, and ownership tracking
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Security**: Rate limiting, input validation, and secure data handling

### Frontend Dashboard Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure login with role-based navigation
- **Real-time Data**: Live updates and notifications
- **Charts & Analytics**: Interactive charts using Recharts
- **Data Management**: CRUD operations for all entities
- **Mobile Responsive**: Works on all device sizes

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd farm_support_admin
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env
   
   # Edit .env files with your configuration
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev:full
   
   # Or run separately:
   # Server only
   npm run dev
   
   # Client only (in another terminal)
   npm run client
   ```

### Default Admin Account
Create an admin user by making a POST request to `/api/auth/register`:
```json
{
  "username": "admin",
  "email": "admin@farmsupport.com",
  "password": "password123",
  "role": "admin",
  "profile": {
    "firstName": "System",
    "lastName": "Administrator"
  }
}
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Farmers Endpoints
- `GET /api/farmers` - Get all farmers (with filtering)
- `POST /api/farmers` - Create new farmer
- `GET /api/farmers/:id` - Get farmer by ID
- `PUT /api/farmers/:id` - Update farmer
- `PUT /api/farmers/:id/verify` - Verify farmer
- `PUT /api/farmers/:id/status` - Update farmer status

### Loans Endpoints
- `GET /api/loans` - Get all loans (with filtering)
- `POST /api/loans` - Create loan application
- `GET /api/loans/:id` - Get loan by ID
- `PUT /api/loans/:id/status` - Update loan status
- `POST /api/loans/:id/disburse` - Disburse loan
- `POST /api/loans/:id/payment` - Record payment

### Activities Endpoints
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `GET /api/activities/farmer/:farmerId` - Get farmer activities

### Land Endpoints
- `GET /api/land` - Get all land records
- `POST /api/land` - Create land record
- `GET /api/land/:id` - Get land record by ID
- `PUT /api/land/:id` - Update land record
- `GET /api/land/nearby` - Get nearby land records

### Dashboard Endpoints
- `GET /api/dashboard/overview` - Dashboard overview stats
- `GET /api/dashboard/trends` - Trend data for charts
- `GET /api/dashboard/analytics` - Detailed analytics
- `GET /api/dashboard/recent-activities` - Recent system activities
- `GET /api/dashboard/alerts` - System alerts

## Database Models

### User Model
- Authentication and authorization
- Role-based access (admin, field_officer, user)
- Profile information

### Farmer Model
- Personal information and contact details
- Address and location data
- Farming details and experience
- Financial information
- Document storage
- Verification status

### Loan Model
- Loan application details
- Approval workflow tracking
- Disbursement information
- Repayment tracking
- Document management

### Activity Model
- Farming activity logging
- Cost tracking
- Location and timing
- Results and outcomes
- Photo attachments

### Land Model
- Land parcel information
- Ownership details
- Location and boundaries
- Infrastructure and utilities
- Environmental factors
- Legal status

## Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farm_support
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3000
```

### Client (client/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Farm Support Admin
```

## Deployment

### Production Build
```bash
# Build client
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Example Dockerfile structure
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Development

### Project Scripts
```bash
# Development
npm run dev              # Start server in development
npm run client          # Start React client
npm run dev:full        # Start both server and client

# Installation
npm run install-all     # Install all dependencies
npm run install-server  # Install server dependencies
npm run install-client  # Install client dependencies

# Production
npm run build          # Build client for production
npm start             # Start production server
```

### Code Structure Guidelines
- **Models**: Define MongoDB schemas with validation
- **Routes**: Implement REST API endpoints with proper error handling
- **Middleware**: Authentication, validation, and security
- **Components**: Reusable React components with prop validation
- **Pages**: Main page components with data fetching
- **Services**: API client functions and utilities

## Technologies Used

### Backend
- **Node.js & Express**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logging

### Frontend
- **React 18**: UI library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **React Hot Toast**: Notifications
- **Axios**: HTTP client

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Secure password hashing
- CORS configuration
- Security headers with Helmet
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.