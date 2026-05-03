#!/usr/bin/env bash
# start.sh – launch the dealership demo (backend + frontend)
#
# Usage:
#   ./start.sh              # starts everything, prompts for MySQL password
#   ./start.sh --seed       # drops and re-seeds the DB before starting
#
# Env vars (optional, skips prompts):
#   MYSQL_USER      default: root
#   MYSQL_PASSWORD  default: (empty / prompted)

set -euo pipefail

# ── colours ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'
YELLOW='\033[1;33m'; BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

# ── paths ─────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend/dealership-project"
SQL_FILE="$SCRIPT_DIR/database/schema.sql"
BACKEND_LOG="/tmp/dealership-backend.log"
FRONTEND_LOG="/tmp/dealership-frontend.log"

BACKEND_PID=""
FRONTEND_PID=""
RESEED=false

# ── parse flags ───────────────────────────────────────────────
for arg in "$@"; do
    [[ "$arg" == "--seed" ]] && RESEED=true
done

# ── cleanup on Ctrl-C / exit ──────────────────────────────────
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services…${NC}"
    if lsof -ti:8080 &>/dev/null; then
        lsof -ti:8080 | xargs kill 2>/dev/null || true
        echo "  Backend stopped"
    fi
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        echo "  Frontend stopped"
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM SIGHUP EXIT

# ── helpers ───────────────────────────────────────────────────
info()    { echo -e "${BLUE}▸ $*${NC}"; }
success() { echo -e "${GREEN}✓ $*${NC}"; }
error()   { echo -e "${RED}✗ $*${NC}" >&2; exit 1; }

require() {
    command -v "$1" &>/dev/null || error "'$1' not found – please install it before running this script."
}

# ── banner ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   🚗  Dealership Demo  –  start.sh   ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""

# ── check required tools ──────────────────────────────────────
require mvn
require node
require mysql

# ── MySQL credentials ─────────────────────────────────────────
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_PASSWORD:-__unset__}"

if [[ "$DB_PASS" == "__unset__" ]]; then
    read -rsp "MySQL password for '$DB_USER' (press Enter for none): " DB_PASS
    echo ""
fi

# Build the mysql command array
if [[ -z "$DB_PASS" ]]; then
    MYSQL_CMD=(mysql -u"$DB_USER")
else
    MYSQL_CMD=(mysql -u"$DB_USER" -p"$DB_PASS")
fi

# ── test MySQL connection ─────────────────────────────────────
info "Testing MySQL connection…"
"${MYSQL_CMD[@]}" -e "SELECT 1" > /dev/null 2>&1 \
    || error "Cannot connect to MySQL as '$DB_USER'. Check your credentials and make sure MySQL is running."
success "MySQL OK"

# ── create / seed database ────────────────────────────────────
if $RESEED; then
    info "Re-seeding database (--seed flag)…"
    "${MYSQL_CMD[@]}" -e "DROP DATABASE IF EXISTS dealership_db;"
fi

info "Running database/schema.sql…"
"${MYSQL_CMD[@]}" < "$SQL_FILE"
success "Database ready"

# ── frontend deps ─────────────────────────────────────────────
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    info "Installing frontend dependencies (first run)…"
    npm install --prefix "$FRONTEND_DIR" --silent
    success "Dependencies installed"
fi

# ── export Spring datasource vars so mvn picks them up ───────
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/dealership_db"
export SPRING_DATASOURCE_USERNAME="$DB_USER"
export SPRING_DATASOURCE_PASSWORD="$DB_PASS"

# ── kill any stale process(es) on port 8080 ──────────────────
if lsof -ti:8080 &>/dev/null; then
    info "Killing stale process(es) on port 8080…"
    lsof -ti:8080 | xargs kill 2>/dev/null || true
    sleep 2
fi

# ── start backend ─────────────────────────────────────────────
info "Starting Spring Boot backend on :8080…"
(cd "$BACKEND_DIR" && mvn -q spring-boot:run > "$BACKEND_LOG" 2>&1) &
BACKEND_PID=$!

echo -n "  Waiting for backend"
for i in {1..40}; do
    if curl -sf http://localhost:8080/api/vehicles > /dev/null 2>&1; then
        echo -e "  ${GREEN}ready!${NC}"; break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo ""
        error "Backend process died. See $BACKEND_LOG for details."
    fi
    echo -n "."
    sleep 3
done

# ── start frontend ────────────────────────────────────────────
info "Starting Next.js frontend on :3000…"
(cd "$FRONTEND_DIR" && npm run dev > "$FRONTEND_LOG" 2>&1) &
FRONTEND_PID=$!

echo -n "  Waiting for frontend"
for i in {1..20}; do
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  ${GREEN}ready!${NC}"; break
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo ""
        error "Frontend process died. See $FRONTEND_LOG for details."
    fi
    echo -n "."
    sleep 3
done

# ── ready ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}All services running!${NC}"
echo ""
echo -e "  ${BLUE}Frontend${NC}   →  http://localhost:3000"
echo -e "  ${BLUE}Backend${NC}    →  http://localhost:8080"
echo ""
echo -e "${BOLD}Demo login credentials  (password: demo123)${NC}"
echo -e "  General Manager  │  ${YELLOW}gmanager${NC}"
echo -e "  Sales Associate  │  ${YELLOW}jsmith${NC}"
echo -e "  Finance Manager  │  ${YELLOW}mwilson${NC}"
echo -e "  Lot Manager      │  ${YELLOW}tlot${NC}"
echo -e "  Service Advisor  │  ${YELLOW}stech${NC}"
echo ""
echo -e "Logs:  $BACKEND_LOG"
echo -e "       $FRONTEND_LOG"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# ── keep alive ────────────────────────────────────────────────
# poll both services via HTTP; exit if either stops responding
while true; do
    sleep 10
    if ! curl -sf http://localhost:8080/api/vehicles > /dev/null 2>&1; then
        echo -e "${RED}Backend stopped responding. See $BACKEND_LOG${NC}"
        exit 1
    fi
    if ! curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${RED}Frontend stopped responding. See $FRONTEND_LOG${NC}"
        exit 1
    fi
done
