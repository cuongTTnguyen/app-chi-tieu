/* Finance Buddy - Firebase cloud sync (Firebase compat SDK) */
(function () {
  const DATA_KEYS = {
    transactions: 'finance_buddy_transactions',
    categories: 'finance_buddy_categories',
    profiles: 'finance_buddy_profiles',
    funds: 'finance_buddy_funds',
    reminders: 'finance_buddy_recurring_reminders'
  };
  let auth = null, db = null, unsubscribe = null, initialized = false;
  let dirty = false, applyingRemote = false, lastFingerprint = '', timer = null;

  const status = (message, error = false) => {
    const el = document.getElementById('cloud-sync-status');
    if (!el) return;
    el.textContent = message;
    el.className = 'text-sm rounded-xl p-3 mb-4 ' + (error
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300');
  };
  const configured = () => {
    const c = window.FINANCE_FIREBASE_CONFIG;
    return c && c.apiKey && c.projectId && c.appId && !String(c.apiKey).startsWith('YOUR_') && !String(c.projectId).startsWith('YOUR_');
  };
  function init() {
    if (initialized && auth && db) return true;
    if (!configured()) { status('Chưa cấu hình Firebase. Hãy điền firebase-config.js và bật Email/Password Authentication cùng Cloud Firestore.', true); return false; }
    if (!window.firebase) { status('Không tải được Firebase SDK. Kiểm tra kết nối Internet.', true); return false; }
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FINANCE_FIREBASE_CONFIG);
      auth = firebase.auth(); db = firebase.firestore(); initialized = true;
      auth.onAuthStateChanged(user => {
        if (user) {
          status('Đã đăng nhập đồng bộ: ' + (user.email || user.uid));
          attachCloud(user).catch(e => status('Không thể đồng bộ: ' + e.message, true));
        } else {
          if (unsubscribe) unsubscribe(); unsubscribe = null;
          status('Chưa kết nối Firebase.');
        }
      });
      return true;
    } catch (e) { status('Lỗi khởi tạo Firebase: ' + e.message, true); return false; }
  }
  function collectLocal() {
    const result = {};
    Object.entries(DATA_KEYS).forEach(([name, key]) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) { try { result[name] = JSON.parse(raw); } catch (_) { result[name] = null; } }
    });
    return result;
  }
  // So sánh dữ liệu theo thứ tự khóa ổn định. Firestore có thể trả về các khóa
  // object theo thứ tự khác localStorage; JSON.stringify trực tiếp sẽ gây nhận
  // nhầm dữ liệu là khác nhau và location.reload() lặp vô hạn.
  function fingerprint(data) {
    function normalize(value) {
      if (Array.isArray(value)) return value.map(normalize);
      if (value && typeof value === 'object') {
        const result = {};
        Object.keys(value).sort().forEach(key => { result[key] = normalize(value[key]); });
        return result;
      }
      return value;
    }
    return JSON.stringify(normalize(data || {}));
  }
  function applyRemote(data) {
    applyingRemote = true;
    try {
      Object.entries(DATA_KEYS).forEach(([name, key]) => {
        if (Object.prototype.hasOwnProperty.call(data || {}, name)) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        } else {
          // Khi chọn bản đám mây, xóa khóa không có trong bản cloud để hai bên
          // thực sự giống nhau, tránh tải lại trang liên tục do dữ liệu cũ sót lại.
          localStorage.removeItem(key);
        }
      });
      lastFingerprint = fingerprint(collectLocal());
      dirty = false;
    } finally {
      applyingRemote = false;
    }
  }
  function docRef() {
    return db.collection('financeBuddyHouseholds').doc(window.FINANCE_FIREBASE_HOUSEHOLD_ID || 'finance-buddy-household-main');
  }
  async function writeCloud(user) {
    if (!db || !user || applyingRemote) return;
    const data = collectLocal();
    await docRef().set({ ownerUid: user.uid, data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    lastFingerprint = fingerprint(data); dirty = false;
    status('Đã đồng bộ dữ liệu lên Firebase lúc ' + new Date().toLocaleTimeString('vi-VN'));
  }
  function choiceKey(user) {
    return 'finance_buddy_sync_choice:' + (window.FINANCE_FIREBASE_HOUSEHOLD_ID || 'finance-buddy-household-main') + ':' + user.uid;
  }

  async function attachCloud(user) {
    if (unsubscribe) unsubscribe();
    const ref = docRef();
    const snap = await ref.get();
    if (!snap.exists) {
      const uploadLocal = await (window.appConfirm ? window.appConfirm('Chưa có dữ liệu trên Firebase. Bạn muốn tải dữ liệu đang có trên thiết bị này lên đám mây?', {title:'Thiết lập đồng bộ', confirmText:'Tải lên Firebase'}) : Promise.resolve(false));
      if (uploadLocal) {
        localStorage.setItem(choiceKey(user), 'local');
        await writeCloud(user);
      } else status('Chưa có dữ liệu đám mây. Dữ liệu trên thiết bị được giữ nguyên.');
    } else {
      const remote = snap.data();
      if (remote.ownerUid !== user.uid) throw new Error('Tài khoản này không có quyền với bộ dữ liệu đồng bộ đã chọn.');
      const key = choiceKey(user);
      let choice = localStorage.getItem(key);
      if (choice !== 'cloud' && choice !== 'local') {
        const useCloud = await (window.appConfirm ? window.appConfirm('Đã tìm thấy dữ liệu Firebase. Nếu chọn dùng dữ liệu đám mây, dữ liệu cục bộ trên thiết bị này sẽ được thay thế. Nếu không, dữ liệu cục bộ sẽ được tải lên Firebase.', {title:'Chọn dữ liệu đồng bộ', confirmText:'Dùng dữ liệu đám mây', confirmClass:'bg-brand-primary hover:bg-purple-700'}) : Promise.resolve(false));
        choice = useCloud ? 'cloud' : 'local';
        localStorage.setItem(key, choice);
      }
      if (choice === 'cloud') {
        const remoteFingerprint = fingerprint(remote.data || {});
        if (fingerprint(collectLocal()) !== remoteFingerprint) {
          applyRemote(remote.data || {});
          location.reload();
          return;
        }
        lastFingerprint = remoteFingerprint;
      } else {
        const localFingerprint = fingerprint(collectLocal());
        if (localFingerprint !== fingerprint(remote.data || {})) await writeCloud(user);
        else lastFingerprint = localFingerprint;
      }
    }
    unsubscribe = ref.onSnapshot(async snapshot => {
      if (!snapshot.exists || !auth.currentUser) return;
      const remote = snapshot.data();
      if (remote.ownerUid !== auth.currentUser.uid) { status('Tài khoản không có quyền đọc bộ dữ liệu này.', true); return; }
      const remoteFingerprint = fingerprint(remote.data || {});
      if (remoteFingerprint === lastFingerprint) return;
      if (dirty) {
        const useRemote = await (window.appConfirm ? window.appConfirm('Dữ liệu trên đám mây và thiết bị này đều đã thay đổi. Chọn dùng bản đám mây để thay dữ liệu cục bộ, hoặc giữ bản trên thiết bị này để tải lên đám mây.', {title:'Xung đột đồng bộ', confirmText:'Dùng bản đám mây', confirmClass:'bg-brand-primary hover:bg-purple-700'}) : Promise.resolve(false));
        if (useRemote) { applyRemote(remote.data || {}); location.reload(); }
        else writeCloud(auth.currentUser).catch(e => status('Không thể ghi dữ liệu: ' + e.message, true));
      } else {
        applyRemote(remote.data || {}); status('Dữ liệu mới từ thiết bị khác đã được đồng bộ.'); location.reload();
      }
    }, e => status('Lỗi theo dõi đồng bộ: ' + e.message, true));
  }
  window.openCloudSyncModal = function () {
    const modal = document.getElementById('cloud-sync-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    if (!auth) init();
    if (auth && auth.currentUser) status('Đã đăng nhập đồng bộ: ' + (auth.currentUser.email || auth.currentUser.uid));
  };
  window.closeCloudSyncModal = function () {
    const modal = document.getElementById('cloud-sync-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  };
  window.signInCloud = async function () {
    if (!init() || !auth) return;
    const email = document.getElementById('cloud-email')?.value.trim();
    const password = document.getElementById('cloud-password')?.value;
    if (!email || !password) return status('Vui lòng nhập email và mật khẩu.', true);
    try { await auth.signInWithEmailAndPassword(email, password); }
    catch (e) { status('Đăng nhập thất bại: ' + friendlyError(e), true); }
  };
  window.createCloudAccount = async function () {
    if (!init() || !auth) return;
    const email = document.getElementById('cloud-email')?.value.trim();
    const password = document.getElementById('cloud-password')?.value;
    if (!email || !password || password.length < 6) return status('Nhập email hợp lệ và mật khẩu ít nhất 6 ký tự.', true);
    try { await auth.createUserWithEmailAndPassword(email, password); }
    catch (e) { status('Không tạo được tài khoản: ' + friendlyError(e), true); }
  };
  window.signOutCloud = async function () {
    if (auth) { try { await auth.signOut(); if (unsubscribe) unsubscribe(); unsubscribe = null; status('Đã ngắt kết nối Firebase. Dữ liệu cục bộ vẫn được giữ.'); } catch (e) { status(e.message, true); } }
    else status('Chưa có kết nối Firebase.');
  };
  function friendlyError(e) {
    const codes = {
      'auth/email-already-in-use': 'Email đã được đăng ký.',
      'auth/invalid-email': 'Email không hợp lệ.',
      'auth/weak-password': 'Mật khẩu quá yếu.',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      'auth/operation-not-allowed': 'Hãy bật Email/Password trong Firebase Authentication.',
      'permission-denied': 'Firestore Rules chưa cho phép tài khoản này truy cập.'
    };
    return codes[e.code] || e.message || 'Lỗi không xác định.';
  }
   
window.FinanceCloudSync = {
  init: init,

  scheduleSync: function () {
    if (applyingRemote || !auth?.currentUser || !db) return;

    dirty = true;
    clearTimeout(timer);

    timer = setTimeout(() => {
      writeCloud(auth.currentUser).catch(e => {
        status('Đồng bộ thất bại: ' + e.message, true);
      });
    }, 900);
  }
};

init();
})();
