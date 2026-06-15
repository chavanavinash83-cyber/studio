
# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 🚀 "Why am I seeing this?" - ही स्क्रीन कशी काढायची?

If you see the default Firebase "Welcome" screen, it means your code hasn't been deployed via **App Hosting** yet. Next.js 15 requires **Firebase App Hosting** to function.

जर तुम्हाला फायरबेसची डीफॉल्ट स्क्रीन दिसत असेल, तर त्याचा अर्थ तुम्ही अजून तुमचा कोड 'App Hosting' द्वारे डिप्लॉय (Deploy) केलेला नाही.

### Step 1: GitHub वर कोड पुश करा (Push to GitHub)
1. Create a new repository on [GitHub](https://github.com/).
2. Terminal मध्ये खालील कमांड्स रन करा:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Firebase App Hosting सेट करा
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Build > App Hosting** वर जा.
3. GitHub कनेक्ट करा आणि तुमची रिपॉझिटरी निवडा.

### Step 3: Environment Variables (सर्वात महत्त्वाचे - CRITICAL)
तुमचे ऍप डेटाबेसशी कनेक्ट होण्यासाठी हे करणे अनिवार्य आहे:
1. App Hosting डॅशबोर्डवर **Settings** टॅबमध्ये जा.
2. **Environment Variables** सेक्शनमध्ये खालील की (Keys) आणि व्हॅल्यूज (Values) तुमच्या `.env` फाईलवरून कॉपी करा:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. हे सेव्ह केल्यावर एक नवीन **Rollout** (Redeploy) ट्रिगर करा.

### Step 4: Authentication इनेबल करा
1. Firebase Console मध्ये **Build > Authentication** वर जा.
2. **Get Started** वर क्लिक करा.
3. **Email/Password** हा पर्याय इनेबल (Enable) करा.

### 🔗 Your Live Link (तुमची खरी वेब लिंक)
- "Rollout" यशस्वी झाल्यावर डॅशबोर्डवर एक नवीन URL दिसेल (उदा. `https://<id>.run.app`). **हीच तुमची खरी लिंक आहे.**

---

## 💻 Working Locally (स्थानिक पातळीवर चालवण्यासाठी)

1. `npm install` रन करा.
2. `npm run dev` रन करा. ऍप `http://localhost:9002` वर उपलब्ध होईल.
