#!/usr/bin/env python3
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
        return "() => void"
    return "any"

def main():
    root = os.getcwd()
    
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
        print("Uso: python generate-tests.py [ruta_al_contrato.json]")
        sys.exit(1)
        
    print(f"Generando plantillas de tests desde: {contract_path}")
    
    try:
        with open(contract_path, "r", encoding="utf-8") as f:
            contract = json.load(f)
    except Exception as e:
        print(f"Error al parsear el contrato: {e}")
        sys.exit(1)
        
    test_scenarios = contract.get("test_scenarios", [])
    if not test_scenarios:
        print("No se encontraron escenarios de prueba (test_scenarios) en el contrato.")
        sys.exit(0)
        
    # Group test scenarios by feature_ref (e.g. "CalculatorForm" -> TS-01, TS-02)
    grouped_tests = {}
    for ts in test_scenarios:
        feature = ts.get("feature_ref", "general")
        if feature not in grouped_tests:
            grouped_tests[feature] = []
        grouped_tests[feature].append(ts)
        
    for feature, scenarios in grouped_tests.items():
        # Clean feature name for file naming (e.g. "CalculatorForm" -> "calculator-form")
        clean_feature = "".join(["-" + c.lower() if c.isupper() else c for c in feature]).lstrip("-")
        
        # Decide extension based on content types
        ext = "tsx" if any(s.get("type") in ["unit", "visual"] for s in scenarios) else "ts"
        
        # Target test file path
        test_dir = os.path.join(root, "tests", "unit")
        os.makedirs(test_dir, exist_ok=True)
        test_file = os.path.join(test_dir, f"{clean_feature}.test.{ext}")
        
        if os.path.exists(test_file):
            print(f"✓ El archivo de test {clean_feature}.test.{ext} ya existe. Saltando.")
            continue
            
        # Write test template structure
        lines = []
        lines.append('import { describe, it, expect } from "vitest";')
        
        # Simple heuristics for React Testing Library imports
        if ext == "tsx":
            lines.append('import { render, screen } from "@testing-library/react";')
            lines.append('import userEvent from "@testing-library/user-event";')
            lines.append(f'// import {feature} from "@/components/blocks/{clean_feature}";')
            
        lines.append("")
        lines.append(f'describe("{feature} Tests (Contract Scenarios)", () => {{')
        
        for s in scenarios:
            tid = s.get("id", "TS-XX")
            name = s.get("name", "Test case description")
            given = s.get("given", "")
            when = s.get("when", "")
            then = s.get("then", "")
            
            lines.append(f'  // {tid}: {name}')
            lines.append(f'  // Given: {given}')
            lines.append(f'  // When: {when}')
            lines.append(f'  // Then: {then}')
            lines.append(f'  it("{tid}: {name}", async () => {{')
            lines.append('    // TODO: Implement actual contract assertions')
            lines.append('    expect(true).toBe(true);')
            lines.append('  });')
            lines.append("")
            
        lines.append("});")
        
        try:
            with open(test_file, "w", encoding="utf-8") as f:
                f.write("\n".join(lines).strip() + "\n")
            print(f"🧪 Plantilla de test creada: tests/unit/{clean_feature}.test.{ext}")
        except Exception as e:
            print(f"Error escribiendo test {clean_feature}: {e}")
            
    print("¡Proceso de generación de tests completado!")

if __name__ == "__main__":
    main()
