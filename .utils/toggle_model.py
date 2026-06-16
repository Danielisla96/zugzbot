#!/usr/bin/env python3
import sys
import os
import json
import re

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


def main():
    args = sys.argv[1:]

    # Cargar la configuración actual del JSON
    config = load_models_config()

    # Si se pide listar modelos
    if args and args[0] in ("--list", "-l", "list"):
        print_available_models()
        sys.exit(0)

    # Determinar el modelo global a usar
    global_model_selected = config.get("global", "deepseek/deepseek-v4-flash")
    
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
        save_models_config(config)

    # Construir el mapeo de modelos final para cada agente
    final_agent_models = {}
    print("Mapeo de modelos por agente:")

    agents_list = ["sdd-orchestrator", "sdd-spec-writer", "sdd-coder", "sdd-tester", "sdd-deployer"]
    for agent_name in agents_list:
        custom_model = config.get(agent_name, "")
        if custom_model:
            # Validar que el modelo custom existe
            if custom_model not in AVAILABLE_MODELS:
                print(
                    f"Advertencia: El modelo personalizado '{custom_model}' para '{agent_name}' no está en la lista oficial.",
                    file=sys.stderr,
                )
            final_agent_models[agent_name] = custom_model
            print(f"  * {agent_name} -> {custom_model} (personalizado)")
        else:
            final_agent_models[agent_name] = global_model_selected
            print(f"  * {agent_name} -> {global_model_selected} (global)")

    print("\nAplicando cambios...")
    apply_model(final_agent_models)
    print("\nModelos configurados exitosamente! 🎉")


if __name__ == "__main__":
    main()