

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


