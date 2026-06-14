#!/usr/bin/env bash
set -euo pipefail

# .opencode/tools/save-playwright-artifacts.sh
# Promueve los artefactos de Playwright MCP (.openspec/.playwright/) a la
# carpeta de la sesión SDD activa, conservando el call-id como subcarpeta.
#
# Uso:
#   .opencode/tools/save-playwright-artifacts.sh                # promueve el call más reciente (copy)
#   .opencode/tools/save-playwright-artifacts.sh <call-id>      # promueve un call específico
#   .opencode/tools/save-playwright-artifacts.sh --move         # mueve en vez de copiar
#   .opencode/tools/save-playwright-artifacts.sh --dry-run      # solo muestra qué haría
#   .opencode/tools/save-playwright-artifacts.sh --list         # lista los call-ids disponibles

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_FILE="$PROJECT_ROOT/.openspec/sdd_state.json"
SOURCE_BASE="$PROJECT_ROOT/.openspec/.playwright"

MODE="copy"
CALL_ID=""
DRY_RUN=0
LIST_ONLY=0

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --move)    MODE="move"; shift ;;
    --copy)    MODE="copy"; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --list)    LIST_ONLY=1; shift ;;
    -h|--help) usage ;;
    -*)        echo "Flag desconocida: $1" >&2; exit 2 ;;
    *)         CALL_ID="$1"; shift ;;
  esac
done

if [[ $LIST_ONLY -eq 1 ]]; then
  if [[ ! -d "$SOURCE_BASE" ]]; then
    echo "(no existe $SOURCE_BASE todavía)"
    exit 0
  fi
  ls -1t "$SOURCE_BASE" 2>/dev/null || true
  exit 0
fi

if [[ ! -f "$STATE_FILE" ]]; then
  echo "ERROR: $STATE_FILE no existe. Inicia una sesión SDD primero." >&2
  exit 1
fi

ACTIVE_CONTRACT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$STATE_FILE','utf8')).activeContract || '')")
if [[ -z "$ACTIVE_CONTRACT" ]]; then
  echo "ERROR: sdd_state.json no tiene activeContract. @sdd-orchestrator debe fijar la sesión." >&2
  exit 1
fi

if [[ -d "$PROJECT_ROOT/$ACTIVE_CONTRACT" ]]; then
  ACTIVE_DIR="$PROJECT_ROOT/$ACTIVE_CONTRACT"
else
  ACTIVE_DIR="$(dirname "$PROJECT_ROOT/$ACTIVE_CONTRACT")"
fi

if [[ ! -d "$ACTIVE_DIR" ]]; then
  echo "ERROR: el directorio del contrato activo '$ACTIVE_DIR' no existe en disco." >&2
  exit 1
fi

if [[ -z "$CALL_ID" ]]; then
  if [[ ! -d "$SOURCE_BASE" ]] || [[ -z "$(ls -A "$SOURCE_BASE" 2>/dev/null)" ]]; then
    echo "ERROR: no hay artefactos en $SOURCE_BASE. Ejecuta Playwright primero." >&2
    exit 1
  fi
  CALL_ID=$(ls -1t "$SOURCE_BASE" | head -1)
fi

SOURCE="$SOURCE_BASE/$CALL_ID"
if [[ ! -e "$SOURCE" ]]; then
  echo "ERROR: $SOURCE no existe." >&2
  echo "Call-ids disponibles:"
  ls -1t "$SOURCE_BASE" 2>/dev/null | sed 's/^/  - /'
  exit 1
fi

DEST="$ACTIVE_DIR/playwright"

# Detectar si es un directorio o un archivo individual (comportamiento de Playwright MCP)
if [[ -d "$SOURCE" ]]; then
  TARGET="$DEST/$CALL_ID"
  
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[DRY-RUN] $MODE $SOURCE -> $TARGET"
    find "$SOURCE" -type f -print | sed 's/^/    /' | head -30
    TOTAL=$(find "$SOURCE" -type f | wc -l | tr -d ' ')
    [[ $TOTAL -gt 30 ]] && echo "    ... ($TOTAL archivos en total)"
    exit 0
  fi

  mkdir -p "$DEST"
  if [[ $MODE == "move" ]]; then
    rm -rf "$TARGET"
    mv "$SOURCE" "$TARGET"
  else
    rm -rf "$TARGET"
    cp -R "$SOURCE" "$TARGET"
  fi
  
  FILE_COUNT=$(find "$TARGET" -type f | wc -l | tr -d ' ')
  SIZE=$(du -sh "$TARGET" | cut -f1)
else
  # Es un archivo. Extraer el timestamp/session ID para agrupar archivos relacionados (ej. page-*.yml y console-*.log)
  SESSION_ID=$(echo "$CALL_ID" | sed -E 's/^(page|console)-//' | sed 's/\.[a-zA-Z0-9]*$//')
  TARGET="$DEST/$SESSION_ID"
  
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[DRY-RUN] $MODE files containing '$SESSION_ID' in $SOURCE_BASE -> $TARGET"
    ls -1 "$SOURCE_BASE"/*"$SESSION_ID"* 2>/dev/null | sed 's/^/    /'
    exit 0
  fi

  mkdir -p "$TARGET"
  shopt -s nullglob
  for f in "$SOURCE_BASE"/*"$SESSION_ID"*; do
    if [[ $MODE == "move" ]]; then
      mv "$f" "$TARGET/"
    else
      cp "$f" "$TARGET/"
    fi
  done
  
  FILE_COUNT=$(find "$TARGET" -type f | wc -l | tr -d ' ')
  SIZE=$(du -sh "$TARGET" | cut -f1)
fi

echo "[OK] $MODE: $FILE_COUNT archivo(s) ($SIZE) -> $TARGET"
echo "     sesion: $ACTIVE_CONTRACT"

# Escanea y mueve de forma automática las capturas ts-*.png y snapshots ts-*.md
# que se hayan guardado en .openspec/ para dejarlas en la carpeta destino.
echo "Limpiando y promoviendo capturas/snapshots temporales en .openspec/..."
shopt -s nullglob
for f in "$PROJECT_ROOT"/.openspec/ts-*; do
  if [[ -f "$f" ]]; then
    mkdir -p "$TARGET"
    mv "$f" "$TARGET/"
    echo "  -> Movido a sesión: $(basename "$f")"
  fi
done

