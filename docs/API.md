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

Output should contain:

- Meal name
- Detected food items
- Estimated portions
- Nutrition information
- Confidence information where available

---

## Meals

### Save Meal

POST /api/meals

### Get Meals

GET /api/meals

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