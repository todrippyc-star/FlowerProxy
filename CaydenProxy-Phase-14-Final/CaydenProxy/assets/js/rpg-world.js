/* Cayden World RPG foundation: local character, regions, home, quests, and gated founder sandbox. */
(() => {
  'use strict';
  const KEY = 'cp-rpg-world-v1';
  const SANDBOX_ITEMS = [
    { id: 'seed-bag', name: 'Mystery Seed Bag', icon: '🌱' },
    { id: 'star-fragment', name: 'Star Fragment', icon: '✨' },
    { id: 'lab-blueprint', name: 'Lab Blueprint', icon: '📐' },
    { id: 'golden-petal', name: 'Golden Petal', icon: '🌼' },
    { id: 'music-crystal', name: 'Music Crystal', icon: '🎵' }
  ];
  const THEMES = [
    ['daisy-cream', 'Daisy Cream', '🌼'], ['sunflower-gold', 'Sunflower Gold', '🌻'],
    ['cherry-blossom', 'Cherry Blossom', '🌸'], ['rose-garden', 'Rose Garden', '🌹'],
    ['lavender-haze', 'Lavender Haze', '🪻'], ['bluebell-sky', 'Bluebell Sky', '🪻'],
    ['clover-meadow', 'Clover Meadow', '🍀'], ['iris-twilight', 'Iris Twilight', '💜']
  ];
  const REGIONS = [
    { id:'bloomtown', name:'Bloomtown', emoji:'🌷', level:1, description:'The friendly starter plaza, training games, tutorial quests, and first gardens.', activities:['Starter games','Welcome quest','Petal Town'], route:'games' },
    { id:'science-valley', name:'Science Valley', emoji:'🧪', level:5, description:'Explore chemistry-inspired classroom models, the Personal Science Lab, and biology gardens.', activities:['Personal Science Lab','Science questions','Discovery journal'], route:'lab' },
    { id:'coding-city', name:'Coding City', emoji:'💻', level:10, description:'Practice algorithms, debugging, logic puzzles, and digital arcade challenges.', activities:['Coding challenges','Logic games','Technology questions'], route:'games' },
    { id:'melody-grove', name:'Melody Grove', emoji:'🎼', level:15, description:'A musical neighborhood for the song library, Instrument Greenhouse, and music studio.', activities:['Vibe Garden','Instrument Greenhouse','Music Studio'], route:'music' },
    { id:'restaurant-row', name:'Restaurant Row', emoji:'🍗', level:20, description:'Grow kitchen skills, serve guests, and expand a restaurant in Wingeria.', activities:['Wingeria Rush','Restaurant quiz','Kitchen planning'], route:'games' },
    { id:'creative-coast', name:'Creative Coast', emoji:'🎨', level:25, description:'A future home for art studios, design prompts, and player-built creations.', activities:['Art & Creativity games','Creative prompts','Design workshop'], route:'games' },
    { id:'logic-mountains',name:'Logic Mountains',emoji:'🧩',level:30,description:'Reasoning, patterns, and strategy challenges.',activities:['Logic puzzles','Pattern Peak','Strategy Lodge'],route:'games'},
    { id:'history-harbor',name:'History Harbor',emoji:'⚓',level:35,description:'Timelines, artifacts, and historical stories.',activities:['Timeline Tower','Archive Dock','Source reading'],route:'games'},
    { id:'sports-stadium',name:'Sports Stadium District',emoji:'🏟️',level:40,description:'Sports rules, skill challenges, and teamwork.',activities:['Stadium Field','Training Center','Friendly competitions'],route:'games'},
    { id:'space-observatory',name:'Space Observatory',emoji:'🔭',level:45,description:'Astronomy, planets, stars, and missions.',activities:['Star Dome','Rocket Yard','Space discoveries'],route:'games'},
    { id:'elemental-forest',name:'Elemental Forest',emoji:'🌳',level:50,description:'Elements, molecules, ecosystems, and nature.',activities:['Molecule Grove','Ecosystem Clearing','Research notes'],route:'lab'},
    { id:'crystal-caverns',name:'Crystal Caverns',emoji:'💎',level:55,description:'Minerals, materials, geology, and sound puzzles.',activities:['Geode Hall','Gem Workshop','Collection hunts'],route:'games'},
    { id:'innovation-island',name:'Innovation Island',emoji:'💡',level:60,description:'Invention, engineering, prototypes, and future ideas.',activities:['Invention Lab','Prototype Plaza','Future Beacon'],route:'games'}
  ];
  const HOUSE_TIERS = [
    { id:'cottage', name:'Small House', level:1, cost:0, emoji:'🏡', description:'Your starter home with room to grow.' },
    { id:'house', name:'House', level:5, cost:150, emoji:'🏠', description:'A little more room for decorations and trophies.' },
    { id:'villa', name:'Villa', level:10, cost:400, emoji:'🏘️', description:'A roomy home with a garden-facing studio.' },
    { id:'estate', name:'Estate', level:20, cost:1000, emoji:'🏛️', description:'A spacious home for your expanding collection.' },
    { id:'mansion', name:'Mansion', level:30, cost:2500, emoji:'🏰', description:'A grand home with room for a full collection.' },
    { id:'legendary-estate', name:'Legendary Estate', level:40, cost:5000, emoji:'🏯', description:'The ultimate current home tier for your growing world.' }
  ];
  const AVATARS = ['🧑','🌼','🌻','🐝','🦋','🐸','🐱','🦊','🐢','🌈','🍄'];
  const AVATAR_CHOICES = {
    skinTone: ['#f7d7bd','#e8b58d','#c9875a','#8c573b','#573729'],
    hairColor: ['#2d211d','#65412d','#d6a23d','#b95735','#5c4a8c','#d9d9d9'],
    hairStyle: ['short','long','curly','ponytail'],
    shirtColor: ['#e66b80','#5b9b71','#5e83c6','#e4b34f','#8b70b8','#f2eee2','#35414c'],
    pantsColor: ['#334e75','#5b6571','#8a5b3b','#4b805b','#292b32']
  };
  const DEFAULT_APPEARANCE = { skinTone:'#e8b58d', hairColor:'#2d211d', hairStyle:'short', shirtColor:'#5b9b71', pantsColor:'#334e75' };
  function sanitizeAppearance(input) {
    const x=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    return Object.fromEntries(Object.entries(DEFAULT_APPEARANCE).map(([key,fallback])=>[key,AVATAR_CHOICES[key].includes(x[key])?x[key]:fallback]));
  }
  function avatarCodeFor(input) {
    const payload=JSON.stringify({v:1,appearance:sanitizeAppearance(input)});
    return 'CWAV1.'+btoa(payload).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function appearanceFromCode(code) {
    const value=String(code||'').trim();
    if(!/^CWAV1\.[A-Za-z0-9_-]{10,300}$/.test(value)) throw new Error('That avatar code does not look valid.');
    let raw; try { const part=value.slice(6).replace(/-/g,'+').replace(/_/g,'/'); raw=JSON.parse(atob(part+'='.repeat((4-part.length%4)%4))); } catch (_) { throw new Error('Could not read that avatar code. Check that you copied the whole code.'); }
    if(raw?.v!==1||!raw.appearance||typeof raw.appearance!=='object') throw new Error('This avatar code version is not supported.');
    return sanitizeAppearance(raw.appearance);
  }
  function humanAvatarSVG(input) {
    const a=sanitizeAppearance(input), hair=a.hairColor, skin=a.skinTone, shirt=a.shirtColor, pants=a.pantsColor;
    const hairBack=a.hairStyle==='long'||a.hairStyle==='ponytail'?`<path d="M29 28 Q25 7 50 8 Q76 8 72 31 L70 62 Q64 73 61 54 L39 54 Q35 71 29 58Z" fill="${hair}"/>`:'';
    const hairTop=a.hairStyle==='curly'?`<path d="M30 30 Q22 20 32 16 Q31 5 43 12 Q50 2 58 12 Q71 6 70 20 Q79 25 69 34 L63 25 L38 25Z" fill="${hair}"/>`:`<path d="M30 31 Q25 9 50 9 Q74 9 70 32 L61 25 L42 27 L34 35Z" fill="${hair}"/>`;
    const pony=a.hairStyle==='ponytail'?`<circle cx="72" cy="28" r="8" fill="${hair}"/>`:'';
    return `<svg class="rpg-human-svg" viewBox="0 0 100 120" role="img" aria-label="Custom human avatar"><ellipse cx="50" cy="113" rx="28" ry="5" fill="#00000016"/><path d="M39 77 L37 105 L47 105 L51 82 L55 105 L65 105 L61 77Z" fill="${pants}"/><path d="M36 101 L48 101 L49 109 L34 109Z M54 101 L66 101 L69 109 L54 109Z" fill="#4b3a35"/><path d="M34 47 Q24 52 25 72 L34 80 L66 80 L75 72 Q76 53 66 47Z" fill="${shirt}"/><path d="M35 52 L25 70 L31 74 L41 60 M65 52 L75 70 L69 74 L59 60" fill="${shirt}" stroke="${shirt}" stroke-width="7" stroke-linecap="round"/><rect x="44" y="40" width="12" height="12" rx="4" fill="${skin}"/>${hairBack}<circle cx="50" cy="30" r="20" fill="${skin}"/><path d="M42 31 Q45 34 48 31 M54 31 Q57 34 60 31" fill="none" stroke="#3c302b" stroke-width="2" stroke-linecap="round"/><path d="M45 40 Q50 44 55 40" fill="none" stroke="#a65355" stroke-width="2" stroke-linecap="round"/>${hairTop}${pony}</svg>`;
  }
  const OUTFITS = ['Garden Overalls','Petal Hoodie','Science Coat','Music Jacket','Artist Apron','Explorer Gear'];
  const TITLES = ['New Sprout','Curious Gardener','Junior Researcher','Melody Maker','Creative Dreamer','World Explorer'];
  const FRAMES = ['Daisy Frame','Rose Frame','Iris Frame','Golden Frame','Clover Frame'];
  const localGet = (key, fallback = null) => { try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch (_) { return fallback; } };
  const localSet = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const text = value => String(value == null ? '' : value).replace(/[<>\u0000-\u001f]/g, '').trim();
  const integer = (value, min = 0, max = 100000000) => Math.max(min, Math.min(max, Math.floor(Number(value) || 0)));
  const blankState = () => ({
    version: 1,
    character: { name:'Petal Pal', avatar:'🧑', appearance:{...DEFAULT_APPEARANCE}, outfit:'Garden Overalls', title:'New Sprout', badgeFrame:'Daisy Frame', theme:'daisy-cream' },
    selectedRegion:'bloomtown', houseTier:'cottage', coins:150, gems:0, researchPoints:0,
    claimedDaily:{}, claimedWeekly:{}, weeklyBaseline:null,
    developerMode:false,
    sandbox:{ testXP:0, items:{}, previewRegion:'', lastAction:'' }
  });
  function sanitizeState(input) {
    const d = blankState(), x = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const c = x.character && typeof x.character === 'object' ? x.character : {};
    const s = x.sandbox && typeof x.sandbox === 'object' ? x.sandbox : {};
    const regionIds = new Set(REGIONS.map(r => r.id));
    const houseIds = new Set(HOUSE_TIERS.map(h => h.id));
    const sandboxItems = {};
    for (const item of SANDBOX_ITEMS) sandboxItems[item.id] = integer(s.items && s.items[item.id], 0, 999);
    return {
      version:1,
      character:{
        name:(text(c.name).slice(0,20) || d.character.name),
        avatar:AVATARS.includes(c.avatar) ? c.avatar : d.character.avatar,
        appearance:sanitizeAppearance(c.appearance),
        outfit:OUTFITS.includes(c.outfit) ? c.outfit : d.character.outfit,
        title:TITLES.includes(c.title) ? c.title : d.character.title,
        badgeFrame:FRAMES.includes(c.badgeFrame) ? c.badgeFrame : d.character.badgeFrame,
        theme:THEMES.some(t=>t[0]===c.theme) ? c.theme : d.character.theme
      },
      selectedRegion:regionIds.has(x.selectedRegion) ? x.selectedRegion : d.selectedRegion,
      houseTier:houseIds.has(x.houseTier) ? x.houseTier : d.houseTier,
      coins:integer(x.coins,0,999999999), gems:integer(x.gems,0,9999999), researchPoints:integer(x.researchPoints,0,9999999),
      claimedDaily:x.claimedDaily && typeof x.claimedDaily === 'object' && !Array.isArray(x.claimedDaily) ? x.claimedDaily : {},
      claimedWeekly:x.claimedWeekly && typeof x.claimedWeekly === 'object' && !Array.isArray(x.claimedWeekly) ? x.claimedWeekly : {},
      weeklyBaseline:x.weeklyBaseline && typeof x.weeklyBaseline === 'object' ? x.weeklyBaseline : null,
      developerMode:x.developerMode === true,
      sandbox:{ testXP:integer(s.testXP,0,999999), items:sandboxItems, previewRegion:regionIds.has(s.previewRegion)?s.previewRegion:'', lastAction:text(s.lastAction).slice(0,180) }
    };
  }
  function readStats() {
    const parse = key => { try { return JSON.parse(localGet(key,'{}')) || {}; } catch (_) { return {}; } };
    const garden = parse('cp-garden-profile'), q = parse('cp-question-engine-v1'), lab = parse('cp-science-lab-v1'), town = parse('cp-petal-town-v1');
    return {
      xp:integer(garden.xp), level:Math.floor(integer(garden.xp)/100)+1,
      gamesPlayed:integer(garden.gamesPlayed), totalCorrect:integer(garden.totalCorrect),
      daily: garden.daily && garden.daily.date === dayKey() ? garden.daily : { played:false, correct:0, checkin:false },
      labDiscoveries:Array.isArray(lab.discoveries)?lab.discoveries.length:0,
      labExperiments:integer(lab.experiments),
      questionsAnswered:integer(q.questionsAnswered), townHarvested:integer(town.harvested),
      townLevel:integer(town.level,1,999)
    };
  }
  function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function weekKey(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const mondayOffset = (d.getDay()+6)%7; d.setDate(d.getDate()-mondayOffset);
    return dayKey(d);
  }
  function applySandboxAction(stateInput, action, payload = {}) {
    const state = sanitizeState(stateInput);
    const sandbox = state.sandbox;
    if (action === 'grant-test-xp') sandbox.testXP = integer(sandbox.testXP + integer(payload.amount,1,1000),0,999999);
    else if (action === 'spawn-item' && SANDBOX_ITEMS.some(i=>i.id===payload.item)) sandbox.items[payload.item] = integer(sandbox.items[payload.item] + integer(payload.quantity,1,20),0,999);
    else if (action === 'preview-region' && REGIONS.some(r=>r.id===payload.region)) sandbox.previewRegion = payload.region;
    else if (action === 'reset-sandbox') { sandbox.testXP = 0; for (const item of SANDBOX_ITEMS) sandbox.items[item.id] = 0; sandbox.previewRegion = ''; }
    else throw new Error('Unsupported sandbox action.');
    sandbox.lastAction = action;
    return sanitizeState(state);
  }
  let mountedRoot=null;
  let state;
  try { state = sanitizeState(JSON.parse(localGet(KEY, '{}'))); } catch (_) { state = blankState(); }
  // Establish the current week's baselines when the module first runs, not only when the player opens the RPG screen.
  const statsAtBoot = readStats(), activeWeek = weekKey();
  if (!state.weeklyBaseline || state.weeklyBaseline.week !== activeWeek) {
    state.weeklyBaseline = { week:activeWeek, gamesPlayed:statsAtBoot.gamesPlayed, totalCorrect:statsAtBoot.totalCorrect, labDiscoveries:statsAtBoot.labDiscoveries };
    localSet(KEY, state);
  }
  let founderToken = '';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentState = () => sanitizeState(state);
  const profileStats = () => readStats();
  const unlockedHouse = (stats, id) => { const house = HOUSE_TIERS.find(h=>h.id===id); return !!house && stats.level >= house.level; };
  const accessibleRegions = stats => REGIONS.filter(r=>stats.level>=r.level);
  function claimStoreFor(period, id) {
    const key = period === 'daily' ? dayKey() : weekKey();
    const store = period === 'daily' ? state.claimedDaily : state.claimedWeekly;
    return Array.isArray(store[key]) && store[key].includes(id);
  }
  function markClaimed(period, id) {
    const key = period === 'daily' ? dayKey() : weekKey();
    const store = period === 'daily' ? state.claimedDaily : state.claimedWeekly;
    if (!Array.isArray(store[key])) store[key] = [];
    if (!store[key].includes(id)) store[key].push(id);
    const keys = Object.keys(store).sort(); while (keys.length > 8) delete store[keys.shift()];
  }
  function dailyDefinitions(stats) {
    return [
      {id:'daily-play', title:'Visit Bloomtown', desc:'Open any game today.', progress:stats.daily.played?1:0, goal:1, coins:20, xp:15, icon:'🎮'},
      {id:'daily-learning', title:'Petals of knowledge', desc:'Answer five questions correctly today.', progress:Math.min(5,integer(stats.daily.correct)), goal:5, coins:30, xp:20, icon:'🌼'},
      {id:'daily-checkin', title:'Say hello to the garden', desc:'Check in to the Garden Passport today.', progress:stats.daily.checkin?1:0, goal:1, coins:15, xp:15, icon:'🌱'}
    ];
  }
  function weeklyDefinitions(stats) {
    const b = state.weeklyBaseline || {gamesPlayed:stats.gamesPlayed,totalCorrect:stats.totalCorrect,labDiscoveries:stats.labDiscoveries};
    return [
      {id:'week-arcade', title:'Arcade explorer', desc:'Play five games this week.', progress:Math.min(5,Math.max(0,stats.gamesPlayed-integer(b.gamesPlayed))), goal:5, coins:70, xp:40, icon:'🕹️'},
      {id:'week-study', title:'Study garden', desc:'Answer 20 questions correctly this week.', progress:Math.min(20,Math.max(0,stats.totalCorrect-integer(b.totalCorrect))), goal:20, coins:90, xp:50, icon:'📚'},
      {id:'week-science', title:'Curious researcher', desc:'Discover three new lab reactions this week.', progress:Math.min(3,Math.max(0,stats.labDiscoveries-integer(b.labDiscoveries))), goal:3, coins:100, xp:60, icon:'🧪'}
    ];
  }
  const routeLabels = {games:'Open Games',lab:'Enter Science Lab',music:'Visit Melody Grove',passport:'Open Garden Passport',instruments:'Open Instrument Greenhouse'};
  function actionButton(route, label) { return `<button type="button" class="btn btn-secondary btn-small" data-rpg-route="${route}">${label}</button>`; }
  function renderQuests(stats) {
    const list = (items, period) => `<div class="rpg-quest-list">${items.map(q=>{
      const claimed = claimStoreFor(period,q.id), done=q.progress>=q.goal;
      const pct=Math.min(100,Math.round(q.progress/q.goal*100));
      return `<article class="rpg-quest ${done?'is-done':''}"><span class="rpg-quest-icon" aria-hidden="true">${q.icon}</span><div class="rpg-quest-body"><strong>${q.title}</strong><p>${q.desc}</p><div class="rpg-mini-bar" aria-label="${q.progress} of ${q.goal}"><span style="width:${pct}%"></span></div><small>${q.progress} / ${q.goal} · Reward: ${q.coins} coins + ${q.xp} XP</small></div><button type="button" class="btn ${done&&!claimed?'btn-primary':'btn-secondary'} btn-small" data-rpg-claim="${period}:${q.id}" ${!done||claimed?'disabled':''}>${claimed?'Claimed ✓':done?'Claim':'In progress'}</button></article>`;
    }).join('')}</div>`;
    return `<section id="rpg-quests" class="rpg-panel"><div class="rpg-section-head"><div><div class="eyebrow">🌷 QUEST BOARD</div><h2>Little steps, big world</h2><p>Daily goals reset every day. Weekly goals track activity since the start of the current week.</p></div></div><h3 class="rpg-subhead">Daily quests</h3>${list(dailyDefinitions(stats),'daily')}<h3 class="rpg-subhead">Weekly quests</h3>${list(weeklyDefinitions(stats),'weekly')}</section>`;
  }
  function renderCharacter(stats) {
    const c=state.character;
    const a=sanitizeAppearance(c.appearance);
    const choice=(name,label,values)=>`<label>${label}<select name="${name}" class="field-input">${values.map(v=>`<option value="${v}" ${v===a[name]?'selected':''}>${({short:'Short',long:'Long',curly:'Curly',ponytail:'Ponytail'})[v]||v}</option>`).join('')}</select></label>`;
    const avatarCode=avatarCodeFor(a);
    return `<section class="rpg-panel"><div class="rpg-section-head"><div><div class="eyebrow">🧑 YOUR HUMAN AVATAR</div><h2>Design your explorer</h2><p>Choose skin, hair, and outfit colors. Your human avatar saves on this device. Copy its code to reuse the same look on another device.</p></div></div><form id="rpg-character-form" class="rpg-character-layout"><div class="rpg-avatar-preview"><div class="rpg-human-avatar ${c.badgeFrame.toLowerCase().split(' ')[0]}">${humanAvatarSVG(a)}</div><strong>${esc(c.name)}</strong><span class="rpg-title-chip">${esc(c.title)}</span><small>Level ${stats.level} · ${stats.xp} XP</small></div><div class="rpg-character-fields"><label>Character name<input name="name" maxlength="20" required value="${esc(c.name)}" class="field-input"></label><label>Outfit style<select name="outfit" class="field-input">${OUTFITS.map(v=>`<option ${v===c.outfit?'selected':''}>${esc(v)}</option>`).join('')}</select></label>${choice('skinTone','Skin tone',AVATAR_CHOICES.skinTone)}${choice('hairStyle','Hairstyle',AVATAR_CHOICES.hairStyle)}${choice('hairColor','Hair color',AVATAR_CHOICES.hairColor)}${choice('shirtColor','Shirt color',AVATAR_CHOICES.shirtColor)}${choice('pantsColor','Pants color',AVATAR_CHOICES.pantsColor)}<label>Title<select name="title" class="field-input">${TITLES.map(v=>`<option ${v===c.title?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Badge frame<select name="badgeFrame" class="field-input">${FRAMES.map(v=>`<option ${v===c.badgeFrame?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Starting flower theme<select name="theme" class="field-input">${THEMES.map(v=>`<option value="${v[0]}" ${v[0]===c.theme?'selected':''}>${v[2]} ${v[1]}</option>`).join('')}</select></label><button class="btn btn-primary" type="submit">Save character</button></div></form><div class="rpg-avatar-code"><label for="rpg-avatar-code-input">Human avatar code</label><textarea id="rpg-avatar-code-input" rows="2" spellcheck="false">${avatarCode}</textarea><div class="rpg-actions"><button type="button" class="btn btn-secondary btn-small" data-rpg-avatar-copy>Copy avatar code</button><button type="button" class="btn btn-secondary btn-small" data-rpg-avatar-import>Load code</button></div><p class="rpg-muted-notice" id="rpg-avatar-code-status" role="status" aria-live="polite">Avatar codes store appearance only, not your account or progress. Never use them as passwords.</p></div></section>`;
  }
  function renderRegions(stats) {
    const open = accessibleRegions(stats), selected = REGIONS.find(r=>r.id===state.selectedRegion) || REGIONS[0];
    return `<section class="rpg-panel"><div class="rpg-section-head"><div><div class="eyebrow">🗺️ WORLD MAP</div><h2>Choose your next region</h2><p>${open.length} of ${REGIONS.length} regions open at level ${stats.level}. Locked areas unlock through your real Garden Passport level.</p></div></div><div class="rpg-region-grid">${REGIONS.map(r=>{const unlocked=stats.level>=r.level,active=r.id===state.selectedRegion;return `<button type="button" class="rpg-region-card ${active?'is-selected':''} ${unlocked?'':'is-locked'}" data-rpg-region="${r.id}" ${unlocked?'':'disabled'} aria-pressed="${active}"><span class="rpg-region-emoji">${r.emoji}</span><span class="rpg-region-name">${r.name}</span><span class="rpg-region-level">${unlocked?'OPEN':'🔒 Level '+r.level}</span><small>${r.description}</small></button>`}).join('')}</div><div class="rpg-region-detail"><div class="rpg-region-detail-head"><span class="rpg-region-emoji">${selected.emoji}</span><div><div class="eyebrow">CURRENT REGION</div><h3>${selected.name}</h3><p>${selected.description}</p></div></div><div class="rpg-pills">${selected.activities.map(a=>`<span>${a}</span>`).join('')}</div>${actionButton(selected.route,routeLabels[selected.route]||'Explore activities')}</div></section>`;
  }
  function renderHouse(stats) {
    const active = HOUSE_TIERS.find(h=>h.id===state.houseTier) || HOUSE_TIERS[0];
    const rooms = [
      {id:'bedroom',emoji:'🛏️',name:'Bedroom',desc:'A cozy rest spot and avatar showcase.',route:'passport'},
      {id:'living',emoji:'🛋️',name:'Living Room',desc:'Your home hub for stories and quick links.',route:'games'},
      {id:'trophy',emoji:'🏆',name:'Trophy Room',desc:'Review your badges and learning milestones.',route:'passport'},
      {id:'studio',emoji:'🎹',name:'Music Studio',desc:'Build a melody in the Instrument Greenhouse.',route:'instruments'},
      {id:'garden',emoji:'🌻',name:'Garden Entrance',desc:'Visit your independent Petal Town save.',route:'petaltown'},
      {id:'lab',emoji:'🧪',name:'Science Laboratory',desc:'Return to your personal discovery sandbox.',route:'lab'}
    ];
    return `<section id="rpg-house" class="rpg-panel"><div class="rpg-section-head"><div><div class="eyebrow">🏡 YOUR HOMESTEAD</div><h2>${active.emoji} ${active.name}</h2><p>${active.description} House upgrades use RPG coins and your real Garden Passport level; they do not affect other games' currencies.</p></div><div class="rpg-currency-pills"><span>🪙 ${state.coins} coins</span><span>💎 ${state.gems} gems</span><span>🔬 ${state.researchPoints} research</span></div></div><div class="rpg-house-tier-grid">${HOUSE_TIERS.map((h,i)=>{const currentIndex=HOUSE_TIERS.findIndex(x=>x.id===state.houseTier),owned=currentIndex>=i,levelOK=stats.level>=h.level,affordable=state.coins>=h.cost,nextTier=i===currentIndex+1,can=!owned&&nextTier&&levelOK&&affordable;return `<article class="rpg-house-card ${owned?'is-owned':''}"><span class="rpg-region-emoji">${h.emoji}</span><strong>${h.name}</strong><small>Level ${h.level} · ${h.cost?`${h.cost} coins`:'Free starter home'}</small><p>${h.description}</p>${owned?'<span class="rpg-status-label">Owned ✓</span>':`<button class="btn ${can?'btn-primary':'btn-secondary'} btn-small" type="button" data-rpg-house="${h.id}" ${can?'':'disabled'}>${!nextTier?'Upgrade previous tier first':!levelOK?'Reach level '+h.level:!affordable?'Need more coins':'Upgrade home'}</button>`}</article>`}).join('')}</div><h3 class="rpg-subhead">Rooms in your homestead</h3><div class="rpg-room-grid">${rooms.map(r=>`<button type="button" class="rpg-room" data-rpg-room="${r.route}"><span>${r.emoji}</span><strong>${r.name}</strong><small>${r.desc}</small><em>Explore →</em></button>`).join('')}</div></section>`;
  }
  function renderFounder() {
    const enabled=state.developerMode;
    const unlocked=!!founderToken;
    const sandbox=state.sandbox;
    return `<section class="rpg-panel rpg-founder-panel"><div class="rpg-section-head"><div><div class="eyebrow">🌟 FOUNDER / ADMIN MODE</div><h2>Founder Console</h2><p>Permission-gated developer tools for testing. All grants stay in a separate local sandbox and never change normal coins, XP, achievements, or unlocks.</p></div><span class="rpg-security-chip ${unlocked?'is-authorized':''}">${unlocked?'● Authorized session':'● Locked'}</span></div><label class="rpg-toggle-row"><input type="checkbox" id="rpg-dev-mode" ${enabled?'checked':''}> <span><strong>Developer Mode enabled</strong><small>Required before requesting a Founder session.</small></span></label>${enabled&&!unlocked?`<form id="rpg-founder-login" class="rpg-founder-login"><label>Server founder key<input class="field-input" type="password" autocomplete="current-password" id="rpg-founder-key" minlength="24" placeholder="Only configured on your server" required></label><button class="btn btn-primary" type="submit">Request Founder session</button><small>There is no built-in universal phrase. The server owner must configure <code>CP_FOUNDER_KEY</code> in the environment.</small></form>`:''}${!enabled?'<p class="rpg-muted-notice">Turn on Developer Mode, then authenticate against a server configured with a founder key. This does not enable admin powers by itself.</p>':''}${enabled&&unlocked?`<div class="rpg-sandbox"><div class="rpg-sandbox-notice">🛡️ Authorized for 20 minutes. Sandbox-only actions:</div><div class="rpg-sandbox-grid"><div><label>Test XP amount<input id="rpg-test-xp-amount" type="number" min="1" max="1000" value="100" class="field-input"></label><button class="btn btn-primary btn-small" type="button" data-rpg-founder-action="grant-test-xp">Grant test XP</button><p class="rpg-muted-notice">Sandbox XP: <strong>${sandbox.testXP}</strong> (not Player XP)</p></div><div><label>Test item<select id="rpg-test-item" class="field-input">${SANDBOX_ITEMS.map(i=>`<option value="${i.id}">${i.icon} ${i.name} (x${sandbox.items[i.id]||0})</option>`).join('')}</select></label><button class="btn btn-secondary btn-small" type="button" data-rpg-founder-action="spawn-item">Spawn test item</button></div><div><label>Region preview<select id="rpg-test-region" class="field-input">${REGIONS.map(r=>`<option value="${r.id}" ${sandbox.previewRegion===r.id?'selected':''}>${r.emoji} ${r.name}</option>`).join('')}</select></label><button class="btn btn-secondary btn-small" type="button" data-rpg-founder-action="preview-region">Preview region</button></div></div><p class="rpg-muted-notice">Test inventory: ${SANDBOX_ITEMS.map(i=>`${i.icon} ${i.name} ×${sandbox.items[i.id]||0}`).join(' · ')}</p>${(()=>{const preview=REGIONS.find(r=>r.id===sandbox.previewRegion);return preview?`<div class="rpg-preview-box"><strong>🗺️ Previewing ${preview.emoji} ${preview.name}</strong><p>${preview.description}</p><small>Sandbox preview only; this does not unlock the real region.</small></div>`:''})()}<div class="rpg-actions"><button class="btn btn-secondary btn-small" type="button" data-rpg-founder-action="reset-sandbox">Reset test sandbox</button><button class="btn btn-secondary btn-small" type="button" id="rpg-founder-logout">End Founder session</button></div></div>`:''}<p class="rpg-security-footnote">Security note: server-key verification is real when using <code>node server.js</code> with <code>CP_FOUNDER_KEY</code> configured. Do not expose the key in the source code. Developer actions in this release only modify a local test sandbox; production multiplayer permissions and player accounts are not implemented yet.</p><div id="rpg-founder-status" class="rpg-live-status" role="status" aria-live="polite"></div></section>`;
  }
  function render() {
    const stats=profileStats();
    if (!accessibleRegions(stats).some(r=>r.id===state.selectedRegion)) state.selectedRegion='bloomtown';
    const selected=REGIONS.find(r=>r.id===state.selectedRegion)||REGIONS[0];
    const time=new Date().getHours(), daypart=time<6?'Starlight':time<11?'Morning bloom':time<16?'Sunny afternoon':time<20?'Golden hour':'Twilight';
    return `<div class="rpg-world-page"><section class="rpg-hud"><div class="rpg-hud-player"><div class="rpg-hud-avatar">${humanAvatarSVG(state.character.appearance)}</div><div><strong>${esc(state.character.name)}</strong><span>Level ${stats.level} · ${esc(state.character.title)}</span><div class="rpg-xp-bar"><i style="width:${stats.xp%100}%"></i></div><small>${stats.xp%100}/100 XP to next level</small></div></div><div class="rpg-hud-area"><span class="rpg-hud-overline">CURRENT AREA</span><strong>${selected.emoji} ${selected.name}</strong><span>🌤️ Sunny · ${daypart}</span></div><div class="rpg-hud-wallet"><span>🪙 ${state.coins} coins</span><span>💎 ${state.gems} gems</span><span>🔬 ${state.researchPoints} research</span></div></section><section class="rpg-world-hero"><div><div class="eyebrow">🌍 CAYDEN WORLD · LOCAL WORLD FOUNDATION</div><h1>Your next chapter<br><span>starts blooming.</span></h1><p>A persistent, cozy RPG layer that connects your character, home, quests, and the activities already in CaydenProxy. Your world profile saves on this device.</p><div class="rpg-actions"><button type="button" class="btn btn-primary" data-rpg-scroll="regions">🗺️ Explore map</button><button type="button" class="btn btn-secondary" data-rpg-scroll="character">🧑‍🌾 Customize character</button></div></div><div class="rpg-world-emblem">🌸<span>✦</span><i>🌱</i></div></section><div id="rpg-character" class="rpg-anchor">${renderCharacter(stats)}</div><div id="rpg-regions" class="rpg-anchor">${renderRegions(stats)}</div><div class="rpg-anchor">${renderHouse(stats)}</div><div id="rpg-quests" class="rpg-anchor">${renderQuests(stats)}</div>${renderFounder()}<section class="rpg-panel rpg-scope-note"><strong>Online-world status:</strong> This release contains a locally saved character, region unlocks, house progression, quest board, and a server-key-gated developer sandbox. It is not yet a live multiplayer world: friends, visits, real chat, hosted profiles, and cloud saves need a separate backend implementation.</section></div>`;
  }
  async function requestFounderSession(key) {
    const response = await fetch('/api/founder/session', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({key}) });
    let data={}; try { data=await response.json(); } catch (_) {}
    if (!response.ok || !data.ok || !data.token) throw new Error(data.error || 'Founder access was denied.');
    founderToken=data.token;
  }
  async function founderAction(action, payload={}) {
    if (!founderToken) throw new Error('Founder session expired. Authenticate again.');
    const response=await fetch('/api/founder/action',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${founderToken}`},body:JSON.stringify({action,...payload})});
    let data={}; try { data=await response.json(); } catch (_) {}
    if (!response.ok || !data.ok) { if(response.status===401)founderToken=''; throw new Error(data.error||'Founder action was rejected.'); }
    return data;
  }
  function toast(message) { const api=window.CaydenProxyMainCatalog; if(api?.showToast)api.showToast(message); else { const status=document.querySelector('#rpg-founder-status'); if(status)status.textContent=message; } }
  function mount(root) {
    if (!root) return;
    mountedRoot=root;
    root.innerHTML=render();
    if (root.dataset.rpgWired) return;
    root.dataset.rpgWired='1';
    root.addEventListener('submit', async e=>{
      if(e.target.id==='rpg-character-form') {
        e.preventDefault(); const form=e.target, fd=new FormData(form);
        state.character={...state.character,name:(text(fd.get('name')).slice(0,20)||'Petal Pal'),avatar:'🧑',appearance:sanitizeAppearance({skinTone:fd.get('skinTone'),hairStyle:fd.get('hairStyle'),hairColor:fd.get('hairColor'),shirtColor:fd.get('shirtColor'),pantsColor:fd.get('pantsColor')}),outfit:OUTFITS.includes(fd.get('outfit'))?fd.get('outfit'):OUTFITS[0],title:TITLES.includes(fd.get('title'))?fd.get('title'):TITLES[0],badgeFrame:FRAMES.includes(fd.get('badgeFrame'))?fd.get('badgeFrame'):FRAMES[0],theme:THEMES.some(t=>t[0]===fd.get('theme'))?fd.get('theme'):'daisy-cream'};
        localSet(KEY,state); if(window.CaydenFloralThemes?.apply)window.CaydenFloralThemes.apply(state.character.theme); renderIntoRoot(root); toast('Character saved! Your look is ready. 🌸');
      } else if(e.target.id==='rpg-founder-login') {
        e.preventDefault(); if(!state.developerMode){toast('Enable Developer Mode before requesting Founder access.');return;}
        const input=root.querySelector('#rpg-founder-key'), key=input?.value||''; if(input)input.value='';
        const status=root.querySelector('#rpg-founder-status'); if(status)status.textContent='Checking permissions…';
        try { await requestFounderSession(key); renderIntoRoot(root); toast('Founder session authorized. Test sandbox only.'); }
        catch(err){if(status)status.textContent=err.message||'Could not authenticate.';}
      }
    });
    root.addEventListener('click',async e=>{
      if(e.target.closest('[data-rpg-avatar-copy]')) {
        const input=root.querySelector('#rpg-avatar-code-input'),status=root.querySelector('#rpg-avatar-code-status');
        if(!input)return;
        try { await navigator.clipboard.writeText(input.value); if(status)status.textContent='Avatar code copied! Paste it on another device to reuse this look.'; }
        catch (_) { input.focus(); input.select(); if(status)status.textContent='Select the highlighted code and copy it manually, then paste it on the other device.'; }
        return;
      }
      if(e.target.closest('[data-rpg-avatar-import]')) {
        const input=root.querySelector('#rpg-avatar-code-input'),status=root.querySelector('#rpg-avatar-code-status');
        try { const appearance=appearanceFromCode(input?.value||''); state.character={...state.character,appearance,avatar:'🧑'}; localSet(KEY,state); renderIntoRoot(root); toast('Human avatar loaded and saved from code!'); }
        catch(err) { if(status)status.textContent=err.message||'That avatar code could not be loaded.'; }
        return;
      }
    });
    root.addEventListener('change',e=>{
      if(e.target.id==='rpg-dev-mode') {state.developerMode=!!e.target.checked;if(!state.developerMode)founderToken='';localSet(KEY,state);renderIntoRoot(root);}
    });
    root.addEventListener('click',async e=>{
      const region=e.target.closest('[data-rpg-region]'); if(region){const item=REGIONS.find(r=>r.id===region.dataset.rpgRegion);if(item&&profileStats().level>=item.level){state.selectedRegion=item.id;localSet(KEY,state);renderIntoRoot(root);}return;}
      const route=e.target.closest('[data-rpg-route]'); if(route){const target=route.dataset.rpgRoute;if(target==='petaltown'){window.CaydenProxyMainCatalog?.navigate?.('play',{id:'petaltown'});return;}window.CaydenProxyMainCatalog?.navigate?.(target);return;}
      const room=e.target.closest('[data-rpg-room]'); if(room){const target=room.dataset.rpgRoom;if(target==='petaltown')window.CaydenProxyMainCatalog?.navigate?.('play',{id:'petaltown'});else window.CaydenProxyMainCatalog?.navigate?.(target);return;}
      const scroll=e.target.closest('[data-rpg-scroll]'); if(scroll){root.querySelector('#rpg-'+scroll.dataset.rpgScroll)?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
      const house=e.target.closest('[data-rpg-house]'); if(house){const tier=HOUSE_TIERS.find(h=>h.id===house.dataset.rpgHouse),stats=profileStats();if(!tier||stats.level<tier.level||state.coins<tier.cost)return;if(HOUSE_TIERS.findIndex(h=>h.id===tier.id)<=HOUSE_TIERS.findIndex(h=>h.id===state.houseTier))return;state.coins-=tier.cost;state.houseTier=tier.id;localSet(KEY,state);renderIntoRoot(root);toast(`${tier.name} unlocked! 🏡`);return;}
      const claim=e.target.closest('[data-rpg-claim]'); if(claim){const [period,id]=claim.dataset.rpgClaim.split(':');const stats=profileStats(),items=period==='daily'?dailyDefinitions(stats):weeklyDefinitions(stats),quest=items.find(q=>q.id===id);if(!quest||quest.progress<quest.goal||claimStoreFor(period,id))return;markClaimed(period,id);state.coins=integer(state.coins+quest.coins,0,999999999);localSet(KEY,state);window.CaydenProxyMainCatalog?.awardXP?.(quest.xp,`Cayden World quest: ${quest.title}`);renderIntoRoot(root);toast(`Quest claimed! +${quest.coins} coins and +${quest.xp} XP 🌱`);return;}
      const devAction=e.target.closest('[data-rpg-founder-action]'); if(devAction){if(!state.developerMode||!founderToken){toast('Developer Mode and an authorized Founder session are both required.');return;}const action=devAction.dataset.rpgFounderAction;devAction.disabled=true;try{let payload={};if(action==='grant-test-xp')payload.amount=integer(root.querySelector('#rpg-test-xp-amount')?.value,1,1000);if(action==='spawn-item'){payload.item=root.querySelector('#rpg-test-item')?.value;payload.quantity=1;}if(action==='preview-region')payload.region=root.querySelector('#rpg-test-region')?.value;await founderAction(action,payload);state=applySandboxAction(state,action,payload);localSet(KEY,state);renderIntoRoot(root);toast('Developer sandbox updated. Normal progression is unchanged.');}catch(err){const status=root.querySelector('#rpg-founder-status');if(status)status.textContent=err.message||'Action failed.';devAction.disabled=false;}return;}
      if(e.target.closest('#rpg-founder-logout')){founderToken='';renderIntoRoot(root);toast('Founder session ended.');}
    });
  }
  function renderIntoRoot(root) { root.innerHTML=render(); }
  function selectRegion(id) {
    const region=REGIONS.find(item=>item.id===id);
    if(!region || profileStats().level < region.level) return false;
    state.selectedRegion=region.id; localSet(KEY,state); if(mountedRoot?.isConnected)renderIntoRoot(mountedRoot); return true;
  }
  const api = { mount, getState:()=>currentState(), selectRegion, avatarCodeFor, appearanceFromCode, sanitizeAppearance, humanAvatarSVG, regions:REGIONS.map(r=>({...r})), houseTiers:HOUSE_TIERS.map(h=>({...h})), sanitizeState, blankState, applySandboxAction, dayKey, weekKey, dailyDefinitions, weeklyDefinitions, getStorageKey:()=>KEY };
  window.CaydenRPGWorld=api;
})();
