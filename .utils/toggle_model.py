#!/usr/bin/env python3
import sys
import os
import json
import re
import curses
import subprocess

# ==============================================================================
# CONFIGURACIÓN Y RUTAS
# ==============================================================================
AGENTS_LIST = ["sdd-orchestrator", "sdd-spec-writer", "sdd-coder", "sdd-tester", "sdd-deployer"]


def get_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    opencode_json = os.path.join(project_root, "opencode.json")
    agents_dir = os.path.join(project_root, ".opencode", "agents")
    models_json = os.path.join(project_root, "models.json")
    return opencode_json, agents_dir, models_json


def fetch_available_models(silent=False):
    """Obtiene los modelos disponibles ejecutando el comando de opencode de forma dinámica."""
    if not silent:
        print("🔍 Cargando modelos desde opencode...", end="", flush=True)
    
    try:
        # Ejecutar 'opencode models' con un timeout de 4 segundos
        res = subprocess.run(["opencode", "models"], capture_output=True, text=True, timeout=4)
        if res.returncode == 0 and res.stdout.strip():
            models = [line.strip() for line in res.stdout.strip().split("\n") if line.strip()]
            if not silent:
                print(" ¡Listo! 🎉")
            return models
    except Exception:
        pass
    
    if not silent:
        print(" (Usando lista de respaldo de emergencia) ⚠️")
        
    # Lista de respaldo en caso de que opencode models falle
    return [
        "google/gemini-3.5-flash",
        "google/gemini-3.1-pro-preview",
        "google/gemini-2.5-pro",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-v4-flash",
        "deepseek/deepseek-reasoner",
        "opencode/deepseek-v4-flash-free",
        "opencode/nemotron-3-ultra-free",
        "opencode/mimo-v2.5-free",
        "opencode/big-pickle",
    ]


def load_models_config():
    opencode_json, agents_dir, models_json = get_paths()
    default_config = {
        "global": "google/gemini-3.5-flash",
        "sdd-orchestrator": "",
        "sdd-spec-writer": "",
        "sdd-coder": "",
        "sdd-tester": "",
        "sdd-deployer": ""
    }
    
    if os.path.exists(models_json):
        try:
            with open(models_json, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
            
    try:
        with open(models_json, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2)
    except Exception:
        pass
    return default_config


def save_models_config(config):
    _, _, models_json = get_paths()
    try:
        with open(models_json, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error guardando models.json: {e}", file=sys.stderr)


def apply_model(agent_models):
    opencode_json, agents_dir, _ = get_paths()

    if not os.path.exists(opencode_json):
        print(f"Error: No se encontró {opencode_json}", file=sys.stderr)
        sys.exit(1)

    # 1. Actualizar opencode.json
    with open(opencode_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    agents_config = data.get("agent", {})
    for agent_name, agent_cfg in agents_config.items():
        if agent_name in agent_models:
            agent_cfg["model"] = agent_models[agent_name]

    with open(opencode_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("  -> opencode.json actualizado con éxito.")

    # 2. Actualizar frontmatter de agentes (.md)
    if os.path.exists(agents_dir):
        for filename in os.listdir(agents_dir):
            if filename.endswith(".md"):
                agent_name = filename[:-3]
                if agent_name in agent_models:
                    target_model = agent_models[agent_name]
                    filepath = os.path.join(agents_dir, filename)

                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    frontmatter_pattern = re.compile(
                        r"^---$(.*?)^---$", re.MULTILINE | re.DOTALL
                    )
                    match = frontmatter_pattern.search(content)
                    if match:
                        frontmatter = match.group(1)
                        if "model:" in frontmatter:
                            new_frontmatter = re.sub(
                                r"^model:.*?$",
                                f"model: {target_model}",
                                frontmatter,
                                flags=re.MULTILINE,
                            )
                            new_content = content.replace(
                                frontmatter, new_frontmatter, 1
                            )
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"  -> {filename} actualizado a: {target_model}")
    else:
        print(f"Advertencia: Directorio de agentes {agents_dir} no existe.")


# ==============================================================================
# INTERFAZ INTERACTIVA TUI (CURSES)
# ==============================================================================

def select_model_tui(stdscr, title, current_val, models_list, is_global=False):
    """Pantalla interactiva de búsqueda con filtro en tiempo real para seleccionar un modelo."""
    stdscr.keypad(True)
    curses.curs_set(1)  # Mostrar cursor para el buscador
    
    query = ""
    selected_idx = 0
    
    while True:
        stdscr.clear()
        
        # 1. Preparar lista de opciones filtrada
        options = []
        if not is_global:
            options.append("")  # Representa [Heredar del Global]
            
        filtered_models = [m for m in models_list if query.lower() in m.lower()]
        options.extend(filtered_models)
        
        # Ajustar límites de selección
        if selected_idx >= len(options):
            selected_idx = max(0, len(options) - 1)
            
        # 2. Renderizar interfaz (Estilo minimalista y sobrio)
        stdscr.addstr(1, 2, f"┌─── {title} ───┐", curses.A_BOLD)
        stdscr.addstr(2, 2, "│ Escribe para buscar en tiempo real, [↑/↓] navega, [Enter] confirma. │", curses.A_DIM)
        stdscr.addstr(3, 2, "│ Presiona [ESC] para cancelar y volver atrás sin guardar.            │", curses.A_DIM)
        
        # Input de búsqueda
        stdscr.addstr(5, 2, "🔍 Buscar: ")
        stdscr.addstr(5, 13, query, curses.A_BOLD)
        
        # Línea divisoria discreta
        stdscr.addstr(6, 2, "─" * 70, curses.A_DIM)
        
        # Mostrar opciones paginadas
        start_row = 8
        max_rows = curses.LINES - start_row - 2
        
        if not options:
            stdscr.addstr(start_row, 4, "No hay modelos que coincidan con la búsqueda.", curses.A_BOLD)
        else:
            for i in range(min(len(options), max_rows)):
                opt = options[i]
                row = start_row + i
                
                # Formatear el texto a mostrar
                if opt == "":
                    label = "  [ Heredar del Modelo Global ]"
                else:
                    label = f"  {opt}"
                    
                # Añadir tag si es el actualmente activo
                if opt == current_val:
                    label += "  (activo)"
                
                # Resaltar la opción seleccionada
                if i == selected_idx:
                    stdscr.attron(curses.A_REVERSE)
                    stdscr.addstr(row, 2, f" {label:<66} ")
                    stdscr.attroff(curses.A_REVERSE)
                else:
                    stdscr.addstr(row, 2, f" {label:<66}")
                    
        # Mover el cursor al final de la búsqueda para feedback visual
        stdscr.move(5, 13 + len(query))
        stdscr.refresh()
        
        # 3. Procesar teclado
        try:
            key = stdscr.getch()
        except KeyboardInterrupt:
            return None
            
        if key in (27, curses.KEY_CANCEL):  # ESC
            return None
        elif key in (10, 13, curses.KEY_ENTER):  # Enter
            if options:
                return options[selected_idx]
            return None
        elif key == curses.KEY_UP:
            if selected_idx > 0:
                selected_idx -= 1
        elif key == curses.KEY_DOWN:
            if selected_idx < len(options) - 1:
                selected_idx += 1
        elif key in (127, 8, curses.KEY_BACKSPACE):  # Backspace
            query = query[:-1]
            selected_idx = 0
        elif 32 <= key <= 126:  # Caracteres imprimibles
            query += chr(key)
            selected_idx = 0


def main_tui(stdscr, models_list):
    """Menú de configuración principal."""
    stdscr.keypad(True)
    curses.curs_set(0)  # Ocultar cursor físico
    curses.use_default_colors()  # Respetar fondo de la terminal del usuario
    
    config = load_models_config()
    selected_row = 0
    
    while True:
        stdscr.clear()
        
        # Cabecera moderna y minimalista
        stdscr.addstr(1, 2, "🤖 ZUGZBOT: CONFIGURACIÓN DE MODELOS", curses.A_BOLD)
        stdscr.addstr(2, 2, "Navega con [↑/↓], pulsa [Enter] para cambiar el modelo de un agente.", curses.A_DIM)
        stdscr.addstr(3, 2, "Presiona [G] para guardar y aplicar, o [ESC]/[Q] para salir sin cambios.", curses.A_DIM)
        stdscr.addstr(4, 2, "═" * 74, curses.A_BOLD)
        
        # Construir items de la tabla
        global_val = config.get("global", "google/gemini-3.5-flash")
        
        menu_items = [
            ("global", "Modelo Global (Defecto)", global_val),
        ]
        
        for agent in AGENTS_LIST:
            val = config.get(agent, "")
            label = val if val else f"Heredado -> {global_val}"
            menu_items.append((agent, agent, label))
            
        # Añadir opciones de acción al menú
        menu_items.append(("save", "  [✓] GUARDAR Y APLICAR CAMBIOS", ""))
        menu_items.append(("cancel", "  [✗] CANCELAR Y SALIR", ""))
        
        # Dibujar cabecera de la tabla
        start_row = 6
        stdscr.addstr(start_row, 4, f"{'AGENTE / CONTEXTO':<28} │ {'MODELO ASIGNADO':<35}", curses.A_BOLD)
        stdscr.addstr(start_row + 1, 2, "─" * 74, curses.A_DIM)
        
        # Renderizar cada fila
        item_start_row = start_row + 2
        for idx, item in enumerate(menu_items):
            key, col1, col2 = item
            row = item_start_row + idx
            
            # Formatear fila
            if key in ("save", "cancel"):
                text = f" {col1:<70} "
            else:
                text = f"  {col1:<26} │ {col2:<38} "
                
            # Resaltar la fila seleccionada
            if idx == selected_row:
                stdscr.attron(curses.A_REVERSE)
                stdscr.addstr(row, 2, f" {text:<70} ")
                stdscr.attroff(curses.A_REVERSE)
            else:
                if key == "save":
                    stdscr.addstr(row, 2, f" {text:<70} ", curses.A_BOLD)
                elif key == "cancel":
                    stdscr.addstr(row, 2, f" {text:<70} ", curses.A_DIM)
                elif key == "global":
                    stdscr.addstr(row, 2, f" {text:<70} ", curses.A_BOLD)
                else:
                    stdscr.addstr(row, 2, f" {text:<70} ")
                    
        stdscr.refresh()
        
        # Leer teclas
        try:
            key = stdscr.getch()
        except KeyboardInterrupt:
            break
            
        if key in (ord('q'), ord('Q'), 27):  # Q o ESC
            break
        elif key in (ord('g'), ord('G')):  # G para Guardar directo
            apply_and_exit(config)
            break
        elif key == curses.KEY_UP:
            if selected_row > 0:
                selected_row -= 1
        elif key == curses.KEY_DOWN:
            if selected_row < len(menu_items) - 1:
                selected_row += 1
        elif key in (10, 13, curses.KEY_ENTER):
            action_key = menu_items[selected_row][0]
            
            if action_key == "save":
                apply_and_exit(config)
                break
            elif action_key == "cancel":
                break
            elif action_key == "global":
                # Cambiar modelo global
                new_val = select_model_tui(stdscr, "SELECCIONAR MODELO GLOBAL POR DEFECTO", global_val, models_list, is_global=True)
                if new_val is not None:
                    config["global"] = new_val
                    save_models_config(config)
            else:
                # Cambiar modelo de un agente específico
                current_agent_val = config.get(action_key, "")
                new_val = select_model_tui(stdscr, f"SELECCIONAR MODELO PARA {action_key.upper()}", current_agent_val, models_list, is_global=False)
                if new_val is not None:
                    config[action_key] = new_val
                    save_models_config(config)


def apply_and_exit(config):
    save_models_config(config)
    
    global_model = config.get("global", "google/gemini-3.5-flash")
    final_agent_models = {}
    
    print("\n" + "=" * 60)
    print("📋 MAPEO DE MODELOS APLICADO:")
    print("=" * 60)
    for agent_name in AGENTS_LIST:
        custom_val = config.get(agent_name, "")
        final_model = custom_val if custom_val else global_model
        final_agent_models[agent_name] = final_model
        origin = "Personalizado" if custom_val else "Heredado del Global"
        print(f"  * {agent_name:<18} -> {final_model:<30} ({origin})")
        
    print("\nAplicando cambios en los archivos de configuración...")
    apply_model(final_agent_models)
    print("\n🎉 Configuración completada con éxito.")


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================

def main():
    args = sys.argv[1:]
    config = load_models_config()

    # Si es modo CLI rápido sin argumentos, o se pide listar
    if args and args[0] in ("--list", "-l", "list"):
        models = fetch_available_models(silent=True)
        print("\nModelos disponibles en opencode:")
        for m in models:
            print(f"  - {m}")
        sys.exit(0)

    # Si se pasan argumentos, procesa actualización por CLI no-interactiva rápida
    if args:
        query = args[0]
        models = fetch_available_models(silent=True)
        matches = [m for m in models if query.lower() in m.lower()]

        if not matches:
            print(f"Error: Ningún modelo coincide con '{query}'.", file=sys.stderr)
            sys.exit(1)
        elif len(matches) == 1:
            selected_model = matches[0]
        else:
            selected_model = matches[0]
            print(f"Múltiples coincidencias para '{query}':")
            for m in matches:
                print(f"  * {m}")
            print(f"Seleccionando la primera por defecto: {selected_model}\n")
            
        config["global"] = selected_model
        apply_and_exit(config)
    else:
        # Modo interactivo elegante con curses
        models_list = fetch_available_models(silent=False)
        curses.wrapper(main_tui, models_list)


if __name__ == "__main__":
    main()