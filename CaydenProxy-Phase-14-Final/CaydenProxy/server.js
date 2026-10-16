'use strict';

// CaydenProxy optional AI server. Uses only Node.js built-in modules.
// Keep OPENAI_API_KEY in your server environment; never put it in index.html.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const API_KEY = process.env.OPENAI_API_KEY || '';
// Optional founder/admin key is configured only in the server environment. Never hard-code it in browser code.
const FOUNDER_KEY = process.env.CP_FOUNDER_KEY || '';
const FOUNDER_SESSION_MS = 20 * 60 * 1000;
const founderSessions = new Map();
const MAX_BODY = 20 * 1024;
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60 * 1000;
const rateBuckets = new Map();
// Lightweight WebSocket multiplayer rooms. Positions are ephemeral and never affect the economy.
const worldSockets = new Map();
const WORLD_REGIONS = new Set(['bloomtown','science-valley','coding-city','melody-grove','restaurant-row','creative-coast','logic-mountains','history-harbor','sports-stadium','space-observatory','elemental-forest','crystal-caverns','innovation-island']);
const WORLD_AVATARS = new Set(['🧑','🌼','🌷','🌻','🌸','🌺','🪻','🍀','🐝','🦋','🐸','🐱','🐰','🦊','🐼','🐧','⭐','🌱']);
const WORLD_ROOM_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
const WORLD_ROOM_LIMIT = 12;
const WORLD_AVATAR_CHOICES = { skinTone:new Set(['#f7d7bd','#e8b58d','#c9875a','#8c573b','#573729']), hairColor:new Set(['#2d211d','#65412d','#d6a23d','#b95735','#5c4a8c','#d9d9d9']), hairStyle:new Set(['short','long','curly','ponytail']), shirtColor:new Set(['#e66b80','#5b9b71','#5e83c6','#e4b34f','#8b70b8','#f2eee2','#35414c']), pantsColor:new Set(['#334e75','#5b6571','#8a5b3b','#4b805b','#292b32']) };
const WORLD_DEFAULT_APPEARANCE = { skinTone:'#e8b58d', hairColor:'#2d211d', hairStyle:'short', shirtColor:'#5b9b71', pantsColor:'#334e75' };
function sanitizeWorldAppearance(input) { const x=input&&typeof input==='object'&&!Array.isArray(input)?input:{}; return Object.fromEntries(Object.entries(WORLD_DEFAULT_APPEARANCE).map(([key,fallback])=>[key,WORLD_AVATAR_CHOICES[key].has(x[key])?x[key]:fallback])); }
function createWorldRoomCode() { const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code=''; do { code=''; for(let i=0;i<6;i++) code+=alphabet[crypto.randomInt(0,alphabet.length)]; } while([...worldSockets.values()].some(player=>player.joined&&player.roomCode===code)); return code; }
const WORLD_EMOTES = new Set(['wave','heart','celebrate','flower','dance','think','clap','hello','nice-garden','lets-explore','great-job','thanks']);
const WORLD_EMOTE_TEXT = {
  wave:'👋 Hi!', heart:'💗', celebrate:'🎉 Yay!', flower:'🌻', dance:'💃', think:'🤔', clap:'👏',
  hello:'Hi there!', 'nice-garden':'Nice garden!', 'lets-explore':"Let's explore!", 'great-job':'Great job!', thanks:'Thanks!'
};
const MAX_WORLD_CLIENTS = 200;
const WORLD_MESSAGE_LIMIT = 4096;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(text);
}

function allowRequest(req) {
  // Use the direct socket address unless a trusted proxy is added explicitly;
  // do not trust a client-supplied X-Forwarded-For header for abuse limits.
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const existing = rateBuckets.get(ip) || { count: 0, start: now };
  if (now - existing.start >= RATE_WINDOW_MS) {
    existing.count = 0;
    existing.start = now;
  }
  existing.count += 1;
  rateBuckets.set(ip, existing);
  if (rateBuckets.size > 2000) {
    for (const [key, value] of rateBuckets) if (now - value.start > RATE_WINDOW_MS * 2) rateBuckets.delete(key);
  }
  return existing.count <= RATE_LIMIT;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Request too large'), { status: 413 }));
        req.destroy();
        return;
      }
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function extractText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) return response.output_text.trim();
  const parts = [];
  for (const item of (response.output || [])) {
    if (item.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const block of item.content) if (block.type === 'output_text' && typeof block.text === 'string') parts.push(block.text);
  }
  return parts.join('\n').trim();
}

async function handleAi(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Use POST for the AI endpoint.' });
  }
  if (!allowRequest(req)) return sendJson(res, 429, { error: 'Too many messages for now. Please try again in a minute.' });
  if (!API_KEY) return sendJson(res, 200, { configured: false, reply: '' });

  let payload;
  try { payload = await readJson(req); }
  catch (err) { return sendJson(res, err.status || 400, { error: err.status === 413 ? 'Message is too large.' : 'Could not read the message.' }); }

  const incoming = Array.isArray(payload.messages) ? payload.messages.slice(-8) : [];
  const messages = incoming.map(item => {
    const role = item && item.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof (item && item.content) === 'string' ? item.content.trim().slice(0, 1800) : '';
    return { role, content };
  }).filter(item => item.content.length > 0);
  if (!messages.length) return sendJson(res, 400, { error: 'Type a question first.' });

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_output_tokens: 700,
        instructions: [
          'You are Bloom AI, the friendly educational helper inside CaydenProxy, created by Cayden Flowers.',
          'The user may be a teen. Keep responses age-appropriate, kind, and clear. Help them learn instead of only giving unexplained answers.',
          'Explain school subjects step by step, use simple examples, and ask a short follow-up question when it will help.',
          'Do not claim you can browse live web pages. For current facts, tell the user that the in-app Google Search panel is the right place to check.',
          'Do not request passwords, private account details, personal addresses, or other sensitive information. If given, do not repeat it unnecessarily.',
          'For math, show the core steps and check the result. For sports, encourage fair play, respect, and age-appropriate safety.',
        ].join(' '),
        input: messages,
      }),
      signal: AbortSignal.timeout(35000),
    });

    if (!upstream.ok) {
      // Avoid returning provider details or user prompts in logs or error messages.
      process.stderr.write(`AI provider returned HTTP ${upstream.status}.\n`);
      return sendJson(res, 502, { error: 'Bloom AI could not reach the model. Check the server key, model access, and API quota.' });
    }
    const data = await upstream.json();
    const reply = extractText(data);
    if (!reply) return sendJson(res, 502, { error: 'The AI model returned no text. Please try again.' });
    return sendJson(res, 200, { configured: true, model: MODEL, reply });
  } catch (err) {
    process.stderr.write(`AI request failed: ${err && err.name === 'TimeoutError' ? 'timeout' : 'network error'}.\n`);
    return sendJson(res, 502, { error: 'Bloom AI is temporarily unavailable. Please try again in a moment.' });
  }
}

function safeKeyEquals(candidate, expected) {
  if (typeof candidate !== 'string' || !candidate || !expected) return false;
  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handleFounderSession(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Use POST to request a Founder session.' });
  }
  if (FOUNDER_KEY.length < 24) return sendJson(res, 503, { ok: false, configured: false, error: 'Founder access is disabled. Set CP_FOUNDER_KEY to a private value at least 24 characters long.' });
  if (!allowRequest(req)) return sendJson(res, 429, { error: 'Too many access attempts. Wait a minute and try again.' });
  let payload;
  try { payload = await readJson(req); }
  catch (err) { return sendJson(res, err.status || 400, { error: 'Could not read the Founder access request.' }); }
  const candidate = typeof payload.key === 'string' ? payload.key.slice(0, 512) : '';
  if (!safeKeyEquals(candidate, FOUNDER_KEY)) return sendJson(res, 401, { ok: false, error: 'Founder access was denied.' });
  const now = Date.now();
  for (const [token, session] of founderSessions) if (session.expiresAt <= now) founderSessions.delete(token);
  const token = crypto.randomBytes(32).toString('hex');
  const ip = req.socket.remoteAddress || 'unknown';
  founderSessions.set(token, { ip, expiresAt: now + FOUNDER_SESSION_MS });
  if (founderSessions.size > 500) {
    const oldest = [...founderSessions.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt).slice(0, founderSessions.size - 500);
    for (const [oldToken] of oldest) founderSessions.delete(oldToken);
  }
  return sendJson(res, 200, { ok: true, token, expiresInMs: FOUNDER_SESSION_MS, scope: 'local-developer-sandbox' });
}

async function handleFounderAction(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Use POST for Founder sandbox actions.' });
  }
  if (FOUNDER_KEY.length < 24) return sendJson(res, 503, { ok: false, error: 'Founder access is disabled on this server.' });
  if (!allowRequest(req)) return sendJson(res, 429, { error: 'Too many developer actions. Wait a minute and try again.' });
  const match = String(req.headers.authorization || '').match(/^Bearer ([a-f0-9]{64})$/i);
  const token = match ? match[1] : '';
  const session = token ? founderSessions.get(token) : null;
  const ip = req.socket.remoteAddress || 'unknown';
  if (!session || session.expiresAt <= Date.now() || session.ip !== ip) {
    if (token) founderSessions.delete(token);
    return sendJson(res, 401, { ok: false, error: 'Founder session expired or is not valid for this connection.' });
  }
  let payload;
  try { payload = await readJson(req); }
  catch (err) { return sendJson(res, err.status || 400, { error: 'Could not read the developer action.' }); }
  const action = typeof payload.action === 'string' ? payload.action : '';
  const itemIds = new Set(['seed-bag', 'star-fragment', 'lab-blueprint', 'golden-petal', 'music-crystal']);
  const regionIds = new Set(['bloomtown', 'science-valley', 'coding-city', 'melody-grove', 'restaurant-row', 'creative-coast']);
  if (action === 'grant-test-xp') {
    const amount = Math.floor(Number(payload.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > 1000) return sendJson(res, 400, { ok: false, error: 'Test XP must be between 1 and 1000.' });
    return sendJson(res, 200, { ok: true, action, amount, scope: 'sandbox-only' });
  }
  if (action === 'spawn-item') {
    const quantity = Math.floor(Number(payload.quantity || 1));
    if (!itemIds.has(payload.item) || quantity < 1 || quantity > 20) return sendJson(res, 400, { ok: false, error: 'Choose an approved test item and a quantity from 1 to 20.' });
    return sendJson(res, 200, { ok: true, action, item: payload.item, quantity, scope: 'sandbox-only' });
  }
  if (action === 'preview-region') {
    if (!regionIds.has(payload.region)) return sendJson(res, 400, { ok: false, error: 'Choose a known region to preview.' });
    return sendJson(res, 200, { ok: true, action, region: payload.region, scope: 'sandbox-only' });
  }
  if (action === 'reset-sandbox') return sendJson(res, 200, { ok: true, action, scope: 'sandbox-only' });
  return sendJson(res, 400, { ok: false, error: 'Unknown or unsupported developer action.' });
}

function wsFrame(opcode, payload = '') {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload));
  let header;
  if (body.length < 126) { header = Buffer.from([0x80 | opcode, body.length]); }
  else if (body.length < 65536) { header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 126; header.writeUInt16BE(body.length, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 127; header.writeBigUInt64BE(BigInt(body.length), 2); }
  return Buffer.concat([header, body]);
}
function worldSend(client, message) {
  if (!client || client.socket.destroyed || !client.socket.writable) return;
  try { client.socket.write(wsFrame(1, JSON.stringify(message))); } catch (_) { client.socket.destroy(); }
}
function publicWorldPlayer(player) {
  return { id: player.id, name: player.name, avatar: player.avatar, appearance: player.appearance, roomCode: player.roomCode, region: player.region, x: player.x, y: player.y, emote: player.emote || '', emoteAt: player.emoteAt || 0 };
}
function worldBroadcast(roomCode, region, message, exceptId = '') {
  for (const player of worldSockets.values()) if (player.joined && player.roomCode === roomCode && player.region === region && player.id !== exceptId) worldSend(player, message);
}
function closeWorldClient(client) {
  if (!client || client.closed) return;
  client.closed = true;
  if (client.joined) {
    worldSockets.delete(client.id);
    worldBroadcast(client.roomCode, client.region, { type: 'player-left', id: client.id });
  }
  try { client.socket.end(wsFrame(8, Buffer.alloc(0))); } catch (_) { try { client.socket.destroy(); } catch (_) {} }
}
function handleWorldMessage(client, raw) {
  let message;
  try { message = JSON.parse(raw); } catch (_) { return worldSend(client, { type: 'error', message: 'Invalid multiplayer message.' }); }
  if (!message || typeof message !== 'object' || Array.isArray(message)) return;
  const now = Date.now();
  if (message.type === 'join') {
    if (client.joined) return;
    const name = String(message.name || 'Garden Guest').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 20) || 'Garden Guest';
    const region = WORLD_REGIONS.has(message.region) ? message.region : 'bloomtown';
    const avatar = WORLD_AVATARS.has(message.avatar) ? message.avatar : '🧑';
    const appearance = sanitizeWorldAppearance(message.appearance);
    const requestedCode = String(message.roomCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    let roomCode;
    if (requestedCode) {
      if (!WORLD_ROOM_CODE.test(requestedCode)) return worldSend(client, { type: 'error', message: 'Room codes are six letters/numbers. Clear the code to create a new room.' });
      const roomMembers = [...worldSockets.values()].filter(p => p.joined && p.roomCode === requestedCode);
      if (!roomMembers.length) return worldSend(client, { type: 'error', message: 'That room is not active. Ask the host to create a room and share the current code.' });
      if (roomMembers.length >= WORLD_ROOM_LIMIT) return worldSend(client, { type: 'error', message: 'That room is full. Ask the host to create another room.' });
      roomCode = requestedCode;
    } else roomCode = createWorldRoomCode();
    client.name = name; client.avatar = avatar; client.appearance = appearance; client.region = region; client.roomCode = roomCode;
    client.x = Math.max(22, Math.min(938, Number(message.x) || 480));
    client.y = Math.max(22, Math.min(498, Number(message.y) || 365));
    client.joined = true; client.lastMoveAt = now; client.lastBroadcastAt = 0; client.lastEmoteAt = 0;
    worldSockets.set(client.id, client);
    const players = [...worldSockets.values()].filter(p => p.joined && p.roomCode === roomCode && p.region === region && p.id !== client.id).map(publicWorldPlayer);
    worldSend(client, { type: 'welcome', selfId: client.id, region, roomCode, players, count: players.length + 1, roomLimit: WORLD_ROOM_LIMIT });
    worldBroadcast(roomCode, region, { type: 'player-joined', player: publicWorldPlayer(client), count: players.length + 1 }, client.id);
    return;
  }
  if (!client.joined) return worldSend(client, { type: 'error', message: 'Join the world first.' });
  if (message.type === 'move') {
    if (now - client.lastBroadcastAt < 45) return;
    const region = WORLD_REGIONS.has(message.region) ? message.region : client.region;
    const x = Math.max(22, Math.min(938, Number(message.x) || 22));
    const y = Math.max(22, Math.min(498, Number(message.y) || 22));
    const elapsed = Math.max(0.045, Math.min(1.5, (now - client.lastMoveAt) / 1000));
    // A generous speed envelope rejects obvious teleport packets without depending on frame timing.
    const distance = Math.hypot(x - client.x, y - client.y);
    if (region === client.region && distance > Math.max(95, elapsed * 390)) return;
    if (region !== client.region) {
      const oldRegion = client.region;
      worldBroadcast(client.roomCode, oldRegion, { type: 'player-left', id: client.id });
      client.region = region;
      client.x = x; client.y = y;
      worldBroadcast(client.roomCode, region, { type: 'player-joined', player: publicWorldPlayer(client) }, client.id);
    }
    client.x = x; client.y = y; client.lastMoveAt = now; client.lastBroadcastAt = now;
    worldBroadcast(client.roomCode, client.region, { type: 'player-state', player: publicWorldPlayer(client) }, client.id);
    return;
  }
  if (message.type === 'emote') {
    const emote = String(message.emote || '');
    if (!WORLD_EMOTES.has(emote) || now - client.lastEmoteAt < 650) return;
    client.lastEmoteAt = now; client.emote = emote; client.emoteAt = now;
    worldBroadcast(client.roomCode, client.region, { type: 'player-emote', id: client.id, emote, text: WORLD_EMOTE_TEXT[emote], at: now });
    return;
  }
  if (message.type === 'ping') worldSend(client, { type: 'pong', at: now });
}
function attachWorldSocket(socket, head) {
  if (worldSockets.size >= MAX_WORLD_CLIENTS) { socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n'); return; }
  const client = { id: crypto.randomUUID(), socket, joined: false, closed: false, region: 'bloomtown', roomCode:'', appearance:{...WORLD_DEFAULT_APPEARANCE}, x: 480, y: 365, name: 'Garden Guest', avatar: '🧑', buffer: Buffer.alloc(0) };
  socket.setNoDelay(true);
  const cleanup = () => { if (client.closed) return; if (client.joined) { worldSockets.delete(client.id); worldBroadcast(client.roomCode, client.region, { type: 'player-left', id: client.id }); } client.closed = true; };
  socket.on('data', chunk => {
    if (client.closed) return;
    client.buffer = Buffer.concat([client.buffer, chunk]);
    if (client.buffer.length > WORLD_MESSAGE_LIMIT * 4 + 64) { socket.destroy(); cleanup(); return; }
    while (client.buffer.length >= 2) {
      const b0 = client.buffer[0], b1 = client.buffer[1], fin = !!(b0 & 0x80), opcode = b0 & 0x0f, masked = !!(b1 & 0x80);
      if ((b0 & 0x70) !== 0 || !fin || !masked) { socket.destroy(); cleanup(); return; }
      let length = b1 & 0x7f, offset = 2;
      if (length === 126) { if (client.buffer.length < 4) return; length = client.buffer.readUInt16BE(2); offset = 4; }
      else if (length === 127) { if (client.buffer.length < 10) return; const big = client.buffer.readBigUInt64BE(2); if (big > BigInt(WORLD_MESSAGE_LIMIT)) { socket.destroy(); cleanup(); return; } length = Number(big); offset = 10; }
      if (length > WORLD_MESSAGE_LIMIT) { socket.destroy(); cleanup(); return; }
      if (client.buffer.length < offset + 4 + length) return;
      const mask = client.buffer.subarray(offset, offset + 4); offset += 4;
      const payload = Buffer.from(client.buffer.subarray(offset, offset + length));
      client.buffer = client.buffer.subarray(offset + length);
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
      if (opcode === 8) { closeWorldClient(client); return; }
      if (opcode === 9) { try { socket.write(wsFrame(10, payload)); } catch (_) {} continue; }
      if (opcode !== 1) continue;
      handleWorldMessage(client, payload.toString('utf8'));
    }
  });
  socket.on('close', cleanup);
  socket.on('error', cleanup);
  if (head && head.length) socket.emit('data', head);
}

function serveStatic(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { res.writeHead(400); res.end('Bad URL'); return; }
  if (decoded.includes('\0') || decoded.includes('\\')) { res.writeHead(400); res.end('Bad URL'); return; }
  if (decoded === '/') decoded = '/index.html';
  const filePath = path.resolve(ROOT, `.${decoded}`);
  if (!filePath.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
    const type = TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-cache' : 'public, max-age=3600',
    });
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end('Could not read file'); });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); }
  catch { res.writeHead(400); res.end('Bad URL'); return; }
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, aiConfigured: Boolean(API_KEY), model: API_KEY ? MODEL : null });
  }
  if (url.pathname === '/api/ai') return void handleAi(req, res);
  if (url.pathname === '/api/founder/session') return void handleFounderSession(req, res);
  if (url.pathname === '/api/founder/action') return void handleFounderAction(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Allow': 'GET, HEAD' }); res.end('Method not allowed'); return;
  }
  serveStatic(req, res, url.pathname);
});

server.on('upgrade', (req, socket, head) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); } catch (_) { socket.destroy(); return; }
  if (url.pathname !== '/ws/world' || String(req.headers.upgrade || '').toLowerCase() !== 'websocket' || !String(req.headers.connection || '').toLowerCase().split(',').map(x => x.trim()).includes('upgrade')) { socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n'); return; }
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; } }
    catch (_) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
  }
  const key = req.headers['sec-websocket-key'];
  if (typeof key !== 'string' || !/^[A-Za-z0-9+/]{22}==$/.test(key) || req.headers['sec-websocket-version'] !== '13') { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  attachWorldSocket(socket, head);
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`CaydenProxy running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}\n`);
  process.stdout.write(API_KEY ? `Bloom AI server mode enabled (${MODEL}).\n` : 'Bloom AI server mode is not configured; local study helper remains available.\n');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
