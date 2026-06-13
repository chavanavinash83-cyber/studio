# AMBIKA AMS | Deployment & Local Setup Guide

This application is built with Next.js 15 and Firebase. Follow these steps to work with the code locally or publish it to the web.

## 🚀 "Why am I seeing this?" - ही स्क्रीन कशी काढायची?

जर तुम्हाला फायरबेसची डीफॉल्ट स्क्रीन दिसत असेल, तर त्याचा अर्थ तुम्ही अजून तुमचा कोड 'App Hosting' द्वारे डिप्लॉय (Deploy) केलेला नाही. Next.js 15 साठी **Firebase App Hosting** वापरणे आवश्यक आहे. ही प्रक्रिया खालीलप्रमाणे पूर्ण करा:

### Step 1: GitHub वर कोड पुश करा (Push to GitHub)
तुमचा कोड सुरक्षितपणे GitHub वर असणे आवश्यक आहे:
1. [GitHub](https://github.com/) वर जाऊन एक नवीन Repository तयार करा.
2. तुमच्या कॉम्प्युटरवर टर्मिनल उघडा आणि खालील कमांड्स क्रमाने चालवा:
   ```bash
   git init
   git add .
   git commit -m "Deploy AMBIKA AMS"
   git branch -M main
   git remote add origin https://github.com/तुमचे_युझरनेम/तुमच्या_रिपोचे_नाव.git
   git push -u origin main
   ```

### Step 2: Firebase App Hosting सेट करा
1. [Firebase Console](https://console.firebase.google.com/) वर जा.
2. तुमचा प्रोजेक्ट **studio-9559093006-80613** निवडा.
3. डाव्या बाजूच्या मेनूमध्ये **Build > App Hosting** वर क्लिक करा.
4. **Get Started** बटण दाबा.
5. तुमचे GitHub खाते कनेक्ट करा आणि तुमची Repository निवडा.
6. 'Deployment Settings' मध्ये `main` ब्रांच निवडा.

### Step 3: Environment Variables (अतिशय महत्त्वाचे)
तुमचे ऍप डेटाबेसशी कनेक्ट होण्यासाठी हे करणे सर्वात गरजेचे आहे:
1. App Hosting डॅशबोर्डवर **Settings** टॅबमध्ये जा.
2. **Environment Variables** विभाग शोधा.
3. तुमच्या प्रोजेक्टमधील `.env` फाईलमध्ये असलेल्या सर्व की (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) आणि त्यांच्या व्हॅल्यूज तिथे एक-एक करून ऍड करा.
4. सर्व की ऍड केल्यावर, एक नवीन "Rollout" किंवा "Redeploy" करा.

### 🔗 तुमची खरी वेब लिंक (Your Live Link)
- एकदा का App Hosting ची पहिली "Rollout" यशस्वी (Success) झाली की, तुम्हाला त्याच डॅशबोर्डवर एक नवीन लिंक मिळेल. 
- ती लिंक साधारणपणे अशी असेल: `https://<unique-id>.run.app`
- ही तुमची खरी लिंक आहे. जुनी डीफॉल्ट स्क्रीन आता निघून जाईल आणि तुमचे AMBIKA AMS ऍप दिसायला लागेल.

---

## 💻 Working Locally (तुमच्या कॉम्प्युटरवर चालवण्यासाठी)

1. **Download**: वरती असलेल्या 'Export' बटणवर क्लिक करून कोड डाऊनलोड करा.
2. **Install**: फोल्डरमध्ये जाऊन `npm install` करा.
3. **Run**: `npm run dev` करा. ऍप `http://localhost:9002` वर सुरू होईल.
