# AI Context & Prompting Architecture

## Overview
NutriLens uses Google Gemini AI to transform image data into structured nutrition information.

## Prompt Strategy
When sending an image payload to Gemini:
1. **Model Selection**: `gemini-1.5-flash` for low latency multimodal inference.
2. **System Rules**:
   - Strictly request JSON formatted outputs.
   - Extract food item names, caloric values, macronutrients (protein, carbs, fat), micro-nutrients, health score (1-100), and short dietary recommendations.
   - Handle ambiguous or compound meal dishes gracefully.
