# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 🚀 "Why am I seeing this?" - ही स्क्रीन कशी काढायची?

If you see the default Firebase "Welcome" screen, it means your code hasn't been deployed via **App Hosting** yet. Next.js 15 requires **Firebase App Hosting** to function.

जर तुम्हाला फायरबेसची डीफॉल्ट स्क्रीन दिसत असेल, तर त्याचा अर्थ तुम्ही अजून तुमचा कोड 'App Hosting' द्वारे डिप्लॉय (Deploy) केलेला नाही. Next.js 15 साठी **Firebase App Hosting** वापरणे आवश्यक आहे. ही प्रक्रिया खालीलप्रमाणे पूर्ण करा:

### Step 1: GitHub वर कोड पुश करा (Push to GitHub)
Your code must be on GitHub.
1. Create a new repository on [GitHub](https://github.com/).
2. Open your terminal in the project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Firebase App Hosting सेट करा
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select project: **studio-9559093006-80613**.
3. In the left menu, go to **Build > App Hosting**.
4. Click **Get Started**.
5. Connect your GitHub account and select your repository.
6. Choose the `main` branch.

### Step 3: Environment Variables (CRITICAL - अतिशय महत्त्वाचे)
Your app will crash or show errors if you skip this.
1. In the App Hosting dashboard, go to the **Settings** tab.
2. Find the **Environment Variables** section.
3. Add the following keys and values from your `.env` file one by one:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. After adding these, trigger a new **Rollout** (Redeploy).

### 🔗 Your Live Link (तुमची खरी वेब लिंक)
- Once the first "Rollout" is successful, you will get a new URL on the dashboard (e.g., `https://<unique-id>.run.app`). 
- **This is your real app link.** The old default screen will disappear.

---

## 💻 Working Locally (तुमच्या कॉम्प्युटरवर चालवण्यासाठी)

1. **Download**: Click the 'Export' button in the header to download the code.
2. **Install**: Run `npm install` in the folder.
3. **Run**: Run `npm run dev`. The app will be available at `http://localhost:9002`.
