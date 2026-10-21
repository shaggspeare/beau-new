// Integration lint: Prototype shell + Main + Pro wired the way dc-import passes props.
// usage (from the export root): node tools/proto.mjs .
// Plays the demo: book with Валентина Шевчук -> request in Barb Pro -> accept -> status back in the client app.
import fs from 'fs';
import { parse } from 'node-html-parser';

const R = process.argv[2];
const data = fs.readFileSync(R + '/assets/barb-data.json', 'utf8');
globalThis.fetch = async () => ({ ok: true, json: async () => JSON.parse(data) });
const timers = [];
globalThis.setTimeout = (fn) => { timers.push(fn); return timers.length; };
globalThis.clearTimeout = () => {};

let dirty = false;
class DCLogic {
  constructor(p) { this.props = p || {}; this.state = {}; }
  setState(u) { const patch = typeof u === 'function' ? u(this.state) : u; this.state = { ...this.state, ...patch }; dirty = true; }
  forceUpdate() {} componentDidMount() {} componentDidUpdate() {} componentWillUnmount() {} renderVals() { return {}; }
}
function load(name) {
  const src = fs.readFileSync(R + '/project/' + name + '.dc.html', 'utf8');
  const tpl = src.slice(src.indexOf('<x-dc>') + 6, src.lastIndexOf('</x-dc>'));
  const sm = src.match(/<script type="text\/x-dc" data-dc-script data-props='([^']*)'>([\s\S]*?)<\/script>/);
  JSON.parse(sm[1]);
  const C = new Function('DCLogic', 'StreamableLogic', 'React', sm[2] + '\n;return Component;')(DCLogic, DCLogic, {});
  return { C, root: parse(tpl, { comment: false }) };
}
const M = load('Main'), P = load('Pro'), S = load('Prototype');

const problems = new Set();
function lookup(scope, expr) { const e = expr.trim(); if (e === 'true') return true; if (e === 'false') return false; if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e); let c = scope; for (const p of e.split('.')) { if (c == null) return undefined; c = c[p]; } return c; }
function holes(s) { const o = []; String(s).replace(/\{\{([\s\S]+?)\}\}/g, (m, g) => { o.push(g); return m; }); return o; }
function walk(node, scope, where) {
  for (const ch of node.childNodes) {
    if (ch.nodeType === 3) { for (const h of holes(ch.rawText)) if (lookup(scope, h) === undefined) problems.add(where + ' text {{' + h.trim() + '}}'); continue; }
    if (ch.nodeType !== 1) continue;
    const tag = ch.rawTagName.toLowerCase(); const at = ch.attributes;
    if (tag === 'sc-if') { const v = lookup(scope, holes(at.value)[0]); if (v === undefined) problems.add(where + ' sc-if ' + at.value); if (v) walk(ch, scope, where); continue; }
    if (tag === 'sc-for') { const l = lookup(scope, holes(at.list)[0]); if (!Array.isArray(l)) { problems.add(where + ' sc-for ' + at.list); continue; } l.forEach((it, i) => walk(ch, { ...scope, [at.as]: it, $index: i }, where)); continue; }
    for (const [k, v] of Object.entries(at)) for (const h of holes(v)) { const val = lookup(scope, h); if (val === undefined) problems.add(where + ' attr ' + k + '={{' + h.trim() + '}}'); }
    walk(ch, scope, where);
  }
}

const shell = new S.C({});
let shellOut = shell.renderVals();
function childProps(kind) {
  const o = shellOut;
  return kind === 'main'
    ? { jump: o.jump, visible: o.isClient, decisions: o.decisions, onScreen: o.onScreen, onRole: o.onRole, onBooked: o.onBooked }
    : { jump: o.jumpPro, visible: o.isPro, incoming: o.incoming, onScreen: o.onScreenPro, onRole: o.onRole, onDecision: o.onDecision };
}
const main = new M.C(childProps('main'));
const pro = new P.C(childProps('pro'));
main.componentDidMount(); pro.componentDidMount();
await new Promise(r => setImmediate(r)); await new Promise(r => setImmediate(r));

let outs = {};
function cycle(tag) {
  for (let i = 0; i < 12; i++) {
    dirty = false;
    shellOut = shell.renderVals();
    main.props = childProps('main'); pro.props = childProps('pro');
    main.componentDidUpdate(); pro.componentDidUpdate();
    if (!dirty) break;
    if (i === 11) problems.add('render loop does not settle at ' + tag);
  }
  shellOut = shell.renderVals();
  outs = { shell: shellOut, main: { ...main.props, ...main.renderVals() }, pro: { ...pro.props, ...pro.renderVals() } };
  walk(S.root, outs.shell, 'shell#' + tag);
  walk(M.root, outs.main, 'main/' + main.st().screen + '#' + tag);
  walk(P.root, outs.pro, 'pro/' + pro.st().screen + '#' + tag);
}
function flushTimers(tag) { let n = 0; while (timers.length && n < 50) { n++; const f = timers.shift(); try { f(); } catch (e) { problems.add(tag + ' timer: ' + e.message); } cycle(tag + '+t'); } }
const log = [];
async function step(tag, fn) { try { fn(outs); } catch (e) { problems.add(tag + ': ' + e.message); } cycle(tag); flushTimers(tag); log.push(tag.padEnd(26) + ' role=' + shell.st().role + ' main=' + main.st().screen + ' pro=' + pro.st().screen + ' hint=' + outs.shell.hint.slice(0, 40)); }

cycle('init');
await step('hint: start scenario', o => o.shell.hintGo());
await step('select service', o => o.main.P.groups[0].items[0].toggle());
await step('book', o => o.main.P.book());
await step('pick day', o => o.main.B.days[2].pick());
await step('pick slot', o => o.main.B.parts.flatMap(p => p.slots).find(s => !s.busy).pick());
await step('confirm', o => o.main.B.confirm());
const booked = main.st().bookings.slice(-1)[0];
await step('hint: open Pro', o => o.shell.hintGo());
const req = pro.st().reqs[0];
await step('accept request', o => o.pro.T.reqs[0].accept());
await step('hint: back to client', o => o.shell.hintGo());
const after = main.st().bookings.find(b => b.id === booked.id);
await step('panel: Pro prices', o => { o.shell.roles[1].pick(); });
await step('panel: screen 2', o => o.shell.screens[1].go());
await step('pro: profile → client', o => { o.shell.screens[4].go(); });
await step('pro profile toClient', o => o.pro.toClient());
await step('client: me → Pro', o => { o.shell.screens[12].go(); });
await step('me toPro', o => o.main.toPro());
await step('panel: client done', o => { o.shell.roles[0].pick(); });
await step('panel: done screen', o => o.shell.screens[7].go());
await step('reset', o => o.shell.reset());

console.log(log.join('\n'));
console.log('booked pid:', booked && booked.pid, '| incoming req ext:', req && req.ext, req && req.name, '| status after accept:', after && after.status, '| final main:', main.st().screen, 'bookings', main.st().bookings.length, '| pro reqs', pro.st().reqs.length);
console.log(problems.size ? [...problems].slice(0, 60).join('\n') : 'OK — no unresolved holes');
console.log('problems:', problems.size);
