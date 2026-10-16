# CaydenProxy — Cayden World 1.0 Final Batch 🌸🌍🎮

**Made by Cayden Flowers.** CaydenProxy is a responsive garden-themed learning hub and browser arcade. Release 7.2.0 builds on the existing study tools, Garden Passport, Vibe Garden music player, Instrument Greenhouse, Arcade collection, World of Bloom, and Wingeria rather than replacing them.

## Ultimate Expansion at a glance

- **285 unique Games Hub entries across 15 canonical genres**: the combined and deduplicated list is balanced to exactly 19 entries each in Action, Adventure, Art & Creativity, Coding, Geography, Language Arts, Math, Music, Nature, Puzzle, Racing, Restaurant, Science, Sports, and Strategy. The legacy Arcade remains 146 entries (59 original + 87 expansion entries). The 120 added balancing entries are individually named and playable, but many use existing category question banks/shared quiz-round mechanics; they are not 120 wholly bespoke mini-game engines.
- **Wingeria Rush Remastered**: an original multi-day restaurant management game with arriving customers, table seating and queues, guest personalities/patience/favorites, special and VIP tickets, timing-based frying with undercooked/perfect/burnt outcomes, sauce and seasoning selection/mixing, sides, drinks/ice, optional desserts, correct-table delivery, star reviews, tips, combo streaks, power-ups, shift reports, unlocks, 18 permanent campaign upgrades and autosaved progress through Day 100+. Phase 05 adds Priority Ticket Rail, Flower Patio Expansion, Kitchen Herb Garden, Neighborhood Loyalty Bloom, and Calm Service Clock; each is connected to queue patience, tables, order accuracy, regular-customer tips, or guest patience calculations.
- **Dedicated mechanics** for selected titles including boss battle phases and shield power-ups, a lane-switch racer, a saved town-building grid, code debugging, local pass-and-play trivia/drawing, memory sequences, rhythm pads, sports timing, maze navigation, and mini Sudoku.
- **Shared educational game engine**: many catalog games use reusable category question banks with score, hearts, combos, XP and completion rewards. The catalog count does not mean every title is a separately coded AAA game.
- **Player HQ**: XP, levels, coins, gems, unlockable avatars, inventory/equipment, achievement badges including rare and secret discoveries, favorites, recently played games, game history, per-game statistics, personal bests, daily login reward, daily challenge, local weekly Garden Cup, and seasonal collectibles.
- **Discovery tools**: the shared Games Hub combines Learning Garden and Arcade catalogs; Continue Playing, dedicated Favorites, Your Go-To Games, Featured Picks, profile-aware Recommended for You, Personal Records, dynamic genre counts, cross-catalog search, and Surprise Me use a shared local profile. Every one of the 15 canonical genre filters reports 19 entries. Garden Passport includes Arcade profile stats, achievement badges, per-game sessions, supported local best scores, and a whitelisted full local backup/restore flow. The separate Arcade game surface keeps its specialized mechanics while syncing play history and favorites back to the Hub. Its original taxonomy still has 14 raw lanes; the Hub normalizes both catalogs into the 15-genre list above.
- **58 locally synthesized background loops** after all soundtrack modules load. Available moods include arcade, study/focus, relaxing, nature, and seasonal. Audio starts only after a user action.
- **Music Studio 3.0**: 30 modeled instrument voices across piano, guitar, drums, strings, woodwinds, brass and electronic families. The studio combines original, locally generated PCM WAV texture layers with real-time Web Audio synthesis; these are not recordings of real instruments. It includes velocity and envelope controls, reverb/delay/chorus, an eight-track mixer, stereo pan/mute/solo, a 32-step piano roll, six-lane beat sequencer, live visualizer, project import/export, local version snapshots, MIDI export (including percussion steps), and live WebM capture when supported by the browser.
- **World of Bloom**: eight connected regions, NPC lore, secret flower discovery, daily quests, weekly expeditions and a generated catalog of **1,440 collectible definitions** across 12 families, 12 regions and 10 rarities. Collectibles are catalog entries; they are not 1,440 custom hand-drawn assets.
- **Wingeria Rush Empire Mode**: franchise and city expansion, workforce roles, research tree, generated recipe combinations from 14 sauces × 12 seasonings × 12 sides, 300 decoration variants, food-critic reviews, advertisements, seasonal/weather ambience and simulated local competitor restaurants/cook-offs. Empire outcomes are local campaign simulations, not real online opponents or live financial services.
- **Floral personalization**: eight named flower-and-color palettes — Daisy Cream, Sunflower Gold, Cherry Blossom, Rose Garden, Lavender Haze, Bluebell Sky, Clover Meadow, and Iris Twilight. Palette choices are applied throughout the shared variable-based UI and saved locally on the device. High-contrast mode remains a separate override. Existing text-scale, compact-card, reduced-motion, accent-color, and decorative-flower settings remain available.
- **Petal Town: Bloom & Build**: a standalone game, separate from World of Bloom. Plant and water flowers on a 36-plot board, harvest coins and petals, level up, complete a daily harvest goal, rename the town, and place eight unlockable buildings. Progress is autosaved locally. A validated portable save-code lets a player export on one device and import on another. This is manual save transfer, not automatic cloud sync, real-time multiplayer, or an online account system. The site itself can be hosted and opened on desktop, tablet, or phone; actual public availability depends on where it is hosted.
- **Offline shell**: a service worker caches the main page, Petal Town, floral palette styles and logic, game modules, and all 30 local WAV texture assets when served from localhost or a compatible HTTPS origin. Saved player data uses local browser storage. Audio and offline cache availability depends on successful service-worker installation and browser storage limits.


## Phase 14: Cayden World 1.0 final-batch foundations

This update keeps the world **strictly 2D** and adds the requested foundations that can be built and tested without private service credentials:

- **13 progression-gated regions**: Bloomtown, Science Valley, Coding City, Melody Grove, Restaurant Row, Creative Coast, Logic Mountains, History Harbor, Sports Stadium District, Space Observatory, Elemental Forest, Crystal Caverns, and Innovation Island. Each has three interactive landmarks.
- **Human-style avatars** with selectable skin tone, hairstyle, hair color, shirt color, and pants color. Avatar appearance is saved locally and represented in multiplayer presence. A `CWAV1.` portable avatar code exports/imports the appearance only; it does not carry an account, password, or game progress.
- **NPC dialogue**: each region has a named guide with a greeting, region explanation, learning tip, and a shortcut to the quest board. Walk close and press E or tap Interact.
- **Private room codes**: leave the room-code field blank and connect to create a six-character code; share it with a friend. Friends enter that code and connect. Rooms are ephemeral, capped at 12 connected players, and only exist while at least one player remains connected. Players see each other only when they are in the same room and region.
- **Six home tiers**: Small House, House, Villa, Estate, Mansion, and Legendary Estate.
- **Deployment and validation**: `npm test` checks the avatar-code round trip, region model, NPC dialogue wiring, room-code UI, room isolation, and existing app modules. A live two-client server smoke test confirmed room creation, code joining, appearance synchronization, and isolation between separate rooms.

### Honest scope limits

This is the final **code batch for now**, not the completion of every item in the long-term expansion directive. Multiplayer accounts, email/password recovery, server-backed profiles, cloud-saved house/garden/lab data, real house visits, secure item trading, unrestricted chat/moderation, and synchronized game sessions are **not implemented yet**. The room server is in-memory; restart or all players leaving ends a room. Current avatar codes are portable appearance presets, not secure identities. Existing local game systems remain local unless their module already uses an online service.

See [`MAKE-IT-A-WEBSITE.md`](MAKE-IT-A-WEBSITE.md) for beginner-friendly deployment instructions and [`DEPLOYING-MULTIPLAYER.md`](DEPLOYING-MULTIPLAYER.md) for room testing details.

## Phase 13: Live 2D multiplayer rooms

The initial multiplayer phase added a same-origin WebSocket endpoint at `/ws/world`. Phase 14 adds six-character private room codes, human avatar appearance sync, and region NPC dialogue. Players see others in the same private room and region and can send preset emotes/quick phrases. Room state is ephemeral: disconnecting removes the player, and no online identity, private messages, or chat history is stored. The server limits the number of connected/joined players, message size, region IDs, avatar choices, movement update rate, and emotes. This is a multiplayer foundation for friendly co-op exploration, not an authoritative competitive game server; local XP, coins, inventory, and progression are not synchronized or trusted by this service.

### Run and test multiplayer

1. Install a current Node.js release and run `npm test`.
2. Run `npm start` and open the printed URL. Use the **Connect** button inside Cayden World.
3. To test with another device on the same trusted Wi-Fi, start the server with `HOST=0.0.0.0` (PowerShell: `$env:HOST='0.0.0.0'; npm start`) and open `http://YOUR-COMPUTER-LAN-IP:4173` from the other device. Allow the port through your local firewall only on a network you trust.
4. For internet multiplayer, deploy the Node server to a public host that supports persistent WebSocket upgrades, use HTTPS/WSS, and set an appropriate host/bind configuration. Do not expose a development server directly to the public internet without deployment hardening.

The local-save model remains in place. This release does **not** add accounts, cloud saves, persistent friends, unrestricted public text chat, moderation queues, or synchronized progression. Preset emotes are used instead of free-text chat to reduce abuse and privacy risks. Browser visual QA should still be done on real desktop and mobile devices before treating this as a public production game.

## Phase 12: Walkable Cayden World

Phase 12 adds a **playable top-down 2D world scene** embedded in the Cayden World RPG route. The scene includes keyboard movement (WASD/arrow keys), Shift sprint, Space jump feedback, E interact, M map, and I inventory. Mobile layout includes a pointer-driven virtual joystick plus Interact, Jump, Bag, and Map controls. The player can walk around Bloomtown and progression-gated versions of twelve additional regions, including Science Valley, Coding City, Melody Grove, Restaurant Row, Creative Coast, Logic Mountains, History Harbor, Sports Stadium District, Space Observatory, Elemental Forest, Crystal Caverns, and Innovation Island. Each region has three interactable landmarks connected to existing Games, Science Lab, music, Petal Town, Wingeria, and Passport routes where applicable.

The world profile records the last region, position, visited regions, starter pocket inventory and approximate walking steps in `localStorage`. It syncs selected region with the RPG profile when the level requirement is met. The scene uses a procedural Canvas illustration (buildings, paths, ponds, trees and flowerbeds) and respects the active flower palette outside the canvas. `npm test` verifies the region model, level gates, safe save normalization, deterministic walk/sprint movement, control wiring, local asset links, and service-worker caching.

**Scope limits:** this is a 2D single-player exploration prototype, not a 3D world. Jump is a visual hop, not a physics system; starter inventory is a world-preview inventory not yet connected to a global item economy. Persistent server accounts, cloud saves, unrestricted chat, other-player home visits, trading, shared house/garden/lab data, and full mobile browser QA remain future work. Existing games, question engine, Science Lab, Petal Town, music, Wingeria and Founder Console are preserved.

## Phase 08: Science Lab Reaction Chains

The Personal Science Lab remains a small, single-player material sandbox with a 6×8 board and local autosaving. This phase expands it from 9 to 17 simplified classroom-model reactions, adding seed, sunlight, rain, battery, wire, and electricity as starting materials, plus moss, pollen, rainbow, circuit, light, and fossil as discoverable products. The new reactions connect garden growth, weather and optics, geology, and a simplified circuit concept. Discovered products can be used in later reactions, creating small dependency chains. First-time discoveries award 5 Garden Passport XP when the shared profile hook is available, only once per reaction. Clearing the board preserves the journal and unlocked materials.

**Science safety and scope:** reaction outcomes are simplified learning-game models, not real laboratory procedures or build instructions. The circuit interaction is abstracted; this phase does not explain how to assemble a real electrical circuit. The game remains local/single-player and does not add chat, visitors, permissions, cloud save, or multiplayer.

**Science safety and scope:** reaction outcomes are deliberately simplified game models, not real laboratory procedures. The feature does not include actual chemical handling instructions, multiplayer, visitor permissions, chat, or a hosted account/cloud-save service. The journal is stored in this browser's local storage.

## Quick start

**Simplest option:** extract the ZIP and open `index.html` in Edge or Chrome. Most gameplay, audio synthesis and local save features run in the browser. Some browser privacy settings may limit persistence or APIs when a page is opened directly as a `file://` URL.

**Recommended local-server option:** install a current version of Node.js, open a terminal in this folder, and run:

```bash
node server.js
```

Then visit `http://127.0.0.1:4173`. The server uses only Node.js built-in modules. To use a different port:

**Windows PowerShell**
```powershell
$env:PORT = "4174"
node server.js
```

**macOS/Linux**
```bash
PORT=4174 node server.js
```

Run the server from the extracted project folder, where `server.js` is located.

## Local verification

Run the dependency-free static checks from this folder:

```bash
npm test
```

The checks compile the inline scripts and local JS modules; exercise the walkable Cayden World movement model and safe local-save normalization; simulate all 17 Science Lab reaction chains and local-save behavior; verify that discovery XP is awarded only once; ensure the lab assets are included in the offline shell; verify the 59 legacy + 87 expansion Arcade IDs; reconstruct the unified Games Hub catalog and assert exactly 285 unique entries with exactly 19 in each of 15 canonical genres; check Petal Town save transfer and separate launch wiring; verify all eight floral palette names and CSS rules; assert Wingeria has 18 upgrades with the five new upgrade effects; check shared history/favorite hooks, progress tracking, audio/Studio assets, the collection/Empire/MIDI contracts, local HTML assets, and service-worker entries. This remains a static/smoke check, not a substitute for full browser QA.

## Project structure

```text
CaydenProxy/
├── index.html                 # Original site and compatibility layer
├── assets/
│   ├── css/cayden-world-scene.css     # Responsive walkable-world HUD and mobile joystick
│   ├── js/cayden-world-scene.js       # 2D world, movement, fast travel, interactions and local save
│   ├── css/science-lab.css              # Responsive material sandbox and journal
│   ├── js/science-lab.js                # Local lab state, reaction rules and discoveries
│   ├── css/floral-themes.css          # Eight flower/color palette variable sets
│   ├── css/petal-town.css             # Responsive standalone town-builder UI
│   ├── css/arcade-max.css            # Arcade+ Max visual system and responsive rules
│   ├── css/wingeria-remastered.css   # Restaurant game styles
│   ├── css/music-studio-v3.css       # Music Studio 3.0 UI
│   ├── css/world-of-bloom.css        # World map and collectibles UI
│   ├── css/wingeria-empire.css       # Restaurant Empire UI
│   ├── js/floral-themes.js           # Saved flower palette controls
│   ├── js/genre-catalog.js           # 120 balancing entries and 15-genre normalizer
│   ├── js/petal-town.js              # Standalone garden/town builder and save codes
│   ├── js/arcade-max.js              # 87-game expansion, Player HQ, rewards
│   ├── js/wingeria-remastered.js     # Restaurant shift game and Day 100+ campaign
│   ├── js/music-studio-v3.js         # Sequencer, modeled voices, effects, MIDI/audio export
│   ├── js/world-of-bloom.js          # World map, NPC lore, quests and 1,440 collectibles
│   ├── js/wingeria-empire.js         # Cities, staff, research, recipes and rival simulation
│   ├── samples/instruments/          # 30 original generated WAV texture layers + manifest
├── sw.js                       # Optional offline shell and texture cache
├── server.js                  # Optional same-origin server / protected AI endpoint
├── package.json               # npm start and npm test commands
├── scripts/
│   └── verify.js              # Dependency-free syntax/catalog smoke checks
├── logo.svg
├── favicon.svg
└── README.md
```

The original site remains in `index.html` to preserve legacy game routes, tools, journal, focus timer, Vibe Garden, and Bloom study helper. Arcade+ Max, Wingeria Rush, Music Studio 3.0, World of Bloom and Empire Mode are separated into local modules and stylesheets. The app has no build step and no third-party runtime dependencies.

## Save data and privacy

Game profile, XP, currencies, inventory, achievements, history, favorites, daily/weekly claim markers, music playlists, instrument recordings and selected preferences are kept in this browser's local storage. They are not an online account, synchronized save, or tamper-resistant competitive leaderboard. Clearing browser/site data can remove them; use Player HQ's export option when available to create a backup. Do not store passwords or sensitive personal information in the app.

The service worker is registered only on HTTP(S), not on `file://`. Offline support covers the static app shell and local assets; it does not make optional remote services, Google search, or online AI available without a network.

## Optional Bloom AI endpoint

Bloom has a built-in local study helper. Online AI is optional. To use it, set a secret key in the server environment before starting the server; never put a secret API key into `index.html`, client JavaScript, or a public repository.

**Windows PowerShell**
```powershell
$env:OPENAI_API_KEY = "your-api-key"
$env:OPENAI_MODEL = "gpt-5-mini"
node server.js
```

**macOS/Linux**
```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_MODEL="gpt-5-mini"
node server.js
```

Online prompts are sent to the configured provider when enabled, so do not submit passwords, addresses, account details, or other sensitive information. The included rate limiter is basic, not production-grade abuse prevention.

## Notes before public launch

This is a feature-rich, standalone browser prototype, not an independently audited commercial release. Static JavaScript syntax and package integrity can be checked locally, but that does not replace hands-on cross-browser testing. Before public launch, complete manual tests for all game routes, mobile touch interactions, audio policies, keyboard/screen-reader flows, reduced motion, save migration, security/privacy disclosures, and learning effectiveness. Online leaderboards, multiplayer over the internet, account sign-in and cloud sync would require a backend and an explicit privacy design.

## Original functionality and credits

- **Creator/project credit:** Cayden Flowers.
- **Original learning tools and games:** included with CaydenProxy.
- **Music and instruments:** the included 30 WAV files are original, procedurally generated timbral textures layered with Web Audio oscillator synthesis; they are not samples of recorded acoustic instruments. Background loops are synthesized locally. No third-party music recordings are streamed.
- **Restaurant game:** Wingeria Rush Remastered is an original title inspired by the broader station-based restaurant-management genre. It is not affiliated with or an official Papa Louie game.
- **Branding:** `logo.svg` and `favicon.svg` contain CaydenProxy identity artwork.

CaydenProxy is designed to be school-friendly. It does not include network-filter bypass or stealth features. If a school restricts a hosted site, request access from its administrator.


## Phase 03 change notes

- Unified discovery now includes dedicated Favorite and frequently played shelves in addition to Continue Playing, Featured Picks, and profile-aware recommendations.
- Game cards show saved favorites, play counts, Arcade reward activity where available, and supported personal bests.
- Personal Records collects existing Arcade bests and best scores recorded by supported Learning Garden rounds. The Passport now combines both catalogs in recent/favorite views and includes a validated full-profile JSON backup/restore option with a restricted storage-key allowlist. Existing local saves are migrated with safe empty defaults; saved data remains local to this browser.
- Service-worker shell cache bumped to `caydenproxy-shell-v9` so existing installations can refresh the updated page.
- `npm test` passes static syntax, asset, catalog, and feature-contract checks; this is not a replacement for manual browser QA.


## Phase 04 change notes

- Added a `lastPlayedAt` timestamp map to the shared local Garden Passport profile. Opening a game updates its timestamp, including when the Arcade module reports a launch through the shared bridge.
- Existing saves are migrated in place: old profiles receive an empty timestamp map, while malformed non-object values for per-game maps are reset safely instead of being used as lookup tables.
- Shared Games Hub cards now show a local relative last-played label (`just now`, minutes, hours, `yesterday`, or a calendar date), and played games use the clearer **Play again** action label. New and older Arcade saves without timestamp history still show their existing play counts and recent history; no timestamp is invented for those games.
- Last-played timestamps remain in browser local storage and are included in the existing profile backup/restore data. They are not synced to an online account.
- Updated the offline shell cache to `caydenproxy-shell-v10` and project version to `6.2.0` so a served installation refreshes the page after this change.
- `npm test` includes regression checks for timestamp tracking and the card labels. These checks validate source contracts and assets but do not replace hands-on browser testing.

## Phase 05 change notes

- Balanced the combined, deduplicated Games Hub list at 285 unique IDs: 15 canonical genre filters × exactly 19 entries. Filter labels show each category's live count, and the homepage links directly to Petal Town. The 120 added titles use reusable question banks where no dedicated mechanic exists yet; catalog parity does not claim that every title has a different engine.
- Added **Petal Town: Bloom & Build** as a standalone game distinct from World of Bloom. It has a 6×6 planting/building grid, six flower types, harvestable growth stages, coin/petal economies, leveling, daily harvesting, eight building types, town renaming, local autosaves and a bounded/validated save-code import/export format. Portable codes can transfer a saved town between devices manually; cloud sync and real-time multiplayer are not implemented.
- Added eight device-persistent flower palettes and integrated them into Settings: Daisy Cream, Sunflower Gold, Cherry Blossom, Rose Garden, Lavender Haze, Bluebell Sky, Clover Meadow and Iris Twilight. Existing high-contrast, background override, text-scale, card-layout and reduced-motion controls remain separate. A manually selected accent color acts as an override; Reset custom preferences clears that override and returns to Daisy Cream.
- Added five permanent Wingeria Rush upgrades with actual gameplay effects: Priority Ticket Rail (slower queue patience drain), Flower Patio Expansion (+2 dining tables and tips), Kitchen Herb Garden (+4 order-accuracy points and tips), Neighborhood Loyalty Bloom (+18% tips from regulars), and Calm Service Clock (slower seated-guest patience drain).
- Added new static tests for genre counts, palette wiring, Petal Town transfer-code contracts, Wingeria effects and offline cache entries. Cache bumped to `caydenproxy-shell-v11`; project version is `6.3.0`. Full static checks pass; manual live-browser QA remains outstanding in this environment.


## Phase 06 change notes

- Added shared completion tracking for supported games. Standard question-bank games now end after five questions and record a score, completion count, best percentage, completion timestamp and perfect-clear count in the local Garden Passport. The feature applies only to games with a supported completion path; catalog presence alone does not imply that a title has custom mechanics or an achievement event.
- Added honest clear/result tracking to Memory Patch (six matched pairs), Eco Quest (12 sorting items), the 30-second Typing challenge, Soccer Stars (five kicks), Hoops Time (five shots), Rally Ready (eight cues), and a five-beat mastery milestone in Rhythm Roots. Word Garden Scramble is now a finite five-word challenge; its score counts words solved on the first try, while players can still retry a word to learn it.
- Game Hub cards can display saved challenge clears, best percentage or best score, a progress meter when a percentage is meaningful, and a clear badge. Garden Passport achievement badges now include first clear, five-game patch, mastery meadow, perfect petals and repeated-challenge milestones. Progress data remains on this device and is included in the existing profile backup/restore data.
- Petal Town adds seven long-term one-time milestones for planting, watering, harvesting, building and town level. Rewards add town coins and petals and award small Garden Passport XP. New stats and claimed milestone IDs are stored in the town save; earlier saves are migrated while preserving their existing board, coins, petals, harvest count and daily state. Historical watering cannot be reconstructed from old saves, so that counter starts at zero for earlier gardens.
- Added the shared `assets/css/game-progress.css` stylesheet for accessible result panels, progress bars and saved challenge indicators. Added responsive milestone-card styling to Petal Town, updated the service-worker shell cache to `caydenproxy-shell-v13`, and bumped the project version to `6.4.0`.
- `npm test` checks the new completion hooks, finite word challenge, progress stylesheet, milestone state migration, responsive UI contracts, genre balance, audio assets and release archive ingredients. These are static/source-level tests; live browser click-through testing still needs a normal user browser because automated browsing was blocked in the development environment.


### Phase 08 release notes

- Expanded the Science Lab from 9 to 17 reaction rules with chained unlocks across garden growth, weather, geology, and simplified circuit concepts.
- Added six starting materials and six discoverable product materials; old discovery IDs and unlocked materials are preserved by the existing local save normalizer.
- Added regression checks that trigger every rule, assert product unlocks, and verify the journal stores all 17 discoveries without repeated XP awards.
- Project version `6.6.0`; offline shell cache `caydenproxy-shell-v14`.


### Phase 09 release notes

- Expanded the classroom-model Science Lab from 17 to 30 reaction rules, adding garden, water-cycle, materials, geology and solar-energy concepts with four additional unlockable products (Puddle, Ash, Snow and Solar Cell).
- Replaced the discovery-only list with a searchable, subject-filterable Discovery Book. Undiscovered entries keep their exact recipe hidden and show topic clues; a discovered recipe reveals its inputs and outputs. Added completion progress and a reset-filters control.
- Expanded progression to all seven roadmap tiers: Starter Lab, Student Lab, Research Lab, Advanced Lab, Mega Lab, Scientific Institute and Future Technology Lab.
- Kept the existing local save key and migration behavior. Existing discoveries remain valid, and new fields are unlocked as new reactions are discovered; no account, cloud sync, chat or multiplayer was introduced in this batch.
- Updated project version to `6.7.0` and service-worker shell cache to `caydenproxy-shell-v15`. `npm test` includes expanded reaction model, unique-pair, hidden-recipe, clue-category and lab-tier checks. Automated tests do not replace live browser QA.


### Phase 10 release notes

- Added a procedural question engine for 13 canonical subjects with five difficulty levels and eight response modes. Question sessions vary wording, options, and question format, and avoid repeated question signatures within a session.
- Math and Logic include procedural numeric/logic generation. Other subjects use curated seed facts combined with procedural wording, answer-order permutations, modes and difficulty presentation. Automated checks generated 1,000 unique question variants per subject in one session; that does **not** mean each subject has 1,000 separately authored facts.
- Connected the main five-question quiz challenge and timed legacy Arcade quiz rounds to the shared engine. The Garden Passport now displays locally stored subject mastery stats, and the question stats key is included in the validated full local backup/restore flow.
- Project version `6.8.0`; service-worker shell cache `caydenproxy-shell-v16`. Question stats remain local to the browser. Accounts, cloud synchronization, real-time chat and multiplayer are not included in this release. Automated checks do not replace visual browser QA.

## Phase 11: Cayden World RPG Foundation

Phase 11 adds a distinct **Cayden World RPG** dashboard with a locally saved character (name, avatar, outfit, title, badge frame, and starting flower theme), a six-region world map with level gates, a five-tier homestead upgrade track, room shortcuts into existing CaydenProxy features, and three daily plus three weekly quests. Quest progress reads existing local counters for game launches, correctly answered questions, Garden Passport check-ins, and Science Lab discoveries. Claimed rewards grant coins in the RPG wallet and XP through the existing Garden Passport integration. The RPG profile is stored at `cp-rpg-world-v1`; it does not replace the main Garden Passport save.

**Founder Console:** no universal secret phrase is included. Developer Mode must be enabled and the server must be started with `CP_FOUNDER_KEY` set in the environment. The server checks this key with constant-time comparison and issues an IP-bound 20-minute session. The allowed actions affect only a separate local test sandbox (test XP, test items, region preview, and reset); they do not grant real XP, currency, achievements, or region unlocks. Configure the key before running `node server.js`; do not put it in source code or publish it. For an internet-facing deployment, use HTTPS and review the server configuration before enabling this endpoint. This is developer tooling, not a full account/role system.

**Multiplayer status:** Phase 11 is still local-first. It does not add friend accounts, realtime house/lab visits, public chat, or cloud-saved character records. Those require a separately deployed persistence and identity backend. Regions link into the existing activities; they are not a 3D real-time world simulation.

### Phase 11 verification

`npm test` now checks the RPG state schema and migration sanitation, six regions, five home tiers, daily and weekly quest models, isolated Founder sandbox state, admin key/session contracts, the new page route, responsive and reduced-motion CSS, and offline asset registration. The server API is also manually smoke-tested with the key unset and configured, including rejection of missing/weak configuration, invalid-key rejection, a valid session, allowlisted sandbox actions, invalid grants, and unauthenticated-action rejection. These checks do not substitute for a full visual browser QA pass.


To enable the local Founder Console on Windows PowerShell, configure the key in the same terminal before starting the local server. Use a private random value, at least 24 characters long, and do not commit it to the project files. Example flow: `$env:CP_FOUNDER_KEY = "your-private-random-key-at-least-24-characters"` then `node server.js`. This sample value is a placeholder; replace it before use. In a deployed environment, store it as a server secret and use HTTPS.
