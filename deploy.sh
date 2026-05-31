#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  SJC Counselling & Guidance Unit — VPS Deploy Script (PM2 Version)
#  St. Joseph's College, Anuradhapura  |  sjc.lk
#
#  What this does:
#    1. Installs Node.js & PM2 (if not present)
#    2. Copies site files to /var/www/sjc
#    3. Serves the site using PM2 on port 80
# ═══════════════════════════════════════════════════════════════════

set -e

# ── CONFIGURATION ──────────────────────────────────────────────────
DOMAIN="cgu.jakenetwork.xyz"
SITE_DIR="/var/www/sjc"
PORT=80

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${CYAN}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  SJC Counselling & Guidance Unit — PM2 Deploy    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

if [[ $EUID -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

# ── 1. INSTALL NODE.JS & PM2 ────────────────────────────────────────
info "Checking for Node.js and PM2..."
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  info "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
  $SUDO apt-get install -y nodejs
fi

if ! command -v pm2 &>/dev/null; then
  info "Installing PM2..."
  $SUDO npm install -g pm2
fi
log "Node.js and PM2 are installed."

# ── 2. COPY SITE FILES ──────────────────────────────────────────────
info "Setting up directory at ${SITE_DIR}..."
$SUDO mkdir -p "$SITE_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$SUDO rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='deploy.sh' \
  --exclude='*.sh' \
  --exclude='.DS_Store' \
  --exclude='*.zip' \
  "${SCRIPT_DIR}/" "${SITE_DIR}/"

$SUDO chown -R $USER:$USER "$SITE_DIR"
log "Files copied."

# ── 3. START PM2 ────────────────────────────────────────────────────
info "Starting PM2 Server..."

# Stop it if it's already running
$SUDO pm2 delete sjc-cgu &>/dev/null || true

# Serve the directory
# --spa handles routing (like try_files $uri /index.html)
$SUDO pm2 serve "$SITE_DIR" $PORT --name "sjc-cgu" --spa

# Save pm2 state to start on boot
$SUDO pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root &>/dev/null || true

log "Site is live via PM2 on port $PORT!"

echo ""
echo -e "${GREEN}Deploy complete!${NC}"
echo -e "  URL: http://${DOMAIN}"
echo -e "  To check logs: ${YELLOW}pm2 logs sjc-cgu${NC}"
echo ""
