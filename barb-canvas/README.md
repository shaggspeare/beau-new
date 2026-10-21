# Barb — app concept (Claude Design canvas export)

Clickable concept of a client app for barb.ua plus **Barb Pro**, a cabinet for masters and salons. It was built on a Claude Design canvas. This folder is a byte-for-byte copy of that canvas's source files, plus the two assets it loads and a few helper scripts.

UI copy is Ukrainian. The data is real: 22 Kyiv profiles (15 salons, 7 masters) from the barb-crawler crawl, plus deals and headline numbers taken from barb.ua in Oct 2026.

## Layout

```
project/                     canvas source (what the Design canvas renders)
  canvas.json                canvas index: 2 pages ("Екрани", "Прототип"), artboard frames, notes
  Main.dc.html               client app: all 16 screens in one stateful component (~160 KB)
  Pro.dc.html                Barb Pro: 5 screens (schedule/requests, prices, inbox, chat, profile)
  Prototype.dc.html          page 2: phone frame + control panel; mounts Main and Pro and links them
  Home|Map|Category|Profile|Booking|Booked|Visits|Deals|Chat|Assistant|Account.dc.html
                             storyboard wrappers: <dc-import name="Main" start="…">
  ProPrices|ProChats|ProProfile.dc.html
                             storyboard wrappers for Pro
assets/
  barb-data.json             all data both apps fetch at runtime
  kyiv-map.svg               stylized Kyiv map (Dnipro, islands, parks, roads, metro lines)
tools/
  lint.mjs                   per-file check: runs the logic on real data, walks every screen's template
  proto.mjs                  integration check of page 2 (client books -> Pro accepts -> status returns)
  build_data.py              regenerates assets/barb-data.json from barb-crawler/src/data/crawledMasters.ts
  mapgen.py                  regenerates assets/kyiv-map.svg
  package.json               tool deps (node-html-parser)
```

## The .dc.html format (enough to read or port it)

- **Template.** The markup inside `<x-dc>…</x-dc>`, with inline styles only.
  - `{{a.b.c}}` is a dotted lookup into whatever `renderVals()` returns. The runtime also accepts `!x`, `a === b` / `!==`, parentheses and literals. These files keep holes to plain lookups and compute everything else in `renderVals()`.
  - `<sc-if value="{{flag}}">` renders its children only when the flag is truthy. It is lazy, so a hidden branch is never evaluated.
  - `<sc-for list="{{items}}" as="it">` repeats its children with `it` and `$index` in scope. A non-array list renders nothing.
  - `<dc-import name="Main" start="map">` mounts the sibling file `Main.dc.html`. Its other attributes become props; kebab-case names become camelCase (`on-booked` → `onBooked`).
  - `onClick="{{fn}}"` and `onChange="{{fn}}"` bind functions from `renderVals()`.
  - `<a href="Pro.dc.html">` jumps to another artboard in Play mode.
- **Logic.** The `<script type="text/x-dc" data-dc-script>` block holds plain JS: `class Component extends DCLogic`.
  - It works like a React class: `this.props`, `this.state`, `setState`, `componentDidMount` / `DidUpdate` / `WillUnmount`.
  - `renderVals()` returns the template scope.
  - The `data-props` attribute declares Tweaks (editor controls) and the preview size. Main exposes three: `start` (screen), `accent` and `font`.
- **Runtime.** `./support.js` is the Claude Design runtime (it is React underneath). It is **not included**, so these files don't open standalone in a browser. To run them outside the canvas, port them to React (see "Porting" below). Alternatively, re-import them into a Design canvas: upload the two assets and update the blob URLs.

## Asset references

The files reference uploaded assets by canvas-local URLs:

| URL in files | File here | Used by |
|---|---|---|
| `/_blob/fa3b6b67b01bcc9461fe3fa8fc588b78` | `assets/barb-data.json` | `DATA_URL` in Main.dc.html and Pro.dc.html (`fetch`) |
| `/_blob/6fbcaa5014c9b085611d3cbc41428787` | `assets/kyiv-map.svg` | `MAP_URL` in Main.dc.html (welcome hero, map screen, profile mini-map) |

To run the files locally, replace those two constants with relative paths.

## Screens and state

**Main.dc.html (client).** The active screen is chosen by `state.screen`. Initial state comes from `base()`; `seed()` fills demo state per `props.start`.

| screen | what it is |
|---|---|
| `welcome` | brand intro, map hero, real headline numbers |
| `home` | greeting, search, upcoming visit, 3-step matcher entry, 8 categories, deals carousel, top-rated places |
| `search` | live search over places and 1,778 services; popular queries with barb.ua counts |
| `list` | category results; filters Усі/Майстри/Салони; sort by rating/near/price/reviews |
| `map` | pannable SVG map, rating pins, category chips, 3 zoom levels (1× / 1.6× / 2.4×), selected-place card |
| `place` | profile: rating /10, address + mini-map, deal banner; tabs for services (searchable, multi-select), reviews, about |
| `book` | selected services + total/duration, 14-day strip, time slots (morning/day/evening), confirm |
| `done` | confirmation card |
| `visits` | upcoming bookings: chat, reschedule, cancel (with confirm) |
| `deals` / `deal` | 13 real barb.ua deals, category filter, detail with savings and "book with this deal" |
| `chat` / `chats` | chat with a master (scripted replies), thread list |
| `asst` | "Підбір за 3 кроки": category → area → budget → top 3 |
| `me` / `saved` | client cabinet (counters, reminder toggle), favourites |

Tabs: home, map, deals, visits, me.

Key state: `hist` (back stack), `pid` (open place), `sel` (selected services), `day`/`time`, `bookings[]`, `favs[]`, `chats{}`, `mapSel`/`mapCat`/`zoom`, `asst`.

**Pro.dc.html (master: Валентина Шевчук, real price list).** Screens: `today` (7-day strip, requests to accept or decline, visits timeline, open/close slots), `prices` (inline price editing), `inbox`, `thread`, `profile` (real stats, completeness checklist, her live barb.ua deal).

**Linking contract** (used by `Prototype.dc.html`; both apps also work standalone):

- Main props: `jump`, `visible`, `decisions`, `onScreen(screen)`, `onRole(role, target?)`, `onBooked(booking)`
- Pro props: `jump`, `visible`, `incoming`, `onScreen(screen)`, `onRole(role, target?)`, `onDecision(id, 'confirmed' | 'declined')`
- `jump` is `"<screen>[|<arg>]:<n>"`. A new `n` triggers navigation; `"place|vshevchyk:7"` opens a profile and `"reset:<n>"` resets.
- Flow: a client booking with `vshevchyk` → `onBooked` → shell `incoming` → Pro request ("Нова · із застосунку Barb") → accept or decline → `onDecision` → shell `decisions` → Main updates the booking status when it becomes visible.

## Data: assets/barb-data.json

```
places[]  id, name, type ('master'|'salon'), title, rating (0–10, barb.ua scale), reviews,
          addr, district, metro, ini, tint, x/y (% on kyiv-map.svg), km (from Khreshchatyk),
          min (lowest price ≥150 грн), cmin {category: lowest price ≥100}, cats[], ig, url (barb.ua),
          nsvc, groups: [[groupName, categoryKey, [[name, priceText, priceValue, durationText, durationMin], …]], …]
          optional: work, exp, hours [[day, time]], about, photos, revs [[name, date, text]]
deals[]   id, t, who, role, dist, old, now, off, till ('dd.mm'), cat, url, pid?, svc?, gift?, frm?
cats[]    k, n (short label), full (barb.ua name), sub [[subcategory, procedures on barb.ua]]
popular   [[query, label, count]]     labels [[district, x%, y%]]     you [x%, y%]
stats     { pros: '18 876', procs: '910 329', kyivDeals: 129 }
```

`cats[]` has 8 keys: `hair`, `nails`, `brows`, `face`, `removal`, `body`, `makeup`, `pmu`. A few service groups are also tagged `tattoo` or `fitness`; those keys have no top-level category.

**Real:** profiles, prices, durations, ratings, review counts, addresses and metro (crawler, Aug 2026). Also the deals, category counts and headline stats (barb.ua, Oct 2026), and the reviews and hours of `vshevchyk` and `yuliayudina`.

**Demo only:** free time slots (a deterministic hash per place and day, so both apps agree), the clients in Barb Pro, chat replies, and the "Катерина" user. When a master opens or closes a slot in Pro, the change stays in Pro and is not passed to the client app.

## Design tokens

| token | value | use |
|---|---|---|
| accent | `#e0144c` | buttons, active states. An accessible variant of the Barb pink `#f5265f`: white text passes 4.5:1 |
| accent-soft | 12% accent on white (`#fbe3ea`) | chips, banners |
| accent-deep | accent darkened 20% (`#b3103d`) | pink text on soft backgrounds |
| ink | `#24405c` | text, dark buttons, map pins |
| muted | `#5a6e84` | secondary text (5.2:1 on white) |
| page / card | `#f4f7fa` / `#ffffff` | backgrounds |
| lines | `#e3ebf3`, `#d5e0ea` | borders |
| status | confirmed `#1f7a52` on `#e3f3ea` · pending `#7a5200` on `#fff4dc` · declined `#b42318` on `#fdeceb` | status chips |

- **Type:** Onest 400–800. The font Tweak also offers Manrope, Montserrat and Nunito Sans. The accent Tweak also offers the brand pink `#f5265f`, `#c8175d` and ink `#24405c`.
- **Radii:** buttons and chips are pills (radius = half the height); inputs and icon tiles use about a third of the height (14–18 px); cards are mostly 20–22 px.
- **Sizes:** phone frame 390×844.
- **Icons:** inline 24 px stroke SVG paths (the `IC` object in each script).

## Tools

```bash
cd tools && npm install && cd ..
node tools/lint.mjs project/Main.dc.html assets/barb-data.json main
node tools/lint.mjs project/Pro.dc.html assets/barb-data.json pro today,prices,inbox,thread,profile
node tools/proto.mjs .
python3 tools/build_data.py ../src/data/crawledMasters.ts assets/barb-data.json   # assumes this folder sits inside barb-crawler/
python3 tools/mapgen.py assets/kyiv-map.svg
```

- `lint.mjs` and `proto.mjs` emulate the canvas template rules: lazy `sc-if`, scoped `sc-for`, dotted lookups. They flag any unresolved `{{hole}}`, non-array list or failing handler while clicking through every screen.
- `build_data.py` reproduces the shipped JSON byte-for-byte from the Aug 2026 crawl.
- `mapgen.py` produces the source SVG. The copy in `assets/` is the canvas's normalized version: same shapes, with explicit closing tags.

## Porting to React (e.g. the Vite app in barb-crawler)

- Each `<sc-if value="{{s.<screen>}}">` block in Main.dc.html becomes a screen component. Each `xxxData(st)` method (`homeData`, `placeData`, `bookData`, …) is that screen's view-model selector.
- `go` / `back` / `tab`, `toggleSel`, `confirmBooking`, `sendMsg` and `zoomBy` map onto a `useReducer`.
- The `/_blob/...` fetch becomes an import of `assets/barb-data.json`.
- Styles are inline objects already, so they port almost 1:1. CSS variables for the tokens above would be the first refactor.
