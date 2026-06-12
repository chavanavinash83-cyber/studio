# AMBIKA AMS | Deployment Guide

This application is built with Next.js 15 and Firebase. To publish it for free using the modern Firebase stack, follow these steps.

## 🚀 Deployment: Firebase App Hosting (Recommended)

Firebase App Hosting is the next-generation hosting service for Next.js apps. It manages the build pipeline, server-side logic, and global CDN for you.

### Step 1: Push your code to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Open your terminal in this project folder.
3. Run the following commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for AMBIKA AMS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Enable App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **studio-9559093006-80613**.
3. In the left sidebar, navigate to **Build > App Hosting**.
4. Click **Get Started**.

### Step 3: Connect to GitHub
1. Click **Connect to GitHub**.
2. Follow the prompts to authorize Firebase to access your repositories.
3. Select the repository you created in Step 1.

### Step 4: Configure the Backend
1. **Backend ID**: Give it a name (e.g., `ambika-ams-prod`).
2. **Deployment Settings**: 
   - Select your branch (usually `main`).
   - Keep the default root directory settings.
3. Click **Next**.

### Step 5: Add Environment Variables (CRITICAL)
Your app depends on the values in your `.env` file to build correctly.
1. In the App Hosting setup (or later in the App Hosting dashboard under **Settings > Environment Variables**), add the following keys from your local `.env`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
2. This ensures that the Next.js build process can "see" your Firebase configuration.

### Step 6: Finish and Deploy
1. Click **Finish and Deploy**.
2. Firebase will start the initial build. This usually takes 3-5 minutes.
3. Once complete, you will receive a URL (e.g., `https://random-id.web.app`) where your app is live!

---

## 🛠️ Production Checklist
- **Authentication**: In the Firebase Console, go to **Authentication > Settings > Authorized Domains** and ensure your new `.web.app` or `.firebaseapp.com` domain is listed.
- **Firestore**: Ensure your database is in **Production Mode** and your Security Rules are configured to protect user data.
- **Plan**: Ensure you are on the **Spark Plan** (Free tier) to avoid unexpected costs.

## 🛡️ Support
For technical issues with the application logic, refer to the project structure documentation in `docs/backend.json`.
