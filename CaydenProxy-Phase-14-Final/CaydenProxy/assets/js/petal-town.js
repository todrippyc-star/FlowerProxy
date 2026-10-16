/* Petal Town: a standalone garden-and-town builder for CaydenProxy. */
(() => {
  'use strict';
  const SAVE_KEY = 'cp-petal-town-v1';
  const BOARD_SIZE = 36;
  const seedTypes = [
    {id:'daisy',name:'Daisy',icon:'🌼',cost:0,coins:8,petals:3,desc:'Friendly starter flower'},
    {id:'sunflower',name:'Sunflower',icon:'🌻',cost:4,coins:12,petals:5,desc:'Bright and sunny'},
    {id:'tulip',name:'Tulip',icon:'🌷',cost:6,coins:10,petals:4,desc:'A colorful classic'},
    {id:'lavender',name:'Lavender',icon:'🪻',cost:5,coins:11,petals:5,desc:'Calm, fragrant blooms'},
    {id:'bluebell',name:'Bluebell',icon:'🪻',cost:5,coins:10,petals:4,desc:'Soft blue-violet bells'},
    {id:'rose',name:'Rose',icon:'🌹',cost:10,coins:16,petals:8,desc:'A premium garden bloom'}
  ];
  const buildings = [
    {id:'bench',name:'Garden Bench',icon:'🪑',cost:18,level:1,desc:'A cozy place to rest'},
    {id:'path',name:'Flower Path',icon:'🪨',cost:22,level:1,desc:'A little stone walkway'},
    {id:'cottage',name:'Petal Cottage',icon:'🏡',cost:65,level:2,desc:'Give your town a home'},
    {id:'flower-shop',name:'Flower Shop',icon:'🏪',cost:85,level:2,desc:'A proper bloom business'},
    {id:'fountain',name:'Dewdrop Fountain',icon:'⛲',cost:90,level:3,desc:'The town gathering spot'},
    {id:'greenhouse',name:'Glass Greenhouse',icon:'🏠',cost:125,level:4,desc:'A beautiful growing space'},
    {id:'cafe',name:'Lavender Café',icon:'☕',cost:145,level:5,desc:'A place to sip and unwind'},
    {id:'townhall',name:'Bloom Town Hall',icon:'🏛️',cost:190,level:6,desc:'Your town’s proud center'}
  ];
  const milestones = [
    {id:'first-sprout',name:'First Sprout',icon:'🌱',desc:'Plant your first flower.',goal:1,unit:'flowers planted',progress:s=>s.stats.planted,coins:10,petals:5},
    {id:'gentle-watering',name:'Gentle Gardener',icon:'💧',desc:'Water flowers ten times.',goal:10,unit:'watering actions',progress:s=>s.stats.watered,coins:15,petals:10},
    {id:'first-harvest',name:'Basket of Blooms',icon:'🌼',desc:'Harvest five flowers.',goal:5,unit:'flowers harvested',progress:s=>s.harvested,coins:20,petals:12},
    {id:'town-builder',name:'Town Builder',icon:'🏡',desc:'Place three buildings.',goal:3,unit:'buildings placed',progress:s=>s.stats.buildingsPlaced,coins:25,petals:15},
    {id:'flower-festival',name:'Flower Festival',icon:'🌷',desc:'Harvest twenty-five flowers.',goal:25,unit:'flowers harvested',progress:s=>s.harvested,coins:35,petals:20},
    {id:'cozy-neighborhood',name:'Cozy Neighborhood',icon:'🏘️',desc:'Place eight buildings over time.',goal:8,unit:'buildings placed',progress:s=>s.stats.buildingsPlaced,coins:45,petals:25},
    {id:'town-level-three',name:'Blooming Borough',icon:'🎉',desc:'Reach town level three.',goal:3,unit:'town level',progress:s=>1+Math.floor(s.petals/50),coins:40,petals:25}
  ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const newDaily = () => ({date:dayKey(),harvests:0,claimed:false});
  const defaults = () => ({version:1,townName:'Petal Town',coins:120,petals:0,harvested:0,board:Array(BOARD_SIZE).fill(null),stats:{planted:0,watered:0,buildingsPlaced:0},claimedMilestones:[],daily:newDaily()});
  function sanitizeTile(tile) {
    if (!tile || typeof tile !== 'object') return null;
    if (tile.kind === 'flower' && seedTypes.some(x=>x.id===tile.seed)) return {kind:'flower',seed:tile.seed,stage:Math.max(0,Math.min(3,Math.floor(Number(tile.stage)||0)))};
    if (tile.kind === 'building' && buildings.some(x=>x.id===tile.building)) return {kind:'building',building:tile.building};
    return null;
  }
  function sanitizeState(value) {
    const fallback=defaults();
    if (!value || typeof value!=='object' || Array.isArray(value)) return fallback;
    const board=Array.isArray(value.board)?value.board.slice(0,BOARD_SIZE).map(sanitizeTile):[];
    while(board.length<BOARD_SIZE)board.push(null);
    let daily=value.daily&&typeof value.daily==='object'?value.daily:newDaily();
    if (daily.date!==dayKey() || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(daily.date||''))) daily=newDaily();
    const cleanCount=n=>Math.max(0,Math.min(999999,Math.floor(Number(n)||0)));
    const harvested=cleanCount(value.harvested);
    const boardFlowers=board.filter(x=>x?.kind==='flower').length;
    const boardBuildings=board.filter(x=>x?.kind==='building').length;
    const oldStats=value.stats&&typeof value.stats==='object'&&!Array.isArray(value.stats)?value.stats:{};
    const allowedMilestones=new Set(milestones.map(x=>x.id));
    const claimedMilestones=[...new Set((Array.isArray(value.claimedMilestones)?value.claimedMilestones:[]).filter(x=>allowedMilestones.has(x)))];
    return {
      version:1,
      townName:String(value.townName||'Petal Town').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,24)||'Petal Town',
      coins:cleanCount(value.coins),
      petals:cleanCount(value.petals),
      harvested,
      board,
      stats:{
        planted:Math.max(cleanCount(oldStats.planted),harvested+boardFlowers),
        watered:cleanCount(oldStats.watered),
        buildingsPlaced:Math.max(cleanCount(oldStats.buildingsPlaced),boardBuildings)
      },
      claimedMilestones,
      daily:{date:daily.date,harvests:Math.min(3,cleanCount(daily.harvests)),claimed:daily.claimed===true}
    };
  }
  function load() {
    try { const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); return raw?sanitizeState(raw):defaults(); }
    catch (_) { return defaults(); }
  }
  let state=load(), selectedSeed='daisy', selectedBuilding='bench', mode='plant', mount=null, statusText='Welcome home! Plant a flower to start your garden.';
  function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(_){statusText='Browser storage is full or blocked. Use the save-code export as a backup.';}}
  function level(){return 1+Math.floor(state.petals/50)}
  function countBuildings(){return state.board.filter(x=>x?.kind==='building').length}
  function countFlowers(){return state.board.filter(x=>x?.kind==='flower').length}
  function claimMilestones(){
    const unlocked=[];let changed=true,passes=0;
    while(changed&&passes++<=milestones.length){
      changed=false;
      for(const milestone of milestones){
        if(state.claimedMilestones.includes(milestone.id)||Number(milestone.progress(state))<milestone.goal)continue;
        state.claimedMilestones.push(milestone.id);state.coins=Math.min(999999,state.coins+milestone.coins);state.petals=Math.min(999999,state.petals+milestone.petals);unlocked.push(milestone);changed=true;
      }
    }
    unlocked.forEach(m=>window.CaydenProxyMainCatalog?.awardXP?.(5,`Petal Town milestone: ${m.name}`));
    return unlocked;
  }
  function milestoneCards(){return milestones.map(m=>{const value=Math.max(0,Number(m.progress(state))||0),done=state.claimedMilestones.includes(m.id),pct=Math.max(0,Math.min(100,Math.round(value/m.goal*100)));return `<article class="pt-milestone ${done?'is-complete':''}"><div class="pt-milestone-top"><span class="pt-milestone-icon" aria-hidden="true">${m.icon}</span><span class="pt-milestone-state">${done?'✓ Reward claimed':'Milestone'}</span></div><strong>${esc(m.name)}</strong><p>${esc(m.desc)}</p><div class="pt-milestone-progress"><span>${Math.min(value,m.goal)} / ${m.goal} ${esc(m.unit)}</span><span>${pct}%</span></div><div class="pt-milestone-track" role="progressbar" aria-label="${esc(m.name)} progress" aria-valuemin="0" aria-valuemax="${m.goal}" aria-valuenow="${Math.min(value,m.goal)}"><span style="width:${pct}%"></span></div><small>Reward: +${m.coins} coins · +${m.petals} petals${done?' · collected':''}</small></article>`;}).join('')}
  function buttonPress(id,pressed){return `aria-pressed="${pressed?'true':'false'}"`}
  function tileLabel(tile,index){if(!tile)return `Empty plot ${index+1}. Click to ${mode==='build'?'place the selected building':'plant the selected flower'}.`;if(tile.kind==='flower'){const s=seedTypes.find(x=>x.id===tile.seed);return `${s.name}, growth stage ${tile.stage} of 3. Click to ${tile.stage===3?'harvest':'water'}.`;}const b=buildings.find(x=>x.id===tile.building);return `${b.name}. Building plot ${index+1}.`}
  function tileVisual(tile){if(!tile)return '<span class="pt-empty-mark" aria-hidden="true">＋</span><span class="pt-tile-caption">Plant</span>';if(tile.kind==='flower'){const s=seedTypes.find(x=>x.id===tile.seed);return `<span class="pt-flower-stage stage-${tile.stage}" aria-hidden="true">${tile.stage===0?'🌱':tile.stage===1?'🌿':tile.stage===2?'🌿':s.icon}</span><span class="pt-tile-caption">${tile.stage===3?'Ready!':tile.stage===2?'Bud':tile.stage===1?'Growing':'Sprout'}</span>`;}const b=buildings.find(x=>x.id===tile.building);return `<span class="pt-building-mark" aria-hidden="true">${b.icon}</span><span class="pt-tile-caption">${esc(b.name)}</span>`;}
  function encode(value){const bytes=new TextEncoder().encode(value);let binary='';for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);return 'PETALTOWN1.'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function decode(code){const cleaned=String(code||'').trim();if(cleaned.length>24000||!cleaned.startsWith('PETALTOWN1.'))throw new Error('That does not look like a Petal Town save code.');let b64=cleaned.slice(11).replace(/-/g,'+').replace(/_/g,'/');b64+='='.repeat((4-b64.length%4)%4);const binary=atob(b64),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));const parsed=JSON.parse(new TextDecoder().decode(bytes));if(!parsed||parsed.format!=='CaydenProxy-PetalTown'||parsed.version!==1||!parsed.state)throw new Error('This save code is not a supported Petal Town backup.');return sanitizeState(parsed.state);}
  function exportCode(){return encode(JSON.stringify({format:'CaydenProxy-PetalTown',version:1,savedAt:new Date().toISOString(),state}));}
  function render() {
    if(!mount)return;
    const flowers=countFlowers(),buildCount=countBuildings(),nextLevel=level(),dailyDone=state.daily.harvests>=3,milestoneHTML=milestoneCards();
    mount.innerHTML=`<section class="petal-town" aria-labelledby="pt-title">
      <header class="pt-hero"><div class="pt-hero-copy"><div class="pt-kicker">A separate CaydenProxy original game</div><h2 id="pt-title">🏡 ${esc(state.townName)}</h2><p>Plant your own little world. Grow blossoms, collect petals, build a cozy town, and bring your save to another device with a garden code.</p><div class="pt-hero-actions"><label class="pt-name-label" for="pt-town-name">Town name</label><input id="pt-town-name" maxlength="24" value="${esc(state.townName)}"><button class="pt-button pt-button-soft" type="button" data-pt-rename>Rename town</button></div></div><div class="pt-hero-art" aria-hidden="true"><span>🌷</span><span>🌻</span><span>🪻</span><span>🌼</span><div>✿</div></div></header>
      <div class="pt-stats" aria-label="Town statistics"><div><span>🪙 Coins</span><strong>${state.coins.toLocaleString()}</strong></div><div><span>🌸 Petals</span><strong>${state.petals.toLocaleString()}</strong></div><div><span>🌱 Town level</span><strong>${nextLevel}</strong></div><div><span>🪴 Garden plots</span><strong>${flowers}/36</strong></div><div><span>🏘️ Buildings</span><strong>${buildCount}</strong></div></div>
      <div class="pt-progress"><div><strong>Bloom progress</strong><span>Level ${nextLevel} · ${state.petals%50}/50 petals to the next level</span></div><div class="pt-progress-track"><span style="width:${state.petals%50*2}%"></span></div></div>
      <section class="pt-panel pt-milestone-panel"><div class="pt-section-head"><div><div class="pt-kicker">LONG-TERM GARDEN GOALS</div><h3>Little milestones, lasting blooms</h3><p>Grow your town over time. Each reward is claimed once and stays saved in this town.</p></div><span class="pt-count-chip">${state.claimedMilestones.length}/${milestones.length} claimed</span></div><div class="pt-milestone-grid">${milestoneHTML}</div></section>
      <section class="pt-daily"><div class="pt-daily-icon">🌞</div><div class="pt-daily-copy"><strong>Daily garden goal</strong><span>Harvest 3 flowers today · ${Math.min(3,state.daily.harvests)}/3</span><div class="pt-daily-track"><span style="width:${Math.min(3,state.daily.harvests)/3*100}%"></span></div></div><span class="pt-daily-reward">${state.daily.claimed?'✓ +25 coins · +15 petals':dailyDone?'+25 coins · +15 petals':'Bonus reward'}</span></section>
      <div class="pt-layout"><section class="pt-panel pt-garden-panel"><div class="pt-section-head"><div><div class="pt-kicker">YOUR LITTLE CORNER OF THE WORLD</div><h3>Flower Garden</h3><p>Choose a flower or building, then tap an empty tile. Tap growing flowers to water them; tap a full bloom to harvest.</p></div><span class="pt-count-chip">36 plots</span></div>
        <div class="pt-tool-tabs" role="group" aria-label="Choose building or planting mode"><button type="button" class="pt-tab" data-pt-mode="plant" ${buttonPress('plant',mode==='plant')}>🌱 Plant & water</button><button type="button" class="pt-tab" data-pt-mode="build" ${buttonPress('build',mode==='build')}>🏘️ Build town</button></div>
        <div class="pt-seed-row" role="group" aria-label="Choose a flower seed">${seedTypes.map(s=>`<button type="button" class="pt-seed ${selectedSeed===s.id&&mode==='plant'?'selected':''}" data-pt-seed="${s.id}" aria-pressed="${selectedSeed===s.id&&mode==='plant'}"><span>${s.icon}</span><strong>${s.name}</strong><small>${s.cost===0?'Free':s.cost+' coins'} · +${s.petals} petals</small></button>`).join('')}</div>
        <div class="pt-board" role="group" aria-label="Your 6 by 6 town garden">${state.board.map((tile,i)=>`<button type="button" class="pt-tile ${tile?.kind==='building'?'has-building':''} ${tile?.kind==='flower'?'has-flower':''} ${tile?.kind==='flower'&&tile.stage===3?'is-ready':''}" data-pt-tile="${i}" aria-label="${esc(tileLabel(tile,i))}" title="${esc(tileLabel(tile,i))}">${tileVisual(tile)}</button>`).join('')}</div>
        <p class="pt-status" id="pt-status" role="status" aria-live="polite">${esc(statusText)}</p><div class="pt-help-strip"><span>💧 Water flowers 3 times</span><span>🌼 Harvest mature blooms</span><span>🏘️ Unlock new buildings as you level up</span></div></section>
        <aside class="pt-panel pt-town-panel"><div class="pt-kicker">TOWN BUILDER</div><h3>Build something sweet</h3><p>Buildings use town coins and have level requirements. New unlocks appear as you collect petals.</p><div class="pt-building-list">${buildings.map(b=>`<button type="button" class="pt-building-card ${selectedBuilding===b.id&&mode==='build'?'selected':''}" data-pt-building="${b.id}" aria-pressed="${selectedBuilding===b.id&&mode==='build'}" ${b.level>nextLevel?'disabled':''}><span>${b.icon}</span><div><strong>${b.name}</strong><small>${b.desc}</small><em>${b.level>nextLevel?'Unlocks at level '+b.level:b.cost+' coins'}</em></div></button>`).join('')}</div><div class="pt-town-summary"><strong>Town feeling</strong><span>${buildCount===0?'A peaceful garden waiting for its first bench.':buildCount<3?'Your little town is starting to take shape.':buildCount<6?'Look at that neighborhood growing!':'A blooming town full of cozy corners!'}</span></div></aside></div>
      <section class="pt-panel pt-save-panel"><div class="pt-save-copy"><div class="pt-kicker">PLAY ACROSS DEVICES</div><h3>Take your town with you</h3><p>Your local save stays in this browser. Export a garden code, copy it to another device, open Petal Town there, and import the code to copy your progress. This is portable save transfer, not live multiplayer or automatic cloud sync.</p></div><div class="pt-save-actions"><button type="button" class="pt-button pt-button-primary" data-pt-export>Generate / refresh garden code</button><button type="button" class="pt-button pt-button-soft" data-pt-copy>Copy code</button></div><label class="pt-code-label" for="pt-save-code">Your portable save code</label><textarea id="pt-save-code" rows="3" readonly placeholder="Generate a code to create a portable backup…"></textarea><div class="pt-import-row"><label for="pt-import-code">Restore a code from another device</label><textarea id="pt-import-code" rows="2" placeholder="Paste a PETALTOWN1 save code here…"></textarea><button type="button" class="pt-button pt-button-soft" data-pt-import>Import garden code</button><button type="button" class="pt-button pt-button-danger" data-pt-reset>Reset this town</button></div></section>
      <footer class="pt-footer"><span>🌻 Petal Town is its own game — separate from World of Bloom.</span><span>Made by Cayden Flowers</span></footer>
    </section>`;
  }
  function status(message){statusText=message;const el=mount?.querySelector('#pt-status');if(el)el.textContent=message;}
  function sync(){state=sanitizeState(state);const unlocked=claimMilestones();if(unlocked.length)statusText+=` 🌟 Milestone unlocked: ${unlocked.map(m=>m.name).join(', ')}!`;save();render();}
  function plantOrWater(index){const tile=state.board[index];if(tile?.kind==='building'){statusText='This plot has a town building. Choose an empty plot for flowers.';render();return;}if(!tile){const seed=seedTypes.find(x=>x.id===selectedSeed)||seedTypes[0];if(state.coins<seed.cost){statusText=`You need ${seed.cost-state.coins} more coins for ${seed.name} seeds.`;render();return;}state.coins-=seed.cost;state.board[index]={kind:'flower',seed:seed.id,stage:0};state.stats.planted++;statusText=`You planted a ${seed.name.toLowerCase()}! Tap it to water and help it grow.`;sync();return;}if(tile.stage<3){tile.stage++;state.stats.watered++;const seed=seedTypes.find(x=>x.id===tile.seed)||seedTypes[0];statusText=tile.stage===3?`${seed.name} is ready to harvest! Tap it for petals and coins.`:`You watered the ${seed.name.toLowerCase()}. Growth ${tile.stage}/3.`;window.CaydenProxyMainCatalog?.awardXP?.(1,'Petal Town watering');sync();return;}const seed=seedTypes.find(x=>x.id===tile.seed)||seedTypes[0];state.coins+=seed.coins;state.petals+=seed.petals;state.harvested++;state.board[index]=null;state.daily.harvests=Math.min(3,state.daily.harvests+1);statusText=`Harvested ${seed.name}! +${seed.coins} coins and +${seed.petals} petals.`;window.CaydenProxyMainCatalog?.awardXP?.(4,'Petal Town harvest');if(state.daily.harvests>=3&&!state.daily.claimed){state.daily.claimed=true;state.coins+=25;state.petals+=15;statusText+=' Daily goal complete: bonus +25 coins and +15 petals!';window.CaydenProxyMainCatalog?.awardXP?.(10,'Petal Town daily harvest goal');}sync();}
  function buildAt(index){const tile=state.board[index];if(tile){statusText=tile.kind==='building'?'That plot is already part of your town.':'Choose an empty plot to place a building.';render();return;}const b=buildings.find(x=>x.id===selectedBuilding);if(!b)return;if(level()<b.level){statusText=`Collect more petals to reach town level ${b.level}.`;render();return;}if(state.coins<b.cost){statusText=`You need ${b.cost-state.coins} more coins for the ${b.name.toLowerCase()}.`;render();return;}state.coins-=b.cost;state.board[index]={kind:'building',building:b.id};state.stats.buildingsPlaced++;statusText=`Built the ${b.name}! Your town is looking cozier already.`;window.CaydenProxyMainCatalog?.awardXP?.(3,'Petal Town building');sync();}
  function onClick(event){const seedBtn=event.target.closest('[data-pt-seed]');if(seedBtn){selectedSeed=seedBtn.dataset.ptSeed;mode='plant';render();return;}const modeBtn=event.target.closest('[data-pt-mode]');if(modeBtn){mode=modeBtn.dataset.ptMode;render();return;}const buildingBtn=event.target.closest('[data-pt-building]');if(buildingBtn){const b=buildings.find(x=>x.id===buildingBtn.dataset.ptBuilding);if(!b||level()<b.level){status(`That unlocks at town level ${b?.level||'?'} — keep harvesting petals!`);return;}selectedBuilding=b.id;mode='build';render();return;}const tileBtn=event.target.closest('[data-pt-tile]');if(tileBtn){const index=Number(tileBtn.dataset.ptTile);if(!Number.isInteger(index)||index<0||index>=BOARD_SIZE)return;if(mode==='build')buildAt(index);else plantOrWater(index);return;}if(event.target.closest('[data-pt-rename]')){const input=mount.querySelector('#pt-town-name');const name=String(input?.value||'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,24);state.townName=name||'Petal Town';statusText=`Welcome to ${state.townName}!`;sync();return;}if(event.target.closest('[data-pt-export]')){const input=mount.querySelector('#pt-save-code');input.value=exportCode();input.focus();input.select();status('Garden code generated. Copy it and keep it somewhere you can reach on your other device.');return;}if(event.target.closest('[data-pt-copy]')){const input=mount.querySelector('#pt-save-code');if(!input.value)input.value=exportCode();input.focus();input.select();if(navigator.clipboard?.writeText){navigator.clipboard.writeText(input.value).then(()=>status('Garden code copied! Paste it into Petal Town on your other device.')).catch(()=>status('Code selected. Press Ctrl+C (or Copy) and move it to your other device.'));}else status('Code selected. Press Ctrl+C (or Copy) and move it to your other device.');return;}if(event.target.closest('[data-pt-import]')){const input=mount.querySelector('#pt-import-code');try{const imported=decode(input?.value||'');if(!window.confirm('Import this garden code and replace this device’s current Petal Town save? Export your current code first if you want a backup.'))return;state=imported;selectedSeed='daisy';selectedBuilding='bench';mode='plant';statusText='Garden imported successfully. Welcome to your saved town!';sync();}catch(err){status(err.message||'Could not import that garden code.');}return;}if(event.target.closest('[data-pt-reset]')){if(!window.confirm('Reset Petal Town on this device? This cannot be undone unless you exported a code.'))return;state=defaults();statusText='A fresh town, ready to bloom.';selectedSeed='daisy';selectedBuilding='bench';mode='plant';sync();}}
  function mountGame(target){mount=target;if(!mount)return;state=sanitizeState(state);if(state.daily.date!==dayKey())state.daily=newDaily();const unlocked=claimMilestones();if(unlocked.length)statusText=`Welcome back! New milestones unlocked: ${unlocked.map(m=>m.name).join(', ')}.`;save();mount.removeEventListener('click',onClick);mount.addEventListener('click',onClick);render();}
  window.CaydenPetalTown={mount:mountGame,version:'1.0.0',exportCode,importCode:code=>{state=decode(code);save();if(mount)render();},getState:()=>JSON.parse(JSON.stringify(state)),seedTypes,buildings};
})();
