/**
 * Проверка качества макета (Preflight).
 */
function runPreflight() {
  const dims = getTrimDims();
  const prod = getProduct();
  const issues = [];

  const checkPage = (key, title) => {
    const objs = AppState.sides[key].filter(o => o.visible);
    if (!objs.length) {
      issues.push({ level: 'warning', msg: `${title}: страница пуста.` });
      return;
    }
    objs.forEach(o => {
      if (o.type === 'text' || o.type === 'qr') {
        if (o.xMm < dims.safeMarginMm - 0.1 || o.yMm < dims.safeMarginMm - 0.1 ||
            (o.xMm + o.widthMm) > (dims.widthMm - dims.safeMarginMm + 0.1) ||
            (o.yMm + o.heightMm) > (dims.heightMm - dims.safeMarginMm + 0.1)) {
          issues.push({ level: 'error', msg: `${title}: «${o.name}» выходит за безопасную зону (${dims.safeMarginMm} мм).` });
        }
      }
      if (o.type === 'image' && !o.isSvg && o.naturalWidth && o.naturalHeight) {
        const dpiX = Math.round(o.naturalWidth / (o.widthMm / 25.4));
        const dpiY = Math.round(o.naturalHeight / (o.heightMm / 25.4));
        o.effectiveDpi = Math.min(dpiX, dpiY);
        if (o.effectiveDpi < prod.minDpi) {
          issues.push({ level: 'error', msg: `${title}: разрешение фото «${o.name}» ${o.effectiveDpi} DPI (нужно ≥${prod.minDpi} DPI).` });
        }
      }
    });
  };

  checkPage('front', 'Лицо');
  if (prod.allowTwoSides && AppState.order.printSides === 2) {
    checkPage('back', 'Оборот');
  }

  const badge = document.getElementById('preflightBadge');
  const box = document.getElementById('preflightMessages');
  box.innerHTML = '';

  if (issues.length === 0) {
    badge.textContent = 'Готов к печати';
    badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
    box.innerHTML = `<div class="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">✓ Вылеты +${dims.bleedMm} мм соблюдены, текст в безопасной зоне, шрифты переводятся в кривые.</div>`;
  } else {
    const hasErr = issues.some(i => i.level === 'error');
    badge.textContent = hasErr ? `Ошибок: ${issues.length}` : `Внимание: ${issues.length}`;
    badge.className = hasErr
      ? 'text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800'
      : 'text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800';
    issues.forEach(i => {
      const d = document.createElement('div');
      d.className = i.level === 'error'
        ? 'p-1.5 rounded bg-red-50 border border-red-200 text-red-800'
        : 'p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800';
      d.textContent = (i.level === 'error' ? '✕ ' : '⚠ ') + i.msg;
      box.appendChild(d);
    });
  }
  return issues;
}
