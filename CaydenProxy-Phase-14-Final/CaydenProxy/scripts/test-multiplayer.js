'use strict';
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const timeout = (promise, ms, label) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), ms))]);
function freePort() { return new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)); }); }); }
class WorldClient {
  constructor(port) { this.port = port; this.socket = null; this.buffer = Buffer.alloc(0); this.handshaken = false; this.messages = []; this.waiters = []; this.closed = false; }
  async connect() {
    this.socket = net.connect(this.port, '127.0.0.1');
    this.socket.on('data', chunk => this.onData(chunk));
    this.socket.on('error', err => { if (!this.closed) this.rejectWaiters(err); });
    await timeout(new Promise((resolve, reject) => { this.socket.once('connect', resolve); this.socket.once('error', reject); }), 3000, 'TCP connect');
    const key = crypto.randomBytes(16).toString('base64');
    this.socket.write(`GET /ws/world HTTP/1.1\r\nHost: 127.0.0.1:${this.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\nOrigin: http://127.0.0.1:${this.port}\r\n\r\n`);
    await timeout(new Promise((resolve, reject) => { const check = () => { if (this.handshaken) { cleanup(); resolve(); } }; const fail = err => { cleanup(); reject(err); }; const cleanup = () => { clearInterval(timer); this.handshakeReject = null; this.handshakeResolve = null; }; this.handshakeResolve = check; this.handshakeReject = fail; const timer = setInterval(check, 5); }), 3000, 'WebSocket handshake');
  }
  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (!this.handshaken) {
      const end = this.buffer.indexOf('\r\n\r\n'); if (end < 0) return;
      const header = this.buffer.subarray(0, end).toString(); this.buffer = this.buffer.subarray(end + 4);
      if (!header.includes('101 Switching Protocols')) { this.rejectWaiters(new Error(`WebSocket handshake rejected: ${header.split('\r\n')[0]}`)); return; }
      this.handshaken = true; this.handshakeResolve?.();
    }
    while (this.buffer.length >= 2) {
      const b0=this.buffer[0], b1=this.buffer[1], opcode=b0&15; let len=b1&127, off=2;
      if(len===126){if(this.buffer.length<4)return;len=this.buffer.readUInt16BE(2);off=4;}
      else if(len===127){if(this.buffer.length<10)return;const big=this.buffer.readBigUInt64BE(2);if(big>4096n){this.rejectWaiters(new Error('Unexpected oversized server frame'));return;}len=Number(big);off=10;}
      if(b1&128) off+=4;
      if(this.buffer.length<off+len)return;
      let payload=Buffer.from(this.buffer.subarray(off,off+len));this.buffer=this.buffer.subarray(off+len);
      if(b1&128){const mask=this.buffer.subarray(0,4);for(let i=0;i<payload.length;i++)payload[i]^=mask[i%4];}
      if(opcode===8){this.closed=true;continue;} if(opcode!==1)continue;
      try{const msg=JSON.parse(payload.toString());const waiterIndex=this.waiters.findIndex(w=>w.type===msg.type&&(!w.predicate||w.predicate(msg)));if(waiterIndex>=0){const [w]=this.waiters.splice(waiterIndex,1);w.resolve(msg);}else this.messages.push(msg);}catch(_){}
    }
  }
  send(obj, opcode=1) { const payload=Buffer.from(typeof obj==='string'?obj:JSON.stringify(obj));const mask=crypto.randomBytes(4);let header;if(payload.length<126)header=Buffer.from([0x80|opcode,0x80|payload.length]);else{header=Buffer.alloc(4);header[0]=0x80|opcode;header[1]=0x80|126;header.writeUInt16BE(payload.length,2);}const masked=Buffer.from(payload);for(let i=0;i<masked.length;i++)masked[i]^=mask[i%4];this.socket.write(Buffer.concat([header,mask,masked])); }
  wait(type, predicate=()=>true) { const idx=this.messages.findIndex(m=>m.type===type&&predicate(m));if(idx>=0)return Promise.resolve(this.messages.splice(idx,1)[0]);return timeout(new Promise((resolve,reject)=>this.waiters.push({type,predicate,resolve,reject})),3000,type); }
  rejectWaiters(err){for(const w of this.waiters.splice(0))w.reject(err);this.handshakeReject?.(err);}
  close(){this.closed=true;try{this.send('',8);}catch(_){}this.socket?.end();}
}
(async()=>{
  let child, a, b;
  try {
    const port=await freePort();
    child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port)},stdio:['ignore','pipe','pipe']});
    let logs='';child.stdout.on('data',d=>logs+=d.toString());child.stderr.on('data',d=>logs+=d.toString());
    await timeout(new Promise((resolve,reject)=>{const poll=setInterval(()=>{if(logs.includes(`:${port}`)){clearInterval(poll);resolve();}if(child.exitCode!==null){clearInterval(poll);reject(new Error(`Server exited early: ${logs}`));}},10);}),5000,'server startup');
    a=new WorldClient(port);b=new WorldClient(port);await Promise.all([a.connect(),b.connect()]);
    a.send({type:'join',name:'Rose',avatar:'🌷',region:'bloomtown',x:480,y:365});const aw=await a.wait('welcome');
    if(!aw.selfId||aw.region!=='bloomtown')throw new Error('First client did not receive a valid welcome.');
    b.send({type:'join',name:'Sunflower',avatar:'🌻',region:'bloomtown',x:500,y:365});const bw=await b.wait('welcome');
    if(bw.players.length!==1||bw.players[0].name!=='Rose')throw new Error('Second client did not receive existing room player.');
    await a.wait('player-joined',m=>m.player?.name==='Sunflower');
    a.send({type:'move',region:'bloomtown',x:510,y:365});const moved=await b.wait('player-state',m=>m.player?.id===aw.selfId);
    if(moved.player.x!==510)throw new Error('Movement was not broadcast to the other player.');
    a.send({type:'emote',emote:'wave'});const emote=await b.wait('player-emote',m=>m.id===aw.selfId);
    if(emote.text!=='👋 Hi!')throw new Error('Preset emote was not broadcast.');
    a.close();const left=await b.wait('player-left',m=>m.id===aw.selfId);
    if(left.id!==aw.selfId)throw new Error('Disconnect was not broadcast.');
    console.log('PASS: two WebSocket clients join one 2D room and receive each other’s presence');
    console.log('PASS: server broadcasts live movement, preset emotes, and player departures');
    console.log('PASS: multiplayer integration runs without third-party packages');
  } catch(err) { console.error(`FAIL: multiplayer integration: ${err.message}`);process.exitCode=1; }
  finally {a?.close();b?.close();if(child){child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));}}
})();
