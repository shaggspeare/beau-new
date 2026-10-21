// Lint for .dc.html artboards (no canvas runtime needed):
// usage: node tools/lint.mjs project/Main.dc.html assets/barb-data.json main
//        node tools/lint.mjs project/Pro.dc.html assets/barb-data.json pro today,prices,inbox,thread,profile
// runs the logic class against real data,
// walks the template the way dc-runtime does (lazy sc-if, scoped sc-for) and reports
// unresolved holes, non-array lists and handler errors across scripted interactions.
import fs from 'fs';
import { parse } from 'node-html-parser';

const file = process.argv[2];
const dataFile = process.argv[3];
const scenario = process.argv[4] || 'main';
const src = fs.readFileSync(file, 'utf8');
const tplStart = src.indexOf('<x-dc>') + 6, tplEnd = src.lastIndexOf('</x-dc>');
const template = src.slice(tplStart, tplEnd);
const sm = src.match(/<script type="text\/x-dc" data-dc-script data-props='([^']*)'>([\s\S]*?)<\/script>/);
if (!sm) { console.log('NO SCRIPT'); process.exit(1); }
JSON.parse(sm[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
const js = sm[2];

class DCLogic {
  constructor(p) { this.props = p || {}; this.state = {}; this.__host = null; }
  setState(u) { const patch = typeof u === 'function' ? u(this.state) : u; this.state = { ...this.state, ...patch }; this.__dirty = true; }
  forceUpdate() {}
  componentDidMount() {} componentDidUpdate() {} componentWillUnmount() {} renderVals() { return {}; }
}
const data = fs.readFileSync(dataFile, 'utf8');
globalThis.fetch = async () => ({ ok: true, json: async () => JSON.parse(data) });
const timers = [];
globalThis.setTimeout = (fn, ms) => { timers.push(fn); return timers.length; };
globalThis.clearTimeout = () => {};
const Component = new Function('DCLogic', 'StreamableLogic', 'React', js + '\n;return (typeof Component!=="undefined"&&Component)||undefined;')(DCLogic, DCLogic, {});
if (typeof Component !== 'function') { console.log('Component not defined'); process.exit(1); }

const root = parse(template, { comment: false, blockTextElements: { script: true, style: true } });
function lookup(scope, expr) {
  const e = expr.trim();
  if (e === 'true') return true; if (e === 'false') return false; if (e === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
  if (e.startsWith('!')) return !lookup(scope, e.slice(1));
  let cur = scope;
  for (const part of e.split('.')) { if (cur == null) return undefined; cur = cur[part]; }
  return cur;
}
const problems = new Set();
function holes(str) { const out = []; str.replace(/\{\{([\s\S]+?)\}\}/g, (m, g) => { out.push(g); return m; }); return out; }
let VISITS = 0; const SCREENS_SEEN = new Set();
function walk(node, scope, where) {
  VISITS++; SCREENS_SEEN.add(where.split("#")[0]);
  for (const ch of node.childNodes) {
    if (ch.nodeType === 3) { for (const h of holes(ch.rawText)) if (lookup(scope, h) === undefined) problems.add(where + ' text {{' + h.trim() + '}}'); continue; }
    if (ch.nodeType !== 1) continue;
    const tag = ch.rawTagName.toLowerCase();
    const attrs = ch.attributes;
    if (tag === 'sc-if') { const v = lookup(scope, holes(attrs.value)[0]); if (v === undefined) problems.add(where + ' sc-if ' + attrs.value); if (v) walk(ch, scope, where); continue; }
    if (tag === 'sc-for') { const l = lookup(scope, holes(attrs.list)[0]); if (!Array.isArray(l)) { problems.add(where + ' sc-for not array ' + attrs.list); continue; } l.forEach((it, i) => walk(ch, { ...scope, [attrs.as]: it, $index: i }, where)); continue; }
    for (const [k, v] of Object.entries(attrs)) for (const h of holes(v)) {
      const val = lookup(scope, h);
      if (val === undefined) problems.add(where + ' attr ' + k + '={{' + h.trim() + '}}');
      if (/^on[A-Z]/.test(k) && typeof val !== 'function') problems.add(where + ' handler not fn ' + k + '={{' + h.trim() + '}}');
    }
    walk(ch, scope, where);
  }
}
async function run(props, label, steps) {
  const c = new Component(props);
  c.componentDidMount();
  await new Promise(r => setImmediate(r)); await new Promise(r => setImmediate(r));
  const render = (tag) => { const out = { ...props, ...c.renderVals() }; walk(root, out, label + '/' + (c.state.screen || props.start) + (tag ? '#' + tag : '')); return out; };
  let out = render();
  for (const step of steps || []) {
    try { step(c, out); } catch (e) { problems.add(label + ' step error: ' + e.message); }
    out = render(step.name);
    while (timers.length) { const fn = timers.shift(); try { fn(); } catch (e) { problems.add(label + ' timer error: ' + e.stack.split('\n')[0]); } out = render('timer'); }
  }
  return { c, out };
}
const starts = scenario === 'main' ? ['welcome', 'home', 'map', 'list', 'search', 'place', 'book', 'done', 'visits', 'deals', 'chat', 'asst', 'me'] : (process.argv[5] || 'today').split(',');
for (const s of starts) await run({ start: s }, 'start:' + s, []);
if (scenario === 'main') {
  // click-through journeys
  const clicks = (pathFn) => function step(c, out) { const f = pathFn(out); if (typeof f !== 'function') throw new Error('no handler'); f(); };
  await run({ start: 'welcome' }, 'journey', [
    clicks(o => o.W.start), clicks(o => o.H.cats[0].open), clicks(o => o.L.cycleSort), clicks(o => o.L.chips[1].pick), clicks(o => o.L.items[0].open),
    clicks(o => o.P.groups[0].toggle), clicks(o => o.P.groups[1].toggle), clicks(o => o.P.groups[1].items[0].toggle), clicks(o => o.P.tabs[1].pick), clicks(o => o.P.tabs[2].pick), clicks(o => o.P.tabs[0].pick),
    function typeSvc(c, o) { o.P.onSvcQ({ target: { value: 'стриж' } }); }, clicks(o => o.P.book),
    clicks(o => o.B.days[3].pick), function pickSlot(c, o) { const sl = o.B.parts.flatMap(p => p.slots).find(x => !x.busy); sl.pick(); }, clicks(o => o.B.confirm),
    clicks(o => o.DN.chat), function typeMsg(c, o) { o.C.onDraft({ target: { value: 'Скільки коштує?' } }); }, clicks(o => o.C.send), clicks(o => o.back),
    clicks(o => o.DN.toVisits), clicks(o => o.V.items[0].cancel), clicks(o => o.V.items[0].cancelNo), clicks(o => o.V.items[0].move), clicks(o => o.back),
    clicks(o => o.tabs[2].go), clicks(o => o.DL.chips[2].pick), clicks(o => o.DL.items[0].open), clicks(o => o.DD.book), clicks(o => o.back), clicks(o => o.back),
    clicks(o => o.DL.chips[0].pick), function openD10(c, o) { o.DL.items.find(d => d.id === 'd10').open(); }, clicks(o => o.DD.openPlace), clicks(o => o.back), clicks(o => o.DD.book),
    clicks(o => o.tabs[1].go), clicks(o => o.M.chips[2].pick), clicks(o => o.M.pins[0].pick), clicks(o => o.M.zoomIn), clicks(o => o.M.sel.book), clicks(o => o.back), clicks(o => o.M.closeSel), clicks(o => o.M.toList), clicks(o => o.back), clicks(o => o.M.locate),
    clicks(o => o.tabs[0].go), clicks(o => o.H.openAsst), clicks(o => o.A.chips[1].pick), clicks(o => o.A.chips[2].pick), clicks(o => o.A.chips[0].pick), clicks(o => o.A.results[0].open), clicks(o => o.back), clicks(o => o.A.toMap),
    clicks(o => o.tabs[0].go), clicks(o => o.H.openSearch), function q1(c, o) { o.S.onQ({ target: { value: 'манікюр' } }); }, clicks(o => o.S.svcs[0].open), clicks(o => o.back), function q2(c, o) { o.S.onQ({ target: { value: 'zzzz' } }); },
    clicks(o => o.S.clear), clicks(o => o.S.popular[0].pick), clicks(o => o.S.places.length ? o.S.places[0].open : o.back),
    clicks(o => o.tabs ? (o.tabs[4] && o.tabs[4].go) || o.back : o.back), clicks(o => o.ME.rows[3].open), clicks(o => o.ME.rows[1].open), clicks(o => o.SV.items[0].toggleFav), clicks(o => o.back), clicks(o => o.ME.rows[2].open), clicks(o => o.CL.items.length ? o.CL.items[0].open : o.back)
  ]);
}
if (scenario === 'pro') {
  const clicks = (pathFn) => function step(c, out) { const f = pathFn(out); if (typeof f !== 'function') throw new Error('no handler'); f(); };
  await run({ start: 'today' }, 'projourney', [
    clicks(o => o.T.days[1].pick), clicks(o => o.T.slots.find(x => !x.locked).toggle), clicks(o => o.T.slots.find(x => !x.locked).toggle), clicks(o => o.T.openAll),
    clicks(o => o.T.reqs[0].accept), clicks(o => o.T.reqs[0].chat), function typeMsg(c, o) { o.TH.onDraft({ target: { value: 'Так' } }); }, clicks(o => o.TH.send), clicks(o => o.back),
    clicks(o => o.T.reqs[0].decline), clicks(o => o.tabs[1].go), clicks(o => o.PR.groups[0].toggle), clicks(o => o.PR.groups[0].items[0].edit),
    function typePrice(c, o) { o.PR.groups[0].items[0].onDraft({ target: { value: '350' } }); }, clicks(o => o.PR.groups[0].items[0].save),
    function q(c, o) { o.PR.onQ({ target: { value: 'стриж' } }); }, clicks(o => o.tabs[2].go), clicks(o => o.IN.items[1].open), clicks(o => o.TH.quick[0].send), clicks(o => o.back),
    clicks(o => o.tabs[3].go), clicks(o => o.PF.checks[3].fix), clicks(o => o.PF.checks[4].fix), clicks(o => o.PF.newDeal)
  ]);
}
console.log(problems.size ? [...problems].slice(0, 80).join('\n') : 'OK — no unresolved holes');
console.log('problems:', problems.size, 'visits:', VISITS, 'screens:', [...SCREENS_SEEN].join(' '));
