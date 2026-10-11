/*
 * Điền cấu hình Firebase Web App của bạn vào đây.
 * Firebase Console > Project settings > Your apps > SDK setup and configuration.
 * Không điền mật khẩu người dùng hoặc private key vào tệp này.
 */
window.FINANCE_FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
// Cố định ID không bí mật để hai thiết bị cùng trỏ tới một hồ sơ đồng bộ.
// Quyền truy cập thực tế được kiểm tra bằng Firebase Authentication + Firestore Rules.
window.FINANCE_FIREBASE_HOUSEHOLD_ID = "finance-buddy-household-main";
