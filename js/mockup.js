/**
 * 3D-мокап готового изделия (стопка визиток + конусная кружка латте).
 */
function buildFlatSidePreview(sideKey, dims, wPx, hPx) {
  const mat = getMaterial();
  const pxPerMm = wPx / dims.widthMm;
  const box = document.createElement('div');
  box.style.width = `${wPx}px`;
  box.style.height = `${hPx}px`;
  box.style.position = 'relative';
  box.style.overflow = 'hidden';
  box.className = mat.cssClass;

  const noBleedDims = { ...dims, bleedMm: 0 };
  AppState.sides[sideKey].forEach(obj => {
    if (!obj.visible) return;
    box.appendChild(createObjectElement(obj, noBleedDims, pxPerMm, false));
  });

  const lam = AppState.order.lamination;
  const hasLam = (sideKey === 'front' && lam.sides !== 'none') || (sideKey === 'back' && lam.sides === '2');
  if (hasLam) {
    const ov = document.createElement('div');
    ov.className = lam.type === 'gloss' ? 'absolute inset-0 mockup-gloss' : 'absolute inset-0 mockup-softtouch';
    box.appendChild(ov);
  }
  return box;
}

function render3dMockup(container) {
  const prod = getProduct();
  const dims = getTrimDims();
  container.innerHTML = '';

  // Отдельный конусный мокап для кружки латте
  if (prod.id === 'mug_latte') {
    const wrap = document.createElement('div');
    wrap.className = 'relative w-60 h-48 flex items-center justify-center';
    wrap.innerHTML = `
      <svg viewBox="0 0 240 185" class="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="latteConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#cbd5e1"/>
            <stop offset="28%" stop-color="#ffffff"/>
            <stop offset="72%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
        <path d="M 171 52 C 212 48, 214 118, 162 124" fill="none" stroke="#e2e8f0" stroke-width="13" stroke-linecap="round"/>
        <path d="M 171 52 C 210 50, 211 116, 162 124" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <path d="M 48 34 Q 112 44 176 34 L 154 156 Q 112 164 70 156 Z" fill="url(#latteConeGrad)" stroke="#cbd5e1" stroke-width="1"/>
        <ellipse cx="112" cy="34" rx="64" ry="9" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <ellipse cx="112" cy="35" rx="58" ry="6.5" fill="#78350f"/>
      </svg>
    `;
    const proj = document.createElement('div');
    proj.style.position = 'absolute';
    proj.style.left = '62px';
    proj.style.top = '52px';
    proj.style.width = '116px';
    proj.style.height = '88px';
    proj.style.clipPath = 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)';
    proj.style.mixBlendMode = 'multiply';
    proj.appendChild(buildFlatSidePreview('front', dims, 116, 88));
    wrap.appendChild(proj);
    container.appendChild(wrap);
    return;
  }

  // 3D-стопка карточек/листовок/наклеек с актуальными пропорциями
  const scale = Math.min(220 / dims.widthMm, 150 / dims.heightMm);
  const cw = Math.round(dims.widthMm * scale);
  const ch = Math.round(dims.heightMm * scale);

  const stage = document.createElement('div');
  stage.className = 'relative flex items-center justify-center';
  stage.style.width = `${cw + 30}px`;
  stage.style.height = `${ch + 24}px`;

  if (prod.allowTwoSides && AppState.order.printSides === 2) {
    const back = buildFlatSidePreview('back', dims, cw, ch);
    back.style.position = 'absolute';
    back.style.right = '0';
    back.style.bottom = '0';
    back.style.borderRadius = prod.id === 'sticker' ? '8px' : '2px';
    back.style.boxShadow = '0 10px 20px rgba(15,23,42,0.18)';
    back.style.transform = 'rotate(4deg)';
    back.style.border = '1px solid rgba(148,163,184,0.5)';
    stage.appendChild(back);
  }

  const front = buildFlatSidePreview('front', dims, cw, ch);
  front.style.position = 'absolute';
  front.style.left = '0';
  front.style.top = '0';
  front.style.borderRadius = prod.id === 'sticker' ? '8px' : '2px';
  front.style.boxShadow = '0 16px 32px rgba(15,23,42,0.24)';
  front.style.transform = prod.allowTwoSides && AppState.order.printSides === 2 ? 'rotate(-2deg)' : 'none';
  front.style.border = '1px solid rgba(148,163,184,0.5)';
  stage.appendChild(front);

  container.appendChild(stage);
}
