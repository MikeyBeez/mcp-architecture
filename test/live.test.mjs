// The documentation server must not be able to lie again.
//
// Audited 2026-08-19: five of its eight documents were hardcoded template literals,
// and the "complete list of MCP tools" told readers to call six tools that do not
// exist. Reading the source would have been more accurate than asking the server whose
// job is to save you from reading the source. These tests pin the properties that make
// that impossible now: the documents are DERIVED, and derived documents cannot drift.

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const live = require('../src/live.js');

const HOME = os.homedir();
const CONFIG = path.join(HOME, 'Library/Application Support/Claude/claude_desktop_config.json');
const PROTO = path.join(HOME, 'Code/mcp-protocols/protocols');

// Names that were confidently asserted by the old hardcoded documents and are dead.
const DEAD = ['mikey_remember', 'mikey_recall', 'mikey_init', 'mikey_reflect',
              'mikey_state_get', 'mikey_state_set', 'mikey_switch_project',
              'protocol-engine', 'mcp-brain-manager'];

describe('generated documents match the running system', () => {
  test('the tools registry reports the real server count', () => {
    const n = Object.keys(JSON.parse(fs.readFileSync(CONFIG, 'utf8')).mcpServers).length;
    assert.match(live.mcpToolsRegistry(), new RegExp(`\\*\\*${n} servers are wired right now`));
  });

  test('the trigger reference reports the real protocol count', () => {
    const n = fs.readdirSync(PROTO).filter(f => f.endsWith('.md')).length;
    assert.match(live.protocolTriggers(), new RegExp(`\\*\\*${n} protocols are live`));
  });

  test('no document asserts a dead tool or server as if it were live', () => {
    for (const [name, doc] of Object.entries({
      registry: live.mcpToolsRegistry(), triggers: live.protocolTriggers(),
      paths: live.systemPaths(), guide: live.protocolSystemGuide(),
      project: live.projectCreationGuide(),
    })) {
      for (const d of DEAD)
        assert.ok(!doc.includes(d), `${name} still names ${d}`);
    }
  });

  test('the tools registry never names an unwired server as live', () => {
    const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    const unwired = Object.keys(cfg._unwiredServers?.servers || {});
    const live_part = live.mcpToolsRegistry().split('## Unwired')[0];
    for (const s of unwired) assert.ok(!live_part.includes(`### ${s}`), `${s} is unwired but listed as live`);
  });

  test('the protocol guide points at the Markdown library, not the dead .js tree', () => {
    const g = live.protocolSystemGuide();
    assert.match(g, /protocols\/\*\.md/, 'must name the live library');
    assert.match(g, /Do not author in/, 'must warn off the deprecated tree');
  });

  test('every path a document offers is existence-checked, and marked when missing', () => {
    const p = live.systemPaths();
    assert.ok(p.includes('✓'), 'paths that exist should be ticked');
    // a path that does not exist must be labelled, never listed silently
    assert.ok(!/`[^`]+`\s*$/m.test(p.replace(/ (✓|\*\*MISSING\*\*)/g, ' ✓')),
      'every path line must carry a verdict');
  });
});
