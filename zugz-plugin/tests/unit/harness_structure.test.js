import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, test, expect } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

describe('Tool Scripts Existence', () => {
  const tools = [
    'sdd_generate_tree.js',
    'sdd_install_autoskills.js',
    'sdd_transition.js',
    'sdd_checkpoint.js',
    'sdd_ui_auditor.js',
    'sdd_archive_and_commit.js',
    'sdd_brain_sync.js',
    'gas_clasp_tools.js',
    'sdd_auto_healer.js'
  ];

  tools.forEach(tool => {
    test(`${tool} should exist`, () => {
      const toolPath = path.join(rootDir, '.opencode', 'tools', tool);
      expect(fs.existsSync(toolPath), `${tool} should exist at ${toolPath}`).toBe(true);
    });
  });
});

describe('Agent Files Existence', () => {
  const agents = [
    'zugzbot.md',
    'sdd-explorer.md',
    'sdd-planner.md',
    'sdd-builder.md',
    'sdd-tester.md',
    'sdd-archiver.md',
    'sdd-deployer.md',
    'aux-handyman.md',
    'aux-oracle.md'
  ];

  agents.forEach(agent => {
    test(`${agent} should exist`, () => {
      const agentPath = path.join(rootDir, 'agents', agent);
      expect(fs.existsSync(agentPath), `${agent} should exist`).toBe(true);
    });
  });
});

describe('Config Files', () => {
  test('package.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'package.json'))).toBe(true);
  });

  test('plugin.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'plugin.json'))).toBe(true);
  });

  test('eslint.config.js should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'eslint.config.js'))).toBe(true);
  });

  test('zugz-models.json should exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'zugz-models.json'))).toBe(true);
  });
});
