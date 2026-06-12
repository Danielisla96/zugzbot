// Zugzbot v3.0.0 — Tools registry
// Re-exports every active tool. Tools are organized by phase in subfolders:
//   _core/ — orquestación genérica (transición, lockfile, router, contexto, sesión)
//   _lib/  — librerías internas (no son tools registrables)
//   _f0/   — Fase 0: discovery y setup
//   _f1/   — Fase 1: planning y validación de spec
//   _f2/   — Fase 2: TDD (RED, GREEN, REFACTOR)
//   _f3/   — Fase 3: validación y auditoría
//   _f4/   — Fase 4: deploy y protección
//   _f5/   — Fase 5: archivado y release
//   _utils/ — utilidades varias

export { default as sdd_transition } from './_core/sdd_transition.js';
export { default as sdd_lock_manager } from './_core/sdd_lock_manager.js';
export { default as sdd_router } from './_core/sdd_router.js';
export { default as sdd_checkpoint } from './_core/sdd_checkpoint.js';
export { default as sdd_compact_context } from './_core/sdd_compact_context.js';
export { default as sdd_context_pruner } from './_core/sdd_context_pruner.js';
export { default as sdd_session_features } from './_core/sdd_session_features.js';
export { default as sdd_clasp } from './_core/sdd_clasp.js';

export { default as sdd_stack_detector } from './_f0/sdd_stack_detector.js';
export { default as sdd_git_awareness } from './_f0/sdd_git_awareness.js';
export { default as sdd_generate_tree } from './_f0/sdd_generate_tree.js';
export { default as sdd_graphify } from './_f0/sdd_graphify.js';
export { default as sdd_install_autoskills } from './_f0/sdd_install_autoskills.js';

export { default as sdd_requirement_tracker } from './_f1/sdd_requirement_tracker.js';
export { default as sdd_diff_impact_analyzer } from './_f1/sdd_diff_impact_analyzer.js';
export { default as sdd_test_scaffold_generator } from './_f1/sdd_test_scaffold_generator.js';
export { default as sdd_auto_api_mocker } from './_f1/sdd_auto_api_mocker.js';
export { default as sdd_spec_reviewer } from './_f1/sdd_spec_reviewer.js';
export { default as sdd_spec_validator } from './_f1/sdd_spec_validator.js';
export { default as sdd_dependency_installer } from './_f1/sdd_dependency_installer.js';
export { default as check_dependency_cooldown } from './_f1/check_dependency_cooldown.js';
export { default as sdd_heroui_lookup } from './_f1/sdd_heroui_lookup.js';

export { default as sdd_test_runner } from './_f2/sdd_test_runner.js';
export { default as sdd_linter } from './_f2/sdd_linter.js';
export { default as sdd_auto_healer } from './_f2/sdd_auto_healer.js';
export { default as sdd_brain_sync } from './_f2/sdd_brain_sync.js';
export { default as sdd_brain_curator } from './_f2/sdd_brain_curator.js';
export { default as sdd_bdd_tester } from './_f2/sdd_bdd_tester.js';
export { default as sdd_regression_detector } from './_f2/sdd_regression_detector.js';

export { default as sdd_secret_scanner } from './_f3/sdd_secret_scanner.js';
export { default as sdd_security_vulnerability_scanner } from './_f3/sdd_security_vulnerability_scanner.js';
export { default as sdd_spec_compliance_linter } from './_f3/sdd_spec_compliance_linter.js';
export { default as sdd_sandbox_patcher } from './_f3/sdd_sandbox_patcher.js';
export { default as sdd_visual_regression_diff } from './_f3/sdd_visual_regression_diff.js';
export { default as sdd_performance_regress_profiler } from './_f3/sdd_performance_regress_profiler.js';
export { default as sdd_ui_auditor } from './_f3/sdd_ui_auditor.js';

export { default as sdd_destructive_guard } from './_f4/sdd_destructive_guard.js';
export { default as sdd_free_port_finder } from './_f4/sdd_free_port_finder.js';

export { default as sdd_archive_and_commit } from './_f5/sdd_archive_and_commit.js';
