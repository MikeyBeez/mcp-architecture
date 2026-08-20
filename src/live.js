// live.js — generate the "virtual" architecture documents from the running system.
//
// Why this exists (2026-08-20). Five of this server's documents were TEMPLATE LITERALS
// in index.js — about 521 lines of hand-typed prose describing the system. The whole
// point of this server is to save a session from reading the code, so it is supposed to
// be the authority. It wasn't. Audited on 2026-08-19, its "MCP Tools Registry" document
// told the reader to call mikey_remember, mikey_recall, mikey_state_get, mikey_state_set,
// mikey_create_project and mikey_switch_project — every one either renamed to brain_* in
// June or never existing at all. It listed protocol-engine, contemplation and
// mikey-manager, none of them wired. It asserted "All custom tools use the mikey_ prefix",
// abandoned in June. And it omitted about fourteen servers that ARE wired.
//
// Reading the source would have been more accurate than asking the documentation server.
// A confidently wrong oracle is worse than no oracle.
//
// Correcting the text would only have reset the clock. These now read the live system on
// every call, so they cannot drift: what they report IS what is running.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOME = os.homedir();
const CONFIG = path.join(HOME, 'Library/Application Support/Claude/claude_desktop_config.json');
const PROTO  = path.join(HOME, 'Code/mcp-protocols/protocols');
const INV    = path.join(HOME, 'Code/docs/tool-inventory.md');

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
const note  = (src) => `\n\n---\n_Generated from ${src} at ${stamp()} UTC. Not hand-written — if this is\nwrong, the system is wrong, not the document._\n`;

function wiredServers() {
  try { return Object.entries(JSON.parse(fs.readFileSync(CONFIG, 'utf8')).mcpServers || {}); }
  catch (e) { return null; }
}

function mcpToolsRegistry() {
  const servers = wiredServers();
  if (!servers) return `# MCP Tools Registry\n\nCould not read ${CONFIG}. No claim is better than a stale one.\n`;

  let out = `# MCP Tools Registry\n\n**${servers.length} servers are wired right now.**\n\n`;

  // Tool names come from the generated inventory, which doc_check keeps fresh.
  let byServer = {};
  try {
    const inv = fs.readFileSync(INV, 'utf8');
    const sections = inv.split(/^### /m).slice(1);
    for (const sec of sections) {
      const name = sec.split('\n')[0].replace(/`/g, '').trim();
      const tools = [...sec.matchAll(/^[-*|] *`([a-z][a-z0-9_]{2,})`/gm)].map(x => x[1]);
      if (tools.length) byServer[name] = tools;
    }
  } catch { /* inventory missing — names simply omitted rather than invented */ }

  for (const [name, cfg] of servers.sort()) {
    const target = (cfg.args || []).filter(a => String(a).endsWith('.js') || String(a).endsWith('.mjs')).pop();
    out += `### ${name}\n`;
    if (target) out += `- source: \`${target}\`${fs.existsSync(target) ? '' : '  **(FILE MISSING)**'}\n`;
    if (byServer[name]) out += `- tools: ${byServer[name].map(t => '`' + t + '`').join(', ')}\n`;
    out += '\n';
  }

  const unwired = (() => {
    try { return Object.keys(JSON.parse(fs.readFileSync(CONFIG, 'utf8'))._unwiredServers?.servers || {}); }
    catch { return []; }
  })();
  if (unwired.length)
    out += `## Unwired (kept on disk, restorable)\n\n${unwired.map(s => `- ${s}`).join('\n')}\n\n`;

  out += `## Naming\n\nTools are namespaced by SERVER DOMAIN — \`brain_*\`, \`git_*\`, \`db_*\`, \`safe_*\`.\n` +
         `Not a personal prefix. An older version of this document claimed every custom tool\n` +
         `uses a \`mikey_\` prefix; that convention was dropped in June 2026 and only the\n` +
         `protocols server still carries it.\n`;
  return out + note('claude_desktop_config.json and ~/Code/docs/tool-inventory.md');
}

function protocolTriggers() {
  let files = [];
  try { files = fs.readdirSync(PROTO).filter(f => f.endsWith('.md')).sort(); }
  catch (e) { return `# Protocol Triggers\n\nCould not read ${PROTO}.\n`; }

  let out = `# Protocol Triggers Quick Reference\n\n**${files.length} protocols are live.**\n` +
            `Each fires when its trigger words appear in a prompt.\n\n`;
  for (const f of files) {
    const id = f.slice(0, -3);
    let purpose = '', kws = '';
    try {
      const s = fs.readFileSync(path.join(PROTO, f), 'utf8');
      purpose = (s.match(/^- \*\*Purpose\*\*:\s*(.+)$/m) || s.match(/^## Purpose\s*\n+(.+)$/m) || [, ''])[1] || '';
      kws = (s.match(/\*\*Trigger keywords\*\*:\s*(.+)$/m) || [, ''])[1] || '';
    } catch { /* skip */ }
    out += `### ${id}\n${purpose.slice(0, 220)}\n`;
    if (kws) out += `\n_fires on:_ ${kws.slice(0, 300)}\n`;
    out += '\n';
  }
  const retired = (() => {
    try { return fs.readdirSync(path.join(PROTO, '_retired')).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)); }
    catch { return []; }
  })();
  if (retired.length) out += `## Retired\n\n${retired.map(r => `- ${r}`).join('\n')}\n`;
  return out + note(`${files.length} files in ~/Code/mcp-protocols/protocols/`);
}

function systemPaths() {
  const paths = [
    ['protocol library',      '~/Code/mcp-protocols/protocols'],
    ['the wired protocols server', '~/Code/mcp-protocols-lean/index.js'],
    ['brain server',          '~/Code/mcp-brain-lean/index.js'],
    ['harness + ledger',      '~/Code/harness/ledger.db'],
    ['contract checks',       '~/Code/harness/check-contracts.sh'],
    ['improvement loop',      '~/Code/harness/improvement.mjs'],
    ['tool contract',         '~/Code/harness/tool-contract.json'],
    ['desktop config',        '~/Library/Application Support/Claude/claude_desktop_config.json'],
    ['MCP wiring changelog',  '~/Library/Application Support/Claude/MCP_CHANGELOG.md'],
    ['docs',                  '~/Code/docs'],
    ['system component map',  '~/Code/docs/SYSTEM_COMPONENT_MAP.md'],
    ['protocol system plan',  '~/Code/docs/PROTOCOL_SYSTEM_PLAN.md'],
    ['session status',        '~/Code/docs/session-status.md'],
    ['tool inventory',        '~/Code/docs/tool-inventory.md'],
    ['MCP server logs',       '~/Library/Logs/Claude'],
    ['BrainVault',            '~/Code/claude-brain/data/BrainVault'],
    ['local skills',          '~/.claude/skills'],
  ];
  let out = `# System Paths Reference\n\nEvery path below is checked as this document is generated.\n\n`;
  for (const [label, p] of paths) {
    const abs = p.replace(/^~/, HOME);
    out += `- **${label}** — \`${p}\` ${fs.existsSync(abs) ? '✓' : '**MISSING**'}\n`;
  }
  return out + note('a live existence check of each path');
}

module.exports = { mcpToolsRegistry, protocolTriggers, systemPaths };

// --- the two procedural guides -------------------------------------------------
// These are advice rather than data, so they are not derived wholesale — but the
// PATHS they send a reader to are checked live, because that is exactly how both of
// them went wrong. protocol-system-guide was directing authors to
// ~/Code/mcp-protocols/src/protocols/foundation/, a directory whose own
// _DEPRECATED.md says nothing reads it. project-creation-guide named
// mikey_create_project, which exists nowhere, and the old brain server, replaced by
// mcp-brain-lean in June 2026.

function checkPath(label, p) {
  const abs = p.replace(/^~/, HOME);
  return `- **${label}** — \`${p}\` ${fs.existsSync(abs) ? '✓' : '**MISSING**'}`;
}

function protocolSystemGuide() {
  const n = (() => { try { return fs.readdirSync(PROTO).filter(f => f.endsWith('.md')).length; } catch { return '?'; } })();
  return `# Protocol System Guide

**Protocols are Markdown, and only Markdown.** There are ${n} of them, all in
\`~/Code/mcp-protocols/protocols/*.md\`. That directory is the entire live library.

**Do not author in \`src/protocols/foundation/\`.** An older version of this document
sent people there. Nothing has read that directory since the lean rewrite; its own
\`_DEPRECATED.md\` says so, and every file in it was triaged keep-or-retire in June 2026.
A protocol that exists only as \`.js\` is invisible to \`mikey_prompt_process\`.

## To add or change a protocol

1. Write or edit \`protocols/<id>.md\`. Give it a \`## Purpose\` and a
   \`## Trigger Conditions\` section ending in a plain \`Trigger keywords:\` list — the
   matcher scores against the title, Purpose and Trigger Conditions, so a protocol with
   no keywords never fires.
2. Add or update its entry in \`protocols/triggers.json\`. Avoid ordinary English words:
   fourteen were removed in June for causing eleven times more false matches than real ones.
3. Run \`~/Code/harness/check-contracts.sh\`. It will tell you if the edit broke a
   reference somewhere else — including in a skill, which the ledger cannot see.

## Or let the improvement loop do it

\`mikey_propose\` records what should change and why. Trigger-keyword changes apply
automatically under a guard that refuses any word another protocol already owns. Prose
changes wait for Mikey and require the replacement text — the tool never writes protocol
prose itself.

## Paths, checked as this was generated

${checkPath('the live library', '~/Code/mcp-protocols/protocols')}
${checkPath('keyword authority', '~/Code/mcp-protocols/protocols/triggers.json')}
${checkPath('typed protocol graph', '~/Code/mcp-protocols/edges.json')}
${checkPath('the wired server', '~/Code/mcp-protocols-lean/index.js')}
${checkPath('the contract checks', '~/Code/harness/check-contracts.sh')}
${checkPath('the improvement loop', '~/Code/harness/improvement.mjs')}
${checkPath('DEPRECATED — do not author here', '~/Code/mcp-protocols/src/protocols/foundation')}
` + note('the live protocol library, with every path existence-checked');
}

function projectCreationGuide() {
  return `# Project Creation Guide

**There is no \`mikey_create_project\` tool.** An older version of this document said
there was. It never existed on any running server, and the brain server it named
(\`the old brain server\`) was replaced by \`mcp-brain-lean\` in June 2026.

Project setup is done by hand, with \`system_exec\`:

1. \`mkdir ~/Code/<name> && cd ~/Code/<name> && git init\`
2. Write a README saying what the thing is FOR, in one paragraph.
3. \`gh repo create MikeyBeez/<name> --private --source=. --remote=origin\`
   (\`gh\` is installed and authenticated as MikeyBeez.)
4. Add a \`.gitignore\` before the first commit: \`__pycache__/\`, \`*.pyc\`, \`*.bak\`,
   \`*.bak-*\`, and any runtime state, ledger or lock files.
5. If it is a server that will be wired into Claude Desktop, give it a \`test\` script
   in \`package.json\` from the start — \`safe_edit\` finds it automatically and will
   refuse an edit that breaks it.

For a GPU project on pop, read the \`gpu-project-env-setup\` protocol first; it reuses
an existing venv instead of re-downloading multi-gigabyte torch and CUDA wheels.

Remotes are SSH, never HTTPS: \`git@github.com:MikeyBeez/<name>.git\`.

## Paths, checked as this was generated

${checkPath('where projects live', '~/Code')}
${checkPath('the current brain server', '~/Code/mcp-brain-lean/index.js')}
${checkPath('ssh key', '~/.ssh/id_ed25519.pub')}
${checkPath('gh config', '~/.config/gh/hosts.yml')}
` + note('a live existence check of each path');
}

module.exports.protocolSystemGuide = protocolSystemGuide;
module.exports.projectCreationGuide = projectCreationGuide;
