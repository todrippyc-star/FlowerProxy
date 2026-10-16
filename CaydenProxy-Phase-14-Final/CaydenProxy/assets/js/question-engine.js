/*
 * CaydenProxy Question Engine v1.0
 * Procedural, browser-only question variations for 13 learning subjects.
 * Variants combine curated seed facts with randomized wording, choices,
 * difficulty and response mode. This is not 13,000 separately authored facts.
 */
(() => {
  'use strict';
  const VERSION = 1;
  const STORAGE_KEY = 'cp-question-engine-v1';
  const SUBJECTS = [
    'Math', 'Science', 'Coding', 'Geography', 'History', 'Music Theory',
    'Sports', 'Language Arts', 'Logic', 'Critical Thinking', 'Technology',
    'Space', 'Creative Thinking'
  ];
  const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert', 'Challenge'];
  const TYPES = ['multiple-choice', 'true-false', 'matching', 'typing', 'fill-in-the-blank', 'visual-identification', 'puzzle-solving', 'scenario-based'];
  const PHRASES = [
    '', 'Quick check: ', 'Think it through: ', 'Garden challenge: ',
    'Use what you know: ', 'Mini challenge: '
  ];
  const TYPE_BY_DIFFICULTY = {
    Easy: ['multiple-choice','multiple-choice','true-false','visual-identification','matching'],
    Medium: ['multiple-choice','true-false','fill-in-the-blank','matching','scenario-based'],
    Hard: ['multiple-choice','fill-in-the-blank','typing','puzzle-solving','scenario-based'],
    Expert: ['typing','fill-in-the-blank','puzzle-solving','scenario-based','multiple-choice'],
    Challenge: ['typing','puzzle-solving','scenario-based','fill-in-the-blank','true-false']
  };
  const aliasMap = {
    math:'Math', mathematics:'Math', fractions:'Math', money:'Math', finance:'Math',
    science:'Science', nature:'Science', biology:'Science', chemistry:'Science', physics:'Science', environment:'Science',
    coding:'Coding', programming:'Coding', javascript:'Coding', html:'Coding', technology:'Technology', digital:'Technology', computers:'Technology',
    geography:'Geography', geo:'Geography', maps:'Geography', history:'History', historical:'History',
    music:'Music Theory', 'music theory':'Music Theory', musicquiz:'Music Theory', rhythm:'Music Theory',
    sports:'Sports', sport:'Sports', athletics:'Sports', language:'Language Arts', 'language arts':'Language Arts', literacy:'Language Arts', word:'Language Arts',
    logic:'Logic', puzzle:'Logic', puzzles:'Logic', reasoning:'Logic',
    'critical thinking':'Critical Thinking', critical:'Critical Thinking', strategy:'Critical Thinking', action:'Critical Thinking',
    space:'Space', astronomy:'Space', cosmos:'Space', adventure:'Geography', racing:'Sports', sandbox:'Science',
    'art & creativity':'Creative Thinking', art:'Creative Thinking', creative:'Creative Thinking', creativity:'Creative Thinking',
    restaurant:'Math', 'life skills':'Critical Thinking', wellness:'Critical Thinking', safety:'Critical Thinking', typing:'Coding', learning:'Critical Thinking',
    'multiplayer (local)':'Critical Thinking', arcade:'Critical Thinking'
  };
  const clean = value => String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  const escapeKey = value => clean(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const randInt = (min, max, rng = Math.random) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = (array, rng = Math.random) => array[Math.floor(rng() * array.length)];
  function shuffle(values, rng = Math.random) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function normalizeAnswer(value) {
    return String(value ?? '').toLocaleLowerCase().trim()
      .replace(/[“”‘’]/g, "'").replace(/\s+/g, ' ')
      .replace(/\s*([=+*/])\s*/g, '$1').replace(/[!?.,;:]$/g, '');
  }
  function record(question, answer, distractors, hint, opts = {}) {
    return {
      id: opts.id || escapeKey(question), question, answer,
      distractors: [...new Set((distractors || []).map(String).filter(x => normalizeAnswer(x) !== normalizeAnswer(answer)))],
      hint: hint || 'Review the key idea and look for evidence.',
      statement: opts.statement || `The best answer to “${question}” is {answer}.`,
      cloze: opts.cloze || null, emoji: opts.emoji || '🔎',
      scenario: opts.scenario || null, explanation: opts.explanation || hint || 'Use the clue and explain why the answer fits.',
      accepted: Array.isArray(opts.accepted) ? opts.accepted : []
    };
  }

  const BANKS = {
    Science: [
      record('Which planet is commonly called the Red Planet?','Mars',['Venus','Jupiter','Mercury','Neptune'],'Its rusty-looking surface gives it this nickname.',{statement:'The planet called the Red Planet is {answer}.',emoji:'🔴',cloze:'The planet called the Red Planet is _____.',scenario:'A learner sees a reddish planet in a solar-system model. Which planet should they label?'}),
      record('Which gas do plants take in for photosynthesis?','Carbon dioxide',['Oxygen','Helium','Hydrogen','Neon'],'Plants use this gas with water and light.',{statement:'For photosynthesis, plants take in {answer}.',emoji:'🌿',cloze:'For photosynthesis, plants take in _____.',scenario:'A class is modeling photosynthesis and needs to label the gas entering a leaf.'}),
      record('What is the center of an atom called?','Nucleus',['Cell wall','Membrane','Orbit','Molecule'],'It contains protons and usually neutrons.',{statement:'The center of an atom is its {answer}.',emoji:'⚛️',cloze:'The center of an atom is its _____.',scenario:'A student draws an atom and labels its central region. Which term belongs there?'}),
      record('What force pulls objects toward Earth?','Gravity',['Friction','Magnetism','Buoyancy','Static electricity'],'It keeps objects on the ground.',{statement:'The force that pulls objects toward Earth is {answer}.',emoji:'🍎',scenario:'An apple falls from a tree. Which force best explains its downward motion?'}),
      record('At what Celsius temperature does pure water freeze near standard pressure?','0°C',['10°C','32°C','100°C','-10°C'],'This is the familiar freezing point on the Celsius scale.',{statement:'Pure water freezes at about {answer} on the Celsius scale.',emoji:'🧊',scenario:'A weather station records a temperature right at the typical freezing point of pure water.'}),
      record('Which animal is a mammal?','Dolphin',['Shark','Trout','Octopus','Clownfish'],'Mammals breathe air and nurse their young.',{statement:'A {answer} is a mammal.',emoji:'🐬'}),
      record('What do we call liquid water changing into water vapor?','Evaporation',['Condensation','Freezing','Melting','Erosion'],'Heat can help this change happen.',{statement:'Liquid water changing into water vapor is {answer}.',emoji:'☀️'}),
      record('Which tool measures air temperature?','Thermometer',['Barometer','Compass','Anemometer','Rain gauge'],'It reports degrees.',{statement:'A tool that measures air temperature is a {answer}.',emoji:'🌡️'}),
      record('What is the main source of energy for Earth’s surface systems?','The Sun',['The Moon','Earth’s shadow','The North Star','A lighthouse'],'Light and heat arrive from our star.',{statement:'The main energy source for many Earth surface systems is {answer}.',emoji:'☀️'}),
      record('What is biodiversity?','The variety of living things',['The age of rocks','The speed of wind','A single species only','The amount of salt in water'],'Think about how many different kinds of life are present.',{statement:'The variety of living things in an area is called {answer}.',emoji:'🦋'}),
      record('Which part of a plant usually absorbs water from soil?','Roots',['Petals','Fruit skin','Pollen','Thorns'],'They extend into the ground.',{statement:'The plant part that usually absorbs water from soil is {answer}.',emoji:'🌱'}),
      record('Which state of matter has a fixed volume but takes the shape of its container?','Liquid',['Solid','Gas','Vacuum','Plasma only'],'Water in a cup is an example.',{statement:'A state of matter with fixed volume but container shape is a {answer}.',emoji:'💧'})
    ],
    Coding: [
      record('What is a loop used for in programming?','Repeating instructions',['Changing a monitor’s size','Deleting the keyboard','Only saving an image','Turning code into paper'],'Loops repeat steps without rewriting them.',{statement:'In programming, a loop is used for {answer}.',emoji:'🔁',cloze:'A loop repeats _____.',scenario:'A robot must take ten identical steps. Which programming structure avoids writing the command ten times?'}),
      record('What does a variable store?','A value a program can use',['Only a background color','A physical keyboard','A web browser tab','A power cable'],'Think of a named container for information.',{statement:'A variable stores {answer}.',emoji:'📦'}),
      record('What does a conditional check?','Whether a condition is true or false',['The color of a wire','The size of a monitor only','The weather outside automatically','A song’s volume only'],'An if statement uses a decision.',{statement:'A conditional checks {answer}.',emoji:'🔀'}),
      record('Which two digits are used in binary?','0 and 1',['1 and 2','2 and 3','0 through 9','A and B'],'Binary is base two.',{statement:'Binary uses the digits {answer}.',emoji:'💻'}),
      record('What does debugging mean?','Finding and fixing errors',['Adding errors intentionally','Deleting all tests','Changing a title only','Turning off the computer'],'Developers debug when something does not work as intended.',{statement:'Debugging means {answer}.',emoji:'🐞'}),
      record('What is a function in code?','A reusable block of instructions',['A map symbol','A monitor cable','A random picture only','A spreadsheet cell color'],'It can be called when needed.',{statement:'A function is {answer}.',emoji:'🧩'}),
      record('Which HTML element is normally used for the main page heading?','<h1>',['<footer>','<small>','<meta>','<aside>'],'The number one signals the top-level heading.',{statement:'The usual top-level HTML heading element is {answer}.',emoji:'🏷️'}),
      record('What does CSS primarily control on a webpage?','Presentation and styling',['Database passwords','The physical screen hardware','Internet routing','Battery chemistry'],'Color, spacing, and layout are examples.',{statement:'CSS primarily controls {answer} on a webpage.',emoji:'🎨'}),
      record('Which type of JavaScript value is either true or false?','Boolean',['String','Array','Image','Loop'],'It is named after a kind of logic value.',{statement:'A JavaScript value type with true/false values is {answer}.',emoji:'✅'}),
      record('What is an algorithm?','A sequence of steps for solving a problem',['A computer fan','A type of monitor','A color palette','A random file name'],'It describes the steps for a task.',{statement:'A sequence of steps used to solve a problem is an {answer}.',emoji:'🧭'}),
      record('What does an array commonly hold?','An ordered collection of values',['Only one CSS selector','A keyboard key','A physical battery','A single pixel only'],'Values are kept in positions.',{statement:'An array commonly holds {answer}.',emoji:'🗂️'}),
      record('What does HTML provide to a webpage?','Structure and content',['Electric current','Only animations','A device’s operating system','The weather forecast'],'It describes page elements.',{statement:'HTML provides a webpage with {answer}.',emoji:'🌐'})
    ],
    Geography: [
      record('Which ocean is the largest by area?','Pacific Ocean',['Atlantic Ocean','Indian Ocean','Arctic Ocean','Southern Ocean'],'It lies between Asia/Oceania and the Americas.',{statement:'The largest ocean by area is the {answer}.',emoji:'🌊'}),
      record('Which imaginary line is at 0° latitude?','Equator',['Prime Meridian','Arctic Circle','Tropic of Capricorn','International Date Line'],'It separates the Northern and Southern Hemispheres.',{statement:'The imaginary line at 0° latitude is the {answer}.',emoji:'🌐'}),
      record('On which continent is the Sahara Desert?','Africa',['Asia','Europe','South America','Australia'],'It is a vast desert in northern Africa.',{statement:'The Sahara Desert is on {answer}.',emoji:'🏜️'}),
      record('What is the capital of Japan?','Tokyo',['Seoul','Beijing','Kyoto','Bangkok'],'It is a major city on Honshu.',{statement:'The capital of Japan is {answer}.',emoji:'🗾'}),
      record('Which mountain range includes Mount Everest?','The Himalayas',['The Andes','The Alps','The Rockies','The Appalachians'],'This range lies in Asia.',{statement:'Mount Everest is part of {answer}.',emoji:'🏔️'}),
      record('A peninsula is surrounded by water on how many sides?','Three',['One','Two','Four','No sides'],'It remains connected to a larger landmass.',{statement:'A peninsula is usually surrounded by water on {answer} sides.',emoji:'🗺️'}),
      record('Which imaginary line is at 0° longitude?','Prime Meridian',['Equator','Tropic of Cancer','Arctic Circle','Date Line'],'It is used as the reference for longitude.',{statement:'The reference line at 0° longitude is the {answer}.',emoji:'🧭'}),
      record('Which continent contains the Amazon rainforest?','South America',['Europe','Antarctica','Australia','North America'],'Most of this rainforest lies in the Amazon basin.',{statement:'The Amazon rainforest is in {answer}.',emoji:'🌳'}),
      record('Which instrument helps indicate direction?','Compass',['Thermometer','Barometer','Microscope','Scale ruler'],'Its needle aligns with Earth’s magnetic field.',{statement:'An instrument used to indicate direction is a {answer}.',emoji:'🧭'}),
      record('What does a map scale help estimate?','Real-world distance',['A person’s age','Sound pitch','Rainfall chemistry','Language difficulty'],'It connects map distance with ground distance.',{statement:'A map scale helps estimate {answer}.',emoji:'📏'}),
      record('Which continent is the smallest by land area?','Australia',['Africa','Asia','North America','Antarctica'],'It is also a country and a continent in common school geography.',{statement:'The smallest continent by land area is {answer}.',emoji:'🌏'}),
      record('What is an archipelago?','A group or chain of islands',['A high mountain pass','A deep inland lake','A desert wind','A single river source'],'Indonesia and the Philippines contain many islands.',{statement:'A group or chain of islands is an {answer}.',emoji:'🏝️'})
    ],
    History: [
      record('In which year did Apollo 11 first land humans on the Moon?','1969',['1959','1975','1981','1990'],'Neil Armstrong and Buzz Aldrin walked on the Moon during this mission.',{statement:'Apollo 11 landed humans on the Moon in {answer}.',emoji:'🌕'}),
      record('The pyramids at Giza are associated with which ancient civilization?','Ancient Egypt',['Ancient Rome','The Inca Empire','Ming China','The Vikings'],'They were built in northeastern Africa.',{statement:'The Giza pyramids are associated with {answer}.',emoji:'🔺'}),
      record('The Magna Carta was agreed in England in which year?','1215',['1066','1492','1776','1914'],'It is a famous medieval charter.',{statement:'The Magna Carta dates to {answer}.',emoji:'📜'}),
      record('The Renaissance began in which part of Europe?','Italy',['Iceland','Ireland','Norway','Portugal only'],'Florence is one of the cities associated with its early development.',{statement:'The Renaissance began in {answer}, before spreading widely.',emoji:'🎨'}),
      record('Which ancient civilization held the original Olympic Games?','Ancient Greece',['Ancient Egypt','The Maya','The Vikings','The Han Dynasty'],'The games were held at Olympia.',{statement:'The original Olympic Games are associated with {answer}.',emoji:'🏺'}),
      record('In which year did World War II end?','1945',['1918','1933','1955','1969'],'The war ended in Europe and Asia during this year.',{statement:'World War II ended in {answer}.',emoji:'🕊️'}),
      record('The first practical printing press in Europe is associated with whom?','Johannes Gutenberg',['Isaac Newton','Galileo Galilei','Charles Darwin','Ada Lovelace'],'His work helped spread printed books more widely.',{statement:'The European movable-type printing press is associated with {answer}.',emoji:'📚'}),
      record('Which civilization built Machu Picchu?','The Inca',['The Romans','The Phoenicians','The Vikings','The ancient Greeks'],'The site is in the Andes of Peru.',{statement:'Machu Picchu was built by {answer}.',emoji:'⛰️'}),
      record('Harriet Tubman is remembered in U.S. history for helping people escape slavery through what network?','The Underground Railroad',['The Silk Road','The Pony Express only','The Oregon Trail survey','The transcontinental telegraph'],'It was a network of routes and helpers, not a literal railroad.',{statement:'Harriet Tubman helped people escape slavery through {answer}.',emoji:'🕯️'}),
      record('Which empire built many roads across the Mediterranean region in antiquity?','The Roman Empire',['The Aztec Empire','The Mongol Empire only','The Inca only','The Mali Empire'],'Its road network supported travel and administration.',{statement:'Many ancient Mediterranean roads were built by {answer}.',emoji:'🛤️'}),
      record('The Declaration of Independence in the United States was adopted in which year?','1776',['1492','1620','1812','1865'],'It was adopted on July 4.',{statement:'The U.S. Declaration of Independence was adopted in {answer}.',emoji:'📄'}),
      record('Which civilization is known for developing cuneiform writing in Mesopotamia?','Sumerians',['Vikings','Incas','Māori','Aztecs'],'The writing used wedge-shaped marks.',{statement:'Cuneiform writing is strongly associated with the {answer}.',emoji:'🪨'})
    ],
    'Music Theory': [
      record('In common 4/4 time, how many quarter-note beats are in one bar?','4',['2','3','6','8'],'The top number tells how many beats fit in each bar for common 4/4 counting.',{statement:'A bar of common 4/4 time contains {answer} quarter-note beats.',emoji:'🎼'}),
      record('What does tempo describe?','How fast or slow music goes',['How tall an instrument is','The color of a note','The age of a singer','The shape of a stage'],'Tempo is often measured in beats per minute.',{statement:'Tempo describes {answer}.',emoji:'⏱️'}),
      record('What does pitch describe?','How high or low a sound is',['How long a concert lasts','The size of a speaker only','The color of a page','The cost of an instrument'],'Pitch is different from loudness.',{statement:'Pitch describes {answer}.',emoji:'🎵'}),
      record('Which family does a trumpet belong to?','Brass',['Strings','Woodwind','Percussion','Keyboard'],'Its sound is made with buzzing lips into a mouthpiece.',{statement:'A trumpet belongs to the {answer} family.',emoji:'🎺'}),
      record('What does a crescendo mean?','Gradually getting louder',['Gradually getting softer','Stopping immediately','Playing without a beat','Repeating one note only'],'It is a dynamic instruction.',{statement:'A crescendo means {answer}.',emoji:'📈'}),
      record('Which instrument is a percussion instrument?','Drum',['Flute','Violin','Clarinet','Cello'],'It is usually struck to produce sound.',{statement:'A drum is a {answer} instrument.',emoji:'🥁'}),
      record('What is a melody?','A sequence of notes forming a musical idea',['A list of cables','A soundproof room','A note’s printed color','A metronome battery'],'It is often the part people can hum.',{statement:'A sequence of notes forming a musical idea is a {answer}.',emoji:'🎶'}),
      record('What does a rest mean in written music?','A period of silence',['A very loud note','A key change always','The end of a song only','A type of string'],'Rests have durations just like notes.',{statement:'A rest in music indicates {answer}.',emoji:'🤫'}),
      record('How many semitones are in an octave in common Western equal temperament?','12',['7','8','10','24'],'Count the steps from a note to the next note of the same name.',{statement:'An octave contains {answer} semitones in common Western equal temperament.',emoji:'🎹'}),
      record('Which marking usually means to play softly?','Piano (p)',['Forte (f)','Crescendo','Accent always','Accelerando'],'The term comes from Italian.',{statement:'The dynamic marking for soft playing is {answer}.',emoji:'🎻'}),
      record('What is harmony in music?','Notes sounding together to support or accompany a melody',['A music stand','A drumstick grip','Only the speed of a song','The title on a score'],'Chords are one common way to create it.',{statement:'Notes sounding together to support a melody create {answer}.',emoji:'🎹'}),
      record('Which symbol raises a note by one semitone?','Sharp (♯)',['Flat (♭)','Natural (♮)','Rest','Fermata'],'It changes the pitch upward in standard notation.',{statement:'The symbol that raises a note by one semitone is a {answer}.',emoji:'♯'})
    ],
    Sports: [
      record('How many players from one team are on the field in standard outdoor soccer?','11',['5','7','9','12'],'This count includes the goalkeeper.',{statement:'A standard outdoor soccer team fields {answer} players.',emoji:'⚽'}),
      record('How many points is a regular basketball free throw worth?','1',['2','3','4','5'],'A free throw is taken from the line.',{statement:'A regular basketball free throw is worth {answer} point.',emoji:'🏀'}),
      record('Which sport commonly uses a racket and a net?','Tennis',['Soccer','Swimming','Boxing','Gymnastics'],'Players hit a ball over the net.',{statement:'A sport played with a racket over a net is {answer}.',emoji:'🎾'}),
      record('What is a useful purpose of warming up before sport?','Preparing the body gradually for activity',['Guaranteeing injuries never happen','Replacing sleep','Removing the need for water','Making rules unnecessary'],'A warm-up builds activity gradually.',{statement:'A warm-up helps with {answer}.',emoji:'🏃'}),
      record('In soccer, what is the goalkeeper’s main role?','Protecting the goal',['Taking every throw-in','Refereeing the match','Coaching both teams','Changing the field lines'],'The goalkeeper may use hands in their own penalty area under the rules.',{statement:'A soccer goalkeeper’s main role is {answer}.',emoji:'🧤'}),
      record('How many points is a basketball shot from beyond the three-point arc worth?','3',['1','2','4','5'],'Its name gives away the value.',{statement:'A made shot from beyond the basketball arc is worth {answer} points.',emoji:'🏀'}),
      record('What does fair play mean?','Respecting rules, opponents, and teammates',['Changing the score secretly','Ignoring safety','Winning at any cost','Mocking mistakes'],'Sportsmanship matters whether winning or losing.',{statement:'Respecting rules and opponents is part of {answer}.',emoji:'🤝'}),
      record('Which piece of equipment protects a cyclist’s head?','Helmet',['Knee-high socks only','Wristband','Scarf','Water bottle'],'It should fit properly and be fastened.',{statement:'A cyclist protects their head with a {answer}.',emoji:'🚴'}),
      record('What does a referee usually do?','Enforces the rules of the game',['Sells every ticket','Changes the weather','Chooses all team names','Builds the stadium'],'Officials help keep play fair.',{statement:'A referee {answer}.',emoji:'🟨'}),
      record('In baseball, how many strikes normally make a strikeout?','3',['1','2','4','5'],'A foul ball can have special counting rules, but the usual strikeout count is three.',{statement:'A strikeout normally occurs after {answer} strikes.',emoji:'⚾'}),
      record('Which sport is associated with a puck?','Ice hockey',['Volleyball','Tennis','Rugby','Cricket'],'Players use sticks on ice.',{statement:'A sport commonly played with a puck is {answer}.',emoji:'🏒'}),
      record('What should an athlete do if they feel dizzy during exercise?','Stop and tell a responsible adult or coach',['Keep pushing without telling anyone','Hide it','Ignore it and sprint','Skip drinking water forever'],'Safety is more important than finishing a drill.',{statement:'If dizzy during exercise, an athlete should {answer}.',emoji:'🛑'})
    ],
    'Language Arts': [
      record('Which word is closest in meaning to “rapid”?','Swift',['Quiet','Distant','Fragile','Careless'],'Both describe something fast.',{statement:'A synonym for “rapid” is {answer}.',emoji:'💨'}),
      record('Which word is a noun?','Happiness',['Run','Blue','Quickly','Bright'],'It names a feeling or idea.',{statement:'The word {answer} is a noun.',emoji:'📚'}),
      record('Which punctuation mark usually ends a direct question?','Question mark (?)',['Comma (,)','Period (.)','Colon (:)','Semicolon (;)'],'It looks like a curved mark with a dot.',{statement:'A direct question usually ends with a {answer}.',emoji:'❓'}),
      record('What is a metaphor?','A comparison that describes one thing as another',['A map scale','A division symbol','A weather instrument','A list of chapter titles'],'It makes an imaginative comparison without “like” or “as.”',{statement:'A comparison that describes one thing as another is a {answer}.',emoji:'✍️'}),
      record('Which word is a verb?','Investigate',['Thoughtful','Quickly','Blue','Happiness'],'It describes an action.',{statement:'The word {answer} is a verb.',emoji:'🔎'}),
      record('What is a stanza?','A group of lines in a poem',['A kind of map','A type of sentence ending','A number in a fraction','A chapter title only'],'Poems are often organized into these groups.',{statement:'A group of lines in a poem is a {answer}.',emoji:'📝'}),
      record('Which prefix usually means “before”?','pre-',['re-','un-','mis-','post-'],'It appears in words like preview.',{statement:'The prefix meaning “before” is {answer}.',emoji:'⏮️'}),
      record('What is the main idea of a passage?','Its central point',['A small detail only','The author’s middle initial','The last punctuation mark','The page color'],'Supporting details usually explain it.',{statement:'The central point of a passage is its {answer}.',emoji:'📖'}),
      record('Which sentence is punctuated as a direct question?','Where are you going?',['Where are you going.','Where are you going,','Where are you going:','Where are you going;'],'Look at the final punctuation.',{statement:'The correctly punctuated direct question is {answer}.',emoji:'❔'}),
      record('What is alliteration?','Repeating initial consonant sounds in nearby words',['Counting syllables only','Writing without verbs','Using only numbers','Repeating a paragraph word for word'],'“Busy bees buzz” is an example.',{statement:'Repeating initial consonant sounds is {answer}.',emoji:'🐝'}),
      record('What does “infer” mean when reading?','Draw a conclusion from clues and prior knowledge',['Copy every sentence','Skip all evidence','Count the pages','Change the font'],'Readers combine evidence with what they know.',{statement:'To draw a conclusion from clues is to {answer}.',emoji:'🧠'}),
      record('Which word is an antonym of “scarce”?','Plentiful',['Rare','Limited','Missing','Tiny'],'It means there is plenty of something.',{statement:'An antonym of “scarce” is {answer}.',emoji:'🌾'})
    ],
    Logic: [
      record('What comes next: 2, 4, 8, 16, …?','32',['18','24','30','34'],'Each number doubles.',{statement:'The next value in 2, 4, 8, 16 is {answer}.',emoji:'🔢'}),
      record('All Bloops are Razzies. All Razzies are Lazzies. What must be true of Bloops?','They are Lazzies',['They are not Lazzies','They are circles','They are only Razzies','There is not enough information'],'Follow the two statements in order.',{statement:'From the stated rules, Bloops must be {answer}.',emoji:'🔗'}),
      record('Which item does not belong with triangle, square, and circle?','Carrot',['Triangle','Square','Circle','Rectangle'],'Three are geometric shapes; one is a vegetable.',{statement:'The item that does not belong with triangle, square, and circle is {answer}.',emoji:'🔺'}),
      record('If today is Tuesday, what day is three days later?','Friday',['Wednesday','Thursday','Saturday','Sunday'],'Count Wednesday as one day later.',{statement:'Three days after Tuesday is {answer}.',emoji:'📅'}),
      record('A code shifts each letter forward one: CAT becomes DBU. What does DOG become?','EPH',['CNG','EOG','FPI','DPI'],'Move D to E, O to P, and G to H.',{statement:'With each letter shifted forward one, DOG becomes {answer}.',emoji:'🔐'}),
      record('Which number is odd?','31',['18','24','42','56'],'Odd numbers are not divisible by two.',{statement:'The odd number in this set is {answer}.',emoji:'🧮'}),
      record('A 3 by 3 grid has how many equal cells?','9',['6','8','12','18'],'Multiply rows by columns.',{statement:'A 3 by 3 grid contains {answer} cells.',emoji:'▦'}),
      record('A good first move in a logic puzzle is to…','Write down the fixed clues',['Guess randomly','Ignore the constraints','Change the rules','Hide the evidence'],'Known facts limit possible answers.',{statement:'A useful first move in a logic puzzle is to {answer}.',emoji:'🧩'}),
      record('If a rule says every blue tile touches a yellow tile, what should you inspect?','Neighbor positions',['Alphabetical names','Music tempo','The score color','The title length'],'Touching is a spatial relationship.',{statement:'To check a tile-adjacency rule, inspect {answer}.',emoji:'🟦'}),
      record('A statement and its opposite cannot both be true at the same time in classical logic. What principle is this?','Non-contradiction',['Gravity','Color mixing','Random choice','Rhythm'],'The name includes the word “contradiction.”',{statement:'The principle that a statement and its opposite cannot both be true is {answer}.',emoji:'⚖️'}),
      record('What is the next even number after 18?','20',['19','21','22','24'],'Even integers increase by two.',{statement:'The next even number after 18 is {answer}.',emoji:'2️⃣'}),
      record('If every tulip in a puzzle is a flower, and this object is a tulip, what must it be?','A flower',['A rock','A planet','A number','A tool'],'Apply the rule to the specific object.',{statement:'If every tulip is a flower, a tulip must be {answer}.',emoji:'🌷'})
    ],
    'Critical Thinking': [
      record('What is usually the strongest way to support a factual claim?','Relevant evidence from reliable sources',['An anonymous rumor','A guess','A popular comment alone','A headline without context'],'Check where the claim came from and how it was supported.',{statement:'A factual claim is best supported by {answer}.',emoji:'🔍'}),
      record('Two things happen together. Does that alone prove one caused the other?','No',['Yes, always','Only if one is colorful','Only on weekends','It proves both are identical'],'Correlation by itself is not causation.',{statement:'Correlation alone proves causation: {answer}.',emoji:'🔗'}),
      record('What should you do when two sources disagree?','Compare their evidence, dates, and expertise',['Choose the louder headline','Believe the first result automatically','Ignore all evidence','Share both without reading'],'Investigate the sources before deciding.',{statement:'When sources disagree, you should {answer}.',emoji:'🧭'}),
      record('What is a useful way to reduce a large task’s complexity?','Break it into smaller steps',['Do everything at once','Remove the goal','Avoid planning','Make each step secret'],'Smaller tasks are easier to review.',{statement:'A useful way to manage a large task is to {answer}.',emoji:'🪜'}),
      record('What is a conflict of interest?','A personal interest that could affect impartial judgment',['A type of map','A musical interval','A fact checked by many sources','A neutral measurement'],'It can matter when evaluating recommendations.',{statement:'A personal interest that could affect impartial judgment is a {answer}.',emoji:'⚖️'}),
      record('Why is it useful to consider an alternative explanation?','It helps test whether the first explanation is strong',['It guarantees the first idea is wrong','It removes the need for facts','It makes a claim impossible to check','It always changes the topic'],'Other explanations can reveal missing evidence.',{statement:'Considering alternatives helps {answer}.',emoji:'💭'}),
      record('What is a primary source in research?','A direct record or firsthand evidence from the period or event',['A summary that always quotes no sources','A guess from a stranger','A fictional advertisement','A copied rumor'],'Examples include original letters, data, or eyewitness records.',{statement:'A direct record or firsthand evidence is a {answer}.',emoji:'📜'}),
      record('Which question helps evaluate an online claim?','What evidence supports it?',['How many emojis are in it?','Is the title exciting?','Did it appear in a chat?','Can I share it quickly?'],'Evidence matters more than presentation.',{statement:'A useful question when checking a claim is {answer}.',emoji:'🕵️'}),
      record('What is confirmation bias?','Favoring information that supports existing beliefs',['Checking two different sources','Changing a plan after new evidence','Estimating a distance','Testing a hypothesis fairly'],'Look for evidence that challenges your own view, too.',{statement:'Favoring information that supports existing beliefs is {answer}.',emoji:'🪞'}),
      record('If a survey asks only one friend group, what is a likely concern?','The sample may not represent everyone',['The sample must be perfect','The result is always false','The group size changes gravity','The question becomes a map'],'A sample should match the population being studied.',{statement:'A survey of only one narrow group may have {answer}.',emoji:'📊'}),
      record('Why should a plan be updated when new reliable evidence appears?','The new evidence may change the best decision',['Plans must never change','Evidence is always irrelevant','It guarantees a win','It hides the original goal'],'Good reasoning adapts to information.',{statement:'A plan may need updating because {answer}.',emoji:'🔄'}),
      record('What is a reasonable response to an unknown claim that sounds alarming?','Pause and verify it with reliable sources',['Forward it immediately','Assume it is true','Add more dramatic details','Ignore every trusted source'],'Urgency can be used to push people into sharing misinformation.',{statement:'When an alarming claim is unverified, you should {answer}.',emoji:'⏸️'})
    ],
    Technology: [
      record('What does RAM usually provide to a computer?','Temporary working memory',['Permanent printing ink','A wireless password only','The screen’s glass','A cooling fan blade'],'It stores data that active programs are using.',{statement:'RAM provides {answer} to a computer.',emoji:'🧠'}),
      record('What does a CPU primarily do?','Executes program instructions',['Stores water','Prints paper automatically','Measures room temperature','Changes a keyboard layout only'],'It is often called the processor.',{statement:'A CPU primarily {answer}.',emoji:'💻'}),
      record('What does HTTPS help provide for web connections?','Encryption in transit',['A guarantee every website is honest','Unlimited storage','A faster processor','A virus-free device forever'],'HTTPS protects data exchanged with the server, but it does not prove content is trustworthy.',{statement:'HTTPS helps provide {answer} for web connections.',emoji:'🔒'}),
      record('What is phishing?','A deceptive attempt to steal information',['A screen brightness setting','A backup type only','A computer fan','A programming loop'],'It often arrives through fake messages or websites.',{statement:'A deceptive attempt to steal information is {answer}.',emoji:'🎣'}),
      record('What is a backup?','A separate copy of data for recovery',['A type of keyboard','A screen filter','A CPU core','A web design color'],'It helps restore information after loss.',{statement:'A separate copy of data for recovery is a {answer}.',emoji:'💾'}),
      record('Why install software updates from trusted sources?','They can fix bugs and security weaknesses',['They always remove all risks','They make passwords public','They guarantee every app is perfect','They replace backups'],'Updates can close known vulnerabilities.',{statement:'Trusted software updates can {answer}.',emoji:'⬆️'}),
      record('What does a URL identify?','The address of a resource on the web',['A computer’s weight','A music key','A CPU temperature only','A network cable color'],'It commonly starts with https:// or another scheme.',{statement:'A URL identifies {answer}.',emoji:'🔗'}),
      record('Which is a safer password habit?','Use a long, unique password for each important account',['Reuse one short password everywhere','Post it publicly','Use only your first name','Share it in an open chat'],'A password manager can help handle unique passwords.',{statement:'A safer password habit is to {answer}.',emoji:'🔑'}),
      record('What is two-factor authentication designed to add?','A second verification step',['A second public password copy','A louder speaker','A larger screen','A new browser theme'],'It adds another factor beyond the password.',{statement:'Two-factor authentication adds {answer}.',emoji:'🛡️'}),
      record('Which device commonly connects a computer to a Wi-Fi network?','Wireless network adapter',['A printer tray','A microphone stand','A paper clip','A monitor foot'],'It may be built into a laptop.',{statement:'A computer can connect to Wi-Fi using a {answer}.',emoji:'📶'}),
      record('What does open-source software mean?','Its source code is available under a license that allows inspection and often modification',['Its source code is always secret','It is always unsafe','It cannot be copied legally','It never needs updates'],'Specific permissions depend on the license.',{statement:'Open-source software makes its source code available under {answer}.',emoji:'🧑‍💻'}),
      record('What is cloud storage?','Storing data on remote servers accessed over a network',['Storing only in a pencil case','A weather cloud','A screen saver','A keyboard shortcut'],'Availability depends on account and network access.',{statement:'Storing data on remote networked servers is {answer}.',emoji:'☁️'})
    ],
    Space: [
      record('What kind of object is the Sun?','A star',['A planet','A moon','An asteroid','A comet'],'It produces energy through nuclear fusion.',{statement:'The Sun is {answer}.',emoji:'☀️'}),
      record('Which planet is the largest in our solar system?','Jupiter',['Earth','Mars','Venus','Mercury'],'It is a gas giant with many moons.',{statement:'The largest planet in our solar system is {answer}.',emoji:'🪐'}),
      record('What does a light-year measure?','Distance',['Time','Brightness only','Temperature','Mass'],'It is how far light travels in a year.',{statement:'A light-year is a unit of {answer}.',emoji:'✨'}),
      record('What keeps planets in orbit around the Sun?','Gravity',['Sound waves','Color','Wind on Earth','Ocean currents'],'Gravity provides the attraction between masses.',{statement:'The main force keeping planets in orbit is {answer}.',emoji:'🌍'}),
      record('What galaxy contains our solar system?','The Milky Way',['Andromeda only','Whirlpool only','Sombrero only','Orion Nebula'],'It is a barred spiral galaxy.',{statement:'Our solar system is in {answer}.',emoji:'🌌'}),
      record('Why does the Moon appear bright from Earth?','It reflects sunlight',['It is a star that makes its own light','It burns like fire','It reflects only city lights','It is made of glowing metal'],'Its phases depend on how much of its sunlit side we see.',{statement:'The Moon appears bright mainly because {answer}.',emoji:'🌙'}),
      record('Which planet is famous for its prominent ring system?','Saturn',['Mercury','Earth','Mars','Venus'],'Other giant planets also have rings, but these are especially visible.',{statement:'The planet famous for its prominent rings is {answer}.',emoji:'🪐'}),
      record('What is an asteroid?','A small rocky or metallic body orbiting the Sun',['A type of star','A living plant','A cloud on Earth','A musical note'],'Many are found in the asteroid belt.',{statement:'A small rocky or metallic body orbiting the Sun is an {answer}.',emoji:'☄️'}),
      record('What is a constellation?','A recognized pattern or region of stars in the sky',['A single planet','A type of telescope lens only','An ocean current','A moon crater only'],'Different cultures have described star patterns in different ways.',{statement:'A recognized pattern or region of stars is a {answer}.',emoji:'🌟'}),
      record('What is the name of the planet closest to the Sun?','Mercury',['Venus','Earth','Mars','Jupiter'],'It completes an orbit more quickly than any other planet.',{statement:'The planet closest to the Sun is {answer}.',emoji:'☀️'}),
      record('What is a black hole?','A region where gravity is so strong that light cannot escape from within the event horizon',['A hole in Earth’s crust','An empty planet','A dark cloud that blocks all radio','A moon with no sunlight'],'The event horizon marks the boundary around it.',{statement:'A region from which light cannot escape beyond its event horizon is a {answer}.',emoji:'⚫'}),
      record('What causes the Moon’s phases as seen from Earth?','The changing view of its sunlit half as it orbits Earth',['Earth’s shadow every single night','The Moon changing shape','Clouds changing its surface','The Sun turning off'], 'The Moon is always roughly half illuminated by the Sun.',{statement:'The Moon’s phases are caused by {answer}.',emoji:'🌗'})
    ],
    'Creative Thinking': [
      record('What are complementary colors on a traditional color wheel?','Colors opposite one another',['Colors with the same name','Only black and white','Colors that never appear together','Colors sorted by price'],'They often create strong visual contrast.',{statement:'Colors opposite each other on a color wheel are {answer}.',emoji:'🎨'}),
      record('What is a repeated visual design called?','A pattern',['A forecast','A fraction','A sound wave','A compass'],'Shapes, lines, and colors can repeat.',{statement:'A repeated visual design is a {answer}.',emoji:'🔷'}),
      record('What is a prototype?','An early model used to test an idea',['A final design that can never change','A weather report','A type of vowel','A musical rest'],'It helps creators learn before making a final version.',{statement:'An early model used to test an idea is a {answer}.',emoji:'🛠️'}),
      record('Which material is usually best for a quick paper prototype?','Paper and pencil',['Concrete and steel only','A live electrical wire','A glass window','A running engine'],'Early prototypes favor quick, low-cost changes.',{statement:'A quick paper prototype commonly uses {answer}.',emoji:'✏️'}),
      record('What does brainstorming encourage?','Generating many ideas before judging them',['Choosing the first idea only','Rejecting every suggestion immediately','Hiding all ideas','Avoiding collaboration'],'Ideas can be improved after they are collected.',{statement:'Brainstorming encourages {answer}.',emoji:'💡'}),
      record('What is negative space in visual design?','The area around and between objects',['The darkest paint only','A mistake in math','An empty audio track','A missing webpage link'],'It helps a composition breathe and guide attention.',{statement:'The area around and between objects is {answer}.',emoji:'🖼️'}),
      record('What makes constructive feedback most useful?','Specific observations and a practical next step',['Insults without details','A vague score only','Changing the goal secretly','Comparing people without context'],'It focuses on the work and how it can improve.',{statement:'Useful constructive feedback offers {answer}.',emoji:'🗣️'}),
      record('What is iteration in design?','Making and testing repeated improvements',['Never changing anything','Deleting all drafts','Copying without thinking','Finishing before testing'],'Each cycle uses what the last test taught you.',{statement:'Repeated cycles of making and improving are called {answer}.',emoji:'🔄'}),
      record('Which choice supports accessible visual design?','Strong text contrast and clear labels',['Relying on color alone','Tiny labels with no text','Fast flashing effects everywhere','Hiding keyboard focus'],'Accessibility helps more people use a design.',{statement:'A helpful accessible design choice is {answer}.',emoji:'♿'}),
      record('What is a storyboard useful for?','Planning scenes or steps in sequence',['Measuring temperature','Encrypting a password','Counting only pixels','Replacing all testing'],'It shows how an idea unfolds over time.',{statement:'Planning scenes or steps in sequence can use a {answer}.',emoji:'🎬'}),
      record('What does “constraints can inspire creativity” mean?','Limits can help focus design choices',['All limits always ruin a project','Every idea must be expensive','No planning is useful','There is only one possible solution'],'Working within a clear limit can spark a thoughtful solution.',{statement:'In design, constraints can sometimes {answer}.',emoji:'🌱'}),
      record('What is a mood board?','A collection of visual references that sets a project’s direction',['A weekly math test','A type of computer chip','A map of rivers only','A music file format'],'It may include colors, images, textures, and type samples.',{statement:'A collection of visual references for a project is a {answer}.',emoji:'🧶'})
    ]
  };

  // Logic has additional numeric/procedural items; Math is almost entirely generated from values.
  function numericQuestion(subject, difficulty, rng) {
    const level = DIFFICULTIES.indexOf(difficulty);
    const max = [10, 24, 80, 250, 900][Math.max(0, level)];
    const ops = level <= 1 ? ['+','−','×'] : ['+','−','×','÷','%'];
    const op = pick(ops, rng);
    let a, b, ans, q, statement, hint;
    if (op === '+') { a=randInt(2,max,rng); b=randInt(2,Math.max(3,Math.floor(max/2)),rng); ans=a+b; q=`What is ${a} + ${b}?`; statement=`${a} + ${b} = {answer}.`; hint='Add the two quantities.'; }
    else if (op === '−') { a=randInt(2,max,rng); b=randInt(1,a,rng); ans=a-b; q=`What is ${a} − ${b}?`; statement=`${a} − ${b} = {answer}.`; hint='Subtract the second number from the first.'; }
    else if (op === '×') { a=randInt(2,Math.min(level<2?12:35,max),rng); b=randInt(2,Math.min(level<2?12:35,max),rng); ans=a*b; q=`What is ${a} × ${b}?`; statement=`${a} × ${b} = {answer}.`; hint='Think of equal groups or multiplication facts.'; }
    else if (op === '÷') { a=randInt(2,Math.min(35,Math.max(3,Math.floor(max/2))),rng); b=randInt(2,Math.min(20,Math.max(3,Math.floor(max/4))),rng); ans=a*b; q=`What is ${a*b} ÷ ${a}?`; ans=b; statement=`${a*b} ÷ ${a} = {answer}.`; hint='Division can reverse multiplication.'; }
    else { a=randInt(2,Math.max(3,Math.floor(max/10)),rng); b=randInt(10,90,rng); ans=Math.round(a*b/100*100)/100; q=`What is ${b}% of ${a*100}?`; ans=Math.round((a*100)*b/100); statement=`${b}% of ${a*100} = {answer}.`; hint='Convert the percentage into a fraction out of 100.'; }
    const raw = [ans + randInt(1,Math.max(2,level+3),rng), ans - randInt(1,Math.max(2,level+4),rng), ans + randInt(3,Math.max(4,level+7),rng), ans * 2 + 1].filter(n=>Number.isFinite(n)&&n!==ans&&n>=0);
    const distractors = [...new Set(raw.map(String))];
    while (distractors.length < 5) { const n = Math.max(0, ans + randInt(-Math.max(9,level*10), Math.max(9,level*10),rng)); if(n!==ans&&!distractors.includes(String(n))) distractors.push(String(n)); }
    return record(q,String(ans),distractors,hint,{id:`math-${a}-${b}-${op}-${difficulty}`,statement,emoji:op==='×'?'✖️':'🔢',cloze:statement.replace('{answer}','_____')});
  }
  function logicQuestion(difficulty, rng) {
    const level=DIFFICULTIES.indexOf(difficulty);
    if (rng() < .55) {
      const start=randInt(1,24,rng), step=randInt(2,level<2?6:13,rng), mult=level>=3&&rng()<.4;
      const values=[start];
      for(let i=1;i<4;i++)values.push(mult?values[i-1]*2:values[i-1]+step);
      const ans=mult?values[3]*2:values[3]+step;
      return record(`Complete the pattern: ${values.join(', ')}, …`,String(ans),[String(ans+step),String(Math.max(0,ans-1)),String(ans+2*step),String(ans+1)],mult?'Each term doubles.':'Look for the constant amount added each time.',{statement:`The next number after ${values.join(', ')} is {answer}.`,emoji:'🔢',cloze:`Complete the sequence: ${values.join(', ')}, _____`});
    }
    const a=randInt(2,Math.max(4,level*8+4),rng), b=randInt(2,Math.max(5,level*7+5),rng), ans=a+b;
    return record(`A logic box adds ${a} and ${b}. What is the total?`,String(ans),[String(ans+1),String(Math.max(0,ans-2)),String(ans+3),String(a*b)],'Translate the rule into an operation.',{statement:`${a} plus ${b} equals {answer}.`,emoji:'🧩'});
  }
  function getDifficulty(value) {
    const found=DIFFICULTIES.find(x=>x.toLowerCase()===String(value||'').toLowerCase());
    return found || DIFFICULTIES[randInt(0,DIFFICULTIES.length-1)];
  }
  function resolveSubject(input) {
    const raw=String(input??'').trim();
    if (SUBJECTS.includes(raw)) return raw;
    return aliasMap[clean(raw)] || aliasMap[clean(raw).replace(/&/g,'and')] || 'Critical Thinking';
  }
  function subjectForGame(id, category) {
    const map = {
      math:'Math',fraction:'Math',money:'Math',science:'Science',weather:'Science',animals:'Science',ocean:'Science',eco:'Science',
      code:'Coding',geo:'Geography',history:'History',musicquiz:'Music Theory',sportsquiz:'Sports',word:'Language Arts',pattern:'Logic',
      digital:'Technology',space:'Space',art:'Creative Thinking',wellness:'Critical Thinking',safety:'Critical Thinking',trivia:'Critical Thinking'
    };
    return map[String(id||'').toLowerCase()] || resolveSubject(category || 'Critical Thinking');
  }
  function buildQuestion(subject, difficulty, types, rng, forcedFact, phraseIndex) {
    let fact=forcedFact;
    if (!fact) {
      if (subject==='Math') fact=numericQuestion(subject,difficulty,rng);
      else if (subject==='Logic' && rng()<.6) fact=logicQuestion(difficulty,rng);
      else {
        const bank=BANKS[subject] || BANKS['Critical Thinking'];
        fact=bank[randInt(0,bank.length-1,rng)];
      }
    }
    const mode=types ? pick(types,rng) : pick(TYPE_BY_DIFFICULTY[difficulty] || TYPE_BY_DIFFICULTY.Medium,rng);
    const phrase=PHRASES[phraseIndex===undefined?randInt(0,PHRASES.length-1,rng):phraseIndex] || '';
    const distractors=(fact.distractors||[]).filter(x=>normalizeAnswer(x)!==normalizeAnswer(fact.answer));
    const options=()=>shuffle([fact.answer,...shuffle(distractors,rng).slice(0,3)],rng);
    let q=phrase+fact.question, ans=fact.answer, opts=options();
    if (mode==='true-false') {
      const truth=rng()<.5;
      const candidate=truth?fact.answer:pick(distractors,rng);
      const claim=(fact.statement||`The answer to “${fact.question}” is {answer}.`).replace(/\{answer\}/g,candidate);
      q=`True or false: ${claim}`; ans=truth?'True':'False'; opts=shuffle(['True','False'],rng);
    } else if (mode==='fill-in-the-blank') {
      const claim=(fact.cloze || (fact.statement||`The answer to “${fact.question}” is {answer}.`).replace(/\{answer\}/g,'_____')).replace(/\{answer\}/g,'_____');
      q=`Fill in the blank: ${claim}`; opts=[];
    } else if (mode==='typing') {
      q=`Type your answer: ${fact.question}`; opts=[];
    } else if (mode==='matching') {
      q=`Match the clue to the concept: ${fact.hint} Which answer fits?`;
    } else if (mode==='visual-identification') {
      q=`Visual clue ${fact.emoji||'🔎'}: ${fact.question}`;
    } else if (mode==='puzzle-solving') {
      q=`Puzzle card: ${fact.question}`;
    } else if (mode==='scenario-based') {
      q=`${fact.scenario || `Scenario: A learner is investigating this idea. ${fact.question}`} Choose the best answer.`;
    }
    const responseType = mode;
    const out={
      id:hash(`${subject}|${difficulty}|${responseType}|${q}|${ans}|${opts.join('|')}`),
      subject, difficulty, type:responseType, q, ans:String(ans), opts,
      hint:fact.hint, explanation:fact.explanation || fact.hint,
      factId:fact.id || hash(`${subject}|${fact.question}|${fact.answer}`),
      acceptedAnswers:[String(ans),...(fact.accepted||[])],
      source:'procedural-seed-bank', emoji:fact.emoji||'🌱'
    };
    return out;
  }
  function hash(value) {
    let h=2166136261;
    for (let i=0;i<value.length;i++) { h^=value.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0).toString(36);
  }
  function estimateVariantCapacity(subject) {
    const name=resolveSubject(subject);
    const conceptCount=name==='Math'?3000:name==='Logic'?BANKS.Logic.length+1200:(BANKS[name]||BANKS['Critical Thinking']).length;
    // Wording × response mode × difficulty × answer/distractor permutations × seed facts.
    return conceptCount * PHRASES.length * TYPES.length * DIFFICULTIES.length * 24;
  }
  let stats;
  function loadStats() {
    try {
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&saved.version===VERSION&&saved.subjects&&typeof saved.subjects==='object') return saved;
    } catch (_) {}
    return {version:VERSION,subjects:{},questionsAnswered:0,correct:0,updatedAt:0};
  }
  function persistStats() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(stats)); } catch (_) {} }
  stats=loadStats();
  function recordAnswer(question, correct) {
    if(!question || !SUBJECTS.includes(resolveSubject(question.subject))) return;
    const subject=resolveSubject(question.subject);
    if(!stats.subjects[subject]) stats.subjects[subject]={answered:0,correct:0,difficulties:{},types:{},lastAnsweredAt:0};
    const row=stats.subjects[subject]; row.answered++; row.correct+=correct?1:0;
    const difficulty=getDifficulty(question.difficulty); row.difficulties[difficulty]=(row.difficulties[difficulty]||0)+1;
    const type=TYPES.includes(question.type)?question.type:'multiple-choice'; row.types[type]=(row.types[type]||0)+1;
    row.lastAnsweredAt=Date.now(); stats.questionsAnswered++; stats.correct+=correct?1:0; stats.updatedAt=Date.now(); persistStats();
  }
  function createSession(subjectInput, options={}) {
    const subject=resolveSubject(subjectInput);
    const allowedTypes=Array.isArray(options.types)&&options.types.length?options.types.filter(x=>TYPES.includes(x)):null;
    const seen=new Set(), seenFacts=new Set();
    let generated=0, fallbacks=0;
    const rng=typeof options.rng==='function'?options.rng:Math.random;
    function next(difficultyInput) {
      const difficulty=getDifficulty(difficultyInput);
      for(let attempt=0;attempt<500;attempt++) {
        const q=buildQuestion(subject,difficulty,allowedTypes,rng);
        const signature=`${q.type}|${normalizeAnswer(q.q)}|${normalizeAnswer(q.ans)}|${q.opts.map(normalizeAnswer).join('|')}`;
        const distinctFact=!seenFacts.has(q.factId);
        const factBankSize=(BANKS[subject]||[]).length;
        if(!seen.has(signature) && (distinctFact || seenFacts.size>=Math.min(5,factBankSize))) {
          seen.add(signature); seenFacts.add(q.factId); generated++; q.sessionNumber=generated; return q;
        }
      }
      // Deterministic escape hatch: vary a prompt only if random selection exhausted a variant pocket.
      const q=buildQuestion(subject,difficulty,allowedTypes,rng);
      q.q=`Variant ${generated+1}: ${q.q}`; q.id=hash(`${q.id}|variant|${generated+1}`); q.sessionNumber=++generated; fallbacks++; seen.add(`${q.type}|${normalizeAnswer(q.q)}|${normalizeAnswer(q.ans)}`); return q;
    }
    return {subject,next,get size(){return generated;},get fallbackCount(){return fallbacks;},get seenCount(){return seen.size;}};
  }
  function generate(subject, options={}) { const session=createSession(subject,options); return session.next(options.difficulty); }
  function capacityReport() { return Object.fromEntries(SUBJECTS.map(subject=>[subject,{estimatedVariants:estimateVariantCapacity(subject),seedFacts:(BANKS[subject]||[]).length,procedural:subject==='Math'||subject==='Logic'}])); }
  window.CaydenQuestionEngine={version:VERSION,subjects:[...SUBJECTS],difficulties:[...DIFFICULTIES],types:[...TYPES],resolveSubject,subjectForGame,createSession,generate,estimateVariantCapacity,capacityReport,recordAnswer,getStats:()=>JSON.parse(JSON.stringify(stats)),normalizeAnswer,storageKey:STORAGE_KEY};
})();
