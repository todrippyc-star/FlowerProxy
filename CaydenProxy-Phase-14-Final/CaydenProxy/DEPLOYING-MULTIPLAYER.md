# Deploy Cayden World multiplayer

This project includes a Node.js HTTP server and a same-origin WebSocket endpoint at `/ws/world`. Deploy the project as a **Web Service** that supports WebSockets. Do not deploy it as a static-only site. The current build supports temporary private room codes, human-style avatar appearance, and preset emotes.

## Before deploying

- Use the complete CaydenProxy project folder, not only `index.html`.
- Keep the GitHub repository private while testing if you prefer; the deployed website itself will be public if you create a public web service.
- Never commit API keys, founder keys, passwords, or `.env` files. Configure secrets in the hosting provider's environment settings instead.
- Private rooms are held in server memory. Leave the room-code field blank to create a six-character code, then share it. Friends enter that code to join. Use **New room** to clear the field and create a separate room. Rooms stop accepting joins once every member has left or the server restarts.
- The room server supports preset emotes, not unrestricted chat. Player positions disappear when a player disconnects or the server restarts. XP, coins, inventory, accounts, trades, and saves are not synchronized by this WebSocket service.

## Deploy with Render

The included `render.yaml` configures a Node web service, runs the validation suite during the build, starts the app using `npm start`, binds it to `0.0.0.0`, and configures `/api/health` as a health check.

1. Create a GitHub repository for the project. For the initial test, keeping the source repository private is a sensible choice.
2. Upload the complete contents of this project folder to that repository, preserving the folders `assets/` and `scripts/`, plus `server.js`, `package.json`, `render.yaml`, and the other project files. Do not upload `node_modules/`, `.env`, or real secret values.
3. In Render, choose **New + → Web Service**, connect the repository, and select its branch.
4. If Render detects `render.yaml`, use the blueprint configuration. Otherwise, configure these values manually:
   - Runtime: Node
   - Build command: `npm test`
   - Start command: `npm start`
   - Health check path: `/api/health`
   - Environment variable: `HOST` = `0.0.0.0`
5. Let the first deployment finish. Open `https://YOUR-SERVICE.onrender.com/api/health`. A healthy server should return JSON containing `"ok":true`.
6. Open `https://YOUR-SERVICE.onrender.com`, launch Cayden World RPG, leave **Room code** blank, and press **Connect**. The server returns a six-character code; press **Copy code** and send it to a friend. On a second device, open the exact same HTTPS URL, enter the code, choose the same region (start with Bloomtown), and press **Connect**. You should see the other human-style avatar. Try a preset emote.

The game automatically selects `wss://` on HTTPS pages. Use that hosted HTTPS address for everyone; do not use `localhost` on another device, because `localhost` means that other device itself.

## Test on one trusted Wi-Fi network first (optional)

On Windows PowerShell, from this folder, run:

```powershell
$env:HOST = '0.0.0.0'
$env:PORT = '4173'
npm start
```

Run `ipconfig` and find this computer's IPv4 address on the trusted Wi-Fi network. On another device connected to that same Wi-Fi, open `http://YOUR-LAN-IP:4173`, launch Cayden World, choose Bloomtown, and connect. For this local test only, allow the app through the firewall on a **private/trusted network** if Windows asks. Do not configure router port forwarding or expose the development machine directly to the public internet.

## If multiplayer does not connect

- Confirm the health URL returns `{"ok":true,...}`.
- Make sure you deployed a **Web Service**, not a Static Site.
- Check the deployment logs for `CaydenProxy running` and any startup errors.
- Use the same public `https://...` site on both devices and press Connect on both.
- Both players need to be in the same region; start with Bloomtown to avoid level-gate confusion.
- A free host can sleep when idle and wake on new traffic, so the first load may take a while. A server restart drops current room connections; reconnect after it wakes or redeploys.
- Keep this deployment to one service instance for now. Online room membership is held in memory in one Node process; multiple instances would need a shared pub/sub service to pass room events between them.

## Current multiplayer scope and next backend needs

Implemented now: live private room presence, six-character room codes, room isolation, human avatar/name display, position broadcasts, region-aware rooms, connect/disconnect state, NPC dialogue, portable avatar appearance codes, and allow-listed emotes/quick phrases.

Not implemented: durable accounts, password recovery, friends list, public free-text chat, moderation tools, cloud saves, cross-device XP/economy, secure item trading, home/garden/lab visits, persistent player locations, or room synchronization across multiple server instances. Add identity, moderation, durable storage, and shared messaging before expanding public social features.
