"use strict";
// Talat HHS v3.0 mobiele pilot: taken, cursussen, planning, offline lokale concepten,
// en optionele handmatig gestarte lokale Wi-Fi-synchronisatie met Windows.
const KEY='talat-hhs.mobile.v3';
const demoCourses=[{id:'programming1',title:'Programming 1',block:'TECH1',status:'actief'},{id:'bpm',title:'Business Process Management',block:'BUS1',status:'actief'},{id:'challenge',title:'The Challenge & PD',block:'CHAL1',status:'actief'},{id:'programming2',title:'Programming 2',block:'ONBEKEND',status:'komend'}];
const demoTasks=[{id:'demo-java',title:'DEMO — Java-oefening (geen echte schooltaak)',courseId:'programming1',workStatus:'open',submission:'onbekend',due:'',updatedAt:'demo'},{id:'demo-bpm',title:'DEMO — BPM controleren (geen echte schooltaak)',courseId:'bpm',workStatus:'open',submission:'onbekend',due:'',updatedAt:'demo'}];
const initial={tab:'today',endpoint:'',token:'',courses:demoCourses,tasks:demoTasks,events:[],synced:false,changed:{},localTasks:[],syncMessage:'Nog niet gekoppeld aan Windows.',lastSync:''};
let state;
try {state={...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{state={...initial};}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function courseTitle(id){return state.courses.find(c=>c.id===id)?.title||'Algemeen';}
function label(status){return {open:'Te doen',bezig:'Bezig',afgerond:'Afgerond',onbekend:'Nog controleren'}[status]||status;}
function shownTask(t){return {...t,workStatus:state.changed[t.id]?.newStatus||t.workStatus};}
function allTasks(){return [...state.tasks,...state.localTasks].map(shownTask);}
function due(s){if(!s)return 'Geen bevestigde datum'; const d=new Date(s);return isNaN(d)?'Datum onbekend':d.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'});}
function badge(t){let c=state.changed[t.id];if(c)return `<span class="status ${c.status==='conflict'?'failed':'pending'}">${c.status==='conflict'?'Conflict':c.status==='queued'?'Wacht op Windows':'Offline wijziging'}</span>`;if(t.id.startsWith('local-'))return '<span class="status">Alleen iPhone</span>';if(t.workStatus==='afgerond')return '<span class="status done">Afgerond</span>';return '';}
function taskHtml(task){const t=shownTask(task);return `<button class="task ${t.workStatus==='afgerond'?'done':''}" data-task="${esc(t.id)}" ${state.changed[t.id]?.status==='queued'?'disabled':''}><span class="tick">${t.workStatus==='afgerond'?'✓':''}</span><span class="task-text"><span class="task-label">${esc(t.title)}</span><span class="task-sub">${esc(courseTitle(t.courseId))} · ${esc(due(t.due))}</span>${badge(t)}</span><span class="task-side">›</span></button>`;}
function taskPanel(title,tasks){return `<h2 class="section">${esc(title)} (${tasks.length})</h2>${tasks.map(taskHtml).join('')||'<p class="muted">Geen taken gevonden.</p>'}`;}
function render(){
  const tab=state.tab;
  document.getElementById('screen-title').textContent=({today:'Vandaag',courses:'Mijn vakken',planning:'Planning',sync:'Synchroniseren'})[tab];
  document.getElementById('connection-indicator').textContent=state.synced?`Lokaal opgeslagen · laatste verbinding: ${state.lastSync||'onbekend'}`:'Voorbeeldgegevens · niet gekoppeld aan Windows';
  document.querySelectorAll('.tab').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false');});
  const root=document.getElementById('screen');
  if(tab==='today'){
    const tasks=allTasks();const active=tasks.filter(t=>t.workStatus!=='afgerond');
    root.innerHTML=`<section class="hero"><span class="eyebrow">STUDIEOVERZICHT</span><h2>${state.synced?'Je echte Windows-taken':'Proefmodus'}</h2><p>${state.synced?'Vink een taak af. De wijziging wordt lokaal bewaard en bij wifi-sync naar Windows gestuurd.':'Koppel je Windows-app onder Sync. De huidige taken zijn fictieve voorbeelden.'}</p></section><div class="stats"><div class="stat"><span class="big">${active.length}</span><span class="sub">Niet afgerond</span></div><div class="stat"><span class="big">${tasks.filter(t=>t.workStatus==='afgerond').length}</span><span class="sub">Afgerond werk</span></div></div>${taskPanel('Mijn taken',active)}<section class="panel"><h2 class="panel-title">Snel een persoonlijke taak</h2><p class="panel-detail">Nieuwe taken zijn voorlopig alleen op deze iPhone opgeslagen, niet op Windows of Brightspace.</p><form id="quick-form" class="quickadd"><input id="quick-title" maxlength="120" autocomplete="off" placeholder="Nieuwe persoonlijke taak" required/><button aria-label="Taak toevoegen">+</button></form></section>`;
  }else if(tab==='courses'){
    root.innerHTML=`<p class="muted">TECH1/2 · BUS1/2 · CHAL1/2. Vakken uit Windows zodra je synchroniseert.</p>${['TECH1','BUS1','CHAL1','TECH2','BUS2','CHAL2','ONBEKEND'].map(block=>{const cs=state.courses.filter(c=>c.block===block);return cs.length?`<h2 class="group-title">${block}</h2>${cs.map(c=>`<div class="course"><div>${esc(c.title)}<br><small>${c.status==='komend'?'Komend':'Actief / schoolbron controleren'}</small></div><span class="chip">${allTasks().filter(t=>t.courseId===c.id&&t.workStatus!=='afgerond').length} taken</span></div>`).join('')}`:'';}).join('')}`;
  }else if(tab==='planning'){
    const events=[...state.events].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    root.innerHTML=`<p class="muted">Toetsen en afspraken zoals ze lokaal uit Windows zijn overgenomen. Controleer officiële roosterwijzigingen bij de school.</p><h2 class="section">Toetsen en afspraken (${events.length})</h2>${events.map(e=>`<div class="panel"><div class="row"><div><strong>${esc(e.title)}</strong><p class="panel-detail">${esc(courseTitle(e.courseId))}</p></div><span class="chip">${esc(due(e.date))}</span></div></div>`).join('')||'<p class="muted">Nog geen afspraken ontvangen.</p>'}`;
  }else if(tab==='sync'){
    const changes=Object.values(state.changed);
    root.innerHTML=`<div class="panel"><h2 class="panel-title">Verbind met je Windows-laptop</h2><p class="panel-detail">Start eerst START_WIFI_BRUG.cmd op Windows. Je telefoon en laptop moeten verbonden zijn met dezelfde eigen privéwifi.</p><form id="sync-form"><label class="field">Windows-adres (zoals getoond in het CMD-venster)<input id="endpoint" type="url" value="${esc(state.endpoint)}" placeholder="http://192.168.1.5:8765" autocapitalize="off" required></label><label class="field">Tijdelijke toegangscode (32 tekens)<input id="token" type="password" value="${esc(state.token)}" autocomplete="off" placeholder="Plak de getoonde code" required></label><button class="action" id="sync-btn" type="submit">↻ Nu synchroniseren</button></form><p class="subtle">${esc(state.syncMessage)}</p></div><div class="panel"><h2 class="panel-title">Mobiele wijzigingen</h2><p class="panel-detail">${changes.length} wijziging(en) opgeslagen op deze iPhone. Na versturen moet Windows de werkstatus nog bevestigen.</p>${changes.map(c=>`<div class="course"><span>${esc(state.tasks.find(t=>t.id===c.taskId)?.title||c.taskId)}</span><span class="status ${c.status==='conflict'?'failed':'pending'}">${esc(c.status)}</span></div>`).join('')}</div><div class="notice">Deze proef gebruikt lokale HTTP zonder versleuteling. Gebruik uitsluitend je eigen vertrouwde wifi; geen school-, café- of openbaar netwerk. De server deelt geen volledige notities, wachtwoorden of officiële cijfergegevens. Je mag de wifi-brug op Windows sluiten zodra je klaar bent.</div>`;
  }
  root.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.task)));
  root.querySelector('#quick-form')?.addEventListener('submit',e=>{e.preventDefault();const title=root.querySelector('#quick-title').value.trim();if(!title)return;const id='local-'+Date.now();state.localTasks.push({id,title,courseId:'',workStatus:'open',submission:'onbekend',due:'',updatedAt:new Date().toISOString()});save();render();});
  root.querySelector('#sync-form')?.addEventListener('submit',e=>{e.preventDefault();state.endpoint=root.querySelector('#endpoint').value.trim().replace(/\/+$/,'');state.token=root.querySelector('#token').value.trim();save();void sync();});
}
function toggle(id){
  const local=state.localTasks.find(t=>t.id===id);
  if(local){local.workStatus=local.workStatus==='afgerond'?'open':'afgerond';save();render();return;}
  const task=state.tasks.find(t=>t.id===id);if(!task)return;
  if(state.changed[id]?.status==='queued')return;
  const cur=shownTask(task).workStatus;
  const newStatus=cur==='afgerond'?'open':'afgerond';
  state.changed[id]={id:crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+'-'+Date.now(),taskId:id,newStatus,baseUpdatedAt:task.updatedAt,status:'offline'};
  save();render();
}
async function getJson(path,init={}){
  const controller=new AbortController(); const t=setTimeout(()=>controller.abort(),9000);
  try{
    const res=await fetch(state.endpoint+path,{...init,headers:{'Authorization':`Bearer ${state.token}`,'Content-Type':'application/json'},signal:controller.signal,cache:'no-store'});
    const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error((data.error||'HTTP '+res.status));return data;
  }finally{clearTimeout(t);}
}
function isPrivateEndpoint(endpoint){
  try{const url=new URL(endpoint);const ip=url.hostname;
    const nums=ip.split('.').map(Number);
    return url.protocol==='http:' && url.port==='8765' && url.pathname==='/' && nums.length===4 && nums.every(x=>Number.isInteger(x)&&x>=0&&x<=255) && (nums[0]===10 || (nums[0]===192&&nums[1]===168) || (nums[0]===172&&nums[1]>=16&&nums[1]<=31));
  }catch{return false;}
}
async function sync(){
  if(!isPrivateEndpoint(state.endpoint)){state.syncMessage='Gebruik het privé-IP-adres en poort 8765 die de Windows-brug toont.';save();render();return;}
  if(!/^[a-f0-9]{32}$/.test(state.token)){state.syncMessage='Controleer de tijdelijke toegangscode van Windows (32 tekens).';save();render();return;}
  state.syncMessage='Verbinden met Windows…';render();
  try{
    // Send offline changes; keep queued changes locally until Windows has approved them.
    for(const c of Object.values(state.changed))if(c.status==='offline'){
      try{const a=await getJson('/api/proposal',{method:'POST',body:JSON.stringify(c)});c.status=a.status==='applied'?'applied':'queued';}
      catch(e){c.status=String(e).includes('gewijzigd')?'conflict':'offline';state.syncMessage='Een wijziging kon niet worden verstuurd: '+String(e);}
    }
    const queued=Object.values(state.changed).filter(c=>c.status==='queued');
    if(queued.length){const statuses=await getJson('/api/status?ids='+queued.map(c=>encodeURIComponent(c.id)).join(','));for(const s of statuses.requests||[]){const c=Object.values(state.changed).find(x=>x.id===s.id);if(c){if(s.status==='applied')delete state.changed[c.taskId];else if(s.status==='conflict'||s.status==='rejected')state.changed[c.taskId].status='conflict';}}}
    const snapshot=await getJson('/api/snapshot');if(snapshot.version!==3||!Array.isArray(snapshot.tasks)||!Array.isArray(snapshot.courses))throw new Error('Ongeldige Windows-gegevens');
    state.courses=snapshot.courses;state.tasks=snapshot.tasks;state.events=snapshot.events||[];state.synced=true;state.lastSync=new Date().toLocaleString('nl-NL');
    const outstanding=Object.values(state.changed).length;
    state.syncMessage=`Gegevens opgehaald. ${outstanding?outstanding+' mobiele voorstel(len) moeten nog door Windows worden behandeld.':'Geen openstaande wijzigingen.'}`;
  }catch(e){state.syncMessage='Verbinding niet gelukt: '+String(e)+'. Je lokale wijzigingen blijven opgeslagen.';}
  save();render();
}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.tab;save();render();}));
render();
