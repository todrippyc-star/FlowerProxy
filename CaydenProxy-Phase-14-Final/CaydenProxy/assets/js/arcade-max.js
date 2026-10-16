/*
 * CaydenProxy Arcade+ Max — browser-only expansion module.
 * Original educational games, local progression, and synthesized instrument tools.
 * All profile, inventory, and recording data stays in this browser's localStorage.
 */
(() => {
  'use strict';
  const api = window.CaydenArcade;
  if (!api || !api.content || !api.games) return;
  const { data, games, content, shell, questionSets } = api;
  const DAY = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const WEEK = () => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return `${d.getFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
  };
  const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = msg => api.toast ? api.toast(msg) : console.info('[CaydenProxy]', msg);
  const save = () => { try { api.persist(); } catch (err) { console.warn('Arcade save failed', err); toast('Your browser could not save that change. Check local storage settings.'); } };
  const today = DAY(), week = WEEK();

  // Safe migrations: an older save can be expanded without being discarded.
  Object.assign(data, {
    gems: 0, avatar: '🌻', inventory: [], gameStats: {}, dailyRewardDay: '', weeklyRewardWeek: '',
    challengeDay: '', challengeGame: '', challengeDoneDay: '', weeklyXP: 0, weeklyKey: week,
    studioTracks: [], studioSteps: null, hiddenClicks: 0, equipped: [], profileName: 'Garden Explorer', userPlaylists: [], seasonalClaim: '',
    ...(data || {})
  });
  data.gems = Number(data.gems) || 0;
  data.inventory = Array.isArray(data.inventory) ? data.inventory : [];
  data.gameStats = data.gameStats && typeof data.gameStats === 'object' ? data.gameStats : {};
  data.achievements = Array.isArray(data.achievements) ? data.achievements : [];
  data.favorites = Array.isArray(data.favorites) ? data.favorites : [];
  data.history = Array.isArray(data.history) ? data.history : [];
  data.userPlaylists = Array.isArray(data.userPlaylists) ? data.userPlaylists : [];
  if (data.weeklyKey !== week) { data.weeklyKey = week; data.weeklyXP = 0; }
  if (data.challengeDay !== today) {
    data.challengeDay = today;
    const pick = games[(Math.abs([...today].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % Math.max(1, games.length))];
    data.challengeGame = pick ? pick[0] : 'algebra';
    data.challengeDoneDay = '';
  }

  // Original game catalog expansion: 59 existing entries + this genre-spanning collection.
  const catalog = [
    ['starshipdash','Starship Dash','🚀','Action','Dodge asteroid lanes and collect energy stars.'],
    ['forestguardian','Forest Guardian','🌳','Action','Defend a tiny forest by choosing smart tools and tactics.'],
    ['meteordefender','Meteor Defender','☄️','Action','Prioritize incoming meteors and protect the moon base.'],
    ['ninjalantern','Ninja Lantern','🥷','Action','React quickly to cues and chain clean combo rounds.'],
    ['bossbloom','Boss Battle: Thorn King','🌹','Action','Use learning boosts to break a multi-phase garden boss shield.'],
    ['crystalblaster','Crystal Blaster','💎','Action','Match the right crystal to clear a wave.'],
    ['roborescue','Robo Rescue','🤖','Action','Guide a robot to stranded helpers with limited energy.'],
    ['shadowsteps','Shadow Steps','🌑','Action','Choose safe stepping stones before the timer runs out.'],
    ['moonlitexpedition','Moonlit Expedition','🌙','Adventure','Explore a moonlit trail and solve the clues you find.'],
    ['losttemple','Lost Temple Trail','🏛️','Adventure','Decode symbols to unlock a hidden temple door.'],
    ['skyisland','Sky Island Safari','🏝️','Adventure','Explore floating islands while collecting nature facts.'],
    ['dragonacademy','Dragon Academy','🐉','Adventure','Train a dragon through a series of skill trials.'],
    ['deepsea','Deep Sea Discovery','🐠','Adventure','Explore ocean zones and identify marine adaptations.'],
    ['secretgarden','Secret Garden Story','🗝️','Adventure','Make branching choices to discover a secret garden.'],
    ['timetraveler','Time Traveler Trail','⌛','Adventure','Put events in order to repair a time machine.'],
    ['mirrormaze','Mirror Maze Deluxe','🪞','Puzzle','Reason about reflected routes to reach the exit.'],
    ['circuitsnap','Circuit Snap','🔌','Puzzle','Connect matching endpoints to complete a circuit.'],
    ['colorcascade','Color Cascade','🎨','Puzzle','Plan color moves to clear a board efficiently.'],
    ['patterndetective','Pattern Detective','🕵️','Puzzle','Spot the rule hiding inside a sequence.'],
    ['runeunlocker','Rune Unlocker','🔮','Puzzle','Solve symbol and number locks with limited hints.'],
    ['shapeshift','Shape Shift','🔷','Puzzle','Choose transformations that make shapes fit.'],
    ['numbernest','Number Nest','🪺','Puzzle','Put numbers in the correct logical order.'],
    ['slidingstars','Sliding Stars','⭐','Puzzle','Slide tiles into order with fewer moves.'],
    ['turborally','Turbo Garden Rally','🏎️','Racing','Switch lanes, dodge obstacles, and collect boost petals.'],
    ['hoverboard','Hoverboard Sprint','🛹','Racing','Thread through a glowing obstacle course.'],
    ['moonbuggy','Moon Buggy Dash','🚙','Racing','Drive the moon buggy while managing fuel and boosts.'],
    ['kartkingdom','Kart Kingdom','🏁','Racing','Answer quick prompts to charge your kart turbo.'],
    ['riverraft','River Raft Rally','🛶','Racing','Steer around river rocks and collect tokens.'],
    ['cloudracer','Cloud Racer','☁️','Racing','Race through sky gates and collect cloud rings.'],
    ['tennistopspin','Tennis Topspin','🎾','Sports','Read the bounce and time the return.'],
    ['volleyvolley','Volleyball Volley','🏐','Sports','Place the ball and keep a rally alive.'],
    ['hockeyslapshot','Hockey Slapshot','🏒','Sports','Time the shot through a shifting target.'],
    ['bowlingbuddies','Bowling Buddies','🎳','Sports','Choose angle and power to knock down the pins.'],
    ['skatepark','Skate Park Quest','🛹','Sports','Build a safe trick combo from a practice sequence.'],
    ['archeryaim','Archery Aim','🏹','Sports','Read the wind and pick a target lane.'],
    ['melodymix','Melody Mix','🎶','Music','Identify a melody contour and repeat the pattern.'],
    ['drumlineduel','Drumline Duel','🥁','Music','Echo increasingly complex percussion patterns.'],
    ['pitchperfect','Pitch Perfect Junior','🎼','Music','Compare high and low notes by ear.'],
    ['tempotrek','Tempo Trek','⏱️','Music','Match a rhythm to its tempo marking.'],
    ['chordclimber','Chord Climber','🎸','Music','Recognize major, minor, and suspended chord colors.'],
    ['tinytown','Tiny Town Builder','🏘️','Sandbox','Place buildings, plants, paths, and decorations on a grid.'],
    ['terraformer','Garden Terraformer','🪴','Sandbox','Arrange soil, water, and plants to balance a mini habitat.'],
    ['blockbot','Block Bot Workshop','🧱','Sandbox','Build a small route using movement blocks.'],
    ['pethabitat','Pet Habitat Lab','🐾','Sandbox','Design an animal habitat with the right needs.'],
    ['machinemaker','Machine Maker','⚙️','Sandbox','Arrange gears and levers to solve a little machine puzzle.'],
    ['bughunt','Bug Hunt: Code Fixer','🐞','Coding','Find the coding mistake and choose a safer fix.'],
    ['looplogic','Loop Logic','🔁','Coding','Predict what a loop prints after each iteration.'],
    ['htmlhero','HTML Hero','🌐','Coding','Build a semantic page from element clues.'],
    ['javascriptjungle','JavaScript Jungle','🌴','Coding','Follow variables, conditions, and functions.'],
    ['binaryblaster','Binary Blaster','0️⃣','Coding','Convert small numbers between binary and decimal.'],
    ['robotroute','Robot Route Planner','🦾','Coding','Order instructions to steer a robot to its goal.'],
    ['timestableturbo','Times Table Turbo','✖️','Math','Speed-practice multiplication with increasing difficulty.'],
    ['integerisland','Integer Island','➕','Math','Navigate positive and negative number challenges.'],
    ['graphexplorer','Graph Explorer','📈','Math','Read coordinate plots and interpret trends.'],
    ['ratiorally','Ratio Rally','⚖️','Math','Scale recipes and compare equivalent ratios.'],
    ['primenumberpatrol','Prime Number Patrol','🔢','Math','Spot primes and build factor streaks.'],
    ['fractionsafari','Fraction Safari','🍉','Math','Compare fractions while exploring a wild trail.'],
    ['circuitscientist','Circuit Scientist','💡','Science','Predict how a simple circuit behaves.'],
    ['energyexplorer','Energy Explorer','🔋','Science','Trace energy transfers in everyday systems.'],
    ['microbemission','Microbe Mission','🦠','Science','Match microbes to facts about helpful and harmful roles.'],
    ['fossilfinder','Fossil Finder','🦴','Science','Use fossil evidence to infer an ancient environment.'],
    ['plantlab','Plant Lab','🌱','Science','Test what plants need to grow in a safe virtual lab.'],
    ['forcesfield','Forces Field','🧲','Science','Reason about friction, magnets, and motion.'],
    ['worldcapitals','World Capitals Quest','🌍','Geography','Match countries to capital cities.'],
    ['compasschallenge','Map Compass Challenge','🧭','Geography','Use compass directions to navigate a map.'],
    ['landmarklegends','Landmark Legends','🗽','Geography','Recognize famous landmarks and their regions.'],
    ['continentcollector','Continent Collector','🗺️','Geography','Sort countries and places by continent.'],
    ['oceanexplorer','Ocean Explorer','🌊','Geography','Explore ocean names, regions, and geography.'],
    ['flagfinder','Country Flag Finder','🏳️','Geography','Connect flag colors and symbols with countries.'],
    ['metaphormountain','Metaphor Mountain','⛰️','Language Arts','Find meaning in figurative language.'],
    ['similesquad','Simile Squad','🐆','Language Arts','Choose comparisons that make sense.'],
    ['verbvoyage','Verb Voyage','⛵','Language Arts','Navigate verb tense and agreement challenges.'],
    ['spellingspellbook','Spelling Spellbook','📜','Language Arts','Unlock vocabulary by choosing correct spellings.'],
    ['grammargalaxy','Grammar Galaxy','🪐','Language Arts','Repair sentence structure across star systems.'],
    ['poetrypop','Poetry Pop','📝','Language Arts','Explore rhythm, imagery, rhyme, and sound.'],
    ['kingdomgarden','Kingdom Garden','👑','Strategy','Balance resources while keeping a garden kingdom thriving.'],
    ['towertactics','Tower Tactics','🗼','Strategy','Choose upgrades to defend three waves of critters.'],
    ['resourcemanager','Resource Manager','📦','Strategy','Make careful trade-offs with a limited budget.'],
    ['chesstacticslab','Chess Tactics Lab','♟️','Strategy','Identify forks, pins, and check threats.'],
    ['colonycommander','Colony Commander','🛰️','Strategy','Allocate energy and supplies to grow a tiny colony.'],
    ['bridgebuilder','Bridge Builder','🌉','Strategy','Choose supports and materials for a sturdy span.'],
    ['ecosystemstrategy','Ecosystem Strategy','🦋','Strategy','Balance a food web with limited resources.'],
    ['localduel','Local Quiz Duel','🥊','Multiplayer (local)','Pass the keyboard between two players and race to more correct answers.'],
    ['fourinarowplus','Four-in-a-Row+','🔴','Multiplayer (local)','A local two-player strategy challenge. Plan ahead and block your opponent.'],
    ['coopmemory','Co-op Memory Match','🤝','Multiplayer (local)','Work together to clear matching pairs with fewer turns.'],
    ['wordduel','Word Duel: Pass & Play','🆎','Multiplayer (local)','Take turns solving word and language questions.'],
    ['doodlepass','Doodle Pass & Play','✏️','Multiplayer (local)','Take turns drawing a prompt and guessing it together.']
  ];
  const existing = new Set(games.map(g => g[0]));
  catalog.forEach(g => { if (!existing.has(g[0])) games.push(g); });

  // Subject-specific banks make the newly added catalog playable immediately.
  Object.assign(questionSets, {
    Action: [
      ['A shield power-up usually helps a character…',['Move faster','Block damage','Change color','Skip every level'],'Block damage'],
      ['A good reaction strategy is to…',['Watch the cue carefully','Press randomly','Ignore obstacles','Hold every button'],'Watch the cue carefully'],
      ['A boss with three phases is best approached by…',['Noticing its patterns','Repeating one move blindly','Ignoring its cues','Stopping after phase one'],'Noticing its patterns'],
      ['Which is a useful resource in an action game?',['Energy','A comma','A latitude line','A chapter title'],'Energy'],
      ['An obstacle appears ahead. The safest game choice is to…',['Choose an open lane','Close your eyes','Speed into it','Ignore the screen'],'Choose an open lane'],
      ['A combo usually rewards…',['Consecutive successful actions','Random misses','Long pauses','Unrelated clicks'],'Consecutive successful actions'],
      ['A cooldown means a power is…',['Temporarily unavailable','Always stronger','Deleted forever','A score multiplier only'],'Temporarily unavailable'],
      ['What makes a fair challenge?',['Clear rules and consistent controls','Hidden rules that change each second','Only luck','No feedback'],'Clear rules and consistent controls']
    ],
    Adventure: [
      ['A map legend explains…',['Map symbols','Character dialogue only','Music volume','A timer'],'Map symbols'],
      ['An artifact is usually…',['An object of historical or story importance','A type of weather','A keyboard key','A fraction'],'An object of historical or story importance'],
      ['Which clue is most useful for a locked door?',['A nearby symbol matching the lock','A random guess with no evidence','A blank page','An unrelated sound'],'A nearby symbol matching the lock'],
      ['A branching story changes based on…',['Player choices','The screen size only','The font','The clock format'],'Player choices'],
      ['An ecosystem is made of…',['Living things and their environment','Only rocks','Only planets','Only people'],'Living things and their environment'],
      ['To explore responsibly, a player should…',['Observe clues and preserve the environment','Destroy every object','Ignore local signs','Discard all tools'],'Observe clues and preserve the environment'],
      ['Chronology means arranging events by…',['Time order','Alphabetical order only','Color','Weight'],'Time order'],
      ['A compass points toward…',['Magnetic north direction','The nearest ocean always','The tallest building','The equator only'],'Magnetic north direction']
    ],
    Puzzle: [
      ['What comes next: 3, 6, 12, 24, …?',['30','36','48','42'],'48'],
      ['If every blue tile must touch a yellow tile, which clue matters most?',['Neighbor positions','Tile names alphabetically','Music tempo','Score color'],'Neighbor positions'],
      ['A mirror reverses left and right. If an arrow points left, its reflection points…',['Left','Right','Up','Down'],'Right'],
      ['Which is the best first move in a logic puzzle?',['Write down the fixed clues','Guess every answer','Ignore constraints','Delete the board'],'Write down the fixed clues'],
      ['A 3×3 grid contains how many cells?',['6','8','9','12'],'9'],
      ['A hint that removes wrong options helps by…',['Reducing the search space','Changing the goal','Adding a timer','Hiding all clues'],'Reducing the search space'],
      ['If the code is 2-4-6-8, what is the next even number?',['9','10','11','12'],'10'],
      ['A solvable puzzle must have…',['At least one solution','No rules','Only random inputs','An invisible finish'],'At least one solution']
    ],
    Racing: [
      ['On a track, a boost is best saved for…',['A clear stretch of track','A wall directly ahead','A menu screen','A pause'],'A clear stretch of track'],
      ['If a racer moves 60 km in 2 hours, average speed is…',['20 km/h','30 km/h','60 km/h','120 km/h'],'30 km/h'],
      ['A chicane is…',['A tight sequence of turns','A kind of medal','A fuel gauge','A straight finish line'],'A tight sequence of turns'],
      ['Which choice helps avoid an obstacle?',['Change lanes early','Wait until collision','Close the game','Ignore the road'],'Change lanes early'],
      ['A lap is…',['One complete circuit','A pit stop only','A score badge','A tire type'],'One complete circuit'],
      ['Drafting means following another racer to…',['Reduce air resistance','Increase road length','Change the finish','Turn off the engine'],'Reduce air resistance'],
      ['A checkpoint often records…',['Progress along a route','A player password','A music lyric','A screen color'],'Progress along a route'],
      ['A smooth racing line generally helps with…',['Control through turns','Increasing the track length','Removing all friction','Skipping the finish'],'Control through turns']
    ],
    Geography: [
      ['Which is the largest ocean by area?',['Atlantic','Indian','Arctic','Pacific'],'Pacific'],
      ['The Equator divides Earth into…',['Eastern and western halves','Northern and southern halves','Land and ocean','Day and night'],'Northern and southern halves'],
      ['Which continent contains the Sahara Desert?',['Asia','Africa','Europe','South America'],'Africa'],
      ['A map scale helps estimate…',['Real-world distance','Population age','Wind speed only','Language family'],'Real-world distance'],
      ['Lines of latitude run…',['East to west','North to south','Only around mountains','From pole to pole as longitude'],'East to west'],
      ['Which tool indicates direction?',['Compass rose','Scale bar','Map title','Legend color only'],'Compass rose'],
      ['The capital of Japan is…',['Kyoto','Seoul','Tokyo','Beijing'],'Tokyo'],
      ['A peninsula is land surrounded by water on…',['One side','Two sides','Three sides','All four sides'],'Three sides']
    ],
    'Language Arts': [
      ['A metaphor describes one thing as…',['Another thing for comparison','A number sentence','A map direction','A sound wave'],'Another thing for comparison'],
      ['Which is a verb?',['Swiftly','Blue','Investigate','Thoughtful'],'Investigate'],
      ['A simile commonly uses…',['Like or as','Only a semicolon','A numerator','A compass'],'Like or as'],
      ['Which sentence is punctuated correctly?',['Where are you going?','Where are you going.','Where are you going,','Where are you going!'],'Where are you going?'],
      ['A synonym for “cautious” is…',['Careful','Careless','Rapid','Loud'],'Careful'],
      ['The main idea is…',['The central point of a passage','A minor detail only','The author name','The last punctuation mark'],'The central point of a passage'],
      ['A stanza is a group of lines in a…',['Poem','Map','Recipe only','Spreadsheet'],'Poem'],
      ['The prefix “re-” often means…',['Again','Before','Not','Under'],'Again']
    ],
    Strategy: [
      ['With limited resources, a good strategy starts by…',['Setting priorities','Spending everything immediately','Ignoring costs','Choosing randomly every turn'],'Setting priorities'],
      ['A defensive move is used to…',['Reduce an opponent’s opportunities','Increase your own risk for no reason','Hide the rules','Delete your score'],'Reduce an opponent’s opportunities'],
      ['A trade-off means…',['Gaining one thing while giving up another','Getting everything for free','Changing the keyboard','Removing every choice'],'Gaining one thing while giving up another'],
      ['In chess, a fork attacks…',['Two or more targets at once','Only an empty square','The clock only','A captured piece'],'Two or more targets at once'],
      ['A resource budget should usually include…',['Costs and available supplies','Only decorations','Only guesses','No limits'],'Costs and available supplies'],
      ['A tower defense upgrade is most useful when it…',['Matches the threat','Is chosen only by color','Has no effect','Uses all resources at once'],'Matches the threat'],
      ['A plan should change when…',['New evidence changes the situation','Nothing happens','A button is blue','The title gets longer'],'New evidence changes the situation'],
      ['A bridge support mainly improves…',['Stability','Song tempo','Word spelling','Map latitude'],'Stability']
    ],
    Sandbox: [
      ['Plants generally need light, water, and…',['Suitable nutrients','Plastic glitter','Complete darkness forever','No space'],'Suitable nutrients'],
      ['A grid makes building easier because it…',['Organizes positions','Removes all choices','Changes the sound','Hides collisions'],'Organizes positions'],
      ['A habitat should provide animals with…',['Food, water, shelter, and space','Only decorations','Only bright lights','No hiding places'],'Food, water, shelter, and space'],
      ['A gear train transfers…',['Rotational motion','Language rules','Map symbols','Weather reports'],'Rotational motion'],
      ['A sustainable town considers…',['Transport, energy, nature, and people','Only building height','Only color','No shared resources'],'Transport, energy, nature, and people'],
      ['In a block program, sequence describes…',['The order instructions run','The color of a block','The game title','The number of windows'],'The order instructions run'],
      ['A balanced habitat has…',['Resources that fit the organisms','Only one resource forever','No producers','No water'],'Resources that fit the organisms'],
      ['A prototype is…',['An early model to test ideas','A final result that can never change','A score penalty','A music playlist'],'An early model to test ideas']
    ],
    Coding: [
      ['A loop is used to…',['Repeat instructions','Style a heading only','Store a password in public','Turn pixels into sound'],'Repeat instructions'],
      ['Which HTML element is most appropriate for the main page heading?',['<h1>','<footer>','<small>','<meta>'],'<h1>'],
      ['A variable stores…',['A value a program can use','Only a background image','A physical keyboard','A web address always'],'A value a program can use'],
      ['A conditional checks whether…',['A condition is true or false','A file is colorful','A note is loud','A page has a logo'],'A condition is true or false'],
      ['Binary uses which digits?',['0 and 1','1 and 2','2 and 3','0 through 9'],'0 and 1'],
      ['Debugging means…',['Finding and fixing errors','Adding errors intentionally','Deleting every test','Changing a title only'],'Finding and fixing errors'],
      ['In JavaScript, an array stores…',['An ordered collection of values','Only one CSS color','A browser tab','A MIDI file exclusively'],'An ordered collection of values'],
      ['A function is a reusable…',['Block of code','Image filter only','Map symbol','Keyboard shortcut'],'Block of code']
    ],
    'Multiplayer (local)': [
      ['A fair pass-and-play game should…',['Give both players the same rules','Hide points from one player','Change controls secretly','Skip turns randomly'],'Give both players the same rules'],
      ['A good co-op strategy is to…',['Share clues and coordinate','Keep all useful information hidden','Click randomly','Ignore the goal'],'Share clues and coordinate'],
      ['If two players tie, a fair next step is…',['Play a short tiebreaker','Erase one player’s score','Declare a random winner','Stop saving both scores'],'Play a short tiebreaker'],
      ['A local multiplayer game usually shares…',['One device or screen','A required online account always','A private server by default','No controls'],'One device or screen'],
      ['A blocker move in Four-in-a-Row prevents…',['An opponent’s immediate win','A new turn ever happening','The score from existing','The board from displaying'],'An opponent’s immediate win'],
      ['In a memory game, teamwork works best when players…',['Share remembered locations','Flip every card at once','Ignore matching pairs','Change the board rules'],'Share remembered locations'],
      ['Good sportsmanship means…',['Respecting both players','Mocking mistakes','Changing the score','Refusing every rematch'],'Respecting both players'],
      ['Turn-taking helps make multiplayer play…',['Predictable and fair','Impossible to follow','Only random','Less accessible'],'Predictable and fair']
    ]
  });

  // Update the shared category router so these question banks are used by the game's core engine.
  if (typeof api.categoryFor === 'function') api.categoryFor = g => (questionSets[g[3]] ? g[3] : 'Logic');
  if (api.tracks && Array.isArray(api.tracks) && api.tracks.length < 54) {
    const moreTracks = [
      ['Neon Fern','arcade','triangle',520,[392,523,659,784,659,523,440,587]],['Button Bloom','arcade','square',610,[262,330,392,523,494,392,330,440]],
      ['Comet Courtyard','arcade','triangle',470,[330,440,554,659,740,659,554,440]],['Pixel Fireflies','arcade','square',690,[523,392,440,659,587,440,392,330]],
      ['Focus Canopy','study','sine',1500,[220,261.6,329.6,392,329.6,261.6,293.7,349.2]],['Quiet Pages','study','sine',1680,[196,246.9,293.7,329.6,293.7,246.9,220,261.6]],
      ['Library Sunbeam','study','sine',1430,[261.6,329.6,392,440,392,329.6,293.7,349.2]],['Lo-Fi Sprout','study','triangle',1180,[220,261.6,329.6,293.7,246.9,293.7,349.2,261.6]],
      ['Soft Snowglow','seasonal','sine',1580,[392,349.2,293.7,261.6,293.7,349.2,392,440]],['Pumpkin Moon','seasonal','triangle',1050,[196,233.1,277.2,233.1,185,220,261.6,220]],
      ['Spring Windowbox','seasonal','sine',970,[392,493.9,587.3,493.9,440,523.3,659.3,523.3]],['Harvest Mooncake','seasonal','triangle',1020,[293.7,369.9,440,369.9,261.6,329.6,392,329.6]],
      ['Birdsong Glade','nature','sine',1110,[587.3,659.3,523.3,440,523.3,659.3,587.3,493.9]],['Drizzle on Glass','nature','sine',1520,[261.6,293.7,349.2,293.7,220,261.6,329.6,261.6]],
      ['River Pebbles','nature','triangle',1300,[220,277.2,329.6,392,329.6,277.2,246.9,293.7]],['Night Pond','relax','sine',1640,[174.6,220,261.6,220,196,246.9,293.7,246.9]],
      ['Blue Hour','relax','sine',1490,[261.6,329.6,392,440,392,329.6,293.7,349.2]],['Cloud Hammock','relax','sine',1710,[196,246.9,293.7,369.9,329.6,293.7,246.9,220]],
      ['Star Lanterns','arcade','triangle',640,[440,554.4,659.3,880,659.3,554.4,493.9,659.3]],['Carnival Garden','seasonal','triangle',740,[392,523.3,587.3,659.3,587.3,523.3,440,523.3]],
      ['Midnight Circuit','arcade','square',560,[220,329.6,440,659.3,587.3,440,329.6,261.6]],['Aurora Drift','relax','sine',1370,[349.2,440,523.3,659.3,523.3,440,392,493.9]],
      ['Pocket Galaxy','arcade','triangle',720,[392,440,523.3,659.3,784,659.3,523.3,440]],['Ocean Lantern','nature','sine',1430,[196,246.9,293.7,349.2,293.7,246.9,220,261.6]]
    ];
    moreTracks.forEach(([title,mood,wave,tempo,notes], i) => api.tracks.push({title,desc:`${mood} · original synthesized loop`,icon:['🌠','🌷','☄️','🪲','🌿','📖','☀️','🎧','❄️','🎃','🌱','🌕','🐦','🌧️','🪨','🌙','🌇','☁️','✨','🎪','🔌','🌌','🪐','🌊'][i],wave,tempo,notes,mood}));
    try { window.CaydenMusic?.refreshTrackChoices(); } catch (_) {}
  }

  // Local tournament/records helpers.
  function ensureGameStat(id) { if (!data.gameStats[id]) data.gameStats[id] = { plays: 0, finishes: 0, xp: 0, bestXP: 0 }; return data.gameStats[id]; }
  function awardGems(n) { data.gems = Math.max(0, (Number(data.gems) || 0) + n); }
  function activeGameStart(id) {
    data.activeGame = id;
    data.totalStarts = (data.totalStarts || 0) + 1;
    const stat = ensureGameStat(id); stat.plays++;
    if (data.weeklyKey !== WEEK()) { data.weeklyKey = WEEK(); data.weeklyXP = 0; }
    save();
  }
  function onReward(n, reason) {
    const id = data.activeGame || 'arcade';
    const stat = ensureGameStat(id); stat.finishes++; stat.xp += n; stat.bestXP = Math.max(stat.bestXP, n);
    data.totalFinishes = (data.totalFinishes || 0) + 1;
    data.lifetimeXP = (data.lifetimeXP || 0) + n;
    data.weeklyXP = (data.weeklyXP || 0) + n;
    if (n >= 20) awardGems(Math.min(4, Math.floor(n / 35)));
    if (data.challengeDoneDay !== DAY()) {
      if (data.challengeGame === id) {
        data.challengeDoneDay = DAY(); data.xp += 20; data.coins += 25; awardGems(2);
        toast('🌟 Daily challenge cleared! +20 XP, 25 coins, and 2 gems.');
      } else if (data.activeGame && (data.challengeGame === '' || !games.some(g => g[0] === data.challengeGame))) {
        data.challengeDoneDay = DAY(); data.xp += 12; awardGems(1);
      }
    }
    if ((data.totalFinishes || 0) >= 10 && !data.achievements.includes('arcade-veteran')) api.unlock('arcade-veteran');
    if ((data.gems || 0) >= 20 && !data.achievements.includes('gem-gardener')) api.unlock('gem-gardener');
    save(); api.header();
  }
  api.onReward = onReward;
  api.noteGameStart = activeGameStart;
  api.recordGems = awardGems;
  // A hook is called from the legacy startGame function for dedicated mini-games.
  const customGameIds = new Set(['localduel','turborally','tinytown','bughunt','doodlepass','bossbloom']);
  function startCustom(id, g) {
    activeGameStart(id);
    if (!customGameIds.has(id)) return false;
    if (id === 'localduel') { localDuel(g); return true; }
    if (id === 'turborally') { turboRally(g); return true; }
    if (id === 'tinytown') { tinyTown(g); return true; }
    if (id === 'bughunt') { bugHunt(g); return true; }
    if (id === 'doodlepass') { doodlePass(g); return true; }
    if (id === 'bossbloom') { bossBattle(g); return true; }
    return false;
  }
  api.startGame = id => api.runGame(id);
  window.CaydenArcadePlus = { startGame: startCustom, onReward };

  function gameHeader(g, subtitle) { return `<div class="cp-game-top"><span style="font-size:2.5rem">${g[2]}</span><div style="flex:1;min-width:0"><div class="cp-chip">${escapeHTML(g[3])} · LOCAL ARCADE</div><h2>${escapeHTML(g[1])}</h2><p class="cp-muted">${escapeHTML(subtitle || g[4])}</p></div><button class="cp-btn" data-cap-back>← Arcade</button></div>`; }
  function finishCustom(id, score, won, reason) {
    data.wins += won ? 1 : 0;
    data.bests[id] = Math.max(Number(data.bests[id]) || 0, score);
    api.addXP(Math.max(8, Math.floor(score / 5) + (won ? 20 : 0)), reason || id);
    if (won) toast('🏆 Challenge cleared! Your progress was saved.');
    content.querySelectorAll('[data-cap-action]').forEach(b => b.disabled = true);
  }
  content.addEventListener('click', e => {
    if (e.target.closest('[data-cap-back]')) { api.home(); return; }
    const b = e.target.closest('[data-cap-action]'); if (b && b.dataset.capAction === 'replay') api.startGame(data.activeGame);
  });

  function bossBattle(g) {
    const bank=questionSets.Action;let wave=1,hp=5,hearts=3,combo=0,score=0,shield=1,index=0,ended=false;
    const order=Array.from({length:8},(_,i)=>bank[(i*3+2)%bank.length]);
    function draw(note='The Thorn King has three phases. Answer correctly to damage its shield.') {
      if(ended)return;const q=order[index];
      content.innerHTML=`${gameHeader(g,'Boss encounter · Three phases · one shield power-up.')}<section class="cap-boss-arena"><div class="cap-boss-art" aria-hidden="true">${wave===1?'🌹':wave===2?'🌵':'👑🌹'}</div><div class="cap-boss-info"><b>THORN KING · PHASE ${wave}/3</b><div class="cp-meter cap-boss-meter"><span style="width:${Math.max(0,hp/5*100)}%"></span></div><small>Boss shield ${hp}/5 · Hearts ${'♥'.repeat(hearts)}${'♡'.repeat(3-hearts)} · Combo ×${combo}</small></div></section><section class="cp-panel"><div class="cp-chip">BATTLE QUESTION ${index+1}/${order.length}</div><div class="cp-question">${escapeHTML(q[0])}</div><div class="cp-answer-grid">${q[1].map(a=>`<button class="cp-answer" data-boss-answer="${escapeHTML(a)}">${escapeHTML(a)}</button>`).join('')}</div><p class="cp-feedback" role="status">${escapeHTML(note)}</p><div class="cp-row"><button class="cp-btn" id="cap-boss-shield" ${shield?'':'disabled'}>🛡️ Use shield (${shield})</button><span class="cp-badge">⭐ ${score} score</span></div></section>`;
      content.querySelector('#cap-boss-shield').onclick=()=>{if(shield){shield=0;content.querySelector('#cap-boss-shield').textContent='🛡️ Shield used';content.querySelector('#cap-boss-shield').disabled=true;content.querySelector('.cp-feedback').textContent='Shield ready: your next missed answer will not cost a heart.';data.bossShieldArmed=true;}};
      content.querySelectorAll('[data-boss-answer]').forEach(b=>b.onclick=()=>{if(ended)return;const correct=b.dataset.bossAnswer===q[2];content.querySelectorAll('[data-boss-answer]').forEach(x=>{x.disabled=true;if(x.dataset.bossAnswer===q[2])x.classList.add('good')});if(correct){const dmg=combo>=2?2:1;hp=Math.max(0,hp-dmg);score+=10+combo*3;combo++;if(index===2||index===5)wave=Math.min(3,wave+1);if(hp===0){finish(true);return}draw('Direct hit! The boss lost '+dmg+' shield point'+(dmg===1?'':'s')+'.');return;}if(data.bossShieldArmed){data.bossShieldArmed=false;draw('Shield blocked the boss attack! Your hearts are safe.');return;}hearts--;combo=0;if(hearts<=0){finish(false);return}draw('The boss struck back. Watch for the next clue.');});
    }
    function finish(win){ended=true;data.bossShieldArmed=false;data.wins+=win?1:0;data.bests.bossbloom=Math.max(data.bests.bossbloom||0,score);api.addXP(Math.max(10,score+(win?45:0)), 'Thorn King Boss Battle');if(win)api.unlock('thorn-king');content.innerHTML=`${gameHeader(g,'Boss report')}<section class="cp-result"><div class="big">${win?'👑':'🌹'}</div><h2>${win?'The Thorn King is defeated!':'The garden needs a rematch!'}</h2><p>Score: ${score} · Remaining hearts: ${hearts}</p><button class="cp-btn hot" id="cap-boss-again">Fight again</button><button class="cp-btn" data-cap-back>Back to arcade</button></section>`;content.querySelector('#cap-boss-again').onclick=()=>api.startGame('bossbloom');}
    draw();
  }

  function localDuel(g) {
    let turn = 0, scores = [0,0], question = 0, ended = false;
    const bank = questionSets['Multiplayer (local)'];
    const order = Array.from({length: 10}, (_, i) => bank[(i * 3 + (today.charCodeAt(9) || 1)) % bank.length]);
    function draw(note='Pass the keyboard after each answer.') {
      const q = order[question];
      content.innerHTML = `${gameHeader(g, 'Local two-player quiz duel. Take turns on the same device.')}<div class="cap-duel-score"><div class="cap-score-card"><span>🌻 Player 1</span><strong>${scores[0]}</strong></div><div class="cap-score-card"><span>🌙 Player 2</span><strong>${scores[1]}</strong></div></div><section class="cp-panel"><div class="cp-chip">QUESTION ${question + 1}/10 · PLAYER ${turn + 1}</div><div class="cp-question">${escapeHTML(q[0])}</div><div class="cp-answer-grid">${q[1].map(x=>`<button class="cp-answer" data-duel-answer="${escapeHTML(x)}">${escapeHTML(x)}</button>`).join('')}</div><p class="cp-feedback" role="status">${escapeHTML(note)}</p><p class="cp-muted">Correct answer: +10 points · First to finish all questions gets a fun recap.</p></section>`;
      content.querySelectorAll('[data-duel-answer]').forEach(btn=>btn.onclick=()=>{
        if(ended) return; const correct=btn.dataset.duelAnswer===q[2]; if(correct) scores[turn]+=10;
        turn=1-turn; question++;
        if(question>=order.length){ ended=true; const won=scores[0]!==scores[1]; const high=Math.max(...scores); content.innerHTML=`${gameHeader(g,'The local duel is complete.')}<section class="cp-result"><div class="big">${scores[0]===scores[1]?'🤝':scores[0]>scores[1]?'🌻':'🌙'}</div><h2>${scores[0]===scores[1]?'Friendly tie!':scores[0]>scores[1]?'Player 1 takes the win!':'Player 2 takes the win!'}</h2><p>Player 1: ${scores[0]} · Player 2: ${scores[1]}</p><button class="cp-btn hot" data-cap-action="replay">Rematch</button><button class="cp-btn" data-cap-back>Back to arcade</button></section>`; if(won){ data.wins++; api.addXP(25+high,'Local Quiz Duel'); } else api.addXP(15,'Local Quiz Duel tie'); data.bests.localduel=Math.max(data.bests.localduel||0,high); save(); return; }
        draw(correct?'Correct! Switch seats / pass the keyboard.':'Not quite — switch seats for the next turn.');
      });
    }
    draw();
  }

  function turboRally(g) {
    let lane=1, score=0, lives=3, ticks=0, obstacles=[], loop=null, started=false;
    const lanes=[0,1,2];
    content.innerHTML=`${gameHeader(g,'Arrow keys or the on-screen controls move between three lanes. Avoid rocks, collect petals, and reach 25 points to win.')}<div class="cap-race-hud"><span>⭐ Score <b id="cap-race-score">0</b></span><span>💚 Lives <b id="cap-race-lives">3</b></span><span>⚡ Boost <b id="cap-race-boost">Ready</b></span></div><div class="cap-race-track" id="cap-race-track" tabindex="0" role="application" aria-label="Racing track. Use left and right arrow keys."><div class="cap-race-lane" data-lane="0"></div><div class="cap-race-lane" data-lane="1"></div><div class="cap-race-lane" data-lane="2"></div><div class="cap-racer" id="cap-racer">🏎️</div></div><div class="cp-row" style="justify-content:center;margin-top:12px"><button class="cp-btn" id="cap-left">← Left</button><button class="cp-btn hot" id="cap-boost">⚡ Boost</button><button class="cp-btn" id="cap-right">Right →</button></div><p class="cp-feedback" id="cap-race-status" role="status">Press Start race when you're ready.</p><button class="cp-btn hot" id="cap-race-start">Start race</button>`;
    let boost=0;
    const track=content.querySelector('#cap-race-track');
    function update(){ content.querySelector('#cap-race-score').textContent=score;content.querySelector('#cap-race-lives').textContent=lives;content.querySelector('#cap-race-boost').textContent=boost?'Active':'Ready';content.querySelector('#cap-racer').style.left=(16+lane*34)+'%'; }
    const move=dir=>{if(!started)return;lane=Math.max(0,Math.min(2,lane+dir));update();};
    content.querySelector('#cap-left').onclick=()=>move(-1);content.querySelector('#cap-right').onclick=()=>move(1);content.querySelector('#cap-boost').onclick=()=>{if(started&&!boost){boost=1;setTimeout(()=>{boost=0;update()},2200);update()}};
    track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}});
    function end(win){started=false;if(loop)clearInterval(loop);loop=null;finishCustom('turborally',score,win,'Turbo Garden Rally');const p=content.querySelector('#cap-race-status');if(p)p.textContent=(win?'🏆 Finish line! ':'Race over. ')+`Final score: ${score}.`;const btn=content.querySelector('#cap-race-start');if(btn){btn.textContent='Race again';btn.onclick=()=>api.startGame('turborally')}}
    function tick(){if(!content.contains(track)){if(loop)clearInterval(loop);loop=null;started=false;return}ticks++;if(ticks%2===0){const laneN=Math.floor(Math.random()*3),type=Math.random()<.68?'🪨':'🌼';obstacles.push({lane:laneN,y:0,type});}obstacles=obstacles.map(o=>({...o,y:o.y+(boost?9:6)}));obstacles=obstacles.filter(o=>o.y<110);for(const o of obstacles){if(o.y>78&&o.y<97&&o.lane===lane){if(o.type==='🌼'){score+=5;o.y=120}else if(!boost){lives--;o.y=120;toast('Bump! Use lane changes to dodge rocks.')}}}score+=boost?2:1;const area=content.querySelector('#cap-race-track');area.querySelectorAll('.cap-obstacle').forEach(x=>x.remove());obstacles.forEach(o=>{const el=document.createElement('span');el.className='cap-obstacle';el.textContent=o.type;el.style.left=(16+o.lane*34)+'%';el.style.top=o.y+'%';area.append(el)});update();if(lives<=0){end(false);return}if(score>=25){end(true);return}}
    content.querySelector('#cap-race-start').onclick=()=>{if(loop)clearInterval(loop);lane=1;score=0;lives=3;ticks=0;obstacles=[];boost=0;started=true;update();content.querySelector('#cap-race-status').textContent='Drive! Collect petals and dodge rocks.';loop=setInterval(tick,420);track.focus()};
    const oldStop = api.stopRound; // Existing modal stop logic is preserved; game timers self-check their node below.
    track.focus({preventScroll:true});
  }

  function tinyTown(g) {
    const size=8, tiles=['🟩','🌷','🌳','🪨','💧','🏡','🌻','🪵'];
    const prior=Array.isArray(data.townGrid)&&data.townGrid.length===size*size?data.townGrid:Array(size*size).fill('🟩');
    let grid=prior.slice(), selected='🌷';
    content.innerHTML=`${gameHeader(g,'Create a tiny town using a grid. Pick a tile, decorate, and autosave your build on this device.')}<div class="cp-panel"><div class="cp-row" style="justify-content:center">${tiles.map(t=>`<button class="cp-btn" data-town-tile="${t}" aria-pressed="${t===selected}">${t}</button>`).join('')}<button class="cp-btn" id="cap-town-clear">Clear</button></div><div class="cap-town-grid" id="cap-town-grid">${grid.map((v,i)=>`<button class="cap-town-cell" data-town-cell="${i}" aria-label="Place tile at row ${Math.floor(i/size)+1}, column ${i%size+1}">${v}</button>`).join('')}</div><div class="cp-row" style="justify-content:space-between;margin-top:14px"><span class="cp-badge">🌿 Green spaces: <b id="cap-town-score">0</b></span><button class="cp-btn hot" id="cap-town-save">Save town</button></div><p class="cp-feedback" role="status" id="cap-town-status">Choose a tile, then tap a square to build.</p></div>`;
    function score(){return grid.filter(x=>['🌷','🌳','🌻','💧'].includes(x)).length*5+grid.filter(x=>x==='🏡').length*4;}
    function paint(){content.querySelectorAll('[data-town-cell]').forEach(b=>b.textContent=grid[Number(b.dataset.townCell)]);content.querySelector('#cap-town-score').textContent=score();}
    content.querySelectorAll('[data-town-tile]').forEach(b=>b.onclick=()=>{selected=b.dataset.townTile;content.querySelectorAll('[data-town-tile]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
    content.querySelectorAll('[data-town-cell]').forEach(b=>b.onclick=()=>{grid[Number(b.dataset.townCell)]=selected;paint();data.townGrid=grid.slice();save();});
    content.querySelector('#cap-town-clear').onclick=()=>{grid=Array(size*size).fill('🟩');paint();};
    content.querySelector('#cap-town-save').onclick=()=>{data.townGrid=grid.slice();const n=score();data.bests.tinytown=Math.max(data.bests.tinytown||0,n);api.addXP(Math.max(10,n),'Tiny Town Builder');content.querySelector('#cap-town-status').textContent=`Town saved! Community score: ${n}.`;save()};paint();
  }

  function bugHunt(g) {
    const puzzles=[
      {prompt:'A loop should count 0 through 3. Which condition avoids an extra round?',code:'for (let i = 0; ___; i++) {\n  console.log(i);\n}',answers:['i < 4','i <= 4','i = 4','i > 4'],ok:'i < 4',why:'i < 4 runs for 0, 1, 2, and 3.'},
      {prompt:'Which line correctly declares a constant?',code:'___ score = 10;',answers:['const','constant','fixed','define'],ok:'const',why:'JavaScript uses const when the binding should not be reassigned.'},
      {prompt:'Which selector targets an element with id="start"?',code:'___',answers:['.start','#start','start()','*start'],ok:'#start',why:'CSS uses # for an ID selector.'},
      {prompt:'Which equality operator checks value and type?',code:'if (count ___ 3) { ... }',answers:['=','==','===','=>'],ok:'===',why:'Strict equality checks both value and type.'}
    ];let idx=0,score=0,combo=0;
    function draw(note='Find the bug or choose the safest fix.') {const p=puzzles[idx];content.innerHTML=`${gameHeader(g,'Code review mini-game: read the snippet and choose a fix. Four rounds, combo points, and an explanation after each answer.')}<section class="cp-panel"><div class="cp-chip">BUG ${idx+1}/${puzzles.length} · ⚡ COMBO ×${combo}</div><h3>${escapeHTML(p.prompt)}</h3><pre class="cap-code"><code>${escapeHTML(p.code)}</code></pre><div class="cp-answer-grid">${p.answers.map(x=>`<button class="cp-answer" data-bug-answer="${escapeHTML(x)}">${escapeHTML(x)}</button>`).join('')}</div><p class="cp-feedback" role="status">${escapeHTML(note)}</p><span class="cp-badge">Score ${score}</span></section>`;content.querySelectorAll('[data-bug-answer]').forEach(b=>b.onclick=()=>{const good=b.dataset.bugAnswer===p.ok;if(good){score+=10+combo*2;combo++;}else combo=0;content.querySelector('.cp-feedback').textContent=(good?'Correct. ':'Not quite. ')+p.why;content.querySelectorAll('[data-bug-answer]').forEach(x=>x.disabled=true);const next=document.createElement('button');next.className='cp-btn hot';next.textContent=idx===puzzles.length-1?'See results':'Next bug';next.onclick=()=>{idx++;if(idx>=puzzles.length){content.innerHTML=`${gameHeader(g,'Bug Hunt complete.')}<section class="cp-result"><div class="big">${score>=30?'🐞':'🛠️'}</div><h2>${score>=30?'Bug bounty earned!':'Debugging practice complete!'}</h2><p>Score: ${score} · Best combo: ${combo}×</p><button class="cp-btn hot" id="cap-bug-again">Play again</button><button class="cp-btn" data-cap-back>Back to arcade</button></section>`;content.querySelector('#cap-bug-again').onclick=()=>api.startGame('bughunt');finishCustom('bughunt',score,score>=25,'Bug Hunt: Code Fixer')}else draw()};content.querySelector('.cp-panel').append(next);});}
    draw();
  }

  function doodlePass(g) {
    const prompts=['A sleepy dragon','A robot gardener','A moonlit cat','A flying pizza','A tiny castle'];let idx=0;
    content.innerHTML=`${gameHeader(g,'Take turns drawing a prompt on one device. Pass to the next player, then compare the doodles together.')}<section class="cp-panel"><div class="cp-chip" id="cap-doodle-round">ROUND 1/5</div><h3 id="cap-doodle-prompt">${prompts[0]}</h3><canvas class="cp-canvas" id="cap-doodle-canvas" width="840" height="420" aria-label="Shared drawing canvas"></canvas><div class="cp-row" style="margin-top:12px"><label>Ink <input type="color" id="cap-doodle-color" value="#3a6b52"></label><button class="cp-btn" id="cap-doodle-erase">Clear canvas</button><button class="cp-btn hot" id="cap-doodle-next">Pass / next prompt</button></div><p class="cp-feedback" id="cap-doodle-note" role="status">Use a mouse, touch, or stylus to draw.</p></section>`;
    const canvas=content.querySelector('#cap-doodle-canvas'),ctx=canvas.getContext('2d');ctx.lineWidth=7;ctx.lineCap='round';ctx.strokeStyle='#3a6b52';ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);let drawing=false;
    function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
    canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)});
    canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke()});canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointercancel',()=>drawing=false);
    content.querySelector('#cap-doodle-color').oninput=e=>ctx.strokeStyle=e.target.value;
    content.querySelector('#cap-doodle-erase').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=content.querySelector('#cap-doodle-color').value};
    content.querySelector('#cap-doodle-next').onclick=()=>{idx++;if(idx>=prompts.length){data.bests.doodlepass=Math.max(data.bests.doodlepass||0,idx);api.addXP(20,'Doodle Pass & Play');content.querySelector('#cap-doodle-note').textContent='Five prompts complete — save a screenshot if you want to keep the drawings.';content.querySelector('#cap-doodle-next').disabled=true;return}content.querySelector('#cap-doodle-round').textContent=`ROUND ${idx+1}/${prompts.length}`;content.querySelector('#cap-doodle-prompt').textContent=prompts[idx];content.querySelector('#cap-doodle-note').textContent='Hand off the device to the next artist.';content.querySelector('#cap-doodle-erase').click()};
  }

  // Player HQ: daily login bonuses, weekly rewards, local leaderboard, inventory, analytics.
  let customPlaylistTimer=null;
  function playUserPlaylist(pl){
    if(customPlaylistTimer)clearTimeout(customPlaylistTimer);
    let cursor=0;const playNext=()=>{if(!pl.tracks.length)return;const idx=pl.tracks[cursor%pl.tracks.length],track=(api.tracks||[])[idx];if(!track){cursor++;playNext();return}try{api.chooseTrack(idx);const audio=api.getAudio?api.getAudio():null;if(!audio?.musicPlaying&&api.startMusic)api.startMusic();}catch(_){toast('Open the original Music page and press Play once to enable audio.');return}cursor++;customPlaylistTimer=setTimeout(playNext,Math.max(5000,(track.tempo||900)*(track.notes||[]).length));};playNext();toast(`🎧 Playing playlist: ${pl.name}`);
  }
  function rewardsHub() {
    const newAchievements=[
      ['arcade-veteran','🏅 Arcade Veteran','Finish 10 game sessions.','rare'],['gem-gardener','💎 Gem Gardener','Collect 20 gems.','rare'],
      ['studio-session','🎹 Sound Gardener','Record a note in the Instrument Greenhouse.','uncommon'],['town-builder','🏘️ Town Planner','Save a tiny town.','uncommon'],
      ['secret-petal','🌸 Secret Petal','Find a hidden flower in the interface.','secret'],['streak-7','🔥 Week of Wonder','Claim daily rewards on 7 separate days.','rare']
    ];
    const avatars=[['🌻',0,1],['🐱',30,1],['🦊',45,2],['🦉',60,3],['🐉',100,5],['👑',150,7],['🌌',8,4,'gem'],['🦄',12,6,'gem']];
    const shop=[['petal-crown','🌸 Petal Crown',65,'coins'],['chef-apron','👨‍🍳 Chef Apron',90,'coins'],['star-aura','✨ Stardust Aura',5,'gems'],['prism-frame','🌈 Prism Frame',130,'coins'],['moon-plush','🌙 Moon Plush',7,'gems']];
    const earned=new Set(data.achievements);
    const topScores=Object.entries(data.bests||{}).map(([id,score])=>({g:games.find(g=>g[0]===id),score:Number(score)||0})).filter(x=>x.g).sort((a,b)=>b.score-a.score).slice(0,8);
    content.innerHTML=`<div class="cap-hub-head"><div><div class="cp-chip">PLAYER HQ · LOCAL PROFILE</div><h2 style="margin:.35rem 0">Your garden passport</h2><p class="cp-muted">${escapeHTML(data.profileName || 'Garden Explorer')} · Saved on this device only.</p></div><button class="cp-btn" data-cap-back>← Arcade</button></div>
      <section class="cap-profile-hero"><div class="cap-avatar" aria-hidden="true">${escapeHTML(data.avatar)}</div><div style="flex:1;min-width:180px"><div class="cp-chip">LEVEL ${data.level} · GARDEN EXPLORER</div><h2 style="margin:3px 0">${Number(data.xp)||0} XP</h2><div class="cp-meter"><span style="width:${(Number(data.xp)||0)%150/1.5}%"></span></div><p class="cp-muted">${150-((Number(data.xp)||0)%150)} XP to the next level</p></div><div class="cap-wallet"><b>🪙 ${data.coins||0}</b><b>💎 ${data.gems||0}</b><b>🔥 ${data.streak||0} day streak</b></div></section>
      <div class="cap-claim-grid"><article class="cp-panel"><h3>🎁 Daily login bonus</h3><p class="cp-muted">+35 XP · +45 coins · +1 gem. Daily streak rewards make consistency count.</p><button class="cp-btn hot" id="cap-claim-daily" ${data.dailyRewardDay===DAY()?'disabled':''}>${data.dailyRewardDay===DAY()?'✅ Claimed today':'Claim daily reward'}</button></article><article class="cp-panel"><h3>🏆 Weekly Garden Cup</h3><p class="cp-muted">Your local weekly tournament: earn 100 XP to unlock +100 coins and +5 gems. Weekly XP: ${data.weeklyXP||0}/100.</p><button class="cp-btn hot" id="cap-claim-weekly" ${(data.weeklyRewardWeek===WEEK()||(data.weeklyXP||0)<100)?'disabled':''}>${data.weeklyRewardWeek===WEEK()?'✅ Claimed this week':(data.weeklyXP||0)>=100?'Claim weekly reward':'Keep playing to unlock'}</button></article><article class="cp-panel"><h3>🎯 Daily challenge</h3><p class="cp-muted">Play <strong>${escapeHTML((games.find(g=>g[0]===data.challengeGame)||games[0])[1])}</strong> and finish a round.</p><button class="cp-btn" id="cap-challenge-play">${data.challengeDoneDay===DAY()?'✅ Challenge complete':'Play daily challenge'}</button></article></div>
      <div class="cp-section"><div><h2>🌦️ Seasonal event</h2><div class="cp-muted">A small annual collectible event that follows your device calendar.</div></div></div><article class="cp-panel cap-seasonal-event"><div class="cap-seasonal-icon">${seasonCode==='autumn-spooky'?'🎃':seasonCode==='harvest'?'🍂':seasonCode.includes('winter')?'❄️':seasonCode==='spring'?'🌷':seasonCode==='summer'?'☀️':'🍁'}</div><div><div class="cp-chip">LIMITED SEASONAL QUEST</div><h3>${seasonName}</h3><p class="cp-muted">Collect this season’s keepsake for your inventory. Your reward can be claimed once per seasonal event on this device.</p><button class="cp-btn hot" id="cap-seasonal-claim" ${data.seasonalClaim===seasonCode?'disabled':''}>${data.seasonalClaim===seasonCode?'✅ Keepsake collected':'Collect seasonal keepsake'}</button></div></article>
      <div class="cp-section"><div><h2>📊 Progress analytics</h2><div class="cp-muted">Your locally saved lifetime activity.</div></div></div><div class="cp-stats"><div class="cp-stat"><strong>${data.played||0}</strong><small>XP-awarding sessions</small></div><div class="cp-stat"><strong>${data.totalStarts||0}</strong><small>Games started</small></div><div class="cp-stat"><strong>${data.wins||0}</strong><small>Rounds won</small></div><div class="cp-stat"><strong>${data.lifetimeXP||data.xp||0}</strong><small>Lifetime XP earned</small></div></div>
      <div class="cp-section"><div><h2>🏅 Achievement showcase</h2><div class="cp-muted">Rare and secret badges stay hidden until earned.</div></div></div><div class="cap-achievements">${newAchievements.map(([id,title,desc,rarity])=>`<article class="cap-achievement ${earned.has(id)?'earned':'locked'} ${rarity}"><span>${earned.has(id)?title.split(' ')[0]:'🔒'}</span><strong>${earned.has(id)?escapeHTML(title):'Hidden achievement'}</strong><small>${earned.has(id)?escapeHTML(desc):rarity==='secret'?'A little secret is waiting.':'Keep playing to discover this badge.'}</small><em>${earned.has(id)?rarity.toUpperCase(): 'LOCKED'}</em></article>`).join('')}${[...earned].filter(id=>!newAchievements.some(a=>a[0]===id)).map(id=>`<article class="cap-achievement earned"><span>🏅</span><strong>${escapeHTML(id.replace(/-/g,' ').replace(/^./,m=>m.toUpperCase()))}</strong><small>Earned in the garden arcade.</small><em>BADGE</em></article>`).join('')}</div>
      <div class="cp-section"><div><h2>🧑‍🚀 Avatar collection</h2><div class="cp-muted">Unlock styles with coins or gems.</div></div></div><div class="cap-avatar-grid">${avatars.map(([emoji,cost,level,kind='coins'])=>{const key='avatar-'+emoji,owned=emoji==='🌻'||data.inventory.includes(key),unlocked=owned||((kind==='gem'?(data.gems||0)>=(cost):(data.coins||0)>=cost)&&data.level>=level);return `<button class="cap-avatar-option" data-cap-avatar="${emoji}" data-cost="${cost}" data-currency="${kind}" data-owned="${owned}" data-allowed="${unlocked}" ${(!unlocked&&!owned)?'disabled':''} aria-pressed="${data.avatar===emoji}"><span>${emoji}</span><b>${data.avatar===emoji?'Equipped':owned?'Equip':'Unlock'}</b><small>${owned?'Owned':`Level ${level} · ${cost} ${kind}`}</small></button>`}).join('')}</div>
      <div class="cp-section"><div><h2>🎒 Inventory & cosmetic shop</h2><div class="cp-muted">Decorative items are local unlocks; no purchases leave this device.</div></div></div><div class="cap-shop-grid">${shop.map(([id,name,cost,currency])=>{const owned=data.inventory.includes(id);return `<article class="cp-panel"><h3>${escapeHTML(name)}</h3><p class="cp-muted">${owned?'In your inventory':`${cost} ${currency}`}</p>${owned?`<button class="cp-btn" data-cap-equip="${id}">${data.equipped.includes(id)?'Unequip':'Equip'}</button>`:`<button class="cp-btn hot" data-cap-shop="${id}" data-cost="${cost}" data-currency="${currency}">Unlock item</button>`}</article>`}).join('')}</div>
      <div class="cp-section"><div><h2>🏆 Local leaderboard</h2><div class="cp-muted">Personal bests stored on this browser. No global server is involved.</div></div></div><div class="cp-panel">${topScores.length?topScores.map((x,i)=>`<div class="cap-record"><span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1).padStart(2,'0')}</span><span>${x.g[2]} ${escapeHTML(x.g[1])}</span><b>${x.score}</b></div>`).join(''):'<p class="cp-muted">Play a few games to start collecting personal bests.</p>'}</div>
      <div class="cp-section"><div><h2>🧭 Learning analytics</h2><div class="cp-muted">Subjects you have practiced most.</div></div></div><div class="cp-panel">${Object.entries(data.gameStats).filter(([,v])=>v.plays).sort((a,b)=>b[1].plays-a[1].plays).slice(0,8).map(([id,v])=>{const g=games.find(x=>x[0]===id);return `<div class="cap-skill-row"><span>${g?g[2]:'🌱'} ${escapeHTML(g?g[1]:id)}</span><div class="cp-meter"><span style="width:${Math.min(100,v.plays*18)}%"></span></div><b>${v.plays}</b></div>`}).join('')||'<p class="cp-muted">Your skill map will grow as you play.</p>'}</div>
      <div class="cp-section"><div><h2>🎵 Custom music playlists</h2><div class="cp-muted">Create and save playlists from the synthesized soundtrack library (${api.tracks?api.tracks.length:0} tracks).</div></div></div><div class="cp-panel"><div class="cp-row"><label>Playlist name <input id="cap-playlist-name" class="cp-search" maxlength="32" placeholder="My focus mix"></label><label>Choose tracks <select id="cap-playlist-tracks" class="cp-search" multiple size="4" aria-label="Choose several music tracks">${(api.tracks||[]).map((t,i)=>`<option value="${i}">${escapeHTML(t.title)}</option>`).join('')}</select></label><button class="cp-btn hot" id="cap-playlist-save">Save playlist</button></div><div id="cap-custom-playlists" class="cap-playlist-list">${data.userPlaylists.map(pl=>`<div class="cap-playlist-row"><span>🎧 <b>${escapeHTML(pl.name)}</b> <small>${(pl.tracks||[]).length} tracks</small></span><button class="cp-btn" data-cap-play-play="${escapeHTML(pl.id)}">▶ Play</button><button class="cp-btn" data-cap-play-delete="${escapeHTML(pl.id)}">Delete</button></div>`).join('')||'<p class="cp-muted">Your playlists will appear here after you save one.</p>'}</div></div>
      <div class="cp-row" style="margin-top:20px"><label class="cap-name-label">Profile name <input id="cap-profile-name" class="cp-search" maxlength="24" value="${escapeHTML(data.profileName||'Garden Explorer')}"></label><button class="cp-btn" id="cap-save-name">Save name</button><button class="cp-btn" id="cap-export-save">Export save JSON</button><label class="cp-btn cap-import-label">Import save JSON<input type="file" id="cap-import-save" accept="application/json" hidden></label></div>`;
    content.querySelector('[data-cap-back]').onclick=api.home;
    content.querySelector('#cap-claim-daily').onclick=()=>{if(data.dailyRewardDay===DAY())return;data.dailyRewardDay=DAY();data.coins=(data.coins||0)+45;data.xp=(data.xp||0)+35;awardGems(1);data.loginDays=(data.loginDays||0)+1;if(data.loginDays>=7&&!data.achievements.includes('streak-7'))api.unlock('streak-7');data.level=Math.floor(data.xp/150)+1;save();api.header();rewardsHub();toast('🎁 Daily bonus claimed: 35 XP, 45 coins, 1 gem!');};
    content.querySelector('#cap-claim-weekly').onclick=()=>{if(data.weeklyRewardWeek===WEEK()||(data.weeklyXP||0)<100)return;data.weeklyRewardWeek=WEEK();data.coins=(data.coins||0)+100;awardGems(5);data.xp=(data.xp||0)+25;data.level=Math.floor(data.xp/150)+1;save();api.header();rewardsHub();toast('🏆 Weekly reward claimed: 100 coins and 5 gems!');};
    content.querySelector('#cap-challenge-play').onclick=()=>api.startGame(data.challengeGame);
    content.querySelector('#cap-seasonal-claim').onclick=()=>{if(data.seasonalClaim===seasonCode)return;data.seasonalClaim=seasonCode;data.inventory.push('collectible-'+seasonCode);data.coins=(data.coins||0)+30;data.xp=(data.xp||0)+15;awardGems(1);data.level=Math.floor(data.xp/150)+1;if(!data.achievements.includes('seasonal-collector'))api.unlock('seasonal-collector');save();api.header();rewardsHub();toast('🍂 Seasonal keepsake collected: +15 XP, 30 coins, 1 gem!');};
    content.querySelectorAll('[data-cap-avatar]').forEach(b=>b.onclick=()=>{const emoji=b.dataset.capAvatar;if(data.avatar===emoji){toast('That avatar is already equipped.');return}const key='avatar-'+emoji;if(data.inventory.includes(key)){data.avatar=emoji;save();rewardsHub();return}const currency=b.dataset.currency,cost=Number(b.dataset.cost);if((currency==='gem'?(data.gems||0)<cost:(data.coins||0)<cost)||data.level<Number(b.querySelector('small').textContent.match(/Level (\d+)/)?.[1]||1)){toast('Keep playing to unlock this avatar.');return}if(currency==='gem')data.gems-=cost;else data.coins-=cost;data.inventory.push(key);data.avatar=emoji;save();rewardsHub();toast('Avatar unlocked and equipped!');});
    content.querySelectorAll('[data-cap-shop]').forEach(b=>b.onclick=()=>{if(data.inventory.includes(b.dataset.capShop))return;const cost=Number(b.dataset.cost),currency=b.dataset.currency;if((currency==='gems'?(data.gems||0):(data.coins||0))<cost){toast(`You need more ${currency}.`);return}if(currency==='gems')data.gems-=cost;else data.coins-=cost;data.inventory.push(b.dataset.capShop);save();rewardsHub();toast('✨ Item added to your inventory!');});
    content.querySelectorAll('[data-cap-equip]').forEach(b=>b.onclick=()=>{const id=b.dataset.capEquip;data.equipped=data.equipped.includes(id)?data.equipped.filter(x=>x!==id):[...data.equipped,id];save();rewardsHub();toast(data.equipped.includes(id)?'✨ Cosmetic equipped!':'Cosmetic unequipped.');});
    content.querySelector('#cap-playlist-save').onclick=()=>{const name=content.querySelector('#cap-playlist-name').value.trim()||`Playlist ${data.userPlaylists.length+1}`,tracks=[...content.querySelector('#cap-playlist-tracks').selectedOptions].map(o=>Number(o.value)).filter(Number.isInteger);if(!tracks.length){toast('Choose at least one track for your playlist.');return}data.userPlaylists.push({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,7),name:name.slice(0,32),tracks:tracks.slice(0,24)});save();rewardsHub();toast('🎵 Playlist saved locally.');};
    content.querySelectorAll('[data-cap-play-delete]').forEach(b=>b.onclick=()=>{data.userPlaylists=data.userPlaylists.filter(p=>p.id!==b.dataset.capPlayDelete);save();rewardsHub();});
    content.querySelectorAll('[data-cap-play-play]').forEach(b=>b.onclick=()=>{const pl=data.userPlaylists.find(p=>p.id===b.dataset.capPlayPlay);if(!pl||!pl.tracks.length)return;playUserPlaylist(pl);});
    content.querySelector('#cap-save-name').onclick=()=>{const val=content.querySelector('#cap-profile-name').value.trim();data.profileName=val.slice(0,24)||'Garden Explorer';save();rewardsHub();toast('Player name saved on this device.');};
    content.querySelector('#cap-export-save').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='caydenproxy-save.json';a.click();URL.revokeObjectURL(url);};
    content.querySelector('#cap-import-save').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Save file must contain an object.');['xp','coins','gems','level','wins','streak','played'].forEach(k=>{if(Number.isFinite(Number(parsed[k])))data[k]=Math.max(0,Number(parsed[k]))});['history','bests','achievements','favorites','inventory','studioTracks','gameStats'].forEach(k=>{if(parsed[k]&&typeof parsed[k]==='object')data[k]=parsed[k]});data.level=Math.floor(data.xp/150)+1;save();api.header();rewardsHub();toast('Save imported.');}catch(_){toast('Could not import that save file. Use a CaydenProxy save JSON.');}};
  }

  // Instrument Greenhouse 2.0 — synthesized instruments, 4 track lanes, loop pads, MIDI export.
  const instrumentPresets = {
    Piano:{wave:'triangle',cutoff:4000,release:.7,gm:0}, Guitar:{wave:'sawtooth',cutoff:2100,release:.48,gm:24}, Drums:{wave:'square',cutoff:1600,release:.15,gm:118}, Bass:{wave:'sawtooth',cutoff:700,release:.65,gm:32}, Synth:{wave:'square',cutoff:3400,release:.5,gm:81}, Flute:{wave:'sine',cutoff:5000,release:.8,gm:73}, Violin:{wave:'sawtooth',cutoff:2900,release:.75,gm:40}, Saxophone:{wave:'sawtooth',cutoff:1900,release:.58,gm:65}, Recorder:{wave:'triangle',cutoff:3800,release:.45,gm:74}
  };
  const noteNames=['C4','D4','E4','F4','G4','A4','B4','C5'];
  const noteNumbers=[60,62,64,65,67,69,71,72];
  let studioCtx=null, studioGain=null, studioAnalyser=null, studioDelay=null, studioFeedback=null, studioEffectsOn=true, recording=false, selectedInstrument='Piano', selectedLane=0, vizFrame=0, beatTimer=null, beatStep=0, beatPlaying=false;
  let lanes = Array.isArray(data.studioTracks) && data.studioTracks.length===4 ? data.studioTracks : [
    {name:'Melody',instrument:'Piano',notes:[]},{name:'Harmony',instrument:'Flute',notes:[]},{name:'Bassline',instrument:'Bass',notes:[]},{name:'FX',instrument:'Synth',notes:[]}
  ];
  lanes=lanes.map((l,i)=>({name:l.name||`Track ${i+1}`,instrument:instrumentPresets[l.instrument]?l.instrument:['Piano','Flute','Bass','Synth'][i],notes:Array.isArray(l.notes)?l.notes:[]}));
  let steps = Array.isArray(data.studioSteps) && data.studioSteps.length===4 && data.studioSteps.every(x=>Array.isArray(x)&&x.length===16) ? data.studioSteps.map(x=>x.map(Boolean)) : Array.from({length:4},()=>Array(16).fill(false));
  function saveStudio(){data.studioTracks=lanes.map(l=>({name:l.name,instrument:l.instrument,notes:l.notes.slice(-600)}));data.studioSteps=steps.map(x=>x.slice());save();}
  function ensureStudioAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast('Web Audio is not available in this browser.');return false}if(!studioCtx){studioCtx=new AC();studioGain=studioCtx.createGain();studioGain.gain.value=Math.max(0,Math.min(1,(Number(data.volume)||35)/100));studioAnalyser=studioCtx.createAnalyser();studioAnalyser.fftSize=128;studioGain.connect(studioAnalyser);studioAnalyser.connect(studioCtx.destination);studioDelay=studioCtx.createDelay(1);studioDelay.delayTime.value=.24;studioFeedback=studioCtx.createGain();studioFeedback.gain.value=.14;studioDelay.connect(studioFeedback);studioFeedback.connect(studioDelay);studioDelay.connect(studioGain);if(content.querySelector('#cap-visualizer'))visualizer()}studioCtx.resume();return true;}
  function playNote(midi,instrument=selectedInstrument,record=true,when=0,velocity=.8){if(!ensureStudioAudio())return;const p=instrumentPresets[instrument]||instrumentPresets.Piano;const freq=440*Math.pow(2,(midi-69)/12),now=studioCtx.currentTime+when;const osc=studioCtx.createOscillator(),filter=studioCtx.createBiquadFilter(),gain=studioCtx.createGain();osc.type=p.wave;osc.frequency.setValueAtTime(freq,now);filter.type='lowpass';filter.frequency.setValueAtTime(p.cutoff,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.002,velocity*.16),now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+p.release);osc.connect(filter);filter.connect(gain);gain.connect(studioGain);if(studioEffectsOn&&studioDelay)gain.connect(studioDelay);osc.start(now);osc.stop(now+p.release+.03);if(record&&recording){const track=lanes[selectedLane];track.instrument=instrument;track.notes.push({note:midi,beat:track.notes.length*.5,duration:.45,velocity:96});track.notes=track.notes.slice(-600);saveStudio();if(!data.achievements.includes('studio-session'))api.unlock('studio-session');const status=content.querySelector('#cap-studio-status');if(status)status.textContent=`Recorded ${noteNames[noteNumbers.indexOf(midi)]||midi} on ${track.name}.`;}}
  function visualizer(){cancelAnimationFrame(vizFrame);const canvas=content.querySelector('#cap-visualizer');if(!canvas||!studioAnalyser||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=canvas.getContext('2d'),buf=new Uint8Array(studioAnalyser.frequencyBinCount);const draw=()=>{if(!content.contains(canvas))return;vizFrame=requestAnimationFrame(draw);studioAnalyser.getByteFrequencyData(buf);const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const gap=4,bw=(w-gap*27)/28;for(let i=0;i<28;i++){const n=buf[i]||0,bh=Math.max(3,(n/255)*h);ctx.fillStyle=`hsl(${120+i*4},68%,${48+(n/255)*14}%)`;ctx.fillRect(i*(bw+gap),h-bh,bw,bh);}};draw();}
  function greenhouse(){
    content.innerHTML=`<div class="cap-hub-head"><div><div class="cp-chip">INSTRUMENT GREENHOUSE 2.0</div><h2 style="margin:.35rem 0">Grow a song, one note at a time.</h2><p class="cp-muted">Nine synthesized instruments · 4 recording lanes · beat maker · local autosave · MIDI export.</p></div><button class="cp-btn" data-cap-back>← Arcade</button></div>
      <section class="cap-studio-hero"><div class="cap-studio-top"><label>Instrument<select id="cap-instrument" class="cp-search">${Object.keys(instrumentPresets).map(k=>`<option>${k}</option>`).join('')}</select></label><label>Recording lane<select id="cap-lane" class="cp-search">${lanes.map((l,i)=>`<option value="${i}">${escapeHTML(l.name)}</option>`).join('')}</select></label><button class="cp-btn hot" id="cap-record">⏺ Record notes</button><button class="cp-btn" id="cap-play-lanes">▶ Play recording</button><button class="cp-btn" id="cap-stop-lanes">■ Stop</button><button class="cp-btn" id="cap-midi-export">⬇ Export MIDI</button><label>Studio volume <input id="cap-studio-volume" type="range" min="0" max="100" value="${Number(data.volume)||35}"></label><label>Echo effect <input id="cap-studio-effect" type="checkbox" checked></label><label>Echo amount <input id="cap-studio-echo" type="range" min="0" max="45" value="14"></label></div><div class="cap-instrument-list">${Object.keys(instrumentPresets).map((name,i)=>`<button class="cap-instrument" data-instrument="${name}" aria-pressed="${name===selectedInstrument}"><span>${['🎹','🎸','🥁','🎸','🎛️','🪈','🎻','🎷','🪈'][i]}</span><b>${name}</b></button>`).join('')}</div><div class="cap-keyboard">${noteNames.map((n,i)=>`<button data-note="${noteNumbers[i]}" aria-label="Play note ${n}"><small>${n}</small></button>`).join('')}</div><canvas id="cap-visualizer" width="900" height="130" aria-label="Live audio visualizer" class="cap-visualizer"></canvas><p class="cp-feedback" role="status" id="cap-studio-status">Tap a key to play. Turn on recording to save notes into your selected lane.</p></section>
      <div class="cp-section"><div><h2>🎚️ Multi-track arrangement</h2><div class="cp-muted">Each lane can use a different instrument. The project autosaves locally.</div></div><button class="cp-btn" id="cap-clear-lane">Clear selected lane</button></div><div class="cap-track-list" id="cap-track-list"></div>
      <div class="cp-section"><div><h2>🥁 Beat maker & loop station</h2><div class="cp-muted">Toggle steps, then play the 16-step loop. Synthesized percussion only.</div></div></div><div class="cp-panel"><div class="cap-beat-labels"><span></span>${Array.from({length:16},(_,i)=>`<b>${i+1}</b>`).join('')}</div><div id="cap-beat-grid">${['Kick','Snare','Hat','Clap'].map((n,r)=>`<div class="cap-beat-row"><b>${n}</b>${steps[r].map((on,i)=>`<button data-beat-row="${r}" data-beat-step="${i}" class="cap-step ${on?'on':''}" aria-label="${n} step ${i+1}" aria-pressed="${on}"></button>`).join('')}</div>`).join('')}</div><div class="cp-row" style="margin-top:14px"><button class="cp-btn hot" id="cap-beat-play">▶ Play loop</button><button class="cp-btn" id="cap-beat-clear">Clear beat</button><label>Tempo <input id="cap-bpm" type="range" min="70" max="160" value="110"><span id="cap-bpm-label">110 BPM</span></label></div></div>`;
    content.querySelector('[data-cap-back]').onclick=api.home;
    content.querySelector('#cap-instrument').value=selectedInstrument;content.querySelector('#cap-lane').value=String(selectedLane);
    content.querySelectorAll('[data-instrument]').forEach(b=>b.onclick=()=>{selectedInstrument=b.dataset.instrument;content.querySelector('#cap-instrument').value=selectedInstrument;content.querySelectorAll('[data-instrument]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));playNote(60,selectedInstrument,false);});
    content.querySelector('#cap-instrument').onchange=e=>{selectedInstrument=e.target.value;content.querySelectorAll('[data-instrument]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.instrument===selectedInstrument)));};
    content.querySelector('#cap-lane').onchange=e=>{selectedLane=Number(e.target.value);};
    content.querySelector('#cap-record').onclick=e=>{recording=!recording;e.currentTarget.textContent=recording?'⏺ Recording… click to stop':'⏺ Record notes';e.currentTarget.classList.toggle('hot',recording);content.querySelector('#cap-studio-status').textContent=recording?'Recording enabled. Tap keys and instruments to add notes.':'Recording stopped. Your notes are saved.';saveStudio();};
    content.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>playNote(Number(b.dataset.note),selectedInstrument,true));
    content.querySelector('#cap-play-lanes').onclick=()=>playLanes();content.querySelector('#cap-stop-lanes').onclick=stopLanes;
    content.querySelector('#cap-midi-export').onclick=exportMidi;content.querySelector('#cap-studio-volume').oninput=e=>{data.volume=Number(e.target.value);if(studioGain)studioGain.gain.setTargetAtTime(data.volume/100,studioCtx.currentTime,.04);save();};content.querySelector('#cap-studio-effect').onchange=e=>{studioEffectsOn=e.target.checked;};content.querySelector('#cap-studio-echo').oninput=e=>{if(studioFeedback)studioFeedback.gain.setTargetAtTime(Number(e.target.value)/100,studioCtx.currentTime,.04);};
    content.querySelector('#cap-clear-lane').onclick=()=>{if(!confirm('Clear all recorded notes from this lane?'))return;lanes[selectedLane].notes=[];saveStudio();drawLanes();};
    content.querySelectorAll('[data-beat-row]').forEach(b=>b.onclick=()=>{const r=Number(b.dataset.beatRow),s=Number(b.dataset.beatStep);steps[r][s]=!steps[r][s];b.classList.toggle('on',steps[r][s]);b.setAttribute('aria-pressed',String(steps[r][s]));saveStudio();});
    content.querySelector('#cap-beat-play').onclick=()=>{beatPlaying?stopBeat():startBeat();};content.querySelector('#cap-beat-clear').onclick=()=>{steps=Array.from({length:4},()=>Array(16).fill(false));content.querySelectorAll('[data-beat-row]').forEach(b=>{b.classList.remove('on');b.setAttribute('aria-pressed','false')});saveStudio();};
    content.querySelector('#cap-bpm').oninput=e=>content.querySelector('#cap-bpm-label').textContent=e.target.value+' BPM';drawLanes();visualizer();
  }
  function drawLanes(){const mount=content.querySelector('#cap-track-list');if(!mount)return;mount.innerHTML=lanes.map((l,i)=>`<article class="cap-track-card"><div class="cap-track-title"><span>${['🎹','🎼','🎸','✨'][i]}</span><div><b>${escapeHTML(l.name)}</b><small>${escapeHTML(l.instrument)} · ${l.notes.length} notes</small></div><button class="cp-btn" data-cap-lane-use="${i}">Select</button></div><div class="cap-note-timeline">${Array.from({length:Math.min(32,Math.max(8,l.notes.length))},(_,j)=>`<i style="height:${16+((l.notes[j]?.note||60)%13)*4}px;opacity:${l.notes[j]?.note ? .9 : .18}"></i>`).join('')}</div></article>`).join('');mount.querySelectorAll('[data-cap-lane-use]').forEach(b=>b.onclick=()=>{selectedLane=Number(b.dataset.capLaneUse);selectedInstrument=lanes[selectedLane].instrument;const sel=content.querySelector('#cap-lane');if(sel)sel.value=String(selectedLane);const inst=content.querySelector('#cap-instrument');if(inst)inst.value=selectedInstrument;drawLanes();});}
  let playbackTimers=[];
  function stopLanes(){playbackTimers.forEach(clearTimeout);playbackTimers=[];}
  function playLanes(){stopLanes();if(!lanes.some(l=>l.notes.length)){toast('Record some notes first.');return}if(!ensureStudioAudio())return;let end=0;lanes.forEach(l=>l.notes.forEach((n,i)=>{const t=Math.max(0,n.beat||i*.5);end=Math.max(end,t+1);playbackTimers.push(setTimeout(()=>playNote(n.note,l.instrument,false,0,(n.velocity||90)/120),t*500));}));content.querySelector('#cap-studio-status').textContent='Playing all saved tracks…';playbackTimers.push(setTimeout(()=>{const s=content.querySelector('#cap-studio-status');if(s)s.textContent='Playback complete.';},end*500+800));}
  function startBeat(){if(beatTimer)clearInterval(beatTimer);if(!ensureStudioAudio())return;beatPlaying=true;beatStep=0;content.querySelector('#cap-beat-play').textContent='Ⅱ Stop loop';const bpm=()=>Number(content.querySelector('#cap-bpm')?.value||110);beatTimer=setInterval(()=>{if(!content.querySelector('#cap-beat-grid')){stopBeat();return}const step=beatStep;for(let r=0;r<4;r++)if(steps[r][step]){const freq=[75,190,700,350][r],dur=[.12,.16,.055,.1][r];playNote(69+Math.round(12*Math.log2(freq/440)),r===2?'Drums':'Synth',false,0,r===2?.3:.5);const st=content.querySelector(`[data-beat-row="${r}"][data-beat-step="${step}"]`);if(st){st.classList.add('now');setTimeout(()=>st.classList.remove('now'),90)}}beatStep=(beatStep+1)%16;},60000/bpm()/4);}
  function stopBeat(){if(beatTimer)clearInterval(beatTimer);beatTimer=null;beatPlaying=false;const b=content.querySelector('#cap-beat-play');if(b)b.textContent='▶ Play loop';}
  function vlq(n){let v=n&0x7f,a=[];while((n>>=7)){v<<=8;v|=((n&0x7f)|0x80)}while(true){a.push(v&255);if(v&0x80)v>>=8;else break}return a;}
  function ascii(s){return [...s].map(c=>c.charCodeAt(0));}
  function midiTrack(name,notes,program,channel){const events=[];events.push({t:0,b:[0xff,0x03,...vlq(name.length),...ascii(name)]});events.push({t:0,b:[0xc0|channel,program&0x7f]});notes.forEach((n,i)=>{const start=Math.max(0,Math.round((Number(n.beat)||i*.5)*480)),end=start+Math.max(60,Math.round((Number(n.duration)||.45)*480)),note=Math.max(0,Math.min(127,Number(n.note)||60)),vel=Math.max(1,Math.min(127,Number(n.velocity)||96));events.push({t:start,b:[0x90|channel,note,vel]});events.push({t:end,b:[0x80|channel,note,0]});});events.sort((a,b)=>a.t-b.t);let prev=0,bytes=[];events.forEach(e=>{bytes.push(...vlq(Math.max(0,e.t-prev)),...e.b);prev=e.t});bytes.push(0,0xff,0x2f,0);return [...ascii('MTrk'),...[(bytes.length>>>24)&255,(bytes.length>>>16)&255,(bytes.length>>>8)&255,bytes.length&255],...bytes];}
  function exportMidi(){const active=lanes.filter(l=>l.notes.length);if(!active.length){toast('Record at least one note before exporting MIDI.');return}const tempo=[...ascii('MTrk'),0,0,0,11,0,0xff,0x51,3,7,0xa1,0x20,0,0xff,0x2f,0];const tracks=[tempo,...active.map((l,i)=>midiTrack(l.name,l.notes,(instrumentPresets[l.instrument]||instrumentPresets.Piano).gm,i%9))];const chunks=tracks.flat(),header=[...ascii('MThd'),0,0,0,6,0,1,(tracks.length>>>8)&255,tracks.length&255,1,0xe0];const blob=new Blob([new Uint8Array([...header,...chunks])],{type:'audio/midi'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='caydenproxy-song.mid';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('🎼 MIDI file exported. Open it in a compatible music app.');}

  // Professional shortcuts and recommendations are attached whenever the arcade home redraws.
  function decorateHome(){
    const hero=content.querySelector('.cp-hero');if(!hero||content.querySelector('.cap-quick-launch'))return;
    const quick=document.createElement('div');quick.className='cap-quick-launch';quick.innerHTML=`<button class="cp-btn hot" data-cap-open="hub">🧑‍🚀 Player HQ</button><button class="cp-btn" data-cap-open="studio">🎹 Instrument Greenhouse 2.0</button><button class="cp-btn" data-cap-open="challenge">🎯 Daily challenge</button><button class="cp-btn" data-cap-open="random">🎲 Random game</button>`;
    hero.insertAdjacentElement('afterend',quick);
    const explore=[...content.querySelectorAll('.cp-section')].find(s=>s.textContent.includes('Explore the arcade'));
    if(explore&&!content.querySelector('.cap-recommendations')){
      const picks=games.filter(g=>!data.history.includes(g[0])).slice(0,4);
      const section=document.createElement('section');section.className='cap-recommendations';section.innerHTML=`<div class="cp-section"><div><h2>✨ Recommended next</h2><div class="cp-muted">Fresh picks based on games you haven't tried yet.</div></div><span class="cp-badge">${games.length}+ games</span></div><div class="cp-grid cap-rec-grid">${picks.map(g=>`<article class="cp-card"><span class="cp-icon">${g[2]}</span><span class="cp-chip">${escapeHTML(g[3])}</span><strong>${escapeHTML(g[1])}</strong><p>${escapeHTML(g[4])}</p><button class="cp-btn hot" data-cap-recommend="${g[0]}">Try it →</button></article>`).join('')}</div>`;
      explore.insertAdjacentElement('beforebegin',section);section.querySelectorAll('[data-cap-recommend]').forEach(b=>b.onclick=()=>api.startGame?api.startGame(b.dataset.capRecommend):null);
    }
    const homeStats=content.querySelector('.cp-section');
    const countNote=[...content.querySelectorAll('.cp-section .cp-muted')].find(n=>n.textContent.includes('games ·'));
    if(countNote)countNote.textContent=`${games.length} games · 14 arcade lanes · challenges refresh daily`;
  }
  content.addEventListener('click', e => {
    const b=e.target.closest('[data-cap-open]');if(!b)return;
    if(b.dataset.capOpen==='hub')rewardsHub();
    if(b.dataset.capOpen==='studio')greenhouse();
    if(b.dataset.capOpen==='challenge')api.startGame(data.challengeGame);
    if(b.dataset.capOpen==='random'){const list=games.filter(g=>g[0]!==data.activeGame),g=list[Math.floor(Math.random()*list.length)];api.startGame(g[0]);}
  });
  const observer=new MutationObserver(()=>{decorateHome(); if(content.querySelector('#cap-visualizer'))visualizer(); else { stopLanes(); stopBeat(); recording=false; cancelAnimationFrame(vizFrame); }});
  observer.observe(content,{childList:true,subtree:false});
  decorateHome();

  // A hidden flower sequence provides a small offline easter egg.
  const brand=shell?.querySelector('.cp-brand');if(brand){brand.title='A little flower secret';brand.style.cursor='pointer';brand.addEventListener('click',()=>{data.hiddenClicks=(data.hiddenClicks||0)+1;if(data.hiddenClicks>=7&&!data.achievements.includes('secret-petal')){api.unlock('secret-petal');awardGems(7);save();toast('🌸 Secret Petal found! +7 gems.');data.hiddenClicks=0;}else if(data.hiddenClicks===3)toast('🌼 The flower has a secret…');});}

  // Shared theme packs and audio preferences are applied by the existing arcade.
  shell?.setAttribute('data-cap-version','max');
  window.addEventListener('pagehide',saveStudio);
  window.addEventListener('beforeunload',()=>{stopLanes();stopBeat();});
  // Provide a runtime information hook for the accessible status panel and smoke tests.
  window.CaydenArcadeMax = {
    version:'4.0.0', getCatalogCount:()=>games.length, getTrackCount:()=>api.tracks?api.tracks.length:0,
    openHQ:rewardsHub, openStudio:greenhouse, save:save, getData:()=>data
  };
  save();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => toast('Offline caching could not be enabled on this host.')));
})();
