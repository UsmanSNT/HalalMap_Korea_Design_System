#!/usr/bin/env bash
# Run on the server from the checkout (/opt/halalmap): ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH="${BRANCH:-main}"
git fetch origin "$BRANCH"
git merge --ff-only "origin/$BRANCH"
pnpm install --frozen-lockfile
pnpm check
pnpm build
sudo systemctl restart halalmap
sleep 2
curl -fsS http://127.0.0.1:${PORT:-8787}/api/health && echo " deployed"
