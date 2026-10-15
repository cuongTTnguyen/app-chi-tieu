/* AI Nhắc Nhở Sổ Chi Tiêu CL — phân tích tại máy, không cần API trả phí. */
(function () {
  'use strict';
  const TX_KEY = 'finance_buddy_transactions';
  const PERSON_KEY = 'finance_buddy_active_person';
  const WS_KEY = 'finance_buddy_workspace';
  const SETTINGS_KEY = 'scl_ai_reminder_settings';
  const LAST_KEY = 'scl_ai_reminder_last';
  const DAY = 86400000;
  const money = n => new Intl.NumberFormat('vi-VN', {maximumFractionDigits:0}).format(Math.round(n || 0)) + 'đ';
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const read = (k, fallback) => { try { const v=localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; } };
  const settings = () => Object.assign({enabled:true, tone:'spicy', quietHours:false}, read(SETTINGS_KEY, {}));
  const transactions = () => read(TX_KEY, []).filter(t => t && t.type === 'expense' && Number(t.amount)>0);
  const workspace = () => localStorage.getItem(WS_KEY) || localStorage.getItem(PERSON_KEY) || 'user1';
  const categoryName = id => {
    const cats=read('finance_buddy_categories',{});
    for (const group of Object.values(cats)) if (Array.isArray(group)) { const c=group.find(x=>String(x.id)===String(id)); if(c) return c.name; }
    return ({food:'Ăn uống',transport:'Đi lại',shopping:'Mua sắm',entertainment:'Giải trí',bills:'Hóa đơn',coffee:'Cà phê'}[id] || id || 'không rõ danh mục');
  };
  const lines = {
    daily: [
      n => `Mới hôm nay đã bay ${money(n)}. Tiền trong ví có chân, còn bạn thì có vẻ đang làm quản lý sân bay.`,
      n => `Xin chúc mừng, bạn vừa tài trợ nền kinh tế ${money(n)} chỉ trong hôm nay. Ví mình thì ai tài trợ?`,
      n => `Hôm nay chi ${money(n)} rồi nhé. Mục tiêu tiết kiệm vẫn còn đó, chỉ là nó đang nhìn bạn thất vọng.`,
      n => `${money(n)} đã rời đội hình. Không lời từ biệt, không hẹn ngày quay lại.`
    ],
    spike: [
      (c,n) => `Danh mục ${c} đang ngốn ${money(n)} trong 7 ngày. Bạn đang tiêu tiền hay nuôi một thú cưng rất đắt đỏ vậy?`,
      (c,n) => `${c} lại được ưu ái ${money(n)} tuần này. Các danh mục khác chắc đang ghen tị lắm.`,
      (c,n) => `Báo động nhẹ: ${c} đã lấy ${money(n)} của bạn trong 7 ngày. Cái ví không ký hợp đồng tài trợ đâu.`
    ],
    high: [
      n => `Một khoản chi ${money(n)} vừa xuất hiện. “Mình xứng đáng mà” — câu thần chú quen thuộc của ngân sách đang hấp hối.`,
      n => `${money(n)} cho một lần chi. Quyết định của bạn, hậu quả cũng của bạn. Ví chỉ muốn được tham vấn trước thôi.`
    ],
    calm: [n => `Nhắc nhẹ: hôm nay đã chi ${money(n)}. Theo dõi một chút để cuối tháng khỏi chơi trò đoán xem tiền đi đâu.`]
  };
  function analyze() {
    const all=transactions(), ws=workspace(), t=today();
    const tx=all.filter(x=>(x.workspace || 'user1')===ws);
    const daily=tx.filter(x=>x.date===t).reduce((s,x)=>s+Number(x.amount),0);
    const weekStart=new Date(); weekStart.setDate(weekStart.getDate()-6); weekStart.setHours(0,0,0,0);
    const recent=tx.filter(x=>{const d=new Date(String(x.date||'')+'T00:00:00');return !isNaN(d)&&d>=weekStart;});
    const byCat={}; recent.forEach(x=>{const k=String(x.category||'other');byCat[k]=(byCat[k]||0)+Number(x.amount);});
    const biggest=Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
    const maxToday=Math.max(0,...tx.filter(x=>x.date===t).map(x=>Number(x.amount)||0));
    if (daily >= 500000) return {key:'daily-'+t, text:pick(lines.daily)(daily), title:'Ví tiền đang kêu cứu', kind:'danger'};
    if (maxToday >= 1000000) return {key:'high-'+t+'-'+maxToday, text:pick(lines.high)(maxToday), title:'Khoan đã, đại gia!', kind:'danger'};
    if (biggest && biggest[1] >= 1000000) return {key:'cat-'+t+'-'+biggest[0], text:pick(lines.spike)(categoryName(biggest[0]),biggest[1]), title:'Bóc phốt danh mục', kind:'warning'};
    if (daily >= 200000) return {key:'daily-mid-'+t, text:pick(lines.calm)(daily), title:'Nhắc khéo một chút', kind:'normal'};
    return null;
  }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function injectStyles(){
    if(document.getElementById('scl-ai-style')) return;
    const s=document.createElement('style'); s.id='scl-ai-style'; s.textContent=`
      #scl-ai-toast{position:fixed;z-index:99999;right:18px;top:18px;width:min(370px,calc(100vw - 28px));padding:17px 18px 15px;border-radius:22px;background:linear-gradient(145deg,#21152f,#39204b);color:#fff;box-shadow:0 20px 60px #160c2480;border:1px solid #ffffff25;font-family:Quicksand,system-ui,sans-serif;animation:scl-ai-in .48s cubic-bezier(.2,.9,.25,1.25) both}
      #scl-ai-toast .scl-ai-head{display:flex;align-items:center;gap:10px;margin-bottom:9px}#scl-ai-toast .scl-ai-face{width:42px;height:42px;display:grid;place-items:center;border-radius:15px;background:#a78bfa2b;font-size:23px;flex:none}
      #scl-ai-toast .scl-ai-title{font-weight:900;font-size:15px;line-height:1.25}#scl-ai-toast .scl-ai-tag{font-size:10px;color:#d8b4fe;letter-spacing:1.2px;font-weight:900}
      #scl-ai-toast .scl-ai-text{font-size:13px;line-height:1.65;color:#f3e8ff}#scl-ai-toast .scl-ai-actions{display:flex;gap:8px;margin-top:14px}
      #scl-ai-toast button{border:0;border-radius:11px;padding:9px 12px;font:800 12px inherit;cursor:pointer}#scl-ai-dismiss{background:#a78bfa;color:#20112c}#scl-ai-later{background:#ffffff18;color:#fff}
      #scl-ai-toast .scl-ai-x{margin-left:auto;background:transparent;color:#fff;padding:2px 7px;font-size:20px}
      #scl-ai-toast.scl-out{animation:scl-ai-out .25s ease forwards}
      @keyframes scl-ai-in{from{opacity:0;transform:translate(22px,-18px) scale(.9)}to{opacity:1;transform:translate(0) scale(1)}}@keyframes scl-ai-out{to{opacity:0;transform:translate(24px,-10px) scale(.94)}}
      @media(max-width:520px){#scl-ai-toast{top:10px;right:10px;width:calc(100vw - 20px)}}`;
    document.head.appendChild(s);
  }
  function close(){const el=document.getElementById('scl-ai-toast');if(el){el.classList.add('scl-out');setTimeout(()=>el.remove(),260);}}
  function show(item){
    injectStyles(); close();
    const el=document.createElement('aside');el.id='scl-ai-toast';el.setAttribute('role','status');
    el.innerHTML=`<div class="scl-ai-head"><div class="scl-ai-face">😼</div><div><div class="scl-ai-tag">SỔ CHI TIÊU CL · AI CÀ KHỊA</div><div class="scl-ai-title">${item.title}</div></div><button class="scl-ai-x" aria-label="Đóng">×</button></div><div class="scl-ai-text"></div><div class="scl-ai-actions"><button id="scl-ai-dismiss">Rồi, biết rồi!</button><button id="scl-ai-later">Để lát tính 🙄</button></div>`;
    el.querySelector('.scl-ai-text').textContent=item.text;
    el.querySelector('.scl-ai-x').onclick=close;el.querySelector('#scl-ai-dismiss').onclick=close;
    el.querySelector('#scl-ai-later').onclick=()=>{localStorage.setItem(LAST_KEY,JSON.stringify({key:item.key,at:Date.now()}));close();};
    document.body.appendChild(el);
    if('vibrate' in navigator) try{navigator.vibrate([60,35,60]);}catch(_){}
    setTimeout(close,14000);
  }
  function run(force){
    const cfg=settings();if(!cfg.enabled)return;
    const hour=new Date().getHours();if(cfg.quietHours&&(hour>=22||hour<7))return;
    const item=analyze();if(!item)return;
    const last=read(LAST_KEY,{});
    if(!force && (last.key===item.key || Date.now()-(last.at||0)<3*60*60*1000))return;
    localStorage.setItem(LAST_KEY,JSON.stringify({key:item.key,at:Date.now()}));
    setTimeout(()=>{if(!document.hidden)show(item);},1600+Math.random()*4200);
  }
  function addSettings(){
    if(document.getElementById('scl-ai-settings'))return;
    const btn=document.createElement('button');btn.id='scl-ai-settings';btn.type='button';btn.title='Cài đặt AI nhắc nhở';
    btn.textContent='😼 AI cà khịa';btn.style.cssText='position:fixed;right:16px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:9998;border:1px solid #c4b5fd;background:#ede9fe;color:#5b21b6;border-radius:999px;padding:10px 14px;font:800 12px Quicksand,system-ui;box-shadow:0 8px 24px #5b21b622;cursor:pointer';
    btn.onclick=()=>{
      const cfg=settings();const enabled=confirm(`AI nhắc nhở hiện đang ${cfg.enabled?'BẬT':'TẮT'}.\nOK = bật AI\nCancel = tắt AI`);
      const tone=prompt('Chọn phong cách: "spicy" (cà khịa) hoặc "calm" (nhẹ nhàng).',cfg.tone||'spicy');
      localStorage.setItem(SETTINGS_KEY,JSON.stringify({...cfg,enabled,tone:tone==='calm'?'calm':'spicy'}));
      alert(`Đã ${enabled?'bật':'tắt'} AI nhắc nhở. Phong cách: ${tone==='calm'?'nhẹ nhàng':'cà khịa'}.`);
      if(enabled)run(true);
    };
    document.body.appendChild(btn);
  }
  function init(){addSettings();run(false);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.SCLAI = {check:()=>run(true), settings:()=>settings()};
  window.addEventListener('storage',e=>{if(e.key===TX_KEY)run(false);});
})();