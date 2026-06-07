#!/usr/bin/env python3
import sqlite3
import os
import json
import sys
from datetime import datetime

DB_PATH = "/Users/wavesbyte/.local/share/opencode/opencode.db"

# Escribe aquí el ID de la sesión que deseas exportar (ejemplo: "ses_1234...")
# Si se deja vacío, el script requerirá el ID como argumento al ejecutarlo
TARGET_SESSION_ID = "ses_15c1"


def format_timestamp(ts):
    if not ts:
        return "N/A"
    try:
        # DB timestamp is in milliseconds
        dt = datetime.fromtimestamp(ts / 1000.0)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return str(ts)

def sanitize_filename(name):
    # Keep only alphanumeric, spaces, hyphens, and underscores
    return "".join(c for c in name if c.isalnum() or c in (" ", "-", "_")).rstrip().replace(" ", "_")

def get_session_tree(cursor, session_id):
    """Recursively fetch child sessions and build a flat list with structure info."""
    cursor.execute("SELECT * FROM session WHERE id = ?", (session_id,))
    main = cursor.fetchone()
    if not main:
        return []

    sessions = []
    
    def traverse(sid, depth=0):
        cursor.execute("SELECT * FROM session WHERE id = ?", (sid,))
        s = cursor.fetchone()
        if not s:
            return
        
        s_dict = dict(s)
        s_dict['depth'] = depth
        sessions.append(s_dict)
        
        # Find children
        cursor.execute("SELECT id FROM session WHERE parent_id = ? ORDER BY time_created ASC", (sid,))
        children = cursor.fetchall()
        for child in children:
            traverse(child['id'], depth + 1)

    traverse(session_id)
    return sessions

def export_session_messages(cursor, session, output_dir, file_index):
    sid = session['id']
    title = session['title'] or f"Subagent_{sid[:8]}"
    agent = session['agent'] or "unknown"
    
    filename = f"{file_index:02d}_{sanitize_filename(title)}.md"
    filepath = os.path.join(output_dir, filename)
    
    # Fetch messages and their parts
    cursor.execute("SELECT * FROM message WHERE session_id = ? ORDER BY time_created ASC", (sid,))
    messages = cursor.fetchall()
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n")
        f.write(f"* **ID de Sesión**: `{sid}`\n")
        if session['parent_id']:
            f.write(f"* **ID Padre**: `{session['parent_id']}`\n")
        f.write(f"* **Agente**: `{agent}`\n")
        f.write(f"* **Modelo**: `{session['model']}`\n")
        f.write(f"* **Creado**: {format_timestamp(session['time_created'])}\n")
        f.write(f"* **Costo estimado**: ${session['cost'] or 0.0:.6f}\n")
        f.write(f"* **Tokens**: Entrada: {session['tokens_input'] or 0} | Salida: {session['tokens_output'] or 0} | Razonamiento: {session['tokens_reasoning'] or 0}\n\n")
        f.write("---\n\n")
        
        for msg in messages:
            msg_id = msg['id']
            msg_data = {}
            try:
                msg_data = json.loads(msg['data'])
            except Exception:
                pass
            
            role = msg_data.get('role', 'System')
            role_emoji = "👤 Usuario" if role == "user" else "🤖 Asistente"
            f.write(f"## {role_emoji} ({format_timestamp(msg['time_created'])})\n\n")
            
            # Fetch parts for this message
            cursor.execute("SELECT * FROM part WHERE message_id = ? ORDER BY time_created ASC", (msg_id,))
            parts = cursor.fetchall()
            
            for part in parts:
                part_data = {}
                try:
                    part_data = json.loads(part['data'])
                except Exception:
                    continue
                
                p_type = part_data.get('type')
                
                if p_type == 'text':
                    f.write(part_data.get('text', '') + "\n\n")
                
                elif p_type == 'reasoning':
                    f.write("<details>\n<summary>💭 Pensamiento (Reasoning)</summary>\n\n")
                    f.write(part_data.get('text', '') + "\n")
                    f.write("\n</details>\n\n")
                
                elif p_type == 'tool':
                    tool_name = part_data.get('tool', 'unknown')
                    state = part_data.get('state', {})
                    status = state.get('status', 'unknown')
                    
                    # Tool Call Input
                    f.write(f"⚙️ **Llamada a Herramienta**: `{tool_name}` (Estado: *{status}*)\n\n")
                    tool_input = state.get('input', {})
                    f.write("```json\n")
                    f.write(json.dumps(tool_input, indent=2) + "\n")
                    f.write("```\n\n")
                    
                    # Tool Call Output
                    tool_output = state.get('output', '')
                    f.write("📥 **Resultado de la Herramienta**:\n")
                    try:
                        parsed_out = json.loads(tool_output)
                        f.write("```json\n" + json.dumps(parsed_out, indent=2) + "\n```\n\n")
                    except Exception:
                        if "\n" in tool_output:
                            f.write("```\n" + tool_output + "\n```\n\n")
                        else:
                            f.write(f"`{tool_output}`\n\n")
                            
        print(f"  Exportado: {filename}")
    return filename

def list_sessions(cursor):
    cursor.execute("""
        SELECT id, title, agent, time_created 
        FROM session 
        WHERE parent_id IS NULL OR parent_id = ''
        ORDER BY time_created DESC 
        LIMIT 15
    """)
    sessions = cursor.fetchall()
    print("Últimas sesiones de OpenCode disponibles:")
    print("-" * 85)
    for s in sessions:
        title = s['title'] or "(Sin título)"
        created = format_timestamp(s['time_created'])
        print(f"ID: {s['id']} | {created} | {s['agent']} - {title[:35]}")
    print("-" * 85)

def main():
    if not os.path.exists(DB_PATH):
        print(f"Error: No se encontró la base de datos de OpenCode en {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    target_session_id = TARGET_SESSION_ID
    
    # If not configured in the script, look for command line arguments
    if not target_session_id:
        if len(sys.argv) < 2:
            list_sessions(cursor)
            print("\nUso: python3 export_opencode_session.py <session_id>")
            print("O configura la variable 'TARGET_SESSION_ID' al inicio de este script.")
            conn.close()
            sys.exit(0)
        target_session_id = sys.argv[1]
    
    # Resolver el ID si es parcial/prefijo (ej. "ses_1619")
    # Prioriza sesiones raíz (sin padre) para no agarrar un subagente por error
    cursor.execute("""
        SELECT id FROM session 
        WHERE id = ? OR id LIKE ? 
        ORDER BY (parent_id IS NULL OR parent_id = '') DESC, time_created DESC 
        LIMIT 1
    """, (target_session_id, f"{target_session_id}%"))
    row = cursor.fetchone()
    if row:
        target_session_id = row['id']

    # 1. Fetch entire tree
    session_tree = get_session_tree(cursor, target_session_id)

    if not session_tree:
        print(f"Error: No se encontró la sesión con ID '{target_session_id}'")
        conn.close()
        sys.exit(1)
        
    main_session = session_tree[0]
    safe_title = sanitize_filename(main_session['title'] or "session")
    export_dir_name = f"export_{target_session_id[:8]}_{safe_title}"
    output_dir = os.path.abspath(export_dir_name)
    
    os.makedirs(output_dir, exist_ok=True)
    print(f"\nExportando sesión principal y subagentes a: {output_dir}\n")
    
    # 2. Export each session
    exported_files = []
    for idx, s in enumerate(session_tree):
        fname = export_session_messages(cursor, s, output_dir, idx)
        exported_files.append((s, fname))
        
    # 3. Create README index file
    readme_path = os.path.join(output_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(f"# Índice de Sesión de OpenCode\n\n")
        f.write(f"Este directorio contiene los registros completos y ordenados de la sesión y todos sus subagentes.\n\n")
        
        f.write("## Datos de la Sesión Principal\n")
        f.write(f"* **ID**: `{main_session['id']}`\n")
        f.write(f"* **Título**: {main_session['title']}\n")
        f.write(f"* **Agente Principal**: `{main_session['agent']}`\n")
        f.write(f"* **Creado**: {format_timestamp(main_session['time_created'])}\n")
        f.write(f"* **Última Actualización**: {format_timestamp(main_session['time_updated'])}\n\n")
        
        f.write("## 🌳 Árbol de Ejecución de Subagentes\n")
        f.write("Haz clic en los enlaces para abrir el historial detallado de cada subagente:\n\n")
        
        for s, fname in exported_files:
            indent = "  " * s['depth']
            bullet = "•" if s['depth'] > 0 else "📂"
            agent_label = f"({s['agent']})" if s['agent'] else ""
            title_text = s['title'] or f"Subagente {s['id'][:8]}"
            f.write(f"{indent}{bullet} [{title_text}]({fname}) {agent_label}\n")
            
        f.write("\n\n---\n*Exportación generada automáticamente el: {}*\n".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        
    print(f"\n¡Listo! Se ha creado un archivo README.md indexado en:\n{readme_path}\n")
    conn.close()

if __name__ == "__main__":
    main()
