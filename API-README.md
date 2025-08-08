# Gamification Analyzer API

This document explains how to set up and deploy the backend API for the Gamification Analyzer with Supabase database integration.

## 🏗️ Architecture

- **Frontend**: React application (Vite)
- **Backend**: Vercel serverless functions (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with environment variables
- **Deployment**: Vercel

## 📁 Project Structure

```
gamification-analyzer/
├── api/                     # Vercel serverless functions
│   ├── auth/
│   │   └── login.py        # POST /api/auth/login
│   ├── data/
│   │   ├── upload.py       # POST /api/data/upload (admin only)
│   │   ├── results.py      # GET /api/data/results (public)
│   │   └── clear.py        # DELETE /api/data/clear (admin only)
│   └── health.py           # GET /api/health
├── lib/                     # Shared utilities
│   ├── auth.py             # JWT & authentication helpers
│   ├── database.py         # Supabase connection & models
│   └── gamification.py     # Analysis logic
├── src/                     # React frontend
├── vercel.json             # Vercel configuration
├── requirements.txt        # Python dependencies
└── supabase-schema.sql     # Database schema
```

## 🔧 Setup Instructions

### 1. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials**:
   - Project URL: `https://your-project.supabase.co`
   - Anon/Public Key: Found in Settings > API
3. **Run the database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the contents of `supabase-schema.sql`

### 2. Environment Variables

Set these environment variables in your Vercel project:

```bash
# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Vercel Deployment

1. **Connect your GitHub repo** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect the configuration

## 🔌 API Endpoints

### Authentication

#### `POST /api/auth/login`
Admin login endpoint.

**Request:**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

### Data Management

#### `GET /api/data/results` (Public)
Fetch latest analysis results.

**Response:**
```json
{
  "success": true,
  "data": {
    "summaryStats": {...},
    "rankingData": [...],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### `POST /api/data/upload` (Admin Only)
Upload and process CSV data.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request:**
```json
{
  "csvData": "email,first,last,input,outputs,credits,..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data processed and saved successfully",
  "summary": {...}
}
```

#### `DELETE /api/data/clear` (Admin Only)
Clear all analysis data.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis data cleared successfully"
}
```

### Health Check

#### `GET /api/health`
API health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "Gamification Analyzer API",
  "version": "1.0.0"
}
```

## 🔒 Security Features

- **Environment Variables**: Credentials stored securely
- **JWT Authentication**: Secure token-based auth
- **Admin-Only Endpoints**: Protected routes for data management
- **CORS Support**: Proper cross-origin request handling
- **Session Management**: Token expiration and validation

## 🗄️ Database Schema

### `analysis_results`
- `id`: Primary key
- `created_at`: Timestamp
- `summary_stats`: JSON summary statistics
- `ranking_data`: JSON user rankings
- `raw_data_count`: Number of processed records

### `admin_sessions`
- `id`: Primary key
- `token`: JWT token
- `created_at`: Session creation time
- `expires_at`: Session expiration time

## 🚀 Deployment Checklist

- [ ] Supabase project created and schema deployed
- [ ] Environment variables set in Vercel
- [ ] GitHub repo connected to Vercel
- [ ] API endpoints tested
- [ ] Admin authentication working
- [ ] Data upload and retrieval working

## 🔧 Local Development

For local testing:

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables** in `.env` file

3. **Test endpoints** using tools like Postman or curl

## 📊 Data Flow

1. **Admin uploads CSV** → `POST /api/data/upload`
2. **Data processed** → Gamification analysis applied
3. **Results saved** → Stored in Supabase
4. **Public access** → `GET /api/data/results`
5. **Frontend displays** → Real-time results for all users

## 🎯 Benefits

- ✅ **Serverless**: Auto-scaling, cost-effective
- ✅ **Secure**: Proper authentication and authorization
- ✅ **Fast**: Global edge network deployment
- ✅ **Reliable**: Managed database with backups
- ✅ **Maintainable**: Clean separation of concerns

