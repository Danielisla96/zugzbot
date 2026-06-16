#!/usr/bin/env python3
import sys
import os
import json
import re
import curses

# ==============================================================================
# LISTA DE MODELOS DISPONIBLES EN OPENCODE
# ==============================================================================
AVAILABLE_MODELS = [
    "opencode/big-pickle",
    "opencode/deepseek-v4-flash-free",
    "opencode/mimo-v2.5-free",
    "opencode/nemotron-3-ultra-free",
    "opencode/north-mini-code-free",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-reasoner",
    "deepseek/deepseek-v4-flash",
    "deepseek/deepseek-v4-pro",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-flash-image",
    "google/gemini-2.5-flash-lite",
    "google/gemini-2.5-flash-preview-tts",
    "google/gemini-2.5-pro",
    "google/gemini-2.5-pro-preview-tts",
    "google/gemini-3-flash-preview",
    "google/gemini-3-pro-image-preview",
    "google/gemini-3.1-flash-image-preview",
    "google/gemini-3.1-flash-lite",
    "google/gemini-3.1-pro-preview",
    "google/gemini-3.1-pro-preview-customtools",
    "google/gemini-3.5-flash",
    "google/gemini-embedding-001",
    "google/gemini-flash-latest",
    "google/gemini-flash-lite-latest",
    "google/gemma-4-26b-a4b-it",
    "google/gemma-4-31b-it",
    "minimax/MiniMax-M2",
    "minimax/MiniMax-M2.1",
    "minimax/MiniMax-M2.5",
    "minimax/MiniMax-M2.5-highspeed",
    "minimax/MiniMax-M2.7",
    "minimax/MiniMax-M2.7-highspeed",
    "minimax/MiniMax-M3",
    "minimax-coding-plan/MiniMax-M2",
    "minimax-coding-plan/MiniMax-M2.1",
    "minimax-coding-plan/MiniMax-M2.5",
    "minimax-coding-plan/MiniMax-M2.5-highspeed",
    "minimax-coding-plan/MiniMax-M2.7",
    "minimax-coding-plan/MiniMax-M2.7-highspeed",
    "minimax-coding-plan/MiniMax-M3",
]

AGENTS_LIST = ["sdd-orchestrator", "sdd-spec-writer", "sdd-coder", "sdd-tester", "sdd-deployer"]


def get_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    opencode_json = os.path.join(project_root, "opencode.json")
    agents_dir = os.path.join(project_root, ".opencode", "agents")
    models_json = os.path.join(project_root, "models.json")
    return opencode_json, agents_dir, models_json


def load_models_config():
    opencode_json, agents_dir, models_json = get_paths()
    default_config = {
        "global": "deepseek/deepseek-v4-flash",
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
            
    # Guardamos el default si no existe
    try:
        with open(models_json, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2)
    except Exception:
        pass
    return default_config


def save_models_config(config):
    opencode_json, agents_dir, models_json = get_paths()
    try:
        with open(models_json, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error guardando models.json: {e}", file=sys.stderr)


def search_model(query):
    query = query.lower()
    matches = [m for m in AVAILABLE_MODELS if query in m.lower()]
    return matches


def apply_model(agent_models):
    opencode_json, agents_dir, models_json = get_paths()

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
                # Quitar extensión .md para comparar con el nombre del agente
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


def print_available_models():
    print("\nModelos disponibles:")
    for m in AVAILABLE_MODELS:
        print(f"  - {m}")
    print()


# ==============================================================================
# INTERFAZ INTERACTIVA TUI (CURSES)
# ==============================================================================

def select_model_tui(stdscr, title, current_val, is_global=False):
    # Habilitar modo keypad para recibir flechas de cursor
    stdscr.keypad(True)
    curses.curs_set(0) # Ocultar cursor físico
    
    # Colores
    curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_CYAN) # Seleccionado
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK) # Buscador
    curses.init_pair(3, curses.COLOR_GREEN, curses.COLOR_BLACK) # Éxito / Info
    
    query = ""
    selected_idx = 0
    
    while True:
        stdscr.clear()
        
        # Obtener lista de modelos y añadir "Heredar del Global" si no es la config global
        options = []
        if not is_global:
            options.append("") # Representa [Heredar del Global]
            
        # Filtrar modelos según query
        filtered_models = [m for m in AVAILABLE_MODELS if query.lower() in m.lower()]
        options.extend(filtered_models)
        
        # Validar límites de selección
        if selected_idx >= len(options):
            selected_idx = max(0, len(options) - 1)
            
        # Títulos
        stdscr.addstr(1, 2, f"=== {title} ===", curses.A_BOLD)
        stdscr.addstr(2, 2, "Escribe caracteres para buscar en tiempo real.", curses.A_DIM)
        stdscr.addstr(3, 2, "Usa [↑/↓] para navegar y [Enter] para confirmar. [ESC] para volver.", curses.A_DIM)
        
        # Caja de búsqueda
        stdscr.addstr(5, 2, "Buscador: ", curses.A_BOLD)
        stdscr.addstr(5, 12, f" {query}█ ", curses.color_pair(2) | curses.A_BOLD)
        stdscr.addstr(6, 2, "-" * 60, curses.A_DIM)
        
        # Mostrar opciones con paginación simple de terminal
        start_row = 8
        max_rows = curses.LINES - start_row - 2
        
        if not options:
            stdscr.addstr(start_row, 4, "No hay modelos que coincidan con la búsqueda.", curses.color_pair(2))
        else:
            # Mostrar solo lo que quepa en la pantalla
            for i in range(min(len(options), max_rows)):
                opt = options[i]
                row = start_row + i
                
                # Formatear el label
                if opt == "":
                    label = "[ Heredar del Global ]"
                else:
                    label = opt
                    
                # Indicar si es el activo actual
                if opt == current_val:
                    label += "  (activo)"
                
                # Resaltar la opción seleccionada
                if i == selected_idx:
                    stdscr.attron(curses.color_pair(1))
                    stdscr.addstr(row, 2, f" > {label:<50} ")
                    stdscr.attroff(curses.color_pair(1))
                else:
                    stdscr.addstr(row, 2, f"   {label:<50}")
                    
        stdscr.refresh()
        
        # Leer tecla
        try:
            key = stdscr.getch()
        except KeyboardInterrupt:
            return None
            
        if key in (27, curses.KEY_CANCEL): # ESC
            return None
        elif key in (10, 13, curses.KEY_ENTER): # Enter
            if options:
                return options[selected_idx]
            return None
        elif key == curses.KEY_UP:
            if selected_idx > 0:
                selected_idx -= 1
        elif key == curses.KEY_DOWN:
            if selected_idx < len(options) - 1:
                selected_idx += 1
        elif key in (127, 8, curses.KEY_BACKSPACE): # Backspace
            query = query[:-1]
            selected_idx = 0
        elif 32 <= key <= 126: # Carácter imprimible
            query += chr(key)
            selected_idx = 0


def main_tui(stdscr):
    # Habilitar keypad
    stdscr.keypad(True)
    curses.curs_set(0)
    
    # Inicializar pares de colores
    curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_CYAN) # Selección
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK) # Alertas
    curses.init_pair(3, curses.COLOR_GREEN, curses.COLOR_BLACK) # Éxito
    curses.init_pair(4, curses.COLOR_YELLOW, curses.COLOR_BLACK) # Warnings
    
    config = load_models_config()
    selected_row = 0
    
    while True:
        stdscr.clear()
        
        stdscr.addstr(1, 2, "🤖 ZUGZBOT: CONFIGURACIÓN INTERACTIVA DE MODELOS", curses.A_BOLD)
        stdscr.addstr(2, 2, "Navega con [↑/↓], pulsa [Enter] para editar un agente.", curses.A_DIM)
        stdscr.addstr(3, 2, "Presiona [G] para Guardar y Aplicar, o [Q]/[ESC] para Salir.", curses.A_DIM)
        stdscr.addstr(4, 2, "═" * 70)
        
        # Construir items del menú interactivo
        global_val = config.get("global", "deepseek/deepseek-v4-flash")
        
        menu_items = [
            ("global", f"Modelo Global: {global_val}"),
        ]
        
        for agent in AGENTS_LIST:
            val = config.get(agent, "")
            label = val if val else f"[Hereda del global: {global_val}]"
            menu_items.append((agent, f"{agent}: {label}"))
            
        # Añadir opciones de acción al menú
        menu_items.append(("save", "[✓] GUARDAR Y APLICAR CAMBIOS"))
        menu_items.append(("cancel", "[✗] CANCELAR Y SALIR"))
        
        start_row = 6
        for idx, (key, text) in enumerate(menu_items):
            row = start_row + idx
            
            # Resaltar la opción actual
            if idx == selected_row:
                stdscr.attron(curses.color_pair(1))
                stdscr.addstr(row, 2, f" > {text:<65} ")
                stdscr.attroff(curses.color_pair(1))
            else:
                if key == "save":
                    stdscr.addstr(row, 2, f"   {text}", curses.color_pair(3) | curses.A_BOLD)
                elif key == "cancel":
                    stdscr.addstr(row, 2, f"   {text}", curses.color_pair(2))
                elif key == "global":
                    stdscr.addstr(row, 2, f"   {text}", curses.color_pair(3))
                else:
                    stdscr.addstr(row, 2, f"   {text}")
                    
        stdscr.refresh()
        
        # Leer acción del usuario
        try:
            key = stdscr.getch()
        except KeyboardInterrupt:
            break
            
        if key in (ord('q'), ord('Q'), 27): # Q o ESC
            break
        elif key in (ord('g'), ord('G')): # G de Guardar
            apply_and_exit(config)
            break
        elif key == curses.KEY_UP:
            if selected_row > 0:
                selected_row -= 1
        elif key == curses.KEY_DOWN:
            if selected_row < len(menu_items) - 1:
                selected_row += 1
        elif key in (10, 13, curses.KEY_ENTER):
            # Obtener el item seleccionado
            action_key, _ = menu_items[selected_row]
            
            if action_key == "save":
                apply_and_exit(config)
                break
            elif action_key == "cancel":
                break
            elif action_key == "global":
                # Editar el modelo global
                new_val = select_model_tui(stdscr, "SELECCIONAR MODELO GLOBAL POR DEFECTO", global_val, is_global=True)
                if new_val is not None:
                    config["global"] = new_val
                    save_models_config(config)
            else:
                # Editar un agente específico
                current_agent_val = config.get(action_key, "")
                new_val = select_model_tui(stdscr, f"SELECCIONAR MODELO PARA {action_key}", current_agent_val, is_global=False)
                if new_val is not None:
                    config[action_key] = new_val
                    save_models_config(config)


def apply_and_exit(config):
    # Guardar la configuración
    save_models_config(config)
    
    # Aplicar el mapeo de modelos final en cascada
    global_model = config.get("global", "deepseek/deepseek-v4-flash")
    final_agent_models = {}
    
    print("\nMapeo de modelos resultante:")
    for agent_name in AGENTS_LIST:
        custom_val = config.get(agent_name, "")
        final_model = custom_val if custom_val else global_model
        final_agent_models[agent_name] = final_model
        origin = "personalizado" if custom_val else "global"
        print(f"  * {agent_name} -> {final_model} ({origin})")
        
    print("\nAplicando cambios...")
    apply_model(final_agent_models)
    print("\nModelos configurados exitosamente! 🎉")


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================

def main():
    args = sys.argv[1:]

    # Cargar la configuración actual del JSON
    config = load_models_config()

    # Si se pide listar modelos por CLI
    if args and args[0] in ("--list", "-l", "list"):
        print_available_models()
        sys.exit(0)

    # Si se pasan argumentos por parámetro, corre en modo CLI no-interactivo rápido
    if args:
        query = args[0]
        matches = search_model(query)

        if not matches:
            print(
                f"Error: Ningún modelo coincide con '{query}'. Use 'list' para ver todos.",
                file=sys.stderr,
            )
            sys.exit(1)
        elif len(matches) == 1:
            global_model_selected = matches[0]
        else:
            # Si hay múltiples coincidencias, tomamos la primera pero listamos las demás
            global_model_selected = matches[0]
            print(f"Coincidencias encontradas para '{query}':")
            for m in matches:
                print(f"  * {m}")
            print(
                f"Seleccionando automáticamente la primera: {global_model_selected}\n"
            )
            
        # Actualizar el global_model en config y persistir
        config["global"] = global_model_selected
        apply_and_exit(config)
    else:
        # Si NO se pasan argumentos, inicia la TUI interactiva
        curses.wrapper(main_tui)


if __name__ == "__main__":
    main()