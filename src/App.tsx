/// <reference types="vite/client" />
import React, { useSyncExternalStore } from 'react';
import { load } from './dc';
import mainSrc from '../barb-canvas/project/Main.dc.html?raw';
import proSrc from '../barb-canvas/project/Pro.dc.html?raw';
import shellSrc from '../barb-canvas/project/Prototype.dc.html?raw';
import dataUrl from '../barb-canvas/assets/barb-data.json?url';
import mapUrl from '../barb-canvas/assets/kyiv-map.svg?url';

// Canvas-local asset URLs (barb-canvas/README.md → "Asset references") → bundled files.
const assets = (src: string) =>
  src.replace('/_blob/fa3b6b67b01bcc9461fe3fa8fc588b78', dataUrl).replace('/_blob/6fbcaa5014c9b085611d3cbc41428787', mapUrl);

load('Main', assets(mainSrc));
load('Pro', assets(proSrc));

// Desktop: the canvas "Прототип" page as-is — phone with the app + panel with every screen.
const Desktop = load('Prototype', shellSrc);

// Mobile: same shell logic (client ↔ Barb Pro wiring), apps fill the screen, no frame or panel.
const Mobile = load('PrototypeMobile', shellSrc, `
<div class="fill" style="display: {{clientDisplay}}">
<dc-import name="Main" jump="{{jump}}" visible="{{isClient}}" decisions="{{decisions}}" on-screen="{{onScreen}}" on-role="{{onRole}}" on-booked="{{onBooked}}"></dc-import>
</div>
<div class="fill" style="display: {{proDisplay}}">
<dc-import name="Pro" jump="{{jumpPro}}" visible="{{isPro}}" incoming="{{incoming}}" on-screen="{{onScreenPro}}" on-role="{{onRole}}" on-decision="{{onDecision}}"></dc-import>
</div>`);

// 0 = mobile; otherwise zoom that fits the 932px-tall prototype page into the window.
const onResize = (cb: () => void) => (addEventListener('resize', cb), () => removeEventListener('resize', cb));
const zoom = () => (innerWidth < 820 ? 0 : Math.min(1, innerHeight / 932));

export const App: React.FC = () => {
  const z = useSyncExternalStore(onResize, zoom);
  return z ? (
    <div style={{ zoom: z }}>
      <Desktop />
    </div>
  ) : (
    <Mobile />
  );
};
