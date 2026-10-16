/* CaydenProxy Starter Science Lab — small, local sandbox prototype. */
(function () {
  'use strict';

  const STORAGE_KEY = 'cp-science-lab-v1';
  const ROWS = 6;
  const COLS = 8;
  const CELL_COUNT = ROWS * COLS;
  const baseMaterials = [
    { id: 'water', name: 'Water', icon: '💧', note: 'A liquid that supports many everyday processes.' },
    { id: 'sand', name: 'Sand', icon: '🏖️', note: 'Tiny mineral grains.' },
    { id: 'soil', name: 'Soil', icon: '🟫', note: 'A mix of mineral particles and organic matter.' },
    { id: 'plant', name: 'Plant', icon: '🌿', note: 'Living things need suitable conditions to grow.' },
    { id: 'wood', name: 'Wood', icon: '🪵', note: 'Plant material used here as a simple model.' },
    { id: 'fire', name: 'Fire', icon: '🔥', note: 'A visual symbol for heat in this simplified sandbox.' },
    { id: 'lava', name: 'Lava', icon: '🌋', note: 'Molten rock at Earth’s surface.' },
    { id: 'ice', name: 'Ice', icon: '🧊', note: 'Water in its solid state.' },
    { id: 'steam', name: 'Steam', icon: '♨️', note: 'Water vapor is water in the gas state.' },
    { id: 'stone', name: 'Stone', icon: '🪨', note: 'Solid rock material.' },
    { id: 'flower', name: 'Flower', icon: '🌼', note: 'A plant structure involved in reproduction.' },
    { id: 'air', name: 'Air', icon: '💨', note: 'A mixture of gases around us.' },
    { id: 'seed', name: 'Seed', icon: '🌰', note: 'A plant embryo that can germinate when conditions are suitable.' },
    { id: 'sunlight', name: 'Sunlight', icon: '☀️', note: 'Light energy from the Sun supports photosynthesis and warms Earth.' },
    { id: 'rain', name: 'Rain', icon: '🌧️', note: 'Precipitation returns water from clouds to Earth’s surface.' },
    { id: 'battery', name: 'Battery', icon: '🔋', note: 'A modeled source of electrical energy in this learning sandbox.' },
    { id: 'wire', name: 'Wire', icon: '〰️', note: 'A simplified conductor used in the game’s circuit model.' },
    { id: 'electricity', name: 'Electricity', icon: '⚡', note: 'Energy associated with electric charge; represented abstractly here.' }
  ];
  const productMaterials = [
    { id: 'glass', name: 'Glass', icon: '🪟', note: 'A material commonly made from silica-rich sand at high temperatures.' },
    { id: 'charcoal', name: 'Charcoal', icon: '⚫', note: 'A carbon-rich material; the game uses this as a simplified wood-and-heat outcome.' },
    { id: 'sprout', name: 'Sprout', icon: '🌱', note: 'A young plant beginning to grow.' },
    { id: 'mud', name: 'Mud', icon: '🟤', note: 'Soil mixed with water.' },
    { id: 'bloom', name: 'Bloom', icon: '🌸', note: 'A flourishing flower in this garden-themed model.' },
    { id: 'obsidian', name: 'Obsidian', icon: '🖤', note: 'Volcanic glass that can form when lava cools quickly.' },
    { id: 'cloud', name: 'Cloud', icon: '☁️', note: 'Cloud droplets or ice crystals form when moist air cools.' },
    { id: 'moss', name: 'Moss', icon: '🌱', note: 'Mosses are small plants often found in damp habitats.' },
    { id: 'pollen', name: 'Pollen', icon: '🌾', note: 'Pollen carries plant reproductive cells in seed plants.' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈', note: 'Rainbows form when sunlight is refracted, reflected, and dispersed by water droplets.' },
    { id: 'circuit', name: 'Circuit', icon: '🔌', note: 'A circuit is a connected path through which electric current can flow.' },
    { id: 'light', name: 'Light', icon: '💡', note: 'The toy circuit model turns on a light as a simplified output.' },
    { id: 'fossil', name: 'Fossil', icon: '🦴', note: 'Fossils preserve evidence of past life, usually through long geological processes.' },
    { id: 'puddle', name: 'Puddle', icon: '💦', note: 'A shallow collection of surface water in this water-cycle model.' },
    { id: 'ash', name: 'Ash', icon: '🌫️', note: 'A simplified material-change outcome used to discuss residues and Earth systems.' },
    { id: 'snow', name: 'Snow', icon: '❄️', note: 'Frozen precipitation; the game uses this tile to model water-cycle states.' },
    { id: 'solar-cell', name: 'Solar Cell', icon: '🔆', note: 'A model tile representing a device that converts sunlight into electrical energy.' }
  ];
  const materials = [...baseMaterials, ...productMaterials];
  const byId = Object.fromEntries(materials.map(material => [material.id, material]));
  // These are explicitly simplified classroom-model reactions, not lab instructions.
  const reactions = [
    { id: 'water-lava', pair: ['water', 'lava'], category: 'geology', name: 'Cooling lava', lesson: 'When lava cools, it becomes solid rock. In this toy model, one tile becomes stone and the other becomes steam.', products: ['stone', 'steam'] },
    { id: 'sand-fire', pair: ['sand', 'fire'], category: 'materials', name: 'Sand and heat', lesson: 'Some sand is rich in silica; industrial glassmaking uses controlled high heat and carefully chosen ingredients.', products: ['glass', 'steam'] },
    { id: 'wood-fire', pair: ['wood', 'fire'], category: 'materials', name: 'Wood and heat', lesson: 'Heating wood changes the material and can release gases. The sandbox uses charcoal as a simplified outcome.', products: ['charcoal', 'steam'] },
    { id: 'plant-water', pair: ['plant', 'water'], category: 'garden', name: 'Watering a plant', lesson: 'Plants need water along with light, air, nutrients, and suitable conditions. This model grows a sprout.', products: ['sprout', 'soil'] },
    { id: 'ice-fire', pair: ['ice', 'fire'], category: 'weather', name: 'Melting ice', lesson: 'Adding heat can change solid water into liquid water. The model represents heat with a fire tile.', products: ['water', 'steam'] },
    { id: 'sand-water', pair: ['sand', 'water'], category: 'geology', name: 'Wet sand', lesson: 'Mixing sand and water makes wet sediment or slurry; this model labels it mud.', products: ['mud', 'water'] },
    { id: 'flower-water', pair: ['flower', 'water'], category: 'garden', name: 'A watered bloom', lesson: 'Water helps plants stay healthy when their growing conditions are suitable. Your flower becomes a brighter bloom.', products: ['bloom', 'water'] },
    { id: 'stone-lava', pair: ['stone', 'lava'], category: 'geology', name: 'Volcanic glass', lesson: 'Obsidian can form when certain lava cools quickly. Real outcomes depend on composition and cooling conditions.', products: ['obsidian', 'steam'] },
    { id: 'air-steam', pair: ['air', 'steam'], category: 'weather', name: 'Cloud formation', lesson: 'As moist air cools, water vapor can condense into tiny droplets or ice crystals that form clouds.', products: ['cloud', 'air'] },
    { id: 'seed-soil', pair: ['seed', 'soil'], category: 'garden', name: 'Seed germination', lesson: 'Seeds can begin germinating when they have suitable moisture, oxygen, temperature, and other conditions. The sandbox grows a sprout and moss as a simplified garden outcome.', products: ['sprout', 'moss'] },
    { id: 'plant-sunlight', pair: ['plant', 'sunlight'], category: 'garden', name: 'Sunlight and plants', lesson: 'Plants use light energy in photosynthesis. This classroom model creates a flower and pollen as a symbolic growth outcome.', products: ['flower', 'pollen'] },
    { id: 'cloud-sunlight', pair: ['cloud', 'sunlight'], category: 'weather', name: 'Rainbow optics', lesson: 'A rainbow can appear when sunlight interacts with water droplets, separating white light into colors. The game uses a cloud tile to represent the droplets in the air.', products: ['rainbow', 'air'] },
    { id: 'stone-water', pair: ['stone', 'water'], category: 'geology', name: 'Life on damp stone', lesson: 'Mosses can grow on damp surfaces when conditions suit them. The paired mud tile represents weathered mineral material in this simplified ecosystem model.', products: ['moss', 'mud'] },
    { id: 'battery-wire', pair: ['battery', 'wire'], category: 'energy', name: 'Circuit model', lesson: 'A working circuit needs a complete conducting path and an energy source. This simplified game reaction unlocks a circuit and a light as learning symbols, not as build instructions.', products: ['circuit', 'light'] },
    { id: 'circuit-electricity', pair: ['circuit', 'electricity'], category: 'energy', name: 'Energy through a circuit', lesson: 'In a suitable closed circuit, electrical energy can be transferred to a device. The sandbox represents that idea by lighting a bulb icon.', products: ['light', 'battery'] },
    { id: 'plant-stone', pair: ['plant', 'stone'], category: 'geology', name: 'Fossil record', lesson: 'Fossils preserve evidence of ancient life through long and complex geological processes. This instant result is an abstract educational shortcut, not a realistic formation timeline.', products: ['fossil', 'soil'] },
    { id: 'rain-soil', pair: ['rain', 'soil'], category: 'weather', name: 'Rain and the ground', lesson: 'Rain can soak into soil and move particles around. The model creates mud and a cloud to represent a linked water cycle.', products: ['mud', 'cloud'] },
    { id: 'seed-rain', pair: ['seed', 'rain'], category: 'garden', name: 'Rain-soaked seedbed', lesson: 'Seeds need suitable moisture, oxygen, and temperature to germinate. This is a playful shortcut that links rainfall with a growing seedbed.', products: ['sprout', 'mud'] },
    { id: 'flower-rain', pair: ['flower', 'rain'], category: 'garden', name: 'Rain-kissed flower', lesson: 'Rain can provide water to plants, though too much water can also harm some roots. The sandbox turns this pair into a thriving bloom.', products: ['bloom', 'water'] },
    { id: 'cloud-rain', pair: ['cloud', 'rain'], category: 'weather', name: 'Cloudburst', lesson: 'Rain forms when droplets or ice crystals in clouds grow large enough to fall. The puddle is a game token for water collecting at the surface.', products: ['puddle', 'air'] },
    { id: 'ice-sunlight', pair: ['ice', 'sunlight'], category: 'weather', name: 'Sun-warmed ice', lesson: 'Adding energy can melt ice into liquid water. The extra cloud tile is a simplified reminder that water also moves through the air.', products: ['water', 'cloud'] },
    { id: 'sunlight-water', pair: ['sunlight', 'water'], category: 'weather', name: 'Evaporation model', lesson: 'Sunlight can warm surface water, allowing some of it to evaporate. The cloud outcome represents a later stage of the water cycle, not an instant real-world change.', products: ['cloud', 'air'] },
    { id: 'pollen-flower', pair: ['pollen', 'flower'], category: 'garden', name: 'Pollination garden', lesson: 'Pollination moves pollen to the part of a flower involved in seed production. The game returns a seed as a simplified result; real pollination does not guarantee a seed.', products: ['seed', 'bloom'] },
    { id: 'charcoal-air', pair: ['charcoal', 'air'], category: 'materials', name: 'Material and atmosphere', lesson: 'Materials can change when they react with gases in their surroundings. This reaction is an abstract classroom token, not a recipe or a realistic combustion simulation.', products: ['ash', 'air'] },
    { id: 'ash-rain', pair: ['ash', 'rain'], category: 'geology', name: 'Ash and rainfall', lesson: 'Volcanic ash can be moved by water and may influence soils over time. The sandbox simplifies this into soil and mud tokens.', products: ['soil', 'mud'] },
    { id: 'lava-ice', pair: ['lava', 'ice'], category: 'geology', name: 'Rapid cooling', lesson: 'Molten rock cools and solidifies. Real rock textures depend on composition and cooling conditions; this reaction uses the existing volcanic-glass token as a game shortcut.', products: ['obsidian', 'steam'] },
    { id: 'cloud-ice', pair: ['cloud', 'ice'], category: 'weather', name: 'Frozen cloud', lesson: 'Clouds can contain tiny ice crystals when the air is cold enough. Snow represents frozen precipitation in this simplified weather model.', products: ['snow', 'water'] },
    { id: 'snow-sunlight', pair: ['snow', 'sunlight'], category: 'weather', name: 'Snowmelt', lesson: 'When snow absorbs enough energy, it can melt and return liquid water to the environment.', products: ['water', 'cloud'] },
    { id: 'light-sunlight', pair: ['light', 'sunlight'], category: 'energy', name: 'Solar technology', lesson: 'Photovoltaic solar cells convert some sunlight into electrical energy. The game unlocks a solar-cell tile as a symbolic technology discovery.', products: ['solar-cell', 'light'] },
    { id: 'solar-cell-sunlight', pair: ['solar-cell', 'sunlight'], category: 'energy', name: 'Renewable energy loop', lesson: 'Solar cells can produce electricity when illuminated. The battery and electricity tokens represent storing and using energy at a high level, not a wiring guide.', products: ['battery', 'electricity'] }
  ];
  const categoryLabels = {
    garden: 'Garden & Biology', weather: 'Weather & Water', geology: 'Geology & Earth',
    energy: 'Energy & Circuits', materials: 'Materials & Matter'
  };
  const categoryClues = {
    garden: 'Clue: think about seeds, growing conditions, flowers, and how plants reproduce.',
    weather: 'Clue: look at water changing state, clouds, precipitation, cooling, or sunlight.',
    geology: 'Clue: explore rocks, molten material, soil, and how water changes the ground.',
    energy: 'Clue: think about energy sources, conducting paths, light, and renewable technology.',
    materials: 'Clue: consider how materials can change and what can remain after a change.'
  };
  const reactionByPair = new Map();
  for (const reaction of reactions) reactionByPair.set(reaction.pair.slice().sort().join('+'), reaction);

  function cleanString(value, max = 80) {
    return typeof value === 'string' ? value.slice(0, max) : '';
  }
  function defaultState() {
    return {
      version: 3,
      board: Array(CELL_COUNT).fill(null),
      discoveries: [],
      materialsFound: [],
      experiments: 0,
      reactionsMade: 0,
      lastMessage: 'Choose a material, then tap a tile to place it. Try garden, weather, geology, and simple circuit-model reactions.'
    };
  }
  function normalizeState(raw) {
    const next = defaultState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
    const board = Array.isArray(raw.board) ? raw.board : [];
    next.board = Array.from({ length: CELL_COUNT }, (_, index) => {
      const id = board[index];
      return typeof id === 'string' && byId[id] ? id : null;
    });
    next.discoveries = Array.isArray(raw.discoveries) ? [...new Set(raw.discoveries.filter(id => reactions.some(item => item.id === id)))] : [];
    next.materialsFound = Array.isArray(raw.materialsFound) ? [...new Set(raw.materialsFound.filter(id => productMaterials.some(item => item.id === id)))] : [];
    next.experiments = Number.isFinite(Number(raw.experiments)) ? Math.max(0, Math.floor(Number(raw.experiments))) : 0;
    next.reactionsMade = Number.isFinite(Number(raw.reactionsMade)) ? Math.max(0, Math.floor(Number(raw.reactionsMade))) : 0;
    next.lastMessage = cleanString(raw.lastMessage, 240) || next.lastMessage;
    // Previously discovered products stay available even if a save was partially written.
    for (const reaction of reactions) if (next.discoveries.includes(reaction.id)) {
      for (const product of reaction.products) if (productMaterials.some(item => item.id === product) && !next.materialsFound.includes(product)) next.materialsFound.push(product);
    }
    return next;
  }
  function safeStorageGet() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }
  function safeStorageSet(value) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return true; } catch (_) { return false; }
  }
  let state;
  try { state = normalizeState(JSON.parse(safeStorageGet() || 'null')); } catch (_) { state = defaultState(); }
  let selectedMaterial = 'water';
  let journalSearch = '';
  let journalCategory = 'all';
  let target = null;

  function save() { safeStorageSet(state); }
  function adjacentIndexes(index) {
    const row = Math.floor(index / COLS), col = index % COLS;
    const neighbors = [];
    if (row > 0) neighbors.push(index - COLS);
    if (col > 0) neighbors.push(index - 1);
    if (col < COLS - 1) neighbors.push(index + 1);
    if (row < ROWS - 1) neighbors.push(index + COLS);
    return neighbors;
  }
  function awardDiscoveryXP() {
    try { window.CaydenProxyMainCatalog?.awardXP?.(5, 'Science Lab discovery'); } catch (_) { /* The lab still works without the shared Passport module. */ }
  }
  function place(index, materialId) {
    if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) return { ok: false, message: 'That tile is outside the lab board.' };
    if (materialId !== null && (!byId[materialId] || (productMaterials.some(item => item.id === materialId) && !state.materialsFound.includes(materialId)))) {
      return { ok: false, message: 'That material is not unlocked yet.' };
    }
    if (materialId === null) {
      state.board[index] = null;
      state.lastMessage = 'Tile cleared. Your discoveries and journal are safe.';
      save();
      return { ok: true, message: state.lastMessage, reaction: null, discovered: false };
    }
    state.board[index] = materialId;
    state.experiments++;
    let triggered = null;
    let newlyDiscovered = false;
    for (const neighborIndex of adjacentIndexes(index)) {
      const neighborId = state.board[neighborIndex];
      if (!neighborId || neighborIndex === index) continue;
      const reaction = reactionByPair.get([materialId, neighborId].sort().join('+'));
      if (!reaction) continue;
      // The clicked tile and its neighbor become model products; no real-world procedure is implied.
      state.board[index] = reaction.products[0];
      state.board[neighborIndex] = reaction.products[1];
      state.reactionsMade++;
      newlyDiscovered = !state.discoveries.includes(reaction.id);
      if (newlyDiscovered) {
        state.discoveries.push(reaction.id);
        for (const product of reaction.products) if (productMaterials.some(item => item.id === product) && !state.materialsFound.includes(product)) state.materialsFound.push(product);
        awardDiscoveryXP();
      }
      triggered = reaction;
      state.lastMessage = `${newlyDiscovered ? '✨ New discovery: ' : '🧪 Reaction repeated: '}${reaction.name}. ${reaction.lesson}`;
      break;
    }
    if (!triggered) {
      const material = byId[materialId];
      state.lastMessage = `${material.icon} Placed ${material.name}. Try a neighboring material to explore a reaction.`;
    }
    save();
    return { ok: true, message: state.lastMessage, reaction: triggered?.id || null, discovered: newlyDiscovered };
  }
  function resetBoard() {
    state.board = Array(CELL_COUNT).fill(null);
    state.lastMessage = 'Board cleared. Your discovered reactions, unlocked materials, and lab progress are preserved.';
    save();
    return getState();
  }
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }
  function labLevel() {
    const count = state.discoveries.length;
    if (count >= 28) return 'Future Technology Lab';
    if (count >= 22) return 'Scientific Institute';
    if (count >= 15) return 'Mega Lab';
    if (count >= 8) return 'Advanced Lab';
    if (count >= 5) return 'Research Lab';
    if (count >= 2) return 'Student Lab';
    return 'Starter Lab';
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function getDiscoveryBook() {
    return reactions.map(reaction => {
      const discovered = state.discoveries.includes(reaction.id);
      return {
        id: reaction.id,
        name: discovered ? reaction.name : 'Unknown reaction',
        category: reaction.category,
        categoryLabel: categoryLabels[reaction.category],
        discovered,
        clue: discovered ? reaction.lesson : categoryClues[reaction.category],
        inputs: discovered ? reaction.pair.map(id => ({ id, name: byId[id].name, icon: byId[id].icon })) : null,
        products: discovered ? reaction.products.map(id => ({ id, name: byId[id].name, icon: byId[id].icon })) : null
      };
    });
  }
  function render() {
    if (!target) return;
    const available = [...baseMaterials, ...productMaterials.filter(item => state.materialsFound.includes(item.id))];
    const discoveredList = state.discoveries.map(id => reactions.find(item => item.id === id)).filter(Boolean);
    target.innerHTML = `
      <section class="science-lab-shell" aria-label="Interactive Science Lab">
        <header class="sl-hero">
          <div class="sl-hero-copy">
            <div class="sl-eyebrow">🧪 CAYDEN WORLD · PERSONAL LAB</div>
            <h2>Science Lab <span>✦</span></h2>
            <p>Explore garden growth, weather, geology, and simple circuit models on a tiny sandbox board. Discover reactions and keep a journal of what you learn.</p>
            <p class="sl-safety-note"><strong>Classroom model:</strong> reactions are simplified game rules, not real laboratory instructions. Do not mix or heat real materials.</p>
          </div>
          <div class="sl-level-card"><span class="sl-level-icon">🔬</span><span class="sl-level-label">YOUR LAB</span><strong>${labLevel()}</strong><span>${state.discoveries.length} / ${reactions.length} reactions discovered</span></div>
        </header>
        <div class="sl-stats" aria-label="Lab statistics">
          <div><span>🧫</span><strong>${state.experiments}</strong><small>Placements</small></div>
          <div><span>✨</span><strong>${state.discoveries.length}</strong><small>Discoveries</small></div>
          <div><span>🔁</span><strong>${state.reactionsMade}</strong><small>Reactions</small></div>
          <div><span>🧰</span><strong>${available.length}</strong><small>Materials</small></div>
        </div>
        <div class="sl-workspace">
          <section class="sl-panel sl-material-panel" aria-label="Material palette">
            <div class="sl-panel-heading"><div><h3>Material Cabinet</h3><p>Choose a material to place.</p></div><span class="sl-count">${available.length} available</span></div>
            <div class="sl-material-grid">${available.map(item => `<button type="button" class="sl-material ${selectedMaterial === item.id ? 'is-selected' : ''}" data-sl-material="${item.id}" aria-pressed="${selectedMaterial === item.id}" title="${escapeHTML(item.note)}"><span aria-hidden="true">${item.icon}</span><strong>${escapeHTML(item.name)}</strong></button>`).join('')}</div>
            <button type="button" class="sl-erase ${selectedMaterial === null ? 'is-selected' : ''}" data-sl-erase aria-pressed="${selectedMaterial === null}">⌫ Eraser tool</button>
            <p class="sl-selected-note" id="slSelectedNote">${selectedMaterial ? `${byId[selectedMaterial].icon} ${escapeHTML(byId[selectedMaterial].name)} selected. Tap a tile in the board.` : 'Eraser selected. Tap a tile to clear it.'}</p>
          </section>
          <section class="sl-panel sl-board-panel" aria-label="Sandbox board">
            <div class="sl-panel-heading"><div><h3>Experiment Board</h3><p>6 rows · 8 columns · tap tiles to build a reaction.</p></div><button type="button" class="sl-small-button" data-sl-clear>Clear board</button></div>
            <div class="sl-board" role="group" aria-label="Six row by eight column material board">${state.board.map((id, index) => { const item = id ? byId[id] : null; const row = Math.floor(index / COLS) + 1, col = index % COLS + 1; return `<button type="button" class="sl-cell ${item ? 'has-material' : ''}" data-sl-cell="${index}" aria-label="Row ${row}, column ${col}${item ? `, ${escapeHTML(item.name)}` : ', empty'}" title="Row ${row}, column ${col}">${item ? `<span aria-hidden="true">${item.icon}</span>` : '<span class="sl-empty-dot" aria-hidden="true">＋</span>'}</button>`; }).join('')}</div>
            <p class="sl-status" id="slStatus" role="status" aria-live="polite" tabindex="-1">${escapeHTML(state.lastMessage)}</p>
          </section>
        </div>
        <section class="sl-panel sl-journal-panel" aria-label="Science Discovery Book and journal">
          <div class="sl-panel-heading"><div><h3>📖 Discovery Journal &amp; Book</h3><p>Search all ${reactions.length} reaction records, browse by subject, and uncover recipes through experiments.</p></div><span class="sl-count">${discoveredList.length} / ${reactions.length} discovered</span></div>
          <div class="sl-book-progress"><div class="sl-book-progress-copy"><strong>Research progress</strong><span>${Math.round(discoveredList.length / reactions.length * 100)}%</span></div><div class="sl-book-progress-track" role="progressbar" aria-label="Science Lab discovery completion" aria-valuemin="0" aria-valuemax="${reactions.length}" aria-valuenow="${discoveredList.length}"><span style="width:${discoveredList.length / reactions.length * 100}%"></span></div></div>
          <div class="sl-journal-toolbar">
            <label class="sl-book-search">Search the book<input type="search" data-sl-journal-search value="${escapeHTML(journalSearch)}" placeholder="Search reactions, hints, topics…" autocomplete="off"></label>
            <label class="sl-book-category">Subject<select data-sl-journal-category>
              <option value="all" ${journalCategory === 'all' ? 'selected' : ''}>All subjects</option>
              ${Object.entries(categoryLabels).map(([id,label]) => `<option value="${id}" ${journalCategory === id ? 'selected' : ''}>${escapeHTML(label)}</option>`).join('')}
            </select></label>
            <button type="button" class="sl-small-button sl-reset-filters" data-sl-journal-reset>Reset filters</button>
          </div>
          <div class="sl-discovery-grid" data-sl-journal-grid>${reactions.map((reaction, index) => {
            const known = state.discoveries.includes(reaction.id);
            const inputIcons = known ? reaction.pair.map(id => byId[id]?.icon || '•').join(' + ') : '❔ + ❔';
            const outputIcons = known ? reaction.products.map(id => byId[id]?.icon || '✨').join(' → ') : '❔';
            const heading = known ? reaction.name : 'Unknown reaction';
            const clue = known ? reaction.lesson : categoryClues[reaction.category];
            return `<article class="sl-discovery ${known ? 'is-discovered' : 'is-mystery'}" data-sl-journal-item data-category="${reaction.category}"><div class="sl-discovery-top"><span class="sl-discovery-number">${known ? '✓' : `?? ${String(index + 1).padStart(2, '0')}`}</span><span class="sl-discovery-icons">${inputIcons} → ${outputIcons}</span></div><span class="sl-book-category-tag">${escapeHTML(categoryLabels[reaction.category])}</span><h4>${escapeHTML(heading)}</h4><p>${escapeHTML(clue)}</p><span class="sl-discovered-label">${known ? '✓ Discovered · recipe revealed' : '🔒 Mystery entry · discover it in the lab'}</span></article>`;
          }).join('')}</div>
          <p class="sl-journal-results" id="slJournalResultCount" aria-live="polite">Showing all ${reactions.length} reaction entries.</p>
          <div class="sl-journal-footer"><span>💾 Autosaved locally · no account needed</span><span>✨ First-time discoveries award 5 Garden Passport XP when the shared profile is available.</span></div>
        </section>
      </section>`;
    wire();
  }
  function applyJournalFilters() {
    if (!target) return;
    const query = (target.querySelector('[data-sl-journal-search]')?.value || '').trim().toLocaleLowerCase();
    const category = target.querySelector('[data-sl-journal-category]')?.value || 'all';
    let visible = 0;
    target.querySelectorAll('[data-sl-journal-item]').forEach(card => {
      const queryMatch = !query || card.textContent.toLocaleLowerCase().includes(query);
      const categoryMatch = category === 'all' || card.dataset.category === category;
      const show = queryMatch && categoryMatch;
      card.hidden = !show;
      if (show) visible++;
    });
    const counter = target.querySelector('#slJournalResultCount');
    if (counter) counter.textContent = `Showing ${visible} of ${reactions.length} reaction entries.`;
  }
  function wire() {
    target.querySelector('[data-sl-journal-search]')?.addEventListener('input', () => {
      journalSearch = target.querySelector('[data-sl-journal-search]')?.value || '';
      applyJournalFilters();
    });
    target.querySelector('[data-sl-journal-category]')?.addEventListener('change', () => {
      journalCategory = target.querySelector('[data-sl-journal-category]')?.value || 'all';
      applyJournalFilters();
    });
    target.querySelector('[data-sl-journal-reset]')?.addEventListener('click', () => {
      journalSearch = '';
      journalCategory = 'all';
      const search = target.querySelector('[data-sl-journal-search]');
      const select = target.querySelector('[data-sl-journal-category]');
      if (search) search.value = '';
      if (select) select.value = 'all';
      applyJournalFilters();
      search?.focus?.({ preventScroll: true });
    });
    applyJournalFilters();
    target.querySelectorAll('[data-sl-material]').forEach(button => button.addEventListener('click', () => {
      selectedMaterial = button.dataset.slMaterial;
      render();
    }));
    target.querySelector('[data-sl-erase]')?.addEventListener('click', () => { selectedMaterial = null; render(); });
    target.querySelectorAll('[data-sl-cell]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.slCell);
      place(index, selectedMaterial);
      render();
      const status = target.querySelector('#slStatus');
      status?.focus?.({ preventScroll: true });
    }));
    target.querySelector('[data-sl-clear]')?.addEventListener('click', () => { resetBoard(); render(); });
  }
  function mount(element) { target = element; if (!target) return; render(); }
  window.CaydenScienceLab = {
    mount,
    getState,
    place,
    resetBoard,
    labLevel,
    getDiscoveryBook,
    categories: { ...categoryLabels },
    materials: materials.map(item => ({ ...item })),
    reactions: reactions.map(item => ({ ...item, pair: [...item.pair], products: [...item.products] })),
    materialsByCategory: { garden: ['seed','soil','plant','flower','sunlight','pollen','moss'].filter(id => byId[id]), weather: ['air','steam','cloud','rain','rainbow','ice','water'].filter(id => byId[id]), geology: ['sand','stone','lava','obsidian','fossil'].filter(id => byId[id]), electricity: ['battery','wire','electricity','circuit','light'].filter(id => byId[id]) },
    get storageKey() { return STORAGE_KEY; }
  };
})();
