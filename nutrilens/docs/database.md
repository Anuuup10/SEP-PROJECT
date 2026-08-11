# Database Schemas (MongoDB / Mongoose)

## 1. User Collection (`users`)

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string; // Unique
  password: string; // Hashed with bcrypt
  dailyCalorieGoal: number; // Default: 2000
  createdAt: Date;
  updatedAt: Date;
}
```

## 2. NutritionLog Collection (`nutritionlogs`)

```typescript
interface INutritionLog {
  _id: ObjectId;
  user: ObjectId; // Reference to IUser
  foodName: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  healthScore: number; // Scale 1 - 100
  insights?: string;
  createdAt: Date;
  updatedAt: Date;
}
```
