# Laravel Forge Deployment Guide

This project runs a Node.js server (Express + Socket.IO) that also serves the built frontend.

Use this guide to deploy on **one Forge server / one site**.

## 1) Forge Site Type

Create the site as **Other** in Forge.

## 2) Install NVM + Node (as `forge` user)

SSH into your server and run:

```bash
cd /home/forge
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

export NVM_DIR="/home/forge/.nvm"
. "$NVM_DIR/nvm.sh"

nvm install 22.13.0
nvm alias default 22.13.0
node -v
npm -v
```

## 3) Add Daemon in Forge

In **Server -> Daemons**, create a daemon with:

- User: `forge`
- Command:

```bash
bash -lc 'export NVM_DIR="/home/forge/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22.13.0; cd /home/forge/drawing-game.on-forge.com/current; npm start'
```

Replace the path if your site folder is different.

## 4) Deploy Script

Use this deploy script:

```bash
$CREATE_RELEASE()

cd $FORGE_RELEASE_DIRECTORY

export NVM_DIR="/home/forge/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 22.13.0

npm ci
cd client
npm ci
npm run build
cd ..

$ACTIVATE_RELEASE()

# Replace with your actual daemon id/name from Forge
sudo -S supervisorctl restart daemon-823363:*
```

## 5) Nginx Proxy (Required)

Edit the Forge-generated site config include file:

```bash
sudo nano /etc/nginx/forge-conf/3197843/site.conf
```

Find:

```nginx
location / {
    try_files $uri $uri/ =404;
}
```

Replace with:

```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Then test and reload:

```bash
sudo nginx -t
sudo service nginx reload
```

## 6) Verify Runtime

Check daemon status:

```bash
sudo supervisorctl status
```

Smoke test:

1. Open the site in two tabs.
2. Join with two names.
3. Confirm drawing, chat, and turn updates sync between tabs.

## 7) Common Issues

- `nvm: command not found`:
  - Ensure deploy script sources `/home/forge/.nvm/nvm.sh`.
- `ERROR (no such process)` on restart:
  - Use the actual daemon name/id from Forge (example: `daemon-823363:*`), not a guessed name.
- Site shows 404:
  - Nginx is still serving static/PHP defaults; ensure `location /` proxies to `127.0.0.1:5000`.

