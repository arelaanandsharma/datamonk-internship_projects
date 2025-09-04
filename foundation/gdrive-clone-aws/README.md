# Google Drive Clone (React + Node/Express + SQLite + S3) – Dockerized

**Features**
- List files (metadata in SQLite)
- Upload file (stored in S3, metadata in SQLite)
- Delete file (from S3 + SQLite)
- Frontend: React (Vite + Tailwind), served via Nginx
- Backend: Node/Express + better-sqlite3 + AWS SDK v3
- Dockerized with `docker-compose` (web + api)
- Works behind Nginx proxy so frontend can call `/api/...` without CORS hassles

---

## 1) AWS Setup (once)

1. **Create S3 bucket**
   - Name: `your-bucket-name` (globally unique)
   - Region: `ap-south-1` (Mumbai) or your choice.
   - Block all public access (recommended).



## 2) Local Dev (optional)

```bash
# 1) Create .env for API
cp server/.env.example server/.env
# edit server/.env with your AWS keys + bucket + region

# 2) Start with Docker
docker compose up --build
# open http://localhost in your browser
```

---

## 3) Deploy on AWS EC2 (Ubuntu 22.04/24.04 recommended)

**Security Group (very important):**
- Inbound: TCP 22 (SSH), TCP 80 (HTTP). Optional: TCP 4000 for debugging API directly.
- Outbound: allow all.

**Install Docker & Compose:**
```bash
# On Ubuntu
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Optional: run docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

**Copy code to EC2 and run:**
```bash
# On your laptop
scp -r gdrive-clone-aws ubuntu@EC2_PUBLIC_IP:~

# On the EC2 instance
cd ~/gdrive-clone-aws
cp server/.env.example server/.env
nano server/.env   # paste your real AWS creds + bucket + region

docker compose up --build -d
# Wait for images to build, then open: http://EC2_PUBLIC_IP/
```

---

## Endpoints (served behind Nginx)
- `GET /api/files` – list metadata
- `POST /api/upload` – multipart form upload (field name: `file`)
- `DELETE /api/files/:id` – delete from S3 + DB

---

## Notes
- SQLite database file is persisted in a named Docker volume `db-data`.
- Maximum upload size default: 50 MB (change in server `multer` config).
