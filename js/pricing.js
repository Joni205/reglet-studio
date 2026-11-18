/**
 * Калькулятор стоимости и совместимости отделки «Реглет».
 */
function enforceCompatibility() {
  const prod = getProduct();
  const mat = getMaterial();
  const alertBox = document.getElementById('finishingCompatAlert');
  alertBox.classList.add('hidden');
  const notes = [];

  if (!prod.allowTwoSides) {
    AppState.order.printSides = 1;
    if (AppState.order.lamination.sides === '2') AppState.order.lamination.sides = '1';
    if (AppState.order.foil.sides === '2') AppState.order.foil.sides = '1';
  }

  if (!prod.allowFinishing) {
    AppState.order.lamination.sides = 'none';
    AppState.order.foil.color = 'none';
    return;
  }

  if (!mat.allowLam && AppState.order.lamination.sides !== 'none') {
    AppState.order.lamination.sides = 'none';
    notes.push(`На материал «${mat.name}» ламинация не наносится.`);
  }

  if (!mat.allowFoil && AppState.order.foil.color !== 'none') {
    AppState.order.foil.color = 'none';
    notes.push(`На материал «${mat.name}» фольгирование недоступно.`);
  }

  if (AppState.order.foil.color !== 'none' && AppState.order.lamination.sides !== 'none' && AppState.order.lamination.type === 'gloss') {
    AppState.order.lamination.type = 'matte';
    notes.push('Фольга несовместима с глянцевой ламинацией — выбран тип «Матовая».');
  }

  if (notes.length > 0) {
    alertBox.textContent = notes.join(' ');
    alertBox.classList.remove('hidden');
  }
}

function calculatePrice() {
  const prod = getProduct();
  const sz = prod.sizes.find(s => s.id === AppState.order.sizeId) || prod.sizes[0];
  const mat = getMaterial();
  const qty = Math.max(1, parseInt(AppState.order.quantity, 10) || 1);

  const disc = REGLET_CONFIG.discounts.find(d => qty >= d.minQty) || { mult: 1.0 };
  const sidesMult = (prod.allowTwoSides && AppState.order.printSides === 2) ? 1.55 : 1.0;

  const baseUnit = prod.unitPrice * sz.priceMult * sidesMult * disc.mult;
  const matUnit = mat.priceAdd * sz.priceMult;

  let lamUnit = 0;
  if (prod.allowFinishing && AppState.order.lamination.sides !== 'none') {
    const sMult = AppState.order.lamination.sides === '2' ? 1.85 : 1.0;
    lamUnit = (REGLET_CONFIG.finishingPrices.lamination[AppState.order.lamination.type] || 0) * sz.priceMult * sMult;
  }

  let foilUnit = 0;
  if (prod.allowFinishing && AppState.order.foil.color !== 'none') {
    const sMult = AppState.order.foil.sides === '2' ? 1.85 : 1.0;
    foilUnit = (REGLET_CONFIG.finishingPrices.foil[AppState.order.foil.color] || 0) * sMult;
  }

  const total = Math.round(prod.baseSetup + (baseUnit + matUnit + lamUnit + foilUnit) * qty);
  return {
    qty,
    total,
    unitPrice: total / qty
  };
}

function updatePriceDisplay() {
  const calc = calculatePrice();
  document.getElementById('sidebarTotalPrice').textContent = `${calc.total.toLocaleString('ru-RU')} ₽`;
  document.getElementById('unitPriceLabel').textContent = `${calc.unitPrice.toFixed(2)} ₽ / шт.`;

  const deltaEl = document.getElementById('sidebarPriceDelta');
  if (AppState.ui.lastPrice !== null && AppState.ui.lastPrice !== calc.total) {
    const diff = calc.total - AppState.ui.lastPrice;
    deltaEl.textContent = `${diff > 0 ? '+' : ''}${diff.toLocaleString('ru-RU')} ₽`;
    deltaEl.className = `block text-[11px] font-bold ${diff > 0 ? 'text-amber-700' : 'text-emerald-700'}`;
    deltaEl.classList.remove('hidden');
    clearTimeout(deltaEl._t);
    deltaEl._t = setTimeout(() => deltaEl.classList.add('hidden'), 2500);
  }
  AppState.ui.lastPrice = calc.total;
}
