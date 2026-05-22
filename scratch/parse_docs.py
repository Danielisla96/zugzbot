#!/usr/bin/env python3
import sys
import re
import html
from html.parser import HTMLParser

class StarlightHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_main = False
        self.main_depth = 0
        self.md_content = []
        self.current_tag = None
        self.list_type_stack = [] # 'ul' or 'ol'
        self.list_item_depth = 0
        self.in_code_block = False
        self.in_inline_code = False
        self.code_text = ""
        self.code_lang = "text"
        
        # Aside handling
        self.in_aside = False
        self.aside_type = "NOTE"
        self.aside_start_index = 0
        
        # Link handling
        self.in_link = False
        self.link_href = ""
        self.link_text = ""
        
        # Table handling
        self.in_table = False
        self.table_rows = []
        self.current_row = []
        self.in_th = False
        self.in_td = False
        
        # Inline styling
        self.in_strong = False
        self.in_em = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'main':
            self.in_main = True
            self.main_depth = 1
            return
            
        if not self.in_main:
            return
            
        self.main_depth += 1
        self.current_tag = tag
        
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.md_content.append("\n" + "#" * level + " ")
            
        elif tag == 'p':
            self.md_content.append("\n")
                
        elif tag == 'br':
            self.md_content.append("\n")
            
        elif tag == 'hr':
            self.md_content.append("\n---\n")
            
        elif tag == 'ul':
            self.list_type_stack.append('ul')
            
        elif tag == 'ol':
            self.list_type_stack.append('ol')
            
        elif tag == 'li':
            self.list_item_depth += 1
            prefix = "  " * (len(self.list_type_stack) - 1)
            marker = "-" if self.list_type_stack[-1] == 'ul' else "1."
            self.md_content.append(f"\n{prefix}{marker} ")
            
        elif tag == 'pre':
            self.in_code_block = True
            self.code_lang = attrs_dict.get('data-language', 'text')
            self.code_text = ""
            
        elif tag == 'div' and self.in_code_block:
            # Astro expressive-code splits lines by div
            if 'ec-line' in attrs_dict.get('class', '') or 'code' in attrs_dict.get('class', ''):
                if self.code_text and not self.code_text.endswith('\n'):
                    self.code_text += '\n'
            
        elif tag == 'code':
            if not self.in_code_block:
                self.in_inline_code = True
                self.md_content.append("`")
                
        elif tag == 'aside':
            self.in_aside = True
            aside_class = attrs_dict.get('class', '')
            label = attrs_dict.get('aria-label', '').upper()
            if 'note' in aside_class or 'note' in label.lower():
                self.aside_type = "NOTE"
            elif 'tip' in aside_class or 'consejo' in label.lower():
                self.aside_type = "TIP"
            elif 'caution' in aside_class or 'precaución' in label.lower():
                self.aside_type = "CAUTION"
            elif 'warning' in aside_class or 'advertencia' in label.lower():
                self.aside_type = "WARNING"
            elif 'danger' in aside_class or 'peligro' in label.lower():
                self.aside_type = "CAUTION"
            else:
                self.aside_type = "NOTE"
            self.aside_start_index = len(self.md_content)
            
        elif tag == 'a':
            self.in_link = True
            self.link_href = attrs_dict.get('href', '')
            if self.link_href.startswith('/docs'):
                self.link_href = "https://opencode.ai" + self.link_href
            self.link_text = ""
            
        elif tag in ['strong', 'b']:
            self.in_strong = True
            self.md_content.append("**")
            
        elif tag in ['em', 'i']:
            self.in_em = True
            self.md_content.append("*")
            
        elif tag == 'table':
            self.in_table = True
            self.table_rows = []
            
        elif tag == 'tr':
            self.current_row = []
            
        elif tag == 'th':
            self.in_th = True
            
        elif tag == 'td':
            self.in_td = True
            
        elif tag == 'figcaption':
            self.md_content.append("\n**File**: ")

    def handle_endtag(self, tag):
        if not self.in_main:
            return
            
        self.main_depth -= 1
        if tag == 'main' or self.main_depth == 0:
            self.in_main = False
            return
            
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.md_content.append("\n")
            
        elif tag == 'p':
            self.md_content.append("\n")
                
        elif tag in ['ul', 'ol']:
            if self.list_type_stack:
                self.list_type_stack.pop()
                if not self.list_type_stack:
                    self.md_content.append("\n")
                    
        elif tag == 'li':
            self.list_item_depth -= 1
            
        elif tag == 'pre':
            self.in_code_block = False
            clean_code = self.code_text.strip()
            clean_code = html.unescape(clean_code)
            self.md_content.append(f"\n```{self.code_lang}\n{clean_code}\n```\n")
            
        elif tag == 'code':
            if not self.in_code_block:
                self.in_inline_code = False
                self.md_content.append("`")
                
        elif tag == 'aside':
            self.in_aside = False
            # Extract accumulated aside content
            aside_elements = self.md_content[self.aside_start_index:]
            del self.md_content[self.aside_start_index:]
            
            aside_raw_text = "".join(aside_elements)
            # Split into lines to prefix each with >
            lines = aside_raw_text.strip().split("\n")
            filtered_lines = []
            for line in lines:
                line_strip = line.strip()
                if not line_strip:
                    continue
                if line_strip.lower() in ['nota', 'consejo', 'advertencia', 'precaución', 'danger', 'tip', 'note', 'warning', 'caution']:
                    continue
                filtered_lines.append(line_strip)
                
            formatted_aside = f"\n> [!{self.aside_type}]\n" + "\n".join(f"> {l}" for l in filtered_lines) + "\n"
            self.md_content.append(formatted_aside)
            
        elif tag == 'a':
            self.in_link = False
            clean_text = self.link_text.strip()
            if not clean_text:
                clean_text = self.link_href
            self.md_content.append(f"[{clean_text}]({self.link_href})")
            
        elif tag in ['strong', 'b']:
            self.in_strong = False
            self.md_content.append("**")
            
        elif tag in ['em', 'i']:
            self.in_em = False
            self.md_content.append("*")
            
        elif tag == 'th':
            self.in_th = False
            
        elif tag == 'td':
            self.in_td = False
            
        elif tag == 'tr':
            self.table_rows.append(self.current_row)
            
        elif tag == 'table':
            self.in_table = False
            if self.table_rows:
                max_cols = max(len(row) for row in self.table_rows)
                headers = self.table_rows[0]
                while len(headers) < max_cols:
                    headers.append("")
                
                self.md_content.append("\n\n| " + " | ".join(headers) + " |")
                self.md_content.append("\n| " + " | ".join(["---"] * max_cols) + " |")
                
                for row in self.table_rows[1:]:
                    while len(row) < max_cols:
                        row.append("")
                    self.md_content.append("\n| " + " | ".join(row) + " |")
                self.md_content.append("\n\n")
                
        elif tag == 'figcaption':
            self.md_content.append("\n")

    def handle_data(self, data):
        if not self.in_main:
            return
            
        if self.current_tag in ['script', 'style']:
            return
            
        if self.in_code_block:
            self.code_text += data
            return
            
        if self.in_link:
            self.link_text += data
            return
            
        if self.in_table:
            if self.in_th or self.in_td:
                clean_data = data.strip().replace("\n", " ").replace("|", "\\|")
                if clean_data:
                    if not self.current_row:
                        self.current_row.append(clean_data)
                    else:
                        self.current_row[-1] = (self.current_row[-1] + " " + clean_data).strip()
            return
            
        clean_data = data
        if not self.in_inline_code:
            if clean_data.isspace():
                clean_data = " "
            else:
                clean_data = re.sub(r'\s+', ' ', clean_data)
                
        self.md_content.append(clean_data)

def clean_markdown(md_text):
    # Truncate footer links
    footer_markers = [
        "[Edita esta página]",
        "Edita esta página",
        "Found a bug?",
        "Join our Discord community"
    ]
    for marker in footer_markers:
        idx = md_text.find(marker)
        if idx != -1:
            md_text = md_text[:idx]
            break
            
    # Reduce consecutive newlines to maximum of 2
    md_text = re.sub(r'\n{3,}', '\n\n', md_text)
    # Strip spaces from the beginning and end of each line
    lines = [line.rstrip() for line in md_text.split("\n")]
    md_text = "\n".join(lines)
    # Remove astro tags or comments if any remain
    md_text = re.sub(r'<\/?[a-zA-Z0-9\-]+[^>]*>', '', md_text)
    return md_text.strip()

def process_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    parser = StarlightHTMLParser()
    parser.feed(html_content)
    
    raw_md = "".join(parser.md_content)
    clean_md = clean_markdown(raw_md)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(clean_md + "\n")
    print(f"Processed: {input_path} -> {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: parse_docs.py <input_path> <output_path>")
        sys.exit(1)
    process_file(sys.argv[1], sys.argv[2])
