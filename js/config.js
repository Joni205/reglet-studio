/**
 * Конфигурация продукции, материалов и тарифов типографии «Реглет».
 */
const REGLET_CONFIG = {
  mmToPt: 2.834645669, // 72 pt / 25.4 mm
  maxUploadBytes: 25 * 1024 * 1024,

  products: {
    business_card: {
      id: 'business_card',
      name: 'Визитки',
      bleedMm: 2,
      safeMarginMm: 3,
      minDpi: 300,
      allowTwoSides: true,
      allowFinishing: true,
      allowOrientation: true,
      baseSetup: 300,
      unitPrice: 6.5,
      qtyPresets: [100, 250, 500, 1000, 2500, 5000],
      sizes: [
        { id: '90x50', label: '90 × 50 мм (Стандарт РФ)', widthMm: 90, heightMm: 50, priceMult: 1.0 },
        { id: '85x55', label: '85 × 55 мм (Евростандарт)', widthMm: 85, heightMm: 55, priceMult: 1.05 }
      ],
      materials: ['coated_300', 'touch_cover', 'linen_white', 'cardboard_350']
    },
    flyer: {
      id: 'flyer',
      name: 'Листовки / Флаеры',
      bleedMm: 2,
      safeMarginMm: 4,
      minDpi: 300,
      allowTwoSides: true,
      allowFinishing: true,
      allowOrientation: true,
      baseSetup: 450,
      unitPrice: 11.0,
      qtyPresets: [100, 250, 500, 1000, 2500, 5000],
      sizes: [
        { id: 'A6', label: 'А6 (105 × 148 мм)', widthMm: 148, heightMm: 105, priceMult: 1.0 },
        { id: 'Euro', label: 'Евро (99 × 210 мм)', widthMm: 210, heightMm: 99, priceMult: 1.25 },
        { id: 'A5', label: 'А5 (148 × 210 мм)', widthMm: 210, heightMm: 148, priceMult: 1.7 }
      ],
      materials: ['coated_300', 'cardboard_350']
    },
    sticker: {
      id: 'sticker',
      name: 'Наклейки',
      bleedMm: 2,
      safeMarginMm: 3,
      minDpi: 300,
      allowTwoSides: false,
      allowFinishing: true,
      allowOrientation: true,
      baseSetup: 350,
      unitPrice: 8.5,
      qtyPresets: [100, 250, 500, 1000, 2500, 5000],
      sizes: [
        { id: '50x50', label: '50 × 50 мм (Квадрат)', widthMm: 50, heightMm: 50, priceMult: 0.85 },
        { id: '90x50', label: '90 × 50 мм (Прямоугольник)', widthMm: 90, heightMm: 50, priceMult: 1.0 },
        { id: '100x70', label: '100 × 70 мм (Крупная)', widthMm: 100, heightMm: 70, priceMult: 1.35 }
      ],
      materials: ['sticker_film', 'coated_300']
    },
    mug_latte: {
      id: 'mug_latte',
      name: 'Кружка латте',
      bleedMm: 2,
      safeMarginMm: 4,
      minDpi: 150,
      allowTwoSides: false,
      allowFinishing: false,
      allowOrientation: false,
      baseSetup: 250,
      unitPrice: 480,
      qtyPresets: [1, 5, 10, 30, 50, 100],
      sizes: [
        { id: 'latte_300', label: '300 мл конус (190 × 90 мм)', widthMm: 190, heightMm: 90, priceMult: 1.0 },
        { id: 'latte_450', label: '450 мл высокая (210 × 125 мм)', widthMm: 210, heightMm: 125, priceMult: 1.25 }
      ],
      materials: ['ceramic_latte']
    }
  },

  materials: {
    coated_300: { id: 'coated_300', name: 'Мелованная 300 г/м²', cssClass: 'tex-coated-300', pdfBgHex: '#FFFFFF', priceAdd: 0, allowLam: true, allowFoil: true },
    touch_cover: { id: 'touch_cover', name: 'Дизайнерская Touch Cover', cssClass: 'tex-touch-cover', pdfBgHex: '#F3EFE6', priceAdd: 7.5, allowLam: false, allowFoil: true },
    linen_white: { id: 'linen_white', name: 'Лён белый 280 г/м²', cssClass: 'tex-linen', pdfBgHex: '#FCFBF8', priceAdd: 4.5, allowLam: false, allowFoil: true },
    cardboard_350: { id: 'cardboard_350', name: 'Картон 350 г/м²', cssClass: 'tex-cardboard-350', pdfBgHex: '#F8FAFC', priceAdd: 2.0, allowLam: true, allowFoil: true },
    sticker_film: { id: 'sticker_film', name: 'Самоклеящаяся плёнка', cssClass: 'tex-sticker-film', pdfBgHex: '#FFFFFF', priceAdd: 2.5, allowLam: true, allowFoil: false },
    ceramic_latte: { id: 'ceramic_latte', name: 'Керамика для кружки латте', cssClass: 'tex-ceramic', pdfBgHex: '#FFFFFF', priceAdd: 0, allowLam: false, allowFoil: false }
  },

  finishingPrices: {
    lamination: { none: 0, matte: 2.0, gloss: 1.8, softtouch: 4.5 },
    foil: { none: 0, gold: 6.0, silver: 6.0 }
  },

  discounts: [
    { minQty: 5000, mult: 0.48 },
    { minQty: 2500, mult: 0.55 },
    { minQty: 1000, mult: 0.62 },
    { minQty: 500,  mult: 0.72 },
    { minQty: 250,  mult: 0.82 },
    { minQty: 100,  mult: 0.92 },
    { minQty: 1,    mult: 1.00 }
  ],

  fontUrls: {
    'Inter-Regular': 'assets/fonts/Inter-Regular.ttf',
    'Inter-Bold': 'assets/fonts/Inter-Bold.ttf',
    'Inter-Italic': 'assets/fonts/Inter-Italic.ttf',
    'Inter-BoldItalic': 'assets/fonts/Inter-BoldItalic.ttf',
    'Montserrat-Regular': 'assets/fonts/Montserrat-Regular.ttf',
    'Montserrat-Bold': 'assets/fonts/Montserrat-Bold.ttf',
    'Montserrat-Italic': 'assets/fonts/Montserrat-Italic.ttf',
    'Montserrat-BoldItalic': 'assets/fonts/Montserrat-BoldItalic.ttf',
    'PlayfairDisplay-Regular': 'assets/fonts/PlayfairDisplay-Regular.ttf',
    'PlayfairDisplay-Bold': 'assets/fonts/PlayfairDisplay-Bold.ttf',
    'PlayfairDisplay-Italic': 'assets/fonts/PlayfairDisplay-Italic.ttf',
    'PlayfairDisplay-BoldItalic': 'assets/fonts/PlayfairDisplay-BoldItalic.ttf',
    'RobotoMono-Regular': 'assets/fonts/RobotoMono-Regular.ttf',
    'RobotoMono-Bold': 'assets/fonts/RobotoMono-Bold.ttf',
    'RobotoMono-Italic': 'assets/fonts/RobotoMono-Italic.ttf',
    'RobotoMono-BoldItalic': 'assets/fonts/RobotoMono-BoldItalic.ttf'
  }
};
