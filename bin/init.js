#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Reset color
const reset = '\x1b[0m';
const green = '\x1b[32m';
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const bold = '\x1b[1m';

console.log(`\n${bold}${cyan}🤖 Zugzbot Harness Installer${reset}\n`);

const pkgRoot = join(__dirname, '..');
const targetDir = process.cwd();

// Define items to copy
const itemsToCopy = [
  { name: '.opencode', src: join(pkgRoot, '.opencode'), dest: join(targetDir, '.opencode'), type: 'dir' },
  { name: '.utils', src: join(pkgRoot, '.utils'), dest: join(targetDir, '.utils'), type: 'dir' },
  { name: 'models.json', src: join(pkgRoot, 'models.json'), dest: join(targetDir, 'models.json'), type: 'file' },
  { name: 'opencode.json', src: join(pkgRoot, 'opencode.json'), dest: join(targetDir, 'opencode.json'), type: 'file' },
  { name: 'tui.json', src: join(pkgRoot, 'tui.json'), dest: join(targetDir, 'tui.json'), type: 'file' }
];

// Helper to filter out node_modules and .git files relative to the package root
const filterFunc = (srcPath) => {
  const relativeSrc = relative(pkgRoot, srcPath);
  const isIgnored = relativeSrc.split(/[/\\]/).some(part => 
    part === 'node_modules' || 
    part === '.git' || 
    part === '.openspec'
  );
  return !isIgnored;
};

let copiedCount = 0;

for (const item of itemsToCopy) {
  if (!fs.existsSync(item.src)) {
    continue; // Skip if source optional item doesn't exist
  }

  const relativeDest = relative(targetDir, item.dest);
  
  try {
    if (fs.existsSync(item.dest)) {
      console.log(`${yellow}⚠️  Updating existing: ${relativeDest}...${reset}`);
    } else {
      console.log(`${green}📦 Copying: ${relativeDest}...${reset}`);
    }

    if (item.type === 'dir') {
      fs.mkdirSync(item.dest, { recursive: true });
      fs.cpSync(item.src, item.dest, {
        recursive: true,
        filter: filterFunc
      });
    } else {
      fs.copyFileSync(item.src, item.dest);
    }
    copiedCount++;
  } catch (error) {
    console.error(`${red}❌ Error copying ${item.name}: ${error.message}${reset}`);
  }
}
// Ensure .openspec directory and active-brief.md exist on target
try {
  const openspecDir = join(targetDir, '.openspec');
  if (!fs.existsSync(openspecDir)) {
    fs.mkdirSync(openspecDir, { recursive: true });
  }
  const activeBriefPath = join(openspecDir, 'active-brief.md');
  if (!fs.existsSync(activeBriefPath)) {
    fs.writeFileSync(
      activeBriefPath,
      "# SDD Active Brief\n\nNo hay ninguna sesión activa o el spec actual no ha sido iniciado.\n",
      "utf8"
    );
  }
} catch (error) {
  console.error(`${red}❌ Error creating .openspec directory: ${error.message}${reset}`);
}

if (copiedCount > 0) {
  console.log(`\n${bold}${green}✨ Zugzbot Harness successfully installed/updated!${reset}`);
  console.log(`Run ${cyan}opencode${reset} or your configured command to start building.\n`);
} else {
  console.log(`\n${red}❌ No files were installed.${reset}\n`);
}
