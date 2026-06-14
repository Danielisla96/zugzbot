import os
import sys
import json

def get_ts_type(val):
    if not val:
        return "any"
    val = val.lower()
    if "string" in val:
        return "string"
    if "number" in val:
        return "number"
    if "boolean" in val:
        return "boolean"
    if "()" in val or "=>" in val:
        return "() => void" # fallback simple function type
    return "any"

def main():
    root = process_cwd = os.getcwd()
    
    # Check arguments
    contract_path = None
    if len(sys.argv) > 1:
        contract_path = sys.argv[1]
    else:
        # Try to read active contract from sdd_state.json
        state_path = os.path.join(root, ".openspec/sdd_state.json")
        if os.path.exists(state_path):
            try:
                with open(state_path, "r", encoding="utf-8") as f:
                    state = json.load(f)
                    active_contract = state.get("activeContract")
                    if active_contract:
                        contract_path = os.path.join(root, active_contract)
            except Exception as e:
                print(f"Error reading state file: {e}")
                
    if not contract_path or not os.path.exists(contract_path):
        print("Error: No se especificó un contrato válido o no existe.")
        print("Uso: python generate-components.py [ruta_al_contrato.json]")
        sys.exit(1)
        
    print(f"Generando componentes desde: {contract_path}")
    
    try:
        with open(contract_path, "r", encoding="utf-8") as f:
            contract = json.load(f)
    except Exception as e:
        print(f"Error al parsear el contrato: {e}")
        sys.exit(1)
        
    frontend = contract.get("frontend", {})
    components = frontend.get("components", [])
    
    if not components:
        print("No se encontraron componentes en la especificación del contrato.")
        sys.exit(0)
        
    for comp in components:
        comp_name = comp.get("name")
        comp_file = comp.get("file")
        comp_desc = comp.get("description", "")
        comp_props = comp.get("props") or {}
        comp_icons = comp.get("lucide_icons") or []
        
        if not comp_file:
            print(f"Saltando componente {comp_name}: No tiene archivo especificado.")
            continue
            
        file_path = os.path.join(root, comp_file)
        
        # Don't overwrite existing files
        if os.path.exists(file_path):
            print(f"✓ El archivo {comp_file} ya existe. Saltando.")
            continue
            
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Generate TypeScript interfaces
        prop_lines = []
        destruct_props = []
        for prop_name, prop_desc in comp_props.items():
            ts_type = get_ts_type(prop_desc)
            prop_lines.append(f"  {prop_name}: {ts_type};")
            destruct_props.append(prop_name)
            
        props_interface = ""
        if prop_lines:
            props_interface = f"interface {comp_name}Props {{\n" + "\n".join(prop_lines) + "\n}\n\n"
            
        destruct_str = f"{{ {', '.join(destruct_props)} }}" if destruct_props else ""
        props_arg = f"{destruct_str}: {comp_name}Props" if destruct_props else ""
        
        # Import icons
        icons_import = ""
        if comp_icons:
            icons_import = f"import {{ {', '.join(comp_icons)} }} from \"lucide-react\";\n"
            
        # Generate template body
        template = f"""import React from "react";
{icons_import}
{props_interface}export default function {comp_name}({props_arg}) {{
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold text-lg">{comp_name}</h3>
      <p className="text-sm text-muted-foreground">{comp_desc}</p>
      {comp_icons and f'<!-- Icons used: {", ".join(comp_icons)} -->' or ''}
    </div>
  );
}}
"""
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(template.strip() + "\n")
            print(f"📂 Componente creado: {comp_file}")
        except Exception as e:
            print(f"Error escribiendo {comp_file}: {e}")
            
    print("¡Proceso de generación completado!")

if __name__ == "__main__":
    main()
