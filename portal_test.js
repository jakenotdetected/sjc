
// ── DATA ──
const DB={
  get(k){try{return JSON.parse(localStorage.getItem('sjc_'+k)||'null')}catch(e){return null}},
  set(k,v){localStorage.setItem('sjc_'+k,JSON.stringify(v))},
  del(k){localStorage.removeItem('sjc_'+k)}
};

const CAREERS=[
  {
    title:'Medical Doctor', field:'Medicine', tags:['Medicine'], bg:'#fee2e2', stroke:'#991b1b',
    desc:'Diagnose and treat illnesses, perform surgeries, and improve patient health.',
    salary:'LKR 150,000 - 800,000+ per month',
    quals:'MBBS, MD or equivalent medical degree.',
    uni:'Colombo, Peradeniya, Kelaniya, KDU, Foreign Med Schools',
    subjects:'Biology, Chemistry, Physics (A/L Science)',
    local:'Government Hospitals, Private Hospitals, Clinics',
    intl:'High demand globally (Requires PLAB for UK, USMLE for USA)'
  },
  {
    title:'Software Engineer', field:'IT', tags:['IT'], bg:'#dbeafe', stroke:'#1d4ed8',
    desc:'Design and build software systems, apps, and digital infrastructure.',
    salary:'LKR 100,000 - 1,500,000+ per month',
    quals:'BSc in Computer Science, Software Engineering, or IT.',
    uni:'Moratuwa, UCSC, SLIIT, IIT, NSBM',
    subjects:'Mathematics, ICT, Physics',
    local:'Tech startups, WSO2, Sysco LABS, Virtusa',
    intl:'Massive global demand (Remote work highly accessible)'
  },
  {
    title:'Civil Engineer', field:'Engineering', tags:['Engineering'], bg:'#fef3c7', stroke:'#b45309',
    desc:'Plan and oversee construction of infrastructure like bridges, roads, and buildings.',
    salary:'LKR 80,000 - 500,000+ per month',
    quals:'BSc Engineering (Civil).',
    uni:'Moratuwa, Peradeniya, Ruhuna, SLIIT',
    subjects:'Combined Mathematics, Physics, Chemistry',
    local:'Construction firms, Government infrastructure projects',
    intl:'Strong demand in Middle East and Australia'
  },
  {
    title:'Attorney-at-Law', field:'Law', tags:['Law'], bg:'#ede9fe', stroke:'#6d28d9',
    desc:'Represent clients in legal proceedings, draft documents, and offer legal advice.',
    salary:'LKR 50,000 - 1,000,000+ per month (highly variable)',
    quals:'LLB and passing Sri Lanka Law College exams.',
    uni:'Colombo Law Faculty, Open University, APIIT, Royal Institute',
    subjects:'Logic, Political Science, Languages, History',
    local:'Private practice, Corporate Legal Counsel, Judiciary',
    intl:'Jurisdiction-specific; requires local bar exams'
  },
  {
    title:'Corporate Manager', field:'Business', tags:['Business'], bg:'#dcfce7', stroke:'#15803d',
    desc:'Oversee business operations, marketing, HR, or finance to drive company growth.',
    salary:'LKR 100,000 - 1,000,000+ per month',
    quals:'BBA, BCom, MBA, CIMA, or CIM.',
    uni:'Sri Jayewardenepura, Colombo, NSBM, NIBM',
    subjects:'Business Studies, Accounting, Economics',
    local:'Banks, Multinationals, Conglomerates (MAS, Brandix, JKH)',
    intl:'Global opportunities with multinational transfers'
  },
  {
    title:'Journalist / Broadcaster', field:'Media', tags:['Media'], bg:'#f3e8ff', stroke:'#7e22ce',
    desc:'Investigate, report, and present news and stories across print, TV, and digital platforms.',
    salary:'LKR 40,000 - 300,000+ per month',
    quals:'Degree or Diploma in Mass Communication or Journalism.',
    uni:'Colombo, Kelaniya, SLPI',
    subjects:'Media Studies, Languages, Logic, Political Science',
    local:'Derana, Hiru, Wijeya Newspapers, Digital Media',
    intl:'International news agencies, freelance correspondence'
  },
  {
    title:'Graphic / UI Designer', field:'Design', tags:['Design'], bg:'#fce7f3', stroke:'#9d174d',
    desc:'Create visual concepts, UI/UX for apps, branding, and advertising.',
    salary:'LKR 60,000 - 400,000+ per month',
    quals:'Degree/Diploma in Graphic Design or UI/UX. Strong Portfolio is key.',
    uni:'Moratuwa (Design), AMDT, AOD',
    subjects:'Art, Design, ICT',
    local:'Ad agencies, Tech companies, Freelance',
    intl:'Excellent remote working and international freelance potential'
  },
  {
    title:'Commercial Pilot', field:'Aviation', tags:['Aviation'], bg:'#e0f2fe', stroke:'#0369a1',
    desc:'Navigate and fly commercial airlines for passenger and cargo transport.',
    salary:'LKR 500,000 - 2,500,000+ per month',
    quals:'Commercial Pilot License (CPL) and ATPL.',
    uni:'SriLankan Aviation College, Skyline, Asian Aviation Centre',
    subjects:'Mathematics, Physics, English',
    local:'SriLankan Airlines, FitsAir, Cinnamon Air',
    intl:'Emirates, Qatar Airways, Singapore Airlines'
  },
  {
    title:'Government Administrative Officer', field:'Government', tags:['Government'], bg:'#f5f3ff', stroke:'#4c1d95',
    desc:'Manage public resources and formulate policies within government ministries.',
    salary:'LKR 50,000 - 150,000+ per month (plus pensions & perks)',
    quals:'Any Bachelor's Degree and passing SLAS (Sri Lanka Administrative Service) exam.',
    uni:'Any recognized state university',
    subjects:'Any stream (Arts, Science, Commerce)',
    local:'Ministries, District Secretariats, Departments',
    intl:'Diplomatic missions, UN agencies'
  },
  {
    title:'Startup Founder', field:'Entrepreneurship', tags:['Entrepreneurship'], bg:'#fffbeb', stroke:'#b45309',
    desc:'Create, launch, and scale innovative new business ventures.',
    salary:'Variable (High risk, very high reward)',
    quals:'No strict requirements, though Business/Tech degrees help.',
    uni:'Any (Many founders are self-taught or hold diverse degrees)',
    subjects:'Business Studies, Economics, ICT',
    local:'Hatch, Spiralation, local startup ecosystem',
    intl:'Global venture capital funding, Silicon Valley accelerators'
  }
];

let currentUser=null;
let regData={};

window.addEventListener('DOMContentLoaded',()=>{
  const saved=DB.get('currentUser');
  if(saved){currentUser=saved;bootApp();}
  renderCareerExplorer('All');
});

// ── AUTH TABS ──
function switchAuthTab(tab){
  const isLogin=tab==='login';
  document.getElementById('tabLogin').classList.toggle('active',isLogin);
  document.getElementById('tabRegister').classList.toggle('active',!isLogin);
  document.getElementById('loginForm').style.display=isLogin?'block':'none';
  document.getElementById('registerForm').style.display=isLogin?'none':'block';
  if(!isLogin)showRegStep(1);
}

// ── LOGIN ──
function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const errEl=document.getElementById('loginErr');
  errEl.textContent='';
  if(!email||!pass){errEl.textContent='Please enter your email and password.';return;}
  const users=DB.get('users')||{};
  const user=users[email.toLowerCase()];
  if(!user||user.password!==pass){errEl.textContent='Invalid email or password.';return;}
  currentUser=user;DB.set('currentUser',user);bootApp();
}

// ── REGISTER STEPS ──
function showRegStep(n){
  for(let i=1;i<=4;i++){
    const el=document.getElementById('regStep'+i);
    if(el)el.style.display=i===n?'block':'none';
    const dot=document.getElementById('sdot'+i);
    if(dot){dot.classList.remove('active','done');if(i<n)dot.classList.add('done');else if(i===n)dot.classList.add('active');}
    if(i<4){const line=document.getElementById('sline'+i);if(line)line.classList.toggle('done',i<n);}
  }
}
function regNext(step){
  if(step===1){
    const first=document.getElementById('r1-first').value.trim();
    const last=document.getElementById('r1-last').value.trim();
    const email=document.getElementById('r1-email').value.trim();
    const pass=document.getElementById('r1-pass').value;
    const err=document.getElementById('regErr1');
    if(!first||!last){err.textContent='Please enter your full name.';return;}
    if(!email||!email.includes('@')){err.textContent='Please enter a valid email.';return;}
    if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
    const users=DB.get('users')||{};
    if(users[email.toLowerCase()]){err.textContent='An account with this email already exists.';return;}
    err.textContent='';
    regData={firstName:first,lastName:last,email:email.toLowerCase(),password:pass};
    showRegStep(2);
  } else if(step===2){
    const grade=document.getElementById('r2-grade').value;
    const err=document.getElementById('regErr2');
    if(!grade){err.textContent='Please select your grade.';return;}
    err.textContent='';
    regData.grade=grade;
    regData.class=document.getElementById('r2-class').value.trim();
    regData.stream=document.getElementById('r2-stream').value;
    regData.indexNo=document.getElementById('r2-index').value.trim();
    showRegStep(3);
  } else if(step===3){
    regData.bio=document.getElementById('r3-bio').value.trim();
    showRegStep(4);
  }
}
function regBack(step){showRegStep(step-1);}

function previewPhoto(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    regData.photoData=e.target.result;
    const img=document.getElementById('photoPreviewImg');
    img.src=e.target.result;img.style.display='block';
    document.getElementById('photoUploadIcon').style.display='none';
  };
  reader.readAsDataURL(file);
}
function previewCV(input){
  const file=input.files[0];if(!file)return;
  regData.cvName=file.name;
  document.getElementById('cvFileName').textContent=file.name;
  const reader=new FileReader();
  reader.onload=e=>{regData.cvData=e.target.result;};
  reader.readAsDataURL(file);
}
function finishRegister(){
  regData.skills=[...document.querySelectorAll('#skillPicker .tag-opt.sel')].map(t=>t.textContent);
  regData.careerInterests=[...document.querySelectorAll('#careerPicker .tag-opt.sel')].map(t=>t.textContent);
  regData.achievements=[];
  regData.appointments=[];
  regData.createdAt=new Date().toISOString();
  const users=DB.get('users')||{};
  users[regData.email]=regData;
  DB.set('users',users);
  currentUser=regData;DB.set('currentUser',regData);
  toast('Account created! Welcome, '+regData.firstName+'!','success');
  bootApp();
}

// ── BOOT ──
function bootApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('app').style.display='flex';
  refreshTopbar();refreshDashboard();renderProfilePage();showPage('dashboard');
}
function doLogout(){
  DB.del('currentUser');currentUser=null;
  document.getElementById('app').style.display='none';
  document.getElementById('authScreen').style.display='flex';
  switchAuthTab('login');
  toast('Signed out successfully.','success');
}

// ── SIDEBAR ──
let sidebarOpen=true;
function toggleSidebar(){
  sidebarOpen=!sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed',!sidebarOpen);
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const btn=document.getElementById('sbi-'+id);if(btn)btn.classList.add('active');
  if(id==='dashboard')refreshDashboard();
  if(id==='profile')renderProfilePage();
  if(id==='appointments')renderApptsFull();
}

// ── TOPBAR ──
function refreshTopbar(){
  if(!currentUser)return;
  const initials=(currentUser.firstName[0]||'')+(currentUser.lastName[0]||'');
  document.getElementById('tbUsername').textContent=currentUser.firstName;
  document.getElementById('tbInitials').textContent=initials;
  if(currentUser.photoData){
    const img=document.getElementById('tbAvatarImg');
    img.src=currentUser.photoData;img.style.display='block';
    document.getElementById('tbInitials').style.display='none';
  }
}

// ── DASHBOARD ──
function refreshDashboard(){
  if(!currentUser)return;
  const h=new Date().getHours();
  const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  document.getElementById('dashGreeting').textContent=g+', '+currentUser.firstName+'!';
  const pct=calcCompletion();
  document.getElementById('stat-completion').textContent=pct+'%';
  document.getElementById('stat-appts').textContent=(currentUser.appointments||[]).length;
  document.getElementById('stat-careers').textContent=(currentUser.careerInterests||[]).length;
  updateRing(pct);
  renderDashAppts();
  renderDashCareers();
}
function calcCompletion(){
  if(!currentUser)return 0;
  const checks=[
    true,
    !!currentUser.photoData,
    !!(currentUser.grade&&currentUser.grade!==''),
    !!(currentUser.bio&&currentUser.bio.trim()),
    !!(currentUser.skills&&currentUser.skills.length>0),
    !!(currentUser.careerInterests&&currentUser.careerInterests.length>0),
    !!currentUser.cvName,
    !!(currentUser.achievements&&currentUser.achievements.length>0),
  ];
  const ids=['ci-photo','ci-academic','ci-bio','ci-skills','ci-interests','ci-cv','ci-achievement'];
  checks.slice(1).forEach((done,i)=>{
    const el=document.getElementById(ids[i]);
    if(el){el.classList.toggle('done',done);}
  });
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}
function updateRing(pct){
  const circ=2*Math.PI*46;
  const offset=circ-(circ*pct/100);
  const ring=document.getElementById('completionRing');
  if(ring){ring.style.strokeDasharray=circ;ring.style.strokeDashoffset=offset;}
  const el=document.getElementById('completionPct');
  if(el)el.textContent=pct+'%';
}
function renderDashAppts(){
  const apts=(currentUser.appointments||[]).filter(a=>!a.done).slice(0,3);
  const el=document.getElementById('dashAppts');if(!el)return;
  if(!apts.length){el.innerHTML='<div class="appt-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No upcoming appointments.</p></div>';return;}
  el.innerHTML='<div class="appt-list">'+apts.map(a=>apptHTML(a)).join('')+'</div>';
}
function apptHTML(a){
  const d=new Date(a.date);
  const day=isNaN(d.getDate())?'–':d.getDate();
  const mon=isNaN(d.getMonth())?'':d.toLocaleString('default',{month:'short'});
  return `<div class="appt-card"><div class="appt-date"><div class="appt-day">${day}</div><div class="appt-mon">${mon}</div></div><div class="appt-divider"></div><div class="appt-info"><div class="appt-title">${a.type}</div><div class="appt-meta">${a.time} · Counselling Unit</div></div><span class="appt-badge ${a.done?'done':'upcoming'}">${a.done?'Completed':'Upcoming'}</span></div>`;
}
function renderDashCareers(){
  const interests=currentUser.careerInterests||[];
  const el=document.getElementById('dashCareers');if(!el)return;
  if(!interests.length){el.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--muted);font-size:0.88rem">Add career interests in your profile to see personalised recommendations.</div>';return;}
  const matched=CAREERS.filter(c=>interests.some(i=>c.field===i||c.tags.includes(i))).slice(0,4);
  if(!matched.length){el.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--muted);font-size:0.88rem">No exact matches. Try adding more interests in your profile.</div>';return;}
  el.innerHTML=matched.map(c=>`<div class="career-card"><div class="career-icon" style="background:${c.bg}"><i class="ejo ejo-career" style="font-size:1.4rem; color:${c.stroke}"></i></div><div class="career-title">${c.title}</div><div class="career-match">Matches your interests</div><div class="career-desc">${c.desc}</div></div>`).join('');
}

// ── PROFILE ──
function renderProfilePage(){
  if(!currentUser)return;
  const initials=(currentUser.firstName||'?')[0]+(currentUser.lastName||'?')[0];
  document.getElementById('profName').textContent=currentUser.firstName+' '+currentUser.lastName;
  document.getElementById('profEmail').textContent=currentUser.email;
  document.getElementById('profInitials').textContent=initials;
  if(currentUser.photoData){
    const img=document.getElementById('profAvatarImg');
    img.src=currentUser.photoData;img.style.display='block';
    document.getElementById('profInitials').style.display='none';
  }
  document.getElementById('profBio').value=currentUser.bio||'';
  const gEl=document.getElementById('profGrade');if(gEl&&currentUser.grade)gEl.value=currentUser.grade;
  const sEl=document.getElementById('profStream');if(sEl&&currentUser.stream)sEl.value=currentUser.stream;
  document.getElementById('profClass').value=currentUser.class||'';
  document.getElementById('profIndex').value=currentUser.indexNo||'';
  // skills
  document.querySelectorAll('#profSkillPicker .tag-opt').forEach(el=>{
    el.classList.toggle('sel',(currentUser.skills||[]).includes(el.textContent));
  });
  renderSkillsDisplay();
  // career
  document.querySelectorAll('#profCareerPicker .tag-opt').forEach(el=>{
    el.classList.toggle('sel',(currentUser.careerInterests||[]).includes(el.textContent));
  });
  // cv
  const cvD=document.getElementById('cvDisplay');
  const cvA=document.getElementById('cvUploadArea');
  if(currentUser.cvName){cvD.style.display='flex';cvA.style.display='none';document.getElementById('cvDisplayName').textContent=currentUser.cvName;}
  else{cvD.style.display='none';cvA.style.display='flex';}
  renderAchievements();
}
function renderSkillsDisplay(){
  const skills=currentUser.skills||[];
  const el=document.getElementById('profSkillsDisplay');if(!el)return;
  el.innerHTML=skills.length?skills.map(s=>`<span class="skill-tag">${s}</span>`).join(''):'<span style="color:var(--muted);font-size:0.82rem">No skills added yet — select below.</span>';
}
function renderAchievements(){
  const list=currentUser.achievements||[];
  const el=document.getElementById('achievementList');if(!el)return;
  el.innerHTML=list.length?list.map((a,i)=>`<div class="achievement-item"><div class="achievement-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div><div class="achievement-text">${a}</div><button onclick="removeAchievement(${i})" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`).join(''):'<p style="color:var(--muted);font-size:0.85rem">No achievements added yet.</p>';
}
function saveAcademic(){
  currentUser.grade=document.getElementById('profGrade').value;
  currentUser.class=document.getElementById('profClass').value.trim();
  currentUser.stream=document.getElementById('profStream').value;
  currentUser.indexNo=document.getElementById('profIndex').value.trim();
  persist();toast('Academic details saved!','success');
}
function saveSkills(){
  currentUser.skills=[...document.querySelectorAll('#profSkillPicker .tag-opt.sel')].map(t=>t.textContent);
  renderSkillsDisplay();persist();toast('Skills saved!','success');
}
function saveCareerInterests(){
  currentUser.careerInterests=[...document.querySelectorAll('#profCareerPicker .tag-opt.sel')].map(t=>t.textContent);
  persist();toast('Career interests saved!','success');
}
function saveFullProfile(){
  currentUser.bio=document.getElementById('profBio').value.trim();
  currentUser.grade=document.getElementById('profGrade').value;
  currentUser.class=document.getElementById('profClass').value.trim();
  currentUser.stream=document.getElementById('profStream').value;
  currentUser.indexNo=document.getElementById('profIndex').value.trim();
  currentUser.skills=[...document.querySelectorAll('#profSkillPicker .tag-opt.sel')].map(t=>t.textContent);
  currentUser.careerInterests=[...document.querySelectorAll('#profCareerPicker .tag-opt.sel')].map(t=>t.textContent);
  renderSkillsDisplay();persist();toast('Profile saved!','success');
}
function addAchievement(){
  const input=document.getElementById('newAchievement');
  const val=input.value.trim();if(!val)return;
  if(!currentUser.achievements)currentUser.achievements=[];
  currentUser.achievements.push(val);input.value='';
  renderAchievements();persist();
}
function removeAchievement(i){
  currentUser.achievements.splice(i,1);renderAchievements();persist();
}
function uploadCV(input){
  const file=input.files[0];if(!file)return;
  currentUser.cvName=file.name;
  const reader=new FileReader();
  reader.onload=e=>{
    currentUser.cvData=e.target.result;persist();
    document.getElementById('cvDisplay').style.display='flex';
    document.getElementById('cvUploadArea').style.display='none';
    document.getElementById('cvDisplayName').textContent=file.name;
    toast('CV uploaded!','success');
  };
  reader.readAsDataURL(file);
}
function changeProfilePhoto(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    currentUser.photoData=e.target.result;persist();refreshTopbar();
    const big=document.getElementById('profAvatarImg');
    big.src=e.target.result;big.style.display='block';
    document.getElementById('profInitials').style.display='none';
    toast('Profile photo updated!','success');
  };
  reader.readAsDataURL(file);
}
function persist(){
  DB.set('currentUser',currentUser);
  const users=DB.get('users')||{};
  users[currentUser.email]=currentUser;
  DB.set('users',users);
  updateRing(calcCompletion());
  document.getElementById('stat-completion').textContent=calcCompletion()+'%';
  document.getElementById('stat-careers').textContent=(currentUser.careerInterests||[]).length;
}

// ── CAREER EXPLORER ──
function renderCareerExplorer(filter){
  const grid=document.getElementById('careerExplorerGrid');if(!grid)return;
  const list=filter==='All'?CAREERS:CAREERS.filter(c=>c.field.includes(filter)||c.tags.some(t=>t.includes(filter)));
  grid.innerHTML=list.map(c=>`
    <div class="career-exp-card" style="padding:20px;border-radius:12px;border:1px solid var(--cream-3);background:var(--white);">
      <div style="display:flex;gap:15px;align-items:flex-start;margin-bottom:15px">
        <div class="career-exp-icon" style="background:${c.bg};padding:12px;border-radius:10px;"><i class="ejo ejo-career" style="font-size:1.5rem; color:${c.stroke}"></i></div>
        <div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:700;color:var(--maroon-deep);line-height:1.1">${c.title}</div>
          <div style="font-size:0.8rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:4px">${c.field}</div>
        </div>
      </div>
      <p style="font-size:0.9rem;line-height:1.5;color:var(--ink-soft);margin-bottom:16px">${c.desc}</p>
      
      <div style="display:grid;grid-template-columns:1fr;gap:8px;font-size:0.85rem;color:var(--ink);">
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>Salary:</strong> ${c.salary}</div>
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>Qualifications:</strong> ${c.quals}</div>
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>University Pathways:</strong> ${c.uni}</div>
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>Recommended Subjects:</strong> ${c.subjects}</div>
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>Sri Lanka Ops:</strong> ${c.local}</div>
        <div style="background:var(--cream-1);padding:8px 12px;border-radius:6px"><strong>International Ops:</strong> ${c.intl}</div>
      </div>
    </div>
  `).join('');
}"><i class="ejo ejo-career" style="font-size:1.5rem; color:${c.stroke}"></i></div><div class="career-exp-title">${c.title}</div><div class="career-exp-field">${c.field}</div><div class="career-exp-desc">${c.desc}</div><div class="career-exp-skills">${c.skills.map(s=>`<span class="career-exp-skill">${s}</span>`).join('')}</div></div>`).join('');
}
function filterCareers(filter,el){
  document.querySelectorAll('.interest-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');renderCareerExplorer(filter);
}

// ── APPOINTMENTS ──
function renderApptsFull(){
  const apts=currentUser.appointments||[];
  const countEl=document.getElementById('apptCount');
  if(countEl)countEl.textContent=apts.length+' appointment'+(apts.length!==1?'s':'');
  const el=document.getElementById('apptListFull');if(!el)return;
  if(!apts.length){el.innerHTML='<div class="appt-empty" style="background:var(--white);border-radius:14px;border:1px solid var(--rule)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No appointments yet. Book your first session above!</p></div>';return;}
  el.innerHTML='<div class="appt-list">'+apts.map(a=>apptHTML(a)).join('')+'</div>';
}
function submitBooking(){
  const type=document.getElementById('bk-type').value;
  const date=document.getElementById('bk-date').value;
  const time=document.getElementById('bk-time').value;
  const note=document.getElementById('bk-note').value.trim();
  if(!date){toast('Please select a date.','error');return;}
  if(!currentUser.appointments)currentUser.appointments=[];
  currentUser.appointments.push({type,date,time,note,done:false,id:Date.now()});
  persist();closeModal('bookModal');
  toast('Appointment request sent!','success');
  renderDashAppts();renderApptsFull();
  document.getElementById('stat-appts').textContent=(currentUser.appointments||[]).length;
}

// ── MODALS & TOAST ──
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));
let toastT;
function toast(msg,type='success'){
  const el=document.getElementById('toast');
  const icon=type==='success'?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  el.innerHTML=icon+msg;el.className='show '+type;
  clearTimeout(toastT);toastT=setTimeout(()=>el.className='',3000);
}

