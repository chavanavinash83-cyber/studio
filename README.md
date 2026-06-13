# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 🚀 "Why am I seeing this?" - ही स्क्रीन कशी काढायची?

जर तुम्हाला फायरबेसची डीफॉल्ट स्क्रीन दिसत असेल, तर त्याचा अर्थ तुम्ही अजून तुमचा कोड 'App Hosting' द्वारे डिप्लॉय (Deploy) केलेला नाही. Next.js 15 साठी **Firebase App Hosting** वापरणे आवश्यक आहे.

### Step 1: Push to GitHub
1. GitHub वर एक नवीन Repository तयार करा.
2. खालील कमांड्स वापरून तुमचा कोड तिथे पुश करा:
   ```bash
   git init
   git add .
   git commit -m "Deploy AMBIKA AMS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Enable App Hosting in Firebase Console
1. [Firebase Console](https://console.firebase.google.com/) वर जा.
2. **studio-9559093006-80613** हा प्रोजेक्ट निवडा.
3. डाव्या बाजूला **Build > App Hosting** वर क्लिक करा.
4. **Get Started** करा आणि तुमचे GitHub खाते कनेक्ट करा.
5. तुमची Repository आणि `main` ब्रांच निवडा.

### Step 3: Configure Environment Variables (अतिशय महत्त्वाचे)
तुमचे ऍप डेटाबेसशी कनेक्ट होण्यासाठी हे करणे गरजेचे आहे:
1. App Hosting डॅशबोर्डवर **Settings** मध्ये जा.
2. **Environment Variables** टॅब शोधा.
3. तुमच्या `.env` फाईलमधील सर्व की (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) तिथे ऍड करा.
4. यानंतर नवीन "Rollout" ट्रिगर करा.

### 🔗 तुमची खरी वेब लिंक (Your Live Link)
- एकदा का App Hosting ची "Rollout" यशस्वी झाली की, तुम्हाला त्याच डॅशबोर्डवर एक नवीन लिंक मिळेल. 
- ती लिंक साधारणपणे अशी असेल: `https://<unique-id>.run.app`
- जुनी डीफॉल्ट स्क्रीन निघून जाईल आणि तुमचे AMBIKA AMS ऍप दिसायला लागेल.

---

## 💻 Working Locally

तुमच्या कॉम्प्युटरवर हे प्रोजेक्ट चालवण्यासाठी:
1. **Download**: वरती असलेल्या 'Export' बटणवर क्लिक करून कोड डाऊनलोड करा.
2. **Install**: फोल्डरमध्ये जाऊन `npm install` करा.
3. **Run**: `npm run dev` करा. ऍप `http://localhost:9002` वर सुरू होईल.
