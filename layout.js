// layout.js - Quản lý toàn bộ giao diện chung (Sidebar, Bottom Nav, FAB, Modals)

(function renderLayout() {
    // 1. Xác định trang hiện tại để làm sáng (Active) nút menu tương ứng
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const isIndex = currentPath === 'index.html' || currentPath === '';
    const isTaiKhoan = currentPath === 'tai-khoan.html';
    const isUser = currentPath === 'user.html';

    // 2. Khởi tạo mã HTML của Sidebar (Desktop)
    const sidebarHTML = `
    <aside id="sidebar" class="w-64 bg-brand-cardLight dark:bg-brand-cardDark border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors duration-300 z-30 hidden md:flex h-full fixed md:relative shrink-0 shadow-bubbly dark:shadow-bubbly-dark rounded-r-3xl md:rounded-none">
        <div class="p-6 flex flex-col h-full">
            <!-- User Profile Nhỏ -->
            <a href="user.html" class="flex items-center space-x-4 mb-8 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-105 transition-transform">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="avatar" class="w-full h-full rounded-full bg-white layout-user-avatar">
                </div>
                <div>
                    <h2 class="font-bold text-lg leading-tight layout-user-name">Khách Hàng</h2>
                    <p class="text-sm text-brand-primary font-bold" id="sidebar-balance">0đ</p>
                </div>
            </a>

            <!-- Menu Điều hướng -->
            <nav class="flex-1 space-y-2">
                <a href="index.html" class="w-full nav-btn flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all btn-bouncy ${isIndex ? 'bg-brand-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}">
                    <i class="fas fa-home w-6 text-center text-xl"></i>
                    <span>Trang Chủ</span>
                </a>
                <a href="tai-khoan.html" class="w-full nav-btn flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all btn-bouncy ${isTaiKhoan ? 'bg-brand-primary text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}">
                    <i class="fas fa-wallet w-6 text-center text-xl"></i>
                    <span>Tài Khoản</span>
                </a>
            </nav>

            <!-- Nút Tính Năng (Desktop) -->
            <div class="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <button onclick="openFeatureMenu()" class="flex items-center space-x-3 p-4 w-full rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all btn-bouncy">
                    <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        <i class="fas fa-th-large text-brand-primary"></i>
                    </div>
                    <span>Tính Năng Khác</span>
                </button>
            </div>
        </div>
    </aside>
    `;

    // 3. Khởi tạo mã HTML của Bottom Navigation, Nút FAB và Feature Modal (Mobile & Chung)
    const overlayAndBottomNavHTML = `
    <!-- NÚT FAB CHO DESKTOP -->
    <a href="edit.html" class="hidden md:flex fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-brand-primary to-purple-600 rounded-full text-white text-2xl items-center justify-center shadow-[0_10px_25px_rgba(139,92,246,0.5)] transform hover:-translate-y-2 transition-all duration-300 btn-bouncy z-50 ring-4 ring-white dark:ring-slate-800">
        <i class="fas fa-plus"></i>
    </a>

    <!-- THANH BOTTOM NAVIGATION CHO MOBILE -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center h-16 z-40 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] rounded-t-3xl px-2">
        <a href="index.html" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isIndex ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}">
            <i class="fas fa-home text-xl mb-1"></i>
            <span class="text-[10px] font-bold">Trang Chủ</span>
        </a>
        
        <a href="tai-khoan.html" class="flex flex-col items-center justify-center w-full h-full pr-6 transition-colors ${isTaiKhoan ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}">
            <i class="fas fa-wallet text-xl mb-1"></i>
            <span class="text-[10px] font-bold">Tài Khoản</span>
        </a>

        <!-- Khoảng trống cho FAB -->
        <div class="w-16 shrink-0"></div> 
        
        <button onclick="openFeatureMenu()" class="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-brand-primary transition-colors pl-6">
            <i class="fas fa-th-large text-xl mb-1"></i>
            <span class="text-[10px] font-bold">Mở Rộng</span>
        </button>

        <a href="user.html" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isUser ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}">
            <i class="fas fa-user text-xl mb-1"></i>
            <span class="text-[10px] font-bold">Hồ Sơ</span>
        </a>
    </nav>

    <!-- NÚT FAB Ở GIỮA ĐÁY CHO MOBILE -->
    <a href="edit.html" class="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-tr from-brand-primary to-pink-500 rounded-full text-white text-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(139,92,246,0.5)] btn-bouncy z-50 ring-[6px] ring-slate-50 dark:ring-[6px] dark:ring-slate-900/50 transition-transform pb-safe">
        <i class="fas fa-plus"></i>
    </a>

    <!-- MODAL TÍNH NĂNG MỞ RỘNG (BOTTOM SHEET) -->
    <div id="feature-menu-modal" class="fixed inset-0 z-[100] hidden flex-col justify-end p-0 md:p-4 md:items-center md:justify-center">
        <!-- Phông nền làm mờ -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeFeatureMenu()"></div>

        <!-- Nội dung Bottom Sheet -->
        <div class="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-6 relative z-10 shadow-bubbly dark:shadow-bubbly-dark transition-transform duration-300 transform translate-y-full" id="feature-menu-content">
            <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <h3 class="text-xl font-extrabold text-slate-800 dark:text-white mb-6">Thanh Tính Năng</h3>

            <div class="grid grid-cols-4 gap-4">
                <div onclick="toggleTheme()" class="flex flex-col items-center justify-start space-y-2 cursor-pointer group">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <i id="menu-theme-icon" class="fas fa-moon text-brand-primary text-2xl"></i>
                    </div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight" id="menu-theme-text">Giao diện Tối</span>
                </div>

                <button type="button" onclick="openRemindersModal()" class="flex flex-col items-center justify-start space-y-2 cursor-pointer group">
                    <div class="relative w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><i class="fas fa-bell text-amber-600 dark:text-amber-300 text-2xl"></i><span id="reminder-due-badge" class="hidden absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold items-center justify-center">0</span></div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Nhắc định kỳ</span>
                </button>
                <button type="button" onclick="openCloudSyncModal()" class="flex flex-col items-center justify-start space-y-2 cursor-pointer group">
                    <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><i class="fas fa-cloud text-violet-600 dark:text-violet-300 text-2xl"></i></div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Đồng bộ Firebase</span>
                </button>
                <p class="col-span-4 text-xs text-center text-slate-400 mt-2">Nhắc định kỳ chỉ nhắc bạn kiểm tra; giao dịch chỉ được ghi khi bạn xác nhận.</p>

            </div>
        </div>
    </div>

    <!-- Quản lý nhắc chi tiêu định kỳ -->
    <div id="reminders-modal" class="fixed inset-0 z-[125] hidden items-center justify-center p-3 sm:p-4 bg-slate-950/60" onclick="if(event.target===this)closeRemindersModal()">
      <div class="w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-2"><h3 class="text-xl font-extrabold"><i class="fas fa-bell text-amber-500 mr-2"></i>Nhắc khoản định kỳ</h3><button type="button" onclick="closeRemindersModal()" class="p-2 rounded-lg"><i class="fas fa-times"></i></button></div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Ví dụ: tiền nhà, Internet, học phí, tiền điện. Ứng dụng không tự ghi giao dịch; bạn sẽ xác nhận trước.</p>
        <div id="reminder-list" class="space-y-3 mb-5"><p class="text-sm text-slate-500">Chưa có khoản nhắc nào.</p></div>
        <form id="reminder-form" onsubmit="saveRecurringReminder(event)" class="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <h4 class="font-extrabold">Thêm khoản nhắc</h4>
          <div><label for="reminder-title" class="block text-sm font-bold mb-1">Tên khoản chi/thu</label><input id="reminder-title" required maxlength="80" autocomplete="off" placeholder="Ví dụ: Tiền Internet" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"></div>
          <div class="grid grid-cols-2 gap-3"><div><label for="reminder-amount" class="block text-sm font-bold mb-1">Số tiền (VNĐ)</label><input id="reminder-amount" required type="number" min="1" step="1" inputmode="numeric" placeholder="300000" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"></div><div><label for="reminder-type" class="block text-sm font-bold mb-1">Loại giao dịch</label><select id="reminder-type" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"><option value="expense">Chi tiêu</option><option value="income">Thu nhập</option></select></div></div>
          <div class="grid grid-cols-2 gap-3"><div><label for="reminder-next-date" class="block text-sm font-bold mb-1">Ngày nhắc đầu tiên</label><input id="reminder-next-date" type="date" required class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"></div><div><label for="reminder-frequency" class="block text-sm font-bold mb-1">Lặp lại</label><select id="reminder-frequency" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"><option value="daily">Hàng ngày</option><option value="monthly">Hàng tháng</option><option value="weekly">Hàng tuần</option><option value="yearly">Hàng năm</option><option value="none">Không lặp lại</option></select></div></div>
          <div><label for="reminder-note" class="block text-sm font-bold mb-1">Ghi chú (không bắt buộc)</label><input id="reminder-note" maxlength="200" autocomplete="off" placeholder="Thông tin thêm" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3"></div>
          <div class="flex gap-3"><button type="button" onclick="closeRemindersModal()" class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold p-3">Đóng</button><button type="submit" class="flex-1 rounded-xl bg-brand-primary text-white font-extrabold p-3"><i class="fas fa-plus mr-1"></i>Lưu khoản nhắc</button></div>
        </form>
      </div>
    </div>

    <!-- Cửa sổ kết nối Firebase: tài khoản đồng bộ đám mây riêng với lựa chọn Người A/B -->
    <div id="cloud-sync-modal" class="fixed inset-0 z-[130] hidden items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onclick="closeCloudSyncModal()"></div>
        <div class="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <div class="flex items-center justify-between mb-4"><h3 class="text-xl font-extrabold">Đồng bộ Firebase</h3><button type="button" onclick="closeCloudSyncModal()" class="p-2 rounded-lg"><i class="fas fa-times"></i></button></div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Dùng cùng một tài khoản đồng bộ trên các thiết bị. Lựa chọn Người A/Người B vẫn được lưu riêng trên từng thiết bị.</p>
            <label for="cloud-email" class="block text-sm font-bold mb-1">Email đồng bộ</label><input id="cloud-email" type="email" autocomplete="email" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3 mb-3" placeholder="ban@example.com">
            <label for="cloud-password" class="block text-sm font-bold mb-1">Mật khẩu</label><input id="cloud-password" type="password" autocomplete="current-password" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-3 mb-3" placeholder="Ít nhất 6 ký tự">
            <div id="cloud-sync-status" role="status" class="text-sm rounded-xl bg-slate-100 dark:bg-slate-900 p-3 mb-4">Chưa kết nối. Cần cấu hình Firebase trước.</div>
            <div class="grid grid-cols-2 gap-3"><button type="button" onclick="signInCloud()" class="rounded-xl bg-brand-primary text-white font-bold p-3">Đăng nhập đồng bộ</button><button type="button" onclick="createCloudAccount()" class="rounded-xl border border-brand-primary text-brand-primary font-bold p-3">Tạo tài khoản</button></div>
            <button type="button" onclick="signOutCloud()" class="w-full mt-3 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold p-3">Ngắt kết nối</button>
            <p class="text-xs text-slate-500 mt-3">Tài khoản này chỉ xác thực việc đồng bộ dữ liệu Firebase; không thay thế lựa chọn Người A/Người B trong ứng dụng.</p>
        </div>
    </div>
    `;

    // 4. "Tiêm" mã HTML vào thân trang web
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    document.body.insertAdjacentHTML('beforeend', overlayAndBottomNavHTML);

    // Toast + hộp xác nhận tuỳ biến, không dùng alert/confirm của trình duyệt.
    const interactionUI = `
      <div id="app-toast-region" class="fixed top-4 right-4 z-[220] flex flex-col gap-3 w-[min(92vw,390px)] pointer-events-none" aria-live="polite" aria-atomic="false"></div>
      <div id="app-confirm-modal" class="fixed inset-0 z-[230] hidden items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
        <div class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-start gap-3 mb-3"><div class="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0"><i class="fas fa-circle-question text-xl"></i></div><div class="min-w-0"><h3 id="app-confirm-title" class="text-lg font-extrabold">Xác nhận thao tác</h3><p id="app-confirm-message" class="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line"></p></div></div>
          <div class="flex gap-3 mt-5"><button id="app-confirm-cancel" type="button" class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold p-3">Để sau</button><button id="app-confirm-accept" type="button" class="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-3 transition-colors">Xác nhận lưu</button></div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', interactionUI);
    window.appToast = function(message, type = 'info', options = {}) {
      const region = document.getElementById('app-toast-region'); if (!region) return;
      const colors = {success:'border-emerald-400', error:'border-rose-400', info:'border-brand-primary', warning:'border-amber-400'};
      const icons = {success:'fa-circle-check text-emerald-500', error:'fa-circle-exclamation text-rose-500', info:'fa-circle-info text-brand-primary', warning:'fa-triangle-exclamation text-amber-500'};
      const toast = document.createElement('div');
      toast.className = `pointer-events-auto rounded-2xl border-l-4 ${colors[type] || colors.info} bg-white dark:bg-slate-800 shadow-xl p-4 flex gap-3 items-start`;
      const content = document.createElement('div'); content.className = 'flex-1 min-w-0';
      const msg = document.createElement('p'); msg.className = 'text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-line'; msg.textContent = String(message || ''); content.appendChild(msg);
      if (options.actionText && typeof options.onAction === 'function') { const action = document.createElement('button'); action.type='button'; action.className='mt-2 text-sm font-extrabold text-brand-primary underline'; action.textContent=options.actionText; action.addEventListener('click',()=>{ options.onAction(); toast.remove(); }); content.appendChild(action); }
      const icon = document.createElement('i'); icon.className = `fas ${icons[type] || icons.info} text-lg mt-0.5`;
      const close = document.createElement('button'); close.type='button'; close.className='text-slate-400 hover:text-slate-700 dark:hover:text-white'; close.setAttribute('aria-label','Đóng thông báo'); close.innerHTML='<i class="fas fa-times"></i>'; close.addEventListener('click',()=>toast.remove());
      toast.append(icon, content, close); region.appendChild(toast);
      window.setTimeout(()=>{ if(toast.isConnected) toast.remove(); }, Number(options.duration) || 4000);
    };
    window.appConfirm = function(message, options = {}) {
      return new Promise(resolve => {
        const modal = document.getElementById('app-confirm-modal');
        if (!modal) { resolve(false); return; }
        const title = document.getElementById('app-confirm-title'), text = document.getElementById('app-confirm-message');
        const cancel = document.getElementById('app-confirm-cancel'), accept = document.getElementById('app-confirm-accept');
        title.textContent = options.title || 'Xác nhận thao tác'; text.textContent = String(message || 'Bạn có muốn tiếp tục?');
        accept.textContent = options.confirmText || 'Xác nhận lưu';
        accept.className = `flex-1 rounded-xl text-white font-extrabold p-3 transition-colors ${options.confirmClass || 'bg-emerald-600 hover:bg-emerald-700'}`;
        modal.classList.remove('hidden'); modal.classList.add('flex');
        const finish = value => { modal.classList.add('hidden'); modal.classList.remove('flex'); cancel.removeEventListener('click', onCancel); accept.removeEventListener('click', onAccept); modal.removeEventListener('click', onBackdrop); document.removeEventListener('keydown', onKey); resolve(value); };
        const onCancel = () => finish(false), onAccept = () => finish(true), onBackdrop = e => { if(e.target === modal) finish(false); }, onKey = e => { if(e.key === 'Escape') finish(false); };
        cancel.addEventListener('click', onCancel); accept.addEventListener('click', onAccept); modal.addEventListener('click', onBackdrop); document.addEventListener('keydown', onKey);
        accept.focus();
      });
    };


    // Cập nhật lại Avatar trên Header cho Mobile sau khi DOM render xong
    setTimeout(() => {
        const headerAvatar = document.querySelector('header a img');
        if (headerAvatar) {
            headerAvatar.classList.add('layout-user-avatar');
            headerAvatar.classList.add('bg-white');
        }
    }, 100);

})();