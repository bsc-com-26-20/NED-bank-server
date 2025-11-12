# Backend Connection Guide

## 📋 Overview

This guide explains how the frontend connects to the backend server and how to set everything up.

## 🔧 Backend Server Setup

### 1. Navigate to Backend Folder
```bash
cd C:\Users\RO\Projects\minibank-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the `minibank-server` folder with:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
REFRESH_SECRET=your_refresh_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Set Up Database
Make sure PostgreSQL is running and run the `init.sql` script to create the database tables.

### 5. Start the Backend Server
```bash
node index.js
```

The server should start on `http://localhost:5000`

## 🔌 Frontend Connection

### API Configuration

The frontend is configured to connect to the backend through the `api.js` file:

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**Important:** Make sure both servers are running:
- **Backend:** `http://localhost:5000` (Node.js/Express)
- **Frontend:** `http://localhost:8000` (or your frontend server)

### Available API Endpoints

#### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

#### Dashboard
- `GET /stats` - Get dashboard statistics
- `GET /accounts/recent/all` - Get recent transactions

#### Accounts
- `GET /accounts/:customer_id` - Get customer accounts
- `POST /accounts/:account_id/deposit` - Deposit money
- `POST /accounts/:account_id/withdraw` - Withdraw money
- `POST /accounts/:from_account_id/transfer/:to_account_id` - Transfer money
- `GET /accounts/:account_id/transactions` - Get account transactions

#### Customers
- `GET /customers` - Get all customers
- `POST /customers` - Create new customer
- `GET /customers/:id/accounts` - Get customer with accounts

#### Reports
- `GET /reports/daily` - Download daily report PDF

## 🚀 How It Works

### 1. API Service (`api.js`)
- Handles all API calls to the backend
- Manages authentication tokens
- Provides helper functions for making requests

### 2. Frontend Integration (`script.js`)
- Uses the API service to fetch real data
- Updates the UI with backend data
- Handles authentication state

### 3. Data Flow
```
Frontend (Browser) → API Service (api.js) → Backend Server → PostgreSQL Database
```

## 🔐 Authentication

The frontend stores authentication tokens in `localStorage`:
- `accessToken` - Short-lived token (15 minutes)
- `refreshToken` - Long-lived token (7 days)

When making API requests, the token is automatically included in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

## 📝 Example Usage

### Login
```javascript
import { login } from './api.js';

const response = await login('username', 'password');
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

### Get Dashboard Stats
```javascript
import { getDashboardStats } from './api.js';

const stats = await getDashboardStats();
console.log(stats.total_customers);
console.log(stats.total_accounts);
console.log(stats.total_balance);
```

### Get Recent Transactions
```javascript
import { getRecentTransactions } from './api.js';

const transactions = await getRecentTransactions();
transactions.forEach(tx => {
  console.log(tx.type, tx.amount, tx.created_at);
});
```

## ⚠️ CORS Configuration

The backend already has CORS enabled:
```javascript
app.use(cors());
```

This allows the frontend to make requests from `http://localhost:8000` to `http://localhost:5000`.

## 🐛 Troubleshooting

### Backend not responding
1. Check if the backend server is running: `http://localhost:5000`
2. Check the console for errors
3. Verify database connection

### CORS errors
- Make sure CORS is enabled in the backend
- Check that the frontend URL matches the CORS configuration

### Authentication errors
- Check if tokens are stored in localStorage
- Verify JWT_SECRET is set in backend .env file
- Try logging in again

### Data not loading
- Open browser DevTools (F12) → Network tab
- Check if API requests are being made
- Look for error messages in the console

## 📚 Next Steps

1. **Add Login Page**: Create a login form that uses the `login()` function
2. **Display Real Stats**: Update the home page to show real dashboard statistics
3. **Transaction History**: Connect the history page to show real transactions
4. **Payments**: Connect the payments page to deposit/withdraw/transfer functionality
5. **Error Handling**: Add better error messages and loading states

## 🎯 Key JavaScript Concepts

- **Fetch API**: Making HTTP requests
- **Async/Await**: Handling asynchronous operations
- **ES Modules**: Import/export for code organization
- **localStorage**: Storing data in the browser
- **Error Handling**: Try/catch for error management
