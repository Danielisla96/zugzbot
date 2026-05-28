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

function findDuplicateIds(content) {
  const cleaned = content.replace(/<!--[\s\S]*?-->/g, '');
  const idRegex = /id=["']([^"']+)["']/g;
  const ids = [];
  let match;
  while ((match = idRegex.exec(cleaned)) !== null) {
    ids.push(match[1]);
  }
  
  const seen = new Set();
  const duplicates = [];
  ids.forEach(id => {
    if (seen.has(id)) {
      duplicates.push(id);
    } else {
      seen.add(id);
    }
  });
  
  return duplicates;
}

describe('DOM Structure Validator', () => {
  test('Plugin UI files should not contain duplicate IDs', () => {
    const pluginDir = path.resolve(process.cwd(), '.opencode', 'plugins');
    if (!fs.existsSync(pluginDir)) return;
    
    const files = getFilesRecursively(pluginDir, ['.tsx', '.jsx', '.html']);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const duplicates = findDuplicateIds(content);
      expect(duplicates.length, `${path.basename(file)} has duplicate IDs: ${duplicates.join(', ')}`).toBe(0);
    });
  });
});
