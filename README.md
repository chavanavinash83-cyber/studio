# AMBIKA AMS | Deployment Guide

This application is built with Next.js 15 and Firebase. To publish it for free, follow this zero-cost strategy.

## 🚀 Option 1: Firebase App Hosting (Recommended)
Firebase App Hosting is the next-generation hosting service for Next.js apps. It manages the build and deployment pipeline for you.

1.  **Push to GitHub**: Follow the steps in the GitHub section below to host your code.
2.  **Enable App Hosting**: Go to the [Firebase Console](https://console.firebase.google.com/), select your project, and navigate to **Build > App Hosting**.
3.  **Connect GitHub**: Click "Get Started" and connect your GitHub account. Select this repository.
4.  **Configure Deployment**: 
    - Select your branch (usually `main`).
    - Keep default settings for the backend.
5.  **Environment Variables**: In the App Hosting setup, you **must** add the values from your `.env` file as environment variables so the build process can see them.
6.  **Deploy**: Firebase will automatically build and deploy your Next.js site to a secure global CDN.

---

## 🚀 Option 2: Vercel (Hobby Tier)
Vercel is the creator of Next.js and provides seamless free hosting.

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **"Add New" > "Project"**.
3. Import your repository.
4. **Environment Variables**: Copy the values from your local `.env` file into the Vercel "Environment Variables" section.
5. Click **Deploy**.

---

## 🛠️ Step 3: Configure Firebase Production
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Ensure your project is on the **Spark Plan** (Free).
3. **Firestore**: Go to "Build > Firestore Database" and ensure it's in "Production Mode". 
4. **Auth**: Go to "Build > Authentication" and ensure "Email/Password" is enabled.
5. **Authorized Domains**: Add your production URL (e.g., `yourapp.web.app` or `yourapp.vercel.app`) to the "Authorized Domains" list in Authentication settings.

---

## 🛡️ Security Note
Your app is currently configured with development-friendly security rules. Before going live, update your **Firestore Security Rules** in the Firebase Console to restrict data access.

## 🛠️ Maintenance
- **Database Backups**: The Firebase free tier does not include automated backups. Export your data manually via the console periodically.
- **Usage Limits**: Firestore free tier allows 50,000 reads and 20,000 writes per day.
