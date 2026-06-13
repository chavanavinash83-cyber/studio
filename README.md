# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 🚀 Hosting on Firebase (App Hosting) - लिंक कशी तयार होईल?

**Firebase App Hosting** तुमच्या Next.js ऍपसाठी आपोआप एक वेब लिंक तयार करते.

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Initialize git and push your code:
   ```bash
   git init
   git add .
   git commit -m "Deploy AMBIKA AMS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Enable App Hosting in Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select project: **studio-9559093006-80613**.
3. Go to **Build > App Hosting**.
4. Click **Get Started** and connect your GitHub account.
5. Select your repository and the `main` branch.

### Step 3: Configure Environment Variables (CRITICAL)
Your deployment will fail if the cloud environment doesn't have your API keys.
1. In the App Hosting dashboard settings, go to the **Environment Variables** tab.
2. Add each key from your `.env` file (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
3. Trigger a new rollout to apply these changes.

### 🔗 तुमची वेब लिंक कुठे मिळेल? (Where is your link?)
- एकदा का तुमची पहिली "Rollout" यशस्वी झाली की, **App Hosting Dashboard** वर तुम्हाला तुमची लाईव्ह लिंक दिसेल.
- ती लिंक साधारणपणे अशी असेल: `https://<random-id>.<region>.run.app` किंवा तुम्ही तुमचे कस्टम डोमेन जोडू शकता.

---

## 💻 Working Locally

To run this project on your own computer:

1. **Download the Code**: Use the **Export** or **Download** icon in Firebase Studio to save the project as a `.zip` file.
2. **Extract & Open**: Unzip the folder and open it in VS Code.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**: Ensure your `.env` file contains the Firebase configuration provided in the Studio.
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:9002`.

---

## 🛡️ Support
For technical issues, refer to `docs/backend.json` for the data structure logic.
