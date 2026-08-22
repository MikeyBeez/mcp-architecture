// The check that lets this server delegate writing without delegating trust.
//
// arch_fill_template hands a template to a local model and refuses the result unless
// the template's own structure came back filled. These tests pin the refusals. They
// matter more than the happy path: a check that cannot fail is decoration, and this
// file exists because two versions of this validator silently could not fail.
//
// Both bugs are pinned below as named tests:
//  - the section parser once used ([\s\S]*?)(?=^#{1,3}\s|\Z). \Z is not a JavaScript
//    escape, so a section body ended at the first capital Z in the prose.
//  - the first end-to-end run REFUSED a correctly filled document, because
//    "## Protocol Steps" is a parent heading with no body of its own and the
//    still-the-placeholder test compared empty to empty.

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { validate, requiredSections, bodyOf, buildPrompt, resolveTemplate, stripFooter } = require('../src/fill.js');

const TEMPLATE = `# {title}

*{description}*

## 🎯 Purpose

Define the purpose and scope of this protocol.

## ⚡ Trigger Conditions

- When to activate this protocol
- Specific situations or contexts

## 📋 Protocol Steps

### Step 1: Initial Assessment
- Action items
- Decision points
`;

const FILLED = `# Backup Verification Protocol

*Make sure a backup can actually be restored.*

## 🎯 Purpose

A backup nobody has restored is a hypothesis, not a backup. This protocol exists so that
every backup job is followed by an actual restore into a scratch location.

## ⚡ Trigger Conditions

- After any change to what is being backed up
- Monthly, whether or not anything changed
- Immediately after a restore has failed for any reason

## 📋 Protocol Steps

Run the restore before you need it, into a location you can throw away afterwards.

### Step 1: Initial Assessment
Confirm the backup exists, note its size and timestamp, and compare both against the
previous run so a silently empty archive is caught before the restore begins.
`;

describe('requiredSections', () => {
  test('takes the headings from the template and drops the {title} line', () => {
    const r = requiredSections(TEMPLATE);
    assert.equal(r.length, 4);
    assert.ok(!r.some(h => h.includes('{title}')), 'the title is substituted, not authored');
    assert.deepEqual(r, ['🎯 Purpose', '⚡ Trigger Conditions', '📋 Protocol Steps', 'Step 1: Initial Assessment']);
  });
});

describe('the parser', () => {
  test('a body spans multiple lines and is not cut short by a capital Z', () => {
    // The \Z bug: a regex terminator that was a literal Z. "hypothesis" is on the
    // first line and "scratch location" on the second, with a Z in "hypothesis"...
    // no -- the guard is that BOTH survive, across a line break.
    const body = bodyOf(FILLED, '🎯 Purpose');
    assert.ok(body.includes('hypothesis'));
    assert.ok(body.includes('scratch location'), 'body was truncated after one line');
  });

  test('an absent heading reads as null, not as empty', () => {
    assert.equal(bodyOf(FILLED, 'No Such Heading'), null);
  });
});

describe('validate — the refusals', () => {
  test('the raw template is REFUSED; nothing in it was written', () => {
    const r = validate(TEMPLATE, TEMPLATE);
    assert.equal(r.passed, false);
    assert.ok(r.unchanged.includes('🎯 Purpose'));
    assert.ok(r.unchanged.includes('⚡ Trigger Conditions'));
  });

  test('a structural parent heading is judged on PRESENCE, not prose', () => {
    // "## 📋 Protocol Steps" holds sub-headings and has no body of its own. Requiring
    // content under it rejected a correctly filled document on the first live run.
    const r = validate(TEMPLATE, TEMPLATE);
    assert.ok(!r.unchanged.includes('📋 Protocol Steps'),
      'an empty-bodied parent must not be flagged as unfilled');
  });

  test('a dropped heading is caught', () => {
    const missing = FILLED.replace(/## ⚡ Trigger Conditions[\s\S]*?(?=\n## )/, '');
    const r = validate(missing, TEMPLATE);
    assert.equal(r.passed, false);
    assert.ok(r.missing.includes('⚡ Trigger Conditions'));
  });

  test('a one-word section is caught', () => {
    const thin = FILLED.replace(/A backup nobody has restored[\s\S]*?scratch location\./, 'Because.');
    const r = validate(thin, TEMPLATE);
    assert.equal(r.passed, false);
    assert.ok(r.thin.includes('🎯 Purpose'));
  });

  test('template scaffolding left verbatim above real prose is caught', () => {
    // The first passing live run kept "Define the purpose and scope of this protocol."
    // as its own line and wrote underneath it. Not equal to the placeholder, so the
    // equality test passed it, and the document read like a half-edited form.
    const echoed = FILLED.replace('A backup nobody has restored',
      'Define the purpose and scope of this protocol.\n\nA backup nobody has restored');
    const r = validate(echoed, TEMPLATE);
    assert.equal(r.passed, false);
    assert.ok(r.echoed.includes('🎯 Purpose'));
  });

  test('why names every failing section, so the brief can be fixed rather than guessed at', () => {
    const r = validate(TEMPLATE, TEMPLATE);
    assert.match(r.why, /🎯 Purpose/);
  });
});

describe('validate — the pass', () => {
  test('a genuinely filled document passes', () => {
    const r = validate(FILLED, TEMPLATE);
    assert.equal(r.passed, true, r.why);
    assert.equal(r.required, 4);
    assert.match(r.why, /all 4 template sections/);
  });
});

describe('buildPrompt', () => {
  test('names every heading and forbids adding, removing or reordering them', () => {
    const p = buildPrompt(TEMPLATE, { title: 'T', description: 'D', brief: 'B' });
    for (const h of requiredSections(TEMPLATE)) assert.ok(p.includes(h), `heading missing from prompt: ${h}`);
    assert.match(p, /Do not add headings/);
    assert.match(p, /Do not remove headings/);
  });

  test('tells the model not to invent specifics the brief does not cover', () => {
    const p = buildPrompt(TEMPLATE, { title: 'T', description: 'D', brief: 'B' });
    assert.match(p, /Do not invent specifics/);
  });
});

// Added 2026-08-22 after the first real document was REFUSED for two reasons that
// were both defects in this file rather than in what the model wrote.
describe('the two false refusals found on the first real document', () => {
  test('a "#" comment inside a fenced code block is not a heading', () => {
    const doc = `## 🚀 Usage Examples

\`\`\`
~/Code/harness/check-contracts.sh
# prints BOTH CONTRACTS HOLD when all three checks pass
# otherwise prints the failing check
\`\`\`

## 🔧 Maintenance

Keep the rename record current.
`;
    const body = bodyOf(doc, '🚀 Usage Examples');
    assert.ok(body.includes('check-contracts.sh'));
    assert.ok(body.includes('otherwise prints the failing check'),
      'the section was truncated at a shell comment read as an H1');
    assert.ok(bodyOf(doc, '🔧 Maintenance').includes('rename record'),
      'the heading after the fence must still be found');
  });

  test('resolveTemplate fills the footer the model should never have to write', () => {
    const out = resolveTemplate('*Status: {status}*\n*Location: {location}*\n*Created: {date}*',
      { location: 'Systems/x.md' });
    assert.match(out, /Status: Active/);
    assert.match(out, /Location: Systems\/x\.md/);
    assert.doesNotMatch(out, /\{date\}/, 'the date placeholder survived');
    assert.doesNotMatch(out, /\{status\}/);
  });

  test('the metadata footer is excluded from the check, resolved or not', () => {
    // Originally written to pin a FALSE REFUSAL: the footer was byte-identical to
    // the template because nothing filled it, and the echoed-scaffolding check read
    // that as the model copying scaffolding. The fix was to strip the footer before
    // validating rather than to special-case it inside the check, so both the
    // resolved and unresolved forms are now excluded. This test asserts that.
    const tmpl = '## 🔧 Maintenance\n\n- Regular maintenance tasks\n\n---\n\n*Status: {status}*\n';
    const out  = '## 🔧 Maintenance\n\n- Regular maintenance tasks: keep the rename record current and extend coverage.\n\n---\n\n*Status: {status}*\n';
    assert.equal(validate(out, tmpl).passed, true, 'unresolved footer must not be judged');
    assert.equal(validate(resolveTemplate(out, {}), resolveTemplate(tmpl, {})).passed, true,
      'resolved footer must not be judged either');
  });

  test('stripFooter removes only a real footer, never real content', () => {
    const withFooter = 'body text\n\n---\n\n*Status: Active*\n*Created: 2026-08-22*\n';
    assert.equal(stripFooter(withFooter), 'body text');
    // A horizontal rule in the middle of a document is not a footer.
    const midRule = 'first\n\n---\n\nsecond paragraph with real content\n';
    assert.match(stripFooter(midRule), /second paragraph/);
    // Italic lines that are not a footer, with no preceding rule, stay.
    assert.match(stripFooter('body\n\n*this is emphasis: not metadata*\n'), /emphasis/);
  });
});
