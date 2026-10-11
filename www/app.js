"use strict";
// Talat HHS v5.0: offline taken, alle vakken, optionele kennisbank en studiehulp.
// De sleutel blijft alleen in het geheugen van de huidige app-sessie.
const KEY='talat-hhs.mobile.v3';
const demoCourses=[{"id":"programming1","title":"Programming 1","block":"TECH1","status":"actief","description":"Java en programmeren.","source":"U"},{"id":"networks","title":"Computer Networks","block":"TECH1","status":"actief","description":"Netwerken, protocollen, labs.","source":"U"},{"id":"bpm","title":"Business Process Management","block":"BUS1","status":"actief","description":"BPMN en procesmodellering.","source":"U"},{"id":"security1","title":"Security Essentials 1","block":"BUS1","status":"actief","description":"Informatiebeveiliging en risicoanalyse.","source":"U"},{"id":"challenge","title":"The Challenge & Professional Development","block":"CHAL1","status":"actief","description":"FreshTrack, groepswerk en persoonlijke ontwikkeling.","source":"U"},{"id":"programming2","title":"Programming 2","block":"ONBEKEND","status":"komend","description":"Vervolgvak. Indeling TECH2/BUS2 niet bevestigd.","source":"N"},{"id":"embedded","title":"Embedded Systems","block":"ONBEKEND","status":"komend","description":"Vervolgvak. Indeling TECH2/BUS2 niet bevestigd.","source":"N"},{"id":"databases","title":"Databases","block":"ONBEKEND","status":"komend","description":"Vervolgvak. Indeling TECH2/BUS2 niet bevestigd.","source":"N"},{"id":"security2","title":"Security Essentials 2","block":"ONBEKEND","status":"komend","description":"Vervolgvak. Indeling TECH2/BUS2 niet bevestigd.","source":"N"}];
const demoTasks=[{id:'demo-java',title:'DEMO — Java-oefening (geen echte schooltaak)',courseId:'programming1',workStatus:'open',submission:'onbekend',due:'',updatedAt:'demo'},{id:'demo-bpm',title:'DEMO — BPM controleren (geen echte schooltaak)',courseId:'bpm',workStatus:'open',submission:'onbekend',due:'',updatedAt:'demo'}];
const initial={tab:'today',courseFilter:'',endpoint:'',courses:demoCourses,tasks:demoTasks,events:[],notes:[],memories:[],objectives:[],rubrics:[],selectedCourse:'',selectedNote:'',aiQuestion:'',aiResponse:'',aiStatus:'',includeStudy:false,synced:false,changed:{},localTasks:[],syncMessage:'Nog niet gekoppeld aan Windows.',lastSync:''};
let state;
try {state={...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{state={...initial};}
// Scrub the v3.0 persisted bearer token; never store the v4.0 session key.
delete state.token;
if(!['today','courses','course','note','planning','coach','search','sync'].includes(state.tab))state.tab='today';
// Oudere iPhone-installaties bewaren soms slechts vier vakken. Voeg ontbrekende
// catalogusvakken toe, maar behoud ALTIJD wat uit Windows ontvangen werd.
function completeMobileCourses(courses){
  const current=Array.isArray(courses)?courses:[];
  const ids=new Set(current.map(c=>c.id));const names=new Set(current.map(c=>String(c.title||'').trim().toLowerCase()));
  return [...current,...demoCourses.filter(c=>!ids.has(c.id)&&!names.has(c.title.trim().toLowerCase())).map(c=>({...c,catalogueFallback:true}))];
}
state.courses=completeMobileCourses(state.courses);
for(const key of ['notes','memories','objectives','rubrics','localTasks','events','tasks'])if(!Array.isArray(state[key]))state[key]=[];
if(!state.changed||typeof state.changed!=='object')state.changed={};
function uiBlock(c){if(c.block!=='ONBEKEND')return c.block;
  return ['programming2','embedded'].includes(c.id)?'TECH2':['databases','security2'].includes(c.id)?'BUS2':'ONBEKEND';}
function isProvisional(c){return c.block==='ONBEKEND';}

let sessionSecret='';
function save(){const safe={...state};delete safe.token;
  try{localStorage.setItem(KEY,JSON.stringify(safe));}catch(e){
    // No silent data loss on storage exhaustion; keep state in memory and show warning.
    console.error('iPhone lokale opslag vol',e);state.syncMessage='Opslag bijna vol. Nieuwe wijzigingen mogelijk niet bewaard; maak ruimte of verwijder offline studienotities.';
  }
}
save();
function esc(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function courseTitle(id){return state.courses.find(c=>c.id===id)?.title||'Algemeen';}
function label(status){return {open:'Te doen',bezig:'Bezig',afgerond:'Afgerond',onbekend:'Nog controleren'}[status]||status;}
function shownTask(t){return {...t,workStatus:state.changed[t.id]?.newStatus||t.workStatus};}
function allTasks(){return [...state.tasks,...state.localTasks].map(shownTask);}
function due(s){if(!s)return 'Geen bevestigde datum'; const d=new Date(s);return isNaN(d)?'Datum onbekend':d.toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'});}
function badge(t){let c=state.changed[t.id];if(c)return `<span class="status ${c.status==='conflict'?'failed':'pending'}">${c.status==='conflict'?'Conflict':c.status==='queued'?'Wacht op Windows':'Offline wijziging'}</span>`;if(t.id.startsWith('local-'))return '<span class="status">Alleen iPhone</span>';if(t.workStatus==='afgerond')return '<span class="status done">Afgerond</span>';return '';}
function taskHtml(task){const t=shownTask(task);return `<button class="task ${t.workStatus==='afgerond'?'done':''}" data-task="${esc(t.id)}" ${state.changed[t.id]?.status==='queued'?'disabled':''}><span class="tick">${t.workStatus==='afgerond'?'✓':''}</span><span class="task-text"><span class="task-label">${esc(t.title)}</span><span class="task-sub">${esc(courseTitle(t.courseId))} · ${esc(due(t.due))}${t.priority==='hoog'?' · Hoge prioriteit':''}</span>${badge(t)}</span><span class="task-side">›</span></button>`;}
function taskPanel(title,tasks){return `<h2 class="section">${esc(title)} (${tasks.length})</h2>${tasks.map(taskHtml).join('')||'<p class="muted">Geen taken gevonden.</p>'}`;}
function sortTasks(ts){return [...ts].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||(a.priority==='hoog'?-1:0)-(b.priority==='hoog'?-1:0));}
function activeFilterLabel(){return state.courseFilter?courseTitle(state.courseFilter):'Alle vakken';}
function render(){
  const tab=state.tab;
  document.getElementById('screen-title').textContent=({today:'Vandaag',courses:'Mijn vakken',course:'Vakoverzicht',note:'Studienotitie',planning:'Planning',coach:'Studiehulp',search:'Zoeken',sync:'Synchroniseren'})[tab];
  document.getElementById('connection-indicator').textContent=state.synced?`Lokaal opgeslagen · laatste verbinding: ${state.lastSync||'onbekend'}`:'Voorbeeldgegevens · niet gekoppeld aan Windows';
  document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.tab===tab||(b.dataset.tab==='courses'&&['course','note'].includes(tab));b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');});
  const root=document.getElementById('screen');
  if(tab==='today'){
    const tasks=allTasks().filter(t=>!state.courseFilter||t.courseId===state.courseFilter);const active=sortTasks(tasks.filter(t=>t.workStatus!=='afgerond'));
    root.innerHTML=`<section class="hero"><span class="eyebrow">STUDIEOVERZICHT</span><h2>${state.synced?'Je echte Windows-taken':'Proefmodus'}</h2><p>${state.synced?'Vink een taak af. De wijziging wordt lokaal bewaard en bij wifi-sync naar Windows gestuurd.':'Koppel je Windows-app onder Sync. De huidige taken zijn fictieve voorbeelden.'}</p></section><div class="stats"><div class="stat"><span class="big">${active.length}</span><span class="sub">Niet afgerond</span></div><div class="stat"><span class="big">${tasks.filter(t=>t.workStatus==='afgerond').length}</span><span class="sub">Afgerond werk</span></div></div><div class="filter-line"><span>${esc(activeFilterLabel())}</span>${state.courseFilter?'<button type="button" id="clear-filter">Alle vakken tonen</button>':''}</div>${taskPanel('Mijn taken',active)}<section class="panel"><h2 class="panel-title">Snel een persoonlijke taak</h2><p class="panel-detail">Nieuwe taken zijn voorlopig alleen op deze iPhone opgeslagen, niet op Windows of Brightspace.</p><form id="quick-form" class="quickadd"><input id="quick-title" maxlength="120" autocomplete="off" placeholder="Nieuwe persoonlijke taak" required/><button aria-label="Taak toevoegen">+</button></form></section>`;
  }else if(tab==='courses'){
    root.innerHTML=`<p class="muted">Al je bekende vakken op één plek. De indeling van de vier vervolgvakken is voorlopig totdat je school die bevestigt.</p>${['TECH1','BUS1','CHAL1','TECH2','BUS2','CHAL2','ONBEKEND'].map(block=>{const cs=state.courses.filter(c=>uiBlock(c)===block);return cs.length?`<h2 class="group-title">${block}${['TECH2','BUS2'].includes(block)?' · volgende periode':''}</h2>${cs.map(c=>`<button class="course course-link" data-course="${esc(c.id)}"><span>${esc(c.title)}<br><small>${isProvisional(c)?'Voorlopig getoond onder '+esc(block)+' · nog te verifiëren':c.status==='komend'?'Komend':c.catalogueFallback?'Aangevuld uit vakcatalogus':'Actief · bron controleren'}</small></span><span class="chip">${allTasks().filter(t=>t.courseId===c.id&&t.workStatus!=='afgerond').length} taken ›</span></button>`).join('')}`:'';}).join('')}`;
  }else if(tab==='course'){
    const c=state.courses.find(x=>x.id===state.selectedCourse);
    if(!c){state.tab='courses';render();return;}
    const tasks=sortTasks(allTasks().filter(t=>t.courseId===c.id));
    const notes=state.notes.filter(n=>n.courseId===c.id);
    const goals=state.objectives.filter(o=>o.courseId===c.id);
    const rubrics=state.rubrics.filter(r=>r.courseId===c.id);
    root.innerHTML=`<button class="back-link" id="back-courses" type="button">← Alle vakken</button><section class="hero"><span class="eyebrow">${esc(uiBlock(c))}${isProvisional(c)?' · VOORLOPIGE INDELING':''}</span><h2>${esc(c.title)}</h2><p>${esc(c.description||'')}${c.catalogueFallback?' · Aangevuld vanuit de vakcatalogus; controleer de gegevens op Windows.':''}</p></section>${taskPanel('Taken',tasks)}<h2 class="section">Leerdoelen (${goals.length})</h2>${goals.map(g=>`<div class="panel"><strong>${esc(g.title)}</strong><p class="panel-detail">Eigen status: ${esc(g.stage||'Niet vastgesteld')} · bron ${esc(g.source||'N')}</p></div>`).join('')||'<p class="muted">Geen gesynchroniseerde leerdoelen.</p>'}<h2 class="section">Rubrics (${rubrics.length})</h2>${rubrics.map(r=>`<div class="panel"><strong>${esc(r.title)}</strong><p class="panel-detail">Zelfcontrole: ${esc(r.status||'Onbekend')} · bron ${esc(r.source||'N')}</p></div>`).join('')||'<p class="muted">Geen gesynchroniseerde rubriccriteria.</p>'}<h2 class="section">Studienotities (${notes.length})</h2>${notes.map(n=>`<button class="course course-link" data-note="${esc(n.id)}"><span>${esc(n.title)}<br><small>${esc(n.source||'N')} · ${esc(n.reviewState||'bron controleren')}${n.truncated?' · ingekort':''}</small></span><span>›</span></button>`).join('')||'<p class="muted">Geen offline notities op de iPhone. Via Sync kun je het delen van privénotities bewust inschakelen.</p>'}`;
  }else if(tab==='note'){
    const n=state.notes.find(x=>x.id===state.selectedNote);
    root.innerHTML=n?`<button class="back-link" id="back-course" type="button">← Terug naar vak</button><div class="panel"><h2>${esc(n.title)}</h2><p class="panel-detail">Bron ${esc(n.source||'N')} · ${esc(n.reviewState||'te_controleren')}${n.truncated?' · preview ingekort':''}</p><pre class="note-body">${esc(n.markdown||'')}</pre></div>`:'<p class="muted">Notitie niet gevonden.</p>';
  }else if(tab==='coach'){
    const todo=sortTasks(allTasks().filter(t=>t.workStatus!=='afgerond'));
    const dated=todo.filter(t=>t.due&&new Date(t.due).getTime()>=Date.now()).slice(0,3);
    const struggling=state.objectives.filter(o=>['onbekend','besproken','geoefend'].includes(o.stage)).slice(0,5);
    const top=dated.length?dated:todo.slice(0,3);
    root.innerHTML=`<section class="hero"><span class="eyebrow">GRATIS · OFFLINE</span><h2>Studiehulp</h2><p>Persoonlijke suggesties op basis van je lokale taken. Dit is een regelgebaseerde coach, nog geen generatief AI-model.</p></section><h2 class="section">Focus voor je volgende studiesessie</h2>${top.map((t,i)=>`<div class="panel"><div class="row"><div><strong>${i+1}. ${esc(t.title)}</strong><p class="panel-detail">${esc(courseTitle(t.courseId))} · ${esc(due(t.due))}</p></div><span class="chip">${esc(label(t.workStatus))}</span></div></div>`).join('')||'<p class="muted">Geen openstaande taken. Voeg zelf een taak toe onder Vandaag.</p>'}<h2 class="section">Leerdoelen om te herhalen</h2>${struggling.map(g=>`<div class="panel"><strong>${esc(g.title)}</strong><p class="panel-detail">${esc(courseTitle(g.courseId))} · ${esc(g.stage||'Onbekend')}</p></div>`).join('')||'<p class="muted">Nog geen leerdoelen offline beschikbaar.</p>'}<div class="panel"><h2 class="panel-title">Kopieer een studievraag naar ChatGPT</h2><p class="panel-detail">De app verstuurt nooit automatisch je gegevens naar ChatGPT.</p><textarea id="coach-prompt" rows="5" readonly>${esc('Ik studeer HBO-ICT. Help mij stap voor stap met dit onderwerp: '+(top[0]?.title||'mijn leerdoelen')+'. Stel mij eerst één controlevraag en geef geen volledige eindoplossing. Gebruik geen onbevestigde deadlines of cijfers.')}</textarea><button id="copy-coach" class="action" type="button">Kopieer studievraag</button><p id="copy-message" class="subtle"></p></div><div class="panel"><h2 class="panel-title">Vraag het lokale AI-model op je Windows-laptop</h2><p class="panel-detail">Optioneel. Werkt alleen op dezelfde wifi met Ollama en START_WIFI_BRUG_MET_AI.cmd of START_WIFI_BRUG_VOLLEDIG.cmd. Zonder verbinding blijft de offline studiehulp beschikbaar.</p><form id="ai-form"><textarea id="ai-input" maxlength="2000" rows="3" placeholder="Typ je vraag…" required>${esc(state.aiQuestion||'')}</textarea><button type="submit" class="action">Vraag lokale AI</button></form><p class="subtle" id="ai-status">${esc(state.aiStatus||'')}</p>${state.aiResponse?`<pre class="note-body">${esc(state.aiResponse)}</pre><button class="action secondary" id="clear-ai">Wis AI-antwoord</button>`:''}</div>`;
  }else if(tab==='planning'){
    const events=[...state.events].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    const now=new Date();now.setHours(0,0,0,0);const end=new Date(now);end.setDate(end.getDate()+7);
    const upcoming=sortTasks(allTasks().filter(t=>t.workStatus!=='afgerond'&&t.due&&new Date(t.due)>=now&&new Date(t.due)<end));
    root.innerHTML=`<p class="muted">Alleen data die op Windows bekend zijn. Controleer roosterwijzigingen en deadlines bij de school.</p>${taskPanel('Taken binnen 7 dagen',upcoming)}<h2 class="section">Toetsen en afspraken (${events.length})</h2>${events.map(e=>`<div class="panel"><div class="row"><div><strong>${esc(e.title)}</strong><p class="panel-detail">${esc(courseTitle(e.courseId))} · ${esc(e.kind||'Afspraak')}</p></div><span class="chip">${esc(due(e.date))}</span></div></div>`).join('')||'<p class="muted">Nog geen afspraken ontvangen.</p>'}`;
  }else if(tab==='search'){
    root.innerHTML=`<p class="muted">Zoek offline in de taken, vaknamen en toetsafspraken die op deze iPhone staan. Privénotities zijn alleen doorzoekbaar als je ze bewust hebt gesynchroniseerd.</p><form id="search-form" class="search-form"><input id="search-input" type="search" maxlength="100" placeholder="Zoek taak, vak of toets…" autocomplete="off" required><button class="action" type="submit">Zoeken</button></form><div id="search-results"></div>`;
  }else if(tab==='sync'){
    const changes=Object.values(state.changed);
    root.innerHTML=`<div class="panel"><h2 class="panel-title">Verbind met je Windows-laptop</h2><p class="panel-detail">Start eerst START_WIFI_BRUG.cmd op Windows. Je telefoon en laptop moeten verbonden zijn met dezelfde eigen privéwifi.</p><form id="sync-form"><label class="field">Windows-adres (zoals getoond in het CMD-venster)<input id="endpoint" type="url" value="${esc(state.endpoint)}" placeholder="http://192.168.1.5:8765" autocapitalize="off" required></label><label class="field">Tijdelijke sessiesleutel (32 tekens, niet bewaard)<input id="token" type="password" value="${esc(sessionSecret)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Sleutel uit Windows-venster" required></label><label class="privacy-choice"><input id="include-study" type="checkbox" ${state.includeStudy?'checked':''}><span>Ook privé-studienotities, leerdoelen en geheugen ophalen (alleen als je op Windows bewust de daarvoor bedoelde brug gestart hebt)</span></label><button class="action" id="sync-btn" type="submit">↻ Nu synchroniseren</button></form><p class="subtle">${esc(state.syncMessage)}</p></div><div class="panel"><h2 class="panel-title">Mobiele wijzigingen</h2><p class="panel-detail">${changes.length} wijziging(en) opgeslagen op deze iPhone. Na versturen moet Windows de werkstatus nog bevestigen.</p>${changes.map(c=>`<div class="course"><span>${esc(state.tasks.find(t=>t.id===c.taskId)?.title||c.taskId)}<br><small>${esc(c.status==='queued'?'Wacht op Windows':c.status==='conflict'?'Conflict: controleer op Windows':'Lokaal opgeslagen')}</small></span><button class="clear-change" data-discard="${esc(c.taskId)}" type="button">Verwijder voorstel</button></div>`).join('')}</div><div class="notice">v5.0 versleutelt de berichtinhoud met AES-GCM. Het lokale HTTP-adres en de hoeveelheid verkeer zijn nog zichtbaar. Gebruik uitsluitend je eigen privéwifi. De sessiesleutel wordt niet opgeslagen. Privénotities blijven na synchronisatie lokaal op de iPhone staan totdat je ze hieronder verwijdert.</div><button id="clear-study" class="action secondary" type="button">Wis offline privénotities van iPhone</button>`;
  }
  root.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.task)));
  root.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>{state.selectedCourse=b.dataset.course;state.courseFilter=b.dataset.course;state.tab='course';save();render();}));
  root.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{state.selectedNote=b.dataset.note;state.tab='note';save();render();}));
  root.querySelector('#back-course')?.addEventListener('click',()=>{state.tab='course';save();render();});
  root.querySelector('#back-courses')?.addEventListener('click',()=>{state.tab='courses';save();render();});
  root.querySelector('#copy-coach')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(root.querySelector('#coach-prompt').value);root.querySelector('#copy-message').textContent='Gekopieerd. Je kunt dit zelf in ChatGPT plakken.';}catch{root.querySelector('#coach-prompt').select();root.querySelector('#copy-message').textContent='Selecteer en kopieer de tekst hierboven.';}});
  root.querySelector('#ai-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const q=root.querySelector('#ai-input').value.trim();if(!q)return;
    state.aiQuestion=q;state.aiStatus='Beveiligd lokaal model benaderen…';state.aiResponse='';save();render();
    try{
      if(!isPrivateEndpoint(state.endpoint)||!/^[a-f0-9]{32}$/.test(sessionSecret))throw Error('Open eerst Sync (↻ bovenaan) en voer het wifi-adres en de sessiesleutel in.');
      const reply=await secureRequest('ai',{question:q,course:courseTitle(state.selectedCourse)},105000);
      state.aiResponse=String(reply.answer||'').slice(0,8000);state.aiStatus='Antwoord van lokaal model. Controleer de inhoud zelf.';
    }catch(err){state.aiStatus='AI niet beschikbaar: '+String(err);}
    save();render();
  });
  root.querySelector('#clear-ai')?.addEventListener('click',()=>{state.aiResponse='';state.aiQuestion='';state.aiStatus='';save();render();});
  root.querySelector('#clear-study')?.addEventListener('click',()=>{if(!confirm('Offline studienotities, geheugen, leerdoelen en rubrics op deze iPhone wissen? Windows blijft ongewijzigd.'))return;state.notes=[];state.memories=[];state.objectives=[];state.rubrics=[];state.includeStudy=false;save();render();});
  root.querySelector('#clear-filter')?.addEventListener('click',()=>{state.courseFilter='';save();render();});
  root.querySelector('#search-form')?.addEventListener('submit',e=>{e.preventDefault();runSearch(root.querySelector('#search-input').value.trim());});
  root.querySelectorAll('[data-discard]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.discard;if(!confirm('Alleen de lokale wijziging verwijderen? Een al naar Windows verzonden voorstel blijft daar staan totdat je het op Windows afwijst.'))return;
    delete state.changed[id];save();render();
  }));
  root.querySelector('#quick-form')?.addEventListener('submit',e=>{e.preventDefault();const title=root.querySelector('#quick-title').value.trim();if(!title)return;const id='local-'+Date.now();state.localTasks.push({id,title,courseId:'',workStatus:'open',submission:'onbekend',due:'',updatedAt:new Date().toISOString()});save();render();});
  root.querySelector('#sync-form')?.addEventListener('submit',e=>{e.preventDefault();state.endpoint=root.querySelector('#endpoint').value.trim().replace(/\/+$/,'');sessionSecret=root.querySelector('#token').value.trim().toLowerCase();state.includeStudy=!!root.querySelector('#include-study')?.checked;save();void sync();});
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
// v4.0 application-level AES-GCM: no clear-text tasks/keys in HTTP bodies.
function b64(bytes){let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(result);}
function from64(s){const raw=atob(s);return Uint8Array.from(raw,ch=>ch.charCodeAt(0));}
function hexBytes(hex){return Uint8Array.from(hex.match(/../g)||[],v=>parseInt(v,16));}
async function secureRequest(op,args={},timeoutMs=12000){
  if(!globalThis.crypto?.subtle)throw new Error('Deze iPhone ondersteunt hier geen beveiligde WebCrypto-verbinding.');
  const key=await crypto.subtle.importKey('raw',hexBytes(sessionSecret),{name:'AES-GCM'},false,['encrypt','decrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const msg=new TextEncoder().encode(JSON.stringify({op,at:Date.now(),...args}));
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,msg));
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const res=await fetch(state.endpoint+'/api/v5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({iv:b64(iv),data:b64(ciphertext)}),signal:controller.signal,cache:'no-store'});
    const packet=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(packet.error||'HTTP '+res.status);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(packet.iv)},key,from64(packet.data));
    const data=JSON.parse(new TextDecoder().decode(plain));
    if(!data.ok)throw new Error(data.error||'Windows weigert het verzoek');
    return data;
  }finally{clearTimeout(timer);}
}
function runSearch(term){
  const root=document.getElementById('search-results');const needle=term.toLocaleLowerCase('nl-NL');
  if(!needle){root.textContent='Vul eerst een zoekterm in.';return;}
  const tasks=sortTasks(allTasks().filter(t=>(t.title+' '+courseTitle(t.courseId)).toLocaleLowerCase('nl-NL').includes(needle)));
  const events=state.events.filter(e=>(e.title+' '+courseTitle(e.courseId)).toLocaleLowerCase('nl-NL').includes(needle));
  const courses=state.courses.filter(c=>c.title.toLocaleLowerCase('nl-NL').includes(needle));
  const notes=state.notes.filter(n=>(n.title+' '+n.markdown).toLocaleLowerCase('nl-NL').includes(needle)).slice(0,40);
  root.innerHTML=`${taskPanel('Taken',tasks)}<h2 class="section">Studienotities (${notes.length})</h2>${notes.map(n=>`<button class="course course-link" data-note="${esc(n.id)}">${esc(n.title)} <span class="chip">${esc(courseTitle(n.courseId))} ›</span></button>`).join('')||'<p class="muted">Geen notities gevonden.</p>'}<h2 class="section">Vakken (${courses.length})</h2>${courses.map(c=>`<button class="course course-link" data-course="${esc(c.id)}">${esc(c.title)} <span class="chip">Bekijk taken ›</span></button>`).join('')||'<p class="muted">Geen vakken gevonden.</p>'}<h2 class="section">Afspraken (${events.length})</h2>${events.map(e=>`<div class="panel">${esc(e.title)} · ${esc(due(e.date))}</div>`).join('')||'<p class="muted">Geen afspraken gevonden.</p>'}`;
  root.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.task)));
  root.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>{state.selectedCourse=b.dataset.course;state.courseFilter=b.dataset.course;state.tab='course';save();render();}));
}
function isPrivateEndpoint(endpoint){
  try{const url=new URL(endpoint);const ip=url.hostname;
    const nums=ip.split('.').map(Number);
    return url.protocol==='http:' && url.port==='8765' && url.pathname==='/' && nums.length===4 && nums.every(x=>Number.isInteger(x)&&x>=0&&x<=255) && (nums[0]===10 || (nums[0]===192&&nums[1]===168) || (nums[0]===172&&nums[1]>=16&&nums[1]<=31));
  }catch{return false;}
}
async function sync(){
  if(!isPrivateEndpoint(state.endpoint)){state.syncMessage='Gebruik het privé-IP-adres en poort 8765 die de Windows-brug toont.';save();render();return;}
  if(!/^[a-f0-9]{32}$/.test(sessionSecret)){state.syncMessage='Controleer de tijdelijke sessiesleutel van Windows (32 hex tekens).';save();render();return;}
  state.syncMessage='Beveiligd verbinden met Windows…';render();
  try{
    // First fetch a valid snapshot, then send proposals; wrong keys cannot mutate data.
    const initialSnapshot=await secureRequest('snapshot');
    if(![4,5].includes(initialSnapshot.version)||!Array.isArray(initialSnapshot.tasks)||!Array.isArray(initialSnapshot.courses))throw new Error('De Windows-brug heeft een onbekend protocol');
    let sendErrors=[];
    for(const c of Object.values(state.changed))if(c.status==='offline'){
      try{
        const a=await secureRequest('proposal',{proposal:c});
        c.status=a.status==='applied'?'applied':a.status==='pending'?'queued':'conflict';
      }catch(e){if(String(e).includes('Conflict:'))c.status='conflict';else sendErrors.push(String(e));}
    }
    const queued=Object.values(state.changed).filter(c=>c.status==='queued'||c.status==='applied');
    if(queued.length){const statuses=await secureRequest('status',{ids:queued.map(c=>c.id)});
      for(const response of statuses.requests||[]){
        const c=Object.values(state.changed).find(x=>x.id===response.id);
        if(c){if(response.status==='applied')delete state.changed[c.taskId];else if(['conflict','rejected'].includes(response.status))c.status='conflict';}
      }
    }
    const snapshot=await secureRequest('snapshot');
    state.courses=completeMobileCourses(snapshot.courses);state.tasks=snapshot.tasks;state.events=snapshot.events||[];state.synced=true;
    state.lastSync=new Date().toLocaleString('nl-NL');
    if(state.includeStudy){
      try{const extra=await secureRequest('studydata');
        state.notes=extra.notes||[];state.memories=extra.memories||[];
        state.objectives=extra.objectives||[];state.rubrics=extra.rubrics||[];
      }catch(error){sendErrors.push('Privéstudiegegevens niet opgehaald: '+String(error));}
    }
    const outstanding=Object.values(state.changed).length;
    state.syncMessage=`Beveiligde synchronisatie geslaagd. ${outstanding?outstanding+' voorstel(len) wachten nog op controle of hebben een conflict.':'Geen openstaande mobiele voorstellen.'}${sendErrors.length?' Let op: '+sendErrors.join('; '):''}`;
  }catch(e){state.syncMessage='Beveiligde verbinding niet gelukt: '+String(e)+'. Je lokale wijzigingen blijven opgeslagen.';}
  save();render();
}
document.querySelector('#open-sync')?.addEventListener('click',()=>{state.tab='sync';save();render();});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.tab;save();render();}));
render();
