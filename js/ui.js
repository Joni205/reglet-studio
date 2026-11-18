/**
 * Рендеринг панелей заказа, шаблонов, слоёв, инспектора и всех обработчиков интерфейса.
 */
function renderOrderDocker() {
  const prod = getProduct();

  // Изделие
  const selProd = document.getElementById('selProduct');
  selProd.innerHTML = '';
  Object.values(REGLET_CONFIG.products).forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name;
    o.selected = p.id === AppState.order.productId;
    selProd.appendChild(o);
  });

  // Формат и ориентация
  const selSize = document.getElementById('selSize');
  selSize.innerHTML = '';
  prod.sizes.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label;
    o.selected = s.id === AppState.order.sizeId;
    selSize.appendChild(o);
  });

  document.getElementById('orientButtonsRow').classList.toggle('hidden', !prod.allowOrientation);
  document.querySelectorAll('.orient-choice-btn').forEach(b => {
    const act = b.dataset.orient === AppState.order.orientation;
    b.className = `orient-choice-btn py-1.5 px-2 text-xs font-semibold rounded border text-center ${
      act ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`;
  });

  // Материал
  const selMat = document.getElementById('selMaterial');
  selMat.innerHTML = '';
  prod.materials.forEach(mId => {
    const m = REGLET_CONFIG.materials[mId];
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = `${m.name}${m.priceAdd > 0 ? ` (+${m.priceAdd} ₽/шт)` : ''}`;
    o.selected = m.id === AppState.order.materialId;
    selMat.appendChild(o);
  });

  // Стороны
  document.getElementById('printSidesRow').classList.toggle('hidden', !prod.allowTwoSides);
  document.querySelectorAll('.sides-choice-btn').forEach(b => {
    const act = parseInt(b.dataset.sides, 10) === AppState.order.printSides;
    b.className = `sides-choice-btn py-1.5 px-2 text-xs font-semibold rounded border ${
      act ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`;
  });

  // Отделка
  document.getElementById('finishingSection').classList.toggle('hidden', !prod.allowFinishing);
  if (prod.allowFinishing) {
    const sLamS = document.getElementById('selLamSides');
    const sLamT = document.getElementById('selLamType');
    const sFoilC = document.getElementById('selFoilColor');
    const sFoilS = document.getElementById('selFoilSides');
    sLamS.value = AppState.order.lamination.sides;
    sLamT.value = AppState.order.lamination.type;
    sLamT.disabled = AppState.order.lamination.sides === 'none';
    sFoilC.value = AppState.order.foil.color;
    sFoilS.value = AppState.order.foil.sides;
    sFoilS.disabled = AppState.order.foil.color === 'none';

    sLamS.querySelector('option[value="2"]').disabled = AppState.order.printSides === 1;
    sFoilS.querySelector('option[value="2"]').disabled = AppState.order.printSides === 1;
  }

  // Тиражи
  const qBox = document.getElementById('qtyQuickButtons');
  qBox.innerHTML = '';
  prod.qtyPresets.forEach(q => {
    const act = AppState.order.quantity === q;
    const b = document.createElement('button');
    b.className = `py-1 text-xs font-bold rounded border ${
      act ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`;
    b.textContent = q;
    b.onclick = () => {
      pushHistory();
      AppState.order.quantity = q;
      syncAll();
    };
    qBox.appendChild(b);
  });
  document.getElementById('inputQtyCustom').value = AppState.order.quantity;
}

function renderTemplatesGallery() {
  const box = document.getElementById('templatesListContainer');
  box.innerHTML = '';
  BUSINESS_CARD_TEMPLATES.forEach(tpl => {
    const card = document.createElement('div');
    card.className = 'p-2.5 rounded border border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 cursor-pointer transition space-y-1.5';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-800">${tpl.title}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background:${tpl.accent}">${tpl.badge}</span>
      </div>
      <div class="h-12 rounded border border-slate-200 bg-white flex items-center justify-between px-3 overflow-hidden">
        <div class="w-1.5 h-full -ml-3" style="background:${tpl.accent}"></div>
        <div class="text-[10px] font-bold text-slate-700 truncate">Лицо + Оборот (90×50 мм)</div>
        <span class="text-[10px] text-red-600 font-bold">Применить →</span>
      </div>
    `;
    card.onclick = () => applyBusinessCardTemplate(tpl.id);
    box.appendChild(card);
  });
}

function renderLayersDocker() {
  const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
  const objs = AppState.sides[activeSide];
  document.getElementById('dockerLayersCount').textContent = objs.length;
  document.getElementById('dockerLayersSideTag').textContent = activeSide === 'front' ? 'Страница 1 (Лицо)' : 'Страница 2 (Оборот)';
  const list = document.getElementById('dockerLayersList');
  list.innerHTML = '';

  if (!objs.length) {
    list.innerHTML = `<div class="text-xs text-slate-400 text-center py-6">Нет объектов на странице</div>`;
    return;
  }

  [...objs].reverse().forEach((obj, rIdx) => {
    const realIdx = objs.length - 1 - rIdx;
    const sel = obj.id === AppState.ui.selectedId;
    const row = document.createElement('div');
    row.className = `p-1.5 rounded border flex items-center justify-between gap-1 text-xs cursor-pointer ${
      sel ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
    }`;
    row.onclick = () => {
      AppState.ui.selectedId = obj.id;
      renderDocumentCanvas();
      renderLayersDocker();
    };
    row.innerHTML = `
      <span class="truncate font-medium ${!obj.visible ? 'line-through text-slate-400' : 'text-slate-800'}">${obj.name}</span>
      <div class="flex items-center gap-1 shrink-0">
        <button data-a="up" class="px-1 hover:bg-slate-200 rounded">↑</button>
        <button data-a="dn" class="px-1 hover:bg-slate-200 rounded">↓</button>
        <button data-a="vis" class="px-1 hover:bg-slate-200 rounded">${obj.visible ? '👁' : '🚫'}</button>
        <button data-a="del" class="px-1 hover:bg-red-100 text-red-600 rounded font-bold">✕</button>
      </div>
    `;
    row.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const a = btn.dataset.a;
        pushHistory();
        if (a === 'up' && realIdx < objs.length - 1) [objs[realIdx], objs[realIdx + 1]] = [objs[realIdx + 1], objs[realIdx]];
        if (a === 'dn' && realIdx > 0) [objs[realIdx], objs[realIdx - 1]] = [objs[realIdx - 1], objs[realIdx]];
        if (a === 'vis') obj.visible = !obj.visible;
        if (a === 'del') {
          objs.splice(realIdx, 1);
          if (AppState.ui.selectedId === obj.id) AppState.ui.selectedId = null;
        }
        renderDocumentCanvas();
        renderLayersDocker();
      };
    });
    list.appendChild(row);
  });
}

function syncObjectDocker(obj) {
  document.getElementById('inspectorEmptyState').classList.toggle('hidden', !!obj);
  document.getElementById('inspectorTextPanel').classList.toggle('hidden', !(obj && obj.type === 'text'));
  document.getElementById('inspectorShapePanel').classList.toggle('hidden', !(obj && (obj.type === 'shape' || obj.type === 'qr')));
  document.getElementById('inspectorImagePanel').classList.toggle('hidden', !(obj && obj.type === 'image'));

  if (!obj) return;
  if (obj.type === 'text') {
    document.getElementById('inspTextValue').value = obj.text;
    document.getElementById('inspTextFont').value = obj.fontFamily;
    document.getElementById('inspTextSize').value = obj.fontSizePt;
    document.getElementById('inspTextColor').value = obj.color || '#0F172A';
    document.getElementById('inspTextFoil').checked = !!obj.isFoil;
  } else if (obj.type === 'shape' || obj.type === 'qr') {
    document.getElementById('inspShapeFill').value = obj.fill && obj.fill !== 'none' ? obj.fill : '#DC2626';
    document.getElementById('inspShapeNoFill').checked = obj.fill === 'none';
    document.getElementById('inspShapeStroke').value = obj.stroke && obj.stroke !== 'none' ? obj.stroke : '#0F172A';
    document.getElementById('inspShapeStrokeW').value = obj.strokeWidthMm || 0;
  } else if (obj.type === 'image') {
    document.getElementById('inspImgName').textContent = obj.name;
    document.getElementById('inspImgPx').textContent = obj.isSvg ? 'Векторный SVG' : `${obj.naturalWidth} × ${obj.naturalHeight} px`;
    document.getElementById('inspImgDpi').textContent = obj.isSvg ? 'Разрешение: ∞ (Вектор)' : `Разрешение: ${obj.effectiveDpi || 300} DPI`;
  }
}

function syncAll() {
  enforceCompatibility();
  renderOrderDocker();
  renderDocumentCanvas();
  renderLayersDocker();
  updatePriceDisplay();
  updateUndoRedoUI();
}

function bindAllEvents() {
  // Переключение вкладок документа: Страница 1, Страница 2, 3D Мокап
  document.querySelectorAll('.doc-tab-btn').forEach(btn => {
    btn.onclick = () => {
      AppState.ui.docView = btn.dataset.docView;
      AppState.ui.selectedId = null;
      document.querySelectorAll('.doc-tab-btn').forEach(b => {
        const act = b.dataset.docView === AppState.ui.docView;
        b.className = act
          ? 'doc-tab-btn px-3 py-1 text-xs font-bold rounded-t border border-b-0 border-slate-300 bg-white text-slate-900 shadow-2xs'
          : 'doc-tab-btn px-3 py-1 text-xs font-semibold rounded-t border border-transparent text-slate-600 hover:bg-slate-100';
      });
      renderDocumentCanvas();
      renderLayersDocker();
    };
  });

  // Переключение правых докеров
  document.querySelectorAll('.docker-tab-btn').forEach(btn => {
    btn.onclick = () => {
      AppState.ui.dockerTab = btn.dataset.docker;
      document.querySelectorAll('.docker-tab-btn').forEach(b => {
        const act = b.dataset.docker === AppState.ui.dockerTab;
        b.className = act
          ? 'docker-tab-btn py-2 px-2 border-b-2 border-red-600 bg-white text-red-700'
          : 'docker-tab-btn py-2 px-2 border-b-2 border-transparent text-slate-600 hover:text-slate-900';
      });
      document.querySelectorAll('.docker-pane').forEach(p => p.classList.add('hidden'));
      document.getElementById(`docker-${AppState.ui.dockerTab}`).classList.remove('hidden');
    };
  });

  // Галерея шаблонов визиток
  document.getElementById('btnToggleTemplatesDrawer').onclick = () => {
    document.getElementById('templatesDrawer').classList.toggle('hidden');
    requestAnimationFrame(updateCorelRulers);
  };
  document.getElementById('btnCloseTemplatesDrawer').onclick = () => {
    document.getElementById('templatesDrawer').classList.add('hidden');
    requestAnimationFrame(updateCorelRulers);
  };

  // Инструменты левой панели CorelDRAW
  document.querySelectorAll('.corel-tool-btn').forEach(btn => {
    btn.onclick = () => {
      const tool = btn.dataset.tool;
      const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
      const dims = getTrimDims();

      if (tool === 'pick') {
        showToast('Режим указателя (выбор и трансформация объектов)', 'info');
        return;
      }

      pushHistory();
      let newObj = null;
      if (tool === 'text') {
        newObj = {
          id: uid(), type: 'text', name: 'Текстовый блок', text: 'Новый текст',
          xMm: dims.safeMarginMm + 2, yMm: dims.heightMm / 2 - 4, widthMm: Math.max(25, dims.widthMm - 10), heightMm: 8,
          rotation: 0, fontFamily: 'Inter', fontSizePt: 11, bold: true, italic: false, align: 'left', color: '#0F172A', visible: true, locked: false
        };
      } else if (tool === 'rect' || tool === 'circle' || tool === 'line') {
        newObj = {
          id: uid(), type: 'shape', shapeKind: tool, name: tool === 'rect' ? 'Прямоугольник' : (tool === 'circle' ? 'Эллипс' : 'Линия'),
          xMm: dims.widthMm / 2 - 12, yMm: dims.heightMm / 2 - 8, widthMm: 24, heightMm: tool === 'line' ? 3 : 16,
          rotation: 0, fill: tool === 'line' ? 'none' : '#DC2626', stroke: tool === 'line' ? '#0F172A' : 'none', strokeWidthMm: tool === 'line' ? 0.6 : 0, visible: true, locked: false
        };
      } else if (tool === 'qr') {
        const sz = Math.min(18, dims.heightMm * 0.4);
        newObj = {
          id: uid(), type: 'qr', name: 'QR-код', qrData: 'https://reglet.ru',
          xMm: dims.widthMm - dims.safeMarginMm - sz, yMm: dims.heightMm - dims.safeMarginMm - sz, widthMm: sz, heightMm: sz,
          rotation: 0, fill: '#0F172A', visible: true, locked: false
        };
      }

      if (newObj) {
        if (AppState.ui.docView === 'mockup3d') AppState.ui.docView = 'front';
        AppState.sides[activeSide].push(newObj);
        AppState.ui.selectedId = newObj.id;
        renderDocumentCanvas();
        renderLayersDocker();
      }
    };
  });

  // Импорт фото/логотипа
  document.getElementById('inputImportImage').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!okTypes.includes(file.type)) {
      showToast('Допустимы форматы JPG, PNG, WebP или SVG.', 'error');
      return;
    }
    if (file.size > REGLET_CONFIG.maxUploadBytes) {
      showToast('Размер файла превышает 25 МБ.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        pushHistory();
        const dims = getTrimDims();
        const nw = img.naturalWidth || 600;
        const nh = img.naturalHeight || 600;
        let tw = Math.min(dims.widthMm * 0.45, 42);
        let th = tw / (nw / nh);
        if (th > dims.heightMm * 0.7) { th = dims.heightMm * 0.7; tw = th * (nw / nh); }

        const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
        const obj = {
          id: uid(), type: 'image', name: file.name, src: ev.target.result, isSvg: file.type === 'image/svg+xml',
          naturalWidth: nw, naturalHeight: nh,
          xMm: Number(((dims.widthMm - tw) / 2).toFixed(2)), yMm: Number(((dims.heightMm - th) / 2).toFixed(2)),
          widthMm: Number(tw.toFixed(2)), heightMm: Number(th.toFixed(2)), rotation: 0, visible: true, locked: false
        };
        if (AppState.ui.docView === 'mockup3d') AppState.ui.docView = 'front';
        AppState.sides[activeSide].push(obj);
        AppState.ui.selectedId = obj.id;
        renderDocumentCanvas();
        renderLayersDocker();
        showToast(`Изображение «${file.name}» добавлено`, 'success');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Параметры заказа справа
  document.getElementById('selProduct').onchange = (e) => {
    pushHistory();
    const p = REGLET_CONFIG.products[e.target.value];
    AppState.order.productId = p.id;
    AppState.order.sizeId = p.sizes[0].id;
    AppState.order.materialId = p.materials[0];
    AppState.order.quantity = p.qtyPresets[0];
    if (!p.allowTwoSides) { AppState.order.printSides = 1; AppState.ui.docView = 'front'; }
    syncAll();
  };

  document.getElementById('selSize').onchange = (e) => {
    pushHistory();
    AppState.order.sizeId = e.target.value;
    syncAll();
  };

  document.querySelectorAll('.orient-choice-btn').forEach(b => {
    b.onclick = () => {
      if (AppState.order.orientation === b.dataset.orient) return;
      rotatePage90();
    };
  });

  document.getElementById('btnRotatePage90').onclick = () => rotatePage90();

  function rotatePage90() {
    const prod = getProduct();
    if (!prod.allowOrientation) {
      showToast('Для данного изделия ориентация фиксирована.', 'warning');
      return;
    }
    pushHistory();
    const oldD = getTrimDims();
    AppState.order.orientation = AppState.order.orientation === 'landscape' ? 'portrait' : 'landscape';
    const newD = getTrimDims();
    ['front', 'back'].forEach(sk => {
      AppState.sides[sk].forEach(o => {
        const cx = o.xMm + o.widthMm / 2, cy = o.yMm + o.heightMm / 2;
        o.xMm = Number(((cy / oldD.heightMm) * newD.widthMm - o.widthMm / 2).toFixed(2));
        o.yMm = Number((newD.heightMm - (cx / oldD.widthMm) * newD.heightMm - o.heightMm / 2).toFixed(2));
      });
    });
    syncAll();
  }

  document.getElementById('selMaterial').onchange = (e) => {
    pushHistory();
    AppState.order.materialId = e.target.value;
    syncAll();
  };

  document.querySelectorAll('.sides-choice-btn').forEach(b => {
    b.onclick = () => {
      pushHistory();
      AppState.order.printSides = parseInt(b.dataset.sides, 10);
      syncAll();
    };
  });

  document.getElementById('btnQuickEnable44').onclick = () => {
    pushHistory();
    AppState.order.printSides = 2;
    syncAll();
  };

  document.getElementById('selLamSides').onchange = (e) => { pushHistory(); AppState.order.lamination.sides = e.target.value; syncAll(); };
  document.getElementById('selLamType').onchange = (e) => { pushHistory(); AppState.order.lamination.type = e.target.value; syncAll(); };
  document.getElementById('selFoilColor').onchange = (e) => { pushHistory(); AppState.order.foil.color = e.target.value; syncAll(); };
  document.getElementById('selFoilSides').onchange = (e) => { pushHistory(); AppState.order.foil.sides = e.target.value; syncAll(); };

  document.getElementById('inputQtyCustom').oninput = (e) => {
    AppState.order.quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    renderOrderDocker();
    updatePriceDisplay();
  };

  // Панель свойств CorelDRAW (X, Y, W, H, Угол, Выравнивание)
  const bindNumProp = (id, key) => {
    document.getElementById(id).oninput = (e) => {
      const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
      const obj = AppState.sides[activeSide].find(o => o.id === AppState.ui.selectedId);
      if (!obj) return;
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) {
        obj[key] = key === 'widthMm' || key === 'heightMm' ? Math.max(1, v) : v;
        renderDocumentCanvas();
      }
    };
  };
  bindNumProp('propX', 'xMm');
  bindNumProp('propY', 'yMm');
  bindNumProp('propW', 'widthMm');
  bindNumProp('propH', 'heightMm');
  bindNumProp('propAngle', 'rotation');

  document.querySelectorAll('[data-align]').forEach(btn => {
    btn.onclick = () => {
      const activeSide = AppState.ui.docView === 'back' ? 'back' : 'front';
      const obj = AppState.sides[activeSide].find(o => o.id === AppState.ui.selectedId);
      if (!obj) return;
      pushHistory();
      const d = getTrimDims();
      const a = btn.dataset.align;
      if (a === 'left') obj.xMm = d.safeMarginMm;
      if (a === 'right') obj.xMm = d.widthMm - d.safeMarginMm - obj.widthMm;
      if (a === 'centerH' || a === 'centerPage') obj.xMm = (d.widthMm - obj.widthMm) / 2;
      if (a === 'centerV' || a === 'centerPage') obj.yMm = (d.heightMm - obj.heightMm) / 2;
      renderDocumentCanvas();
    };
  });

  document.getElementById('btnLayerUp').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const arr = AppState.sides[sk];
    const i = arr.findIndex(o => o.id === AppState.ui.selectedId);
    if (i >= 0 && i < arr.length - 1) { pushHistory(); [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; renderDocumentCanvas(); renderLayersDocker(); }
  };
  document.getElementById('btnLayerDown').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const arr = AppState.sides[sk];
    const i = arr.findIndex(o => o.id === AppState.ui.selectedId);
    if (i > 0) { pushHistory(); [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]; renderDocumentCanvas(); renderLayersDocker(); }
  };
  document.getElementById('btnDuplicateObj').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const obj = AppState.sides[sk].find(o => o.id === AppState.ui.selectedId);
    if (!obj) return;
    pushHistory();
    const cp = JSON.parse(JSON.stringify(obj));
    cp.id = uid(); cp.name += ' (копия)'; cp.xMm += 4; cp.yMm += 4;
    AppState.sides[sk].push(cp);
    AppState.ui.selectedId = cp.id;
    renderDocumentCanvas(); renderLayersDocker();
  };
  document.getElementById('btnDeleteObj').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const idx = AppState.sides[sk].findIndex(o => o.id === AppState.ui.selectedId);
    if (idx === -1) return;
    pushHistory();
    AppState.sides[sk].splice(idx, 1);
    AppState.ui.selectedId = null;
    renderDocumentCanvas(); renderLayersDocker();
  };

  // Снятие выделения кликом по пустому фону холста
  document.getElementById('documentSheetBleed').addEventListener('mousedown', (e) => {
    if (e.target.id === 'documentSheetBleed' || e.target.id === 'documentObjectsContainer') {
      AppState.ui.selectedId = null;
      renderDocumentCanvas();
      renderLayersDocker();
    }
  });

  // Снятие выделения кликом по пастеборду вне листа
  document.getElementById('workspaceStage').addEventListener('mousedown', (e) => {
    if (e.target.id === 'workspaceStage') {
      AppState.ui.selectedId = null;
      renderDocumentCanvas();
      renderLayersDocker();
    }
  });

  // Маркеры углов и поворота CorelDRAW
  document.querySelectorAll('#activeObjBox [data-handle]').forEach(h => {
    h.addEventListener('mousedown', (e) => beginHandleTransform(e, h.dataset.handle));
    h.addEventListener('touchstart', (e) => beginHandleTransform(e, h.dataset.handle), { passive: false });
  });

  // Инспектор текста и фигур в правом докере
  document.getElementById('inspTextValue').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { o.text = e.target.value; renderDocumentCanvas(); }
  };
  document.getElementById('inspTextFont').onchange = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { pushHistory(); o.fontFamily = e.target.value; renderDocumentCanvas(); }
  };
  document.getElementById('inspTextSize').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { o.fontSizePt = Math.max(4, parseFloat(e.target.value) || 8); renderDocumentCanvas(); }
  };
  document.getElementById('inspTextColor').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { o.color = e.target.value; renderDocumentCanvas(); }
  };
  document.getElementById('inspTextBold').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { pushHistory(); o.bold = !o.bold; renderDocumentCanvas(); }
  };
  document.getElementById('inspTextItalic').onclick = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') { pushHistory(); o.italic = !o.italic; renderDocumentCanvas(); }
  };
  document.querySelectorAll('.insp-align-btn').forEach(b => {
    b.onclick = () => {
      const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
      const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
      if (o && o.type === 'text') { pushHistory(); o.align = b.dataset.txtAlign; renderDocumentCanvas(); }
    };
  });
  document.getElementById('inspTextFoil').onchange = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o && o.type === 'text') {
      pushHistory();
      o.isFoil = e.target.checked;
      if (o.isFoil && AppState.order.foil.color === 'none') { AppState.order.foil.color = 'gold'; syncAll(); }
      else renderDocumentCanvas();
    }
  };

  document.getElementById('inspShapeFill').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o) { o.fill = e.target.value; document.getElementById('inspShapeNoFill').checked = false; renderDocumentCanvas(); }
  };
  document.getElementById('inspShapeNoFill').onchange = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o) { o.fill = e.target.checked ? 'none' : document.getElementById('inspShapeFill').value; renderDocumentCanvas(); }
  };
  document.getElementById('inspShapeStroke').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o) { o.stroke = e.target.value; if (!o.strokeWidthMm) o.strokeWidthMm = 0.5; renderDocumentCanvas(); }
  };
  document.getElementById('inspShapeStrokeW').oninput = (e) => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (o) { o.strokeWidthMm = parseFloat(e.target.value) || 0; renderDocumentCanvas(); }
  };

  const stretchSelectedToBleed = () => {
    const sk = AppState.ui.docView === 'back' ? 'back' : 'front';
    const o = AppState.sides[sk].find(x => x.id === AppState.ui.selectedId);
    if (!o) return;
    pushHistory();
    const d = getTrimDims();
    o.xMm = -d.bleedMm; o.yMm = -d.bleedMm; o.widthMm = d.fullWidthMm; o.heightMm = d.fullHeightMm; o.rotation = 0;
    renderDocumentCanvas();
  };
  document.getElementById('btnStretchToBleed').onclick = stretchSelectedToBleed;
  document.getElementById('btnImgFitBleed').onclick = stretchSelectedToBleed;

  // Масштаб, Undo/Redo, Новый, JSON
  document.getElementById('btnZoomIn').onclick = () => {
    AppState.ui.zoom = Math.min(2.4, Number((AppState.ui.zoom + 0.15).toFixed(2)));
    document.getElementById('btnZoomReset').textContent = Math.round(AppState.ui.zoom * 100) + '%';
    renderDocumentCanvas();
  };
  document.getElementById('btnZoomOut').onclick = () => {
    AppState.ui.zoom = Math.max(0.45, Number((AppState.ui.zoom - 0.15).toFixed(2)));
    document.getElementById('btnZoomReset').textContent = Math.round(AppState.ui.zoom * 100) + '%';
    renderDocumentCanvas();
  };
  document.getElementById('btnZoomReset').onclick = () => {
    AppState.ui.zoom = 1.0;
    document.getElementById('btnZoomReset').textContent = '100%';
    renderDocumentCanvas();
  };

  document.getElementById('btnUndo').onclick = undo;
  document.getElementById('btnRedo').onclick = redo;
  document.getElementById('btnNewDoc').onclick = () => {
    pushHistory();
    AppState.sides = { front: [], back: [] };
    AppState.ui.selectedId = null;
    syncAll();
    showToast('Создан чистый макет', 'info');
  };

  document.getElementById('btnSaveJson').onclick = () => {
    const data = { generator: 'REGLET_CORELDRAW_WEB', savedAt: new Date().toISOString(), order: AppState.order, sides: AppState.sides };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reglet_project_${AppState.order.productId}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('Проект сохранён в JSON', 'success');
  };

  document.getElementById('inputOpenJson').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.order || !parsed.sides) throw new Error('Неверный формат файла');
        pushHistory();
        AppState.order = parsed.order;
        AppState.sides = parsed.sides;
        AppState.ui.selectedId = null;
        syncAll();
        showToast('Проект восстановлен из JSON', 'success');
      } catch (err) {
        showToast('Ошибка загрузки JSON: ' + err.message, 'error');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };

  // Скачивание PDF и модальное окно предпросмотра
  const triggerPdfDownload = async () => {
    try {
      const blob = await buildPrintReadyPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `REGLET_PRINT_${AppState.order.productId}_${AppState.order.sizeId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Печатный PDF с векторными контурами и метками реза сформирован!', 'success');
    } catch (err) {
      console.error('[PDF]', err);
      showToast('Не удалось сформировать PDF: ' + err.message, 'error');
    }
  };

  document.getElementById('btnDownloadPdfTop').onclick = triggerPdfDownload;
  document.getElementById('btnModalDownloadPdf').onclick = triggerPdfDownload;

  document.getElementById('btnOpenPreviewModal').onclick = () => {
    const prod = getProduct();
    const mat = getMaterial();
    const dims = getTrimDims();
    const calc = calculatePrice();
    const issues = runPreflight();

    document.getElementById('prevFrontDim').textContent = `${dims.widthMm}×${dims.heightMm} мм`;
    document.getElementById('prevBackDim').textContent = prod.allowTwoSides && AppState.order.printSides === 2 ? '4+4' : 'Не используется';

    const sc = Math.min(250 / dims.widthMm, 150 / dims.heightMm);
    const fw = Math.round(dims.widthMm * sc), fh = Math.round(dims.heightMm * sc);

    const fBox = document.getElementById('prevFrontContainer');
    fBox.innerHTML = '';
    const fPrev = buildFlatSidePreview('front', dims, fw, fh);
    fPrev.classList.add('shadow-md', 'border', 'border-slate-300');
    fBox.appendChild(fPrev);

    const bBox = document.getElementById('prevBackContainer');
    bBox.innerHTML = '';
    if (prod.allowTwoSides && AppState.order.printSides === 2) {
      const bPrev = buildFlatSidePreview('back', dims, fw, fh);
      bPrev.classList.add('shadow-md', 'border', 'border-slate-300');
      bBox.appendChild(bPrev);
    } else {
      bBox.innerHTML = `<span class="text-xs text-slate-400">Односторонняя печать (4+0)</span>`;
    }

    render3dMockup(document.getElementById('prevModalMockup'));

    document.getElementById('prevOrderSpecs').innerHTML = `
      <div><strong>Изделие:</strong> ${prod.name}</div>
      <div><strong>Формат:</strong> ${dims.widthMm}×${dims.heightMm} мм (${AppState.order.orientation === 'landscape' ? 'гориз.' : 'верт.'})</div>
      <div><strong>Материал:</strong> ${mat.name}</div>
      <div><strong>Ламинация:</strong> ${AppState.order.lamination.sides === 'none' ? 'Нет' : `${AppState.order.lamination.sides} ст. (${AppState.order.lamination.type})`}</div>
      <div><strong>Фольгирование:</strong> ${AppState.order.foil.color === 'none' ? 'Нет' : `${AppState.order.foil.color} (${AppState.order.foil.sides} ст.)`}</div>
      <div><strong>Тираж:</strong> ${calc.qty} шт. (${calc.unitPrice.toFixed(2)} ₽/шт.)</div>
    `;
    document.getElementById('prevModalTotal').textContent = `${calc.total.toLocaleString('ru-RU')} ₽`;
    document.getElementById('prevModalPreflight').innerHTML = issues.length === 0
      ? `<div class="text-emerald-700 font-semibold">✓ Ошибок препресса не обнаружено.</div>`
      : issues.map(i => `<div class="${i.level === 'error' ? 'text-red-600' : 'text-amber-600'}">• ${i.msg}</div>`).join('');

    document.getElementById('previewModal').classList.remove('hidden');
  };

  document.getElementById('btnClosePreviewModal').onclick = () => document.getElementById('previewModal').classList.add('hidden');

  // Добавление в корзину и управление корзиной
  const addOrderToCart = async () => {
    const prod = getProduct();
    const mat = getMaterial();
    const dims = getTrimDims();
    const calc = calculatePrice();
    let pdfBlob;
    try {
      pdfBlob = await buildPrintReadyPdf();
    } catch (err) {
      console.error('[PDF]', err);
      showToast('Не удалось сформировать PDF для корзины: ' + err.message, 'error');
      return;
    }

    AppState.cart.push({
      id: 'ord_' + Date.now(),
      productName: prod.name,
      sizeLabel: `${dims.widthMm}×${dims.heightMm} мм`,
      materialName: mat.name,
      qty: calc.qty,
      total: calc.total,
      snapshot: JSON.parse(JSON.stringify({ order: AppState.order, sides: AppState.sides })),
      pdfBlob
    });
    document.getElementById('headerCartBadge').textContent = AppState.cart.length;
    document.getElementById('previewModal').classList.add('hidden');
    showToast(`«${prod.name}» (${calc.qty} шт.) добавлены в корзину`, 'success');
  };

  document.getElementById('btnAddOrderToCart').onclick = addOrderToCart;
  document.getElementById('btnModalConfirmCart').onclick = addOrderToCart;

  document.getElementById('btnOpenCartModal').onclick = () => {
    const list = document.getElementById('cartListContainer');
    list.innerHTML = '';
    let sum = 0;
    if (!AppState.cart.length) {
      list.innerHTML = `<div class="text-center text-xs text-slate-500 py-8">В корзине пока нет оформленных макетов.</div>`;
    } else {
      AppState.cart.forEach((item, idx) => {
        sum += item.total;
        const row = document.createElement('div');
        row.className = 'p-3 rounded border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs';
        row.innerHTML = `
          <div>
            <div class="font-bold text-slate-900">${idx + 1}. ${item.productName} (${item.sizeLabel})</div>
            <div class="text-slate-600">${item.materialName} • Тираж: <strong>${item.qty} шт.</strong></div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-black text-slate-900 mr-1">${item.total.toLocaleString('ru-RU')} ₽</span>
            <button data-pdf class="px-2 py-1 bg-sky-700 text-white rounded font-semibold">PDF</button>
            <button data-edit class="px-2 py-1 bg-white border border-slate-300 rounded font-semibold">Изменить</button>
          </div>
        `;
        row.querySelector('[data-pdf]').onclick = () => {
          const u = URL.createObjectURL(item.pdfBlob);
          const a = document.createElement('a'); a.href = u; a.download = `REGLET_${item.id}.pdf`; a.click();
          URL.revokeObjectURL(u);
        };
        row.querySelector('[data-edit]').onclick = () => {
          AppState.order = JSON.parse(JSON.stringify(item.snapshot.order));
          AppState.sides = JSON.parse(JSON.stringify(item.snapshot.sides));
          document.getElementById('cartModal').classList.add('hidden');
          syncAll();
          showToast('Макет загружен из корзины для правки', 'info');
        };
        list.appendChild(row);
      });
    }
    document.getElementById('cartTotalSum').textContent = `${sum.toLocaleString('ru-RU')} ₽`;
    document.getElementById('cartModal').classList.remove('hidden');
  };

  document.getElementById('btnCloseCartModal').onclick = () => document.getElementById('cartModal').classList.add('hidden');
  document.getElementById('btnCheckoutOrder').onclick = () => {
    if (!AppState.cart.length) { showToast('Корзина пуста', 'warning'); return; }
    showToast('Заказ и векторные PDF-файлы отправлены в производство «Реглет»!', 'success');
    AppState.cart = [];
    document.getElementById('headerCartBadge').textContent = '0';
    document.getElementById('cartModal').classList.add('hidden');
  };

  document.getElementById('canvasScrollArea').addEventListener('scroll', updateCorelRulers);
  window.addEventListener('resize', () => { renderDocumentCanvas(); updateCorelRulers(); });
}
