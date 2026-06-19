const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const stateFilePath = path.resolve(projectRoot, '.openspec/sdd_state.json');

try {
  const dir = path.dirname(stateFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  let state = {
    phase: 'F0_DETECT',
    activeContract: '',
    stack: { core: [], databases: [] },
    updatedAt: new Date().toISOString()
  };

  if (fs.existsSync(stateFilePath)) {
    try {
      state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
    } catch (e) {
      // ignore
    }
  }

  state.phase = 'F2_IMPLEMENTATION';
  state.activeContract = state.activeContract || '.openspec/specs/fast-track/contract.json';
  state.updatedAt = new Date().toISOString();

  fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  console.log('✓ Fast Track: Fase forzada a F2_IMPLEMENTATION de forma atómica.');
} catch (error) {
  console.error('Error al inicializar Fast Track:', error.message);
}
