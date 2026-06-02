
/* ─── DB ──────────────────────────────────────── */
const DB = {
  get(k){ try{ return JSON.parse(localStorage.getItem('sjc_'+k)||'null') }catch(e){ return null } },
  set(k,v){ localStorage.setItem('sjc_'+k, JSON.stringify(v)) },
  del(k){ localStorage.removeItem('sjc_'+k) }
};

/* ─── STATE ──────────────────────────────────── */
let currentRole = null;
let runtimeSAPin = '4321';
const T_PIN = '1234';

/* ─── ICONS ──────────────────────────────────── */
const I = {
  grid:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  cal:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  users:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  uc:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
  ev:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>`,
  gear:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  clk:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  out:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  srch:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  pen:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  bin:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  eye:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  dl:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

/* ─── HELPERS ────────────────────────────────── */
function getAllStudents(){ return Object.values(DB.get('users')||{}) }
function getTeachers(){ return DB.get('teachers')||[] }
function getEvents(){ return DB.get('events')||[] }
function getAllAppointments(){
  const all=[];
  getAllStudents().forEach(s=>{
    (s.appointments||[]).forEach(a=>{
      all.push({...a, studentName:s.name, studentEmail:s.email, studentGrade:s.grade||'—'});
    });
  });
  return all.sort((a,b)=>(b.createdAt||'')>(a.createdAt||'')?1:-1);
}
function updateAptStatus(email,aptId,newStatus){
  const users=DB.get('users')||{};
  if(!users[email]) return;
  const apt=(users[email].appointments||[]).find(a=>a.id===aptId);
  if(apt){ apt.status=newStatus; DB.set('users',users); }
}
function calcCompletion(s){
  const c=[true,!!s.photoData,!!(s.grade&&s.grade!==''),!!(s.bio&&s.bio.trim()),
    !!(s.skills&&s.skills.length>0),!!(s.careerInterests&&s.careerInterests.length>0),
    !!s.cvName,!!(s.achievements&&s.achievements.length>0)];
  return Math.round(c.filter(Boolean).length/c.length*100);
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6) }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function initials(n){ return (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) }
function fmtDate(d){ if(!d) return '—'; return new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }
function today(){ return new Date().toISOString().slice(0,10) }
function greet(){ const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening' }

function initData(){
  if(!DB.get('teachers')){
    DB.set('teachers',[
      {id:'t1',name:'Mr. R. Perera',subject:'Mathematics',email:'perera@sjc.lk'},
      {id:'t2',name:'Mr. K. Silva',subject:'Science',email:'silva@sjc.lk'},
      {id:'t3',name:'Ms. D. Fernando',subject:'Counselling Lead',email:'fernando@sjc.lk'},
    ]);
  }
  if(!DB.get('events')){
    DB.set('events',[
      {id:'e1',title:'Career Guidance Day',date:'2026-06-15',time:'09:00',location:'Main Hall',type:'Career',description:'Annual career guidance for A/L students.'},
      {id:'e2',title:'University Admissions Fair',date:'2026-07-12',time:'10:00',location:'School Grounds',type:'Academic',description:'University representatives present admission details.'},
    ]);
  }
}

/* ─── LOGIN ──────────────────────────────────── */
function switchTab(role){
  const roles=['superadmin','teacher','student'];
  document.querySelectorAll('.role-tab').forEach((t,i)=>t.classList.toggle('active',roles[i]===role));
  document.querySelectorAll('.login-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('lp-'+role).classList.add('active');
  document.querySelectorAll('.login-err').forEach(e=>e.classList.remove('show'));
}


// --- AUTHENTICATION STATE ---
function getDb() {
  const db = JSON.parse(localStorage.getItem('sjc_auth')) || { adminEmail: 'admin@sjc.lk', adminPin: '4321' };
  const teachers = JSON.parse(localStorage.getItem('sjc_teachers')) || [
    { id: 't1', email: 'teacher@sjc.lk', pin: '1234', name: 'Default Teacher', perms: {canAdd:true, canDelete:true, canEditNote:true} }
  ];
  return { ...db, teachers };
}

function doLogin(role) {
  const db = getDb();
  let email = '';
  let pin = '';
  
  if(role === 'superadmin') {
    email = document.getElementById('sa-email').value;
    pin = document.getElementById('sa-pin').value;
    if(email === db.adminEmail && pin === db.adminPin) {
      enterApp('superadmin');
    } else {
      document.getElementById('sa-err').classList.add('show');
    }
  } else if(role === 'teacher') {
    email = document.getElementById('t-email').value;
    pin = document.getElementById('t-pin').value;
    const tUser = db.teachers.find(t => t.email.toLowerCase() === email.toLowerCase() && t.pin === pin);
    if(tUser) {
      localStorage.setItem('sjc_current_teacher', JSON.stringify(tUser));
      enterApp('teacher'); // Bypass OTP for regular login
    } else {
      document.getElementById('t-err').classList.add('show');
    }
  } else {
    enterApp('student'); 
  }
}

function triggerOTP(role) {
  const db = getDb();
  let email = '';
  if(role === 'superadmin') email = document.getElementById('sa-email').value;
  if(role === 'teacher') email = document.getElementById('t-email').value;
  
  if(role === 'superadmin' && email !== db.adminEmail) {
    alert("Please enter a valid registered email to reset your PIN.");
    return;
  }
  
  const tUser = role === 'teacher' ? db.teachers.find(t => t.email.toLowerCase() === email.toLowerCase()) : null;
  if(role === 'teacher' && !tUser) {
    alert("Please enter a valid registered email to reset your PIN.");
    return;
  }
  
  pendingRole = role;
  currentOTP = Math.floor(1000 + Math.random() * 9000).toString();
  alert(`[MOCK EMAIL] Sent to ${email}!

Your Password Reset OTP is: ${currentOTP}`);
  document.getElementById('otpModal').classList.add('active');
}

function verifyOTP() {
  const inp = document.getElementById('otp-in').value;
  if(inp === currentOTP) {
    document.getElementById('otpModal').classList.remove('active');
    document.getElementById('resetModal').classList.add('active'); // Open reset modal instead of logging in
  } else {
    document.getElementById('otp-err').style.display = 'block';
  }
}

function saveResetPIN() {
  const nw = document.getElementById('reset-in').value;
  if(nw.length < 4) {
    document.getElementById('reset-err').style.display = 'block';
    document.getElementById('reset-err').textContent = 'PIN must be at least 4 characters';
    return;
  }
  const db = getDb();
  if(pendingRole === 'superadmin') {
    db.adminPin = nw;
    localStorage.setItem('sjc_auth', JSON.stringify({ adminEmail: db.adminEmail, adminPin: db.adminPin }));
  }
  if(pendingRole === 'teacher') {
    const email = document.getElementById('t-email').value;
    const tUser = db.teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    if(tUser) {
      tUser.pin = nw;
      localStorage.setItem('sjc_teachers', JSON.stringify(db.teachers));
    }
  }
  
  document.getElementById('resetModal').classList.remove('active');
  document.getElementById('otp-in').value = '';
  document.getElementById('reset-in').value = '';
  alert("PIN reset successful! You may now log in with your new PIN.");
}


function legacy_ignore(){ if(role==='student'){
    const email=document.getElementById('s-email').value.trim().toLowerCase();
    const pass=document.getElementById('s-pass').value;
    const users=DB.get('users')||{};
    const user=users[email];
    if(user&&user.password===pass){
      DB.set('currentUser',email);
      window.location.href='/portal.html';
    } else {
      document.getElementById('s-err').classList.add('show');
    }
  }
}

function enterApp(role){
  currentRole=role;
  document.getElementById('loginScreen').style.display='none';
  const shell=document.getElementById('appShell');
  shell.style.display='flex';
  document.getElementById('topbarRole').textContent=role==='superadmin'?'Super Admin':'Teacher';
  document.getElementById('topbarName').textContent=role==='superadmin'?'Administrator':'Teacher Panel';
  document.getElementById('topbarAvatar').textContent=role==='superadmin'?'SA':'T';
  if(role==='superadmin') buildSA();
  else buildTeacher();
}

function doLogout(){
  currentRole=null;
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.querySelectorAll('.login-pane input').forEach(i=>i.value='');
  document.querySelectorAll('.login-err').forEach(e=>e.classList.remove('show'));
}

/* ─── PANE SWITCHING ─────────────────────────── */
function showPane(id){
  document.querySelectorAll('.pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const p=document.getElementById(id);
  const n=document.getElementById('nav-'+id);
  if(p){ 
    p.classList.add('active'); 
    if(id === 'sa-teachers') p.innerHTML = rSATeachers();
    else if(id === 'sa-students') p.innerHTML = rSAStudents();
    else p.innerHTML = renderPane(id); 
  }
  if(n) n.classList.add('active');
}
function renderPane(id){
  switch(id){
    case 'sa-overview':    return rSAOverview();
    case 'sa-apts':        return rSAApts();
    case 'sa-students':    return rSAStudents();
    case 'sa-teachers':    return rSATeachers();
    case 'sa-events':      return rSAEvents();
    case 'sa-settings':    return rSASettings();
    case 'sa-cms':         return rSACms();
    case 't-overview':     return rTOverview();
    case 't-apts':         return rTApts();
    case 't-students':     return rTStudents();
    case 't-schedule':     return rTSchedule();
    default: return '';
  }
}

/* ─── SUPER ADMIN SHELL ──────────────────────── */
function buildSA(){
  document.getElementById('sidebar').innerHTML=`
    <div class="sidebar-section">
      <div class="sidebar-section-label">Main</div>
      <a class="nav-item active" id="nav-sa-overview" onclick="showPane('sa-overview')">${I.grid} Overview</a>
      <a class="nav-item" id="nav-sa-apts" onclick="showPane('sa-apts')">${I.cal} Appointments</a>
      <a class="nav-item" id="nav-sa-students" onclick="showPane('sa-students')">${I.users} Students</a>
      <a class="nav-item" id="nav-sa-teachers" onclick="showPane('sa-teachers')">${I.uc} Teachers</a>
      <a class="nav-item" id="nav-sa-events" onclick="showPane('sa-events')">${I.ev} Events</a>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-label">System</div>
      <a class="nav-item" id="nav-sa-cms" onclick="showPane('sa-cms')">${I.pen} Page Editor</a>
      <a class="nav-item" id="nav-sa-settings" onclick="showPane('sa-settings')">${I.gear} Settings</a>
      <a class="nav-item danger" onclick="doLogout()">${I.out} Sign Out</a>
    </div>
  `;
  const m=document.getElementById('mainArea');
  m.innerHTML=`
    <div class="pane active" id="sa-overview">${rSAOverview()}</div>
    <div class="pane" id="sa-apts"></div>
    <div class="pane" id="sa-students"></div>
    <div class="pane" id="sa-teachers"></div>
    <div class="pane" id="sa-events"></div>
    <div class="pane" id="sa-cms"></div>
    <div class="pane" id="sa-settings"></div>
  `;
}

/* ─── SA: OVERVIEW ───────────────────────────── */
function rSAOverview(){
  const students=getAllStudents();
  const apts=getAllAppointments();
  const events=getEvents();
  const teachers=getTeachers();
  const pending=apts.filter(a=>a.status==='pending').length;
  const upcoming=events.filter(e=>e.date>=today()).length;
  const recent5stu=[...students].sort((a,b)=>(b.createdAt||'')>(a.createdAt||'')?1:-1).slice(0,5);
  const recent5apt=apts.slice(0,5);
  const upEvents=events.filter(e=>e.date>=today()).sort((a,b)=>a.date>b.date?1:-1).slice(0,3);

  return `
  <div class="page-hdr">
    <h2>${greet()}, Administrator</h2>
    <p>Counselling &amp; Guidance Unit — System Overview</p>
  </div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="s-icon" style="background:#fee2e2">${I.users.replace('currentColor','#991b1b')}</div>
      <div class="s-label">Total Students</div>
      <div class="s-value">${students.length}</div>
      <div class="s-desc">Registered accounts</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#dbeafe">${I.cal.replace('currentColor','#1d4ed8')}</div>
      <div class="s-label">Appointments</div>
      <div class="s-value">${apts.length}</div>
      <div class="s-desc">${pending} awaiting review</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#dcfce7">${I.ev.replace('currentColor','#15803d')}</div>
      <div class="s-label">Events</div>
      <div class="s-value">${events.length}</div>
      <div class="s-desc">${upcoming} upcoming</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#fef3c7">${I.uc.replace('currentColor','#b45309')}</div>
      <div class="s-label">Teachers</div>
      <div class="s-value">${teachers.length}</div>
      <div class="s-desc">Active counsellors</div>
    </div>
  </div>
  <div class="two-col">
    <div class="card">
      <div class="card-hdr">
        <h3>Recent Students</h3>
        <button class="btn btn-ghost btn-sm" onclick="showPane('sa-students')">View All</button>
      </div>
      ${recent5stu.length?`
        <table><thead><tr><th>Student</th><th>Grade</th><th>Completion</th></tr></thead><tbody>
        ${recent5stu.map(s=>`<tr>
          <td><div style="display:flex;align-items:center;gap:8px">
            <div class="stu-avatar">${s.photoData?`<img src="${s.photoData}">`:`${initials(s.name)}`}</div>
            <div><div style="font-weight:600;font-size:.82rem">${esc(s.name)}</div>
            <div style="font-size:.7rem;color:#bbb">${esc(s.email)}</div></div>
          </div></td>
          <td style="font-size:.78rem;color:#888">${esc(s.grade||'—')}</td>
          <td><div class="prog-wrap"><div class="prog-bar"><div class="prog-fill" style="width:${calcCompletion(s)}%"></div></div>
            <span style="font-size:.7rem;color:#aaa">${calcCompletion(s)}%</span></div></td>
        </tr>`).join('')}
        </tbody></table>
      `:`<div class="empty-state">${I.users}<p>No students registered yet</p></div>`}
    </div>
    <div class="card">
      <div class="card-hdr">
        <h3>Recent Appointments</h3>
        <button class="btn btn-ghost btn-sm" onclick="showPane('sa-apts')">View All</button>
      </div>
      ${recent5apt.length?`
        <table><thead><tr><th>Student</th><th>Date</th><th>Status</th></tr></thead><tbody>
        ${recent5apt.map(a=>`<tr>
          <td style="font-weight:500;font-size:.83rem">${esc(a.studentName||'—')}</td>
          <td style="font-size:.76rem;color:#aaa">${fmtDate(a.date)}</td>
          <td><span class="badge badge-${a.status||'pending'}">${a.status||'pending'}</span></td>
        </tr>`).join('')}
        </tbody></table>
      `:`<div class="empty-state">${I.cal}<p>No appointments yet</p></div>`}
    </div>
  </div>
  <div class="card">
    <div class="card-hdr">
      <h3>Upcoming Events</h3>
      <button class="btn btn-ghost btn-sm" onclick="showPane('sa-events')">Manage</button>
    </div>
    ${upEvents.length?upEvents.map(e=>`
      <div class="sched-item">
        <div class="sched-time">${esc(e.time||'TBA')}</div>
        <div class="sched-detail">
          <div class="sn">${esc(e.title)}</div>
          <div class="sg">${fmtDate(e.date)} &middot; ${esc(e.location||'—')}</div>
        </div>
        <span class="badge" style="background:#f0fdf4;color:#166534">${esc(e.type||'General')}</span>
      </div>
    `).join(''):`<div class="empty-state">${I.ev}<p>No upcoming events</p></div>`}
  </div>`;
}

/* ─── SA: APPOINTMENTS ───────────────────────── */
function rSAApts(){
  const all=getAllAppointments();
  return `
  <div class="page-hdr page-hdr-row">
    <div><h2>All Appointments</h2><p>${all.length} total &middot; ${all.filter(a=>a.status==='pending').length} pending</p></div>
  </div>
  <div class="card">
    <div class="search-bar">${I.srch}<input type="text" placeholder="Search by student or type…" oninput="filt(this,'apt-tb')"></div>
    <div class="tbl-wrap">
    <table><thead><tr><th>Student</th><th>Grade</th><th>Date</th><th>Time</th><th>Type</th><th>Counsellor</th><th>Status</th><th>Update</th></tr></thead>
    <tbody id="apt-tb">
    ${all.length?all.map(a=>`
      <tr data-s="${esc((a.studentName+' '+(a.type||'')+' '+(a.counsellor||'')).toLowerCase())}">
        <td style="font-weight:500">${esc(a.studentName||'—')}</td>
        <td style="font-size:.76rem;color:#aaa">${esc(a.studentGrade||'—')}</td>
        <td style="font-size:.76rem">${fmtDate(a.date)}</td>
        <td style="font-size:.76rem;color:#888">${esc(a.time||'—')}</td>
        <td style="font-size:.76rem">${esc(a.type||'—')}</td>
        <td style="font-size:.76rem;color:#888">${esc(a.counsellor||'—')}</td>
        <td><span class="badge badge-${a.status||'pending'}" id="b-${esc(a.id)}">${a.status||'pending'}</span></td>
        <td><select class="status-sel" onchange="chgStatus('${esc(a.studentEmail)}','${esc(a.id)}',this.value)">
          ${['pending','confirmed','completed','cancelled'].map(s=>`<option value="${s}"${(a.status||'pending')===s?' selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
        </select></td>
      </tr>
    `).join(''):`<tr><td colspan="8" style="text-align:center;padding:36px;color:#ccc">No appointments found</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── SA: STUDENTS ───────────────────────────── */
function rSAStudents(){
  const students=getAllStudents();
  return `
  <div class="page-hdr">
    <h2>Students</h2>
    <p>${students.length} registered accounts</p>
  </div>
  <div class="card">
    <div class="search-bar">${I.srch}<input type="text" placeholder="Search by name or email…" oninput="filt(this,'stu-tb')"></div>
    <div class="tbl-wrap">
    <table><thead><tr><th>Student</th><th>Grade</th><th>Skills</th><th>Apts</th><th>Completion</th><th></th></tr></thead>
    <tbody id="stu-tb">
    ${students.length?students.map(s=>`
      <tr data-s="${esc((s.name+' '+s.email).toLowerCase())}">
        <td><div style="display:flex;align-items:center;gap:9px">
          <div class="stu-avatar">${s.photoData?`<img src="${s.photoData}">`:`${initials(s.name)}`}</div>
          <div><div style="font-weight:600;font-size:.83rem">${esc(s.name)}</div>
          <div style="font-size:.7rem;color:#bbb">${esc(s.email)}</div></div>
        </div></td>
        <td style="font-size:.8rem">${esc(s.grade||'—')}</td>
        <td style="font-size:.74rem;color:#999">${(s.skills||[]).slice(0,2).join(', ')||'—'}</td>
        <td style="font-size:.8rem;text-align:center">${(s.appointments||[]).length}</td>
        <td><div class="prog-wrap"><div class="prog-bar"><div class="prog-fill" style="width:${calcCompletion(s)}%"></div></div>
          <span style="font-size:.7rem;color:#aaa;min-width:28px">${calcCompletion(s)}%</span></div></td>
        <td><button class="btn btn-ghost btn-sm" onclick="viewProfile('${esc(s.email)}')">${I.eye} View</button></td>
      </tr>
    `).join(''):`<tr><td colspan="6" style="text-align:center;padding:36px;color:#ccc">No students yet</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── SA: TEACHERS ───────────────────────────── */
function rSATeachers(){
  const db = getDb();
  const teachers = db.teachers || [];
  return `
  <div class="header-action" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
    <div><h2>Teachers</h2><p style="color:#aaa;font-size:0.85rem">Manage counsellors &amp; teachers</p></div>
    <button class="btn btn-primary" onclick="addTeacherModal()">${I.plus} Add Teacher</button>
  </div>
  <div class="card">
    <div class="tbl-wrap">
    <table><thead><tr><th>Name</th><th>Subject / Role</th><th>Email</th><th>Actions</th></tr></thead>
    <tbody>
    ${teachers.length?teachers.map(t=>`
      <tr>
        <td><div style="display:flex;align-items:center;gap:8px">
          <div class="stu-avatar" style="background:var(--maroon-mid)">${initials(t.name)}</div>
          <span style="font-weight:600;font-size:.83rem">${esc(t.name)}</span>
        </div></td>
        <td style="font-size:.8rem;color:#666">${esc(t.subject||'—')}</td>
        <td style="font-size:.76rem;color:#aaa">${esc(t.email||'—')}</td>
        <td><div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editTeacherModal('${esc(t.id)}')">${I.pen} Edit</button>
          <button class="btn btn-danger btn-sm" onclick="removeTeacher('${esc(t.id)}')">${I.bin} Remove</button>
        </div></td>
      </tr>
    `).join(''):`<tr><td colspan="4" style="text-align:center;padding:36px;color:#ccc">No teachers added yet</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── SA: EVENTS ─────────────────────────────── */
function rSAEvents(){
  const events=getEvents().sort((a,b)=>a.date>b.date?1:-1);
  const now=today();
  return `
  <div class="page-hdr page-hdr-row">
    <div><h2>Events</h2><p>${events.length} total &middot; ${events.filter(e=>e.date>=now).length} upcoming</p></div>
    <button class="btn btn-primary" onclick="addEventModal()">${I.plus} Add Event</button>
  </div>
  <div class="card">
    <div class="tbl-wrap">
    <table><thead><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Type</th><th>Actions</th></tr></thead>
    <tbody>
    ${events.length?events.map(e=>`
      <tr>
        <td style="font-weight:600;font-size:.83rem">${esc(e.title)}</td>
        <td style="font-size:.76rem">${fmtDate(e.date)}</td>
        <td style="font-size:.76rem;color:#aaa">${esc(e.time||'—')}</td>
        <td style="font-size:.76rem;color:#aaa">${esc(e.location||'—')}</td>
        <td><span class="badge" style="background:#f0fdf4;color:#166534">${esc(e.type||'General')}</span></td>
        <td><div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="editEventModal('${esc(e.id)}')">${I.pen} Edit</button>
          <button class="btn btn-danger btn-sm" onclick="removeEvent('${esc(e.id)}')">${I.bin} Delete</button>
        </div></td>
      </tr>
    `).join(''):`<tr><td colspan="6" style="text-align:center;padding:36px;color:#ccc">No events yet</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── SA: SETTINGS ───────────────────────────── */
function rSASettings(){
  return `
  <div class="page-hdr"><h2>Settings</h2><p>System configuration &amp; data management</p></div>
  <div class="card" style="max-width:460px">
    <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-bottom:16px">Change Admin Password</h3>
    <div class="form-group"><label>Current Password</label><input type="password" id="set-cur" placeholder="Current Password"></div>
    <div class="form-group"><label>New Password</label><input type="password" id="set-new" placeholder="Min. 4 characters"></div>
    <div class="form-group"><label>Confirm New Password</label><input type="password" id="set-con" placeholder="Repeat new Password"></div>
    <div id="set-msg" style="display:none;font-size:.78rem;padding:8px 12px;border-radius:6px;margin-bottom:12px"></div>
    <button class="btn btn-primary" onclick="changePIN()">Update PIN</button>
    <p style="font-size:.72rem;color:#ccc;margin-top:8px"></p>
    <!-- Teacher PIN Management -->
    <div style="margin-top:24px;border-top:1px solid #eee;padding-top:20px;">
      <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-bottom:16px">Change Teacher Password</h3>
      <div class="form-group"><label>New Teacher PIN</label><input type="password" id="set-t-new" placeholder="Min. 4 characters"></div>
      <button class="btn btn-primary" onclick="changeTeacherPIN()">Update Teacher Password</button>
      <div id="set-t-msg" style="display:none;font-size:.78rem;padding:8px 12px;border-radius:6px;margin-bottom:12px;margin-top:12px;"></div>
    </div>

    <!-- Role Permissions -->
    <div style="margin-top:24px;border-top:1px solid #eee;padding-top:20px;">
      <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-bottom:16px">Teacher Permissions</h3>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:.85rem;color:#444;">
        <label><input type="checkbox" id="perm-add-student"> Allow Adding Students</label>
        <label><input type="checkbox" id="perm-edit-note"> Allow Editing/Deleting Notes</label>
      </div>
      <button class="btn btn-primary" style="margin-top:16px;" onclick="savePerms()">Save Permissions</button>
      <div id="perm-msg" style="display:none;font-size:.78rem;padding:8px 12px;border-radius:6px;margin-bottom:12px;margin-top:12px;"></div>
    </div>

  </div>
  <div class="card" style="max-width:460px">
    <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-bottom:8px">Data Management</h3>
    <p style="font-size:.79rem;color:#aaa;margin-bottom:16px">All data is stored locally in this browser. Use these tools with care.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="exportData()">${I.dl} Export JSON</button>
      <button class="btn btn-danger" onclick="clearAllStudents()">${I.bin} Clear All Students</button>
    </div>
  </div>`;
}

/* ─── TEACHER SHELL ──────────────────────────── */
function buildTeacher(){
  document.getElementById('sidebar').innerHTML=`
    <div class="sidebar-section">
      <div class="sidebar-section-label">Teacher Panel</div>
      <a class="nav-item active" id="nav-t-overview" onclick="showPane('t-overview')">${I.grid} Overview</a>
      <a class="nav-item" id="nav-t-apts" onclick="showPane('t-apts')">${I.cal} Appointments</a>
      <a class="nav-item" id="nav-t-students" onclick="showPane('t-students')">${I.users} Students</a>
      <a class="nav-item" id="nav-t-schedule" onclick="showPane('t-schedule')">${I.clk} Schedule</a>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-label">Account</div>
      <a class="nav-item danger" onclick="doLogout()">${I.out} Sign Out</a>
    </div>
  `;
  const m=document.getElementById('mainArea');
  m.innerHTML=`
    <div class="pane active" id="t-overview">${rTOverview()}</div>
    <div class="pane" id="t-apts"></div>
    <div class="pane" id="t-students"></div>
    <div class="pane" id="t-schedule"></div>
  `;
}

/* ─── TEACHER: OVERVIEW ──────────────────────── */
function rTOverview(){
  const apts=getAllAppointments();
  const students=getAllStudents();
  const todayApts=apts.filter(a=>a.date===today());
  const pending=apts.filter(a=>a.status==='pending').length;
  const next5=apts.filter(a=>a.date>=today()&&a.status!=='cancelled')
    .sort((a,b)=>a.date>b.date?1:a.date<b.date?-1:a.time>b.time?1:-1).slice(0,5);
  return `
  <div class="page-hdr">
    <h2>${greet()}</h2>
    <p>Counselling &amp; Guidance Unit — Teacher Panel</p>
  </div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="s-icon" style="background:#dbeafe">${I.cal.replace('currentColor','#1d4ed8')}</div>
      <div class="s-label">Today's Appointments</div>
      <div class="s-value">${todayApts.length}</div>
      <div class="s-desc">Scheduled for today</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#fef3c7">${I.clk.replace('currentColor','#b45309')}</div>
      <div class="s-label">Pending Review</div>
      <div class="s-value">${pending}</div>
      <div class="s-desc">Awaiting confirmation</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#fee2e2">${I.users.replace('currentColor','#991b1b')}</div>
      <div class="s-label">Total Students</div>
      <div class="s-value">${students.length}</div>
      <div class="s-desc">Registered accounts</div>
    </div>
    <div class="stat-card">
      <div class="s-icon" style="background:#dcfce7">${I.cal.replace('currentColor','#15803d')}</div>
      <div class="s-label">Total Appointments</div>
      <div class="s-value">${apts.length}</div>
      <div class="s-desc">All time</div>
    </div>
  </div>
  <div class="card">
    <div class="card-hdr">
      <h3>Upcoming Appointments</h3>
      <button class="btn btn-ghost btn-sm" onclick="showPane('t-apts')">View All</button>
    </div>
    ${next5.length?next5.map(a=>`
      <div class="sched-item">
        <div class="sched-time">${esc(a.time||'TBA')}<br><span style="font-size:.6rem;opacity:.65">${fmtDate(a.date)}</span></div>
        <div class="sched-detail" style="flex:1">
          <div class="sn">${esc(a.studentName||'Unknown')}</div>
          <div class="sg">${esc(a.type||'General')} &middot; Grade ${esc(a.studentGrade||'—')}</div>
        </div>
        <span class="badge badge-${a.status||'pending'}">${a.status||'pending'}</span>
      </div>
    `).join(''):`<div class="empty-state">${I.cal}<p>No upcoming appointments</p></div>`}
  </div>`;
}

/* ─── TEACHER: APPOINTMENTS ──────────────────── */
function rTApts(){
  const all=getAllAppointments();
  return `
  <div class="page-hdr">
    <h2>Appointments</h2>
    <p>${all.length} total &middot; ${all.filter(a=>a.status==='pending').length} pending</p>
  </div>
  <div class="card">
    <div class="search-bar">${I.srch}<input type="text" placeholder="Search by student name…" oninput="filt(this,'t-apt-tb')"></div>
    <div class="tbl-wrap">
    <table><thead><tr><th>Student</th><th>Grade</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Update</th></tr></thead>
    <tbody id="t-apt-tb">
    ${all.length?all.map(a=>`
      <tr data-s="${esc((a.studentName+' '+(a.type||'')).toLowerCase())}">
        <td style="font-weight:500">${esc(a.studentName||'—')}</td>
        <td style="font-size:.76rem;color:#aaa">${esc(a.studentGrade||'—')}</td>
        <td style="font-size:.76rem">${fmtDate(a.date)}</td>
        <td style="font-size:.76rem;color:#888">${esc(a.time||'—')}</td>
        <td style="font-size:.76rem">${esc(a.type||'—')}</td>
        <td><span class="badge badge-${a.status||'pending'}" id="b-${esc(a.id)}">${a.status||'pending'}</span></td>
        <td><select class="status-sel" onchange="chgStatus('${esc(a.studentEmail)}','${esc(a.id)}',this.value)">
          ${['pending','confirmed','completed','cancelled'].map(s=>`<option value="${s}"${(a.status||'pending')===s?' selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
        </select></td>
      </tr>
    `).join(''):`<tr><td colspan="7" style="text-align:center;padding:36px;color:#ccc">No appointments found</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── TEACHER: STUDENTS ──────────────────────── */
function rTStudents(){
  const students=getAllStudents();
  return `
  <div class="page-hdr">
    <h2>Students</h2>
    <p>${students.length} registered &mdash; read-only view</p>
  </div>
  <div class="card">
    <div class="search-bar">${I.srch}<input type="text" placeholder="Search by name or email…" oninput="filt(this,'t-stu-tb')"></div>
    <div class="tbl-wrap">
    <table><thead><tr><th>Student</th><th>Grade</th><th>Career Interests</th><th>Apts</th><th></th></tr></thead>
    <tbody id="t-stu-tb">
    ${students.length?students.map(s=>`
      <tr data-s="${esc((s.name+' '+s.email).toLowerCase())}">
        <td><div style="display:flex;align-items:center;gap:9px">
          <div class="stu-avatar">${s.photoData?`<img src="${s.photoData}">`:`${initials(s.name)}`}</div>
          <div><div style="font-weight:600;font-size:.83rem">${esc(s.name)}</div>
          <div style="font-size:.7rem;color:#bbb">${esc(s.email)}</div></div>
        </div></td>
        <td style="font-size:.8rem">${esc(s.grade||'—')}</td>
        <td style="font-size:.74rem;color:#999">${(s.careerInterests||[]).slice(0,2).join(', ')||'—'}</td>
        <td style="font-size:.8rem;text-align:center">${(s.appointments||[]).length}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="viewProfile('${esc(s.email)}')">${I.eye} View</button></td>
      </tr>
    `).join(''):`<tr><td colspan="5" style="text-align:center;padding:36px;color:#ccc">No students yet</td></tr>`}
    </tbody></table></div>
  </div>`;
}

/* ─── TEACHER: SCHEDULE ──────────────────────── */
function rTSchedule(){
  const apts=getAllAppointments();
  const days=[];
  for(let i=0;i<7;i++){ const d=new Date(); d.setDate(d.getDate()+i); days.push(d.toISOString().slice(0,10)); }
  return `
  <div class="page-hdr"><h2>Weekly Schedule</h2><p>Appointments for the next 7 days</p></div>
  ${days.map(d=>{
    const da=apts.filter(a=>a.date===d&&a.status!=='cancelled').sort((a,b)=>a.time>b.time?1:-1);
    const isToday=d===today();
    const label=new Date(d+'T00:00').toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long'});
    return `
    <div class="card">
      <div class="card-hdr">
        <h3 style="${isToday?'color:var(--maroon);font-weight:700':''}">
          ${label}${isToday?` <span style="font-size:.65rem;color:var(--gold);font-weight:700;margin-left:8px;letter-spacing:.06em">TODAY</span>`:''}
        </h3>
        <span style="font-size:.73rem;color:#bbb">${da.length} appointment${da.length===1?'':'s'}</span>
      </div>
      ${da.length?da.map(a=>`
        <div class="sched-item">
          <div class="sched-time">${esc(a.time||'—')}</div>
          <div class="sched-detail" style="flex:1">
            <div class="sn">${esc(a.studentName||'Unknown')}</div>
            <div class="sg">${esc(a.type||'General')} &middot; Grade ${esc(a.studentGrade||'—')}</div>
          </div>
          <span class="badge badge-${a.status||'pending'}">${a.status||'pending'}</span>
        </div>
      `).join(''):`<div style="padding:10px 2px;color:#ccc;font-size:.8rem;text-align:center">No appointments</div>`}
    </div>`;
  }).join('')}`;
}

/* ─── MODALS: TEACHERS ───────────────────────── */
function addTeacherModal(){
  openModal(`
    <h3>Add Teacher</h3>
    <div class="form-group"><label>Full Name</label><input type="text" id="m-name" placeholder="Mr. / Ms. Full Name"></div>
    <div class="form-group"><label>Subject / Role</label><input type="text" id="m-sub" placeholder="Mathematics, Counsellor…"></div>
    <div class="form-group"><label>Email</label><input type="email" id="m-email" placeholder="name@sjc.lk"></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTeacher(null)">Add Teacher</button>
    </div>
  `);
}
function editTeacherModal(id){
  const t=getTeachers().find(x=>x.id===id); if(!t) return;
  openModal(`
    <h3>Edit Teacher</h3>
    <div class="form-group"><label>Full Name</label><input type="text" id="m-name" value="${esc(t.name||'')}"></div>
    <div class="form-group"><label>Subject / Role</label><input type="text" id="m-sub" value="${esc(t.subject||'')}"></div>
    <div class="form-group"><label>Email</label><input type="email" id="m-email" value="${esc(t.email||'')}"></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTeacher('${esc(id)}')">Save Changes</button>
    </div>
  `);
}
function saveTeacher(id){
  const name=document.getElementById('m-name').value.trim();
  const subject=document.getElementById('m-sub').value.trim();
  const email=document.getElementById('m-email').value.trim();
  if(!name){ alert('Please enter a name.'); return; }
  const ts=getTeachers();
  if(id){ const i=ts.findIndex(t=>t.id===id); if(i>=0) ts[i]={...ts[i],name,subject,email}; }
  else ts.push({id:uid(),name,subject,email});
  DB.set('teachers',ts);
  closeModal(); showPane('sa-teachers');
}
function removeTeacher(id){
  if(!confirm('Remove this teacher from the system?')) return;
  DB.set('teachers',getTeachers().filter(t=>t.id!==id));
  showPane('sa-teachers');
}

/* ─── MODALS: EVENTS ─────────────────────────── */
function addEventModal(){
  openModal(`
    <h3>Add Event</h3>
    <div class="form-group"><label>Event Title</label><input type="text" id="m-title" placeholder="Event name"></div>
    <div class="two-col">
      <div class="form-group"><label>Date</label><input type="date" id="m-date" value="${today()}"></div>
      <div class="form-group"><label>Time</label><input type="time" id="m-time" value="09:00"></div>
    </div>
    <div class="form-group"><label>Location</label><input type="text" id="m-loc" placeholder="Main Hall, School Grounds…"></div>
    <div class="form-group"><label>Type</label>
      <select id="m-type"><option>Academic</option><option>Career</option><option>Personal Development</option><option>Social</option><option>General</option></select>
    </div>
    <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3" placeholder="Brief description…"></textarea></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEvent(null)">Add Event</button>
    </div>
  `);
}
function editEventModal(id){
  const e=getEvents().find(x=>x.id===id); if(!e) return;
  openModal(`
    <h3>Edit Event</h3>
    <div class="form-group"><label>Event Title</label><input type="text" id="m-title" value="${esc(e.title||'')}"></div>
    <div class="two-col">
      <div class="form-group"><label>Date</label><input type="date" id="m-date" value="${e.date||today()}"></div>
      <div class="form-group"><label>Time</label><input type="time" id="m-time" value="${e.time||'09:00'}"></div>
    </div>
    <div class="form-group"><label>Location</label><input type="text" id="m-loc" value="${esc(e.location||'')}"></div>
    <div class="form-group"><label>Type</label>
      <select id="m-type">${['Academic','Career','Personal Development','Social','General'].map(t=>`<option${e.type===t?' selected':''}>${t}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3">${esc(e.description||'')}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEvent('${esc(id)}')">Save Changes</button>
    </div>
  `);
}
function saveEvent(id){
  const title=document.getElementById('m-title').value.trim();
  const date=document.getElementById('m-date').value;
  const time=document.getElementById('m-time').value;
  const location=document.getElementById('m-loc').value.trim();
  const type=document.getElementById('m-type').value;
  const description=document.getElementById('m-desc').value.trim();
  if(!title||!date){ alert('Please fill in title and date.'); return; }
  const evs=getEvents();
  if(id){ const i=evs.findIndex(e=>e.id===id); if(i>=0) evs[i]={...evs[i],title,date,time,location,type,description}; }
  else evs.push({id:uid(),title,date,time,location,type,description});
  DB.set('events',evs);
  closeModal(); showPane('sa-events');
}
function removeEvent(id){
  if(!confirm('Delete this event permanently?')) return;
  DB.set('events',getEvents().filter(e=>e.id!==id));
  showPane('sa-events');
}

/* ─── STUDENT PROFILE MODAL ──────────────────── */
function viewProfile(email){
  const users=DB.get('users')||{};
  const s=users[email]; if(!s) return;
  const pct=calcCompletion(s);
  openModal(`
    <h3>${esc(s.name)}</h3>
    <div style="display:flex;align-items:center;gap:14px;padding:14px;background:#faf6ee;border-radius:10px;margin-bottom:18px">
      <div class="stu-avatar" style="width:52px;height:52px;font-size:1rem">${s.photoData?`<img src="${s.photoData}">`:`${initials(s.name)}`}</div>
      <div>
        <div style="font-weight:700;font-size:.95rem;color:var(--maroon-deep)">${esc(s.name)}</div>
        <div style="font-size:.78rem;color:#aaa">${esc(s.email)}</div>
        <div style="font-size:.78rem;color:#aaa;margin-top:1px">${esc(s.grade||'Grade not set')}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><div class="il">Bio</div><div class="iv">${esc(s.bio||'Not provided')}</div></div>
      <div class="info-item"><div class="il">CV</div><div class="iv">${esc(s.cvName||'Not uploaded')}</div></div>
      <div class="info-item"><div class="il">Skills</div><div class="iv">${(s.skills||[]).join(', ')||'None added'}</div></div>
      <div class="info-item"><div class="il">Career Interests</div><div class="iv">${(s.careerInterests||[]).join(', ')||'None added'}</div></div>
      <div class="info-item"><div class="il">Achievements</div><div class="iv">${(s.achievements||[]).join(', ')||'None added'}</div></div>
      <div class="info-item"><div class="il">Appointments</div><div class="iv">${(s.appointments||[]).length} total</div></div>
    </div>
    <div style="margin-top:16px">
      <div style="font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#bbb;margin-bottom:8px">Profile Completion</div>
      <div class="prog-wrap">
        <div class="prog-bar" style="height:10px"><div class="prog-fill" style="width:${pct}%"></div></div>
        <span style="font-weight:700;color:var(--maroon-deep);font-size:.85rem">${pct}%</span>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Close</button></div>
  `);
}

/* ─── SETTINGS ACTIONS ───────────────────────── */
function changePIN(){
  const db = getDb();
  const runtimeSAPin = db.adminPin;
  const cur=document.getElementById('set-cur').value;
  const nw=document.getElementById('set-new').value;
  const con=document.getElementById('set-con').value;
  const msg=document.getElementById('set-msg');
  msg.style.display='block';
  if(cur!==runtimeSAPin){ msg.style.cssText='display:block;background:#fdf2f2;color:#c0392b;border-left:3px solid #c0392b;padding:8px 12px;border-radius:6px;font-size:.78rem;margin-bottom:12px'; msg.textContent='Current Password is incorrect.'; return; }
  if(nw.length<4){ msg.style.cssText='display:block;background:#fdf2f2;color:#c0392b;border-left:3px solid #c0392b;padding:8px 12px;border-radius:6px;font-size:.78rem;margin-bottom:12px'; msg.textContent='New Password must be at least 4 characters.'; return; }
  if(nw!==con){ msg.style.cssText='display:block;background:#fdf2f2;color:#c0392b;border-left:3px solid #c0392b;padding:8px 12px;border-radius:6px;font-size:.78rem;margin-bottom:12px'; msg.textContent='PINs do not match.'; return; }
  db.adminPin=nw; saveDb(db);
  msg.style.cssText='display:block;background:#dcfce7;color:#15803d;border-left:3px solid #15803d;padding:8px 12px;border-radius:6px;font-size:.78rem;margin-bottom:12px';
  msg.textContent='PIN updated for this session.';
}

function changeTeacherPIN() {
  const nw = document.getElementById('set-t-new').value;
  const msg = document.getElementById('set-t-msg');
  if(nw.length<4) { msg.style.cssText='display:block;color:#c0392b;'; msg.textContent='Min 4 chars.'; return; }
  const db = getDb();
  db.teacherPin = nw;
  saveDb(db);
  msg.style.cssText='display:block;color:#15803d;'; msg.textContent='Teacher PIN updated.';
}
function loadPerms() {
  const db = getDb();
  const cAdd = document.getElementById('perm-add-student');
  const cEdit = document.getElementById('perm-edit-note');
  if(cAdd) cAdd.checked = db.perms.canAddStudent;
  if(cEdit) cEdit.checked = db.perms.canEditNote;
}
function savePerms() {
  const db = getDb();
  db.perms.canAddStudent = document.getElementById('perm-add-student').checked;
  db.perms.canEditNote = document.getElementById('perm-edit-note').checked;
  saveDb(db);
  const msg = document.getElementById('perm-msg');
  msg.style.cssText='display:block;color:#15803d;'; msg.textContent='Permissions saved.';
}
document.addEventListener('DOMContentLoaded', loadPerms);

function exportData(){
  const data={students:getAllStudents(),teachers:getTeachers(),events:getEvents(),appointments:getAllAppointments(),exportedAt:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='sjc-data-'+today()+'.json'; a.click();
}
function clearAllStudents(){
  if(!confirm('This will permanently delete ALL student accounts and cannot be undone. Continue?')) return;
  DB.del('users'); DB.del('currentUser');
  alert('All student data has been cleared.');
  showPane('sa-overview');
}

/* ─── APPOINTMENT STATUS ─────────────────────── */
function chgStatus(email,aptId,newStatus){
  updateAptStatus(email,aptId,newStatus);
  const badge=document.getElementById('b-'+aptId);
  if(badge){ badge.className='badge badge-'+newStatus; badge.textContent=newStatus[0].toUpperCase()+newStatus.slice(1); }
}

/* ─── TABLE FILTER ───────────────────────────── */
function filt(input,tbodyId){
  const q=input.value.toLowerCase();
  const rows=document.getElementById(tbodyId)?.querySelectorAll('tr');
  rows?.forEach(r=>{ r.style.display=(r.dataset.s||r.textContent).toLowerCase().includes(q)?'':'none'; });
}

/* ─── MODAL ──────────────────────────────────── */
function openModal(html){ document.getElementById('modalContent').innerHTML=html; document.getElementById('modalOverlay').classList.add('open'); }
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); document.getElementById('modalContent').innerHTML=''; }

/* ─── INIT ───────────────────────────────────── */
initData();/* === SA: CMS === */
function rSACms(){
  const cms = JSON.parse(localStorage.getItem('sjc_cms') || '{}');
  return `
  <div class="page-hdr"><h2>Page Editor</h2><p>Edit the text on the main website (index.html)</p></div>
  <div class="card" style="max-width:600px">
    <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-bottom:16px">Hero Section</h3>
    <div class="form-group">
      <label>Main Headline</label>
      <input type="text" id="cms-h-title" value="${esc(cms.heroTitle || '')}" placeholder="e.g. Empowering Your Journey...">
    </div>
    <div class="form-group">
      <label>Subtitle / Description</label>
      <textarea id="cms-h-sub" rows="3" placeholder="e.g. Discover your true potential...">${esc(cms.heroSub || '')}</textarea>
    </div>
    
    <h3 style="font-size:.9rem;font-weight:600;color:var(--maroon-deep);margin-top:24px;margin-bottom:16px">Statistics Section</h3>
    <div class="two-col">
      <div class="form-group">
        <label>Stat 1 Value (e.g. 2.4k+)</label>
        <input type="text" id="cms-s1-v" value="${esc(cms.s1v || '')}">
      </div>
      <div class="form-group">
        <label>Stat 1 Label</label>
        <input type="text" id="cms-s1-l" value="${esc(cms.s1l || '')}">
      </div>
    </div>
    <div class="two-col">
      <div class="form-group">
        <label>Stat 2 Value (e.g. 50+)</label>
        <input type="text" id="cms-s2-v" value="${esc(cms.s2v || '')}">
      </div>
      <div class="form-group">
        <label>Stat 2 Label</label>
        <input type="text" id="cms-s2-l" value="${esc(cms.s2l || '')}">
      </div>
    </div>
    <div class="two-col">
      <div class="form-group">
        <label>Stat 3 Value (e.g. 95%)</label>
        <input type="text" id="cms-s3-v" value="${esc(cms.s3v || '')}">
      </div>
      <div class="form-group">
        <label>Stat 3 Label</label>
        <input type="text" id="cms-s3-l" value="${esc(cms.s3l || '')}">
      </div>
    </div>

    <div style="text-align:right; margin-top:20px;">
      <span id="cms-msg" style="color:green;font-size:0.85rem;font-weight:600;margin-right:15px;display:none;">Saved successfully!</span>
      <button class="btn btn-primary" onclick="saveCMS()">Save Changes</button>
    </div>
  </div>
  `;
}

function saveCMS(){
  const data = {
    heroTitle: document.getElementById('cms-h-title').value.trim(),
    heroSub: document.getElementById('cms-h-sub').value.trim(),
    s1v: document.getElementById('cms-s1-v').value.trim(),
    s1l: document.getElementById('cms-s1-l').value.trim(),
    s2v: document.getElementById('cms-s2-v').value.trim(),
    s2l: document.getElementById('cms-s2-l').value.trim(),
    s3v: document.getElementById('cms-s3-v').value.trim(),
    s3l: document.getElementById('cms-s3-l').value.trim(),
  };
  localStorage.setItem('sjc_cms', JSON.stringify(data));
  const msg = document.getElementById('cms-msg');
  msg.style.display = 'inline';
  setTimeout(()=>msg.style.display='none', 2000);
}

function rSATeachers(){
  const db = getDb();
  const teachers = db.teachers || [];
  return `
    <div class="header">
      <div>
        <div class="header-title">Teacher Management</div>
        <div class="header-subtitle">Manage counseling staff and their permissions</div>
      </div>
      <button class="btn btn-primary" onclick="openTeacherModal()">${I.add} Add Teacher</button>
    </div>
    <div class="card" style="margin-top:20px; padding:0;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); background:var(--bg-card); color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">
            <th style="padding:15px 20px;">Name</th>
            <th style="padding:15px 20px;">Email</th>
            <th style="padding:15px 20px;">Permissions</th>
            <th style="padding:15px 20px; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${teachers.length ? teachers.map(t => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:15px 20px; font-weight:500; color:var(--text);">${t.name}</td>
              <td style="padding:15px 20px; color:var(--text-muted);">${t.email}</td>
              <td style="padding:15px 20px; color:var(--text-muted); font-size:0.85rem;">
                ${t.perms.canAdd ? 'Add ' : ''}${t.perms.canDelete ? 'Del ' : ''}${t.perms.canEditNote ? 'Edit' : ''}
              </td>
              <td style="padding:15px 20px; text-align:right;">
                <button class="btn btn-icon" onclick="deleteTeacher('${t.id}')" style="color:var(--danger)">${I.trash}</button>
              </td>
            </tr>
          `).join('') : `<tr><td colspan="4" style="padding:20px; text-align:center; color:var(--text-muted);">No teachers found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function openTeacherModal() {
  const m = document.getElementById('modalContent');
  m.innerHTML = `
    <div class="modal-head">
      <div class="modal-title">Add New Teacher</div>
      <button class="btn-icon" onclick="closeModal()">${I.x}</button>
    </div>
    <div class="modal-body">
      <div class="input-group">
        <label>Full Name</label>
        <input type="text" id="newTName" placeholder="e.g. Jane Doe">
      </div>
      <div class="input-group" style="margin-top:15px">
        <label>Email Address</label>
        <input type="email" id="newTEmail" placeholder="teacher@sjc.lk">
      </div>
      <div class="input-group" style="margin-top:15px">
        <label>Password</label>
        <input type="text" id="newTPass" placeholder="Password">
      </div>
      <div style="margin-top:15px; font-size:0.9rem;">
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <input type="checkbox" id="permAdd" checked> Can Add Students/Notes
        </label>
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <input type="checkbox" id="permDel" checked> Can Delete Students/Notes
        </label>
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="permEdit" checked> Can Edit Notes
        </label>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewTeacher()">Save Teacher</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

function saveNewTeacher() {
  const name = document.getElementById('newTName').value.trim();
  const email = document.getElementById('newTEmail').value.trim();
  const pin = document.getElementById('newTPass').value.trim();
  if(!name || !email || !pin) { toast('Please fill all fields','err'); return; }
  
  const teachers = JSON.parse(localStorage.getItem('sjc_teachers')) || [];
  if(teachers.some(t => t.email.toLowerCase() === email.toLowerCase())) {
    toast('Email already exists','err'); return;
  }
  
  teachers.push({
    id: 't' + Date.now(),
    name, email, pin,
    perms: {
      canAdd: document.getElementById('permAdd').checked,
      canDelete: document.getElementById('permDel').checked,
      canEditNote: document.getElementById('permEdit').checked
    }
  });
  
  localStorage.setItem('sjc_teachers', JSON.stringify(teachers));
  toast('Teacher added successfully');
  closeModal();
  if(document.getElementById('sa-teachers').classList.contains('active')) {
    document.getElementById('sa-teachers').innerHTML = rSATeachers();
  }
}

function deleteTeacher(id) {
  if(!confirm('Are you sure you want to delete this teacher?')) return;
  let teachers = JSON.parse(localStorage.getItem('sjc_teachers')) || [];
  teachers = teachers.filter(t => t.id !== id);
  localStorage.setItem('sjc_teachers', JSON.stringify(teachers));
  toast('Teacher deleted');
  if(document.getElementById('sa-teachers').classList.contains('active')) {
    document.getElementById('sa-teachers').innerHTML = rSATeachers();
  }
}

function rSAStudents(){
  const students = JSON.parse(localStorage.getItem('sjc_db_students')) || [];
  return `
    <div class="header">
      <div>
        <div class="header-title">Student Management</div>
        <div class="header-subtitle">View and manage all registered students</div>
      </div>
      <button class="btn btn-primary" onclick="openStudentModal()">${I.add} Add Student</button>
    </div>
    <div class="card" style="margin-top:20px; padding:0;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); background:var(--bg-card); color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">
            <th style="padding:15px 20px;">Register ID</th>
            <th style="padding:15px 20px;">Name</th>
            <th style="padding:15px 20px;">Grade</th>
            <th style="padding:15px 20px; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.length ? students.map(s => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:15px 20px; color:var(--text-muted);">${s.registerId || '-'}</td>
              <td style="padding:15px 20px; font-weight:500; color:var(--text);">${s.name}</td>
              <td style="padding:15px 20px; color:var(--text-muted);">${s.grade || '-'}</td>
              <td style="padding:15px 20px; text-align:right;">
                <button class="btn btn-icon" onclick="deleteStudent('${s.id}')" style="color:var(--danger)">${I.trash}</button>
              </td>
            </tr>
          `).join('') : `<tr><td colspan="4" style="padding:20px; text-align:center; color:var(--text-muted);">No students found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function openStudentModal() {
  const m = document.getElementById('modalContent');
  m.innerHTML = `
    <div class="modal-head">
      <div class="modal-title">Add New Student</div>
      <button class="btn-icon" onclick="closeModal()">${I.x}</button>
    </div>
    <div class="modal-body">
      <div class="input-group">
        <label>Full Name</label>
        <input type="text" id="newSName" placeholder="e.g. John Doe">
      </div>
      <div style="display:flex; gap:15px; margin-top:15px;">
        <div class="input-group" style="flex:1;">
          <label>Register ID</label>
          <input type="text" id="newSReg" placeholder="ID">
        </div>
        <div class="input-group" style="flex:1;">
          <label>Grade</label>
          <input type="text" id="newSGrade" placeholder="e.g. 10">
        </div>
      </div>
      <div class="input-group" style="margin-top:15px">
        <label>Parent Contact</label>
        <input type="text" id="newSContact" placeholder="07...">
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewStudent()">Save Student</button>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

function saveNewStudent() {
  const name = document.getElementById('newSName').value.trim();
  const registerId = document.getElementById('newSReg').value.trim();
  const grade = document.getElementById('newSGrade').value.trim();
  const contact = document.getElementById('newSContact').value.trim();
  if(!name) { toast('Name is required','err'); return; }
  
  const students = JSON.parse(localStorage.getItem('sjc_db_students')) || [];
  students.push({
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    type: 'student',
    name, registerId, grade, contact
  });
  
  localStorage.setItem('sjc_db_students', JSON.stringify(students));
  toast('Student added successfully');
  closeModal();
  if(document.getElementById('sa-students').classList.contains('active')) {
    document.getElementById('sa-students').innerHTML = rSAStudents();
  }
}

function deleteStudent(id) {
  if(!confirm('Delete this student permanently?')) return;
  let students = JSON.parse(localStorage.getItem('sjc_db_students')) || [];
  students = students.filter(s => s.id !== id);
  localStorage.setItem('sjc_db_students', JSON.stringify(students));
  toast('Student deleted');
  if(document.getElementById('sa-students').classList.contains('active')) {
    document.getElementById('sa-students').innerHTML = rSAStudents();
  }
}

