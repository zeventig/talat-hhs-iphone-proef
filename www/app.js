// Talat HHS v1.1.1: alleen een publieke iPhone-bouwproef met voorbeeldtaken.
// GEEN echte studiegegevens, GEEN ChatGPT-koppeling, GEEN Windows-sync.
(() => {
  'use strict';
  const key = 'talat-hhs.iphone.proef.v1';
  const examples = [
    { id: 'voorbeeld-1', title: 'Java: een while-loop oefenen', course: 'Programming 1', done: false },
    { id: 'voorbeeld-2', title: 'BPMN-diagram bekijken', course: 'BPM', done: false },
    { id: 'voorbeeld-3', title: 'FreshTrack-notities controleren', course: 'The Challenge & PD', done: false },
  ];
  const current = [
    ['TECH1', 'Programming 1', 'Computer Networks'],
    ['BUS1', 'Business Process Management', 'Security Essentials 1'],
    ['CHAL1', 'The Challenge & Professional Development'],
  ];
  const future = [
    ['TECH2 / BUS2 (indeling te controleren)', 'Programming 2', 'Embedded Systems', 'Databases', 'Security Essentials 2'],
    ['CHAL2', 'The Challenge & PD — deel 2'],
  ];
  let selectedTab = 'today';
  let tasks = readTasks();
  const screen = document.getElementById('screen');
  const title = document.getElementById('screen-title');
  const tabs = Array.from(document.querySelectorAll('.tab'));

  function readTasks() {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!Array.isArray(data)) return examples.map(x => ({...x}));
      return data.filter(x => x && typeof x.title === 'string' && typeof x.course === 'string'
        && typeof x.done === 'boolean' && typeof x.id === 'string').slice(0, 60);
    } catch { return examples.map(x => ({...x})); }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(tasks)); }
    catch (error) { console.warn('Proefopslag mislukt', error); alert('Opslaan op dit toestel is mislukt.'); }
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function appendText(parent, tag, css, text) {
    const node = el(tag, css, text); parent.append(node); return node;
  }
  function panel(h, p) {
    const node = el('article', 'panel');
    appendText(node,'h3','panel-title',h);
    appendText(node,'p','panel-detail',p);
    return node;
  }
  function groupSection(list, prefix) {
    list.forEach(([block, ...courses]) => {
      appendText(screen, 'div', 'group-title', block);
      courses.forEach(name => {
        const item = el('div', 'course' + (prefix === 'Komend' ? ' future' : ''));
        const detail = el('div');
        appendText(detail,'div','',name);
        appendText(detail,'small','',prefix);
        appendText(item,'span','chip',prefix === 'Komend' ? 'Komend' : 'Deel 1');
        item.prepend(detail);
        screen.append(item);
      });
    });
  }
  function today() {
    title.textContent = 'Vandaag';
    const completed = tasks.filter(x => x.done).length;
    const hero = el('section', 'hero');
    appendText(hero, 'div', 'eyebrow', 'SNEL EN EENVOUDIG');
    appendText(hero, 'h2', '', 'Jouw studie, één overzicht.');
    appendText(hero, 'p', '', 'Tik op een voorbeeldtaak om die af te vinken. Je oefent hiermee de mobiele bediening.');
    screen.append(hero);
    const stats = el('div','stats');
    const a = el('div','stat'); appendText(a,'span','big',`${completed}/${tasks.length}`); appendText(a,'span','sub','Voorbeeldtaken afgevinkt');
    const b = el('div','stat'); appendText(b,'span','big','€0'); appendText(b,'span','sub','Geen abonnement');
    stats.append(a,b); screen.append(stats);
    appendText(screen,'h2','section','Voorbeeldtaken');
    tasks.forEach(task => {
      const button = el('button','task'+(task.done?' done':''));
      button.type = 'button'; button.setAttribute('aria-pressed',String(task.done));
      const tick = el('span','tick', task.done ? '✓' : '');
      tick.setAttribute('aria-hidden','true');
      const content = el('span','task-text');
      appendText(content,'span','task-label',task.title);
      appendText(content,'span','task-sub',task.course+' · alleen proef');
      button.append(tick,content);
      button.addEventListener('click', () => { task.done = !task.done; save(); render(); });
      screen.append(button);
    });
    appendText(screen,'h2','section','Snel een VOORBEELD-taak toevoegen');
    const form = el('form','quickadd');
    const input = el('input'); input.type='text'; input.autocomplete='off'; input.placeholder = 'Bijvoorbeeld: Begrippen oefenen'; input.maxLength=80; input.required=true; input.setAttribute('aria-label','Naam van een voorbeeldtaak');
    const add = el('button','', '+'); add.type='submit'; add.setAttribute('aria-label','Voorbeeldtaak toevoegen');
    form.append(input,add);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const label = input.value.trim();
      if (!label || tasks.length >= 60) return;
      tasks.unshift({id:'extra-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title:label,course:'Voorbeeld',done:false});
      save(); render();
    });
    screen.append(form);
    const reset = el('button','action secondary','Alle VOORBEELD-taken terugzetten');
    reset.addEventListener('click', () => { if (confirm('Alleen de lokale voorbeeldtaken wissen en opnieuw beginnen?')) {tasks=examples.map(x=>({...x}));save();render();} });
    screen.append(reset);
  }
  function courses() {
    title.textContent = 'Vakken';
    screen.append(panel('Onderwijsblokken','De vaknamen zijn voorbeelden van de indeling. TECH2/BUS2 wordt pas definitief zodra dit officieel is bevestigd.'));
    groupSection(current,'Huidig'); groupSection(future,'Komend');
  }
  function memory() {
    title.textContent = 'Geheugen';
    screen.append(panel('Later: blijvend vakgeheugen','Dit is een schermvoorbeeld. De automatische synchronisatie met het Windows-geheugen en de 117 echte notities is nog NIET actief.'));
    screen.append(panel('Wat komt hier?','Per vak: bronnen, bevestigde studievoortgang, relevante eerdere gesprekken en open vragen. Oude gegevens worden niet automatisch actuele feiten.'));
    screen.append(panel('Privacy voorop','Deze proefapp bevat geen persoonlijke schoolgegevens. Er wordt niets naar GitHub of een AI-dienst verzonden.'));
  }
  function about() {
    title.textContent = 'Meer';
    screen.append(panel('Talat HHS · iPhone-proef v1.1.1','Doel van deze versie: bewijzen dat de GRATIS IPA via GitHub Actions en Sideloadly gebouwd en geïnstalleerd kan worden.'));
    screen.append(panel('Wat werkt in deze proef?','Voorbeeldtaken aanvinken, toevoegen, lokaal bewaren en vakken bekijken. Geen SQLite-import, geen verbinding met je Windows-versie.'));
    screen.append(panel('Belangrijk voor je echte planning','Voorbeeldtaken zijn geen officiële deadlines, resultaten of ingeleverde opdrachten.'));
    const reset = el('button','action secondary','Voorbeeldgegevens wissen');
    reset.addEventListener('click', () => { if (confirm('Lokale proefgegevens verwijderen?')) {localStorage.removeItem(key);tasks=examples.map(x=>({...x}));render();} });
    screen.append(reset);
  }
  function render() {
    screen.replaceChildren();
    if (selectedTab === 'today') today();
    else if (selectedTab === 'courses') courses();
    else if (selectedTab === 'memory') memory();
    else about();
    tabs.forEach(tab => {
      const active = tab.dataset.tab === selectedTab;
      tab.classList.toggle('active', active);
      if (active) tab.setAttribute('aria-current','page');
      else tab.removeAttribute('aria-current');
    });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => { selectedTab = tab.dataset.tab; render(); window.scrollTo({top:0,behavior:'smooth'}); }));
  render();
})();
