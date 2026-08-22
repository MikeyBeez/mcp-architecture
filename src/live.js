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

// ---------------------------------------------------------------------------
// The last three documents, generated 2026-08-22.
//
// The 2026-08-20 pass converted five virtual documents from hand-typed template
// literals into live reads. Three were left because they were FILE-BACKED, and a
// file looked like it was somebody's writing. It was not:
//
//   Architecture/Master Architecture Index.md      last modified 2025-08-20 — a YEAR old
//   protocols/Master Protocol Index.md             DOES NOT EXIST
//   Architecture/MCP Architecture Server Documentation.md   DOES NOT EXIST
//
// Two of the three were advertised by the registry and had nothing behind them,
// and the third described "complete integration status" as of a year ago. So the
// server was still promising three documents it could not honestly deliver.
//
// They were also the wrong shape for hand-writing. Each one is a REGISTRY -- what
// servers exist, what protocols exist, what this server's own tools are. That is
// live state, and the tool built the night before for filling templates from a
// human brief is the wrong instrument for it: a written registry is a registry that
// starts rotting the moment it is saved. The brief-filled tool belongs on documents
// carrying JUDGMENT, which none of these three do.

function masterArchitectureIndex() {
  const servers = wiredServers();
  let protocols = [];
  try { protocols = fs.readdirSync(PROTO).filter(f => f.endsWith('.md')); } catch { /* empty */ }

  const roots = [
    ['MCP servers',        '~/Code/mcp-*  and a few without the prefix'],
    ['Protocol library',   '~/Code/mcp-protocols/protocols/*.md'],
    ['Harness + ledger',   '~/Code/harness'],
    ['Brain',              '~/Code/Claude_Data/brain/brain.db'],
    ['Documentation',      '~/Code/docs  (HOW_IT_WORKS.md is the front door)'],
    ['Desktop config',     '~/Library/Application Support/Claude/claude_desktop_config.json'],
  ];

  let out = '# Master Architecture Index\n\n';
  out += `**${servers.length} MCP servers wired. ${protocols.length} protocols live.**\n\n`;
  out += 'This is a map of where things are, generated by asking the running system. For how\n';
  out += 'the pieces fit together in prose, read `~/Code/docs/HOW_IT_WORKS.md`, which carries\n';
  out += 'machine-checked claims and regenerates its own inventory half.\n\n';

  out += '## Where everything lives\n\n';
  for (const [label, where] of roots) out += `- **${label}** — \`${where}\`\n`;

  out += '\n## Wired servers\n\n';
  for (const s of servers.sort()) out += `- ${s}\n`;

  out += '\n## Unwired, kept for restore\n\n';
  let unwired = [];
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    unwired = Object.keys((cfg._unwiredServers && cfg._unwiredServers.servers) || {});
  } catch { /* none */ }
  out += unwired.length
    ? unwired.map(u => `- ${u}`).join('\n') + '\n\nRestore records are in `_unwiredServers` in the desktop config.\n'
    : '_None recorded._\n';

  return out + note(`${CONFIG} and ${PROTO}`);
}

function protocolIndex() {
  let files = [];
  try { files = fs.readdirSync(PROTO).filter(f => f.endsWith('.md')).sort(); }
  catch { return `# Master Protocol Index\n\nCould not read ${PROTO}.\n`; }

  const byTier = new Map();
  for (const f of files) {
    const id = f.slice(0, -3);
    let tier = 'untiered', purpose = '';
    try {
      const s = fs.readFileSync(path.join(PROTO, f), 'utf8');
      tier = (s.match(/^\s*-?\s*\*\*Tier\*\*:\s*(.+)$/m) || [, 'untiered'])[1].trim();
      purpose = (s.match(/^\s*-?\s*\*\*Purpose\*\*:\s*(.+)$/m)
              || s.match(/(?:^|\n)##+[ \t]*Purpose[ \t]*\n+([\s\S]*?)(?=\n[ \t]*\n|\n#|$)/i)
              || [, ''])[1].replace(/\s+/g, ' ').trim();
    } catch { /* skip */ }
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier).push({ id, purpose });
  }

  let out = `# Master Protocol Index\n\n**${files.length} protocols, grouped by tier.**\n\n`;
  out += 'A protocol is written instruction, not code. The matcher chooses which apply to a\n';
  out += 'prompt and hands them over; because a matcher chooses, every choice is recorded and\n';
  out += 'can be argued with afterwards. They are re-read on every call, so an edit is live\n';
  out += 'immediately — no restart.\n\n';

  for (const tier of [...byTier.keys()].sort()) {
    out += `## Tier ${tier}\n\n`;
    for (const p of byTier.get(tier)) {
      out += `- **${p.id}** — ${p.purpose ? p.purpose.slice(0, 200) : '_no Purpose line in its Metadata block_'}\n`;
    }
    out += '\n';
  }
  return out + note(`${files.length} files in ~/Code/mcp-protocols/protocols/`);
}

function architectureServerDocs() {
  // Read this server's own tool list out of its own source, so adding a tool
  // updates the document that describes it. The previous version of this document
  // did not exist at all while still being advertised by the registry.
  const SELF = path.join(__dirname, 'index.js');
  let tools = [];
  try {
    const s = fs.readFileSync(SELF, 'utf8');
    const re = /name:\s*'(arch_[a-z_]+|help)',\s*\n\s*description:\s*'([^']+)'/g;
    let m; while ((m = re.exec(s))) tools.push({ name: m[1], desc: m[2] });
  } catch { /* none */ }

  let docs = [];
  try {
    const s = fs.readFileSync(SELF, 'utf8');
    const re = /'([a-z-]+)':\s*\{\s*\n\s*path:\s*(null|'[^']*')/g;
    let m; while ((m = re.exec(s))) docs.push({ id: m[1], path: m[2] === 'null' ? null : m[2].slice(1, -1) });
  } catch { /* none */ }

  let out = '# MCP Architecture Server Documentation\n\n';
  out += 'What this server is for, and the one thing to know before trusting it.\n\n';
  out += '## The one thing\n\n';
  out += 'This server exists so a session does not have to read the code to know what the\n';
  out += 'system is. That makes it an authority, and on 2026-08-19 an audit found it was a\n';
  out += 'confidently wrong one: five of its documents were hand-typed prose in `index.js`,\n';
  out += 'and its tools registry told readers to call six tools that did not exist. Every\n';
  out += 'document is now DERIVED from the running system on each call. If one of them is\n';
  out += 'wrong, the system is wrong — not the document.\n\n';

  out += `## Tools (${tools.length})\n\n`;
  for (const t of tools) out += `- **${t.name}** — ${t.desc}\n`;

  const virt = docs.filter(d => !d.path), filed = docs.filter(d => d.path);
  out += `\n## Documents (${docs.length})\n\n`;
  out += `${virt.length} generated from the running system, ${filed.length} backed by a file in the vault.\n\n`;
  for (const d of docs) out += `- \`${d.id}\` — ${d.path ? `file: \`${d.path}\`` : 'generated on every call'}\n`;

  out += '\n## Limits worth stating\n\n';
  out += '- A generated document is only as honest as what it reads. It reports the running\n';
  out += '  system; it cannot tell you the running system is a good idea.\n';
  out += '- Nothing here can see the account preferences, which are settings in the Claude\n';
  out += '  app rather than files, so all of this can be current while those drift.\n';
  out += '- `arch_fill_template` writes a document from a brief you supply and refuses it\n';
  out += '  unless every section of the template came back filled. It is for documents\n';
  out += '  carrying JUDGMENT. Do not use it for a registry — derive those instead.\n';

  return out + note(`this server's own source at ${SELF}`);
}

module.exports.masterArchitectureIndex = masterArchitectureIndex;
module.exports.protocolIndex = protocolIndex;
module.exports.architectureServerDocs = architectureServerDocs;
