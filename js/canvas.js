/**
 * Линейки CorelDRAW в миллиметрах (0 = линия реза), рендер холста
 * и интерактивное перетаскивание, масштабирование и поворот объектов.
 */
function getPxPerMm() {
  const dims = getTrimDims();
  if (AppState.ui.editorMode === 'simple') {
    const holder = document.getElementById('simpleCanvasStage')?.parentElement;
    const maxW = Math.min(480, holder?.clientWidth || window.innerWidth - 48);
    const maxH = 290;
    return Math.max(0.6, Math.min(maxW / dims.widthMm, maxH / dims.heightMm));
  }
  const area = document.getElementById('canvasScrollArea');
  const availW = Math.max(260, (area?.clientWidth || 640) - 110);
  const availH = Math.max(200, (area?.clientHeight || 460) - 110);
  const fit = Math.min(availW / dims.fullWidthMm, availH / dims.fullHeightMm, 5.5);
  return Math.max(1.5, fit) * AppState.ui.zoom;
}

let workspaceViewCentered = false;

function centerWorkspaceView() {
  const area = document.getElementById('canvasScrollArea');
  if (!area) return;
  area.scrollLeft = (area.scrollWidth - area.clientWidth) / 2;
  area.scrollTop = (area.scrollHeight - area.clientHeight) / 2;
}

function updateWorkspacePadding(dims, pxPerMm, activeSide) {
  const stage = document.getElementById('workspaceStage');
  const area = document.getElementById('canvasScrollArea');
  let minX = dims.fullWidthMm, minY = dims.fullHeightMm, maxX = 0, maxY = 0;
  AppState.sides[activeSide].forEach(o => {
    if (!o.visible) return;
    const rad = ((o.rotation || 0) * Math.PI) / 180;
    const hw = (Math.abs(o.widthMm * Math.cos(rad)) + Math.abs(o.heightMm * Math.sin(rad))) / 2;
    const hh = (Math.abs(o.widthMm * Math.sin(rad)) + Math.abs(o.heightMm * Math.cos(rad))) / 2;
    const cx = o.xMm + o.widthMm / 2;
    const cy = o.yMm + o.heightMm / 2;
    minX = Math.min(minX, cx - hw);
    minY = Math.min(minY, cy - hh);
    maxX = Math.max(maxX, cx + hw);
    maxY = Math.max(maxY, cy + hh);
  });
  const need = Math.max(
    320,
    Math.max(0, -(minX + dims.bleedMm)) * pxPerMm + 40,
    Math.max(0, -(minY + dims.bleedMm)) * pxPerMm + 40,
    Math.max(0, maxX - dims.widthMm - dims.bleedMm) * pxPerMm + 40,
    Math.max(0, maxY - dims.heightMm - dims.bleedMm) * pxPerMm + 40
  );
  const prev = Number(stage.dataset.pad || 320);
  // Только расти: сжатие во время перетаскивания дёргало бы лист под курсором.
  const next = Math.ceil(Math.max(need, prev));
  if (next === prev) return;
  stage.dataset.pad = next;
  stage.style.padding = `${next}px`;
  if (workspaceViewCentered) {
    area.scrollLeft += next - prev;
    area.scrollTop += next - prev;
  }
}

function updateCorelRulers() {
  const dims = getTrimDims();
  const pxPerMm = getPxPerMm();
  const sheet = document.getElementById('documentSheetBleed');
  const hRuler = document.getElementById('horizontalRuler');
  const vRuler = document.getElementById('verticalRuler');
  const hTicks = document.getElementById('hRulerTicks');
  const vTicks = document.getElementById('vRulerTicks');

  if (!sheet || !hRuler || !vRuler) return;

  const sheetRect = sheet.getBoundingClientRect();
  const hRect = hRuler.getBoundingClientRect();
  const vRect = vRuler.getBoundingClientRect();

  // Точка 0 мм на линейках совпадает с линией реза (TrimBox = левый/верхний край листа + bleedMm)
  const trimOriginX = (sheetRect.left - hRect.left) + dims.bleedMm * pxPerMm;
  const trimOriginY = (sheetRect.top - vRect.top) + dims.bleedMm * pxPerMm;

  hTicks.innerHTML = '';
  vTicks.innerHTML = '';

  const majorStep = pxPerMm < 2.2 ? 20 : 10;
  const minorStep = majorStep / 2;

  const startMmX = Math.floor(-trimOriginX / pxPerMm / minorStep) * minorStep;
  const endMmX = Math.ceil((hRect.width - trimOriginX) / pxPerMm / minorStep) * minorStep;

  for (let mm = startMmX; mm <= endMmX; mm += minorStep) {
    const x = trimOriginX + mm * pxPerMm;
    const isMajor = Math.abs(mm % majorStep) < 0.01;
    const isZero = Math.abs(mm) < 0.01;
    const tick = document.createElement('div');
    tick.style.position = 'absolute';
    tick.style.left = `${x}px`;
    tick.style.bottom = '0';
    tick.style.height = isMajor ? '12px' : '6px';
    tick.style.borderLeft = `1px solid ${isZero ? '#dc2626' : '#64748b'}`;
    if (isMajor) {
      const lbl = document.createElement('span');
      lbl.style.position = 'absolute';
      lbl.style.left = '2px';
      lbl.style.top = '-9px';
      lbl.style.fontSize = '9px';
      lbl.style.fontFamily = 'Roboto Mono, monospace';
      lbl.style.color = isZero ? '#dc2626' : '#334155';
      lbl.style.fontWeight = isZero ? '700' : '400';
      lbl.textContent = Math.round(mm);
      tick.appendChild(lbl);
    }
    hTicks.appendChild(tick);
  }

  const startMmY = Math.floor(-trimOriginY / pxPerMm / minorStep) * minorStep;
  const endMmY = Math.ceil((vRect.height - trimOriginY) / pxPerMm / minorStep) * minorStep;

  for (let mm = startMmY; mm <= endMmY; mm += minorStep) {
    const y = trimOriginY + mm * pxPerMm;
    const isMajor = Math.abs(mm % majorStep) < 0.01;
    const isZero = Math.abs(mm) < 0.01;
    const tick = document.createElement('div');
    tick.style.position = 'absolute';
    tick.style.top = `${y}px`;
    tick.style.right = '0';
    tick.style.width = isMajor ? '12px' : '6px';
    tick.style.borderTop = `1px solid ${isZero ? '#dc2626' : '#64748b'}`;
    if (isMajor) {
      const lbl = document.createElement('span');
      lbl.style.position = 'absolute';
      lbl.style.right = '11px';
      lbl.style.top = '1px';
      lbl.style.fontSize = '8px';
      lbl.style.fontFamily = 'Roboto Mono, monospace';
      lbl.style.color = isZero ? '#dc2626' : '#334155';
      lbl.textContent = Math.round(mm);
      tick.appendChild(lbl);
    }
    vTicks.appendChild(tick);
  }

  // Подсветка диапазона выделенного объекта на обеих линейках
  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
  const sel = AppState.sides[activeSide].find(o => o.id === AppState.ui.selectedId && o.visible);
  const hRange = document.getElementById('hObjRangeMarker');
  const vRange = document.getElementById('vObjRangeMarker');
  if (sel) {
    hRange.classList.remove('hidden');
    hRange.style.left = `${trimOriginX + sel.xMm * pxPerMm}px`;
    hRange.style.width = `${sel.widthMm * pxPerMm}px`;

    vRange.classList.remove('hidden');
    vRange.style.top = `${trimOriginY + sel.yMm * pxPerMm}px`;
    vRange.style.height = `${sel.heightMm * pxPerMm}px`;
  } else {
    hRange.classList.add('hidden');
    vRange.classList.add('hidden');
  }
}

function generateQrMatrix(text) {
  const size = 21;
  const m = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        m[r0 + r][c0 + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) { m[6][i] = i % 2 === 0; m[i][6] = i % 2 === 0; }
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8) || r === 6 || c === 6) continue;
      h = Math.imul(h ^ (r * 31 + c * 17), 1664525) + 1013904223;
      m[r][c] = ((h >>> 28) & 1) === 1;
    }
  }
  return m;
}

function createObjectElement(obj, dims, pxPerMm, interactive = true) {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = `${(obj.xMm + dims.bleedMm) * pxPerMm}px`;
  el.style.top = `${(obj.yMm + dims.bleedMm) * pxPerMm}px`;
  el.style.width = `${obj.widthMm * pxPerMm}px`;
  el.style.height = `${obj.heightMm * pxPerMm}px`;
  el.style.transform = `rotate(${obj.rotation || 0}deg)`;
  el.style.transformOrigin = 'center center';
  if (interactive) el.style.cursor = obj.locked ? 'not-allowed' : 'move';

  if (obj.type === 'shape') {
    if (obj.shapeKind === 'line') {
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      const ln = document.createElement('div');
      ln.style.width = '100%';
      ln.style.height = `${Math.max(1.5, (obj.strokeWidthMm || 0.5) * pxPerMm)}px`;
      ln.style.backgroundColor = obj.fill !== 'none' ? obj.fill : (obj.stroke || '#0F172A');
      el.appendChild(ln);
    } else {
      el.style.backgroundColor = obj.fill === 'none' ? 'transparent' : obj.fill;
      if (obj.stroke && obj.stroke !== 'none' && obj.strokeWidthMm > 0) {
        el.style.border = `${Math.max(1, obj.strokeWidthMm * pxPerMm)}px solid ${obj.stroke}`;
      }
      if (obj.shapeKind === 'circle') el.style.borderRadius = '9999px';
    }
  } else if (obj.type === 'text') {
    const fontPx = (obj.fontSizePt / REGLET_CONFIG.mmToPt) * pxPerMm;
    el.style.fontFamily = `'${obj.fontFamily}', sans-serif`;
    el.style.fontSize = `${fontPx}px`;
    el.style.fontWeight = obj.bold ? '700' : '400';
    el.style.fontStyle = obj.italic ? 'italic' : 'normal';
    el.style.textAlign = obj.align || 'left';
    el.style.lineHeight = '1.15';
    el.style.whiteSpace = 'pre-wrap';
    el.style.wordBreak = 'break-word';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = obj.align === 'center' ? 'center' : (obj.align === 'right' ? 'flex-end' : 'flex-start');
    el.style.color = (obj.isFoil && AppState.order.foil.color !== 'none')
      ? (AppState.order.foil.color === 'gold' ? '#D4AF37' : '#CBD5E1')
      : (obj.color || '#0F172A');
    el.textContent = obj.text;
  } else if (obj.type === 'image') {
    const img = document.createElement('img');
    img.src = obj.src;
    img.alt = obj.name;
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'fill';
    el.appendChild(img);
  } else if (obj.type === 'qr') {
    const matrix = generateQrMatrix(obj.qrData || 'https://reglet.ru');
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${matrix.length} ${matrix.length}`);
    svg.style.width = '100%';
    svg.style.height = '100%';
    matrix.forEach((row, r) => row.forEach((cell, c) => {
      if (cell) {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', c);
        rect.setAttribute('y', r);
        rect.setAttribute('width', '1');
        rect.setAttribute('height', '1');
        rect.setAttribute('fill', obj.fill || '#0F172A');
        svg.appendChild(rect);
      }
    }));
    el.appendChild(svg);
  }

  if (interactive && !obj.locked) {
    el.addEventListener('mousedown', (e) => beginDragObject(e, obj));
    el.addEventListener('touchstart', (e) => beginDragObject(e, obj), { passive: false });
  }
  return el;
}

function renderDocumentCanvas() {
  const dims = getTrimDims();
  const mat = getMaterial();
  const prod = getProduct();
  const pxPerMm = getPxPerMm();

  document.getElementById('propDocFormat').textContent = `${dims.widthMm.toFixed(1)} × ${dims.heightMm.toFixed(1)} мм`;
  document.getElementById('propDocBleed').textContent = `Вылеты: +${dims.bleedMm.toFixed(1)} мм`;
  document.getElementById('propDocSafe').textContent = `Безопасная зона: ${dims.safeMarginMm.toFixed(1)} мм`;

  const is3D = AppState.ui.docView === 'mockup3d';
  document.getElementById('canvasScrollArea').classList.toggle('hidden', is3D);
  document.getElementById('inline3dMockupView').classList.toggle('hidden', !is3D);

  if (is3D) {
    document.getElementById('inlineMockupSpecTag').textContent = `${prod.name} • ${dims.widthMm}×${dims.heightMm} мм • ${mat.name}`;
    render3dMockup(document.getElementById('inlineMockupCanvas'));
    requestAnimationFrame(updateCorelRulers);
    return;
  }

  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
  const backLocked = activeSide === 'back' && (!prod.allowTwoSides || AppState.order.printSides === 1);
  document.getElementById('backSideLockedOverlay').classList.toggle('hidden', !backLocked);

  const sheet = document.getElementById('documentSheetBleed');
  sheet.style.width = `${Math.round(dims.fullWidthMm * pxPerMm)}px`;
  sheet.style.height = `${Math.round(dims.fullHeightMm * pxPerMm)}px`;
  sheet.className = `relative shadow-2xl transition-shadow ${mat.cssClass}`;

  updateWorkspacePadding(dims, pxPerMm, activeSide);

  const trim = document.getElementById('trimBoxFrame');
  trim.style.left = `${dims.bleedMm * pxPerMm}px`;
  trim.style.top = `${dims.bleedMm * pxPerMm}px`;
  trim.style.width = `${dims.widthMm * pxPerMm}px`;
  trim.style.height = `${dims.heightMm * pxPerMm}px`;

  const safe = document.getElementById('safeBoxFrame');
  const safeOff = (dims.bleedMm + dims.safeMarginMm) * pxPerMm;
  safe.style.left = `${safeOff}px`;
  safe.style.top = `${safeOff}px`;
  safe.style.width = `${(dims.widthMm - dims.safeMarginMm * 2) * pxPerMm}px`;
  safe.style.height = `${(dims.heightMm - dims.safeMarginMm * 2) * pxPerMm}px`;

  const container = document.getElementById('documentObjectsContainer');
  container.innerHTML = '';
  AppState.sides[activeSide].forEach(obj => {
    if (!obj.visible) return;
    container.appendChild(createObjectElement(obj, dims, pxPerMm, true));
  });

  syncSelectionBoxAndPropertyBar(dims, pxPerMm);
  runPreflight();
  requestAnimationFrame(() => {
    if (!workspaceViewCentered) {
      workspaceViewCentered = true;
      centerWorkspaceView();
    }
    updateCorelRulers();
  });
}

function syncSelectionBoxAndPropertyBar(dims, pxPerMm) {
  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
  const obj = AppState.sides[activeSide].find(o => o.id === AppState.ui.selectedId && o.visible);

  const box = document.getElementById('activeObjBox');
  const docBar = document.getElementById('propBarDocInfo');
  const objBar = document.getElementById('propBarObjControls');

  if (!obj) {
    box.classList.add('hidden');
    docBar.classList.remove('hidden');
    objBar.classList.add('hidden');
    syncObjectDocker(null);
    return;
  }

  box.classList.remove('hidden');
  docBar.classList.add('hidden');
  objBar.classList.remove('hidden');

  box.style.left = `${(obj.xMm + dims.bleedMm) * pxPerMm}px`;
  box.style.top = `${(obj.yMm + dims.bleedMm) * pxPerMm}px`;
  box.style.width = `${obj.widthMm * pxPerMm}px`;
  box.style.height = `${obj.heightMm * pxPerMm}px`;
  box.style.transform = `rotate(${obj.rotation || 0}deg)`;

  document.getElementById('propObjTypeLabel').textContent = obj.name + ':';
  document.getElementById('propX').value = Number(obj.xMm.toFixed(1));
  document.getElementById('propY').value = Number(obj.yMm.toFixed(1));
  document.getElementById('propW').value = Number(obj.widthMm.toFixed(1));
  document.getElementById('propH').value = Number(obj.heightMm.toFixed(1));
  document.getElementById('propAngle').value = Math.round(obj.rotation || 0);

  syncObjectDocker(obj);
}

let activeTransform = null;

function getPointerXY(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function beginDragObject(e, obj) {
  e.stopPropagation();
  if (e.type === 'touchstart') e.preventDefault();
  AppState.ui.selectedId = obj.id;
  if (AppState.ui.editorMode === 'simple') {
    renderSimpleMode();
  } else {
    renderLayersDocker();
    const dims = getTrimDims();
    syncSelectionBoxAndPropertyBar(dims, getPxPerMm());
    updateCorelRulers();
  }
  const dims = getTrimDims();
  const pxPerMm = getPxPerMm();

  const pt = getPointerXY(e);
  pushHistory();
  activeTransform = {
    mode: 'move',
    obj,
    startX: pt.x,
    startY: pt.y,
    origX: obj.xMm,
    origY: obj.yMm,
    pxPerMm,
    dims
  };
}

function beginHandleTransform(e, handle) {
  e.stopPropagation();
  if (e.type === 'touchstart') e.preventDefault();
  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
  const obj = AppState.sides[activeSide].find(o => o.id === AppState.ui.selectedId);
  if (!obj || obj.locked) return;

  const dims = getTrimDims();
  const pxPerMm = getPxPerMm();
  const pt = getPointerXY(e);
  const sheetRect = document.getElementById('documentSheetBleed').getBoundingClientRect();
  const cx = sheetRect.left + (obj.xMm + dims.bleedMm + obj.widthMm / 2) * pxPerMm;
  const cy = sheetRect.top + (obj.yMm + dims.bleedMm + obj.heightMm / 2) * pxPerMm;

  pushHistory();
  activeTransform = {
    mode: handle === 'rotate' ? 'rotate' : 'resize',
    handle,
    obj,
    startX: pt.x,
    startY: pt.y,
    origX: obj.xMm,
    origY: obj.yMm,
    origW: obj.widthMm,
    origH: obj.heightMm,
    cx,
    cy,
    pxPerMm,
    dims
  };
}

window.addEventListener('mousemove', onGlobalPointerMove);
window.addEventListener('touchmove', onGlobalPointerMove, { passive: false });

function onGlobalPointerMove(e) {
  const pt = getPointerXY(e);

  // Обновляем динамические красные маркеры курсора на горизонтальной и вертикальной линейках
  const hRuler = document.getElementById('horizontalRuler');
  const vRuler = document.getElementById('verticalRuler');
  const sheet = document.getElementById('documentSheetBleed');
  if (hRuler && vRuler && sheet && AppState.ui.editorMode === 'advanced' && AppState.ui.docView !== 'mockup3d') {
    const hRect = hRuler.getBoundingClientRect();
    const vRect = vRuler.getBoundingClientRect();
    const sRect = sheet.getBoundingClientRect();
    const dims = getTrimDims();
    const pxPerMm = getPxPerMm();

    const hMark = document.getElementById('hCursorMarker');
    const vMark = document.getElementById('vCursorMarker');
    hMark.classList.remove('hidden');
    vMark.classList.remove('hidden');
    hMark.style.left = `${pt.x - hRect.left}px`;
    vMark.style.top = `${pt.y - vRect.top}px`;

    const cursorMmX = ((pt.x - sRect.left) / pxPerMm - dims.bleedMm).toFixed(1);
    const cursorMmY = ((pt.y - sRect.top) / pxPerMm - dims.bleedMm).toFixed(1);
    document.getElementById('propCursorCoords').textContent = `Курсор: X ${cursorMmX} мм, Y ${cursorMmY} мм`;
  }

  if (!activeTransform) return;
  if (e.type === 'touchmove') e.preventDefault();

  const { mode, obj, pxPerMm, dims } = activeTransform;
  const snapV = document.getElementById('snapLineV');
  const snapH = document.getElementById('snapLineH');
  snapV.classList.add('hidden');
  snapH.classList.add('hidden');

  if (mode === 'move') {
    let nx = activeTransform.origX + (pt.x - activeTransform.startX) / pxPerMm;
    let ny = activeTransform.origY + (pt.y - activeTransform.startY) / pxPerMm;

    // Привязка к центру страницы (CorelDRAW Snap)
    const thr = 1.2;
    if (Math.abs((nx + obj.widthMm / 2) - dims.widthMm / 2) < thr) {
      nx = dims.widthMm / 2 - obj.widthMm / 2;
      snapV.style.left = `${(dims.widthMm / 2 + dims.bleedMm) * pxPerMm}px`;
      snapV.classList.remove('hidden');
    }
    if (Math.abs((ny + obj.heightMm / 2) - dims.heightMm / 2) < thr) {
      ny = dims.heightMm / 2 - obj.heightMm / 2;
      snapH.style.top = `${(dims.heightMm / 2 + dims.bleedMm) * pxPerMm}px`;
      snapH.classList.remove('hidden');
    }

    obj.xMm = Number(nx.toFixed(2));
    obj.yMm = Number(ny.toFixed(2));
  } else if (mode === 'resize') {
    const dx = (pt.x - activeTransform.startX) / pxPerMm;
    const dy = (pt.y - activeTransform.startY) / pxPerMm;
    const h = activeTransform.handle;
    let nx = activeTransform.origX;
    let ny = activeTransform.origY;
    let nw = activeTransform.origW;
    let nh = activeTransform.origH;

    if (h.includes('e')) nw = Math.max(3, activeTransform.origW + dx);
    if (h.includes('s')) nh = Math.max(2, activeTransform.origH + dy);
    if (h.includes('w')) { nw = Math.max(3, activeTransform.origW - dx); nx = activeTransform.origX + (activeTransform.origW - nw); }
    if (h.includes('n')) { nh = Math.max(2, activeTransform.origH - dy); ny = activeTransform.origY + (activeTransform.origH - nh); }

    if (obj.type === 'qr' || (obj.type === 'image' && e.shiftKey)) {
      nh = nw * (activeTransform.origH / activeTransform.origW);
    }

    obj.xMm = Number(nx.toFixed(2));
    obj.yMm = Number(ny.toFixed(2));
    obj.widthMm = Number(nw.toFixed(2));
    obj.heightMm = Number(nh.toFixed(2));
  } else if (mode === 'rotate') {
    const rad = Math.atan2(pt.y - activeTransform.cy, pt.x - activeTransform.cx);
    let deg = Math.round((rad * 180) / Math.PI + 90);
    if (Math.abs(deg % 45) < 4) deg = Math.round(deg / 45) * 45;
    obj.rotation = deg;
  }

  if (AppState.ui.editorMode === 'simple') renderSimpleMode();
  else renderDocumentCanvas();
}

window.addEventListener('mouseup', () => {
  if (activeTransform) {
    document.getElementById('snapLineV').classList.add('hidden');
    document.getElementById('snapLineH').classList.add('hidden');
    activeTransform = null;
  }
});
window.addEventListener('touchend', () => { activeTransform = null; });
