import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getFilesRecursively(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function checkTagBalance(content) {
  let cleaned = content.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  
  // Strip TypeScript generic type arguments from function calls or declarations (e.g. createSignal<string[]>)
  // JSX tags are never directly preceded by a word character (like \w+), whereas TS generics are.
  cleaned = cleaned.replace(/(\w+)<([A-Za-z0-9_[\]\s|]+)>/g, '$1');
  
  const tagRegex = /<(\/?[a-zA-Z0-9:-]+)(?:\s+[^>]*?)?>/g;
  const stack = [];
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  
  let match;
  while ((match = tagRegex.exec(cleaned)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    if (fullTag.endsWith('/>')) continue;
    if (selfClosingTags.has(tagName)) continue;
    if (fullTag.startsWith('<?') || fullTag.endsWith('?>')) continue;
    if (fullTag.startsWith('<!')) continue;
    
    if (tagName.startsWith('/')) {
      const closingName = tagName.substring(1);
      if (stack.length === 0) {
        return { balanced: false, error: `Closing tag without opener: </${closingName}>` };
      }
      const lastOpen = stack.pop();
      if (lastOpen !== closingName) {
        return { balanced: false, error: `Mismatched: expected </${lastOpen}> but found </${closingName}>` };
      }
    } else {
      stack.push(tagName);
    }
  }
  
  if (stack.length > 0) {
    return { balanced: false, error: `Unclosed tags: <${stack.join('>, <')}> `};
  }
  return { balanced: true };
}

describe('Tag Balance Validator', () => {
  test('Plugin UI files should have balanced tags', () => {
    const pluginDir = path.resolve(process.cwd(), '.opencode', 'plugins');
    if (!fs.existsSync(pluginDir)) return;
    
    const files = getFilesRecursively(pluginDir, ['.tsx', '.jsx', '.ts', '.js']);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const result = checkTagBalance(content);
      expect(result.balanced, `${path.basename(file)}: ${result.error}`).toBe(true);
    });
  });
});
