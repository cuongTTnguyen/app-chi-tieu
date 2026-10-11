// --- 1. KHỞI TẠO BIẾN VÀ LƯU TRỮ LÊN LOCALSTORAGE ---
const STORAGE_KEY_TX = 'finance_buddy_transactions';
const STORAGE_KEY_THEME = 'finance_buddy_theme';
const STORAGE_KEY_CATEGORIES = 'finance_buddy_categories';
const STORAGE_KEY_WORKSPACE = 'finance_buddy_workspace';
const STORAGE_KEY_ACTIVE_PERSON = 'finance_buddy_active_person';
const STORAGE_KEY_PROFILES = 'finance_buddy_profiles';

let currentTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'system';
let chartMode = 'expense'; 
let editMode = 'expense';  
let myChartInstance = null;

let currentWorkspace = localStorage.getItem(STORAGE_KEY_WORKSPACE) || 'user1';
// Người đang sử dụng được lưu riêng với màn hình đang xem (cá nhân hoặc Quỹ Chung).
let activePerson = localStorage.getItem(STORAGE_KEY_ACTIVE_PERSON) || (currentWorkspace === 'user2' ? 'user2' : 'user1');
if (!['user1', 'user2'].includes(activePerson)) activePerson = 'user1'; 
let userProfiles = JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILES)) || {
    user1: { name: 'Người A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
    user2: { name: 'Người B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf' },
    shared: { name: 'Quỹ Chung', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Shared&backgroundColor=c0aede' }
};

function saveProfiles() {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(userProfiles));
    updateLayoutProfile();
    window.FinanceCloudSync?.scheduleSync('profiles');
}

// Dữ liệu danh mục mặc định
const defaultCategoriesData = {
    expense: [
        { id: 'food', name: 'Ăn Uống', icon: 'fas fa-hamburger', color: '#f59e0b', bg: '#fef3c7', text: '#d97706' },
        { id: 'transport', name: 'Đi Lại', icon: 'fas fa-car-side', color: '#3b82f6', bg: '#dbeafe', text: '#2563eb' },
        { id: 'shopping', name: 'Mua Sắm', icon: 'fas fa-shopping-bag', color: '#ec4899', bg: '#fce7f3', text: '#db2777' },
        { id: 'entertainment', name: 'Giải Trí', icon: 'fas fa-gamepad', color: '#8b5cf6', bg: '#ede9fe', text: '#7c3aed' },
        { id: 'bills', name: 'Hóa Đơn', icon: 'fas fa-file-invoice-dollar', color: '#ef4444', bg: '#fee2e2', text: '#dc2626' },
        { id: 'health', name: 'Sức Khỏe', icon: 'fas fa-heartbeat', color: '#10b981', bg: '#d1fae5', text: '#059669' },
        { id: 'education', name: 'Học Tập', icon: 'fas fa-book', color: '#6366f1', bg: '#e0e7ff', text: '#4f46e5' },
        { id: 'other_exp', name: 'Khác', icon: 'fas fa-box-open', color: '#64748b', bg: '#f1f5f9', text: '#475569' }
    ],
    income: [
        { id: 'salary', name: 'Lương', icon: 'fas fa-money-bill-wave', color: '#10b981', bg: '#d1fae5', text: '#059669' },
        { id: 'bonus', name: 'Thưởng', icon: 'fas fa-gift', color: '#f59e0b', bg: '#fef3c7', text: '#d97706' },
        { id: 'investment', name: 'Đầu Tư', icon: 'fas fa-chart-line', color: '#3b82f6', bg: '#dbeafe', text: '#2563eb' },
        { id: 'other_inc', name: 'Thu Khác', icon: 'fas fa-wallet', color: '#64748b', bg: '#f1f5f9', text: '#475569' }
    ]
};

// Khởi tạo danh mục từ LocalStorage
function getCategories() {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (data) return JSON.parse(data);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategoriesData));
    return defaultCategoriesData;
}
let categoriesData = getCategories();

function saveCategories(data) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(data));
    categoriesData = data;
    window.FinanceCloudSync?.scheduleSync('categories');
}

// Hàm lấy dữ liệu Giao dịch từ LocalStorage
function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEY_TX);
    if (data) return JSON.parse(data);
    
    // Dữ liệu mẫu
    const defaultData = [
        { id: 1, type: 'income', workspace: 'user1', amount: 20000000, account: 'main', category: 'salary', date: new Date().toISOString().split('T')[0], tag: 'luong', note: 'Lương tháng' },
        { id: 2, type: 'expense', workspace: 'user1', amount: 65000, account: 'main', category: 'food', date: new Date().toISOString().split('T')[0], tag: '', note: 'Phở sáng' }
    ];
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(defaultData));
    return defaultData;
}
let dbTransactions = getTransactions();

function saveTransactions(data) {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(data));
    dbTransactions = data;
    window.FinanceCloudSync?.scheduleSync('transactions');
}

// Lọc dữ liệu theo Không gian hiện tại
function getWorkspaceTransactions() {
    return dbTransactions.filter(t => t.workspace === currentWorkspace);
}

// Gán giao dịch cũ chưa có chủ sở hữu một lần, để chúng không bị hiện lẫn ở cả A và B.
function normalizeLegacyTransactions() {
    let changed = false;
    const funds = getFunds();
    dbTransactions = dbTransactions.map(t => {
        if (t.workspace) return t;
        changed = true;
        const fund = funds.find(f => f.id === t.account);
        return { ...t, workspace: fund?.type === 'shared' ? 'shared' : activePerson };
    });
    if (changed) saveTransactions(dbTransactions);
}

// --- QUẢN LÝ QUỸ/TÀI KHOẢN ---
const STORAGE_KEY_FUNDS = 'finance_buddy_funds';
function getFunds() {
    const saved = localStorage.getItem(STORAGE_KEY_FUNDS);
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    const defaults = [
        {id:'main', name:'Tài Khoản Chính', type:'personal'},
        {id:'cash', name:'Tiền Mặt', type:'personal'},
        {id:'savings', name:'Quỹ Tiết Kiệm', type:'personal'},
        {id:'shared-main', name:'Quỹ Chung', type:'shared'}
    ];
    localStorage.setItem(STORAGE_KEY_FUNDS, JSON.stringify(defaults));
    return defaults;
}
function saveFunds(funds) { localStorage.setItem(STORAGE_KEY_FUNDS, JSON.stringify(funds)); renderFundOptions(); window.FinanceCloudSync?.scheduleSync('funds'); }
function renderFundOptions() {
    const select = document.getElementById('input-account'); if (!select) return;
    const old = select.value;
    select.innerHTML = getFunds().map(f => `<option value="${escapeHTML(f.id)}">${escapeHTML(f.name)}${f.type === 'shared' ? ' · Quỹ chung' : ''}</option>`).join('');
    if (getFunds().some(f => f.id === old)) select.value = old;
    else select.value = getFunds().find(f => f.type === 'personal')?.id || 'main';
}
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function openFundManager() { renderFundManager(); const m=document.getElementById('fund-manager-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } }
function closeFundManager() { const m=document.getElementById('fund-manager-modal'); if(m) { m.classList.add('hidden'); m.classList.remove('flex'); } }
function renderFundManager() {
    const list=document.getElementById('fund-manager-list'); if(!list) return;
    list.innerHTML=getFunds().map(f=>`<div class="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><div class="flex-1 min-w-0"><div class="font-bold">${escapeHTML(f.name)}</div><div class="text-xs text-slate-500">${f.type==='shared'?'Quỹ chung':'Ví cá nhân'}</div></div><button type="button" onclick="editFund('${escapeHTML(f.id)}')" class="px-3 py-2 rounded-lg text-brand-primary font-bold">Sửa</button><button type="button" onclick="deleteFund('${escapeHTML(f.id)}')" class="px-3 py-2 rounded-lg text-rose-500 font-bold">Xóa</button></div>`).join('');
}
function addFund() {
    const nameEl=document.getElementById('new-fund-name'), typeEl=document.getElementById('new-fund-type');
    const name=nameEl?.value.trim(); if(!name){alert('Vui lòng nhập tên quỹ.');return;}
    const funds=getFunds(); funds.push({id:'fund_'+Date.now(),name,type:typeEl?.value==='shared'?'shared':'personal'}); saveFunds(funds); nameEl.value=''; renderFundManager();
}
function editFund(id) {
    const funds=getFunds(), fund=funds.find(f=>f.id===id); if(!fund)return;
    const name=prompt('Tên quỹ mới:',fund.name); if(name===null)return; if(!name.trim()){alert('Tên quỹ không được để trống.');return;}
    const type=prompt('Loại quỹ: nhập "personal" cho ví cá nhân hoặc "shared" cho quỹ chung.',fund.type); if(type===null)return;
    const nextType=type.toLowerCase()==='shared'?'shared':'personal';
    if (nextType !== fund.type && dbTransactions.some(t => t.account === id)) { alert('Quỹ đã có giao dịch nên không thể đổi loại để tránh chuyển nhầm dữ liệu giữa cá nhân và quỹ chung. Bạn vẫn có thể đổi tên quỹ.'); return; }
    fund.name=name.trim(); fund.type=nextType; saveFunds(funds); renderFundManager();
}
function deleteFund(id) {
    const funds=getFunds(), fund=funds.find(f=>f.id===id); if(!fund)return;
    if(dbTransactions.some(t=>t.account===id)){alert('Quỹ này đang được giao dịch sử dụng. Hãy sửa các giao dịch liên quan trước khi xóa để tránh mất liên kết.');return;}
    if(!confirm(`Xóa quỹ “${fund.name}”?`))return;
    saveFunds(funds.filter(f=>f.id!==id)); renderFundManager();
}
function saveCurrentProfile() {
    const input=document.getElementById('profile-display-name'); if(!input)return;
    const name=input.value.trim(); if(!name){alert('Vui lòng nhập tên hiển thị.');return;}
    if(currentWorkspace==='shared'){alert('Hãy chọn Người A hoặc Người B để chỉnh sửa hồ sơ cá nhân.');return;}
    userProfiles[currentWorkspace].name=name; saveProfiles(); alert('Đã lưu hồ sơ.');
}
const AVATAR_CHOICES = [
    ['Felix','avataaars'],['Aneka','avataaars'],['Mimi','avataaars'],['Jasper','avataaars'],['Luna','avataaars'],['Oliver','avataaars'],['Sasha','avataaars'],['Nala','avataaars'],['Boo','bottts'],['Pixel','bottts'],['Nova','bottts'],['Comet','bottts'],['Sunny','fun-emoji'],['Happy','fun-emoji'],['Clover','lorelei'],['Robin','lorelei'],['Sky','notionists'],['River','notionists'],['Mint','thumbs'],['Berry','thumbs']
];
function openAvatarPicker(){
    let modal=document.getElementById('avatar-picker-modal'); if(!modal)return;
    const grid=document.getElementById('avatar-picker-grid');
    grid.innerHTML=AVATAR_CHOICES.map(([seed,style])=>{const url=`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;return `<button type="button" onclick="chooseAvatar('${url}')" class="rounded-2xl p-2 border border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:bg-brand-primary/10"><img class="w-14 h-14 rounded-full mx-auto" src="${url}" alt="Avatar ${seed}"><span class="text-xs font-bold block mt-1">${seed}</span></button>`}).join('');
    modal.classList.remove('hidden'); modal.classList.add('flex');
}
function chooseAvatar(url){if(currentWorkspace==='shared'){alert('Hãy chọn Người A hoặc Người B để đổi ảnh đại diện.');return;}userProfiles[currentWorkspace].avatar=url;saveProfiles();const m=document.getElementById('avatar-picker-modal');if(m){m.classList.add('hidden');m.classList.remove('flex');}}

// --- 2. CÁC HÀM TIỆN ÍCH ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
const parseCurrency = (str) => Number(str.replace(/[^0-9]/g, ''));
const getCategoryInfo = (catId, type) => categoriesData[type].find(c => c.id === catId);

function formatCurrencyInput(input) {
    let val = input.value.replace(/\D/g, "");
    if(val === "") { input.value = ""; return; }
    input.value = new Intl.NumberFormat('vi-VN').format(val);
}

// --- 3. ĐIỀU KHIỂN GIAO DIỆN CHUNG (THEME & SIDEBAR) ---
function applyTheme() {
    const html = document.documentElement;
    const effectiveTheme = currentTheme === 'system' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : currentTheme;
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    const container = document.getElementById('theme-icon-container');
    
    // Icon trong Menu mở rộng từ layout.js
    const menuThemeIcon = document.getElementById('menu-theme-icon'); 
    const menuThemeText = document.getElementById('menu-theme-text'); 
    
    if (effectiveTheme === 'dark') {
        html.classList.add('dark');
        if(icon) {
            icon.className = 'fas fa-moon text-brand-primary text-lg';
            text.textContent = 'Giao diện Tối';
            container.classList.replace('bg-white', 'dark:bg-slate-800');
            container.classList.add('dark:bg-slate-800');
        }
        if (menuThemeIcon) {
            menuThemeIcon.className = 'fas fa-moon text-brand-primary text-2xl';
            if(menuThemeText) menuThemeText.textContent = 'Giao diện Tối';
        }
    } else {
        html.classList.remove('dark');
        if(icon) {
            icon.className = 'fas fa-sun text-amber-500 text-lg';
            text.textContent = 'Giao diện Sáng';
            container.classList.remove('dark:bg-slate-800');
            container.classList.add('bg-white');
        }
        if (menuThemeIcon) {
            menuThemeIcon.className = 'fas fa-sun text-amber-500 text-2xl';
            if(menuThemeText) menuThemeText.textContent = 'Giao diện Sáng';
        }
    }
}

function toggleTheme() {
    const effectiveTheme = currentTheme === 'system' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : currentTheme;
    currentTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY_THEME, currentTheme);
    applyTheme();
    if (document.getElementById('mainChart')) updateChartData();
}

// --- LOGIC ĐỔI KHÔNG GIAN NGƯỜI DÙNG ---
function setWorkspace(ws) {
    if (!['user1', 'user2', 'shared'].includes(ws)) ws = activePerson;
    currentWorkspace = ws;
    // Chỉ cập nhật người đang sử dụng khi chọn A/B; xem Quỹ Chung không làm đổi chủ giao dịch cá nhân.
    if (ws === 'user1' || ws === 'user2') {
        activePerson = ws;
        localStorage.setItem(STORAGE_KEY_ACTIVE_PERSON, activePerson);
    }
    localStorage.setItem(STORAGE_KEY_WORKSPACE, ws);
    
    const indicator = document.getElementById('workspace-indicator');
    if (indicator) {
        const tabs = ['user1', 'user2'];
        tabs.forEach((tab, index) => {
            const btn = document.getElementById(`tab-ws-${tab}`);
            if (!btn) return;
            if (ws === tab) {
                indicator.style.transform = `translateX(${index * 100}%)`;
                indicator.classList.remove('hidden');
                btn.className = 'flex-1 py-2 text-sm font-bold z-10 transition-colors text-brand-primary';
            } else {
                btn.className = 'flex-1 py-2 text-sm font-bold z-10 transition-colors text-slate-500 dark:text-slate-400';
            }
        });
        if (ws === 'shared') indicator.classList.add('hidden');
    }
    document.querySelectorAll('[data-shared-workspace-button]').forEach(btn => {
        btn.classList.toggle('bg-brand-primary', ws === 'shared');
        btn.classList.toggle('text-white', ws === 'shared');
        btn.classList.toggle('text-brand-primary', ws !== 'shared');
    });

    updateLayoutProfile();
    updateSidebarBalance();
    if (document.getElementById('mainChart')) updateDashboard();
    if (document.getElementById('history-list')) updateAccountsPage();
}

function updateLayoutProfile() {
    const profile = userProfiles[currentWorkspace] || userProfiles[activePerson] || userProfiles.user1;
    document.querySelectorAll('.layout-user-name').forEach(el => el.textContent = profile.name);
    document.querySelectorAll('.layout-user-avatar').forEach(el => el.src = profile.avatar);
    const profileNameInput = document.getElementById('profile-display-name');
    if (profileNameInput && currentWorkspace !== 'shared') profileNameInput.value = profile.name;
    
    const t1 = document.getElementById('tab-ws-user1');
    if(t1) t1.textContent = userProfiles.user1.name;
    const t2 = document.getElementById('tab-ws-user2');
    if(t2) t2.textContent = userProfiles.user2.name;
    const sharedLabel = document.getElementById('shared-workspace-label');
    if (sharedLabel) sharedLabel.textContent = userProfiles.shared.name;
}

function updateSidebarBalance() {
    const sidebarBalance = document.getElementById('sidebar-balance');
    if (!sidebarBalance) return;
    
    let totalIn = 0, totalOut = 0;
    getWorkspaceTransactions().forEach(t => {
        if(t.type === 'income') totalIn += t.amount;
        if(t.type === 'expense') totalOut += t.amount;
    });
    sidebarBalance.textContent = formatCurrency(totalIn - totalOut);
}

// Mở Menu Sidebar Mobile (Nếu còn giữ trên Header)
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    if(openBtn && sidebar) openBtn.addEventListener('click', () => sidebar.classList.remove('hidden'));
    if(closeBtn && sidebar) closeBtn.addEventListener('click', () => sidebar.classList.add('hidden'));
});


// --- 4. LOGIC TRANG CHỦ (INDEX.HTML) ---
function filterDataByDate(dataList, timeFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return dataList.filter(t => {
        const tDate = new Date(t.date);
        switch(timeFilter) {
            case 'day': return tDate.getTime() === today.getTime();
            case 'week':
                const firstDayOfWeek = new Date(today);
                const day = today.getDay() || 7;
                if (day !== 1) firstDayOfWeek.setHours(-24 * (day - 1));
                return tDate >= firstDayOfWeek;
            case 'month': return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            case 'year': return tDate.getFullYear() === now.getFullYear();
            case 'all': default: return true;
        }
    });
}

function setChartMode(type) {
    chartMode = type;
    const indicator = document.getElementById('chart-tab-indicator');
    const btnExp = document.getElementById('btn-mode-expense');
    const btnInc = document.getElementById('btn-mode-income');
    
    if (type === 'expense') {
        indicator.style.transform = 'translateX(0)';
        btnExp.className = 'flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 text-brand-expense';
        btnInc.className = 'flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 text-slate-500 dark:text-slate-400';
    } else {
        indicator.style.transform = 'translateX(100%)';
        btnInc.className = 'flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 text-brand-income';
        btnExp.className = 'flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 text-slate-500 dark:text-slate-400';
    }
    updateChartData();
}

function updateDashboard() {
    let totalIn = 0, totalOut = 0;
    getWorkspaceTransactions().forEach(t => {
        if(t.type === 'income') totalIn += t.amount;
        if(t.type === 'expense') totalOut += t.amount;
    });
    
    const bal = totalIn - totalOut;
    const elMainBal = document.getElementById('main-balance');
    const elTotalInc = document.getElementById('main-total-income');
    const elTotalExp = document.getElementById('main-total-expense');
    
    if(elMainBal) elMainBal.textContent = formatCurrency(bal);
    if(elTotalInc) elTotalInc.textContent = '+' + formatCurrency(totalIn);
    if(elTotalExp) elTotalExp.textContent = '-' + formatCurrency(totalOut);

    updateChartData();
}

function updateChartData() {
    const timeVal = document.getElementById('time-filter').value;
    const filtered = filterDataByDate(getWorkspaceTransactions(), timeVal);
    const targetData = filtered.filter(t => t.type === chartMode);
    
    const agg = {};
    targetData.forEach(t => {
        if(!agg[t.category]) agg[t.category] = 0;
        agg[t.category] += t.amount;
    });

    const labels = [], data = [], colors = [], breakdownHTML = [];
    const sortedCats = Object.keys(agg).sort((a,b) => agg[b] - agg[a]);
    const totalTargetAmount = targetData.reduce((sum, t) => sum + t.amount, 0);

    sortedCats.forEach(catId => {
        const info = getCategoryInfo(catId, chartMode);
        if(info) {
            labels.push(info.name);
            data.push(agg[catId]);
            colors.push(info.color);

            const pct = ((agg[catId] / totalTargetAmount) * 100).toFixed(1);
            breakdownHTML.push(`
                <div class="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-50 dark:border-slate-700 hover:-translate-y-0.5 transition-transform">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background-color: ${info.bg}; color: ${info.text}">
                            <i class="${info.icon}"></i>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">${info.name}</p>
                            <p class="text-[11px] font-bold text-slate-400 mt-0.5">${pct}%</p>
                        </div>
                    </div>
                    <p class="font-extrabold text-sm ${chartMode === 'expense' ? 'text-slate-800 dark:text-white' : 'text-brand-income'}">${formatCurrency(agg[catId])}</p>
                </div>
            `);
        }
    });

    const listEl = document.getElementById('breakdown-list');
    if(listEl) {
        if(breakdownHTML.length > 0) {
            listEl.innerHTML = breakdownHTML.join('');
        } else {
            listEl.innerHTML = '<div class="text-center p-4 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">Không có chi tiết.</div>';
        }
    }
    drawChart(labels, data, colors);
}

function drawChart(labels, data, colors) {
    const canvas = document.getElementById('mainChart');
    if(!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const emptyEl = document.getElementById('chart-empty-state');
    const isDark = document.documentElement.classList.contains('dark');

    if(myChartInstance) myChartInstance.destroy();

    if (data.length === 0) {
        if(emptyEl) emptyEl.classList.remove('hidden');
        return;
    } else {
        if(emptyEl) emptyEl.classList.add('hidden');
    }

    myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: isDark ? 2 : 0,
                borderColor: isDark ? '#1e293b' : '#fff',
                hoverOffset: 12,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#fff' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    titleFont: { family: "'Quicksand', sans-serif", size: 13, weight: 'bold' },
                    bodyFont: { family: "'Quicksand', sans-serif", size: 14, weight: 'bold' },
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) { return `  ${formatCurrency(context.parsed)}`; }
                    }
                }
            },
            layout: { padding: 15 }
        }
    });
}

// --- 5. LOGIC TRANG NHẬP LIỆU (EDIT.HTML) ---
function setEditType(type) {
    editMode = type;
    const indicator = document.getElementById('type-indicator');
    const btnExp = document.getElementById('edit-tab-expense');
    const btnInc = document.getElementById('edit-tab-income');

    if (!indicator || !btnExp) return;

    if (type === 'expense') {
        indicator.style.transform = 'translateX(0)';
        indicator.className = 'absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-brand-expense rounded-xl transition-all duration-300 shadow-md';
        btnExp.className = 'flex-1 py-3 text-base font-extrabold z-10 transition-colors text-white';
        btnInc.className = 'flex-1 py-3 text-base font-extrabold z-10 transition-colors text-slate-500 dark:text-slate-400';
    } else {
        indicator.style.transform = 'translateX(100%)';
        indicator.className = 'absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-brand-income rounded-xl transition-all duration-300 shadow-md';
        btnInc.className = 'flex-1 py-3 text-base font-extrabold z-10 transition-colors text-white';
        btnExp.className = 'flex-1 py-3 text-base font-extrabold z-10 transition-colors text-slate-500 dark:text-slate-400';
    }

    const inputCat = document.getElementById('input-category');
    if(inputCat) inputCat.value = '';
    const errorEl = document.getElementById('category-error');
    if(errorEl) errorEl.classList.add('hidden');
    
    renderEditCategories(type);
}

function renderEditCategories(type) {
    const grid = document.getElementById('category-grid');
    if(!grid) return;
    
    let html = '';
    categoriesData[type].forEach(c => {
        html += `
            <div id="cat-${c.id}" onclick="selectCategory('${c.id}')" class="category-item flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 cursor-pointer shadow-sm">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2 transition-transform" style="background-color: ${c.bg}; color: ${c.text}">
                    <i class="${c.icon}"></i>
                </div>
                <span class="text-[11px] font-extrabold text-center text-slate-600 dark:text-slate-300 tracking-wide uppercase">${c.name}</span>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function selectCategory(catId) {
    document.getElementById('input-category').value = catId;
    document.getElementById('category-error').classList.add('hidden');
    
    document.querySelectorAll('.category-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('div').classList.remove('scale-110');
    });
    const selected = document.getElementById(`cat-${catId}`);
    if(selected) {
        selected.classList.add('selected');
        selected.querySelector('div').classList.add('scale-110');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const amtStr = document.getElementById('input-amount').value;
    const cat = document.getElementById('input-category').value;
    
    if(!cat) {
        document.getElementById('category-error').classList.remove('hidden');
        return;
    }

    const amt = parseCurrency(amtStr);
    if(amt <= 0) return;

    const selectedFundId = document.getElementById('input-account').value;
    const selectedFund = getFunds().find(f => f.id === selectedFundId);
    // Giao dịch cá nhân luôn thuộc người đã chọn gần nhất; không tự rơi về Người A khi đang xem Quỹ Chung.
    const newTx = {
        id: Date.now(),
        type: editMode,
        workspace: selectedFund && selectedFund.type === 'shared' ? 'shared' : activePerson,
        amount: amt,
        account: selectedFundId,
        category: cat,
        date: document.getElementById('input-date').value,
        tag: document.getElementById('input-tag').value,
        note: document.getElementById('input-note').value
    };

    dbTransactions.unshift(newTx); 
    saveTransactions(dbTransactions);
    window.location.href = 'index.html';
}

// --- 6. LOGIC TRANG TÀI KHOẢN (TAI-KHOAN.HTML) ---
let currentHistoryFilter = 'all';
let currentHistorySearch = '';

function setHistoryFilter(type) {
    currentHistoryFilter = type;
    const btnAll = document.getElementById('btn-filter-all');
    const btnInc = document.getElementById('btn-filter-income');
    const btnExp = document.getElementById('btn-filter-expense');
    const defaultClass = "flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:opacity-80 transition-colors";
    
    if(btnAll) btnAll.className = defaultClass;
    if(btnInc) btnInc.className = defaultClass;
    if(btnExp) btnExp.className = defaultClass;
    
    if(type === 'all' && btnAll) btnAll.className = "flex-1 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white transition-colors shadow-md";
    if(type === 'income' && btnInc) btnInc.className = "flex-1 py-2 rounded-xl text-xs font-bold bg-brand-income text-white transition-colors shadow-md";
    if(type === 'expense' && btnExp) btnExp.className = "flex-1 py-2 rounded-xl text-xs font-bold bg-brand-expense text-white transition-colors shadow-md";

    renderHistoryList();
}

function filterHistory() {
    const searchInput = document.getElementById('history-search');
    currentHistorySearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
    renderHistoryList();
}

function updateAccountsPage() {
    let tIn = 0, tOutMonth = 0;
    const now = new Date();
    
    getWorkspaceTransactions().forEach(t => {
        if(t.type === 'income') tIn += t.amount;
        else {
            tIn -= t.amount; 
            const d = new Date(t.date);
            if(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()){
                tOutMonth += t.amount;
            }
        }
    });
    
    const accAssets = document.getElementById('acc-total-assets');
    const accSpent = document.getElementById('acc-total-spent');
    
    if(accAssets) accAssets.textContent = formatCurrency(tIn);
    if(accSpent) accSpent.textContent = formatCurrency(tOutMonth);

    renderHistoryList();
}

function renderHistoryList() {
    const listEl = document.getElementById('history-list');
    if(!listEl) return;

    let filteredTx = getWorkspaceTransactions().filter(t => {
        let matchType = (currentHistoryFilter === 'all') || (t.type === currentHistoryFilter);
        let matchSearch = true;
        if(currentHistorySearch) {
            const noteMatch = (t.note || '').toLowerCase().includes(currentHistorySearch);
            const tagMatch = (t.tag || '').toLowerCase().includes(currentHistorySearch);
            const catInfo = getCategoryInfo(t.category, t.type);
            const catMatch = catInfo ? catInfo.name.toLowerCase().includes(currentHistorySearch) : false;
            matchSearch = noteMatch || tagMatch || catMatch;
        }
        return matchType && matchSearch;
    });

    if(filteredTx.length === 0) {
        listEl.innerHTML = '<div class="py-12 flex flex-col items-center text-slate-500"><i class="fas fa-search text-4xl mb-3 opacity-30"></i><p class="font-medium">Không tìm thấy giao dịch nào.</p></div>';
        return;
    }

    const grouped = {};
    filteredTx.forEach(t => {
        if(!grouped[t.date]) grouped[t.date] = [];
        grouped[t.date].push(t);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    let hHTML = '';
    
    sortedDates.forEach(date => {
        const dObj = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        let dateStr = dObj.toLocaleDateString('vi-VN');
        if(dObj.toDateString() === today.toDateString()) dateStr = 'Hôm nay, ' + dateStr;
        else if(dObj.toDateString() === yesterday.toDateString()) dateStr = 'Hôm qua, ' + dateStr;

        let dayTotal = 0;
        grouped[date].forEach(t => {
            dayTotal += (t.type === 'income' ? t.amount : -t.amount);
        });
        const dayTotalStr = (dayTotal > 0 ? '+' : '') + formatCurrency(dayTotal);
        const dayTotalClass = dayTotal >= 0 ? 'text-brand-income' : 'text-slate-500 dark:text-slate-400';

        hHTML += `
            <div class="bg-slate-100/50 dark:bg-slate-800/80 px-6 py-2 flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
                <span class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">${dateStr}</span>
                <span class="text-xs font-extrabold ${dayTotalClass}">${dayTotalStr}</span>
            </div>
        `;

        grouped[date].forEach(t => {
            const info = getCategoryInfo(t.category, t.type);
            if(!info) return;
            
            const isExp = t.type === 'expense';
            const sign = isExp ? '-' : '+';
            const amtClass = isExp ? 'text-brand-expense' : 'text-brand-income';
            const accName = (getFunds().find(f => f.id === t.account) || {}).name || ({main:'Tài Khoản Chính', cash:'Tiền Mặt', savings:'Quỹ Tiết Kiệm'}[t.account] || t.account || 'Chưa phân loại');

            hHTML += `
                <div class="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group bg-white dark:bg-transparent">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 shrink-0" style="background-color: ${info.bg}; color: ${info.text}">
                            <i class="${info.icon}"></i>
                        </div>
                        <div class="min-w-0">
                            <p class="font-extrabold text-slate-800 dark:text-slate-200 text-base truncate">${info.name}</p>
                            <div class="flex items-center mt-0.5 space-x-2 text-[11px] font-medium">
                                ${t.tag ? `<span class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md shrink-0">#${t.tag}</span>` : ''}
                                ${t.note ? `<span class="text-slate-400 truncate">${t.note}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0 ml-4">
                        <p class="font-black ${amtClass} text-lg tracking-tight">${sign}${formatCurrency(t.amount)}</p>
                        <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase flex items-center justify-end"><i class="fas fa-wallet mr-1"></i> ${accName}</p>
                    </div>
                </div>
            `;
        });
    });
    
    listEl.innerHTML = hHTML;
}

function toggleHistoryView() {
    const list = document.getElementById('history-list');
    const btn = document.getElementById('btn-view-all-history');
    if (!list) return;
    const expanded = list.dataset.expanded === 'true';
    if (!expanded) {
        list.dataset.expanded = 'true';
        list.style.maxHeight = 'none';
        list.style.overflowY = 'visible';
        if (btn) btn.innerHTML = 'Thu gọn <i class="fas fa-chevron-up text-xs ml-1"></i>';
    } else {
        list.dataset.expanded = 'false';
        list.style.maxHeight = '500px';
        list.style.overflowY = 'auto';
        if (btn) btn.innerHTML = 'Xem tất cả <i class="fas fa-chevron-down text-xs ml-1"></i>';
    }
}

// --- 7. LOGIC THÊM DANH MỤC TÙY CHỌN ---
function openAddCategoryModal() {
    const modal = document.getElementById('add-category-modal');
    if(modal) modal.classList.remove('hidden');
}

function closeAddCategoryModal() {
    const modal = document.getElementById('add-category-modal');
    if(modal) modal.classList.add('hidden');
    document.getElementById('new-cat-name').value = ''; 
}

function selectIconOption(element) {
    document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function selectColorOption(element) {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function saveNewCategory() {
    const name = document.getElementById('new-cat-name').value.trim();
    if(!name) {
        alert('Vui lòng nhập tên danh mục!');
        return;
    }

    const iconEl = document.querySelector('.icon-option.selected');
    const colorEl = document.querySelector('.color-option.selected');

    const icon = iconEl ? iconEl.dataset.icon : 'fas fa-star';
    let colorData = { color: '#8b5cf6', bg: '#ede9fe', text: '#7c3aed' };
    
    if (colorEl) {
        colorData = JSON.parse(colorEl.dataset.color);
    }

    const newCat = {
        id: 'cat_' + Date.now(),
        name: name,
        icon: icon,
        color: colorData.color,
        bg: colorData.bg,
        text: colorData.text
    };

    categoriesData[editMode].push(newCat);
    saveCategories(categoriesData); 

    closeAddCategoryModal();
    renderEditCategories(editMode);
    selectCategory(newCat.id);
}

// --- 8. LOGIC BẢNG TÍNH NĂNG MỞ RỘNG (BOTTOM SHEET) ---
function openFeatureMenu() {
    const modal = document.getElementById('feature-menu-modal');
    const content = document.getElementById('feature-menu-content');
    if (modal && content) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            content.classList.remove('translate-y-full');
        }, 10);
    }
}

function closeFeatureMenu() {
    const modal = document.getElementById('feature-menu-modal');
    const content = document.getElementById('feature-menu-content');
    if (modal && content) {
        content.classList.add('translate-y-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300); 
    }
}

// --- 9. BỘ ĐIỀU PHỐI (ROUTER) KHI TRANG TẢI XONG ---
document.addEventListener('DOMContentLoaded', () => {
    if (!['user1', 'user2', 'shared'].includes(currentWorkspace)) currentWorkspace = activePerson;
    normalizeLegacyTransactions();
    applyTheme();
    if (currentTheme === 'system' && window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    updateLayoutProfile();
    renderFundOptions();
    const profileNameInput = document.getElementById('profile-display-name');
    if (profileNameInput && currentWorkspace !== 'shared') profileNameInput.value = userProfiles[currentWorkspace].name;
    setWorkspace(currentWorkspace); // Gọi setWorkspace tự động render Dashboard & Lịch sử
    
    if (document.getElementById('edit-form')) {
        setEditType('expense');
    }
});