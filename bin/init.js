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

const pkgRoot = join(__dirname, '..');
const targetDir = process.cwd();

const banner = `
${bold}${cyan}███████╗██╗   ██╗ ██████╗ ███████╗
╚══███╔╝██║   ██║██╔════╝ ╚══███╔╝
  ███╔╝ ██║   ██║██║  ███╗  ███╔╝ 
 ███╔╝  ██║   ██║██║   ██║ ███╔╝  
███████╗╚██████╔╝╚██████╔╝███████╗
╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝${reset}
${bold}${yellow}      Harness Installer v1.0.7${reset}\n`;

console.log(banner);
console.log(`${bold}${cyan}🔍 Detectando entorno de trabajo...${reset}`);
console.log(`  ${green}✔ Directorio destino identificado: ${targetDir}${reset}\n`);
console.log(`${bold}${cyan}📦 Instalando arnés de desarrollo SDD...${reset}`);

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
  
  if (item.src === item.dest) {
    copiedCount++;
    continue;
  }
  
  try {
    if (fs.existsSync(item.dest)) {
      console.log(`  ${yellow}✔ Updated existing: ${relativeDest}${reset}`);
    } else {
      console.log(`  ${green}✔ Copied: ${relativeDest}${reset}`);
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
// Ensure .openspec directory, active-brief.md and sdd_state.json exist on target with a clean state
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

  const sddStatePath = join(openspecDir, 'sdd_state.json');
  if (!fs.existsSync(sddStatePath)) {
    const cleanState = {
      phase: "F0_DETECT",
      activeContract: "",
      stack: {
        core: [],
        databases: []
      },
      loopMode: false,
      loopTargetIterations: 1,
      loopCurrentIteration: 1,
      rollbackCount: 0,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(sddStatePath, JSON.stringify(cleanState, null, 2), "utf8");
  }
} catch (error) {
  console.error(`${red}❌ Error creating .openspec directory: ${error.message}${reset}`);
}

// Ensure .openspec/ is ignored in the target's .gitignore to avoid propagating local state
try {
  const gitignorePath = join(targetDir, '.gitignore');
  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  const ignoreRule = '.openspec/';
  if (!gitignoreContent.split(/\r?\n/).some(line => line.trim() === ignoreRule)) {
    const separator = gitignoreContent.endsWith('\n') || gitignoreContent === '' ? '' : '\n';
    fs.appendFileSync(gitignorePath, `${separator}${ignoreRule}\n`, 'utf8');
    console.log(`  ${green}✔ Added .openspec/ to .gitignore${reset}`);
  }
} catch (error) {
  console.error(`${red}❌ Error updating .gitignore: ${error.message}${reset}`);
}

if (copiedCount > 0) {
  console.log(`\n${bold}${green}✨ ¡Arnés de Zugzbot instalado y actualizado con éxito!${reset}`);
  console.log(`🚀 Ejecuta ${bold}${cyan}opencode${reset} para iniciar tu sesión de desarrollo autónomo.\n`);
} else {
  console.log(`\n${red}❌ No files were installed.${reset}\n`);
}
