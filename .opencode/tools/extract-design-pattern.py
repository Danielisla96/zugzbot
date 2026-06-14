#!/usr/bin/env python3
import os
import sys
import re

def get_brand_dir(brand_id):
    # Resolve local directories
    root = os.getcwd()
    candidates = [
        os.path.join(root, ".opencode/oh-my-design/design-md", brand_id),
        os.path.join(root, ".openspec/design-assets", brand_id),
        os.path.join(root, ".opencode/oh-my-design/web/references", brand_id),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isdir(c):
            return c
    return None

def extract_block(html, pattern):
    # Normalize query pattern
    pattern = pattern.lower().strip()
    
    # Try finding by section ID first (e.g., id="buttons", id="cards")
    # Format typically: <section class="section" id="buttons"> ... </section>
    match = re.search(r'<section\s+[^>]*id="' + re.escape(pattern) + r'"[^>]*>', html, re.IGNORECASE)
    if not match:
        # Try finding by class name or tag name directly (e.g. "nav" -> <nav class="nav">, "hero" -> <section class="hero">)
        if pattern == "nav":
            match = re.search(r'<nav\s+[^>]*class="nav"[^>]*>', html, re.IGNORECASE)
        elif pattern == "hero":
            match = re.search(r'<section\s+[^>]*class="hero"[^>]*>', html, re.IGNORECASE)
            
    if not match:
        return None
        
    start_idx = match.start()
    
    # Find matching closing tag
    tag_name_match = re.match(r'<([a-zA-Z0-9]+)', html[start_idx:])
    if not tag_name_match:
        return None
        
    tag_name = tag_name_match.group(1)
    
    # Count open/close tags to extract the full element block
    depth = 0
    idx = start_idx
    while idx < len(html):
        # Match next open or close tag
        next_tag = re.search(r'<(/?)' + re.escape(tag_name) + r'\b[^>]*>', html[idx:], re.IGNORECASE)
        if not next_tag:
            break
            
        is_closing = bool(next_tag.group(1))
        tag_start = idx + next_tag.start()
        tag_end = idx + next_tag.end()
        
        if is_closing:
            depth -= 1
            if depth == 0:
                return html[start_idx:tag_end].strip()
        else:
            depth += 1
            
        idx = tag_end
        
    return None

def extract_css_rules(html, snippet):
    # Find all class names in the extracted snippet
    classes = set(re.findall(r'class="([^"]+)"', snippet))
    class_names = set()
    for c_attr in classes:
        for c in c_attr.split():
            class_names.add(c.strip())
            
    # Extract style block from HTML
    style_match = re.search(r'<style>([\s\S]*?)</style>', html, re.IGNORECASE)
    if not style_match:
        return ""
        
    style_content = style_match.group(1)
    
    # Simple CSS parser: find rules
    # E.g. .btn-brand { ... }
    rules = re.findall(r'([^{]+)\{([^}]+)\}', style_content)
    
    relevant_rules = []
    
    # Include :root variables if pattern is colors or variables
    has_root = False
    for selector, body in rules:
        sel_clean = selector.strip()
        body_clean = body.strip()
        
        # Check if selector contains any of our class names
        matches_class = False
        for c in class_names:
            if re.search(r'\b' + re.escape(c) + r'\b', sel_clean):
                matches_class = True
                break
                
        # Also match base elements inside the section
        if not matches_class:
            if sel_clean == ":root" and not has_root:
                matches_class = True
                has_root = True
            elif sel_clean == "body" and "body" in class_names:
                matches_class = True
                
        if matches_class:
            relevant_rules.append(f"{sel_clean} {{\n  {body_clean}\n}}")
            
    return "\n\n".join(relevant_rules)

def main():
    if len(sys.argv) < 3:
        print("Uso: python3 extract-design-pattern.py <brandId> <pattern>")
        print("Patrones válidos: nav, hero, colors, typography, buttons, cards, forms, spacing, radius, elevation")
        sys.exit(1)
        
    brand_id = sys.argv[1].strip()
    pattern = sys.argv[2].strip()
    
    brand_dir = get_brand_dir(brand_id)
    if not brand_dir:
        print(f"Error: No se encontró el catálogo de diseño para la marca '{brand_id}'")
        sys.exit(1)
        
    # Prefer dark preview if it exists since dark mode is core for SaaS/Linear, otherwise normal preview
    preview_path = os.path.join(brand_dir, "preview-dark.html")
    is_dark = True
    if not os.path.exists(preview_path):
        preview_path = os.path.join(brand_dir, "preview.html")
        is_dark = False
        
    if not os.path.exists(preview_path):
        print(f"Error: No se encontró preview.html ni preview-dark.html en {brand_dir}")
        sys.exit(1)
        
    try:
        with open(preview_path, "r", encoding="utf-8") as f:
            html_content = f.read()
    except Exception as e:
        print(f"Error leyendo archivo de previsualización: {e}")
        sys.exit(1)
        
    snippet = extract_block(html_content, pattern)
    if not snippet:
        # If dark failed, fallback to light preview
        if is_dark:
            alt_path = os.path.join(brand_dir, "preview.html")
            if os.path.exists(alt_path):
                try:
                    with open(alt_path, "r", encoding="utf-8") as f:
                        html_content = f.read()
                    snippet = extract_block(html_content, pattern)
                except Exception:
                    pass
                    
    if not snippet:
        print(f"Error: No se pudo extraer la sección o patrón '{pattern}' del diseño '{brand_id}'")
        sys.exit(1)
        
    css = extract_css_rules(html_content, snippet)
    
    print(f"### 🎨 Patrón de Diseño Extraccto: `{pattern}` (Marca: `{brand_id}`)")
    print(f"Modo de origen: {'Oscuro' if is_dark else 'Claro'}")
    print("\n#### 🖥️ Estilos CSS Relacionados:")
    print("```css")
    if css:
        print(css)
    else:
        print("/* No se encontraron reglas de CSS específicas en el style block */")
    print("```")
    print("\n#### 📝 Estructura HTML de Referencia:")
    print("```html")
    print(snippet)
    print("```")

if __name__ == "__main__":
    main()
