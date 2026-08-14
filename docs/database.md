# Database

## Database

MongoDB with Mongoose.

## Main Collections

### Users

Stores user account and profile information.

Example fields:

- _id
- name
- email
- passwordHash
- profile
- createdAt
- updatedAt

### Meals

Stores analyzed and saved meals.

Example fields:

- _id
- userId
- mealName
- imageUrl
- foods
- totals
- createdAt
- updatedAt

## Food Item

A meal can contain multiple food items.

Example:

Food Item

- name
- quantity
- unit
- calories
- protein
- carbohydrates
- fat
- fiber
- sugar
- sodium
- confidence

## Meal Relationship

User
  ↓
Meals
  ↓
Food Items

## Important Notes

Nutrition values should be treated as estimates.

The database structure may change as new features are implemented.

Any major schema changes should be documented before implementation.