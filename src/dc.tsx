// Minimal stand-in for the Claude Design canvas runtime (support.js, not exported), so the
// barb-canvas/project/*.dc.html files render as-is. Covers what those files use:
// {{dotted.lookup}} / {{!x}} / literals, <sc-if>, <sc-for>, <dc-import>, on*/ref/value bindings.
// ponytail: no `===`/parens in holes (the files keep holes to plain lookups); add to `val` if a template needs them.
import React from 'react';

type El = { tag: string; attrs: Record<string, string>; kids: Node[] };
type Node = string | El;

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ta = document.createElement('textarea');
const decode = (s: string) => (s.includes('&') ? ((ta.innerHTML = s), ta.value) : s);
const camel = (s: string) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());

// Own tokenizer instead of the HTML5 parser: keeps attribute case (onClick, viewBox) and never re-nests custom tags.
function parse(html: string): Node[] {
  const root: El = { tag: '', attrs: {}, kids: [] };
  const stack = [root];
  for (const [m, close, open, attrStr, text] of html.matchAll(/<!--[\s\S]*?-->|<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*\/?>|([^<]+)/g)) {
    const top = stack[stack.length - 1];
    if (close) while (stack.length > 1 && stack.pop()!.tag !== close);
    else if (open) {
      const el: El = { tag: open, attrs: {}, kids: [] };
      for (const [, k, v] of attrStr.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) el.attrs[k] = decode(v ?? '');
      top.kids.push(el);
      if (!VOID.has(open) && !m.endsWith('/>')) stack.push(el);
    } else if (text && !(text.includes('\n') && !text.trim())) top.kids.push(decode(text));
  }
  return root.kids;
}

function val(expr: string, scope: any): any {
  const e = expr.trim();
  if (e[0] === '!') return !val(e.slice(1), scope);
  if (e === 'true' || e === 'false' || e === 'null') return JSON.parse(e);
  if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
  return e.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
}

// A lone hole keeps its type (functions, booleans, arrays); mixed text becomes a string.
function interp(s: string, scope: any): any {
  const whole = s.match(/^\{\{([^}]+)\}\}$/);
  if (whole) return val(whole[1], scope);
  return s.includes('{{') ? s.replace(/\{\{([^}]+)\}\}/g, (_, e) => String(val(e, scope) ?? '')) : s;
}

function css(s: string) {
  const o: Record<string, string> = {};
  for (const decl of s.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    o[k.startsWith('--') ? k : camel(k)] = decl.slice(i + 1).trim();
  }
  return o;
}

export const registry: Record<string, React.ComponentType<any>> = {};

function renderNodes(nodes: Node[], scope: any): React.ReactNode[] {
  return nodes.map((n, key) => {
    if (typeof n === 'string') {
      const v = interp(n, scope);
      return typeof v === 'object' || typeof v === 'function' ? null : v;
    }
    const { tag, attrs, kids } = n;
    if (tag === 'helmet') return null; // fonts + body reset live in index.html
    if (tag === 'sc-if') return interp(attrs.value, scope) ? <React.Fragment key={key}>{renderNodes(kids, scope)}</React.Fragment> : null;
    if (tag === 'sc-for') {
      const list = interp(attrs.list, scope);
      return Array.isArray(list)
        ? list.map((it, i) => <React.Fragment key={i}>{renderNodes(kids, { ...scope, [attrs.as]: it, $index: i })}</React.Fragment>)
        : null;
    }
    const props: Record<string, any> = { key };
    for (const [k, raw] of Object.entries(attrs)) {
      if (k.startsWith('hint-') || (tag === 'dc-import' && k === 'name')) continue;
      const v = interp(raw, scope);
      if (tag === 'dc-import') props[camel(k)] = v;
      else if (k === 'style') props.style = css(String(v ?? ''));
      else if (k === 'class') props.className = v;
      else if (k === 'for') props.htmlFor = v;
      else props[k] = v;
    }
    if (tag === 'dc-import') return React.createElement(registry[attrs.name], props);
    return React.createElement(tag, props, VOID.has(tag) ? undefined : renderNodes(kids, scope));
  });
}

/** Turns a .dc.html source into a React class component and registers it for <dc-import name="…">. */
export function load(name: string, src: string, template = src.slice(src.indexOf('<x-dc>') + 6, src.lastIndexOf('</x-dc>'))) {
  const nodes = parse(template);
  const js = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)![1];
  class DCLogic extends React.Component<any, any> {
    state = {};
    renderVals() {
      return {};
    }
    render() {
      return renderNodes(nodes, { ...this.props, ...this.renderVals() });
    }
  }
  const C = new Function('DCLogic', 'StreamableLogic', 'React', `${js}\n;return Component;`)(DCLogic, DCLogic, React);
  C.displayName = name;
  return (registry[name] = C);
}
