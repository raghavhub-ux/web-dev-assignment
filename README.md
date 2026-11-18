# CampusTrack Backend

> **Student Assignment & Deadline Management REST API**  
> Built with Node.js, Express.js, and MongoDB Atlas.

---

## 📌 Overview

**CampusTrack Backend** is a standalone RESTful API designed to help students track and organize their course assignments, lab deliverables, quizzes, exams, and projects. 

The architecture follows standard MVC design patterns (Models, Controllers, Routes, Middleware) and implements secure, database-backed, revocable **Bearer Token Session Authentication** (not stateless JWTs) with hashed passwords.

---

## 🚀 Features

- **Session-Based Bearer Token Authentication:** Secure, revocable database-backed sessions with SHA-256 hashed bearer tokens and automatic 7-day expiration (TTL).
- **Password Security:** Salted and hashed passwords using `bcryptjs`; passwords are never returned in plain text or in API responses.
- **Resource Ownership Scoping:** All assignments are strictly isolated and scoped to the authenticated user. Students can never access or modify another student's assignments.
- **Full Assignment CRUD:** Create, list, read, update (PATCH), and delete assignments.
- **Filtering & Sorting:** Filter assignments by `status`, `priority`, and `subject`. Results are sorted by ascending due date and capped at 100 entries.
- **Assignment Analytics (`/stats`):** Instant summary statistics showing total assignments, breakdowns by status, priority, category, overdue, and upcoming tasks.
- **Centralized Error Handling:** Consistent JSON error responses for validation errors, duplicate keys, malformed IDs, and bad requests.
- **Postman Collection:** Ready-to-import Postman collection with automated test scripts that automatically save bearer tokens and assignment IDs.

---

## 🛠️ Requirements

- **Node.js**: v22.0.0 or newer (v24 LTS / v26 LTS recommended)
- **MongoDB Atlas**: Free M0 cluster and database user
- **Postman**: Desktop application or web agent
- **Git & GitHub**: Version control and remote repository hosting
- **VS Code** (or code editor of your choice)

---

## 📂 Project Structure

```text
campustrack-backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, and logout controllers
│   │   └── assignmentController.js  # Assignment CRUD and analytics controllers
│   ├── middleware/
│   │   ├── requireAuth.js           # Bearer token validation & session resolver
│   │   └── errorHandler.js          # Centralized error handler & status mapper
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt password hashing
│   │   ├── Assignment.js            # Assignment schema with validation rules
│   │   └── Session.js               # Hashed bearer token session model with TTL
│   ├── routes/
│   │   ├── authRoutes.js            # Authentication routes
│   │   └── assignmentRoutes.js      # Protected assignment routes
│   ├── app.js                       # Express application setup and middleware
│   └── index.js                     # HTTP server entry point
├── postman/
│   └── CampusTrack.postman_collection.json  # Preconfigured Postman collection
├── .env.example                     # Environment template
├── .gitignore                       # Ignored files (node_modules, .env, etc.)
├── package.json                     # Project manifest and scripts
└── README.md                        # Documentation
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

| Name | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port for your local Express HTTP server | `4000` |
| `MONGODB_URI` | MongoDB Atlas connection string with `campustrack` database | *Required* |

> ⚠️ **Important Security Note:**  
> Never commit `.env` to Git. Ensure special characters in your database password (such as `@`, `:`, `/`, `?`, `#`) are properly URL percent-encoded. Add your current IP address to the MongoDB Atlas Network Access whitelist.

---

## 📥 Setup & Installation

### 1. Clone / Open the Project
Open the project directory in VS Code or your terminal:
```bash
cd campustrack-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure `.env`
Create `.env` based on `.env.example`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/campustrack?retryWrites=true&w=majority
```

### 4. Run Development Server
```bash
npm run dev
```
For production:
```bash
npm start
```

### 5. Verify Health Check
Visit [http://localhost:4000/](http://localhost:4000/) in your browser. You will see:
```json
{
  "message": "CampusTrack API is running",
  "version": "v1"
}
```

---

## 📊 Data Models & Fields

### User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | String | 2–30 characters, unique, trimmed, required |
| `email` | String | Valid email format, unique, lowercase, trimmed, required |
| `password` | String | Minimum 8 characters; stored as a salted bcrypt hash, excluded from JSON output |
| `createdAt` | Date | Timestamp of account registration |
| `updatedAt` | Date | Timestamp of last user modification |

### Assignment Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | String | 3–100 characters, required |
| `subject` | String | Maximum 60 characters, required |
| `description` | String | Maximum 500 characters, optional |
| `dueDate` | Date | ISO 8601 date/time string, required |
| `priority` | String | Enum: `Low`, `Medium`, `High` (default: `Medium`) |
| `status` | String | Enum: `Pending`, `In Progress`, `Completed` (default: `Pending`) |
| `category` | String | Enum: `Assignment`, `Lab`, `Project`, `Quiz`, `Exam Preparation` (default: `Assignment`) |
| `user` | ObjectId | Reference to `User` model, automatically assigned from session |
| `timestamps` | Date | `createdAt` and `updatedAt` |

### Session Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `tokenHash` | String | SHA-256 hash of the random bearer token, unique, indexed |
| `user` | ObjectId | Reference to authenticated `User` |
| `expiresAt` | Date | 7 days from creation; TTL indexed for automatic cleanup |

---

## 📡 REST API Endpoints

| Method | Path | Purpose | Bearer Token? |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Health check & API status | No |
| `POST` | `/api/v1/auth/register` | Create a new student account | No |
| `POST` | `/api/v1/auth/login` | Authenticate & obtain bearer token | No |
| `POST` | `/api/v1/auth/logout` | Revoke active bearer token | **Yes** |
| `POST` | `/api/v1/assignments` | Create a new assignment | **Yes** |
| `GET` | `/api/v1/assignments` | List all assignments (with filters, sorted by dueDate) | **Yes** |
| `GET` | `/api/v1/assignments/stats`| Assignment metrics & breakdowns | **Yes** |
| `GET` | `/api/v1/assignments/:id` | Read a single assignment by ID | **Yes** |
| `PATCH` | `/api/v1/assignments/:id` | Update assignment fields | **Yes** |
| `DELETE` | `/api/v1/assignments/:id` | Delete an assignment | **Yes** |

---

## 🧪 Request & Response Examples

### 1. Register User
`POST http://localhost:4000/api/v1/auth/register`

```json
{
  "username": "alex_student",
  "email": "alex.student@campustrack.edu",
  "password": "Password123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "673b0f2095f9e8a00145a101",
      "username": "alex_student",
      "email": "alex.student@campustrack.edu",
      "createdAt": "2026-11-18T06:20:00.000Z",
      "updatedAt": "2026-11-18T06:20:00.000Z"
    }
  }
}
```

---

### 2. Login User
`POST http://localhost:4000/api/v1/auth/login`

```json
{
  "email": "alex.student@campustrack.edu",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "d748f3e589a1b4c3e80928f64e1cba58d928374e21a8c0f58273619472648291",
  "data": {
    "token": "d748f3e589a1b4c3e80928f64e1cba58d928374e21a8c0f58273619472648291",
    "user": {
      "_id": "673b0f2095f9e8a00145a101",
      "username": "alex_student",
      "email": "alex.student@campustrack.edu"
    },
    "expiresAt": "2026-11-25T06:20:00.000Z"
  }
}
```

---

### 3. Create Assignment
`POST http://localhost:4000/api/v1/assignments`

**Headers:**
```http
Authorization: Bearer <YOUR_LOGIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Java OOP Lab Assignment",
  "subject": "Java",
  "description": "Implement inheritance and interfaces",
  "dueDate": "2026-11-20T23:59:00+05:30",
  "priority": "High",
  "status": "Pending",
  "category": "Lab"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "_id": "673b12a095f9e8a00145a205",
    "title": "Java OOP Lab Assignment",
    "subject": "Java",
    "description": "Implement inheritance and interfaces",
    "dueDate": "2026-11-20T18:29:00.000Z",
    "priority": "High",
    "status": "Pending",
    "category": "Lab",
    "user": "673b0f2095f9e8a00145a101",
    "createdAt": "2026-11-18T06:25:00.000Z",
    "updatedAt": "2026-11-18T06:25:00.000Z"
  }
}
```

---

### 4. List Assignments with Filters
`GET http://localhost:4000/api/v1/assignments?status=Pending&priority=High&subject=Java`

**Headers:**
```http
Authorization: Bearer <YOUR_LOGIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673b12a095f9e8a00145a205",
      "title": "Java OOP Lab Assignment",
      "subject": "Java",
      "description": "Implement inheritance and interfaces",
      "dueDate": "2026-11-20T18:29:00.000Z",
      "priority": "High",
      "status": "Pending",
      "category": "Lab",
      "user": "673b0f2095f9e8a00145a101",
      "createdAt": "2026-11-18T06:25:00.000Z",
      "updatedAt": "2026-11-18T06:25:00.000Z"
    }
  ]
}
```

---

### 5. Assignment Statistics
`GET http://localhost:4000/api/v1/assignments/stats`

**Headers:**
```http
Authorization: Bearer <YOUR_LOGIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "byStatus": {
      "Pending": 1,
      "In Progress": 1,
      "Completed": 1
    },
    "byPriority": {
      "Low": 0,
      "Medium": 1,
      "High": 2
    },
    "byCategory": {
      "Assignment": 1,
      "Lab": 1,
      "Project": 1,
      "Quiz": 0,
      "Exam Preparation": 0
    },
    "overdue": 0,
    "upcoming": 2
  }
}
```

---

### 6. Logout
`POST http://localhost:4000/api/v1/auth/logout`

**Headers:**
```http
Authorization: Bearer <YOUR_LOGIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully. Session revoked."
}
```

---

## 📮 Postman Collection Instructions

1. Open Postman.
2. Click **Import** in the top left corner.
3. Choose `postman/CampusTrack.postman_collection.json`.
4. Ensure the `baseUrl` variable is set to `http://localhost:4000`.
5. Execute requests in sequence:
   - **1. Register**: Creates demo student.
   - **2. Login**: Generates session. A test script automatically sets `bearerToken` in your collection variables.
   - **3. Create Assignment**: Automatically saves `data._id` to `assignmentId`.
   - **4. List Assignments**: View all assignments.
   - **5. List with Filters**: Query by status, priority, and subject.
   - **6. Stats**: View aggregated progress metrics.
   - **7. Read One**: Fetch single assignment using saved `{{assignmentId}}`.
   - **8. Update**: Patch status or description.
   - **9. Delete**: Remove the test assignment.
   - **10. Logout**: Revoke session token.

---

## 🔒 Security & Best Practices

- **Hashed Sessions:** Tokens issued to clients are random 64-character hex strings (`crypto.randomBytes(32)`). The database only stores their SHA-256 hash. Even in the event of an unauthorized database read, attacker cannot impersonate active sessions.
- **Immediate Revocation:** Logging out completely purges the session document from MongoDB.
- **Strict User Scoping:** All assignment queries filter strictly by `user: req.user._id`.
- **Validation & Sanitization:** String inputs are trimmed and bounded with minimum/maximum lengths.

---

## 📄 License

ISC License. Built for educational and portfolio demonstration purposes.
