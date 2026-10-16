/* Cayden World: walkable 2D world with optional same-origin WebSocket multiplayer. */
(() => {
  'use strict';
  const SAVE_KEY = 'cp-cayden-world-scene-v1';
  const TREE_COLLIDERS = [[70,96,19],[128,286,18],[330,90,19],[350,435,18],[615,87,20],[625,435,18],[875,92,19],[895,300,20],[820,450,18],[40,265,17],[920,410,17]];
  const WIDTH = 960, HEIGHT = 520;
  const REGIONS = [
    { id:'bloomtown', name:'Bloomtown', emoji:'🌷', level:1, ground:'#b8dca0', path:'#f0dfb6', accent:'#e6a6b3', sky:'#eaf7ff', description:'The sunny starter plaza.', points:[
      {id:'quest-board',name:'Quest Board',icon:'📜',x:205,y:188,desc:'See your daily and weekly goals.',action:'quests',block:38},
      {id:'petal-gate',name:'Petal Town Gate',icon:'🏡',x:480,y:156,desc:'Visit your own garden town.',action:'petaltown',block:42},
      {id:'games-pavilion',name:'Games Pavilion',icon:'🎮',x:750,y:190,desc:'Choose a game or learning challenge.',action:'games',block:40}
    ]},
    { id:'science-valley', name:'Science Valley', emoji:'🧪', level:5, ground:'#b9d7b8', path:'#d9d8c6', accent:'#8fb6d8', sky:'#eaf7ff', description:'A green campus of science and discoveries.', points:[
      {id:'personal-lab',name:'Personal Science Lab',icon:'🧪',x:210,y:180,desc:'Experiment with your saved material sandbox.',action:'lab',block:44},
      {id:'biology-garden',name:'Biology Garden',icon:'🌱',x:480,y:154,desc:'Explore science questions and plant life.',action:'games',block:40},
      {id:'discovery-hall',name:'Discovery Hall',icon:'📚',x:748,y:185,desc:'Review your learning records.',action:'passport',block:42}
    ]},
    { id:'coding-city', name:'Coding City', emoji:'💻', level:10, ground:'#c0d8ba', path:'#c7c9cc', accent:'#7cb9b0', sky:'#edf7ff', description:'A friendly tech campus with puzzle labs.', points:[
      {id:'coding-academy',name:'Coding Academy',icon:'💻',x:210,y:185,desc:'Practice code, algorithms, and debugging.',action:'games',block:42},
      {id:'robot-workshop',name:'Robot Workshop',icon:'🤖',x:480,y:155,desc:'Try logic and technology challenges.',action:'games',block:42},
      {id:'digital-arcade',name:'Digital Arcade',icon:'🕹️',x:750,y:185,desc:'Open the unified Games Hub.',action:'games',block:42}
    ]},
    { id:'melody-grove', name:'Melody Grove', emoji:'🎼', level:15, ground:'#c5dfad', path:'#f0dbb7', accent:'#b49bd6', sky:'#f6f0ff', description:'A musical grove filled with studios and stages.', points:[
      {id:'music-studio',name:'Music Studio',icon:'🎹',x:205,y:185,desc:'Create and arrange music projects.',action:'instruments',block:42},
      {id:'instrument-greenhouse',name:'Instrument Greenhouse',icon:'🎻',x:480,y:155,desc:'Explore instrument voices and presets.',action:'instruments',block:42},
      {id:'concert-stage',name:'Concert Stage',icon:'🎤',x:750,y:185,desc:'Play the Vibe Garden music area.',action:'music',block:42}
    ]},
    { id:'restaurant-row', name:'Restaurant Row', emoji:'🍗', level:20, ground:'#cbd9a2', path:'#ead7b2', accent:'#e8a87b', sky:'#fff3e5', description:'A bustling row of restaurants and kitchens.', points:[
      {id:'wingeria',name:'Wingeria Rush',icon:'🍗',x:210,y:185,desc:'Take orders and build your restaurant skills.',action:'wingeria',block:42},
      {id:'recipe-market',name:'Recipe Market',icon:'🥗',x:480,y:155,desc:'Practice restaurant and food-safety quizzes.',action:'games',block:42},
      {id:'chef-board',name:'Competition Board',icon:'🏆',x:750,y:185,desc:'Browse more game challenges.',action:'games',block:42}
    ]},
    { id:'creative-coast', name:'Creative Coast', emoji:'🎨', level:25, ground:'#c1dfcb', path:'#e9d8b9', accent:'#e5a8bf', sky:'#e8f8fb', description:'A seaside neighborhood for art and making.', points:[
      {id:'art-studio',name:'Art Studio',icon:'🎨',x:210,y:185,desc:'Explore creative and art challenges.',action:'games',block:42},
      {id:'maker-pier',name:'Maker Pier',icon:'🧰',x:480,y:155,desc:'Find building, design, and puzzle activities.',action:'games',block:42},
      {id:'idea-lighthouse',name:'Idea Lighthouse',icon:'💡',x:750,y:185,desc:'Review your profile and achievements.',action:'passport',block:42}
    ]},
    { id:'logic-mountains', name:'Logic Mountains', emoji:'🧩', level:30, ground:'#b8d1bd', path:'#d9d4bf', accent:'#8e9bd1', sky:'#edf3ff', description:'A highland of logic puzzles, patterns, and strategy.', points:[{id:'pattern-peak',name:'Pattern Peak',icon:'🧩',x:210,y:185,desc:'Solve patterns and reasoning challenges.',action:'games',block:42},{id:'strategy-lodge',name:'Strategy Lodge',icon:'♟️',x:480,y:155,desc:'Practice planning and turn-based puzzles.',action:'games',block:42},{id:'riddle-bridge',name:'Riddle Bridge',icon:'🌉',x:750,y:185,desc:'Try a logic challenge before crossing.',action:'games',block:42}]},
    { id:'history-harbor', name:'History Harbor', emoji:'⚓', level:35, ground:'#c4d8c7', path:'#dfd0b1', accent:'#b78a66', sky:'#eef8ff', description:'A harbor of timelines, artifacts, and stories.', points:[{id:'archive-dock',name:'Archive Dock',icon:'📚',x:210,y:185,desc:'Explore history and source-reading games.',action:'games',block:42},{id:'timeline-tower',name:'Timeline Tower',icon:'🕰️',x:480,y:155,desc:'Put events in order and explore cause and effect.',action:'games',block:42},{id:'artifact-market',name:'Artifact Market',icon:'🏺',x:750,y:185,desc:'Learn about objects and the stories they tell.',action:'games',block:42}]},
    { id:'sports-stadium', name:'Sports Stadium District', emoji:'🏟️', level:40, ground:'#a9d49b', path:'#e8d9b6', accent:'#e4a76e', sky:'#eaf7ff', description:'A sports district for rules, teamwork, and skill challenges.', points:[{id:'stadium-field',name:'Stadium Field',icon:'⚽',x:210,y:185,desc:'Practice sports trivia and field challenges.',action:'games',block:42},{id:'training-center',name:'Training Center',icon:'🏀',x:480,y:155,desc:'Try timing, coordination, and strategy games.',action:'games',block:42},{id:'team-hall',name:'Team Hall',icon:'🏆',x:750,y:185,desc:'Review achievements and friendly competitions.',action:'passport',block:42}]},
    { id:'space-observatory', name:'Space Observatory', emoji:'🔭', level:45, ground:'#b7c8d9', path:'#d8d5df', accent:'#7f8fce', sky:'#e7eaff', description:'A stargazing hub for astronomy and space discovery.', points:[{id:'star-dome',name:'Star Dome',icon:'🌌',x:210,y:185,desc:'Explore astronomy questions and star maps.',action:'games',block:42},{id:'rocket-yard',name:'Rocket Yard',icon:'🚀',x:480,y:155,desc:'Learn about missions, orbits, and engineering.',action:'games',block:42},{id:'moon-garden',name:'Moon Garden',icon:'🌙',x:750,y:185,desc:'Collect space-themed discoveries.',action:'passport',block:42}]},
    { id:'elemental-forest', name:'Elemental Forest', emoji:'🌳', level:50, ground:'#9fc99b', path:'#e5d5ae', accent:'#a6c76e', sky:'#eaf7ef', description:'A nature-rich region for elements, ecosystems, and experiments.', points:[{id:'molecule-grove',name:'Molecule Grove',icon:'⚛️',x:210,y:185,desc:'Explore element and molecule learning activities.',action:'lab',block:42},{id:'ecosystem-clearing',name:'Ecosystem Clearing',icon:'🌿',x:480,y:155,desc:'Connect food webs, habitats, and life science.',action:'games',block:42},{id:'crystal-spring',name:'Crystal Spring',icon:'💎',x:750,y:185,desc:'Review science discoveries and research notes.',action:'passport',block:42}]},
    { id:'crystal-caverns', name:'Crystal Caverns', emoji:'💎', level:55, ground:'#b9c8d9', path:'#d6cde1', accent:'#8ec9d2', sky:'#edf5ff', description:'A sparkling cavern for geology, materials, and collection hunts.', points:[{id:'geode-hall',name:'Geode Hall',icon:'🪨',x:210,y:185,desc:'Learn about minerals and rocks.',action:'games',block:42},{id:'gem-workshop',name:'Gem Workshop',icon:'💠',x:480,y:155,desc:'Explore materials and collection activities.',action:'games',block:42},{id:'echo-chamber',name:'Echo Chamber',icon:'🔔',x:750,y:185,desc:'Try sound, pattern, and physics puzzles.',action:'games',block:42}]},
    { id:'innovation-island', name:'Innovation Island', emoji:'💡', level:60, ground:'#a8d9ce', path:'#e4d4b4', accent:'#e7c36e', sky:'#e7f8ff', description:'A late-game island for invention, engineering, and future ideas.', points:[{id:'invention-lab',name:'Invention Lab',icon:'🛠️',x:210,y:185,desc:'Combine ideas into engineering challenges.',action:'games',block:42},{id:'prototype-plaza',name:'Prototype Plaza',icon:'🤖',x:480,y:155,desc:'Test prototypes and iterate on designs.',action:'games',block:42},{id:'future-beacon',name:'Future Beacon',icon:'✨',x:750,y:185,desc:'Review your world journey and discoveries.',action:'passport',block:42}]}
  ];
  const NPCS = {
    'bloomtown': {name:'Mira Bloom', role:'Town Guide', x:390, y:382, appearance:{skinTone:'#c9875a',hairColor:'#65412d',hairStyle:'curly',shirtColor:'#e66b80',pantsColor:'#334e75'}, hello:'Welcome to Bloomtown! I help new explorers find their feet. Every big adventure starts with one small step.', region:'Bloomtown is the social heart of Cayden World. The Quest Board points you toward daily goals, and Petal Town is your first place to grow.', tip:'Walk near a landmark until its card appears, then press E or tap Interact. Use the map to travel to regions as your Passport level rises.'},
    'science-valley': {name:'Dr. Nova Reed', role:'Lab Mentor', x:390, y:382, appearance:{skinTone:'#e8b58d',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#5e83c6',pantsColor:'#5b6571'}, hello:'Hey, researcher! Science is about asking questions, testing ideas, and recording what happens.', region:'Science Valley is home to your Science Lab and Discovery Journal. Try safe classroom models and compare the results you observe.', tip:'Change one thing at a time during an experiment. Write down what you expect before testing your idea.'},
    'coding-city': {name:'Byte Parker', role:'Code Coach', x:390, y:382, appearance:{skinTone:'#8c573b',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#5b9b71',pantsColor:'#292b32'}, hello:'Hi! A bug is just a puzzle waiting for a patient detective.', region:'Coding City focuses on algorithms, debugging, logic, and technology challenges.', tip:'When code behaves strangely, reproduce the problem, inspect one step at a time, and test the smallest fix.'},
    'melody-grove': {name:'Aria Chord', role:'Music Gardener', x:390, y:382, appearance:{skinTone:'#f7d7bd',hairColor:'#b95735',hairStyle:'long',shirtColor:'#8b70b8',pantsColor:'#334e75'}, hello:'Listen closely—rhythm and melody are everywhere in Melody Grove.', region:'Melody Grove connects the Music Studio, instruments, songs, and creative sound experiments.', tip:'Start with a simple beat. Add a bass line, then a melody; save a version before trying big changes.'},
    'restaurant-row': {name:'Chef Rowan', role:'Kitchen Coach', x:390, y:382, appearance:{skinTone:'#573729',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#f2eee2',pantsColor:'#5b6571'}, hello:'Welcome to Restaurant Row! Great cooking is timing, teamwork, and learning from each order.', region:'Restaurant Row is where Wingeria Rush and food-themed challenges live.', tip:'Read the order carefully, prepare each step in sequence, and check the final plate before serving.'},
    'creative-coast': {name:'Skye Canvas', role:'Creative Guide', x:390, y:382, appearance:{skinTone:'#c9875a',hairColor:'#5c4a8c',hairStyle:'ponytail',shirtColor:'#e4b34f',pantsColor:'#4b805b'}, hello:'There are no single right answers in a creative workshop—try things and see what you discover.', region:'Creative Coast is a home for design prompts, art activities, and maker challenges.', tip:'Collect references, sketch a rough idea first, and improve it in small passes instead of waiting for perfect.'},
    'logic-mountains': {name:'Pip Pattern',role:'Puzzle Guide',x:390,y:382,appearance:{skinTone:'#f7d7bd',hairColor:'#65412d',hairStyle:'curly',shirtColor:'#8b70b8',pantsColor:'#5b6571'},hello:'Every puzzle has clues. Slow down and notice what changes—and what stays the same.',region:'Logic Mountains is all about reasoning, patterns, and strategy.',tip:'Explain your reasoning out loud. If a step does not follow, revisit the clue.'},
    'history-harbor': {name:'Captain Ellis',role:'Harbor Historian',x:390,y:382,appearance:{skinTone:'#8c573b',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#5e83c6',pantsColor:'#334e75'},hello:'Stories from the past help us understand how people lived and how change happens.',region:'History Harbor explores timelines, artifacts, and historical evidence.',tip:'Ask who created a source, when it was made, and what perspective it shows.'},
    'sports-stadium': {name:'Coach Jules',role:'Team Coach',x:390,y:382,appearance:{skinTone:'#c9875a',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#e66b80',pantsColor:'#292b32'},hello:'The best teams practice, communicate, and encourage each other.',region:'The Sports Stadium District hosts sports challenges, rules, timing, and teamwork.',tip:'Focus on safe technique, fair play, and making one skill better at a time.'},
    'space-observatory': {name:'Orbit Vega',role:'Astronomy Guide',x:390,y:382,appearance:{skinTone:'#573729',hairColor:'#5c4a8c',hairStyle:'long',shirtColor:'#35414c',pantsColor:'#334e75'},hello:'The night sky is a giant map. Every observation can lead to a new question.',region:'Space Observatory focuses on astronomy, planets, stars, and space missions.',tip:'Compare the size, distance, and orbit of objects instead of assuming they are alike.'},
    'elemental-forest': {name:'Fern Atom',role:'Nature Researcher',x:390,y:382,appearance:{skinTone:'#e8b58d',hairColor:'#65412d',hairStyle:'ponytail',shirtColor:'#4b805b',pantsColor:'#334e75'},hello:'Nature connects everything. A tiny change can affect an entire ecosystem.',region:'Elemental Forest links elements, molecules, biology, and ecosystems.',tip:'Notice inputs and outputs, then look for patterns before drawing a conclusion.'},
    'crystal-caverns': {name:'Gem Quartz',role:'Cavern Guide',x:390,y:382,appearance:{skinTone:'#f7d7bd',hairColor:'#b95735',hairStyle:'short',shirtColor:'#5e83c6',pantsColor:'#5b6571'},hello:'Crystals tell stories about the conditions in which they formed.',region:'Crystal Caverns explores minerals, materials, geology, and sound puzzles.',tip:'Compare properties such as hardness, luster, and crystal shape when identifying minerals.'},
    'innovation-island': {name:'Indy Sparks',role:'Inventor',x:390,y:382,appearance:{skinTone:'#8c573b',hairColor:'#d6a23d',hairStyle:'curly',shirtColor:'#e4b34f',pantsColor:'#292b32'},hello:'Inventors make prototypes, test them, and learn from what does not work yet.',region:'Innovation Island is the future-focused region for engineering and invention challenges.',tip:'Build the smallest testable version first, then improve it using evidence.'}
  };
  const STARTER_INVENTORY = [
    {id:'daisy-seeds',name:'Daisy Seed Packet',icon:'🌼',qty:3},
    {id:'field-notes',name:'Field Notes',icon:'📒',qty:1},
    {id:'water-can',name:'Tiny Watering Can',icon:'💧',qty:1}
  ];
  const clamp = (n,min,max) => Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):min));
  const text = value => String(value == null ? '' : value).replace(/[<>\u0000-\u001f]/g,'').trim();
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function blankSave() { return {version:1,region:'bloomtown',x:480,y:365,visited:['bloomtown'],inventory:STARTER_INVENTORY.map(item=>({...item})),lastInteraction:'',steps:0}; }
  function normalizeSave(value) {
    const base=blankSave(), x=value && typeof value==='object' && !Array.isArray(value)?value:{};
    const regionIds=new Set(REGIONS.map(r=>r.id));
    const inventory=Array.isArray(x.inventory)?x.inventory.slice(0,40).map(item=>({id:text(item?.id).slice(0,40),name:text(item?.name).slice(0,48),icon:text(item?.icon).slice(0,8)||'📦',qty:clamp(Math.floor(Number(item?.qty)||0),0,999)})).filter(item=>item.id&&item.name):base.inventory;
    const visited=Array.isArray(x.visited)?[...new Set(x.visited.filter(id=>regionIds.has(id)))]:base.visited;
    const region=regionIds.has(x.region)?x.region:base.region;
    if(!visited.includes(region))visited.push(region);
    return {version:1,region,x:x.x==null?base.x:clamp(x.x,22,WIDTH-22),y:x.y==null?base.y:clamp(x.y,22,HEIGHT-22),visited,inventory,lastInteraction:text(x.lastInteraction).slice(0,120),steps:clamp(Math.floor(Number(x.steps)||0),0,99999999)};
  }
  function getPassportLevel(storage = globalThis.localStorage) {
    try { const value=JSON.parse(storage?.getItem('cp-garden-profile')||'{}'); return Math.floor(clamp(value.xp||0,0,999999999)/100)+1; } catch (_) { return 1; }
  }
  function canEnterRegion(regionId, level) { const region=REGIONS.find(item=>item.id===regionId); return !!region && clamp(level,1,999999)>=region.level; }
  function moveVector(position, vector, dt, sprint=false) {
    const x=Number(position?.x)||0, y=Number(position?.y)||0;
    let vx=clamp(vector?.x,-1,1), vy=clamp(vector?.y,-1,1); const length=Math.hypot(vx,vy);
    if(length>1){vx/=length;vy/=length;}
    const speed=sprint?245:150, seconds=clamp(dt,0,0.05);
    return {x:clamp(x+vx*speed*seconds,22,WIDTH-22),y:clamp(y+vy*speed*seconds,22,HEIGHT-22)};
  }
  function readSave() { try { return normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null')); } catch (_) { return blankSave(); } }
  let save=readSave(), runtime=null;
  function writeSave() { try { localStorage.setItem(SAVE_KEY,JSON.stringify(save));const label=runtime?.root?.querySelector?.('#cw-world-save-state');if(label)label.textContent='Saved on this device';return true; } catch (_) { const label=runtime?.root?.querySelector?.('#cw-world-save-state');if(label)label.textContent='Browser storage unavailable';return false; } }
  function getCharacter() { try { return window.CaydenRPGWorld?.getState?.()?.character || {name:'Petal Pal',avatar:'🌼',title:'New Sprout'}; } catch (_) { return {name:'Petal Pal',avatar:'🌼',title:'New Sprout'}; } }
  function profile() { try { return window.CaydenRPGWorld?.getState?.() || {coins:0,gems:0,researchPoints:0}; } catch (_) { return {coins:0,gems:0,researchPoints:0}; } }
  function timeLabel() { const hour=new Date().getHours(),part=hour<6?'Starlight':hour<11?'Morning bloom':hour<16?'Sunny afternoon':hour<20?'Golden hour':'Twilight'; return `🌤️ Fair weather · ${part}`; }
  function renderShell() {
    return `<section class="cw-world-shell" aria-label="Walkable Cayden World">
      <div class="cw-world-heading"><div><div class="eyebrow">🌍 CAYDEN WORLD · PLAYABLE PREVIEW</div><h2>Walk into your world.</h2><p>Explore the paths, visit landmarks, and travel between regions as your Passport level grows.</p></div><span class="cw-local-badge">💾 Local save · 🌐 Online rooms</span></div>
      <div class="cw-hud"><div class="cw-hud-player"><span class="cw-avatar" id="cw-avatar">🌼</span><div class="cw-hud-player-text"><strong id="cw-player-name">Petal Pal</strong><span id="cw-player-level">Level 1 · New Sprout</span><div class="cw-hud-xp"><i id="cw-xp-fill"></i></div><small id="cw-xp-text">0/100 XP</small></div></div><div class="cw-hud-location"><small>YOU ARE IN</small><strong id="cw-region-name">🌷 Bloomtown</strong><span id="cw-time-label">Morning bloom</span></div><div class="cw-hud-wallet"><span>🪙 <b id="cw-coins">150</b></span><span>💎 <b id="cw-gems">0</b></span><span>🔬 <b id="cw-research">0</b></span></div><div class="cw-hud-actions"><button type="button" class="cw-small-btn" data-cw-action="map" aria-expanded="false">🗺️ Map</button><button type="button" class="cw-small-btn" data-cw-action="inventory" aria-expanded="false">🎒 Bag</button></div></div>
      <div class="cw-multiplayer-bar" aria-label="Multiplayer controls"><div class="cw-mp-status-wrap"><span class="cw-mp-indicator" id="cw-mp-indicator" aria-hidden="true"></span><div><strong id="cw-mp-status">Multiplayer disconnected</strong><small id="cw-mp-count">Create a room or enter a friend’s code</small></div></div><div class="cw-mp-room-controls"><label for="cw-mp-room-code">Room code <input id="cw-mp-room-code" maxlength="6" autocomplete="off" spellcheck="false" placeholder="Leave blank to create"></label><div class="cw-mp-buttons"><button type="button" class="cw-small-btn" id="cw-mp-new-room">New room</button><button type="button" class="cw-small-btn" id="cw-mp-copy-room">Copy code</button><button type="button" class="cw-small-btn" id="cw-mp-connect">🌐 Connect</button><button type="button" class="cw-small-btn" id="cw-mp-disconnect" disabled>Disconnect</button></div></div><div class="cw-mp-emotes" aria-label="Quick emotes"><button type="button" data-cw-emote="wave" title="Wave">👋</button><button type="button" data-cw-emote="heart" title="Send a heart">💗</button><button type="button" data-cw-emote="flower" title="Send a flower">🌻</button><button type="button" data-cw-emote="celebrate" title="Celebrate">🎉</button><button type="button" data-cw-emote="nice-garden" title="Nice garden">💬</button></div></div>
      <div class="cw-game-frame"><canvas id="cw-world-canvas" width="960" height="520" tabindex="0" role="application" aria-label="Walkable top-down world. Use W A S D or arrow keys to move, Shift to sprint, Space to jump, and E to interact." aria-describedby="cw-keyboard-help"></canvas>
        <div class="cw-world-sparkle" aria-hidden="true">✦</div>
        <div class="cw-status-toast" id="cw-status-toast" role="status" aria-live="polite">Welcome to Bloomtown! Walk up to a landmark and press E to interact.</div>
        <div class="cw-nearby-card" id="cw-nearby-card" hidden><div class="cw-nearby-icon" id="cw-nearby-icon">📜</div><div class="cw-nearby-text"><strong id="cw-nearby-title">Quest Board</strong><p id="cw-nearby-desc">Find a local activity.</p></div><button type="button" class="cw-primary-btn" id="cw-nearby-visit">Visit →</button></div>
        <section class="cw-overlay cw-dialogue-panel" id="cw-dialogue-panel" aria-label="Character dialogue" hidden><div class="cw-overlay-head"><div><small id="cw-dialogue-role">WORLD CHARACTER</small><h3 id="cw-dialogue-name">Mira Bloom</h3></div><button type="button" class="cw-close-btn" data-cw-dialog-choice="goodbye" aria-label="Close dialogue">×</button></div><p id="cw-dialogue-text" class="cw-dialogue-text"></p><div class="cw-dialogue-choices"><button type="button" class="cw-small-btn" data-cw-dialog-choice="region">Tell me about this place</button><button type="button" class="cw-small-btn" data-cw-dialog-choice="tip">Give me a tip</button><button type="button" class="cw-small-btn" data-cw-dialog-choice="quest">Show me a quest</button><button type="button" class="cw-small-btn" data-cw-dialog-choice="goodbye">Goodbye</button></div></section>
        <section class="cw-overlay cw-map-panel" id="cw-map-panel" aria-label="World map" hidden><div class="cw-overlay-head"><div><small>FAST TRAVEL</small><h3>Explore the regions</h3></div><button type="button" class="cw-close-btn" data-cw-action="close-overlays" aria-label="Close map">×</button></div><div class="cw-region-list" id="cw-region-list"></div><p class="cw-overlay-note">Region requirements follow your real Garden Passport level. Locked destinations show their required level.</p></section>
        <section class="cw-overlay cw-inventory-panel" id="cw-inventory-panel" aria-label="Pocket inventory" hidden><div class="cw-overlay-head"><div><small>YOUR POCKETS</small><h3>Explorer inventory</h3></div><button type="button" class="cw-close-btn" data-cw-action="close-overlays" aria-label="Close inventory">×</button></div><div class="cw-inventory-grid" id="cw-inventory-grid"></div><p class="cw-overlay-note">Starter items are a local world-preview inventory. They are separate from the Science Lab and Petal Town resources.</p></section>
      </div>
      <div class="cw-controls-row"><div class="cw-keyboard-help" id="cw-keyboard-help"><strong>⌨️ Desktop controls</strong><span><kbd>W A S D</kbd> / <kbd>↑ ← ↓ →</kbd> Move</span><span><kbd>Shift</kbd> Sprint</span><span><kbd>Space</kbd> Jump</span><span><kbd>E</kbd> Interact</span><span><kbd>M</kbd> Map</span><span><kbd>I</kbd> Inventory</span></div><div class="cw-action-buttons"><button type="button" class="cw-action-btn" data-cw-action="interact">✋ Interact <kbd>E</kbd></button><button type="button" class="cw-action-btn" data-cw-action="jump">⬆️ Jump <kbd>Space</kbd></button></div></div>
      <div class="cw-mobile-controls"><div class="cw-joystick-wrap"><span>MOVE</span><div class="cw-joystick" id="cw-joystick" aria-label="Movement joystick"><div class="cw-joystick-nub" id="cw-joystick-nub"></div></div></div><div class="cw-mobile-actions"><button type="button" data-cw-action="interact">✋<span>Interact</span></button><button type="button" data-cw-action="jump">⬆️<span>Jump</span></button><button type="button" data-cw-action="inventory">🎒<span>Bag</span></button><button type="button" data-cw-action="map">🗺️<span>Map</span></button></div></div>
      <div class="cw-world-footer"><span>Visited <strong id="cw-visited-count">1 / 6</strong> regions</span><span>Steps walked <strong id="cw-step-count">0</strong></span><span id="cw-world-save-state">Saved on this device</span></div>
    </section>`;
  }
  function setSelectedRegion(regionId) { try { window.CaydenRPGWorld?.selectRegion?.(regionId); } catch (_) {} }
  function mount(root) {
    if(!root) return;
    destroy();
    root.innerHTML=renderShell();
    save=readSave();
    const canvas=root.querySelector('#cw-world-canvas'), ctx=canvas?.getContext?.('2d');
    if(!canvas||!ctx){const msg=root.querySelector('#cw-status-toast');if(msg)msg.textContent='This browser could not start the 2D canvas. Try a recent version of Edge or Chrome.';return;}
    const keys=new Set();
    const runtimeState={root,canvas,ctx,keys,raf:0,lastFrame:0,lastSaved:0,jumpUntil:0,nearbyId:'',joystick:{x:0,y:0,active:false,pointer:null},mapOpen:false,inventoryOpen:false,toastTimer:0,destroyed:false,walkRemainder:0,character:getCharacter(),socket:null,players:new Map(),selfId:'',mpLastSent:0,mpLastX:-999,mpLastY:-999,mpLastRegion:'',mpManualClose:false};
    runtime=runtimeState;
    if(!canEnterRegion(save.region,getPassportLevel())) {save.region='bloomtown';save.x=480;save.y=365;}
    if(!save.visited.includes(save.region))save.visited.push(save.region);
    setSelectedRegion(save.region);
    renderRegionList(); renderInventory(); refreshHud(); writeSave();
    function resize() {
      const rect=canvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
      const cssW=Math.max(320,rect.width||960), cssH=cssW*HEIGHT/WIDTH;
      canvas.style.height=`${cssH}px`; canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);
      ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);
    }
    resize();
    const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>resize()):null;
    resizeObserver?.observe(canvas);
    runtimeState.resizeObserver=resizeObserver;
    function getRegion(){return REGIONS.find(r=>r.id===save.region)||REGIONS[0];}
    function status(message,ms=2600) { const node=root.querySelector('#cw-status-toast');if(node)node.textContent=message;clearTimeout(runtimeState.toastTimer);runtimeState.toastTimer=setTimeout(()=>{const n=root.querySelector('#cw-status-toast');if(n)n.textContent=`${getRegion().emoji} ${getRegion().name} · Find a landmark and press E to interact.`;},ms); }
    function setMpStatus(label, detail, connected=false) { const a=root.querySelector('#cw-mp-status'),b=root.querySelector('#cw-mp-count'),dot=root.querySelector('#cw-mp-indicator'),connect=root.querySelector('#cw-mp-connect'),disconnect=root.querySelector('#cw-mp-disconnect');if(a)a.textContent=label;if(b)b.textContent=detail;if(dot)dot.classList.toggle('is-online',connected);if(connect)connect.disabled=connected;if(disconnect)disconnect.disabled=!connected; }
    function mpSend(payload) { const ws=runtimeState.socket;if(ws&&ws.readyState===WebSocket.OPEN){try{ws.send(JSON.stringify(payload));return true;}catch(_){}}return false; }
    function updatePlayerCount() { const count=runtimeState.players.size+(runtimeState.selfId?1:0);const detail=runtimeState.selfId?`Room ${runtimeState.roomCode||''} · ${count} player${count===1?'':'s'} in ${getRegion().name}`:'Create a room or enter a friend’s code';const node=root.querySelector('#cw-mp-count');if(node)node.textContent=detail; }
    function connectMultiplayer() {
      if(runtimeState.socket&&(runtimeState.socket.readyState===WebSocket.OPEN||runtimeState.socket.readyState===WebSocket.CONNECTING))return;
      if(!('WebSocket' in window)){setMpStatus('Multiplayer unavailable','This browser does not support WebSocket.');return;}
      runtimeState.mpManualClose=false;setMpStatus('Connecting…','Creating or joining a private room…');
      const scheme=location.protocol==='https:'?'wss:':'ws:';let ws;
      try{ws=new WebSocket(`${scheme}//${location.host}/ws/world`);}catch(_){setMpStatus('Could not connect','Open Cayden World through its server URL.');return;}
      runtimeState.socket=ws;
      ws.addEventListener('open',()=>{const ch=getCharacter(),code=(root.querySelector('#cw-mp-room-code')?.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);mpSend({type:'join',name:ch.name||'Garden Guest',avatar:'🧑',appearance:ch.appearance||{},roomCode:code,region:save.region,x:save.x,y:save.y});setMpStatus('Connected · joining room','Waiting for room state…',true);});
      ws.addEventListener('message',event=>{let msg;try{msg=JSON.parse(event.data);}catch(_){return;}
        if(msg.type==='welcome'){runtimeState.selfId=msg.selfId||'';const codeInput=root.querySelector('#cw-mp-room-code');if(codeInput)codeInput.value=msg.roomCode||'';runtimeState.roomCode=msg.roomCode||'';runtimeState.players.clear();(msg.players||[]).forEach(p=>{if(p&&p.id!==runtimeState.selfId)runtimeState.players.set(p.id,{...p,emoteUntil:0});});setMpStatus('Private room online',`Code ${msg.roomCode||''} · ${(msg.count||1)} player${(msg.count||1)===1?'':'s'} in ${getRegion().name}`,true);updatePlayerCount();status('🌐 You joined the online world. Other players in this region can see you!',3500);}
        else if(msg.type==='player-joined'&&msg.player){runtimeState.players.set(msg.player.id,{...msg.player,emoteUntil:0});updatePlayerCount();status(`${msg.player.avatar||'🌼'} ${msg.player.name||'A player'} joined this region.`,2200);}
        else if(msg.type==='player-left'){runtimeState.players.delete(msg.id);updatePlayerCount();}
        else if(msg.type==='player-state'&&msg.player&&msg.player.id!==runtimeState.selfId){const old=runtimeState.players.get(msg.player.id)||{};runtimeState.players.set(msg.player.id,{...old,...msg.player});}
        else if(msg.type==='player-emote'){const player=runtimeState.players.get(msg.id);if(player){player.emote=msg.emote;player.emoteText=msg.text;player.emoteUntil=performance.now()+2200;}}
        else if(msg.type==='error'){status(msg.message||'Multiplayer message rejected.',2800);}
      });
      ws.addEventListener('close',()=>{if(runtimeState.socket===ws){runtimeState.socket=null;runtimeState.selfId='';runtimeState.players.clear();setMpStatus('Multiplayer disconnected','Create a room or enter a friend’s code');updatePlayerCount();if(!runtimeState.mpManualClose&&!runtimeState.destroyed)status('Connection closed. Your local world is still saved on this device.',3000);}});
      ws.addEventListener('error',()=>{setMpStatus('Connection failed','Use the hosted server URL; local file mode cannot connect.');});
    }
    function disconnectMultiplayer(){runtimeState.mpManualClose=true;const ws=runtimeState.socket;runtimeState.socket=null;runtimeState.selfId='';runtimeState.players.clear();if(ws){try{ws.close(1000,'Player disconnected');}catch(_){}}setMpStatus('Multiplayer disconnected','Create a room or enter a friend’s code');updatePlayerCount();status('You are back in solo mode. Your local save is safe.',2400);}
    function sendMultiplayerMove(now){if(!runtimeState.selfId||now-runtimeState.mpLastSent<95)return;const moved=Math.hypot(save.x-runtimeState.mpLastX,save.y-runtimeState.mpLastY)>2||save.region!==runtimeState.mpLastRegion;if(!moved)return;if(mpSend({type:'move',region:save.region,x:Math.round(save.x),y:Math.round(save.y)})){runtimeState.mpLastSent=now;runtimeState.mpLastX=save.x;runtimeState.mpLastY=save.y;runtimeState.mpLastRegion=save.region;}}
    function sendEmote(emote){if(!runtimeState.selfId){status('Connect to multiplayer first to send an emote.',2200);return;}if(mpSend({type:'emote',emote}))status(`Sent ${emote.replace(/-/g,' ')}!`,1200);}
    function openOverlay(which) {
      runtimeState.mapOpen=which==='map'?!runtimeState.mapOpen:false;
      runtimeState.inventoryOpen=which==='inventory'?!runtimeState.inventoryOpen:false;
      const map=root.querySelector('#cw-map-panel'), inventory=root.querySelector('#cw-inventory-panel');
      if(map)map.hidden=!runtimeState.mapOpen;if(inventory)inventory.hidden=!runtimeState.inventoryOpen;
      root.querySelectorAll('[data-cw-action="map"],[data-cw-action="inventory"]').forEach(btn=>btn.setAttribute('aria-expanded',String(btn.dataset.cwAction==='map'?runtimeState.mapOpen:runtimeState.inventoryOpen)));
    }
    function launch(action) {
      runtimeState.mapOpen=false;runtimeState.inventoryOpen=false;
      const map=root.querySelector('#cw-map-panel'), inventory=root.querySelector('#cw-inventory-panel');if(map)map.hidden=true;if(inventory)inventory.hidden=true;
      const app=window.CaydenProxyMainCatalog;
      if(action==='quests'){status('Quest Board selected! Your daily and weekly quest board is below this world.');document.querySelector('#rpg-quests')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
      if(action==='petaltown'){if(app?.navigate)app.navigate('play',{id:'petaltown'});else status('Petal Town is still loading. Try again in a moment.');return;}
      if(action==='wingeria'){if(app?.navigate)app.navigate('play',{id:'wingeria'});else status('Wingeria is still loading.');return;}
      const routes={games:'games',lab:'lab',music:'music',instruments:'instruments',passport:'passport'};
      if(routes[action]&&app?.navigate){app.navigate(routes[action]);return;}
      status('This landmark is a world-preview activity. More features will connect here in future releases.');
    }
    function enterRegion(regionId) {
      const next=REGIONS.find(r=>r.id===regionId), level=getPassportLevel();
      if(!next)return;
      if(!canEnterRegion(regionId,level)){status(`🔒 ${next.name} unlocks at Passport level ${next.level}. You are level ${level}.`);return;}
      save.region=next.id;save.x=480;save.y=375;if(!save.visited.includes(next.id))save.visited.push(next.id);runtimeState.nearbyId='';save.lastInteraction='';
      setSelectedRegion(next.id);writeSave();refreshHud();renderRegionList();openOverlay('none');runtimeState.mpLastRegion='';sendMultiplayerMove(performance.now()+200);updatePlayerCount();status(`Welcome to ${next.name}! ${next.description}`);canvas.focus({preventScroll:true});
    }
    function openDialogue(npc, topic='hello') {
      runtimeState.dialogueNpc=npc; runtimeState.keys.clear();
      const panel=root.querySelector('#cw-dialogue-panel'); if(panel)panel.hidden=false;
      const role=root.querySelector('#cw-dialogue-role'),name=root.querySelector('#cw-dialogue-name'),line=root.querySelector('#cw-dialogue-text');
      if(role)role.textContent=npc.role.toUpperCase();if(name)name.textContent=npc.name;
      if(line)line.textContent=topic==='region'?npc.region:topic==='tip'?npc.tip:npc.hello;
      const nearby=root.querySelector('#cw-nearby-card');if(nearby)nearby.hidden=true;
    }
    function closeDialogue(){runtimeState.dialogueNpc=null;const panel=root.querySelector('#cw-dialogue-panel');if(panel)panel.hidden=true;}
    function interact() {
      if(runtimeState.dialogueNpc){closeDialogue();return;}
      const region=getRegion(),npc=NPCS[region.id];
      const npcDistance=npc?Math.hypot(save.x-npc.x,save.y-npc.y):Infinity;
      if(npc&&npcDistance<52){openDialogue(npc);return;}
      let best=null,bestDist=Infinity;
      for(const point of region.points){const d=Math.hypot(save.x-point.x,save.y-point.y);if(d<bestDist){best=point;bestDist=d;}}
      if(!best||bestDist>116){runtimeState.nearbyId='';const card=root.querySelector('#cw-nearby-card');if(card)card.hidden=true;status('No landmark close enough. Walk toward a building or sign, then press E.');return;}
      runtimeState.nearbyId=best.id;
      const card=root.querySelector('#cw-nearby-card');if(card)card.hidden=false;
      const icon=root.querySelector('#cw-nearby-icon'),title=root.querySelector('#cw-nearby-title'),desc=root.querySelector('#cw-nearby-desc'),visit=root.querySelector('#cw-nearby-visit');
      if(icon)icon.textContent=best.icon;if(title)title.textContent=best.name;if(desc)desc.textContent=best.desc;if(visit)visit.textContent=best.action==='quests'?'View quests →':best.action==='petaltown'?'Visit garden →':best.action==='wingeria'?'Start shift →':`Enter →`;
      save.lastInteraction=best.id;writeSave();status(`${best.icon} ${best.name}: ${best.desc}`);
    }
    function jump() { runtimeState.jumpUntil=performance.now()+420; status('Boing! 🌱'); }
    root.addEventListener('click',e=>{
      const emote=e.target.closest('[data-cw-emote]');if(emote){sendEmote(emote.dataset.cwEmote);return;}
      if(e.target.closest('#cw-mp-new-room')){const input=root.querySelector('#cw-mp-room-code');if(input)input.value='';status('Room code cleared. Connect to create a fresh private room.',2400);return;}
      if(e.target.closest('#cw-mp-copy-room')){const input=root.querySelector('#cw-mp-room-code');if(!input?.value){status('Create or join a room first to get a code.');return;}if(navigator.clipboard?.writeText){navigator.clipboard.writeText(input.value).then(()=>status('Room code copied! Send it to your friend.')).catch(()=>{input.focus();input.select();status('Select and copy the highlighted room code.');});}else{input.focus();input.select();status('Select and copy the highlighted room code.');}return;}
      const dialogueChoice=e.target.closest('[data-cw-dialog-choice]');if(dialogueChoice){const choice=dialogueChoice.dataset.cwDialogChoice,npc=runtimeState.dialogueNpc;if(choice==='goodbye'){closeDialogue();status('See you around! 🌷');}else if(npc)openDialogue(npc,choice);if(choice==='quest'){closeDialogue();launch('quests');}return;}
      if(e.target.closest('#cw-mp-connect')){connectMultiplayer();return;}if(e.target.closest('#cw-mp-disconnect')){disconnectMultiplayer();return;}
      const action=e.target.closest('[data-cw-action]');
      if(action){const cmd=action.dataset.cwAction;if(cmd==='map')openOverlay('map');else if(cmd==='inventory')openOverlay('inventory');else if(cmd==='close-overlays')openOverlay('none');else if(cmd==='interact')interact();else if(cmd==='jump')jump();return;}
      const regionButton=e.target.closest('[data-cw-region]');if(regionButton){enterRegion(regionButton.dataset.cwRegion);return;}
      if(e.target.closest('#cw-nearby-visit')){const point=getRegion().points.find(p=>p.id===runtimeState.nearbyId);if(point)launch(point.action);}
    });
    const globalKeyDown=e=>{
      if(runtime!==runtimeState||!root.isConnected||e.target?.matches?.('input,textarea,select,[contenteditable="true"]'))return;
      const key=e.key.toLowerCase();if(runtimeState.dialogueNpc){if(key==='escape'||key==='e'){e.preventDefault();closeDialogue();}return;}if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(key)){if(key===' '||key.startsWith('arrow'))e.preventDefault();keys.add(key);}
      if(key==='e'&&!e.repeat){e.preventDefault();interact();}if(key===' '&&!e.repeat)jump();if(key==='m'&&!e.repeat)openOverlay('map');if(key==='i'&&!e.repeat)openOverlay('inventory');
    };
    const globalKeyUp=e=>{if(runtime!==runtimeState)return;keys.delete(e.key.toLowerCase());};
    window.addEventListener('keydown',globalKeyDown);window.addEventListener('keyup',globalKeyUp);runtimeState.globalKeyDown=globalKeyDown;runtimeState.globalKeyUp=globalKeyUp;
    const joystick=root.querySelector('#cw-joystick'), nub=root.querySelector('#cw-joystick-nub');
    function setJoystick(e){const rect=joystick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=e.clientX-cx,dy=e.clientY-cy,limit=rect.width*.31,len=Math.hypot(dx,dy),scale=len>limit?limit/len:1;runtimeState.joystick.x=clamp(dx*scale/limit,-1,1);runtimeState.joystick.y=clamp(dy*scale/limit,-1,1);runtimeState.joystick.active=true;if(nub)nub.style.transform=`translate(${runtimeState.joystick.x*limit}px, ${runtimeState.joystick.y*limit}px)`;}
    function resetJoystick(){runtimeState.joystick={x:0,y:0,active:false,pointer:null};if(nub)nub.style.transform='translate(0, 0)';}
    if(joystick){joystick.addEventListener('pointerdown',e=>{e.preventDefault();runtimeState.joystick.pointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);setJoystick(e);});joystick.addEventListener('pointermove',e=>{if(runtimeState.joystick.pointer===e.pointerId)setJoystick(e);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>joystick.addEventListener(type,resetJoystick));}
    runtimeState.resetJoystick=resetJoystick;
    function drawHuman(x,y,appearance={},scale=1){
      const defaults={skinTone:'#e8b58d',hairColor:'#2d211d',hairStyle:'short',shirtColor:'#5b9b71',pantsColor:'#334e75'},a={...defaults,...appearance};
      const color=(v,allowed,fallback)=>allowed.includes(v)?v:fallback;
      a.skinTone=color(a.skinTone,['#f7d7bd','#e8b58d','#c9875a','#8c573b','#573729'],defaults.skinTone);a.hairColor=color(a.hairColor,['#2d211d','#65412d','#d6a23d','#b95735','#5c4a8c','#d9d9d9'],defaults.hairColor);a.hairStyle=['short','long','curly','ponytail'].includes(a.hairStyle)?a.hairStyle:'short';a.shirtColor=color(a.shirtColor,['#e66b80','#5b9b71','#5e83c6','#e4b34f','#8b70b8','#f2eee2','#35414c'],defaults.shirtColor);a.pantsColor=color(a.pantsColor,['#334e75','#5b6571','#8a5b3b','#4b805b','#292b32'],defaults.pantsColor);
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='rgba(35,55,39,.2)';ctx.beginPath();ctx.ellipse(0,12,13,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=a.pantsColor;ctx.beginPath();ctx.roundRect?ctx.roundRect(-9,3,8,15,3):ctx.rect(-9,3,8,15);ctx.fill();ctx.beginPath();ctx.roundRect?ctx.roundRect(1,3,8,15,3):ctx.rect(1,3,8,15);ctx.fill();
      ctx.fillStyle='#4b3a35';ctx.fillRect(-11,16,11,4);ctx.fillRect(1,16,11,4);
      ctx.fillStyle=a.shirtColor;ctx.beginPath();ctx.roundRect?ctx.roundRect(-12,-13,24,22,7):ctx.rect(-12,-13,24,22);ctx.fill();ctx.strokeStyle=a.shirtColor;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,-8);ctx.lineTo(-14,3);ctx.moveTo(10,-8);ctx.lineTo(14,3);ctx.stroke();
      ctx.fillStyle=a.skinTone;ctx.fillRect(-4,-18,8,8);ctx.beginPath();ctx.arc(0,-27,12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=a.hairColor;if(a.hairStyle==='curly'){[-9,-4,2,8].forEach((dx,i)=>{ctx.beginPath();ctx.arc(dx,-37+(i%2)*2,5,0,Math.PI*2);ctx.fill();});ctx.beginPath();ctx.arc(-11,-29,4,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.ellipse(0,-35,12,6,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-11,-35,5,8);if(a.hairStyle==='long')ctx.fillRect(7,-34,4,16);if(a.hairStyle==='ponytail'){ctx.beginPath();ctx.arc(12,-31,5,0,Math.PI*2);ctx.fill();}}
      ctx.fillStyle='#302721';ctx.beginPath();ctx.arc(-4,-27,1.2,0,Math.PI*2);ctx.arc(4,-27,1.2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function drawTree(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#8f6547';ctx.fillRect(-5,10,10,26);ctx.fillStyle='#578f58';ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#75ad69';ctx.beginPath();ctx.arc(-8,-8,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f6df93';ctx.beginPath();ctx.arc(8,-3,4,0,Math.PI*2);ctx.fill();ctx.restore();}
    function drawBuilding(point,active){
      const {x,y}=point;ctx.save();ctx.fillStyle='rgba(52,76,53,.12)';ctx.beginPath();ctx.ellipse(x,y+34,54,14,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fffcf2';ctx.strokeStyle='rgba(73,79,59,.24)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect?ctx.roundRect(x-36,y-8,72,48,9):ctx.rect(x-36,y-8,72,48);ctx.fill();ctx.stroke();
      ctx.fillStyle=active?'#dd93ad':getRegion().accent;ctx.beginPath();ctx.moveTo(x-43,y-8);ctx.lineTo(x,y-38);ctx.lineTo(x+43,y-8);ctx.closePath();ctx.fill();
      ctx.fillStyle='#8c7050';ctx.fillRect(x-8,y+14,16,26);ctx.fillStyle='#d9eff4';ctx.fillRect(x-26,y+3,12,12);ctx.fillRect(x+14,y+3,12,12);
      ctx.font='34px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(point.icon,x,y-52);
      const label=point.name;ctx.font='bold 12px system-ui';const tw=Math.min(178,ctx.measureText(label).width+18);ctx.fillStyle=active?'#fff5bf':'rgba(255,255,250,.94)';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-tw/2,y+45,tw,24,12):ctx.rect(x-tw/2,y+45,tw,24);ctx.fill();ctx.fillStyle='#304c3a';ctx.fillText(label,x,y+57);ctx.restore();
    }
    function drawWorld(now){
      const region=getRegion();ctx.clearRect(0,0,WIDTH,HEIGHT);
      const sky=ctx.createLinearGradient(0,0,0,HEIGHT);sky.addColorStop(0,region.sky);sky.addColorStop(1,region.ground);ctx.fillStyle=sky;ctx.fillRect(0,0,WIDTH,HEIGHT);
      // Lawn patches and a tiny flower pattern make a living, readable top-down town.
      for(let i=0;i<22;i++){const x=(i*137+41)%WIDTH,y=(i*83+24)%HEIGHT;ctx.fillStyle=i%2?'rgba(255,255,255,.12)':'rgba(63,125,73,.07)';ctx.beginPath();ctx.ellipse(x,y,54,25,(i%3)*.35,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle='rgba(98,92,73,.13)';ctx.lineWidth=2;ctx.setLineDash([3,12]);ctx.beginPath();ctx.moveTo(0,327);ctx.lineTo(WIDTH,327);ctx.moveTo(480,327);ctx.lineTo(480,HEIGHT);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle=region.path;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=84;ctx.beginPath();ctx.moveTo(-10,330);ctx.lineTo(970,330);ctx.moveTo(480,530);ctx.lineTo(480,330);ctx.moveTo(205,330);ctx.lineTo(205,225);ctx.moveTo(480,330);ctx.lineTo(480,210);ctx.moveTo(750,330);ctx.lineTo(750,226);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.setLineDash([8,11]);ctx.beginPath();ctx.moveTo(0,330);ctx.lineTo(WIDTH,330);ctx.moveTo(480,520);ctx.lineTo(480,330);ctx.stroke();ctx.setLineDash([]);
      // Water feature and small flowerbeds shift subtly by region.
      ctx.fillStyle=region.id==='restaurant-row'?'#b9deea':'#a8dcea';ctx.beginPath();ctx.ellipse(95,430,74,36,-.12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(95,430,51,20,-.12,0,Math.PI*2);ctx.stroke();
      const trees=[[70,96,.8],[128,286,.76],[330,90,.8],[350,435,.75],[615,87,.83],[625,435,.78],[875,92,.8],[895,300,.85],[820,450,.78],[40,265,.72],[920,410,.7]];trees.forEach(t=>drawTree(t[0],t[1],t[2]));
      for(let i=0;i<26;i++){const x=(i*71+18)%WIDTH,y=(i*53+49)%HEIGHT;if(Math.abs(y-330)<60||trees.some(t=>Math.hypot(t[0]-x,t[1]-y)<32)||region.points.some(p=>Math.hypot(p.x-x,p.y-y)<65))continue;ctx.font='15px system-ui';ctx.textAlign='center';ctx.fillText(['🌼','🌷','🍀','🌸'][i%4],x,y);}
      const npc=NPCS[region.id];if(npc){drawHuman(npc.x,npc.y,npc.appearance,.92);ctx.textAlign='center';ctx.font='bold 11px system-ui';const nw=ctx.measureText(npc.name).width+16;ctx.fillStyle='rgba(46,49,83,.92)';ctx.beginPath();ctx.roundRect?ctx.roundRect(npc.x-nw/2,npc.y-56,nw,18,9):ctx.rect(npc.x-nw/2,npc.y-56,nw,18);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(npc.name,npc.x,npc.y-44);ctx.font='10px system-ui';ctx.fillStyle='#385b3c';ctx.fillText('Press E to talk',npc.x,npc.y+30);}
      region.points.forEach(p=>drawBuilding(p,runtimeState.nearbyId===p.id));
      // Remote players are room-scoped server snapshots; each remains visually distinct from the local avatar.
      runtimeState.players.forEach(player=>{if(player.region!==save.region)return;const px=clamp(Number(player.x)||0,22,WIDTH-22),py=clamp(Number(player.y)||0,22,HEIGHT-22);ctx.fillStyle='rgba(35,55,39,.18)';ctx.beginPath();ctx.ellipse(px,py+11,13,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fffaf0';ctx.strokeStyle='#7a83c7';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(px,py,15,0,Math.PI*2);ctx.fill();ctx.stroke();drawHuman(px,py,player.appearance||{},.78);ctx.font='bold 11px system-ui';const label=String(player.name||'Garden Guest').slice(0,20),tw=Math.min(150,ctx.measureText(label).width+14);ctx.fillStyle='rgba(46,49,83,.92)';ctx.beginPath();ctx.roundRect?ctx.roundRect(px-tw/2,py-40,tw,19,9):ctx.rect(px-tw/2,py-40,tw,19);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(label,px,py-30);if(player.emoteUntil>now&&player.emoteText){ctx.font='bold 12px system-ui';const ew=Math.min(140,ctx.measureText(player.emoteText).width+16);ctx.fillStyle='#fffdf2';ctx.beginPath();ctx.roundRect?ctx.roundRect(px-ew/2,py-66,ew,21,10):ctx.rect(px-ew/2,py-66,ew,21);ctx.fill();ctx.fillStyle='#304c3a';ctx.fillText(player.emoteText,px,py-55);}});
      // The character is drawn with a soft shadow and a squash-and-stretch hop.
      const jumping=now<runtimeState.jumpUntil,progress=jumping?1-(runtimeState.jumpUntil-now)/420:0,bob=jumping?Math.sin(Math.max(0,progress)*Math.PI)*24:Math.sin(now/180)*2;
      drawHuman(save.x,save.y-bob,runtimeState.character.appearance||{},1);
      ctx.fillStyle='rgba(43,67,47,.9)';ctx.beginPath();ctx.roundRect?ctx.roundRect(save.x-58,save.y-bob-43,116,21,10):ctx.rect(save.x-58,save.y-bob-43,116,21);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px system-ui';ctx.fillText(runtimeState.character.name||'Petal Pal',save.x,save.y-bob-32);
      if(runtimeState.nearbyId){const p=region.points.find(item=>item.id===runtimeState.nearbyId);if(p){ctx.strokeStyle='#fff4a7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,60+Math.sin(now/140)*3,0,Math.PI*2);ctx.stroke();}}
    }
    function nearestPoint(){const region=getRegion();let best=null,distance=Infinity;for(const p of region.points){const d=Math.hypot(save.x-p.x,save.y-p.y);if(d<distance){best=p;distance=d;}}return distance<116?best:null;}
    function updateNearby() {const p=nearestPoint();if((p?.id||'')===runtimeState.nearbyId)return;runtimeState.nearbyId=p?.id||'';const card=root.querySelector('#cw-nearby-card');if(card)card.hidden=!p;if(p){const set=(id,value)=>{const node=root.querySelector('#'+id);if(node)node.textContent=value;};set('cw-nearby-icon',p.icon);set('cw-nearby-title',p.name);set('cw-nearby-desc',p.desc);const visit=root.querySelector('#cw-nearby-visit');if(visit)visit.textContent=p.action==='quests'?'View quests →':p.action==='petaltown'?'Visit garden →':p.action==='wingeria'?'Start shift →':'Enter →';}}
    function collides(x,y){if(getRegion().points.some(p=>Math.hypot(x-p.x,y-p.y)<(p.block||38)))return true;if(TREE_COLLIDERS.some(t=>Math.hypot(x-t[0],y-t[1])<t[2]))return true;const pond=((x-95)/76)**2+((y-430)/38)**2<1.05;return pond;}
    function frame(now){if(runtime!==runtimeState||runtimeState.destroyed||!root.isConnected)return;const elapsed=runtimeState.lastFrame?Math.min(.04,(now-runtimeState.lastFrame)/1000):0.016;runtimeState.lastFrame=now;
      let vx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),vy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      vx+=runtimeState.joystick.x;vy+=runtimeState.joystick.y;const len=Math.hypot(vx,vy);if(len>1){vx/=len;vy/=len;}
      if(vx||vy){const oldX=save.x,oldY=save.y,next=moveVector(save,{x:vx,y:vy},elapsed,keys.has('shift'));let moved=false;if(!collides(next.x,save.y)){save.x=next.x;moved=true;}if(!collides(save.x,next.y)){save.y=next.y;moved=true;}if(moved){const distance=Math.hypot(save.x-oldX,save.y-oldY);runtimeState.walkRemainder+=distance;while(runtimeState.walkRemainder>=18){save.steps++;runtimeState.walkRemainder-=18;}}updateNearby();}
      if(now-runtimeState.lastSaved>1800){writeSave();runtimeState.lastSaved=now;refreshHud();}
      sendMultiplayerMove(now);drawWorld(now);runtimeState.raf=requestAnimationFrame(frame);
    }
    runtimeState.drawWorld=drawWorld;runtimeState.status=status;runtimeState.enterRegion=enterRegion;runtimeState.openOverlay=openOverlay;runtimeState.interact=interact;runtimeState.resize=resize;runtimeState.connectMultiplayer=connectMultiplayer;runtimeState.disconnectMultiplayer=disconnectMultiplayer;
    runtimeState.raf=requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',runtimeState.visibility=()=>{if(document.hidden)writeSave();});
    window.addEventListener('beforeunload',runtimeState.beforeUnload=writeSave);
    status(`Welcome to ${getRegion().name}! Walk to a landmark and press E to interact.`,5000);
  }
  function renderRegionList(){if(!runtime?.root)return;const root=runtime.root,level=getPassportLevel();const list=root.querySelector('#cw-region-list');if(!list)return;list.innerHTML=REGIONS.map(region=>{const unlocked=canEnterRegion(region.id,level),visited=save.visited.includes(region.id),active=region.id===save.region;return `<button type="button" class="cw-region-option ${active?'is-current':''}" data-cw-region="${region.id}" ${unlocked?'':'aria-disabled="true"'}><span class="cw-region-option-icon">${region.emoji}</span><span class="cw-region-option-text"><strong>${region.name}</strong><small>${visited?'Visited · ':''}${unlocked?'Level '+region.level+' · Open':'🔒 Reach level '+region.level}</small></span><span class="cw-region-option-state">${active?'HERE':unlocked?'TRAVEL':'LOCKED'}</span></button>`;}).join('');}
  function renderInventory(){if(!runtime?.root)return;const grid=runtime.root.querySelector('#cw-inventory-grid');if(!grid)return;grid.innerHTML=save.inventory.map(item=>`<div class="cw-inventory-item"><span>${escapeHTML(item.icon)}</span><div><strong>${escapeHTML(item.name)}</strong><small>Quantity: ${item.qty}</small></div></div>`).join('');}
  function refreshHud(){if(!runtime?.root)return;const root=runtime.root;const char=getCharacter(),data=profile(),level=getPassportLevel();runtime.character=char;let garden={};try{garden=JSON.parse(localStorage.getItem('cp-garden-profile')||'{}');}catch(_){}const xp=clamp(garden.xp||0,0,999999999),region=REGIONS.find(r=>r.id===save.region)||REGIONS[0];const set=(id,value)=>{const node=root.querySelector('#'+id);if(node)node.textContent=value;};const avatarNode=root.querySelector('#cw-avatar');if(avatarNode)avatarNode.innerHTML=window.CaydenRPGWorld?.humanAvatarSVG?.(char.appearance)||'🧑';set('cw-player-name',char.name||'Petal Pal');set('cw-player-level',`Level ${level} · ${char.title||'New Sprout'}`);set('cw-xp-text',`${xp%100}/100 XP`);const fill=root.querySelector('#cw-xp-fill');if(fill)fill.style.width=`${xp%100}%`;set('cw-region-name',`${region.emoji} ${region.name}`);set('cw-time-label',timeLabel());set('cw-coins',clamp(data.coins||0,0,999999999));set('cw-gems',clamp(data.gems||0,0,99999999));set('cw-research',clamp(data.researchPoints||0,0,99999999));set('cw-visited-count',`${save.visited.length} / ${REGIONS.length}`);set('cw-step-count',save.steps);}
  function destroy(){if(!runtime)return;writeSave();runtime.destroyed=true;if(runtime.socket){try{runtime.socket.close(1000,'World closed');}catch(_){}}runtime.players?.clear?.();if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.resizeObserver?.disconnect();if(runtime.globalKeyDown)window.removeEventListener('keydown',runtime.globalKeyDown);if(runtime.globalKeyUp)window.removeEventListener('keyup',runtime.globalKeyUp);if(runtime.visibility)document.removeEventListener('visibilitychange',runtime.visibility);if(runtime.beforeUnload)window.removeEventListener('beforeunload',runtime.beforeUnload);if(runtime.resetJoystick)runtime.resetJoystick();clearTimeout(runtime.toastTimer);runtime=null;}
  const api={mount,destroy,regions:REGIONS.map(r=>({...r,points:r.points.map(p=>({...p}))})),blankSave,normalizeSave,canEnterRegion,moveVector,getState:()=>JSON.parse(JSON.stringify(save)),getStorageKey:()=>SAVE_KEY,getPassportLevel,npcs:Object.fromEntries(Object.entries(NPCS).map(([key,value])=>[key,{...value,appearance:{...value.appearance}}])),multiplayer:{path:'/ws/world',roomCodeLength:6,emotes:['wave','heart','celebrate','flower','dance','think','clap','hello','nice-garden','lets-explore','great-job','thanks']}};
  window.CaydenWorldScene=api;
})();
