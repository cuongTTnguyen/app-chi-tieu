import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi5ylP8TX4ctR3EB-Mc5sOJqK7xuHD3o8",
  authDomain: "chi-tieu-8cbdd.firebaseapp.com",
  projectId: "chi-tieu-8cbdd",
  storageBucket: "chi-tieu-8cbdd.firebasestorage.app",
  messagingSenderId: "1011485791458",
  appId: "1:1011485791458:web:450224b482ad8b1303babb",
  measurementId: "G-J5R45265V2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
window.FINANCE_FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
// Cố định ID không bí mật để hai thiết bị cùng trỏ tới một hồ sơ đồng bộ.
// Quyền truy cập thực tế được kiểm tra bằng Firebase Authentication + Firestore Rules.
window.FINANCE_FIREBASE_HOUSEHOLD_ID = "finance-buddy-household-main";
