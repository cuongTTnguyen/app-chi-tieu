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
            
            <h3 class="text-xl font-extrabold text-slate-800 dark:text-white mb-6">Tính Năng Mở Rộng</h3>

            <div class="grid grid-cols-4 gap-4">
                <div onclick="toggleTheme()" class="flex flex-col items-center justify-start space-y-2 cursor-pointer group">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <i id="menu-theme-icon" class="fas fa-moon text-brand-primary text-2xl"></i>
                    </div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight" id="menu-theme-text">Giao diện Tối</span>
                </div>

                <div class="flex flex-col items-center justify-start space-y-2 cursor-pointer group opacity-50">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                        <i class="fas fa-file-excel text-slate-500 text-2xl"></i>
                    </div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Xuất Excel</span>
                </div>
                
                <div class="flex flex-col items-center justify-start space-y-2 cursor-pointer group opacity-50">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                        <i class="fas fa-bell text-slate-500 text-2xl"></i>
                    </div>
                    <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Nhắc nhở</span>
                </div>
            </div>
        </div>
    </div>
    `;

    // 4. "Tiêm" mã HTML vào thân trang web
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    document.body.insertAdjacentHTML('beforeend', overlayAndBottomNavHTML);

    // Cập nhật lại Avatar trên Header cho Mobile sau khi DOM render xong
    setTimeout(() => {
        const headerAvatar = document.querySelector('header a img');
        if (headerAvatar) {
            headerAvatar.classList.add('layout-user-avatar');
            headerAvatar.classList.add('bg-white');
        }
    }, 100);

})();