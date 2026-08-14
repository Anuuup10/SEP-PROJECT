KhanaLens Design System
Design Direction

KhanaLens is a modern, clean and premium mobile-first nutrition application.

The interface should feel like a polished health and lifestyle mobile app rather than a typical web application.

The primary visual style is:

Clean
Minimal
Soft
Fresh
Friendly
Premium
Mobile-first

The main brand color is #76C4AE.

Color System
Primary

Mint Green: #76C4AE

Use for:

Primary buttons
Active navigation
Main actions
Progress indicators
Important highlights
Scanner controls
Brand elements
Background

Use mostly:

White
Very light gray
Very light mint-tinted backgrounds

The interface should remain bright and spacious.

Text
Primary Text

Dark charcoal / near-black.

Used for:

Headings
Important numbers
Food names
Main information
Secondary Text

Muted gray.

Used for:

Descriptions
Labels
Supporting information
Metadata
Secondary Accent Colors

Use secondary colors carefully for nutrition categories and status indicators.

Protein → Green
Carbohydrates → Soft Orange
Fat → Soft Blue
Water → Light Blue
Calories → Mint / Neutral
Warning → Soft Orange
Error → Soft Red
Success → Mint Green

Do not allow secondary colors to overpower the primary #76C4AE brand color.

Typography

Use a modern clean sans-serif font.

Typography hierarchy:

Large Heading

Used for:

Welcome messages
Page titles
Major nutrition values
Section Heading

Used for:

Today's Nutrition
Recent Meals
Your Goals
Nutrition Facts
Body

Used for:

Descriptions
Food information
Supporting text
Small Text

Used for:

Labels
Units
Timestamps
Secondary information

Keep typography simple and readable.

Avoid decorative fonts.

UI Style
Cards

Cards are a major part of the KhanaLens interface.

Use:

White backgrounds
Large rounded corners
Subtle borders
Very soft shadows
Comfortable padding

Cards should feel lightweight and clean.

Avoid heavy shadows or strong borders.

Border Radius

Use rounded corners consistently.

Suggested:

Small elements: 10px - 14px
Cards: 18px - 24px
Large sections: 24px - 30px
Buttons: 12px - 18px
Circular controls: fully rounded
Buttons

Primary buttons:

Background: #76C4AE
White text
Rounded corners
Comfortable height
Clear action label

Secondary buttons:

White or very light background
#76C4AE text
Light border

Primary actions should always be visually stronger.

Spacing

Use generous spacing.

The interface should not feel crowded.

Recommended spacing scale:

4px
8px
12px
16px
20px
24px
32px

Use larger spacing between major sections.

Navigation

Use a mobile bottom navigation.

Main sections:

Home
Progress
Scan
History
Profile

The Scan action should be visually emphasized because food scanning is the primary feature.

Example:

Home | Progress | Scan | History | Profile

The active navigation item uses #76C4AE.

Screen Designs

1. Splash / Onboarding

Purpose:

Introduce KhanaLens.

Include:

KhanaLens logo
Brand name
Short tagline
Food imagery
Soft botanical decoration
Get Started button
Login button
Small onboarding indicators

Suggested tagline:

Scan. Analyze. Eat Smarter.

Visual style:

White / very light background
Mint green accents
Large rounded elements
Minimal decoration 2. Login

Route:

/login

Include:

Welcome message
Email field
Password field
Forgot password
Login button
Google login
Apple login
Link to registration

Design:

White background
Rounded input fields
Primary button using #76C4AE
Minimal distractions 3. Register

Route:

/register

Include:

Full name
Email
Password
Confirm password
Create account button
Social login options
Link to login

Maintain the same visual language as Login.

4. Home / Dashboard

Route:

/

This is the main screen after login.

Include:

Greeting
User profile/avatar
Notification icon
Scan Your Food CTA
Today's nutrition summary
Calorie progress
Protein progress
Carbohydrate progress
Fat progress
Recent meals
Bottom navigation

The Scan Your Food card should be one of the most visually prominent elements.

Example structure:

Greeting

↓

Scan Your Food

↓

Today's Summary

↓

Recent Meals

↓

Bottom Navigation

5. Food Scanner

Route:

/scan

This is the main feature of KhanaLens.

The camera should occupy most of the screen.

Include:

Camera preview
Food scanning frame
Close/back button
Gallery button
Camera capture button
Camera switch button
Short scanning instruction

Example:

Center your food in the frame

The capture button should use the primary mint color.

Keep the scanner interface minimal.

6. AI Analysis / Processing

Route:

/scan/analyzing

Show a clear processing experience after the image is captured.

Example steps:

Detecting food items
Identifying ingredients
Estimating portions
Calculating nutrition

Completed steps should show a success indicator.

The current processing step should show an animated indicator.

Include a small AI illustration or subtle AI visual.

Message:

Analyzing your meal...

Supporting text:

Our AI is working hard.

Do not make the processing screen overly complicated.

7. Food Analysis Result

Route:

/scan/result

This screen displays the complete analyzed meal.

Include:

Back button
Save button
Favorite option
Meal name
Number of detected food items
Meal image
Total calories
Protein
Carbohydrates
Fat
Health / nutrition indicator
Detected food items

Example:

Chicken Rice Meal

3 food items detected

628 kcal

Protein: 48g
Carbs: 72g
Fat: 14g

Detected Items:

Grilled Chicken
Steamed Rice
Fresh Salad

Primary actions:

View Details
Add to Diary 8. Food Details

Route:

/food/:id

This screen focuses on one individual detected food.

Include:

Food image
Food name
Estimated portion
Calories
Protein
Carbohydrates
Fat
Fiber
Sugar
Sodium
Water
Other available nutrition information

Example:

Grilled Chicken

150g estimated

248 kcal

Nutrition Facts

Calories
Protein
Carbohydrates
Fat
Fiber
Sodium

Allow users to edit the estimated portion.

Primary action:

Edit Portion

9. Progress / Daily Breakdown

Route:

/progress

Display the user's daily nutrition.

Include:

Today's date
Daily calorie progress
Protein progress
Carbohydrate progress
Fat progress
Fiber
Sugar
Sodium
Water
Today's meals

Use:

Circular progress indicators
Horizontal progress bars
Clean cards

Nutrition categories should use subtle secondary colors while maintaining the overall mint visual identity.

10. Goals

Route:

/goals

Allow users to manage their nutrition goals.

Include:

Daily calorie goal
Protein goal
Carbohydrate goal
Fat goal
Water goal
Weight goal

Each goal should appear as a clean rounded card/list item.

Example:

Calories → 2,000 kcal
Protein → 120g
Carbs → 250g
Fat → 70g
Water → 2,000ml

Primary action:

Edit Goals

11. Goal Progress

Route:

/progress/goals

Show long-term progress.

Include:

Current weight
Goal weight
Weight progress chart
Weekly selector
Goal completion
Calorie progress
Protein progress
Carbohydrate progress
Fat progress

Charts should be:

Minimal
Clean
Easy to read
Mostly white space
Mint-focused

Use secondary colors only when necessary.

12. Meal History

Route:

/history

Display previously saved meals.

Include:

Filter options
Date grouping
Meal image
Meal name
Calories
Number of food items
Meal time

Example:

Today

Chicken Rice Meal
628 kcal · 3 items

Chicken Salad
486 kcal · 2 items

Yesterday

Veg Pasta
520 kcal · 2 items

Use food thumbnails to make history visually engaging.

13. Profile / Settings

Route:

/profile

Include:

Profile image
Name
Email
Personal information
My Goals
Activity Level
Units
Notifications
Privacy Policy
Help & Support
Logout

Keep the screen clean and list-based.

Use subtle icons and separators.

Food Imagery

Food images are an important part of the interface.

Use:

High-quality food photography
Natural lighting
Realistic presentation
Rounded image containers

Food imagery should be prominent on:

Scanner
Analysis Result
Food Details
Meal History
Home

Avoid overly artificial or cartoon-like food images unless specifically required.

Charts & Progress

Charts should have a minimal health-dashboard aesthetic.

Use:

Rounded chart containers
Soft grid lines
Minimal labels
Mint primary chart color
Secondary colors only when necessary

Avoid complex charts that are difficult to understand on mobile.

Icons

Use a consistent modern icon set.

Icons should be:

Simple
Minimal
Rounded where possible
Consistent in stroke weight

Do not mix multiple unrelated icon styles.

Responsive Design

KhanaLens is primarily a mobile-first web application.

Primary target:

360px+
390px+
430px+

Also support:

Tablet
Desktop

Desktop layouts should expand naturally into wider dashboard layouts.

Do not simply stretch the mobile UI across the entire desktop screen.

Animation

Use subtle animations only.

Recommended:

Button press
Page transitions
Progress animations
Scanner capture feedback
AI analysis progress
Card appearance

Avoid excessive animations.

Animations should make the interface feel polished, not distracting.

Accessibility

The UI should maintain:

Readable text
Sufficient contrast
Large touch targets
Clear button labels
Accessible form inputs
Keyboard navigation where applicable
Meaningful alternative text for important images

Do not rely only on color to communicate information.

Design Rules
Primary brand color is #76C4AE.
Keep the interface predominantly white and light.
Use mint green as the main accent.
Use orange, blue and other colors only as secondary nutrition/status indicators.
Use rounded cards throughout the application.
Maintain consistent spacing and border radius.
Keep the interface mobile-first.
Keep important information visually prominent.
Avoid overcrowding screens.
Reuse existing UI components.
Maintain the same design language across every screen.
Avoid unnecessary gradients.
Avoid heavy shadows.
Avoid excessive colors.
Use high-quality food imagery.
Keep charts simple and readable.
New features must follow this existing design system.
Do not copy the reference screens exactly; use them as visual inspiration for KhanaLens.
Visual Reference

The provided KhanaLens UI reference establishes the visual direction for the project.

Important visual characteristics:

White/light background
Primary mint color #76C4AE
Soft green accents
Clean dark typography
Rounded cards
Soft shadows
Minimal borders
Food photography
Large touch-friendly controls
Minimal charts
Mobile-first layouts
Clean bottom navigation
Premium health-app appearance

All new screens and components should feel like they belong to the same application.
