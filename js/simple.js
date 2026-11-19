/**
 * Упрощённый пошаговый режим: шаблон → текст → логотип и цвет → заказ.
 * Использует общую модель AppState (order + sides.front/back в мм) и общий PDF/корзину.
 */

function applyModeVisibility() {
  const simple = AppState.ui.editorMode === 'simple';
  document.getElementById('simpleModeShell').classList.toggle('hidden', !simple);
  document.getElementById('advancedModeShell').classList.toggle('hidden', simple);
  document.querySelectorAll('.adv-only').forEach(el => el.classList.toggle('hidden', simple));

  const btnS = document.getElementById('btnModeSimple');
  const btnA = document.getElementById('btnModeAdvanced');
  btnS.className = simple
    ? 'px-2.5 py-1 text-xs font-extrabold rounded-md bg-white text-red-700 shadow-xs'
    : 'px-2.5 py-1 text-xs font-bold rounded-md text-slate-600 hover:text-slate-900';
  btnA.className = simple
    ? 'px-2.5 py-1 text-xs font-bold rounded-md text-slate-600 hover:text-slate-900'
    : 'px-2.5 py-1 text-xs font-extrabold rounded-md bg-white text-sky-800 shadow-xs';
}

function findRoleObject(role) {
  return AppState.sides.front.find(o => o.type === 'text' && o.role === role)
    || AppState.sides.back.find(o => o.type === 'text' && o.role === role);
}

function syncSimpleFieldsFromCanvas() {
  const pairs = [
    ['simpleFieldCompany', 'tplAutoCompany', 'company'],
    ['simpleFieldPerson', 'tplAutoPerson', 'person'],
    ['simpleFieldContacts', 'tplAutoPhone', 'contacts']
  ];
  pairs.forEach(([inputId, autoId, role]) => {
    const obj = findRoleObject(role);
    if (!obj) return;
    const input = document.getElementById(inputId);
    if (document.activeElement !== input) input.value = obj.text;
    const auto = document.getElementById(autoId);
    if (document.activeElement !== auto) auto.value = obj.text;
  });
}

function renderSimpleMode() {
  const dims = getTrimDims();
  const mat = getMaterial();
  const prod = getProduct();
  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';

  document.querySelectorAll('.simple-side-btn').forEach(btn => {
    const act = btn.dataset.simpleSide === activeSide;
    btn.className = act
      ? 'simple-side-btn px-3.5 py-1.5 text-xs font-extrabold rounded-lg bg-red-600 text-white shadow-2xs'
      : 'simple-side-btn px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200';
  });

  const backLocked = activeSide === 'back' && (!prod.allowTwoSides || AppState.order.printSides === 1);
  document.getElementById('simpleBackLockedMsg').classList.toggle('hidden', !backLocked);
  document.getElementById('simpleCanvasStage').classList.toggle('hidden', backLocked);

  const pxPerMm = getPxPerMm();
  const wPx = Math.round(dims.widthMm * pxPerMm);
  const hPx = Math.round(dims.heightMm * pxPerMm);

  const stage = document.getElementById('simpleCanvasStage');
  stage.style.width = `${wPx}px`;
  stage.style.height = `${hPx}px`;
  stage.className = `relative shadow-2xl rounded-sm overflow-hidden border border-slate-300 bg-white transition-all ${mat.cssClass}`;

  const safeBorder = document.getElementById('simpleSafeHintBorder');
  const mPx = dims.safeMarginMm * pxPerMm;
  safeBorder.style.left = `${mPx}px`;
  safeBorder.style.top = `${mPx}px`;
  safeBorder.style.width = `${wPx - mPx * 2}px`;
  safeBorder.style.height = `${hPx - mPx * 2}px`;

  const layer = document.getElementById('simpleObjectsLayer');
  layer.innerHTML = '';
  const noBleedDims = { ...dims, bleedMm: 0 };
  AppState.sides[activeSide].forEach(obj => {
    if (!obj.visible) return;
    const el = createObjectElement(obj, noBleedDims, pxPerMm, true);
    if (obj.id === AppState.ui.selectedId) el.style.outline = '2px solid #dc2626';
    layer.appendChild(el);
  });

  const issues = runPreflight();
  const friendlyBox = document.getElementById('simpleFriendlyPreflight');
  friendlyBox.innerHTML = '';
  if (!issues.length) {
    friendlyBox.innerHTML = `<div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">✅ Отличный макет! Текст в безопасной зоне, картинки подходят для чёткой печати.</div>`;
  } else {
    issues.forEach(iss => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-2';
      const humanMsg = iss.msg.includes('безопасную зону')
        ? '⚠️ Текст или элемент слишком близко к краю — при обрезке он может задеться.'
        : iss.msg.includes('DPI')
          ? '⚠️ Загруженная картинка мелковата — при печати может выглядеть размытой.'
          : 'ℹ️ Одна из сторон пока пустая.';
      item.innerHTML = `<span>${humanMsg}</span>`;
      if (iss.msg.includes('безопасную зону')) {
        const fixBtn = document.createElement('button');
        fixBtn.className = 'px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-bold shrink-0';
        fixBtn.textContent = 'Поправить';
        fixBtn.onclick = autoAlignSimpleLayout;
        item.appendChild(fixBtn);
      }
      friendlyBox.appendChild(item);
    });
  }

  document.getElementById('simpleMockupCaption').textContent = `${dims.widthMm}×${dims.heightMm} мм`;
  render3dMockup(document.getElementById('simpleMockupContainer'));
}

function renderSimplePanels() {
  const prod = getProduct();

  const tplGrid = document.getElementById('simpleTemplatesGrid');
  tplGrid.innerHTML = '';
  BUSINESS_CARD_TEMPLATES.forEach(tpl => {
    const btn = document.createElement('button');
    btn.className = 'p-2 rounded-xl border border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-red-50/40 text-left transition flex items-center gap-2';
    btn.innerHTML = `
      <span class="w-3.5 h-8 rounded-sm shrink-0" style="background:${tpl.accent}"></span>
      <div class="min-w-0">
        <div class="text-xs font-bold text-slate-800 truncate">${tpl.title}</div>
        <div class="text-[10px] text-slate-500">${tpl.badge}</div>
      </div>
    `;
    btn.onclick = () => applyBusinessCardTemplate(tpl.id);
    tplGrid.appendChild(btn);
  });

  const accents = ['#DC2626', '#0F172A', '#0284C7', '#059669', '#D97706', '#7C3AED'];
  const swBox = document.getElementById('simpleAccentSwatches');
  swBox.innerHTML = '';
  accents.forEach(hex => {
    const b = document.createElement('button');
    b.className = 'w-7 h-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-300 hover:scale-110 transition';
    b.style.backgroundColor = hex;
    b.title = hex;
    b.onclick = () => {
      pushHistory();
      ['front', 'back'].forEach(sk => AppState.sides[sk].forEach(o => {
        if (!o.isAccent) return;
        if (o.fill && o.fill !== 'none') o.fill = hex;
        if (o.stroke && o.stroke !== 'none') o.stroke = hex;
      }));
      syncAll();
    };
    swBox.appendChild(b);
  });

  const quickProducts = [
    { label: 'Визитки 90×50', pId: 'business_card', sId: '90x50' },
    { label: 'Евровизитки 85×55', pId: 'business_card', sId: '85x55' },
    { label: 'Листовки А6', pId: 'flyer', sId: 'A6' },
    { label: 'Листовки А5', pId: 'flyer', sId: 'A5' },
    { label: 'Наклейки 90×50', pId: 'sticker', sId: '90x50' },
    { label: 'Кружка латте', pId: 'mug_latte', sId: 'latte_300' }
  ];
  const pGrid = document.getElementById('simpleProductPresetsGrid');
  pGrid.innerHTML = '';
  quickProducts.forEach(qp => {
    const active = AppState.order.productId === qp.pId && AppState.order.sizeId === qp.sId;
    const b = document.createElement('button');
    b.className = `py-2 px-2.5 rounded-xl border text-xs font-bold text-left transition ${
      active ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs' : 'border-slate-200 hover:border-slate-300 text-slate-700'
    }`;
    b.textContent = qp.label;
    b.onclick = () => {
      pushHistory();
      const target = REGLET_CONFIG.products[qp.pId];
      AppState.order.productId = qp.pId;
      AppState.order.sizeId = qp.sId;
      if (!target.materials.includes(AppState.order.materialId)) {
        AppState.order.materialId = target.materials[0];
      }
      if (!target.allowTwoSides) {
        AppState.order.printSides = 1;
        AppState.ui.docView = 'front';
      }
      AppState.order.quantity = target.qtyPresets[0];
      syncAll();
    };
    pGrid.appendChild(b);
  });

  const mGrid = document.getElementById('simpleMaterialsGrid');
  mGrid.innerHTML = '';
  prod.materials.forEach(mId => {
    const m = REGLET_CONFIG.materials[mId];
    const active = m.id === AppState.order.materialId;
    const b = document.createElement('button');
    b.className = `w-full px-3 py-2 rounded-xl border flex items-center justify-between text-left transition ${
      active ? 'border-red-600 bg-red-50/70' : 'border-slate-200 hover:border-slate-300'
    }`;
    b.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-md border border-slate-300 shrink-0 ${m.cssClass}"></span>
        <span class="text-xs font-bold ${active ? 'text-red-900' : 'text-slate-800'}">${m.name}</span>
      </div>
      <span class="text-[11px] text-slate-500">${m.priceAdd > 0 ? `+${m.priceAdd} ₽/шт` : 'В цене'}</span>
    `;
    b.onclick = () => {
      pushHistory();
      AppState.order.materialId = m.id;
      syncAll();
    };
    mGrid.appendChild(b);
  });

  const finBlock = document.getElementById('simpleFinishingBlock');
  finBlock.classList.toggle('hidden', !prod.allowFinishing);
  if (prod.allowFinishing) {
    const lamOpts = [
      { val: 'none', label: 'Без ламинации' },
      { val: 'matte', label: 'Матовая' },
      { val: 'gloss', label: 'Глянцевая' },
      { val: 'softtouch', label: 'Soft Touch' }
    ];
    const lamBox = document.getElementById('simpleLamButtons');
    lamBox.innerHTML = '';
    lamOpts.forEach(opt => {
      const isSelected = (opt.val === 'none' && AppState.order.lamination.sides === 'none') ||
        (opt.val !== 'none' && AppState.order.lamination.sides !== 'none' && AppState.order.lamination.type === opt.val);
      const b = document.createElement('button');
      b.className = `py-1.5 px-2 rounded-lg border text-xs font-bold transition ${
        isSelected ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
      }`;
      b.textContent = opt.label;
      b.onclick = () => {
        pushHistory();
        if (opt.val === 'none') {
          AppState.order.lamination.sides = 'none';
        } else {
          AppState.order.lamination.sides = AppState.order.printSides === 2 ? '2' : '1';
          AppState.order.lamination.type = opt.val;
        }
        syncAll();
      };
      lamBox.appendChild(b);
    });

    const foilOpts = [
      { val: 'none', label: 'Без фольги' },
      { val: 'gold', label: 'Золото' },
      { val: 'silver', label: 'Серебро' }
    ];
    const foilBox = document.getElementById('simpleFoilButtons');
    foilBox.innerHTML = '';
    foilOpts.forEach(opt => {
      const isSelected = AppState.order.foil.color === opt.val;
      const b = document.createElement('button');
      b.className = `py-1.5 px-2 rounded-lg border text-xs font-bold transition ${
        isSelected ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
      }`;
      b.textContent = opt.label;
      b.onclick = () => {
        pushHistory();
        AppState.order.foil.color = opt.val;
        AppState.order.foil.sides = '1';
        syncAll();
      };
      foilBox.appendChild(b);
    });
  }

  const hint = document.getElementById('simpleCompatHint');
  const advAlert = document.getElementById('finishingCompatAlert');
  if (advAlert && !advAlert.classList.contains('hidden') && advAlert.textContent.trim()) {
    hint.textContent = '💡 ' + advAlert.textContent;
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }

  const qBox = document.getElementById('simpleQtyButtons');
  qBox.innerHTML = '';
  prod.qtyPresets.slice(0, 4).forEach(q => {
    const act = AppState.order.quantity === q;
    const b = document.createElement('button');
    b.className = `py-2 rounded-xl border text-xs font-extrabold transition ${
      act ? 'border-red-600 bg-red-600 text-white shadow-2xs' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
    }`;
    b.textContent = `${q} шт.`;
    b.onclick = () => {
      pushHistory();
      AppState.order.quantity = q;
      syncAll();
    };
    qBox.appendChild(b);
  });

  const calc = calculatePrice();
  document.getElementById('simpleTotalPrice').textContent = `${calc.total.toLocaleString('ru-RU')} ₽`;
  document.getElementById('simpleUnitCost').textContent = `${calc.unitPrice.toFixed(2)} ₽ / шт.`;
}

function autoAlignSimpleLayout() {
  pushHistory();
  const dims = getTrimDims();
  const safe = dims.safeMarginMm + 1;
  ['front', 'back'].forEach(sk => {
    AppState.sides[sk].forEach(o => {
      if (o.type !== 'text' && o.type !== 'qr') return;
      if (o.xMm < safe) o.xMm = safe;
      if (o.yMm < safe) o.yMm = safe;
      if (o.xMm + o.widthMm > dims.widthMm - safe) {
        o.widthMm = Math.max(15, dims.widthMm - safe * 2);
        o.xMm = safe;
      }
      if (o.yMm + o.heightMm > dims.heightMm - safe) {
        o.yMm = Math.max(safe, dims.heightMm - safe - o.heightMm);
      }
    });
  });
  syncAll();
  showToast('Все элементы аккуратно выровнены в безопасной зоне!', 'success');
}

function bindSimpleModeEvents() {
  const modeButtons = [
    ['btnModeSimple', 'simple'],
    ['btnModeAdvanced', 'advanced']
  ];
  modeButtons.forEach(([id, mode]) => {
    document.getElementById(id).onclick = () => {
      if (AppState.ui.editorMode === mode) return;
      AppState.ui.editorMode = mode;
      AppState.ui.selectedId = null;
      if (mode === 'simple' && AppState.ui.docView === 'mockup3d') AppState.ui.docView = 'front';
      applyModeVisibility();
      syncAll();
      showToast(mode === 'simple'
        ? 'Упрощённый режим: пошаговое заполнение без сложных настроек'
        : 'Профессиональный режим: линейки, слои и точные координаты', 'info');
    };
  });

  const bindRole = (inputId, role) => {
    document.getElementById(inputId).oninput = (e) => {
      const val = e.target.value;
      ['front', 'back'].forEach(sk => AppState.sides[sk].forEach(o => {
        if (o.type === 'text' && o.role === role) o.text = val;
      }));
      renderSimpleMode();
    };
  };
  bindRole('simpleFieldCompany', 'company');
  bindRole('simpleFieldPerson', 'person');
  bindRole('simpleFieldContacts', 'contacts');

  document.querySelectorAll('.simple-side-btn').forEach(btn => {
    btn.onclick = () => {
      AppState.ui.docView = btn.dataset.simpleSide;
      AppState.ui.selectedId = null;
      renderSimpleMode();
    };
  });

  document.getElementById('btnSimpleAutoAlign').onclick = autoAlignSimpleLayout;
  document.getElementById('btnSimpleRotate').onclick = () => document.getElementById('btnRotatePage90').click();
  document.getElementById('btnSimpleClearCanvas').onclick = () => {
    pushHistory();
    AppState.sides = { front: [], back: [] };
    AppState.ui.selectedId = null;
    syncAll();
    showToast('Холст очищен', 'info');
  };
  document.getElementById('btnSimpleEnableTwoSides').onclick = () => {
    pushHistory();
    AppState.order.printSides = 2;
    syncAll();
  };
  document.getElementById('simpleInputUploadImg').onchange = (e) => {
    importImageFile(e.target.files[0]);
    e.target.value = '';
  };
  document.getElementById('btnSimpleOrderAndPdf').onclick = () => {
    document.getElementById('btnOpenPreviewModal').click();
  };

  applyModeVisibility();
}
