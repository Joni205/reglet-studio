/**
 * Генератор печатного PDF 1.4 (вектор, кривые, метки реза).
 */
async function loadVectorFont(fontFamily, bold = false, italic = false) {
  const family = fontFamily.replace(/\s+/g, '');
  const style = bold && italic ? 'BoldItalic' : bold ? 'Bold' : italic ? 'Italic' : 'Regular';
  const key = `${family}-${style}`;
  if (AppState.loadedFonts[key]) return AppState.loadedFonts[key];
  let url = REGLET_CONFIG.fontUrls[key];
  if (!url) {
    const regularKey = `${family}-Regular`;
    url = REGLET_CONFIG.fontUrls[regularKey];
    console.warn(`[PDF] Шрифт ${key} не найден, используется ${regularKey}`);
  }
  if (window.opentype && url) {
    try {
      const f = await opentype.load(url);
      AppState.loadedFonts[key] = f;
      return f;
    } catch (e) {
      console.warn(`[PDF] Не удалось загрузить шрифт ${key}: ${url}`, e);
    }
  } else if (window.opentype) {
    console.warn(`[PDF] Нет URL для шрифта ${key}`);
  }
  return null;
}

function hexToRgbPdf(hex) {
  if (!hex || hex === 'none') return '0 0 0';
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return `${(((n >> 16) & 255) / 255).toFixed(3)} ${(((n >> 8) & 255) / 255).toFixed(3)} ${((n & 255) / 255).toFixed(3)}`;
}

async function convertTextToPdfCurves(obj, dims, fullHpt) {
  const k = REGLET_CONFIG.mmToPt;
  const font = await loadVectorFont(obj.fontFamily, obj.bold, obj.italic);
  const rgb = (obj.isFoil && AppState.order.foil.color !== 'none')
    ? (AppState.order.foil.color === 'gold' ? '0.831 0.686 0.216' : '0.753 0.753 0.753')
    : hexToRgbPdf(obj.color);

  const x0 = (obj.xMm + dims.bleedMm) * k;
  const yTop = fullHpt - (obj.yMm + dims.bleedMm) * k;
  const wPt = obj.widthMm * k;
  const hPt = obj.heightMm * k;
  const fSize = obj.fontSizePt;
  const lines = (obj.text || '').split('\n');

  let out = `q\n${rgb} rg\n`;
  if (obj.rotation) {
    const cx = x0 + wPt / 2;
    const cy = yTop - hPt / 2;
    const r = (-obj.rotation * Math.PI) / 180;
    out += `1 0 0 1 ${cx.toFixed(3)} ${cy.toFixed(3)} cm\n${Math.cos(r).toFixed(5)} ${Math.sin(r).toFixed(5)} ${(-Math.sin(r)).toFixed(5)} ${Math.cos(r).toFixed(5)} 0 0 cm\n1 0 0 1 ${(-cx).toFixed(3)} ${(-cy).toFixed(3)} cm\n`;
  }

  if (font) {
    lines.forEach((line, idx) => {
      const adv = font.getAdvanceWidth(line, fSize);
      let lx = x0;
      if (obj.align === 'center') lx = x0 + (wPt - adv) / 2;
      if (obj.align === 'right') lx = x0 + (wPt - adv);
      const baseY = yTop - fSize * 0.92 - idx * (fSize * 1.15);

      const p = font.getPath(line, 0, 0, fSize);
      p.commands.forEach(cmd => {
        if (cmd.type === 'M') out += `${(lx + cmd.x).toFixed(3)} ${(baseY - cmd.y).toFixed(3)} m\n`;
        else if (cmd.type === 'L') out += `${(lx + cmd.x).toFixed(3)} ${(baseY - cmd.y).toFixed(3)} l\n`;
        else if (cmd.type === 'C') out += `${(lx + cmd.x1).toFixed(3)} ${(baseY - cmd.y1).toFixed(3)} ${(lx + cmd.x2).toFixed(3)} ${(baseY - cmd.y2).toFixed(3)} ${(lx + cmd.x).toFixed(3)} ${(baseY - cmd.y).toFixed(3)} c\n`;
        else if (cmd.type === 'Q') out += `${(lx + cmd.x1).toFixed(3)} ${(baseY - cmd.y1).toFixed(3)} ${(lx + cmd.x1).toFixed(3)} ${(baseY - cmd.y1).toFixed(3)} ${(lx + cmd.x).toFixed(3)} ${(baseY - cmd.y).toFixed(3)} c\n`;
        else if (cmd.type === 'Z') out += `h\n`;
      });
      out += `f\n`;
    });
  } else {
    // Встроенный векторный контурный fallback без внешних зависимостей
    lines.forEach((line, idx) => {
      const cw = fSize * 0.54;
      let lx = x0;
      if (obj.align === 'center') lx = x0 + (wPt - line.length * cw) / 2;
      if (obj.align === 'right') lx = x0 + (wPt - line.length * cw);
      const by = yTop - fSize * 0.88 - idx * (fSize * 1.15);
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ') continue;
        out += `${(lx + i * cw).toFixed(2)} ${by.toFixed(2)} ${(cw * 0.78).toFixed(2)} ${(fSize * 0.72).toFixed(2)} re f\n`;
      }
    });
  }
  out += `Q\n`;
  return out;
}

async function extractJpegBytes(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 400;
      c.height = img.naturalHeight || 400;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      const bin = atob(c.toDataURL('image/jpeg', 0.95).split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      resolve({ bytes, width: c.width, height: c.height });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function buildPrintReadyPdf() {
  const dims = getTrimDims();
  const prod = getProduct();
  const mat = getMaterial();
  const k = REGLET_CONFIG.mmToPt;

  const fullWpt = Number((dims.fullWidthMm * k).toFixed(3));
  const fullHpt = Number((dims.fullHeightMm * k).toFixed(3));
  const bleedPt = Number((dims.bleedMm * k).toFixed(3));
  const trimRpt = Number(((dims.bleedMm + dims.widthMm) * k).toFixed(3));
  const trimTpt = Number(((dims.bleedMm + dims.heightMm) * k).toFixed(3));

  const pages = ['front'];
  if (prod.allowTwoSides && AppState.order.printSides === 2) pages.push('back');

  const chunks = [];
  const offsets = [0];
  let byteLen = 0;

  const writeStr = s => {
    const u = new TextEncoder().encode(s);
    chunks.push(u);
    byteLen += u.length;
  };
  const writeBin = u => { chunks.push(u); byteLen += u.length; };
  const startObj = id => { offsets[id] = byteLen; writeStr(`${id} 0 obj\n`); };
  const endObj = () => writeStr(`endobj\n`);

  writeStr(`%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`);
  let nextId = 3;
  const pageIds = [];

  for (const sideKey of pages) {
    const objs = AppState.sides[sideKey].filter(o => o.visible);
    let stream = `q\n0 0 ${fullWpt} ${fullHpt} re W n\n${hexToRgbPdf(mat.pdfBgHex)} rg\n0 0 ${fullWpt} ${fullHpt} re f\n`;
    const xObjs = [];
    let imIdx = 1;

    for (const obj of objs) {
      const xPt = (obj.xMm + dims.bleedMm) * k;
      const wPt = obj.widthMm * k;
      const hPt = obj.heightMm * k;
      const yBot = fullHpt - (obj.yMm + dims.bleedMm) * k - hPt;

      if (obj.type === 'shape') {
        stream += `q\n`;
        if (obj.rotation) {
          const cx = xPt + wPt / 2, cy = yBot + hPt / 2, r = (-obj.rotation * Math.PI) / 180;
          stream += `1 0 0 1 ${cx.toFixed(3)} ${cy.toFixed(3)} cm\n${Math.cos(r).toFixed(5)} ${Math.sin(r).toFixed(5)} ${(-Math.sin(r)).toFixed(5)} ${Math.cos(r).toFixed(5)} 0 0 cm\n1 0 0 1 ${(-cx).toFixed(3)} ${(-cy).toFixed(3)} cm\n`;
        }
        if (obj.shapeKind === 'line') {
          const col = obj.fill !== 'none' ? obj.fill : (obj.stroke || '#0F172A');
          stream += `${hexToRgbPdf(col)} RG\n${Math.max(0.5, (obj.strokeWidthMm || 0.5) * k).toFixed(2)} w\n${xPt.toFixed(3)} ${(yBot + hPt / 2).toFixed(3)} m ${(xPt + wPt).toFixed(3)} ${(yBot + hPt / 2).toFixed(3)} l S\n`;
        } else if (obj.shapeKind === 'circle') {
          const kap = 0.55228475, rx = wPt / 2, ry = hPt / 2, cx = xPt + rx, cy = yBot + ry;
          if (obj.fill && obj.fill !== 'none') stream += `${hexToRgbPdf(obj.fill)} rg\n`;
          if (obj.stroke && obj.stroke !== 'none' && obj.strokeWidthMm > 0) stream += `${hexToRgbPdf(obj.stroke)} RG\n${(obj.strokeWidthMm * k).toFixed(2)} w\n`;
          stream += `${(cx - rx).toFixed(3)} ${cy.toFixed(3)} m ${(cx - rx).toFixed(3)} ${(cy + ry * kap).toFixed(3)} ${(cx - rx * kap).toFixed(3)} ${(cy + ry).toFixed(3)} ${cx.toFixed(3)} ${(cy + ry).toFixed(3)} c `;
          stream += `${(cx + rx * kap).toFixed(3)} ${(cy + ry).toFixed(3)} ${(cx + rx).toFixed(3)} ${(cy + ry * kap).toFixed(3)} ${(cx + rx).toFixed(3)} ${cy.toFixed(3)} c `;
          stream += `${(cx + rx).toFixed(3)} ${(cy - ry * kap).toFixed(3)} ${(cx + rx * kap).toFixed(3)} ${(cy - ry).toFixed(3)} ${cx.toFixed(3)} ${(cy - ry).toFixed(3)} c `;
          stream += `${(cx - rx * kap).toFixed(3)} ${(cy - ry).toFixed(3)} ${(cx - rx).toFixed(3)} ${(cy - ry * kap).toFixed(3)} ${(cx - rx).toFixed(3)} ${cy.toFixed(3)} c `;
          stream += (obj.fill !== 'none' && obj.stroke !== 'none' && obj.strokeWidthMm > 0) ? `B\n` : (obj.fill !== 'none' ? `f\n` : `S\n`);
        } else {
          if (obj.fill && obj.fill !== 'none') stream += `${hexToRgbPdf(obj.fill)} rg\n`;
          if (obj.stroke && obj.stroke !== 'none' && obj.strokeWidthMm > 0) stream += `${hexToRgbPdf(obj.stroke)} RG\n${(obj.strokeWidthMm * k).toFixed(2)} w\n`;
          stream += `${xPt.toFixed(3)} ${yBot.toFixed(3)} ${wPt.toFixed(3)} ${hPt.toFixed(3)} re `;
          stream += (obj.fill !== 'none' && obj.stroke !== 'none' && obj.strokeWidthMm > 0) ? `B\n` : (obj.fill !== 'none' ? `f\n` : `S\n`);
        }
        stream += `Q\n`;
      } else if (obj.type === 'qr') {
        const matQr = generateQrMatrix(obj.qrData || 'https://reglet.ru');
        const mw = wPt / matQr.length, mh = hPt / matQr.length;
        stream += `q\n${hexToRgbPdf(obj.fill || '#0F172A')} rg\n`;
        matQr.forEach((row, r) => row.forEach((cell, c) => {
          if (cell) stream += `${(xPt + c * mw).toFixed(3)} ${(yBot + hPt - (r + 1) * mh).toFixed(3)} ${mw.toFixed(3)} ${mh.toFixed(3)} re f\n`;
        }));
        stream += `Q\n`;
      } else if (obj.type === 'text') {
        stream += await convertTextToPdfCurves(obj, dims, fullHpt);
      } else if (obj.type === 'image') {
        const jpg = await extractJpegBytes(obj.src);
        if (jpg) {
          const imObjId = nextId++;
          const imName = `Im${imIdx++}`;
          xObjs.push(`/${imName} ${imObjId} 0 R`);
          startObj(imObjId);
          writeStr(`<< /Type /XObject /Subtype /Image /Width ${jpg.width} /Height ${jpg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.bytes.length} >>\nstream\n`);
          writeBin(jpg.bytes);
          writeStr(`\nendstream\n`);
          endObj();
          stream += `q\n${wPt.toFixed(3)} 0 0 ${hPt.toFixed(3)} ${xPt.toFixed(3)} ${yBot.toFixed(3)} cm\n/${imName} Do\nQ\n`;
        }
      }
    }

    // Клип страницы закончен: метки реза рисуются вне области контента
    stream += `Q\n`;

    // Типографские метки реза (Crop Marks) по углам TrimBox
    const markLen = Math.min(bleedPt * 0.85, 5);
    stream += `q\n0 0 0 RG\n0.25 w\n`;
    // Левый нижний угол реза
    stream += `0 ${bleedPt} m ${markLen} ${bleedPt} l S\n${bleedPt} 0 m ${bleedPt} ${markLen} l S\n`;
    // Правый нижний угол реза
    stream += `${fullWpt - markLen} ${bleedPt} m ${fullWpt} ${bleedPt} l S\n${trimRpt} 0 m ${trimRpt} ${markLen} l S\n`;
    // Левый верхний угол реза
    stream += `0 ${trimTpt} m ${markLen} ${trimTpt} l S\n${bleedPt} ${fullHpt - markLen} m ${bleedPt} ${fullHpt} l S\n`;
    // Правый верхний угол реза
    stream += `${fullWpt - markLen} ${trimTpt} m ${fullWpt} ${trimTpt} l S\n${trimRpt} ${fullHpt - markLen} m ${trimRpt} ${fullHpt} l S\n`;
    stream += `Q\n`;

    const sBytes = new TextEncoder().encode(stream);
    const contId = nextId++;
    startObj(contId);
    writeStr(`<< /Length ${sBytes.length} >>\nstream\n`);
    writeBin(sBytes);
    writeStr(`\nendstream\n`);
    endObj();

    const pId = nextId++;
    pageIds.push(pId);
    const xDict = xObjs.length ? `/XObject << ${xObjs.join(' ')} >>` : '';
    startObj(pId);
    writeStr(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fullWpt} ${fullHpt}] /TrimBox [${bleedPt} ${bleedPt} ${trimRpt} ${trimTpt}] /Resources << /ProcSet [/PDF /Text /ImageC] ${xDict} >> /Contents ${contId} 0 R >>\n`);
    endObj();
  }

  startObj(2);
  writeStr(`<< /Type /Pages /Kids [${pageIds.map(i => `${i} 0 R`).join(' ')}] /Count ${pageIds.length} >>\n`);
  endObj();

  startObj(1);
  writeStr(`<< /Type /Catalog /Pages 2 0 R >>\n`);
  endObj();

  const xrefPos = byteLen;
  writeStr(`xref\n0 ${nextId}\n0000000000 65535 f \n`);
  for (let i = 1; i < nextId; i++) writeStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  writeStr(`trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
}
