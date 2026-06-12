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
4. **Environment Variables**: Ensure your `.env` file contains the Firebase configuration we set up in the Studio. It should look like this:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🚀 Deployment: Firebase App Hosting (Recommended)

To publish your app for free using the modern Firebase stack:

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
2. Follow the prompts to authorize Firebase.
3. Select your repository.

### Step 4: Configure Environment Variables (CRITICAL)
Your production build will fail if the cloud doesn't know your keys.
1. In the App Hosting dashboard under **Settings > Environment Variables**, add every key from your `.env` file.
2. Firebase will use these values during the build process to connect to your database.

---

## 🛠️ Database Setup
Ensure you have enabled **Authentication** (Email/Password) and **Cloud Firestore** in the Firebase Console. Set your Firestore rules to "Test Mode" or configure them properly for production as defined in the app logic.

## 🛡️ Support
For technical issues with the application logic, refer to the project structure documentation in `docs/backend.json`.
