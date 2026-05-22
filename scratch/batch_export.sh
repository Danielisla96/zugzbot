#!/bin/bash
# ==============================================================================
#  batch_export.sh
#  Exportador Masivo de Documentación de OpenCode a Markdown y PDF
# ==============================================================================

# Colores premium para output
COLOR_HEADER='\033[38;5;81m'
COLOR_SUCCESS='\033[38;5;120m'
COLOR_ERROR='\033[38;5;196m'
COLOR_MUTED='\033[38;5;244m'
COLOR_INFO='\033[38;5;220m'
NC='\033[0m'

echo -e "${COLOR_HEADER}🚀 Iniciando Exportación Masiva de Documentación...${NC}"

# 1. Crear directorios
TARGET_DIR="docs_opencode"
mkdir -p "$TARGET_DIR"
mkdir -p "scratch"
echo -e "  ${COLOR_MUTED}▪ Carpeta de destino '${TARGET_DIR}' verificada.${NC}"

# 2. Localizar Google Chrome en macOS
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -f "$CHROME_PATH" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: Google Chrome no se encontró en la ruta estándar de macOS:${NC}"
    echo -e "     ${COLOR_MUTED}$CHROME_PATH${NC}"
    echo -e "     Asegúrate de tener Chrome instalado en tu carpeta de Aplicaciones para exportar PDFs."
    exit 1
fi

# 3. Lista de páginas a procesar
PAGES=(
    "agents"
    "models"
    "themes"
    "keybinds"
    "commands"
    "formatters"
    "permissions"
    "lsp"
    "mcp-servers"
    "acp"
    "skills"
    "custom-tools"
    "sdk"
    "server"
    "plugins"
    "ecosystem"
)

# 4. Procesar cada página
for name in "${PAGES[@]}"; do
    url="https://opencode.ai/docs/es/${name}/"
    temp_html="scratch/temp_${name}.html"
    out_md="${TARGET_DIR}/${name}.md"
    out_pdf="${TARGET_DIR}/${name}.pdf"
    
    echo -e "\n${COLOR_INFO}======================================================================${NC}"
    echo -e "${COLOR_HEADER}📦 Procesando: [${name}]${NC}"
    echo -e "   ${COLOR_MUTED}URL:${NC} $url"
    
    # --- PASO A: DESCARGAR HTML ---
    echo -e "   ${COLOR_MUTED}▪ Descargando HTML...${NC}"
    curl -sL "$url" -o "$temp_html"
    
    if [ ! -f "$temp_html" ] || [ ! -s "$temp_html" ]; then
        echo -e "   ${COLOR_ERROR}❌ Error al descargar HTML para: ${name}${NC}"
        continue
    fi
    
    # --- PASO B: PARSEAR A MD ---
    echo -e "   ${COLOR_MUTED}▪ Convirtiendo a Markdown (.md) limpio...${NC}"
    python3 scratch/parse_docs.py "$temp_html" "$out_md"
    
    if [ $? -eq 0 ] && [ -f "$out_md" ]; then
        echo -e "   ${COLOR_SUCCESS}✓ Markdown generado con éxito:${NC} ${out_md} ($(du -sh "$out_md" | cut -f1))"
    else
        echo -e "   ${COLOR_ERROR}❌ Error al parsear Markdown para: ${name}${NC}"
    fi
    
    # Limpiar HTML temporal
    rm -f "$temp_html"
    
    # --- PASO C: EXPORTAR A PDF CON CHROME HEADLESS ---
    echo -e "   ${COLOR_MUTED}▪ Imprimiendo a PDF (.pdf) de alta fidelidad...${NC}"
    "$CHROME_PATH" \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --print-to-pdf="$out_pdf" \
        "$url" >/dev/null 2>&1
        
    if [ $? -eq 0 ] && [ -f "$out_pdf" ]; then
        echo -e "   ${COLOR_SUCCESS}✓ PDF generado con éxito:${NC} ${out_pdf} ($(du -sh "$out_pdf" | cut -f1))"
    else
        echo -e "   ${COLOR_ERROR}❌ Error al exportar PDF para: ${name}${NC}"
    fi
done

echo -e "\n${COLOR_SUCCESS}🎉 ¡Proceso masivo completado con éxito! Todos los archivos están en '${TARGET_DIR}'${NC}\n"
