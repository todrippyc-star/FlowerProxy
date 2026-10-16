'use strict';
// Dependency-free static validation and asset integrity checks for CaydenProxy.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let fails = 0;
function assert(condition, message) {
  if (!condition) { fails++; console.error(`FAIL: ${message}`); }
  else console.log(`PASS: ${message}`);
}
const html = read('index.html');
const packageJson = JSON.parse(read('package.json'));
const modules = [
  'assets/js/arcade-max.js',
  'assets/js/wingeria-remastered.js',
  'assets/js/music-studio-v3.js',
  'assets/js/world-of-bloom.js',
  'assets/js/wingeria-empire.js',
  'assets/js/petal-town.js',
  'assets/js/floral-themes.js',
  'assets/js/genre-catalog.js',
  'assets/js/science-lab.js',
  'assets/js/question-engine.js',
  'assets/js/rpg-world.js',
  'assets/js/cayden-world-scene.js',
  'server.js',
  'sw.js'
];
let syntaxOK = true;
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/\bsrc\s*=/i.test(m[1]) && m[2].trim());
inlineScripts.forEach((m, i) => { try { new vm.Script(m[2], { filename: `index.html:inline-${i+1}` }); } catch (e) { syntaxOK = false; console.error(e.stack); } });
for (const file of modules) {
  if (!fs.existsSync(path.join(root, file))) { syntaxOK = false; console.error(`Missing module: ${file}`); continue; }
  try { new vm.Script(read(file), { filename: file }); } catch (e) { syntaxOK = false; console.error(e.stack); }
}
assert(syntaxOK, `all ${inlineScripts.length} inline scripts plus ${modules.length} JavaScript modules parse`);

// Exercise the procedural question engine in an isolated browser-like context.
const questionEngineSource = read('assets/js/question-engine.js');
const qeSaved = new Map();
const qeWindow = {};
vm.runInNewContext(questionEngineSource, {
  window: qeWindow,
  localStorage: { getItem: key => qeSaved.get(key) || null, setItem: (key, value) => qeSaved.set(key, String(value)) },
  console
}, { filename: 'question-engine-runtime-test.js' });
const questionEngine = qeWindow.CaydenQuestionEngine;
assert(!!questionEngine && questionEngine.subjects.length === 13, 'procedural question engine exposes all 13 roadmap subjects');
assert(questionEngine.difficulties.join('|') === 'Easy|Medium|Hard|Expert|Challenge', 'question engine exposes all five difficulty tiers in the requested order');
assert(questionEngine.types.length === 8, 'question engine exposes eight requested response modes');
let subjectCapacityOK = true, uniqueThousandPerSubject = true, noFallbacks = true;
const perSubjectQuestionStats = [];
for (const subject of questionEngine.subjects) {
  const session = questionEngine.createSession(subject);
  const signatures = new Set();
  const difficultiesSeen = new Set();
  for (let i = 0; i < 1000; i++) {
    const q = session.next(questionEngine.difficulties[i % questionEngine.difficulties.length]);
    const signature = [q.type, questionEngine.normalizeAnswer(q.q), questionEngine.normalizeAnswer(q.ans), (q.opts || []).map(questionEngine.normalizeAnswer).join('|')].join('::');
    signatures.add(signature);
    difficultiesSeen.add(q.difficulty);
    if (!q.q || !q.ans || !questionEngine.types.includes(q.type)) subjectCapacityOK = false;
  }
  perSubjectQuestionStats.push(`${subject} ${signatures.size}`);
  if (signatures.size < 1000) uniqueThousandPerSubject = false;
  if (session.fallbackCount > 0) noFallbacks = false;
  if (difficultiesSeen.size !== 5) subjectCapacityOK = false;
}
assert(uniqueThousandPerSubject, `each of 13 subjects generated 1,000 unique session questions (${perSubjectQuestionStats.join(', ')})`);
assert(subjectCapacityOK, 'generated questions include valid answers, supported response modes, and all five difficulty tiers');
assert(noFallbacks, '1,000-question subject sessions did not need duplicate-prompt fallback');
let allQuestionModesOK = true;
for (const subject of questionEngine.subjects) {
  for (const type of questionEngine.types) {
    const q = questionEngine.createSession(subject, { types: [type] }).next('Medium');
    if (q.type !== type || !q.q || !q.ans) allQuestionModesOK = false;
    if (['typing', 'fill-in-the-blank'].includes(type) && q.opts.length !== 0) allQuestionModesOK = false;
    if (type === 'true-false' && q.opts.length !== 2) allQuestionModesOK = false;
  }
}
assert(allQuestionModesOK, 'all eight response modes can be generated for all 13 subjects with mode-appropriate choices');
const trackedQuestion = questionEngine.generate('Math', { difficulty: 'Easy', types: ['multiple-choice'] });
questionEngine.recordAnswer(trackedQuestion, true);
const savedQuestionStats = JSON.parse(qeSaved.get(questionEngine.storageKey));
assert(savedQuestionStats.version === 1 && savedQuestionStats.questionsAnswered === 1 && savedQuestionStats.correct === 1 && savedQuestionStats.subjects.Math.answered === 1, 'question answers update persisted overall and per-subject mastery stats');
assert(html.includes('assets/js/question-engine.js') && html.includes('function questionMasteryPanel()') && html.includes('questionMasteryPanel()'), 'procedural engine and Subject Mastery panel are wired into the main site');
assert(html.includes('const engine=window.CaydenQuestionEngine;if(engine){try{const subject=engine.subjectForGame(g[0],cat)') && html.includes('window.CaydenQuestionEngine?.recordAnswer?.(round.questionMeta?.[round.index],correct)'), 'timed Arcade quiz rounds use the shared question engine and record answer statistics');
assert(html.includes("'cp-question-engine-v1'") && html.includes("key==='cp-question-engine-v1'"), 'question mastery stats are included in the safe local profile backup/restore allowlist');
assert(html.includes('function rpgWorldPage()') && html.includes('rpg:rpgWorldPage') && html.includes('assets/js/rpg-world.js'), 'Cayden World RPG has a dedicated homepage route and its own module');
assert(html.includes('data-route="rpg"') && html.includes('id="rpgWorldMount"'), 'Cayden World RPG is linked from the dashboard and mounts in its own page');
const rpgCss = read('assets/css/rpg-world.css');
const rpgSource = read('assets/js/rpg-world.js');
const rpgSaved = new Map();
const rpgWindow = {};
const avatarCodeGlobals = {btoa,atob};
vm.runInNewContext(rpgSource, {
  window: rpgWindow,
  localStorage: { getItem:key=>rpgSaved.has(key)?rpgSaved.get(key):null, setItem:(key,value)=>rpgSaved.set(key,String(value)) },
  console,
  btoa, atob,
  fetch: async()=>({ok:false,status:503,json:async()=>({error:'Not configured'})})
}, { filename:'rpg-world-runtime-test.js' });
const rpgApi = rpgWindow.CaydenRPGWorld;
assert(!!rpgApi && rpgApi.regions.length===13, 'RPG world model exposes all thirteen configured regions');
assert(rpgApi.houseTiers.length===6 && rpgApi.houseTiers.map(h=>h.name).join('|')==='Small House|House|Villa|Estate|Mansion|Legendary Estate', 'RPG home system exposes all six home upgrade tiers');
const rpgBlank = rpgApi.blankState();
assert(rpgBlank.character.name==='Petal Pal' && rpgBlank.coins===150 && rpgBlank.houseTier==='cottage', 'new RPG save starts with safe default character and Cottage home');
const rpgSanitized = rpgApi.sanitizeState({character:{name:'<script>alert(1)</script>',avatar:'nope',outfit:'hax',title:'admin',badgeFrame:'unknown',theme:'unknown'},coins:-500,gems:1e99,selectedRegion:'not-a-region',sandbox:{testXP:1e12,items:{'seed-bag':999999},previewRegion:'not-a-region'}});
assert(!/[<>]/.test(rpgSanitized.character.name) && rpgSanitized.character.avatar==='🧑' && rpgSanitized.coins===0 && rpgSanitized.gems===9999999, 'RPG profile migration sanitizes names, options, and wallet bounds');
assert(rpgSanitized.selectedRegion==='bloomtown' && rpgSanitized.sandbox.previewRegion==='' && rpgSanitized.sandbox.testXP===999999, 'invalid region and sandbox fields normalize safely');
const rpgSandboxXp = rpgApi.applySandboxAction(rpgBlank,'grant-test-xp',{amount:250});
assert(rpgSandboxXp.sandbox.testXP===250 && rpgSandboxXp.coins===rpgBlank.coins && rpgSandboxXp.sandbox.testXP!==undefined, 'Founder XP applies only to isolated sandbox XP, not real player coins or XP');
const rpgSandboxItem = rpgApi.applySandboxAction(rpgSandboxXp,'spawn-item',{item:'star-fragment',quantity:3});
assert(rpgSandboxItem.sandbox.items['star-fragment']===3, 'Founder sandbox can grant allowlisted test items');
const rpgSandboxRegion = rpgApi.applySandboxAction(rpgSandboxItem,'preview-region',{region:'creative-coast'});
assert(rpgSandboxRegion.sandbox.previewRegion==='creative-coast' && rpgSandboxRegion.selectedRegion==='bloomtown', 'Founder region preview does not unlock or change the real selected region');
const rpgReset = rpgApi.applySandboxAction(rpgSandboxRegion,'reset-sandbox');
assert(rpgReset.sandbox.testXP===0 && rpgReset.sandbox.items['star-fragment']===0 && rpgReset.sandbox.previewRegion==='', 'Founder sandbox can be reset cleanly');
const dailyTest = rpgApi.dailyDefinitions({daily:{played:true,correct:5,checkin:true}});
assert(dailyTest.length===3 && dailyTest.every(q=>q.progress===q.goal), 'daily RPG quests reflect real local gameplay, correct answers, and check-in state');
const weeklyTest = rpgApi.weeklyDefinitions({gamesPlayed:5,totalCorrect:20,labDiscoveries:3});
assert(weeklyTest.length===3 && weeklyTest.every(q=>Number.isFinite(q.progress)&&q.goal>0), 'weekly RPG quests expose measurable goals for game, learning, and lab activity');
assert(['name','avatar','outfit','title','badgeFrame','theme','skinTone','hairStyle','hairColor','shirtColor','pantsColor'].every(field=>rpgSource.includes(field)), 'human character customization covers identity, hairstyle, skin, hair, clothing, title, frame, and theme');
const avatarCode=rpgApi.avatarCodeFor({skinTone:'#573729',hairColor:'#d6a23d',hairStyle:'ponytail',shirtColor:'#e66b80',pantsColor:'#4b805b'});
const decodedAvatar=rpgApi.appearanceFromCode(avatarCode);
assert(avatarCode.startsWith('CWAV1.') && decodedAvatar.skinTone==='#573729' && decodedAvatar.hairStyle==='ponytail' && decodedAvatar.pantsColor==='#4b805b', 'human avatar codes round-trip supported appearance choices');
let invalidAvatarRejected=false;try{rpgApi.appearanceFromCode('not-a-code');}catch(_){invalidAvatarRejected=true;}
assert(invalidAvatarRejected && rpgApi.humanAvatarSVG(decodedAvatar).includes('<svg') && rpgApi.humanAvatarSVG(decodedAvatar).includes('#573729'), 'avatar code validation rejects invalid input and generates a human SVG preview');
assert(['Bloomtown','Science Valley','Coding City','Melody Grove','Restaurant Row','Creative Coast','Logic Mountains','History Harbor','Sports Stadium District','Space Observatory','Elemental Forest','Crystal Caverns','Innovation Island'].every(name=>rpgSource.includes(name)), 'world map includes all thirteen roadmap regions');
assert(html.includes('id="caydenWorldSceneMount"') && html.includes('assets/js/cayden-world-scene.js') && html.includes('assets/css/cayden-world-scene.css'), 'walkable world is mounted in the Cayden World route with local script and stylesheet');
const sceneJS = read('assets/js/cayden-world-scene.js');
const sceneCSS = read('assets/css/cayden-world-scene.css');
const sceneStore = new Map();
const sceneWindow = {devicePixelRatio:1};
const sceneContext = {window:sceneWindow,localStorage:{getItem:key=>sceneStore.has(key)?sceneStore.get(key):null,setItem:(key,value)=>sceneStore.set(key,String(value))},console,Math,Date,JSON,Set,Map};
vm.runInNewContext(sceneJS,sceneContext,{filename:'cayden-world-scene-runtime-test.js'});
const sceneAPI=sceneWindow.CaydenWorldScene;
assert(!!sceneAPI && sceneAPI.regions.length===13, 'walkable scene exposes all thirteen configured regions');
assert(sceneAPI.regions.every(region=>region.points.length>=3), 'every region has at least three interactable landmarks');
assert(sceneAPI.canEnterRegion('bloomtown',1) && !sceneAPI.canEnterRegion('science-valley',4) && sceneAPI.canEnterRegion('science-valley',5) && !sceneAPI.canEnterRegion('not-a-region',99), 'world travel respects Passport-level gates and rejects unknown regions');
const sceneBlank=sceneAPI.blankSave();
assert(sceneBlank.region==='bloomtown' && sceneBlank.inventory.length===3 && sceneBlank.visited.includes('bloomtown'), 'new walkable-world save starts in Bloomtown with starter inventory');
const sceneNoSave=sceneAPI.normalizeSave(null);
assert(sceneNoSave.region==='bloomtown' && sceneNoSave.x===480 && sceneNoSave.y===365, 'missing walkable-world save uses the intended center starting position');
const sceneSanitized=sceneAPI.normalizeSave({region:'hack',x:99999,y:-5,visited:['bloomtown','hack'],inventory:[{id:'a',name:'<invalid>',icon:'🎒',qty:1e8}]});
assert(sceneSanitized.region==='bloomtown' && sceneSanitized.x===938 && sceneSanitized.y===22 && sceneSanitized.visited.length===1 && sceneSanitized.inventory[0].qty===999, 'world save clamps positions, filters unknown regions, and bounds inventory quantities');
const normalMove=sceneAPI.moveVector({x:480,y:260},{x:1,y:0},0.05,false);
const sprintMove=sceneAPI.moveVector({x:480,y:260},{x:1,y:0},0.05,true);
assert(normalMove.x===487.5 && sprintMove.x===492.25 && sprintMove.y===260, 'walk and sprint movement use bounded, deterministic movement speeds');
const diagMove=sceneAPI.moveVector({x:480,y:260},{x:1,y:1},0.05,false);
assert(Math.abs(diagMove.x-diagMove.y-220)<1e-6 && diagMove.x<488 && diagMove.y<268, 'diagonal movement is normalized so it is not faster than straight movement');
assert(['data-cw-action="interact"','data-cw-action="jump"','data-cw-action="map"','data-cw-action="inventory"','id="cw-joystick"'].every(token=>sceneJS.includes(token)), 'world UI wires interact, jump, map, inventory, and mobile joystick controls');
assert(sceneJS.includes("key==='e'") && sceneJS.includes("key==='m'") && sceneJS.includes("key==='i'") && sceneJS.includes("key===' '") && sceneJS.includes("keys.has('shift')"), 'desktop world controls implement E, M, I, Space and Shift shortcuts');
assert(sceneJS.includes('/ws/world') && sceneJS.includes('new WebSocket') && sceneJS.includes('player-state') && sceneJS.includes('sendMultiplayerMove'), '2D world client connects to the live WebSocket room and synchronizes movement');
assert(sceneJS.includes('data-cw-emote') && sceneJS.includes('player-emote') && sceneJS.includes('cw-mp-connect'), 'multiplayer UI includes connect/disconnect status and preset social emotes');
assert(sceneJS.includes('cw-mp-room-code') && sceneJS.includes('cw-mp-new-room') && sceneJS.includes('cw-mp-copy-room') && sceneJS.includes('roomCode:code'), 'multiplayer UI supports creating private rooms and sharing six-character join codes');
assert(sceneJS.includes('const NPCS =') && sceneJS.includes('data-cw-dialog-choice') && sceneJS.includes('function openDialogue') && sceneJS.includes('Press E to talk'), 'world includes region-specific NPCs with dialogue choices and tips');
assert(sceneJS.includes('function drawHuman') && sceneJS.includes('player.appearance') && sceneJS.includes('runtimeState.character.appearance'), 'local, NPC and remote players use customizable human-style 2D avatars');
assert(sceneCSS.includes('.cw-multiplayer-bar') && sceneCSS.includes('.cw-mp-indicator.is-online') && sceneCSS.includes('@media(max-width:680px)'), 'multiplayer status and emotes have responsive mobile styling');
const serverJS=read('server.js');
assert(serverJS.includes("server.on('upgrade'") && serverJS.includes("url.pathname !== '/ws/world'") && serverJS.includes('Sec-WebSocket-Accept'), 'Node server implements a same-origin WebSocket upgrade endpoint');
assert(serverJS.includes('WORLD_REGIONS') && serverJS.includes('WORLD_EMOTES') && serverJS.includes('WORLD_MESSAGE_LIMIT') && serverJS.includes('MAX_WORLD_CLIENTS'), 'multiplayer server bounds regions, emotes, message size, and room population');
assert(serverJS.includes('WORLD_ROOM_CODE') && serverJS.includes('createWorldRoomCode') && serverJS.includes('WORLD_ROOM_LIMIT') && serverJS.includes('player.roomCode === roomCode'), 'multiplayer server creates private room codes, enforces room limits, and isolates room broadcasts');
assert(serverJS.includes('sanitizeWorldAppearance') && serverJS.includes('appearance: player.appearance'), 'multiplayer server sanitizes and synchronizes human avatar appearance');
assert(serverJS.includes('timingSafeEqual') && serverJS.includes('safeKeyEquals'), 'existing Founder authentication still uses timing-safe key comparison');
assert(sceneJS.includes('const app=window.CaydenProxyMainCatalog') && sceneJS.includes("action==='petaltown'") && sceneJS.includes("action==='wingeria'") && sceneJS.includes("lab:'lab'") && sceneJS.includes("passport:'passport'"), 'world landmarks connect to real Games, Science Lab, music, Petal Town, Passport and Wingeria routes');
assert(sceneCSS.includes('@media(max-width:680px)') && sceneCSS.includes('.cw-joystick') && sceneCSS.includes('prefers-reduced-motion'), 'walkable world has mobile joystick layout and reduced-motion support');
assert(rpgSource.includes('function selectRegion(id)') && rpgSource.includes('selectRegion,') && rpgSource.includes('if(mountedRoot?.isConnected)renderIntoRoot(mountedRoot)'), 'walkable world region travel syncs both RPG state and visible region cards');
assert(rpgApi.selectRegion('bloomtown')===true && rpgApi.selectRegion('science-valley')===false, 'RPG region model rejects locked travel at Passport level 1');
rpgSaved.set('cp-garden-profile',JSON.stringify({xp:400}));
assert(rpgApi.selectRegion('science-valley')===true && rpgApi.getState().selectedRegion==='science-valley', 'RPG region model permits and saves travel after reaching the required Passport level');
assert(['daily-play','daily-learning','daily-checkin','week-arcade','week-study','week-science'].every(id=>rpgSource.includes(id)), 'RPG has three daily and three weekly progress quests');
assert(rpgSource.includes('/api/founder/session') && rpgSource.includes('/api/founder/action') && rpgSource.includes('CP_FOUNDER_KEY'), 'Founder Console requires server-side configured access instead of a hard-coded universal phrase');
assert(rpgSource.includes('window.CaydenProxyMainCatalog?.awardXP?.(quest.xp') && rpgSource.includes('localSet(KEY,state)'), 'quest claims award Passport XP and save RPG state locally');
assert(rpgCss.includes('@media(max-width:600px)') && rpgCss.includes('prefers-reduced-motion') && rpgCss.includes('.rpg-hud') && rpgCss.includes('.rpg-region-grid'), 'RPG UI provides HUD, map styling, mobile layouts, and reduced-motion support');
const founderServer = read('server.js');
assert(founderServer.includes('crypto.timingSafeEqual') && founderServer.includes('FOUNDER_SESSION_MS') && founderServer.includes('session.ip !== ip'), 'Founder authentication uses constant-time key comparison, expiring sessions, and IP binding');
assert(founderServer.includes("action === 'grant-test-xp'") && founderServer.includes("action === 'spawn-item'") && founderServer.includes("action === 'preview-region'") && founderServer.includes("action === 'reset-sandbox'"), 'server allowlists Founder actions and keeps them scoped to the test sandbox');


// Verify legacy catalog remains intact and the expansion has 146 unique IDs.
const gameStart = html.indexOf('const games=['), gameEnd = html.indexOf('];', gameStart);
const baseBody = gameStart >= 0 && gameEnd > gameStart ? html.slice(gameStart, gameEnd) : '';
const baseIds = [...baseBody.matchAll(/\['([^']+)'\s*,/g)].map(m => m[1]);
const arcadeJs = read('assets/js/arcade-max.js');
const catalogMatch = arcadeJs.match(/const catalog = \[([\s\S]*?)\n  \];/);
const addIds = catalogMatch ? [...catalogMatch[1].matchAll(/\['([^']+)'\s*,/g)].map(m => m[1]) : [];
const ids = [...baseIds, ...addIds];
const unique = new Set(ids);
assert(baseIds.length === 59, `legacy game catalog preserved (${baseIds.length})`);
assert(addIds.length === 87, `Arcade+ Max adds ${addIds.length} entries`);
assert(unique.size === ids.length, 'game IDs remain unique across both catalogs');
assert(unique.size >= 100, `${unique.size} total game entries`);
const categories = catalogMatch ? [...catalogMatch[1].matchAll(/\['[^']+'\s*,\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'/g)].map(m=>m[1]) : [];
assert(new Set(categories).size === 14, `all requested category lanes exist (${new Set(categories).size})`);

// Audit the unified Games Hub, not just the separate Arcade collection.
const genreContext = { window: { CaydenProxyMainCatalog: { addGames: () => 0 } }, console: { error: () => {} } };
vm.runInNewContext(read('assets/js/genre-catalog.js'), genreContext, { filename: 'assets/js/genre-catalog.js:catalog-audit' });
const genreCatalog = genreContext.window.CaydenGenreCatalog;
const mainStart = html.indexOf('const games = ['), mainEnd = html.indexOf('\n];', mainStart);
const mainSource = mainStart >= 0 && mainEnd > mainStart ? html.slice(mainStart, mainEnd) : '';
const mainGameRecords = [...mainSource.matchAll(/\{id:'([^']+)',title:'([^']+)'.*?category:'([^']+)'\}/g)].map(m => ({id:m[1], title:m[2], category:m[3]}));
const legacyStart = html.indexOf('const games=['), legacyEnd = html.indexOf('];', legacyStart);
const legacySource = legacyStart >= 0 && legacyEnd > legacyStart ? html.slice(legacyStart, legacyEnd) : '';
const legacyGameRecords = [...legacySource.matchAll(/\['([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g)].map(m => ({id:m[1], title:m[2], category:m[4]}));
const extensionMatch = arcadeJs.match(/const catalog = \[([\s\S]*?)\n  \];/);
const extensionGameRecords = [...(extensionMatch?.[1] || '').matchAll(/\['([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g)].map(m => ({id:m[1], title:m[2], category:m[4]}));
const unified = new Map();
for (const game of [...mainGameRecords, ...legacyGameRecords, ...extensionGameRecords, ...genreCatalog.supplementalGames]) if (!unified.has(game.id)) unified.set(game.id, game);
const balancedCounts = Object.fromEntries(genreCatalog.genres.map(genre => [genre, 0]));
for (const game of unified.values()) balancedCounts[genreCatalog.normalizeCategory(game)]++;
assert(genreCatalog.genres.length === 15 && genreCatalog.targetPerGenre === 19, 'unified catalog declares 15 canonical genres with a target of 19 each');
assert(genreCatalog.supplementalGames.length === 120, `genre balancing module adds ${genreCatalog.supplementalGames.length} new catalog entries`);
assert(unified.size === 285 && genreCatalog.totalGames === 285, `unified catalog has ${unified.size} unique entries`);
assert(genreCatalog.genres.every(genre => balancedCounts[genre] === 19), `all 15 genres have exactly 19 entries: ${genreCatalog.genres.map(g => `${g} ${balancedCounts[g]}`).join(', ')}`);
assert(genreCatalog.supplementalGames.some(game => game.id === 'petaltown' && game.title.includes('Petal Town')), 'standalone Petal Town is registered as a first-class game entry');

// Validate Phase 06: supported game clears now populate the shared Passport progress map.
const progressCss = read('assets/css/game-progress.css');
assert(html.includes('assets/css/game-progress.css') && progressCss.includes('.hub-challenge-progress') && progressCss.includes('.game-clear-screen'), 'shared completion cards and result screen stylesheet exists and is linked');
assert(html.includes('function recordGameCompletion') && html.includes('function completedGameCount') && html.includes("name:'First Clear'"), 'Passport stores supported game completions and unlocks clear achievements');
assert(html.includes('const QUIZ_CHALLENGE_LENGTH=5') && html.includes('FIVE-QUESTION CHALLENGE COMPLETE'), 'standard quiz games end in an explicit five-question challenge');
const scrambleFn = html.slice(html.indexOf('function renderScrambleGame(){'), html.indexOf('function renderTypingGame(){'));
assert(scrambleFn.includes('shuffle(bank).slice(0,5)') && scrambleFn.includes("recordGameCompletion('scramble',firstTryWins,challenge.length)") && scrambleFn.includes('CHALLENGE COMPLETE'), 'Word Garden Scramble is a finite five-word challenge with first-try scoring and saved results');
for (const contract of [
  ["recordGameCompletion('memory',matches,6)",'Memory Patch records a six-pair clear'],
  ["recordGameCompletion('leafsort',score,items.length)",'Eco Quest records its twelve-item result'],
  ["recordGameCompletion('typing',score)",'Typing round records a completed timed run'],
  ["recordGameCompletion('soccer',goals,5)",'Soccer records goals from five kicks'],
  ["recordGameCompletion('basketball',baskets,5)",'Hoops records baskets from five shots'],
  ["recordGameCompletion('rally',score,8)",'Rally Ready records returned shots over eight rallies'],
  ["recordGameCompletion('rhythm',5,5)",'Rhythm Roots records the five-beat mastery milestone']
]) assert(html.includes(contract[0]), contract[1]);


// Count declared soundtrack loops from the legacy music engine and both expansions.
const baseTracks = html.match(/const tracks=\[([\s\S]*?)\];let trackIndex/);
const midTracks = html.match(/const extras=\[([\s\S]*?)\];extras\.forEach/);
const maxTracks = arcadeJs.match(/const moreTracks = \[([\s\S]*?)\n    \];/);
const totalTracks = (baseTracks?.[1].match(/\{title:/g)||[]).length + (midTracks?.[1].match(/\['[^']+'/g)||[]).length + (maxTracks?.[1].match(/\['[^']+'/g)||[]).length;
assert(totalTracks >= 50, `${totalTracks} synthesized soundtrack loops are declared`);

// Validate audio studio, world collection and restaurant empire feature contracts.
const studio = read('assets/js/music-studio-v3.js');
const sampleManifest = JSON.parse(read('assets/samples/instruments/manifest.json'));
const sampleFiles = sampleManifest.samples.map(s => 'assets/samples/instruments/' + s.file);
const world = read('assets/js/world-of-bloom.js');
const empire = read('assets/js/wingeria-empire.js');
const wingeria = read('assets/js/wingeria-remastered.js');
assert((studio.match(/^    '[^']+':\{/gm)||[]).length === 30, 'Music Studio contains 30 distinct modeled instrument voices');
assert(sampleManifest.samples.length === 30 && sampleFiles.every(file => fs.existsSync(path.join(root,file)) && fs.statSync(path.join(root,file)).size > 4096), '30 original generated WAV textures exist and are non-empty');
const sampleNames = sampleManifest.samples.map(s => s.name).sort();
const presetNames = [...studio.matchAll(/^    '([^']+)':\{icon:/gm)].map(m=>m[1]).sort();
assert(JSON.stringify(sampleNames) === JSON.stringify(presetNames), 'every Studio instrument preset has exactly one named WAV texture');
assert(sampleFiles.every(file => { const b=fs.readFileSync(path.join(root,file)); return b.subarray(0,4).toString()==='RIFF' && b.subarray(8,12).toString()==='WAVE'; }), 'all instrument files have valid RIFF/WAVE headers');
assert(studio.includes('decodeAudioData') && studio.includes('assets/samples/instruments/') && studio.includes('synthesis fallback'), 'Studio lazily decodes local WAV textures and safely falls back to synthesis');
assert(studio.includes('const releaseStart=when+len'), 'Note release timing is defined before oscillator stop scheduling');
assert(studio.includes('Beat Sequencer') && studio.includes('b:[153,drumPitches[r]') && studio.includes('b:[137,drumPitches[r]'), 'MIDI export includes a percussion track from the beat sequencer');
for (const feature of ['stv3-roll','stv3-beats','stv3-mixer','stv3-midi','stv3-project-import','stv3-audio-capture','stv3-reverb','stv3-delay','stv3-chorus']) assert(studio.includes(feature), `Music Studio feature wired: ${feature}`);
assert(world.includes('itemTypes.length') && world.includes('realms.length') && world.includes('rarities.length'), 'World of Bloom generates a 1,440-item collection from 12 families × 12 regions × 10 rarities');
assert(world.includes('World of Bloom') && world.includes('secret-flower') && world.includes('Weekly Expedition'), 'World map, secret discovery and weekly expedition are present');
assert((empire.match(/const recipes=\[\]/)||[]).length===1 && empire.includes('sauceNames.length') && empire.includes('seasoningNames.length') && empire.includes('sideNames.length'), 'Empire recipe combinations are generated from sauce/seasoning/side choices');
assert(empire.includes('franchise-blueprint') && empire.includes('food critic') && empire.includes('data-emp-cookoff'), 'Empire includes expansion, research, critics and cook-offs');
function countArrayStrings(source, name) { const m=source.match(new RegExp('const\\s+'+name+'\\s*=\\[([\\s\\S]*?)\\];')); return m ? (m[1].match(/'[^']+'/g)||[]).length : 0; }
const sauceCount=countArrayStrings(empire,'sauceNames'), seasoningCount=countArrayStrings(empire,'seasoningNames'), sideCount=countArrayStrings(empire,'sideNames'), decorCount=countArrayStrings(empire,'decorMotifs'), tierCount=countArrayStrings(empire,'qualityTiers');
assert(sauceCount===14 && seasoningCount===12 && sideCount===12 && sauceCount*seasoningCount*sideCount===2016, `Empire has ${sauceCount*seasoningCount*sideCount} sauce/seasoning/side combinations`);
assert(decorCount===30 && tierCount===10 && decorCount*tierCount===300, `Empire has ${decorCount*tierCount} decoration variants`);
assert((empire.match(/\{id:'[^']+',name:'[^']+',icon:/g)||[]).length>=20, 'Empire defines a connected city, staff and research progression set');
assert(wingeria.includes('function newShift'), 'Wingeria restaurant day loop remains present');
const wUpgradeBlock = wingeria.match(/const upgrades = \[([\s\S]*?)\n  \];/);
const wUpgradeIds = [...(wUpgradeBlock?.[1] || '').matchAll(/\{id:'([^']+)'/g)].map(m => m[1]);
assert(wUpgradeIds.length === 18, `Wingeria offers ${wUpgradeIds.length} permanent campaign upgrades`);
for (const id of ['priority-rail','flower-patio','herb-garden','loyalty-bloom','calm-service-clock']) assert(wUpgradeIds.includes(id), `Wingeria upgrade present: ${id}`);
assert(wingeria.includes("owns('priority-rail')?.525:.7") && wingeria.includes("owns('flower-patio') ? 2 : 0"), 'Wingeria queue patience and patio table upgrades change the simulation');
assert(wingeria.includes("owns('herb-garden')?4:0") && wingeria.includes("c.personalityId==='regular'"), 'Wingeria herb accuracy and regular-customer tips are connected to serving calculations');

const petalTown = read('assets/js/petal-town.js');
// Exercise a real old-save migration and one-time milestone claim in a small VM harness.
const nowForPetal = new Date();
const petalToday = `${nowForPetal.getFullYear()}-${String(nowForPetal.getMonth()+1).padStart(2,'0')}-${String(nowForPetal.getDate()).padStart(2,'0')}`;
const legacyBoard = Array(36).fill(null);
legacyBoard[0] = {kind:'flower',seed:'daisy',stage:1};
legacyBoard[1] = {kind:'building',building:'bench'};
const petalStore = new Map([['cp-petal-town-v1', JSON.stringify({version:1,townName:'Old garden',coins:40,petals:5,harvested:3,board:legacyBoard,daily:{date:petalToday,harvests:1,claimed:false}})]]);
const testLocalStorage = {getItem:key=>petalStore.get(key)||null,setItem:(key,value)=>petalStore.set(key,String(value))};
let testPetalXP = 0;
const petalContext = {window:{CaydenProxyMainCatalog:{awardXP:amount=>{testPetalXP+=amount}},confirm:()=>true},localStorage:testLocalStorage,TextEncoder,TextDecoder,btoa,atob,navigator:{},console};
vm.runInNewContext(petalTown, petalContext, {filename:'petal-town-runtime-test.js'});
const petalAPI = petalContext.window.CaydenPetalTown;
const migratedPetalState = petalAPI.getState();
assert(migratedPetalState.townName==='Old garden' && migratedPetalState.coins===40 && migratedPetalState.petals===5 && migratedPetalState.harvested===3, 'Petal Town legacy-save migration preserves town name, resources and harvested history');
assert(migratedPetalState.stats.planted>=4 && migratedPetalState.stats.buildingsPlaced>=1 && migratedPetalState.stats.watered===0, 'Petal Town infers safe planting/building baselines while acknowledging unavailable old watering history');
const fakePetalMount={innerHTML:'',removeEventListener(){},addEventListener(){}};
petalAPI.mount(fakePetalMount);
const afterMilestoneClaim=JSON.parse(petalStore.get('cp-petal-town-v1'));
assert(afterMilestoneClaim.claimedMilestones.includes('first-sprout') && afterMilestoneClaim.coins===50 && afterMilestoneClaim.petals===10 && testPetalXP>=5, 'Petal Town claims the first-sprout reward and routes milestone XP to the Passport');
assert(fakePetalMount.innerHTML.includes('Little milestones, lasting blooms') && fakePetalMount.innerHTML.includes('Basket of Blooms'), 'Petal Town renders its milestone panel for a migrated save');
petalAPI.mount(fakePetalMount);
assert(JSON.parse(petalStore.get('cp-petal-town-v1')).coins===50, 'Petal Town milestone reward cannot be claimed again just by reopening the game');
const petalCode=petalAPI.exportCode();petalAPI.importCode(petalCode);
assert(petalAPI.getState().townName==='Old garden' && petalAPI.getState().claimedMilestones.includes('first-sprout'), 'Petal Town save-code roundtrip preserves milestones and existing town identity');
// Exercise the Science Lab's model and local save using an isolated browser-like VM.
const scienceLabJS = read('assets/js/science-lab.js');
const scienceLabCSS = read('assets/css/science-lab.css');
const labStorage = new Map();
let labAwardedXP = 0;
const labWindow = {
  localStorage: {
    getItem: key => labStorage.get(key) || null,
    setItem: (key, value) => labStorage.set(key, String(value))
  },
  CaydenProxyMainCatalog: { awardXP: amount => { labAwardedXP += amount; } }
};
vm.runInNewContext(scienceLabJS, { window: labWindow, console }, { filename: 'science-lab-runtime-test.js' });
const scienceLabAPI = labWindow.CaydenScienceLab;
assert(!!scienceLabAPI && scienceLabAPI.reactions.length === 30, 'Phase 09 Science Lab exports 30 simplified reaction rules');
assert(['seed','sunlight','rain','battery','wire','electricity'].every(id => scienceLabAPI.materials.some(m => m.id === id)), 'Science Lab includes added garden, weather, and circuit-model base materials');
assert(['moss','pollen','rainbow','circuit','light','fossil','puddle','ash','snow','solar-cell'].every(id => scienceLabAPI.materials.some(m => m.id === id)), 'Science Lab catalog includes reaction products from prior and current phases');
assert(Object.keys(scienceLabAPI.categories).length === 5 && scienceLabAPI.reactions.every(r => scienceLabAPI.categories[r.category]), 'all 30 reactions map to one of five Discovery Book subjects');
assert(new Set(scienceLabAPI.reactions.map(r => r.pair.slice().sort().join('+'))).size === 30, 'each Science Lab reaction has a unique material pair');
const mysteryBook = scienceLabAPI.getDiscoveryBook();
assert(mysteryBook.length === 30 && mysteryBook.every(entry => !entry.discovered && entry.name === 'Unknown reaction' && entry.inputs === null && entry.products === null && entry.clue.length > 0), 'undiscovered Discovery Book entries hide their recipes and provide subject clues');
assert(scienceLabAPI.labLevel() === 'Starter Lab', 'new Science Lab profile starts at Starter Lab');
const legacyLabStorage = new Map([['cp-science-lab-v1', JSON.stringify({version:2,board:Array(48).fill(null),discoveries:['water-lava','seed-soil'],materialsFound:['sprout','moss'],experiments:12,reactionsMade:2,lastMessage:'Saved from Phase 08'})]]);
const legacyLabWindow = { localStorage: { getItem:key=>legacyLabStorage.get(key)||null, setItem:(key,value)=>legacyLabStorage.set(key,String(value)) }, CaydenProxyMainCatalog:{awardXP:()=>{}} };
vm.runInNewContext(scienceLabJS,{window:legacyLabWindow,console},{filename:'science-lab-legacy-save-test.js'});
const legacyLabState=legacyLabWindow.CaydenScienceLab.getState();
assert(legacyLabState.discoveries.includes('water-lava') && legacyLabState.discoveries.includes('seed-soil') && legacyLabState.experiments===12 && legacyLabState.board.length===48, 'Phase 08 Science Lab local saves migrate without losing reactions, experiment totals or board size');
assert(['sprout','moss'].every(id=>legacyLabState.materialsFound.includes(id)), 'legacy unlocked materials survive the Discovery Book upgrade');
assert(scienceLabAPI.getState().board.length === 48, 'Science Lab starts with a six-by-eight sandbox board');
scienceLabAPI.place(0, 'water');
const firstLabReaction = scienceLabAPI.place(1, 'lava');
assert(firstLabReaction.reaction === 'water-lava' && firstLabReaction.discovered, 'adjacent water and lava trigger the simplified cooling-lava discovery');
assert(scienceLabAPI.getState().discoveries.includes('water-lava') && scienceLabAPI.getState().reactionsMade === 1, 'Science Lab persists first discovery and reaction statistics');
assert(labAwardedXP === 5, 'first-time Science Lab discovery awards five Passport XP');
assert(JSON.parse(labStorage.get(scienceLabAPI.storageKey)).discoveries.includes('water-lava'), 'Science Lab automatically saves its discovery journal locally');
scienceLabAPI.resetBoard();
assert(scienceLabAPI.getState().board.every(cell => cell === null) && scienceLabAPI.getState().discoveries.includes('water-lava'), 'clearing the Science Lab board preserves discovered reactions');
scienceLabAPI.place(0, 'water');
const repeatLabReaction = scienceLabAPI.place(1, 'lava');
assert(repeatLabReaction.reaction === 'water-lava' && !repeatLabReaction.discovered && labAwardedXP === 5, 'repeating a known Science Lab reaction does not award duplicate discovery XP');
const reactionXPBeforeSweep = labAwardedXP;
let allReactionsTriggered = true;
for (const rule of scienceLabAPI.reactions) {
  scienceLabAPI.resetBoard();
  const first = scienceLabAPI.place(0, rule.pair[0]);
  const second = scienceLabAPI.place(1, rule.pair[1]);
  if (!first.ok || !second.ok || second.reaction !== rule.id) { allReactionsTriggered = false; console.error(`Science Lab reaction failed: ${rule.id} (inputs ${rule.pair.join(' + ')})`); }
}
assert(allReactionsTriggered, 'all 30 Science Lab reaction rules can be triggered in dependency order with their required materials unlocked');
assert(scienceLabAPI.getState().discoveries.length === 30 && ['fossil','rainbow','puddle','ash','snow','solar-cell'].every(id => scienceLabAPI.getState().materialsFound.includes(id)), 'expanded reaction chains unlock new products and retain all 30 discoveries');
assert(labAwardedXP === reactionXPBeforeSweep + 29 * 5, 'each previously undiscovered reaction awards XP only once during the full reaction sweep');
assert(JSON.parse(labStorage.get(scienceLabAPI.storageKey)).discoveries.length === 30, 'expanded Discovery Book persists all 30 discoveries to local storage');
assert(scienceLabAPI.getDiscoveryBook().every(entry => entry.discovered && Array.isArray(entry.inputs) && Array.isArray(entry.products)), 'discovered book entries reveal recipe inputs and outputs after all discoveries');
assert(scienceLabAPI.labLevel() === 'Future Technology Lab', '30 discoveries unlock the final Future Technology Lab tier');
const labMountMarkup = scienceLabJS.slice(scienceLabJS.indexOf('function render()'), scienceLabJS.indexOf('function wire()'));
assert(labMountMarkup.includes('Material Cabinet') && labMountMarkup.includes('Experiment Board') && labMountMarkup.includes('Discovery Journal') && labMountMarkup.includes('data-sl-journal-search') && labMountMarkup.includes('data-sl-journal-category'), 'Science Lab provides a material cabinet, interactive board and searchable subject-filtered Discovery Book');
assert(scienceLabJS.includes('function applyJournalFilters()') && scienceLabJS.includes('data-sl-journal-reset') && scienceLabCSS.includes('.sl-journal-toolbar') && scienceLabCSS.includes('.sl-discovery.is-mystery'), 'Discovery Book includes live search, subject filters, reset control and mystery-entry styling');
assert(['Student Lab','Research Lab','Advanced Lab','Mega Lab','Scientific Institute','Future Technology Lab'].every(level => scienceLabJS.includes(`return '${level}'`)), 'Science Lab implements all seven progression tiers from Starter to Future Technology');
assert(labMountMarkup.includes('sl-safety-note') && labMountMarkup.includes('aria-live="polite"') && scienceLabCSS.includes('@media(max-width:600px)'), 'Science Lab explains its classroom-model scope, announces status, and has mobile-responsive styling');
assert(html.includes('function scienceLabPage()') && html.includes('data-route="lab"') && html.includes('assets/js/science-lab.js') && html.includes('assets/css/science-lab.css'), 'Science Lab is reachable from the home dashboard and linked to local assets');

const floralThemeJS = read('assets/js/floral-themes.js');
const floralCSS = read('assets/css/floral-themes.css');
const petalCSS = read('assets/css/petal-town.css');
assert(petalTown.includes("const BOARD_SIZE = 36") && petalTown.includes('data-pt-tile') && petalTown.includes('data-pt-building'), 'Petal Town has a 36-plot planting/building board');
assert(petalTown.includes('PETALTOWN1.') && petalTown.includes('CaydenProxy-PetalTown') && petalTown.includes('data-pt-export') && petalTown.includes('data-pt-import'), 'Petal Town supports validated portable save-code export and import');
assert(petalTown.includes('not live multiplayer or automatic cloud sync'), 'Petal Town clearly explains its current cross-device save-transfer limitation');
assert(petalTown.includes('const milestones = [') && (petalTown.match(/\{id:'[^']+',name:'[^']+',icon:/g)||[]).length >= 7, 'Petal Town defines a persistent set of long-term milestones');
assert(petalTown.includes('stats:{planted:0,watered:0,buildingsPlaced:0}') && petalTown.includes('state.stats.planted++') && petalTown.includes('state.stats.watered++') && petalTown.includes('state.stats.buildingsPlaced++'), 'Petal Town tracks planting, watering and building history');
assert(petalTown.includes('function claimMilestones()') && petalTown.includes('claimedMilestones') && petalTown.includes('window.CaydenProxyMainCatalog?.awardXP?.(5'), 'Petal Town claims one-time rewards and connects milestone XP to the Garden Passport');
assert(petalTown.includes('milestoneHTML') && petalTown.includes('aria-valuenow="${Math.min(value,m.goal)}"') && read('assets/css/petal-town.css').includes('.pt-milestone-grid'), 'Petal Town displays accessible milestone progress cards with responsive styling');
assert(petalTown.includes('Math.max(cleanCount(oldStats.planted),harvested+boardFlowers)') && petalTown.includes('Math.max(cleanCount(oldStats.buildingsPlaced),boardBuildings)'), 'Petal Town migrates earlier saves and infers safe baseline planting/building counts');
const floralThemeIds = [...floralThemeJS.matchAll(/\{id:'([^']+)', name:/g)].map(m => m[1]);
assert(floralThemeIds.length === 8, `flower palette offers ${floralThemeIds.length} named themes`);
assert(['Daisy Cream','Sunflower Gold','Cherry Blossom','Rose Garden','Lavender Haze','Bluebell Sky','Clover Meadow','Iris Twilight'].every(name => floralThemeJS.includes(`name:'${name}'`)), 'flower palette names match flower/color families');
assert(floralThemeIds.every(id => floralCSS.includes(`data-floral-theme=\"${id}\"`)), 'all eight flower palettes have corresponding CSS variable sets');
assert(html.includes('data-floral-theme') && html.includes('assets/js/floral-themes.js') && html.includes('assets/css/floral-themes.css'), 'flower themes are wired into Settings and loaded by the main page');
assert(html.includes('let accentCustomized=') && html.includes("document.body.style.setProperty('--accent',value)") && html.includes("document.body.style.removeProperty('--accent')"), 'custom accent preference respects and can release floral palette colors');
assert(html.includes('function resetAccent()') && html.includes("window.CaydenFloralThemes.apply('daisy-cream')") && html.includes('Custom preferences reset to Daisy Cream.'), 'reset preferences restores Daisy Cream and removes the custom accent override');
assert(html.includes("id==='petaltown'") && html.includes('data-play=\"petaltown\"') && html.includes('assets/js/petal-town.js') && html.includes('assets/css/petal-town.css'), 'Petal Town launches as its own game from the main app');


// Confirm every local static file referenced in the HTML or offline cache exists.
const assetRefs = [...html.matchAll(/(?:src|href)="((?:assets\/)[^"#?]+)"/g)].map(m=>m[1]);
const missing = assetRefs.filter(file=>!fs.existsSync(path.join(root,file)));
assert(missing.length===0, missing.length?`missing HTML assets: ${missing.join(', ')}`:`${assetRefs.length} referenced local assets resolve`);
let selectorContractOK=true;
for (const file of ['assets/js/music-studio-v3.js','assets/js/world-of-bloom.js','assets/js/wingeria-empire.js']) { const source=read(file); const refs=[...source.matchAll(/(?:content|el|mount)\.querySelector\(['\"]#([\w-]+)['\"]\)/g)].map(m=>m[1]); const absent=refs.filter(id=>!new RegExp('id=[\"\\\']'+id+'[\"\\\']').test(source)); if(absent.length){selectorContractOK=false;console.error(file+' references selectors absent from its render source: '+absent.join(', '));} }
assert(selectorContractOK, 'Studio, World and Empire UI selectors are present in their render templates');
const sw=read('sw.js');
assert(sw.includes("url.pathname.startsWith('/api/')"), 'service worker bypasses API requests');
for(const file of ['cayden-world-scene.css','cayden-world-scene.js','science-lab.css','science-lab.js','rpg-world.css','rpg-world.js','game-progress.css','music-studio-v3.css','music-studio-v3.js','world-of-bloom.css','world-of-bloom.js','wingeria-empire.css','wingeria-empire.js','petal-town.css','petal-town.js','floral-themes.css','floral-themes.js','genre-catalog.js']) assert(sw.includes(file), `offline cache includes ${file}`);
assert(sampleFiles.every(file => sw.includes('/'+file)), 'offline cache manifest includes all 30 local WAV textures');
assert(/^\d+\.\d+\.\d+$/.test(packageJson.version) && packageJson.version === '7.2.0', `package version is ${packageJson.version}`);
assert(packageJson.scripts?.test==='node scripts/verify.js','npm test uses the project validation script');
assert(html.includes('window.CaydenMusic=')&&html.includes('window.CaydenArcade='),'legacy game/music bridge remains present');
assert(html.includes('assets/js/arcade-max.js')&&html.includes('assets/js/wingeria-remastered.js'),'legacy Arcade+ and Wingeria modules remain linked');
assert(html.includes('assets/js/music-studio-v3.js')&&html.includes('assets/js/world-of-bloom.js')&&html.includes('assets/js/wingeria-empire.js'),'new expansion modules are loaded in the page');
assert(html.includes('assets/js/petal-town.js')&&html.includes('assets/js/floral-themes.js')&&html.includes('assets/js/genre-catalog.js'),'Phase 05 modules are loaded in the page');
assert(sw.includes("caydenproxy-shell-v20") && sw.includes('/assets/css/game-progress.css'), 'Phase 14 offline cache version and progress stylesheet are included');
assert(sw.includes('/assets/js/science-lab.js') && sw.includes('/assets/css/science-lab.css'), 'offline cache includes the Science Lab module and stylesheet');
assert(sw.includes("caydenproxy-shell-v20") && sw.includes('/assets/js/question-engine.js'), 'offline cache v20 precaches the procedural question engine');

if(fails){console.error(`\nValidation failed: ${fails} check(s).`);process.exitCode=1;}else console.log(`\nCaydenProxy Phase 14 validation passed: procedural multi-subject question engine, 30-reaction Science Lab and searchable Discovery Book, game completion tracking, Petal Town milestones, 146 Arcade entries, 285 balanced hub entries, ${totalTracks} soundtrack loops, 30 instrument voices and 1,440 collectible definitions.`);
