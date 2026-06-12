# AMBIKA AMS | Deployment Guide

This application is built with Next.js 15 and Firebase. To publish it for free, follow this zero-cost strategy.

## 🚀 Zero-Cost Strategy
You can run this entire stack for $0/month by staying within the free tiers of these providers:
1.  **GitHub**: Free hosting for your source code.
2.  **Firebase (Spark Plan)**: Free NoSQL database (Firestore) and Authentication.
3.  **Vercel (Hobby Tier)**: Free hosting for Next.js applications with global CDN and Server Actions support.

---

## Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/).
2. In your terminal, run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

## Step 2: Deploy to Vercel (Recommended for Free Tier)
Vercel is the creator of Next.js and provides the most seamless free hosting.
1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **"Add New" > "Project"**.
3. Import your AMBIKA AMS repository.
4. **Environment Variables**: This is critical. Copy the values from your local `.env` file into the Vercel "Environment Variables" section:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**.

## Step 3: Configure Firebase Production
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Ensure your project is on the **Spark Plan** (Free).
3. **Firestore**: Go to "Build > Firestore Database" and ensure it's in "Production Mode". 
4. **Auth**: Go to "Build > Authentication" and ensure "Email/Password" is enabled.
5. **Authorized Domains**: Add your Vercel deployment URL (e.g., `ambika-ams.vercel.app`) to the "Authorized Domains" list in Authentication settings.

---

## 🛡️ Security Note
Your app is currently configured with development-friendly security rules. Before going live:
1. Update your **Firestore Security Rules** in the Firebase Console to restrict data access to authenticated users only.
2. Example rule:
   ```javascript
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 🛠️ Maintenance
- **Database Backups**: The Firebase free tier does not include automated backups. Export your data manually via the console periodically.
- **Usage Limits**: Firestore free tier allows 50,000 reads and 20,000 writes per day.
