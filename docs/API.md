# API

Base URL:

/api

---

## Authentication

### Register

POST /api/auth/register

Purpose:
Create a new user account.

### Login

POST /api/auth/login

Purpose:
Authenticate an existing user.

### Get Current User

GET /api/auth/me

Purpose:
Return the currently authenticated user.

---

## Food Scanner

### Analyze Food

POST /api/scan

Purpose:
Analyze an uploaded food image using AI.

Input:

- Food image

Response contains `data` with:

- `isFood` and `mealName`
- `items[]` with item name, portion, cooking method, nutrients, confidence, assumptions, and possible allergens
- `totals` calculated by the server from the item values
- `overallConfidence`, `insight`, and an estimate disclaimer
- `image`, a compressed Base64 JPEG thumbnail stored with the Firestore scan

Nutrition values are image-based estimates. Food scan thumbnails are compressed
and stored in Firestore, so Firebase Storage is not required for food scanning.
Original camera files are not persisted.

Example item nutrients use calories in kcal, protein/carbohydrates/fat/fiber/
sugar/saturated fat in grams, and sodium in milligrams.

---

## Meals

### Save Meal

POST /api/meals

### Get Meals

GET /api/meals

The implemented route is `GET /api/nutrition/history`.

### Save Meal

POST /api/nutrition/meals

Body: `{ "scanId": "..." }`

### Upload Profile Picture

POST /api/uploads/profile-picture

Multipart field: `image`

### Get Single Meal

GET /api/meals/:id

### Delete Meal

DELETE /api/meals/:id

---

## Dashboard

### Get Today's Nutrition

GET /api/dashboard/today

### Get Weekly Nutrition

GET /api/dashboard/weekly

---

## Goals

### Get Goals

GET /api/goals

### Update Goals

PUT /api/goals

---

## API Rules

- Protected endpoints require authentication.
- Validate incoming data.
- Return consistent error responses.
- Never expose sensitive information.
- Never expose API keys.
