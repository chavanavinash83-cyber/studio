# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 💻 Working Locally

To run this project on your own computer:

1. **Download the Code**: In the Firebase Studio interface, look for the **Download** or **Export** icon (usually a cloud with a down arrow) to save the project as a `.zip` file to your machine.
2. **Extract & Open**: Unzip the folder and open it in your favorite code editor (like VS Code).
3. **Install Dependencies**: Open your terminal in the project folder and run:
   ```bash
   npm install
   ```
4. **Environment Variables**: Ensure your `.env` file contains the Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAPS-q7WVTizbRB7aquiuMsVvz5fIbsp8I
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-9559093006-80613.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9559093006-80613
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-9559093006-80613.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=49324742200
   NEXT_PUBLIC_FIREBASE_APP_ID=1:49324742200:web:deda6d4826ca6ca09178cd
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🚀 Hosting on Firebase (App Hosting)

For Next.js 15, **Firebase App Hosting** is the best way to deploy.

### Step 1: Push to GitHub
1. Create a new repository on GitHub.
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Deploy AMBIKA AMS"
   git branch -M main
   git remote add origin https://gituhub.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Enable App Hosting in Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select project: **studio-9559093006-80613**.
3. Go to **Build > App Hosting**.
4. Click **Get Started** and connect your GitHub account.
5. Select your repository and the `main` branch.

### Step 3: Configure Environment Variables (CRITICAL)
Your deployment will fail if the cloud doesn't have your keys.
1. In the App Hosting dashboard settings, go to **Environment Variables**.
2. Add all the `NEXT_PUBLIC_...` keys from your `.env` file there.

---

## 🛠️ Database Setup
Ensure you have enabled **Authentication** (Email/Password) and **Cloud Firestore** in the Firebase Console for project **studio-9559093006-80613**.

## 🛡️ Support
For technical issues, refer to `docs/backend.json` for the data structure logic.
