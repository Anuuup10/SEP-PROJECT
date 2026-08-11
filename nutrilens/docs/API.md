# API Reference

## Base URL
`http://localhost:5000/api`

---

## Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "token": "...", "user": { ... } }`

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "token": "...", "user": { ... } }`

---

## Nutrition Endpoints

### Scan Food Image
- **POST** `/nutrition/scan`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `multipart/form-data` with `image` file
- **Response**: `{ "success": true, "data": { "foodName": "...", "calories": 450, "macros": { ... } } }`

### Get Meal History
- **GET** `/nutrition/history`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "summary": { ... }, "data": [ ... ] }`
