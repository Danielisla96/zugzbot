#!/bin/bash
# ==============================================================================
#  export_pdfs.sh
#  Exportador de documentación de OpenCode a PDF (Compatible con Bash 3.2)
# ==============================================================================

# Colores premium para output
COLOR_HEADER='\033[38;5;81m'
COLOR_SUCCESS='\033[38;5;120m'
COLOR_ERROR='\033[38;5;196m'
COLOR_MUTED='\033[38;5;244m'
NC='\033[0m'

echo -e "${COLOR_HEADER}🚀 Iniciando Exportador de PDFs de OpenCode...${NC}"

# 1. Crear el directorio de destino
TARGET_DIR="docs_opencode"
mkdir -p "$TARGET_DIR"
echo -e "  ${COLOR_MUTED}▪ Carpeta de destino '${TARGET_DIR}' creada/verificada.${NC}"

# 2. Localizar Google Chrome en macOS
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -f "$CHROME_PATH" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: Google Chrome no se encontró en la ruta estándar de macOS:${NC}"
    echo -e "     ${COLOR_MUTED}$CHROME_PATH${NC}"
    echo -e "     Asegúrate de tener Chrome instalado en tu carpeta de Aplicaciones."
    exit 1
fi

# 3. URLs y nombres de archivos de destino
URLS=(
    "https://opencode.ai/docs/es/tools/"
    "https://opencode.ai/docs/es/rules/"
)
OUTPUTS=(
    "$TARGET_DIR/tools.pdf"
    "$TARGET_DIR/rules.pdf"
)

# 4. Procesar cada página
for i in "${!URLS[@]}"; do
    url="${URLS[$i]}"
    output="${OUTPUTS[$i]}"
    
    echo -e "\n  ${COLOR_HEADER}▪ Exportando:${NC} $url"
    echo -e "    ${COLOR_MUTED}Destino:${NC} $output"
    
    # Ejecutar Chrome en modo headless para imprimir a PDF
    "$CHROME_PATH" \
        --headless \
        --disable-gpu \
        --no-sandbox \
        --print-to-pdf="$output" \
        "$url" >/dev/null 2>&1
    
    if [ $? -eq 0 ] && [ -f "$output" ]; then
        echo -e "    ${COLOR_SUCCESS}✓ ¡Exportado con éxito!${NC} ($(du -sh "$output" | cut -f1))"
    else
        echo -e "    ${COLOR_ERROR}❌ Error al exportar la página.${NC}"
    fi
done

echo -e "\n${COLOR_SUCCESS}🎉 ¡Proceso finalizado! Los PDFs quedaron ordenados en la carpeta '${TARGET_DIR}'.${NC}\n"
