/**
 * Состояние документа и заказа (все координаты в миллиметрах).
 */
const uid = () => 'id_' + Math.random().toString(36).slice(2, 9);

const AppState = {
  order: {
    productId: 'business_card',
    sizeId: '90x50',
    orientation: 'landscape',
    materialId: 'coated_300',
    printSides: 2,
    quantity: 100,
    lamination: { sides: 'none', type: 'matte' },
    foil: { color: 'none', sides: '1' }
  },
  sides: {
    front: [],
    back: []
  },
  ui: {
    editorMode: 'simple', // 'simple' | 'advanced'
    docView: 'front', // 'front' | 'back' | 'mockup3d'
    dockerTab: 'order', // 'order' | 'inspector' | 'layers'
    selectedId: null,
    zoom: 1.0,
    lastPrice: null
  },
  history: {
    past: [],
    future: []
  },
  cart: [],
  loadedFonts: {}
};

function getProduct() { return REGLET_CONFIG.products[AppState.order.productId]; }
function getMaterial() { return REGLET_CONFIG.materials[AppState.order.materialId]; }

function getTrimDims() {
  const prod = getProduct();
  const sz = prod.sizes.find(s => s.id === AppState.order.sizeId) || prod.sizes[0];
  let w = sz.widthMm;
  let h = sz.heightMm;
  if (prod.allowOrientation) {
    if (AppState.order.orientation === 'landscape' && w < h) [w, h] = [h, w];
    if (AppState.order.orientation === 'portrait' && w > h) [w, h] = [h, w];
  }
  return {
    widthMm: w,
    heightMm: h,
    bleedMm: prod.bleedMm,
    safeMarginMm: prod.safeMarginMm,
    fullWidthMm: w + prod.bleedMm * 2,
    fullHeightMm: h + prod.bleedMm * 2
  };
}

function applyBusinessCardTemplate(tplId) {
  const tpl = BUSINESS_CARD_TEMPLATES.find(t => t.id === tplId);
  if (!tpl) return;
  pushHistory();

  // Если пользователь был на кружке или наклейке, переключаем на визитку 90x50
  if (AppState.order.productId !== 'business_card') {
    AppState.order.productId = 'business_card';
    AppState.order.sizeId = '90x50';
    AppState.order.orientation = 'landscape';
    AppState.order.materialId = 'coated_300';
  }
  AppState.order.printSides = 2;

  const readField = (simpleId, autoId, fallback) => {
    const el = document.getElementById(AppState.ui.editorMode === 'simple' ? simpleId : autoId);
    return (el?.value || '').trim() || fallback;
  };
  const comp = readField('simpleFieldCompany', 'tplAutoCompany', 'ООО «РЕГЛЕТ»');
  const pers = readField('simpleFieldPerson', 'tplAutoPerson', 'Александр Смирнов');
  const phone = readField('simpleFieldContacts', 'tplAutoPhone', '+7 (495) 123-45-67');

  const built = tpl.build(comp, pers, phone);
  const dims = getTrimDims();
  const scaleX = dims.widthMm / 90;
  const scaleY = dims.heightMm / 50;

  const mapObjs = (arr) => arr.map(item => ({
    ...item,
    id: uid(),
    xMm: Number((item.xMm * scaleX).toFixed(2)),
    yMm: Number((item.yMm * scaleY).toFixed(2)),
    widthMm: Number((item.widthMm * scaleX).toFixed(2)),
    heightMm: Number((item.heightMm * scaleY).toFixed(2)),
    visible: true,
    locked: false
  }));

  AppState.sides.front = mapObjs(built.front);
  AppState.sides.back = mapObjs(built.back);
  AppState.ui.selectedId = null;
  if (AppState.ui.docView === 'mockup3d') AppState.ui.docView = 'front';
  syncAll();
  showToast(`Применён шаблон «${tpl.title}»`, 'success');
}

function pushHistory() {
  const snap = JSON.stringify({ order: AppState.order, sides: AppState.sides });
  if (AppState.history.past[AppState.history.past.length - 1] === snap) return;
  AppState.history.past.push(snap);
  if (AppState.history.past.length > 40) AppState.history.past.shift();
  AppState.history.future = [];
  updateUndoRedoUI();
}

function undo() {
  if (!AppState.history.past.length) return;
  AppState.history.future.push(JSON.stringify({ order: AppState.order, sides: AppState.sides }));
  const prev = JSON.parse(AppState.history.past.pop());
  AppState.order = prev.order;
  AppState.sides = prev.sides;
  AppState.ui.selectedId = null;
  syncAll();
}

function redo() {
  if (!AppState.history.future.length) return;
  AppState.history.past.push(JSON.stringify({ order: AppState.order, sides: AppState.sides }));
  const next = JSON.parse(AppState.history.future.pop());
  AppState.order = next.order;
  AppState.sides = next.sides;
  AppState.ui.selectedId = null;
  syncAll();
}

function updateUndoRedoUI() {
  document.getElementById('btnUndo').disabled = AppState.history.past.length === 0;
  document.getElementById('btnRedo').disabled = AppState.history.future.length === 0;
}

function showToast(msg, type = 'info') {
  const box = document.getElementById('toastContainer');
  const styles = {
    info: 'bg-slate-800 text-white border-slate-700',
    success: 'bg-emerald-700 text-white border-emerald-600',
    warning: 'bg-amber-600 text-white border-amber-500',
    error: 'bg-red-600 text-white border-red-500'
  };
  const el = document.createElement('div');
  el.className = `pointer-events-auto px-3 py-2 rounded shadow-lg border text-xs font-semibold transition-opacity ${styles[type] || styles.info}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 3200);
}
