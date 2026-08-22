// fill.js — hand a template to ornith and REFUSE the result unless the template's
// own structure came back filled.
//
// WHY THIS EXISTS. Mikey, 2026-08-21: "the best place for simple job is to be called
// from within tools that have a distinct structure that they have to follow."
//
// mcp-simple-job refuses any job that cannot state its own check. Until now the
// caller had to invent that check each time, which puts the weakest link — a model's
// judgment in the moment — in charge of whether the verification is any good. A tool
// with a fixed template does not have that problem: THE STRUCTURE IS THE CHECK. Every
// heading in the template must come back, and must come back with something other
// than the placeholder line it shipped with. That is a mechanical test, not an
// opinion, and it is derived from the template rather than written down beside it.
//
// This server is also the right place to start. On 2026-08-19 an audit found six of
// its eight documents were literal string constants in a 1265-line index.js, and its
// "complete list of MCP tools" named six tools that did not exist. It is the server
// whose entire job is to be authoritative and it was the least trustworthy thing in
// the system. Documents built against a validated structure are the opposite of that.

const path = require('path');
const os = require('os');

// One source of truth for the model call. ornith.js carries measurements that were
// expensive to get -- thinking off by default (a 2-in-3 silent-empty rate with it on),
// curl rather than fetch because an MCP server's environment and DNS cannot be relied
// on, a generous token budget. Duplicating it here would guarantee drift, so this
// imports it. mcp-simple-job is ESM and this server is CommonJS, hence dynamic import.
const ORNITH_PATH = process.env.ORNITH_MODULE
  || path.join(os.homedir(), 'Code/mcp-simple-job/ornith.js');

async function loadOrnith() {
  try {
    return await import('file://' + ORNITH_PATH);
  } catch (e) {
    throw new Error(
      `cannot load the model client at ${ORNITH_PATH}: ${e.message}. ` +
      `arch_fill_template depends on mcp-simple-job/ornith.js; set ORNITH_MODULE if it moved.`);
  }
}

/**
 * Headings the filled document must contain, in order, taken from the template
 * itself. The {title} line is excluded -- it is substituted, not authored.
 */
function requiredSections(template) {
  return [...template.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)]
    .map(m => m[2])
    .filter(h => !h.includes('{title}'));
}

/**
 * Split a markdown document into { heading -> body } by scanning LINES.
 *
 * Deliberately not a regex. The first version of this used
 *   ([\s\S]*?)(?=^#{1,3}\s|\Z)
 * which has two defects that both fail SILENTLY: \Z is not a JavaScript escape at
 * all (it matches a literal "Z", so a body ended at the first capital Z in the
 * prose), and under the /m flag $ matches the end of every line, so the lazy body
 * stops after one line. The identical /m-plus-$ mistake truncated a protocol
 * purpose mid-sentence in gen-how-it-works.mjs the same night. A line scanner
 * cannot go wrong in either way.
 */
function sections(doc) {
  const out = {};
  let current = null, buf = [];
  for (const line of String(doc).split(/\r?\n/)) {
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current !== null) out[current] = buf.join('\n').trim();
      current = m[2];
      buf = [];
    } else if (current !== null) {
      buf.push(line);
    }
  }
  if (current !== null) out[current] = buf.join('\n').trim();
  return out;
}

/**
 * The placeholder prose the template ships with, per heading. A section that comes
 * back byte-identical to this was not filled -- it was copied.
 */
function placeholderBodies(template) {
  return sections(template);
}

/** Body text under one heading in the filled document, or null if absent. */
function bodyOf(doc, heading) {
  const s = sections(doc);
  return Object.prototype.hasOwnProperty.call(s, heading) ? s[heading] : null;
}

/**
 * The check. Structural, mechanical, and derived from the template -- not a judgment
 * about whether the writing is good, which is a thing neither this server nor ornith
 * can assess. It answers exactly one question: did every section the template demands
 * come back with content of its own?
 */
function validate(doc, template, { minChars = 40 } = {}) {
  const required = requiredSections(template);
  const placeholders = placeholderBodies(template);
  const missing = [], unchanged = [], thin = [], echoed = [];
  for (const h of required) {
    const body = bodyOf(doc, h);
    if (body === null) { missing.push(h); continue; }
    // A heading whose template body is EMPTY is STRUCTURAL -- a parent that exists to
    // hold sub-headings, like "## Protocol Steps" above "### Step 1". Requiring prose
    // under it rejects a correctly filled document, which is exactly what happened on
    // the first end-to-end run: ornith put the content under the three Step headings,
    // properly, and the check called the parent "still the placeholder" because empty
    // equalled empty. For these, PRESENCE is the whole requirement.
    if (!placeholders[h]) continue;
    if (body === placeholders[h]) { unchanged.push(h); continue; }
    if (body.replace(/\s+/g, ' ').length < minChars) { thin.push(h); continue; }
    // The first passing run kept the scaffolding: "Define the purpose and scope of
    // this protocol." survived as its own line with real prose underneath it. The
    // section is not the placeholder, so the equality test above let it through, and
    // the document read like a half-edited form. A line of the template surviving
    // VERBATIM is a mechanical signal that the section was prepended to rather than
    // written, so it is its own failure mode.
    const tmplLines = new Set(placeholders[h].split('\n').map(l => l.trim()).filter(l => l.length > 12));
    if (body.split('\n').some(l => tmplLines.has(l.trim()))) echoed.push(h);
  }
  const passed = !missing.length && !unchanged.length && !thin.length && !echoed.length;
  return {
    passed, required: required.length, missing, unchanged, thin, echoed,
    why: passed
      ? `all ${required.length} template sections present and filled`
      : [ missing.length   ? `missing: ${missing.join(', ')}` : null,
          unchanged.length ? `still the template placeholder: ${unchanged.join(', ')}` : null,
          thin.length      ? `under ${minChars} characters: ${thin.join(', ')}` : null,
          echoed.length    ? `template scaffolding left in place: ${echoed.join(', ')}` : null,
        ].filter(Boolean).join('; '),
  };
}

function buildPrompt(template, { title, description, brief }) {
  const heads = requiredSections(template);
  return [
    `Fill in this Markdown document template.`,
    ``,
    `Title: ${title}`,
    `One-line description: ${description}`,
    ``,
    `RULES, all of them mandatory:`,
    `1. Keep EVERY heading exactly as written, including any emoji, in the same order.`,
    `2. Under each heading, DELETE the placeholder text entirely and write real content drawn from the brief. Do not keep the placeholder line and add to it — the placeholder wording must not appear anywhere in your output.`,
    `3. Do not add headings. Do not remove headings. Do not reorder them.`,
    `4. Every section must have at least a couple of sentences or a real list. Never leave a heading empty and never leave the placeholder text in place.`,
    `5. If the brief does not cover a section, write what can honestly be said and state plainly what is not yet decided. Do not invent specifics.`,
    `6. Output the finished Markdown only. No preamble, no commentary, no code fences.`,
    ``,
    `The ${heads.length} headings that must appear: ${heads.join(' | ')}`,
    ``,
    `--- TEMPLATE ---`,
    template.replace(/\{title\}/g, title).replace(/\{description\}/g, description),
    ``,
    `--- BRIEF ---`,
    brief,
  ].join('\n');
}

/**
 * Returns { ok, content, check, attempts, tokens, tps, error }.
 * Never throws for a model or validation failure -- a refusal is a result.
 */
async function fillTemplate(template, { title, description, brief, maxAttempts = 2, minChars = 40 } = {}) {
  if (!brief || !String(brief).trim()) {
    return { ok: false, error: 'no brief supplied. This tool fills a template from material you provide; it will not invent the content.' };
  }
  const { ask } = await loadOrnith();
  const prompt = buildPrompt(template, { title, description, brief });

  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = ask(prompt, { max_tokens: 4096, temperature: 0.2, timeout_ms: 240000 });
    if (!r.ok) return { ok: false, attempts: attempt, error: r.error || 'model call failed' };
    const doc = String(r.content || '').replace(/^```(?:markdown)?\s*|\s*```$/g, '').trim();
    const check = validate(doc, template, { minChars });
    last = { doc, check, tokens: r.tokens, tps: r.tps };
    if (check.passed) {
      return { ok: true, content: doc, check, attempts: attempt, tokens: r.tokens, tps: r.tps };
    }
    // One retry, and it is told exactly what failed. Beyond that, refuse -- a third
    // attempt is the shape of tuning until something passes, which is how a check
    // stops meaning anything.
  }
  return {
    ok: false, attempts: maxAttempts, content: last?.doc, check: last?.check,
    tokens: last?.tokens, tps: last?.tps,
    error: `the filled document did not satisfy the template after ${maxAttempts} attempts: ${last?.check?.why}`,
  };
}

module.exports = { fillTemplate, validate, requiredSections, placeholderBodies, bodyOf, buildPrompt };
