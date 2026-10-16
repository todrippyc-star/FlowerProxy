# Make Cayden World a website (beginner guide)

This guide puts the current Node.js build online so you can send friends a website link. It does not require you to write server code. The site becomes public, so do not upload passwords, API keys, or your Founder key.

## 1. Download and extract

1. Download `CaydenProxy-Phase-14-Final.zip` from the ChatGPT reply.
2. Right-click the ZIP and choose **Extract All**.
3. Open the extracted `CaydenProxy` folder. You should see `index.html`, `server.js`, `package.json`, `render.yaml`, `assets`, and `scripts`.

## 2. Put the project on GitHub

1. Sign in to [GitHub](https://github.com/).
2. Click **New repository** and name it `cayden-world`.
3. Choose **Private** while testing and create the empty repository. Do not add a README or `.gitignore` in the GitHub form.
4. If Git is installed on your computer, open PowerShell in the extracted project folder and run these commands, replacing `YOUR-USERNAME`:

```powershell
git init
git add .
git commit -m "Cayden World final batch"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cayden-world.git
git push -u origin main
```

Sign in when Git prompts you. If you do not have Git installed, install it from [git-scm.com](https://git-scm.com/) first, or use GitHub's web upload for the project files.

## 3. Deploy the server with Render

1. Open [Render Dashboard](https://dashboard.render.com/).
2. Choose **New + → Blueprint** (or create a Web Service if Blueprint is unavailable).
3. Connect the `cayden-world` GitHub repository and select `main`.
4. If Render reads `render.yaml`, review the service settings. If you configure it manually, use:
   - Runtime: Node
   - Build command: `npm test`
   - Start command: `npm start`
   - Health check path: `/api/health`
   - Environment variable `HOST`: `0.0.0.0`
5. Deploy and wait for the build to finish. If the build fails, open the logs and fix the first reported error before retrying.

## 4. Open the website

Render will assign a URL similar to `https://cayden-world-xxxx.onrender.com`. Your actual URL will be different.

1. Open `https://YOUR-RENDER-URL.onrender.com/api/health`. A healthy service returns JSON containing `"ok":true`.
2. Open the homepage at `https://YOUR-RENDER-URL.onrender.com`.
3. Open **Cayden World RPG**, customize your human avatar, and explore Bloomtown.
4. To test multiplayer, leave the room code blank and press **Connect**. Copy the generated room code and open the same site on a second device. Enter the code on the second device and press **Connect**. Both players must be in the same region to see each other.

## 5. Make it your own address (optional)

Render assigns a default address automatically. You can add a custom domain in the Render service settings later; you will need to own that domain and follow Render's DNS instructions.

## Important limitations

- The free Render web service may sleep after inactivity, so the first visit can be slow while it wakes.
- Room codes and live positions are temporary server memory. The room disappears after everyone leaves or the server restarts.
- Accounts, password recovery, online profile saves, item trading, home/garden/lab visits, and synced XP/coins are not part of this build yet. Character appearance codes only transfer avatar appearance.
- For safety, keep the GitHub repository private while you are learning the deployment process and never commit secret keys.
