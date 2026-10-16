/*
 * Wingeria Rush Remastered — CaydenProxy Arcade+
 * Original restaurant-management game. No external assets or dependencies.
 * Shift state and campaign progression are stored in the existing local save.
 */
(() => {
  'use strict';
  const api = window.CaydenArcade;
  if (!api || !api.content || !api.data) return;
  const { data, content } = api;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const money = n => '$' + Math.max(0, Math.round(n)).toLocaleString('en-US');
  const isTerminal = c => ['served', 'walkedout'].includes(c.status);

  const sauces = [
    {id:'bbq',name:'Honey BBQ',icon:'🍯',day:1},{id:'buffalo',name:'Buffalo Blaze',icon:'🌶️',day:1},
    {id:'garlic',name:'Garlic Parmesan',icon:'🧄',day:1},{id:'chili',name:'Sweet Chili',icon:'🍊',day:3},
    {id:'lemon',name:'Lemon Pepper',icon:'🍋',day:6},{id:'korean',name:'Korean Gochujang',icon:'🔥',day:10},
    {id:'maple',name:'Maple Sriracha',icon:'🍁',day:16},{id:'mango',name:'Mango Habanero',icon:'🥭',day:24},
    {id:'chipotle',name:'Smoky Chipotle',icon:'🌫️',day:35},{id:'herb',name:'Lemon Garden Herb',icon:'🌿',day:50},
    {id:'plum',name:'Midnight Plum',icon:'🌙',day:75}
  ];
  const seasonings = [
    {id:'classic',name:'Classic Salt',icon:'🧂',day:1},{id:'cajun',name:'Cajun Dust',icon:'✨',day:1},
    {id:'lemonzest',name:'Lemon Zest',icon:'🍋',day:1},{id:'smoky',name:'Smoky Paprika',icon:'🌶️',day:5},
    {id:'herbs',name:'Garden Herb Blend',icon:'🌱',day:12},{id:'sesame',name:'Toasted Sesame',icon:'⚫',day:20},
    {id:'five',name:'Five-Spice Spark',icon:'⭐',day:40}
  ];
  const sides = [
    {id:'fries',name:'Curly Fries',icon:'🍟',day:1},{id:'slaw',name:'Garden Slaw',icon:'🥗',day:1},
    {id:'wedges',name:'Potato Wedges',icon:'🥔',day:1},{id:'rings',name:'Onion Rings',icon:'🧅',day:3},
    {id:'mac',name:'Mac & Cheese',icon:'🧀',day:5},{id:'cheese-bites',name:'Cheese Bites',icon:'🟡',day:9},
    {id:'corn',name:'Sweet Corn Ribs',icon:'🌽',day:14},{id:'tots',name:'Loaded Tots',icon:'🥔',day:20},
    {id:'pickle',name:'Crunchy Pickle Chips',icon:'🥒',day:32},{id:'waffle',name:'Waffle Fries',icon:'🧇',day:40}
  ];
  const drinks = [
    {id:'lemonade',name:'Garden Lemonade',icon:'🍋',day:1},{id:'water',name:'Sparkling Water',icon:'💧',day:1},
    {id:'cola',name:'Cherry Cola',icon:'🥤',day:1},{id:'tea',name:'Peach Iced Tea',icon:'🍑',day:4},
    {id:'berry',name:'Berry Fizz',icon:'🫐',day:8},{id:'mango-soda',name:'Mango Soda',icon:'🥭',day:15},
    {id:'mint',name:'Mint Cooler',icon:'🌿',day:25},{id:'starlight',name:'Starlight Float',icon:'🌌',day:45}
  ];
  const desserts = [
    {id:'cookie',name:'Warm Cookie',icon:'🍪'},{id:'sundae',name:'Mini Sundae',icon:'🍨'},
    {id:'brownie',name:'Brownie Bite',icon:'🍫'},{id:'fruit',name:'Fruit Cup',icon:'🍓'}
  ];
  const sauceMixes = [
    {id:'firehouse',name:'Smoky Firehouse',first:'bbq',second:'buffalo',day:12,icon:'🔥'},
    {id:'zesty-parm',name:'Zesty Parmesan',first:'garlic',second:'lemon',day:15,icon:'🍋'},
    {id:'sweet-heat',name:'Sweet Heat',first:'chili',second:'buffalo',day:22,icon:'🌶️'},
    {id:'tropical-smoke',name:'Tropical Smoke',first:'mango',second:'chipotle',day:38,icon:'🥭'}
  ];
  const personalities = [
    {id:'patient',name:'Patient Pal',icon:'😊',patience:118,drain:.75,tip:1,tag:'Happy to wait'},
    {id:'foodie',name:'Flavor Fan',icon:'😋',patience:100,drain:.95,tip:1.18,tag:'Loves bold flavors'},
    {id:'hurry',name:'On-the-Go',icon:'🏃',patience:78,drain:1.35,tip:1.05,tag:'Fast service please'},
    {id:'critic',name:'Food Critic',icon:'🧐',patience:105,drain:1.05,tip:1.35,tag:'Notices every detail'},
    {id:'vip',name:'VIP Guest',icon:'👑',patience:125,drain:.9,tip:1.6,tag:'Big tip, high standards',day:8},
    {id:'regular',name:'Neighborhood Regular',icon:'💚',patience:112,drain:.82,tip:1.15,tag:'Knows the menu',day:4}
  ];
  const names = ['Maya','Jordan','Kai','Riley','Alex','Sam','Taylor','Casey','Avery','Quinn','Micah','Jamie','Sky','Robin','Noah','Sage','Emery','Drew','Cameron','Lee'];
  const specials = [
    {id:'no-ice',label:'No ice in the drink',day:3},
    {id:'sauce-side',label:'Put the sauce on the side',day:4},
    {id:'extra-seasoning',label:'Extra seasoning, please',day:5},
    {id:'mix-sauce',label:'Mix a signature sauce',day:12},
    {id:'combo',label:'Make it a full combo',day:2},
    {id:'light-ice',label:'Just a little ice',day:6}
  ];
  const events = [
    {id:'cozy',name:'Cozy Garden Shift',desc:'Guests are a little more patient today.',patience:1.12,tip:1,sauce:0},
    {id:'double-tip',name:'Double-Tip Evening',desc:'Fast, accurate orders earn a bigger tip.',patience:1,tip:1.35,sauce:0},
    {id:'sauce-spotlight',name:'Sauce Spotlight',desc:'Correct sauce choices earn bonus points.',patience:1,tip:1,sauce:9},
    {id:'rush',name:'Rush Hour',desc:'Customers arrive quickly. Keep the ticket rail moving.',patience:.86,tip:1.1,sauce:0},
    {id:'vip-night',name:'VIP Tasting Night',desc:'A VIP may stop by with a demanding order.',patience:1,tip:1.18,sauce:0}
  ];
  const upgrades = [
    {id:'timer-window',name:'Precision Heat Gauge',icon:'🌡️',day:1,cost:120,desc:'Widens the perfect fry timing window by 0.25 seconds.',once:true},
    {id:'patience-sign',name:'Friendly Welcome Sign',icon:'💌',day:1,cost:145,desc:'Customer patience drains 15% more slowly.',once:true},
    {id:'cozy-decor',name:'Cozy Garden Decor',icon:'🌻',day:3,cost:180,desc:'Adds a 7% tip bonus to every shift.',once:true},
    {id:'second-fryer',name:'Second Fryer',icon:'🍳',day:7,cost:450,desc:'Run two baskets at once. Multitask like a pro.',once:true},
    {id:'bigger-dining',name:'Expanded Dining Room',icon:'🪑',day:10,cost:420,desc:'Adds two tables, helping the arrival queue move.',once:true},
    {id:'sauce-lab',name:'Signature Sauce Lab',icon:'🧪',day:12,cost:520,desc:'Unlocks signature sauce-mixing recipes and a 5% accuracy bonus.',once:true},
    {id:'vip-lounge',name:'VIP Booth',icon:'👑',day:15,cost:620,desc:'VIP guests leave a larger bonus when served accurately.',once:true},
    {id:'dessert-cart',name:'Dessert Cart',icon:'🍨',day:20,cost:700,desc:'Unlocks a new dessert station and premium combo requests.',once:true},
    {id:'turbo-fryer',name:'Turbo Fryer',icon:'⚡',day:28,cost:850,desc:'Fry targets are more forgiving and shift score rises.',once:true},
    {id:'golden-sign',name:'Golden Neon Sign',icon:'✨',day:35,cost:950,desc:'A permanent 12% earnings bonus.',once:true},
    {id:'third-table-row',name:'Garden Patio',icon:'🌿',day:45,cost:1100,desc:'Adds two more dining tables.',once:true},
    {id:'master-chef',name:'Master Chef Training',icon:'👨‍🍳',day:60,cost:1400,desc:'Adds a 10% bonus to accurate orders.',once:true},
    {id:'franchise-kit',name:'Franchise Display',icon:'🏆',day:80,cost:1900,desc:'Prestige decoration and a 15% tip bonus.',once:true},
    {id:'priority-rail',name:'Priority Ticket Rail',icon:'🧾',day:8,cost:420,desc:'Guests in the queue lose patience 25% more slowly.',once:true},
    {id:'flower-patio',name:'Flower Patio Expansion',icon:'🌷',day:25,cost:900,desc:'Adds two extra dining tables and a 4% tip bonus.',once:true},
    {id:'herb-garden',name:'Kitchen Herb Garden',icon:'🌿',day:28,cost:850,desc:'Fresh herbs improve order accuracy by 4 points and tips by 4%.',once:true},
    {id:'loyalty-bloom',name:'Neighborhood Loyalty Bloom',icon:'💗',day:40,cost:1180,desc:'Neighborhood regulars leave 18% larger tips.',once:true},
    {id:'calm-service-clock',name:'Calm Service Clock',icon:'⏱️',day:55,cost:1600,desc:'Seated guests stay patient about 10% longer.',once:true}
  ];
  const storyMilestones = [
    [1,'The First Fry','Your first little wing shop opens. Make the neighborhood proud.'],
    [5,'Regulars Roll In','A few familiar faces are starting to call this place their favorite.'],
    [10,'The Golden Inspection','Chef Nova is coming to check whether your kitchen is worthy of five stars.'],
    [20,'A Bigger Menu','Your reputation earns space for a dessert cart and special combos.'],
    [50,'Garden District Favorite','The whole district knows your signature sauce.'],
    [100,'The Century Chef','One hundred restaurant days. Your little shop has become a legend.']
  ];

  let campaign = data.wingeriaSave;
  if (!campaign || typeof campaign !== 'object') {
    campaign = data.wingeriaSave = {version:2,day:1,cash:260,upgrades:[],unlockedSeen:[],activeShift:null,stats:{daysCompleted:0,ordersServed:0,perfectOrders:0,walkouts:0,bestTip:0,bestRating:0,bestCombo:0,totalRevenue:0},lastReport:null,decor:'garden'};
  }
  campaign.version = 2;
  campaign.day = Math.max(1, Math.floor(Number(campaign.day) || 1));
  const savedCash = Number(campaign.cash);
  campaign.cash = Math.max(0, Math.floor(Number.isFinite(savedCash) ? savedCash : 260));
  campaign.upgrades = Array.isArray(campaign.upgrades) ? campaign.upgrades : [];
  campaign.unlockedSeen = Array.isArray(campaign.unlockedSeen) ? campaign.unlockedSeen : [];
  campaign.stats = Object.assign({daysCompleted:0,ordersServed:0,perfectOrders:0,walkouts:0,bestTip:0,bestRating:0,bestCombo:0,totalRevenue:0}, campaign.stats || {});
  let pulseTimer = null, lastSecondAt = 0, lastSaveAt = 0;
  const saved = () => { try { api.persist(); } catch (error) { console.warn('Wingeria save failed', error); } };
  const owns = id => campaign.upgrades.includes(id);
  const tableCount = () => 4 + (owns('bigger-dining') ? 2 : 0) + (owns('third-table-row') ? 2 : 0) + (owns('flower-patio') ? 2 : 0);
  const fryerCount = () => owns('second-fryer') ? 2 : 1;
  const validAtDay = list => list.filter(item => (item.day || 1) <= campaign.day);
  const itemById = (list, id) => list.find(item => item.id === id);
  const labelOf = (list, id) => itemById(list, id)?.name || id || '—';
  const customerAlive = c => c && !isTerminal(c) && c.status !== 'not-arrived';
  const getShift = () => campaign.activeShift;
  function storyForDay(day) {
    return storyMilestones.filter(([d]) => d <= day).slice(-1)[0] || storyMilestones[0];
  }
  function applyDayUnlocks() {
    const unlockables = [...sauces,...seasonings,...sides,...drinks,...sauceMixes,...upgrades.filter(x=>!campaign.upgrades.includes(x.id))]
      .filter(item => item.day === campaign.day && !campaign.unlockedSeen.includes(item.id));
    if (unlockables.length) {
      unlockables.forEach(item => campaign.unlockedSeen.push(item.id));
      saved();
      if (campaign.day > 1 && api.toast) setTimeout(() => api.toast(`🔓 Day ${campaign.day} unlocked: ${unlockables.map(x=>x.name).join(', ')}.`), 250);
    }
  }
  function randomEvent(day) {
    // Stable event per day so a saved shift never changes underneath the player.
    return events[(day * 7 + Math.floor(day / 4) + 2) % events.length];
  }
  function menuChoices(list) { return validAtDay(list); }
  function makeCustomer(index, shift) {
    const day = shift.day;
    let person;
    if (day % 10 === 0 && index === shift.customerCount - 1) {
      person = {id:'inspector',name:'Chef Nova',icon:'👩‍🍳',patience:135,drain:.95,tip:1.85,tag:'Golden Inspector'};
    } else {
      const validPeople = personalities.filter(p => !p.day || day >= p.day);
      person = pick(validPeople);
    }
    const sauceMenu = menuChoices(sauces), sideMenu = menuChoices(sides), seasoningMenu = menuChoices(seasonings), drinkMenu = menuChoices(drinks);
    const faveSauce = pick(sauceMenu), faveSide = pick(sideMenu);
    let sauce = Math.random() < .34 ? faveSauce : pick(sauceMenu);
    const side = Math.random() < .36 ? faveSide : pick(sideMenu);
    const wings = pick([4,5,6,8]);
    const crisp = pick(['Golden','Crispy',...(day >= 4 ? ['Extra Crispy'] : [])]);
    let season = pick(seasoningMenu);
    const drink = day >= 2 ? pick(drinkMenu) : pick(drinkMenu.slice(0,Math.min(3,drinkMenu.length)));
    let ice = pick(['Regular','Regular','Extra']);
    let sauceStyle = 'Tossed';
    let mix = 'None';
    let dessert = '';
    const validSpecials = specials.filter(x => day >= x.day);
    const wantsSpecial = validSpecials.length && Math.random() < Math.min(.68,.18 + day*.008);
    let special = wantsSpecial ? pick(validSpecials) : null;
    if (special?.id === 'no-ice') ice = 'None';
    if (special?.id === 'light-ice') ice = 'Light';
    if (special?.id === 'sauce-side') sauceStyle = 'On the side';
    if (special?.id === 'extra-seasoning') {
      const seasoning = seasoningMenu.find(x => x.id !== season.id) || season;
      // The request is explicit: use this seasoning for the order.
      // Keep the menu item itself as the expected seasoning.
      if (seasoning) season = seasoning;
    }
    if (special?.id === 'mix-sauce') {
      const mixMenu = sauceMixes.filter(x => x.day <= day && owns('sauce-lab'));
      if (mixMenu.length) { const recipe = pick(mixMenu); mix = recipe.id; sauce = itemById(sauces, recipe.first) || sauce; }
      else special = null;
    }
    const isVIP = person.id === 'vip' || person.id === 'inspector' || (day >= 12 && Math.random() < .08);
    const combo = day >= 2 && (special?.id === 'combo' || isVIP || Math.random() < .22);
    if (owns('dessert-cart') && day >= 20 && (combo || Math.random() < .45)) dessert = pick(desserts).id;
    return {
      id:`d${day}-c${index}-${Math.random().toString(36).slice(2,7)}`,
      name: person.id === 'inspector' ? person.name : names[(index * 3 + day + Math.floor(Math.random()*names.length)) % names.length],
      icon: person.icon, personality:person.name, personalityId:person.id, personalityTag:person.tag,
      patience:person.patience || 100, maxPatience:person.patience || 100, drain:person.drain || 1, tipRate:person.tip || 1,
      favoriteSauce:faveSauce.id,favoriteSide:faveSide.id,table:null,status:'not-arrived',arrivalOrder:index,
      isVIP,isBoss:person.id==='inspector',order:{wings,crisp,sauce:sauce.id,seasoning:season.id,side:side.id,drink:drink.id,ice,sauceStyle,sauceMix:mix,dessert,combo,special:special?.label||'',specialId:special?.id||'',favoriteSauce:faveSauce.id,favoriteSide:faveSide.id},
      prep:{wings:null,sauce:'',seasoning:'',side:'',drink:'',ice:'Regular',sauceStyle:'Tossed',sauceMix:'None',dessert:''},
      fry:{elapsed:0,target:0,startedAt:0,quality:'',done:false},
      rating:0,tip:0,accuracy:0,servedTo:'',review:'',arrivalAt:0,servedAt:0
    };
  }
  function seatWaiting(shift) {
    const limit = tableCount();
    const occupied = new Set(shift.customers.filter(c => customerAlive(c) && c.table).map(c=>c.table));
    const free = Array.from({length:limit},(_,i)=>i+1).find(n=>!occupied.has(n));
    if (!free) return false;
    const c = shift.customers.find(x => x.status === 'queue');
    if (!c) return false;
    c.table = free; c.status = 'seated'; c.patience = Math.max(c.patience, 75); c.arrivalAt = Date.now();
    if (!shift.selectedId) shift.selectedId = c.id;
    return true;
  }
  function arriveNext(shift) {
    const c = shift.customers.find(x => x.status === 'not-arrived');
    if (!c) return;
    c.status = 'queue'; c.arrivalAt = Date.now();
    if (!shift.selectedId) shift.selectedId = c.id;
    seatWaiting(shift);
    shift.arrivals++;
    const event = shift.event;
    shift.arrivalCountdown = Math.max(2.4, 5.4 - shift.day*.025) / (event.id === 'rush' ? 1.35 : 1);
    shift.messages.unshift({icon:'🔔',text:`${c.name} just arrived${c.table ? ` and took table ${c.table}` : ' and joined the waitlist'}.`});
    shift.messages = shift.messages.slice(0,4);
  }
  function newShift() {
    const day = campaign.day;
    const customerCount = Math.min(14,5 + Math.floor((day-1)/7));
    const shift = {
      version:2,day,customerCount,remaining:Math.max(160,235-Math.floor(day/8)*5),clockStartedAt:Date.now(),
      arrivals:0,arrivalCountdown:0,selectedId:null,station:'order',event:randomEvent(day),
      customers:[],score:0,revenue:0,served:0,walkouts:0,perfect:0,wrongDeliveries:0,combo:0,bestCombo:0,
      startedAt:Date.now(),ended:false,activePowerups:{patienceBloom:false,heatSpark:false},reviewNotes:[],messages:[],lastStory:storyForDay(day)[1]
    };
    for (let i=0;i<customerCount;i++) shift.customers.push(makeCustomer(i,shift));
    campaign.activeShift = shift;
    arriveNext(shift);
    if (shift.customers.length > 1) arriveNext(shift); // a small opening rush makes the dining room feel alive
    shift.arrivalCountdown = 5.0;
    saved();
    return shift;
  }
  function currentCustomer(shift=getShift()) {
    if (!shift) return null;
    let c = shift.customers.find(x=>x.id===shift.selectedId);
    if (!c || c.status==='not-arrived' || isTerminal(c)) { c = shift.customers.find(x=>customerAlive(x)); if (c) shift.selectedId = c.id; }
    return c || null;
  }
  function getCustomer(shift,id) { return shift?.customers.find(c=>c.id===id) || null; }
  function totalFrying(shift) { return shift.customers.filter(c=>c.status==='frying').length; }
  function cookTarget(c) {
    const base = c.order.crisp === 'Golden' ? 4.2 : c.order.crisp === 'Crispy' ? 5.0 : 5.8;
    return base + c.order.wings*.10 + Math.min(1.2,(campaign.day-1)*.013) - (owns('turbo-fryer')?.3:0);
  }
  function stationLabel(id) {
    return ({order:'Order counter',fryer:'Fryer station',sauce:'Sauce lab',sides:'Side station',drinks:'Drink station',dessert:'Dessert cart',serve:'Serving window'})[id]||id;
  }
  function stationForStatus(status) {
    return ({'seated':'order','queue':'order','ordered':'fryer','frying':'fryer','fried':'sauce','sauced':'sides','sided':'drinks','ready-dessert':'dessert','ready':'serve'})[status]||'order';
  }
  function addMessage(shift,icon,text) { shift.messages.unshift({icon,text}); shift.messages=shift.messages.slice(0,4); }
  function notify(text) { if (api.toast) api.toast(text); }
  function goHome() { cleanup(); api.home(); }
  function cleanup() {
    if (pulseTimer) { clearInterval(pulseTimer); pulseTimer=null; }
    const shift=getShift();
    if (shift) shift.customers.filter(c=>c.status==='frying').forEach(c=>{if(c.fry.startedAt){c.fry.elapsed=Math.max(c.fry.elapsed,(Date.now()-c.fry.startedAt)/1000);c.fry.startedAt=0;}});
    saved();
  }
  function beginTimers() {
    if (pulseTimer) clearInterval(pulseTimer);
    const shift=getShift();
    if (!shift) return;
    shift.customers.filter(c=>c.status==='frying').forEach(c=>{if(!c.fry.startedAt)c.fry.startedAt=Date.now()-c.fry.elapsed*1000;});
    lastSecondAt=Date.now(); lastSaveAt=lastSecondAt;
    pulseTimer=setInterval(pulse,120);
  }
  function pulse() {
    const s=getShift();
    if (!s || s.ended || !content.querySelector('.wr-app')) { if (!content.querySelector('.wr-app')) cleanup(); return; }
    const now=Date.now();
    if (s.arrivals < s.customerCount) {
      s.arrivalCountdown -= .12;
      if (s.arrivalCountdown <= 0) arriveNext(s);
    }
    s.customers.filter(c=>c.status==='queue').forEach(c=>{c.patience=Math.max(0,c.patience-.12*(c.drain||1)*(owns('priority-rail')?.525:.7));if(c.patience<=0)walkOut(s,c,'left before a table opened');});
    s.customers.filter(c=>c.status==='seated'||c.status==='ordered'||c.status==='frying'||c.status==='fried'||c.status==='sauced'||c.status==='sided'||c.status==='ready-dessert'||c.status==='ready').forEach(c=>{
      const eventFactor=s.event.patience||1;
      const upgradeFactor=(owns('patience-sign')?.85:1)*(owns('calm-service-clock')?.9:1);
      const seatDrain=(s.activePowerups.patienceBloom ? .68 : 1);
      c.patience=Math.max(0,c.patience-.12*(c.drain||1)*eventFactor*upgradeFactor*seatDrain);
      if(c.patience<=0)walkOut(s,c,'patience ran out');
    });
    s.customers.filter(c=>c.status==='frying').forEach(c=>{
      if(!c.fry.startedAt)c.fry.startedAt=now-c.fry.elapsed*1000;
      c.fry.elapsed=(now-c.fry.startedAt)/1000;
      if(c.fry.elapsed>c.fry.target+1.75){finishFry(s,c,'burnt',true);}
    });
    const dt=(now-lastSecondAt)/1000;
    if(dt>=1){s.remaining=Math.max(0,s.remaining-dt);lastSecondAt=now;if(now-lastSaveAt>4000){saved();lastSaveAt=now;}}
    seatWaiting(s);
    paintLive(s);
    if(s.remaining<=0){finishShift(true,'The shift clock reached zero.');return;}
    if(s.arrivals>=s.customerCount && s.customers.every(c=>isTerminal(c))){finishShift(true,'All guests have been served or have headed out.');}
  }
  function walkOut(shift,c,reason) {
    if (!c || isTerminal(c)) return;
    c.status='walkedout'; c.review=reason==='patience ran out'?'I waited too long today.':'I could not get a table this time.';
    c.rating=0; shift.walkouts++; shift.combo=0; shift.reviewNotes.push({name:c.name,rating:0,review:c.review});
    addMessage(shift,'🚶',`${c.name} ${reason}.`);
    seatWaiting(shift); if(api.data.sfx && typeof window.beep==='function')try{window.beep(180)}catch(_){}
    saved();
  }
  function finishFry(shift,c,quality,automatic=false) {
    if(!c || c.status!=='frying') return;
    c.fry.quality=quality; c.fry.done=true; c.fry.startedAt=0; c.fry.elapsed=Math.max(0,c.fry.elapsed);
    c.status='fried';
    if(quality==='perfect') { c.fry.points=18; addMessage(shift,'✨',`${c.name}'s wings hit the perfect fry window!`); }
    else if(quality==='okay') { c.fry.points=9; addMessage(shift,'🍗','Nice save — the wings are cooked, but the timing was a little off.'); }
    else { c.fry.points=-8; addMessage(shift,'🔥',automatic?'A basket stayed in too long and burned.':'Wings were pulled too early or too late.'); }
    if(quality==='burnt' && automatic) notify('🔥 Basket burnt! Check the fryer while other guests are waiting.');
    saved(); draw();
  }
  function startFry(shift,c) {
    if(!c || c.status!=='ordered') return;
    if(!c.prep.wings){notify('Choose the wing portion before starting the basket.');return;}
    if(totalFrying(shift)>=fryerCount()) { notify(`🍳 ${fryerCount()===1?'The fryer is busy.':'Both fryers are busy.'} Pull a basket first.`);return; }
    c.status='frying'; c.fry={elapsed:0,target:cookTarget(c),startedAt:Date.now(),quality:'',done:false,points:0};
    shift.station='fryer'; addMessage(shift,'🍳',`Basket started for ${c.name}. Watch the green heat window.`); saved(); draw();
  }
  function pullFry(shift,c) {
    if(!c || c.status!=='frying')return;
    const elapsed=(Date.now()-(c.fry.startedAt||Date.now()))/1000;
    c.fry.elapsed=Math.max(c.fry.elapsed,elapsed);
    const windowBonus=owns('timer-window')?.25:0;
    const spark=shift.activePowerups.heatSpark?.35:0;
    const delta=elapsed-c.fry.target;
    const quality=Math.abs(delta)<=.47+windowBonus+spark?'perfect':Math.abs(delta)<=1.18+windowBonus?'okay':'burnt';
    shift.activePowerups.heatSpark=false;
    finishFry(shift,c,quality,false);
  }
  function takeOrder(shift,c) {
    if(!c || c.status!=='seated')return;
    c.status='ordered'; c.orderTakenAt=Date.now(); shift.selectedId=c.id; shift.station='fryer';
    addMessage(shift,'🧾',`${c.name}'s ticket is on the rail. Next up: fry ${c.order.wings} wings ${c.order.crisp.toLowerCase()}.`);
    saved();draw();
  }
  function setPick(shift,c,key,value) {
    if(!c)return;
    c.prep[key]=value; saved(); draw();
  }
  function tossSauce(shift,c) {
    if(!c || c.status!=='fried')return;
    if(!c.prep.sauce || !c.prep.seasoning || !c.prep.sauceStyle) { notify('Choose a sauce, seasoning, and serving style first.');return; }
    const mix=c.prep.sauceMix||'None';
    if(mix!=='None' && !sauceMixes.some(m=>m.id===mix && m.day<=shift.day && owns('sauce-lab'))) {notify('That signature recipe is still locked.');return;}
    c.status='sauced'; shift.station='sides'; addMessage(shift,'🌶️',`${c.name}'s wings are sauced and seasoned.`); saved();draw();
  }
  function prepareSide(shift,c) {
    if(!c || c.status!=='sauced')return;
    if(!c.prep.side){notify('Choose a side before sending the tray forward.');return;}
    c.status='sided';shift.station='drinks';addMessage(shift,'🍟',`Side ready for ${c.name}.`);saved();draw();
  }
  function fillDrink(shift,c) {
    if(!c || c.status!=='sided')return;
    if(!c.prep.drink || !c.prep.ice){notify('Choose the drink and ice level first.');return;}
    c.status=owns('dessert-cart') && c.order.dessert ? 'ready-dessert':'ready';
    shift.station=c.status==='ready-dessert'?'dessert':'serve';
    addMessage(shift,'🥤',`Drink filled for ${c.name}.`);saved();draw();
  }
  function prepareDessert(shift,c) {
    if(!c || c.status!=='ready-dessert')return;
    if(!c.prep.dessert){notify('Choose the dessert listed on the ticket.');return;}
    c.status='ready';shift.station='serve';addMessage(shift,'🍨',`Dessert added to ${c.name}'s tray.`);saved();draw();
  }
  function orderChecks(c, deliveredCorrectly) {
    const checks = [
      ['wing count',Number(c.prep.wings)===Number(c.order.wings),10],
      ['fry timing',c.fry.quality==='perfect',14],
      ['sauce',c.prep.sauce===c.order.sauce,12],
      ['seasoning',c.prep.seasoning===c.order.seasoning,8],
      ['side',c.prep.side===c.order.side,10],
      ['drink',c.prep.drink===c.order.drink,8],
      ['ice level',c.prep.ice===c.order.ice,5],
      ['sauce style',c.prep.sauceStyle===c.order.sauceStyle,6],
      ['sauce recipe',c.prep.sauceMix===c.order.sauceMix,8],
      ['delivery',deliveredCorrectly,10]
    ];
    if(c.order.dessert)checks.push(['dessert',c.prep.dessert===c.order.dessert,8]);
    const matched=checks.filter(x=>x[1]).length;
    const max=checks.length;
    const points=checks.reduce((sum,item)=>sum+(item[1]?item[2]:0),0);
    return {checks,matched,max,accuracy:Math.round(matched/max*100),points};
  }
  function serveMeal(shift,c,recipientId) {
    if(!c || c.status!=='ready')return;
    const recipient=getCustomer(shift,recipientId);
    const correct=!!recipient && recipient.id===c.id;
    if(!correct && recipient && !isTerminal(recipient)) {recipient.patience=Math.max(0,recipient.patience-18);shift.wrongDeliveries++;addMessage(shift,'😵',`Table mix-up! ${recipient.name} got the wrong tray.`);}
    const result=orderChecks(c,correct);
    const sauceExtra=shift.event.id==='sauce-spotlight' && c.prep.sauce===c.order.sauce ? shift.event.sauce : 0;
    const favoriteBonus=(c.prep.sauce===c.favoriteSauce?5:0)+(c.prep.side===c.favoriteSide?4:0);
    const specialCorrect = ({'no-ice':c.prep.ice==='None','light-ice':c.prep.ice==='Light','sauce-side':c.prep.sauceStyle==='On the side','extra-seasoning':c.prep.seasoning===c.order.seasoning,'mix-sauce':c.prep.sauceMix===c.order.sauceMix,'combo':c.prep.side===c.order.side&&c.prep.drink===c.order.drink})[c.order.specialId] === true;
    const specialBonus=c.order.special && specialCorrect ? 5 : 0;
    const accuracyBoost=(owns('sauce-lab')?5:0)+(owns('herb-garden')?4:0);
    const qualityBoost=owns('master-chef')?10:0;
    const accuracy=Math.min(100,result.accuracy+accuracyBoost);
    const patienceRatio=clamp(c.patience/c.maxPatience,0,1);
    const rating=clamp(Math.round(accuracy*.72+patienceRatio*28+(correct?0:-22)),0,100);
    const speedBonus=Math.max(0,Math.round((c.maxPatience-c.patience)/Math.max(1,c.maxPatience)*4));
    let tip=(7+c.order.wings*1.55+accuracy*.17+patienceRatio*7+favoriteBonus+specialBonus+sauceExtra+qualityBoost)*c.tipRate*shift.event.tip;
    if(owns('cozy-decor'))tip*=1.07;
    if(owns('golden-sign'))tip*=1.12;
    if(owns('franchise-kit'))tip*=1.15;
    if(owns('flower-patio'))tip*=1.04;
    if(owns('herb-garden'))tip*=1.04;
    if(owns('loyalty-bloom')&&c.personalityId==='regular')tip*=1.18;
    if(c.isVIP && correct && accuracy>=85 && owns('vip-lounge'))tip*=1.18;
    if(!correct)tip*=.35;
    if(c.fry.quality==='burnt')tip*=.55;
    if(c.fry.quality==='okay')tip*=.88;
    tip=Math.max(1,Math.round(tip));
    const points=Math.max(0,Math.round(result.points+favoriteBonus+specialBonus+sauceExtra+speedBonus+(owns('turbo-fryer')?5:0)+(owns('master-chef')?qualityBoost:0)));
    c.status='served';c.servedAt=Date.now();c.servedTo=recipient?.id||'';c.rating=rating;c.tip=tip;c.accuracy=accuracy;
    c.review=rating>=93?'Five-star wings! Every bite was spot on.':rating>=80?'Delicious — I’ll be back for another order.':rating>=65?'Pretty good! A couple of little details were off.':rating>=45?'Not quite what I asked for. Please check the ticket next time.':'That wasn’t my order. I’m disappointed.';
    shift.served++;shift.score+=points;shift.revenue+=tip;campaign.cash+=tip;campaign.stats.ordersServed++;campaign.stats.totalRevenue+=tip;campaign.stats.bestTip=Math.max(campaign.stats.bestTip,tip);campaign.stats.bestRating=Math.max(campaign.stats.bestRating,rating);
    if(correct && result.matched===result.max && c.fry.quality==='perfect'){
      shift.perfect++;campaign.stats.perfectOrders++;shift.combo++;shift.bestCombo=Math.max(shift.bestCombo,shift.combo);campaign.stats.bestCombo=Math.max(campaign.stats.bestCombo,shift.bestCombo);
      if(api.unlock)api.unlock('wingeria-perfect-order'); if(api.data.sfx && typeof window.beep==='function')try{window.beep(760)}catch(_){}
    } else shift.combo=0;
    if(c.isBoss && rating>=90){campaign.cash+=50;shift.revenue+=50;data.gems=(Number(data.gems)||0)+3;addMessage(shift,'👑','Chef Nova loved the plate: +$50 and +3 gems!');}
    else addMessage(shift,rating>=90?'⭐':'📝',`${c.name} gave ${Math.round(rating/20*10)/10}/5 stars · +${money(tip)} tip.`);
    shift.reviewNotes.unshift({name:c.name,icon:c.icon,rating,review:c.review,tip});shift.reviewNotes=shift.reviewNotes.slice(0,8);
    if(shift.combo>=5 && api.unlock)api.unlock('wingeria-five-combo');
    seatWaiting(shift);saved();draw();
  }
  function endPowerup(shift,type) {
    if(type==='patienceBloom') {
      if(shift.activePowerups.patienceBloom)return;
      shift.activePowerups.patienceBloom=true;
      shift.customers.filter(c=>customerAlive(c)).forEach(c=>c.patience=Math.min(c.maxPatience,c.patience+18));
      addMessage(shift,'🌸','Patience Bloom activated! Everyone takes a breath.');
    } else if(type==='heatSpark') {
      if(shift.activePowerups.heatSpark)return;
      shift.activePowerups.heatSpark=true;addMessage(shift,'⚡','Heat Spark is ready: your next fry has a wider perfect window.');
    }
    saved();draw();
  }
  function paintLive(shift) {
    const clock=content.querySelector('#wr-clock');
    if(clock)clock.textContent=`${Math.floor(shift.remaining/60)}:${String(Math.floor(shift.remaining%60)).padStart(2,'0')}`;
    const rem=content.querySelector('#wr-clockbar');if(rem)rem.style.width=clamp(shift.remaining/(Math.max(160,235-Math.floor(shift.day/8)*5))*100,0,100)+'%';
    shift.customers.forEach(c=>{
      const patience=content.querySelector(`[data-wr-patience="${c.id}"]`);if(patience)patience.style.width=clamp(c.patience/c.maxPatience*100,0,100)+'%';
      const num=content.querySelector(`[data-wr-patnum="${c.id}"]`);if(num)num.textContent=Math.ceil(c.patience)+'%';
      if(c.status==='frying' && c.id===shift.selectedId){const elapsed=c.fry.startedAt?(Date.now()-c.fry.startedAt)/1000:c.fry.elapsed;const bar=content.querySelector('#wr-frybar');if(bar){bar.style.left=clamp(elapsed/(c.fry.target+1.75)*100,0,100)+'%';bar.style.width='4px';}const read=content.querySelector('#wr-frytime');if(read)read.textContent=elapsed.toFixed(1)+'s';const zone=content.querySelector('#wr-fryzone');if(zone){const bonus=(owns('timer-window')?.25:0)+(shift.activePowerups.heatSpark?.35:0);const start=clamp((c.fry.target-bonus-.47)/(c.fry.target+1.75)*100,0,100);const end=clamp((c.fry.target+bonus+.47)/(c.fry.target+1.75)*100,0,100);zone.style.left=start+'%';zone.style.width=(end-start)+'%';}}
    });
  }
  function currentTableCards(shift) {
    const shown=shift.customers.filter(c=>c.status!=='not-arrived');
    return shown.map(c=>{
      const statusText=({queue:'WAITING',seated:'NEEDS ORDER',ordered:'TICKET TAKEN',frying:'IN THE FRYER',fried:'FRIED',sauced:'SAUCED',sided:'SIDE READY','ready-dessert':'DESSERT NEXT',ready:'READY TO SERVE',served:`${Math.round(c.rating/20*10)/10} ★`,walkedout:'LEFT'})[c.status]||c.status.toUpperCase();
      return `<button class="wr-guest ${c.id===shift.selectedId?'is-selected':''} ${isTerminal(c)?'is-terminal':''}" data-wr-select="${esc(c.id)}" aria-pressed="${c.id===shift.selectedId}" ${c.status==='not-arrived'?'disabled':''}>
        <span class="wr-guest-avatar">${c.icon}</span><span class="wr-guest-info"><strong>${esc(c.name)}${c.isBoss?' 👑':''}</strong><small>${esc(c.personality)} · ${c.table?`Table ${c.table}`:'Queue'}</small><span class="wr-status">${esc(statusText)}</span><span class="wr-patience"><i data-wr-patience="${esc(c.id)}" style="width:${clamp(c.patience/c.maxPatience*100,0,100)}%"></i></span></span><small class="wr-patience-num" data-wr-patnum="${esc(c.id)}">${Math.ceil(c.patience)}%</small>
      </button>`;
    }).join('');
  }
  function ticketMarkup(c) {
    if(!c) return '<div class="wr-ticket wr-ticket-empty">Choose a guest from the dining room to see their ticket.</div>';
    const o=c.order;
    return `<div class="wr-ticket"><div class="wr-ticket-head"><span>ORDER TICKET</span><b>${c.table?`TABLE ${c.table}`:'WAITLIST'}</b></div><div class="wr-ticket-customer"><span>${c.icon}</span><div><strong>${esc(c.name)}${c.isBoss?' · INSPECTOR':''}</strong><small>${esc(c.personalityTag||c.personality)} ${c.isVIP?'· VIP':''}</small></div></div><div class="wr-ticket-lines"><div><span>Wings</span><b>${o.wings} · ${esc(o.crisp)}</b></div><div><span>Sauce</span><b>${esc(labelOf(sauces,o.sauce))} ${o.sauceStyle==='On the side'?'· on side':''}</b></div><div><span>Seasoning</span><b>${esc(labelOf(seasonings,o.seasoning))}</b></div><div><span>Side</span><b>${esc(labelOf(sides,o.side))}</b></div><div><span>Drink</span><b>${esc(labelOf(drinks,o.drink))} · ${esc(o.ice)} ice</b></div>${o.sauceMix!=='None'?`<div><span>Mix recipe</span><b>${esc(labelOf(sauceMixes,o.sauceMix))}</b></div>`:''}${o.dessert?`<div><span>Dessert</span><b>${esc(labelOf(desserts,o.dessert))}</b></div>`:''}${o.combo?'<div class="wr-ticket-combo"><span>🍽️ FULL COMBO REQUEST</span></div>':''}${o.special?`<div class="wr-ticket-special">✦ SPECIAL: ${esc(o.special)}</div>`:''}</div><div class="wr-ticket-foot"><span>Flavor favorite</span><b>${esc(labelOf(sauces,c.favoriteSauce))}</b></div></div>`;
  }
  function choiceButtons(list,key,selected,disabled=false) {
    return `<div class="wr-choice-grid">${list.map(item=>`<button type="button" class="wr-choice ${selected===item.id?'is-picked':''}" data-wr-pick="${key}" data-value="${esc(item.id)}" aria-pressed="${selected===item.id}" ${disabled?'disabled':''}><span>${item.icon||'✨'}</span><b>${esc(item.name)}</b>${item.day>1&&item.day===campaign.day?'<small>NEW TODAY</small>':''}</button>`).join('')}</div>`;
  }
  function stationMarkup(shift,c) {
    const station=shift.station;
    const noCustomer=!c;
    if(station==='order') {
      if(noCustomer) return `<div class="wr-empty-state"><span>🪑</span><h3>Waiting for a guest</h3><p>New guests are still arriving. Use the moment to plan your next move.</p></div>`;
      if(c.status==='queue') return `<div class="wr-empty-state"><span>⏳</span><h3>${esc(c.name)} is in the wait line</h3><p>The dining room has no open table yet. Serve a meal to make a seat, or select someone already seated.</p></div>`;
      if(c.status==='seated') return `<div class="wr-station-intro"><span class="wr-station-icon">🧾</span><div><div class="wr-eyebrow">STEP 01 · ORDER STATION</div><h2>Take ${esc(c.name)}’s order</h2><p>Read the full ticket, including any combo or special note. Their patience starts ticking while they wait.</p></div></div>${ticketMarkup(c)}<button class="wr-primary wr-wide" data-wr-action="take-order">Confirm order & send to fryer <span>→</span></button>`;
      return `<div class="wr-empty-state"><span>✅</span><h3>Order already on the rail</h3><p>This order is at <strong>${esc(stationForStatus(c.status))}</strong>. Keep it moving through the stations.</p><button class="wr-primary" data-wr-go="${stationForStatus(c.status)}">Go to next station →</button></div>`;
    }
    if(!c || isTerminal(c)) return `<div class="wr-empty-state"><span>🍗</span><h3>Select an active guest</h3><p>Choose a guest from the dining room list to continue their order.</p></div>`;
    if(station==='fryer') {
      if(c.status==='ordered') {
        const occupied=totalFrying(shift),cap=fryerCount();
        return `<div class="wr-station-intro"><span class="wr-station-icon">🍳</span><div><div class="wr-eyebrow">STEP 02 · FRY STATION</div><h2>Fry for ${esc(c.name)}</h2><p>Match the requested crispness. Pull the basket when the heat marker hits the gold timing zone.</p></div></div><div class="wr-fryer-visual"><div class="wr-fryer-lid">${'🍗'.repeat(Math.min(6,Number(c.prep.wings)||c.order.wings))}</div><div class="wr-heat-ring"><span>HOT<br>OIL</span></div><div class="wr-fryer-target">Target: <b>${esc(c.order.crisp)}</b> · select the portion below</div></div><h3 class="wr-subhead">Wing portion</h3><div class="wr-choice-grid wr-compact">${[4,5,6,8].map(n=>`<button class="wr-choice ${Number(c.prep.wings)===n?'is-picked':''}" data-wr-pick="wings" data-value="${n}" aria-pressed="${Number(c.prep.wings)===n}"><span>🍗</span><b>${n} wings</b></button>`).join('')}</div><div class="wr-heat-info"><span>Fryer slots in use</span><b>${occupied}/${cap}</b></div><button class="wr-primary wr-wide" data-wr-action="start-fry" ${occupied>=cap||!c.prep.wings?'disabled':''}>Start basket <span>→</span></button><p class="wr-tip">Tip: the green/gold band is your perfect pull window. Leaving a basket too long burns the wings.</p>`;
      }
      if(c.status==='frying') return `<div class="wr-station-intro"><span class="wr-station-icon">🔥</span><div><div class="wr-eyebrow">STEP 02 · LIVE COOKING</div><h2>Watch the basket</h2><p>Pull at the sweet spot. The timer keeps running if you work on another ticket.</p></div></div><div class="wr-fryer-live"><div class="wr-fryer-live-emoji">🍗🍗🍗</div><div class="wr-live-timer" id="wr-frytime">0.0s</div><div class="wr-fry-track"><span class="wr-fry-zone" id="wr-fryzone"></span><i class="wr-fry-fill" id="wr-frybar"></i></div><div class="wr-track-legend"><span>Undercooked</span><span>PERFECT PULL</span><span>Burnt</span></div><button class="wr-primary wr-wide wr-pull" data-wr-action="pull-fry">🧺 Pull basket now</button><p class="wr-tip">Requested: ${esc(c.order.crisp)}. Pulling a little early or late earns fewer points.</p></div>`;
      if(c.status==='fried') return `<div class="wr-empty-state"><span>${c.fry.quality==='perfect'?'✨':c.fry.quality==='okay'?'🍗':'🔥'}</span><h3>${c.fry.quality==='perfect'?'Perfect fry!':c.fry.quality==='okay'?'Cooked, but not quite perfect':'Those wings got overdone'}</h3><p>${esc(c.name)}’s basket is ready. Continue to sauce, seasoning, and toss style.</p><button class="wr-primary" data-wr-go="sauce">Go to sauce lab →</button></div>`;
      return `<div class="wr-empty-state"><span>🧺</span><h3>Fryer finished</h3><p>This ticket has already moved past the fryer.</p><button class="wr-primary" data-wr-go="${stationForStatus(c.status)}">Continue order →</button></div>`;
    }
    if(station==='sauce') {
      if(c.status!=='fried')return `<div class="wr-empty-state"><span>🌶️</span><h3>Wings first, sauce second</h3><p>This order needs to finish frying before it comes to the sauce lab.</p><button class="wr-primary" data-wr-go="fryer">Go to fryer →</button></div>`;
      const sauceMenu=menuChoices(sauces),seasonMenu=menuChoices(seasonings),mixMenu=sauceMixes.filter(m=>m.day<=shift.day&&owns('sauce-lab'));
      return `<div class="wr-station-intro"><span class="wr-station-icon">🌶️</span><div><div class="wr-eyebrow">STEP 03 · SAUCE LAB</div><h2>Build the flavor</h2><p>Choose the requested sauce, seasoning and toss style. Signature mixes unlock as your restaurant grows.</p></div></div><h3 class="wr-subhead">1. Sauce</h3>${choiceButtons(sauceMenu,'sauce',c.prep.sauce)}<h3 class="wr-subhead">2. Seasoning</h3>${choiceButtons(seasonMenu,'seasoning',c.prep.seasoning)}<h3 class="wr-subhead">3. Serving style</h3><div class="wr-choice-grid wr-compact">${[['Tossed','🥣','Coat every wing'],['On the side','🥫','Dip it yourself']].map(([v,icon,sub])=>`<button class="wr-choice ${c.prep.sauceStyle===v?'is-picked':''}" data-wr-pick="sauceStyle" data-value="${v}" aria-pressed="${c.prep.sauceStyle===v}"><span>${icon}</span><b>${v}</b><small>${sub}</small></button>`).join('')}</div>${mixMenu.length?`<h3 class="wr-subhead">4. Signature sauce blend</h3><div class="wr-choice-grid wr-compact"><button class="wr-choice ${c.prep.sauceMix==='None'?'is-picked':''}" data-wr-pick="sauceMix" data-value="None"><span>➖</span><b>No mix</b></button>${mixMenu.map(m=>`<button class="wr-choice ${c.prep.sauceMix===m.id?'is-picked':''}" data-wr-pick="sauceMix" data-value="${m.id}"><span>${m.icon}</span><b>${m.name}</b><small>${labelOf(sauces,m.first)} + ${labelOf(sauces,m.second)}</small></button>`).join('')}</div>`:''}<button class="wr-primary wr-wide" data-wr-action="toss">Toss & season wings <span>→</span></button>`;
    }
    if(station==='sides') {
      if(c.status!=='sauced')return `<div class="wr-empty-state"><span>🍟</span><h3>Finish the flavor first</h3><p>Move this order through the sauce lab before adding sides.</p><button class="wr-primary" data-wr-go="sauce">Go to sauce lab →</button></div>`;
      return `<div class="wr-station-intro"><span class="wr-station-icon">🍟</span><div><div class="wr-eyebrow">STEP 04 · SIDE STATION</div><h2>Pick the perfect side</h2><p>The side is part of the order score. Check the ticket before plating.</p></div></div>${choiceButtons(menuChoices(sides),'side',c.prep.side)}<button class="wr-primary wr-wide" data-wr-action="side">Plate side <span>→</span></button>`;
    }
    if(station==='drinks') {
      if(c.status!=='sided')return `<div class="wr-empty-state"><span>🥤</span><h3>Plate the side first</h3><p>Once the side is ready, fill the customer's requested drink and ice level.</p><button class="wr-primary" data-wr-go="sides">Go to side station →</button></div>`;
      return `<div class="wr-station-intro"><span class="wr-station-icon">🥤</span><div><div class="wr-eyebrow">STEP 05 · DRINK STATION</div><h2>Mix a refreshing drink</h2><p>Pick the right drink and ice amount, then send the order to serving.</p></div></div>${choiceButtons(menuChoices(drinks),'drink',c.prep.drink)}<h3 class="wr-subhead">Ice level</h3><div class="wr-choice-grid wr-compact">${[['None','🧊','No ice'],['Light','❄️','A little'],['Regular','🥤','Regular'],['Extra','🧊','Extra chill']].map(([v,icon,sub])=>`<button class="wr-choice ${c.prep.ice===v?'is-picked':''}" data-wr-pick="ice" data-value="${v}" aria-pressed="${c.prep.ice===v}"><span>${icon}</span><b>${v}</b><small>${sub}</small></button>`).join('')}</div><button class="wr-primary wr-wide" data-wr-action="drink">Fill cup & send to serving <span>→</span></button>`;
    }
    if(station==='dessert') {
      if(c.status!=='ready-dessert')return `<div class="wr-empty-state"><span>🍨</span><h3>No dessert needed</h3><p>This guest ordered a regular combo. Send it to the serving window.</p><button class="wr-primary" data-wr-go="serve">Go serve →</button></div>`;
      return `<div class="wr-station-intro"><span class="wr-station-icon">🍨</span><div><div class="wr-eyebrow">BONUS STATION · DESSERT CART</div><h2>One last treat</h2><p>Premium combo orders can include a dessert once you've purchased the dessert cart.</p></div></div>${choiceButtons(desserts,'dessert',c.prep.dessert)}<button class="wr-primary wr-wide" data-wr-action="dessert">Add dessert to tray <span>→</span></button>`;
    }
    if(station==='serve') {
      if(c.status!=='ready')return `<div class="wr-empty-state"><span>🛎️</span><h3>Not ready to serve yet</h3><p>Finish frying, sauce, side, and drink first. ${c.order.dessert?'This combo also needs a dessert.':''}</p><button class="wr-primary" data-wr-go="${stationForStatus(c.status)}">Continue order →</button></div>`;
      const guests=shift.customers.filter(x=>customerAlive(x)&&x.table);
      return `<div class="wr-station-intro"><span class="wr-station-icon">🛎️</span><div><div class="wr-eyebrow">FINAL STEP · SERVING WINDOW</div><h2>Deliver to the right table</h2><p>Choose the guest who placed this ticket. Table mix-ups cost tips and satisfaction.</p></div></div><div class="wr-plate-preview"><div class="wr-plate"><span>🍗</span><span>${itemById(sides,c.prep.side)?.icon||'🍟'}</span><span>${itemById(drinks,c.prep.drink)?.icon||'🥤'}</span>${c.prep.dessert?`<span>${itemById(desserts,c.prep.dessert)?.icon||'🍨'}</span>`:''}</div><div><b>${c.order.wings} ${c.fry.quality==='perfect'?'✨':'🍗'} wings</b><p>${esc(labelOf(sauces,c.prep.sauce))} · ${esc(labelOf(sides,c.prep.side))}</p><small>${c.fry.quality==='perfect'?'Perfect cook':c.fry.quality==='okay'?'Cooked, timing off':'Over/undercooked'}</small></div></div><label class="wr-label" for="wr-recipient">Serve to</label><select class="wr-select" id="wr-recipient"><option value="">Choose a table…</option>${guests.map(g=>`<option value="${esc(g.id)}" ${g.id===c.id?'selected':''}>Table ${g.table} · ${esc(g.name)}</option>`).join('')}</select><button class="wr-primary wr-wide" data-wr-action="serve" ${!guests.length?'disabled':''}>Serve meal & collect review <span>→</span></button><p class="wr-tip">A perfect order is worth more when the right guest gets it quickly.</p>`;
    }
    return '<p>Choose a station to continue.</p>';
  }
  function stageName(c) {return ({'not-arrived':'Joining soon',queue:'Waiting for a table',seated:'Ready to order',ordered:'Ticket on rail',frying:'Frying now',fried:'Needs sauce',sauced:'Needs a side',sided:'Needs a drink','ready-dessert':'Needs dessert',ready:'Ready to serve',served:'Served',walkedout:'Walked out'})[c.status]||c.status;}
  function draw() {
    const s=getShift();if(!s)return;
    const c=currentCustomer(s);
    const story=storyForDay(s.day);
    const stationList=[['order','🧾','Orders'],['fryer','🍳','Fryer'],['sauce','🌶️','Sauce'],['sides','🍟','Sides'],['drinks','🥤','Drinks'],...(owns('dessert-cart')?[['dessert','🍨','Dessert']]:[]),['serve','🛎️','Serve']];
    const activeOrders=s.customers.filter(x=>!isTerminal(x)&&x.status!=='not-arrived');
    const completed=s.customers.filter(x=>isTerminal(x)).length;
    content.innerHTML=`<section class="wr-app" aria-label="Wingeria Rush Remastered restaurant game">
      <header class="wr-gamebar"><button class="wr-back" data-wr-action="exit" aria-label="Return to arcade">← Arcade</button><div class="wr-brand"><span class="wr-brand-mark">🍗</span><div><strong>Wingeria <em>Rush</em></strong><small>REMASTERED · RESTAURANT STORY</small></div></div><div class="wr-top-stats"><span>🪙 <b>${money(campaign.cash)}</b></span><span>⭐ <b>Day ${s.day}</b></span><span>👥 <b>${s.served}/${s.customerCount}</b></span></div><button class="wr-quiet" data-wr-action="shop">🧰 Upgrades</button></header>
      <section class="wr-banner"><div class="wr-banner-copy"><div class="wr-eyebrow">${s.day%10===0?'👑 GOLDEN INSPECTION DAY':`DAY ${s.day} · ${esc(s.event.name.toUpperCase())}`}</div><h1>Good food.<br><span>Great timing.</span></h1><p>${esc(s.event.desc)} ${s.day%10===0?'Chef Nova is on today’s guest list — a perfect plate earns a rare gem bonus.':`Today's story: ${esc(story[1])}.`}</p><div class="wr-banner-tags"><span>🍗 ${s.customerCount} guests</span><span>🔥 ${fryerCount()} fryer${fryerCount()>1?'s':''}</span><span>🪑 ${tableCount()} tables</span></div></div><div class="wr-restaurant-illustration" aria-hidden="true"><div class="wr-light-string">✦ ─ ✦ ─ ✦</div><div class="wr-shop-window"><span>WING</span><b>RUSH</b><small>HOT · FRESH · HAPPY</small></div><div class="wr-food-float wr-food-one">🍗</div><div class="wr-food-float wr-food-two">🍟</div><div class="wr-food-float wr-food-three">🥤</div></div></section>
      <section class="wr-dashboard-strip"><div class="wr-shift-clock"><span>SHIFT CLOCK</span><strong id="wr-clock">${Math.floor(s.remaining/60)}:${String(Math.floor(s.remaining%60)).padStart(2,'0')}</strong><div class="wr-clock-track"><i id="wr-clockbar" style="width:${clamp(s.remaining/(Math.max(160,235-Math.floor(s.day/8)*5))*100,0,100)}%"></i></div></div><div><small>SHIFT SALES</small><strong>${money(s.revenue)}</strong></div><div><small>COMBO</small><strong>🔥 ×${s.combo}</strong></div><div><small>PERFECT PLATES</small><strong>${s.perfect}</strong></div><button class="wr-powerup" data-wr-action="patience" ${s.activePowerups.patienceBloom?'disabled':''}>🌸 Patience Bloom <small>once / shift</small></button><button class="wr-powerup" data-wr-action="heat" ${s.activePowerups.heatSpark?'disabled':''}>⚡ Heat Spark <small>next basket</small></button></section>
      <div class="wr-main-layout"><aside class="wr-sidebar"><div class="wr-panel-head"><div><div class="wr-eyebrow">FRONT OF HOUSE</div><h2>Dining room</h2></div><span class="wr-mini-count">${activeOrders.length} active</span></div><div class="wr-guest-list">${currentTableCards(s)}</div><div class="wr-table-key"><span><i class="wr-dot wr-dot-green"></i>Active guest</span><span><i class="wr-dot wr-dot-yellow"></i>In queue</span></div><div class="wr-panel-head wr-orders-head"><div><div class="wr-eyebrow">KITCHEN TICKET</div><h2>Ticket rail</h2></div></div><div class="wr-mini-orders">${s.customers.filter(x=>['ordered','frying','fried','sauced','sided','ready-dessert','ready'].includes(x.status)).map(x=>`<button data-wr-select="${esc(x.id)}" class="wr-mini-order ${x.id===s.selectedId?'active':''}"><span>${x.status==='ready'?'🛎️':x.status==='frying'?'🔥':'🎟️'}</span><span><b>${esc(x.name)}</b><small>${esc(stageName(x))}</small></span><strong>${x.order.wings}×</strong></button>`).join('')||'<p class="wr-soft">No active kitchen tickets yet.</p>'}</div></aside>
      <main class="wr-kitchen"><div class="wr-station-rail" role="tablist" aria-label="Restaurant stations">${stationList.map(([id,icon,label])=>`<button role="tab" aria-selected="${s.station===id}" class="wr-station-tab ${s.station===id?'active':''}" data-wr-go="${id}"><span>${icon}</span><b>${label}</b></button>`).join('')}</div><div class="wr-workstation"><div class="wr-workstation-heading"><div><div class="wr-eyebrow">${esc(stationLabel(s.station).toUpperCase())}</div><h2>${esc(stationList.find(x=>x[0]===s.station)?.[2]||'Kitchen')}</h2></div><span class="wr-step-pill">${s.served} served · ${s.walkouts} walked out</span></div>${stationMarkup(s,c)}</div><div class="wr-live-feed"><div class="wr-feed-head"><b>🍽️ Kitchen chatter</b><small>Live shift updates</small></div><div class="wr-feed-items">${s.messages.slice(0,3).map(m=>`<p><span>${m.icon}</span>${esc(m.text)}</p>`).join('')||'<p><span>🌿</span>Welcome in! Take the first order to start the day.</p>'}</div></div></main><aside class="wr-ticket-column"><div class="wr-panel-head"><div><div class="wr-eyebrow">KEEP IT CLOSE</div><h2>Guest ticket</h2></div><span class="wr-ticket-pin">✦</span></div>${ticketMarkup(c)}<div class="wr-stage-progress"><div class="wr-eyebrow">ORDER PROGRESS</div>${[['order','Order'],['fryer','Fry'],['sauce','Sauce'],['sides','Side'],['drinks','Drink'],...(owns('dessert-cart')&&c?.order.dessert?[['dessert','Dessert']]:[]),['serve','Serve']].map(([id,label],i)=>{const active=c && stationForStatus(c.status)===id;const complete=c&&(['ordered','frying','fried','sauced','sided','ready-dessert','ready','served'].includes(c.status))&&['order','fryer','sauce','sides','drinks','dessert','serve'].indexOf(id)<['order','fryer','sauce','sides','drinks','dessert','serve'].indexOf(stationForStatus(c.status));return `<div class="wr-progress-step ${complete?'done':''} ${active?'current':''}"><span>${complete?'✓':i+1}</span><b>${label}</b></div>`}).join('')}</div></aside></div>
      <footer class="wr-game-footer"><span>Autosave on · Day ${s.day} of your growing restaurant story</span><span>Made for CaydenProxy Arcade+ 🌻</span></footer>
    </section>`;
    bind(s);
    paintLive(s);
  }
  function bind(s) {
    content.querySelectorAll('[data-wr-select]').forEach(b=>b.addEventListener('click',()=>{s.selectedId=b.dataset.wrSelect;const c=currentCustomer(s);if(c)s.station=stationForStatus(c.status);saved();draw();}));
    content.querySelectorAll('[data-wr-go]').forEach(b=>b.addEventListener('click',()=>{s.station=b.dataset.wrGo;saved();draw();}));
    content.querySelectorAll('[data-wr-pick]').forEach(b=>b.addEventListener('click',()=>{const c=currentCustomer(s),key=b.dataset.wrPick,value=b.dataset.value;if(!c)return;setPick(s,c,key,value);}));
    content.querySelectorAll('[data-wr-action]').forEach(b=>b.addEventListener('click',()=>{
      const action=b.dataset.wrAction,c=currentCustomer(s);
      if(action==='exit'){cleanup();lobby();return;}
      if(action==='shop'){renderShop('shift');return;}
      if(action==='patience'){endPowerup(s,'patienceBloom');return;}
      if(action==='heat'){endPowerup(s,'heatSpark');return;}
      if(action==='take-order'){takeOrder(s,c);return;}
      if(action==='start-fry'){startFry(s,c);return;}
      if(action==='pull-fry'){pullFry(s,c);return;}
      if(action==='toss'){tossSauce(s,c);return;}
      if(action==='side'){prepareSide(s,c);return;}
      if(action==='drink'){fillDrink(s,c);return;}
      if(action==='dessert'){prepareDessert(s,c);return;}
      if(action==='serve'){const select=content.querySelector('#wr-recipient');serveMeal(s,c,select?.value||'');return;}
    }));
  }
  function finishShift(clockRanOut,reason) {
    const s=getShift();if(!s||s.ended)return;
    s.ended=true;if(pulseTimer){clearInterval(pulseTimer);pulseTimer=null;}
    const avg=s.reviewNotes.length?s.reviewNotes.reduce((sum,r)=>sum+r.rating,0)/s.reviewNotes.length:0;
    const ratio=s.served/Math.max(1,s.customerCount);
    const won=ratio>=.62 && avg>=58;
    const xp=Math.max(12,Math.round(s.score*.38+s.served*8+s.perfect*5+(won?25:0)));
    if(won){campaign.stats.daysCompleted++;data.wins=(Number(data.wins)||0)+1;if(api.unlock)api.unlock('wingeria-shift-clear');}
    campaign.stats.walkouts+=s.walkouts;
    const report={day:s.day,won,clockRanOut,reason,served:s.served,total:s.customerCount,walkouts:s.walkouts,score:s.score,revenue:s.revenue,avgRating:Math.round(avg),perfect:s.perfect,bestCombo:s.bestCombo,xp,cash:campaign.cash,event:s.event.name,reportAt:Date.now(),reviews:s.reviewNotes.slice(0,8)};
    campaign.lastReport=report;campaign.activeShift=null;
    if(s.day>=10 && won && api.unlock)api.unlock('wingeria-inspection-ready');
    if(s.day>=100 && won && api.unlock)api.unlock('wingeria-century-chef');
    api.addXP(xp,'Wingeria Rush Day '+s.day);
    if(s.perfect>=3 && api.unlock)api.unlock('wingeria-perfect-shift');
    if(won && ratio===1 && api.unlock)api.unlock('wingeria-no-walkouts');
    saved();showReport(report);
  }
  function showReport(r) {
    cleanup();
    const stars=Math.max(0,Math.min(5,Math.round(r.avgRating/20)));
    content.innerHTML=`<section class="wr-app wr-report"><header class="wr-gamebar"><button class="wr-back" data-wr-report="home">← Arcade</button><div class="wr-brand"><span class="wr-brand-mark">🍗</span><div><strong>Wingeria <em>Rush</em></strong><small>SHIFT REPORT · DAY ${r.day}</small></div></div><div class="wr-top-stats"><span>🪙 <b>${money(campaign.cash)}</b></span><span>✨ <b>+${r.xp} XP</b></span></div></header><section class="wr-report-hero"><div class="wr-report-medal">${r.won?'🏆':'🍗'}</div><div class="wr-eyebrow">${r.won?'SHIFT CLEARED':'SHIFT REVIEW'}</div><h1>${r.won?'Kitchen star!':'Back to the pass'}</h1><p>${r.won?'The guests noticed the care. Your next restaurant day is ready to unlock.':'Keep an eye on patience, doneness, and the exact ticket. You can retry this day without losing your campaign.'}</p><div class="wr-stars" aria-label="${stars} out of 5 stars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div><div class="wr-report-stats"><div><small>ORDERS SERVED</small><strong>${r.served}/${r.total}</strong></div><div><small>AVG. RATING</small><strong>${r.avgRating}%</strong></div><div><small>SHIFT SALES</small><strong>${money(r.revenue)}</strong></div><div><small>PERFECT PLATES</small><strong>${r.perfect}</strong></div><div><small>WALKOUTS</small><strong>${r.walkouts}</strong></div><div><small>BEST COMBO</small><strong>×${r.bestCombo}</strong></div></div></section><div class="wr-report-columns"><section class="wr-report-panel"><div class="wr-panel-head"><div><div class="wr-eyebrow">GUEST REVIEWS</div><h2>What they said</h2></div></div>${r.reviews.map(v=>`<article class="wr-review"><span>${v.icon||'💬'}</span><div><b>${esc(v.name)} · ${v.rating}/100</b><p>${esc(v.review)}</p></div><strong>${money(v.tip||0)}</strong></article>`).join('')||'<p class="wr-soft">No reviews were recorded this shift.</p>'}</section><section class="wr-report-panel"><div class="wr-panel-head"><div><div class="wr-eyebrow">NEXT MOVE</div><h2>Grow your restaurant</h2></div></div><p class="wr-soft">${r.won?`Next up: Day ${r.day+1}. New challenges and menu items arrive as your restaurant grows.`:'You can improve this day or buy an upgrade before trying again.'}</p><button class="wr-primary wr-wide" data-wr-report="shop">🧰 Open upgrade shop</button><button class="wr-secondary wr-wide" data-wr-report="retry">↻ ${r.won?'Replay this day':'Retry day '+r.day}</button>${r.won?`<button class="wr-primary wr-wide" data-wr-report="next">Start Day ${r.day+1} →</button>`:''}<div class="wr-report-unlocks"><b>Campaign progress</b><div class="wr-campaign-track"><i style="width:${Math.min(100,r.day)}%"></i></div><small>Day ${r.day} · ${r.day>=100?'Century Chef status reached':'Day 100 is the long-term mastery milestone'}</small></div></section></div><footer class="wr-game-footer"><span>Every shift auto-saves locally.</span><span>Keep growing 🌻</span></footer></section>`;
    content.querySelector('[data-wr-report="home"]').onclick=goHome;
    content.querySelector('[data-wr-report="shop"]').onclick=()=>renderShop('report');
    content.querySelector('[data-wr-report="retry"]').onclick=()=>{campaign.activeShift=null;saved();startShift();};
    const next=content.querySelector('[data-wr-report="next"]');if(next)next.onclick=()=>{campaign.day=Math.max(campaign.day,r.day+1);campaign.activeShift=null;applyDayUnlocks();saved();lobby();};
  }
  function renderShop(back='lobby') {
    cleanup();
    const available=upgrades.filter(u=>u.day<=campaign.day);
    const next=upgrades.filter(u=>u.day>campaign.day).sort((a,b)=>a.day-b.day).slice(0,3);
    content.innerHTML=`<section class="wr-app wr-shop-page"><header class="wr-gamebar"><button class="wr-back" data-wr-shop="back">← Back</button><div class="wr-brand"><span class="wr-brand-mark">🧰</span><div><strong>Kitchen <em>Workshop</em></strong><small>RESTAURANT UPGRADES</small></div></div><div class="wr-top-stats"><span>🪙 <b>${money(campaign.cash)}</b></span><span>⭐ <b>Day ${campaign.day}</b></span></div></header><section class="wr-shop-hero"><div class="wr-eyebrow">MAKE THE KITCHEN YOURS</div><h1>Small upgrades.<br><span>Big service energy.</span></h1><p>Buy permanent improvements and unlock new stations. All purchases save to your restaurant campaign.</p></section><div class="wr-shop-grid">${available.map(u=>{const owned=owns(u.id);return `<article class="wr-upgrade-card ${owned?'owned':''}"><div class="wr-upgrade-icon">${u.icon}</div><span class="wr-unlock-label">${owned?'OWNED':`UNLOCKED · DAY ${u.day}`}</span><h3>${esc(u.name)}</h3><p>${esc(u.desc)}</p><button class="${owned?'wr-secondary':'wr-primary'} wr-wide" data-wr-buy="${u.id}" ${owned||campaign.cash<u.cost?'disabled':''}>${owned?'✓ Purchased':`Buy · ${money(u.cost)}`}</button></article>`;}).join('')||'<p class="wr-soft">More kitchen gear unlocks as you complete restaurant days.</p>'}</div><section class="wr-locked-section"><div class="wr-panel-head"><div><div class="wr-eyebrow">COMING TO YOUR KITCHEN</div><h2>Future unlocks</h2></div></div><div class="wr-future-unlocks">${next.map(u=>`<div><span>${u.icon}</span><b>${esc(u.name)}</b><small>Unlocks Day ${u.day}</small></div>`).join('')||'<p>Every campaign milestone is now within reach. Keep the stars coming!</p>'}</div></section><footer class="wr-game-footer"><span>Balance: ${money(campaign.cash)}</span><span>Local campaign save · No account needed</span></footer></section>`;
    content.querySelector('[data-wr-shop="back"]').onclick=()=>{if(back==='report'&&campaign.lastReport)showReport(campaign.lastReport);else if(back==='shift'&&campaign.activeShift){draw();beginTimers();}else lobby();};
    content.querySelectorAll('[data-wr-buy]').forEach(b=>b.onclick=()=>{const up=upgrades.find(u=>u.id===b.dataset.wrBuy);if(!up||owns(up.id)||campaign.cash<up.cost)return;campaign.cash-=up.cost;campaign.upgrades.push(up.id);if(up.id==='dessert-cart')campaign.unlockedSeen.push('dessert-station');saved();notify(`🧰 ${up.name} purchased!`);renderShop(back);});
  }
  function lobby() {
    cleanup();
    const savedShift=campaign.activeShift;
    const nextStory=storyForDay(campaign.day);
    const unlocks=[...sauces,...seasonings,...sides,...drinks,...sauceMixes].filter(x=>x.day===campaign.day);
    content.innerHTML=`<section class="wr-app wr-lobby"><header class="wr-gamebar"><button class="wr-back" data-wr-lobby="home">← Arcade</button><div class="wr-brand"><span class="wr-brand-mark">🍗</span><div><strong>Wingeria <em>Rush</em></strong><small>REMASTERED · YOUR RESTAURANT STORY</small></div></div><div class="wr-top-stats"><span>🪙 <b>${money(campaign.cash)}</b></span><span>🏅 <b>${campaign.stats.daysCompleted} cleared</b></span></div><button class="wr-quiet" data-wr-lobby="shop">🧰 Kitchen shop</button></header><section class="wr-lobby-hero"><div class="wr-lobby-copy"><div class="wr-eyebrow">${campaign.day>=100?'🌟 CENTURY CHEF CAMPAIGN':`YOUR RESTAURANT · DAY ${campaign.day}`}</div><h1>Welcome to the<br><span>wing side.</span></h1><p>${esc(nextStory[2])} Every day brings new regulars, recipes, restaurant events and tougher service challenges.</p><div class="wr-lobby-actions"><button class="wr-primary" data-wr-lobby="start">${savedShift?'▶ Resume saved shift':`▶ Start Day ${campaign.day}`} <span>→</span></button><button class="wr-secondary" data-wr-lobby="shop">🧰 Upgrades & unlocks</button></div><div class="wr-lobby-badges"><span>💾 Auto-saved</span><span>📈 100+ day campaign</span><span>🎯 Daily special events</span></div></div><div class="wr-lobby-art" aria-hidden="true"><div class="wr-lobby-orbit orbit-one">🍗</div><div class="wr-lobby-orbit orbit-two">🌶️</div><div class="wr-lobby-orbit orbit-three">🍟</div><div class="wr-lobby-plate">🍗<span>🍋</span><i>✨</i></div><div class="wr-lobby-cup">🥤</div><div class="wr-lobby-spark spark-a">✦</div><div class="wr-lobby-spark spark-b">✧</div></div></section><div class="wr-lobby-stats"><div><small>CAMPAIGN DAY</small><strong>${campaign.day}</strong></div><div><small>RESTAURANT CASH</small><strong>${money(campaign.cash)}</strong></div><div><small>DAYS CLEARED</small><strong>${campaign.stats.daysCompleted}</strong></div><div><small>ORDERS SERVED</small><strong>${campaign.stats.ordersServed}</strong></div><div><small>BEST RATING</small><strong>${campaign.stats.bestRating}%</strong></div><div><small>PERFECT PLATES</small><strong>${campaign.stats.perfectOrders}</strong></div></div><div class="wr-lobby-two-col"><section class="wr-report-panel"><div class="wr-panel-head"><div><div class="wr-eyebrow">TODAY'S EVENT</div><h2>${esc(randomEvent(campaign.day).name)}</h2></div><span class="wr-mini-count">DAY ${campaign.day}</span></div><p class="wr-soft">${esc(randomEvent(campaign.day).desc)}</p><div class="wr-unlock-preview">${unlocks.slice(0,5).map(u=>`<span>${u.icon} ${esc(u.name)} <small>NEW</small></span>`).join('')||'<span>🌻 Keep clearing days to unlock new flavors, sides and stations.</span>'}</div></section><section class="wr-report-panel"><div class="wr-panel-head"><div><div class="wr-eyebrow">RESTAURANT MASTERY</div><h2>Your best run</h2></div><span class="wr-ticket-pin">🏆</span></div><div class="wr-best-grid"><div><small>BEST TIP</small><b>${money(campaign.stats.bestTip)}</b></div><div><small>BEST COMBO</small><b>×${campaign.stats.bestCombo}</b></div><div><small>SHIFT CLEAR RATE</small><b>${campaign.stats.daysCompleted?Math.round(campaign.stats.daysCompleted/campaign.day*100):0}%</b></div></div><p class="wr-soft">Milestones: Day 10 inspection · Day 50 district favorite · Day 100 Century Chef.</p></section></div><footer class="wr-game-footer"><span>Wingeria Rush Remastered · original game by CaydenProxy</span><span>🌻 Made by Cayden Flowers</span></footer></section>`;
    content.querySelector('[data-wr-lobby="home"]').onclick=goHome;
    content.querySelector('[data-wr-lobby="start"]').onclick=()=>startShift();
    content.querySelectorAll('[data-wr-lobby="shop"]').forEach(b=>b.onclick=()=>renderShop('lobby'));
  }
  function startShift() {
    let s=campaign.activeShift;
    if(!s || s.ended) s=newShift();
    // Rebase cooking timers if a saved shift was paused between sessions.
    s.customers.filter(c=>c.status==='frying').forEach(c=>{if(!c.fry.startedAt)c.fry.startedAt=Date.now()-c.fry.elapsed*1000;});
    s.ended=false;saved();draw();beginTimers();
  }
  function start() {
    applyDayUnlocks();
    if(campaign.activeShift && !campaign.activeShift.ended) { startShift(); return; }
    lobby();
  }
  // Called by the Arcade+ core when a game card launches.
  window.CaydenWingeria = { start, startShift, lobby, draw, cleanup, showReport, campaign };
  const oldStart = window.CaydenArcadePlus?.startGame;
  if (window.CaydenArcadePlus) {
    window.CaydenArcadePlus.startGame = function(id,g) {
      if (id !== 'wingeria') cleanup();
      const wasHandled = typeof oldStart === 'function' ? oldStart(id,g) : false;
      if (id === 'wingeria') { start(); return true; }
      return wasHandled;
    };
  }
  // Keep the main arcade home callback safe if a navigation occurs while a shift is open.
  const oldHome=api.home;
  api.home=function(){ cleanup(); return oldHome(); };
  window.addEventListener('pagehide',cleanup,{passive:true});
})();
