/**
 * Библиотека готовых двусторонних шаблонов визиток (6 шаблонов в 1 клик).
 */
const BUSINESS_CARD_TEMPLATES = [
  {
    id: 'tpl_corp',
    title: '1. Строгий корпоративный',
    badge: 'Хит продаж',
    accent: '#DC2626',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'rect', name: 'Красная полоса слева', xMm: -2, yMm: -2, widthMm: 8, heightMm: 54, rotation: 0, fill: '#DC2626', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Компания', text: c.toUpperCase(), xMm: 12, yMm: 8, widthMm: 72, heightMm: 9, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 12, bold: true, italic: false, align: 'left', color: '#0F172A' },
        { type: 'text', name: 'Сотрудник', text: p, xMm: 12, yMm: 21, widthMm: 72, heightMm: 8, rotation: 0, fontFamily: 'Inter', fontSizePt: 10, bold: true, italic: false, align: 'left', color: '#1E293B' },
        { type: 'text', name: 'Контакты', text: ph, xMm: 12, yMm: 36, widthMm: 72, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 8, bold: false, italic: false, align: 'left', color: '#475569' }
      ],
      back: [
        { type: 'shape', shapeKind: 'rect', name: 'Тёмный фон оборота', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#0F172A', stroke: 'none', strokeWidthMm: 0 },
        { type: 'qr', name: 'QR-код', qrData: 'https://reglet.ru', xMm: 36, yMm: 10, widthMm: 18, heightMm: 18, rotation: 0, fill: '#FFFFFF' },
        { type: 'text', name: 'Слоган', text: c, xMm: 10, yMm: 33, widthMm: 70, heightMm: 8, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 9, bold: true, italic: false, align: 'center', color: '#F8FAFC' }
      ]
    })
  },
  {
    id: 'tpl_minimal',
    title: '2. Чистый минимализм',
    badge: 'Дизайнерский',
    accent: '#0F172A',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'frame', name: 'Тонкая рамка', xMm: 4, yMm: 4, widthMm: 82, heightMm: 42, rotation: 0, fill: 'none', stroke: '#0F172A', strokeWidthMm: 0.4 },
        { type: 'text', name: 'Имя', text: p, xMm: 10, yMm: 13, widthMm: 70, heightMm: 9, rotation: 0, fontFamily: 'Inter', fontSizePt: 12, bold: true, italic: false, align: 'center', color: '#0F172A' },
        { type: 'shape', shapeKind: 'line', name: 'Разделитель', xMm: 32, yMm: 23.5, widthMm: 26, heightMm: 2, rotation: 0, fill: '#0F172A', stroke: '#0F172A', strokeWidthMm: 0.4 },
        { type: 'text', name: 'Контакты', text: ph, xMm: 10, yMm: 28, widthMm: 70, heightMm: 8, rotation: 0, fontFamily: 'Inter', fontSizePt: 8, bold: false, italic: false, align: 'center', color: '#475569' }
      ],
      back: [
        { type: 'text', name: 'Логотип текстом', text: c.toUpperCase(), xMm: 10, yMm: 20, widthMm: 70, heightMm: 10, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 13, bold: true, italic: false, align: 'center', color: '#0F172A' }
      ]
    })
  },
  {
    id: 'tpl_law',
    title: '3. Юрист / Финансы',
    badge: 'Под фольгу',
    accent: '#B45309',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'rect', name: 'Графитовый фон', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#1E293B', stroke: 'none', strokeWidthMm: 0 },
        { type: 'shape', shapeKind: 'frame', name: 'Золотая рамка', xMm: 4, yMm: 4, widthMm: 82, heightMm: 42, rotation: 0, fill: 'none', stroke: '#D4AF37', strokeWidthMm: 0.5 },
        { type: 'text', name: 'Компания', text: c, xMm: 8, yMm: 9, widthMm: 74, heightMm: 8, rotation: 0, fontFamily: 'Playfair Display', fontSizePt: 11, bold: true, italic: false, align: 'center', color: '#FDE68A', isFoil: true },
        { type: 'text', name: 'ФИО', text: p, xMm: 8, yMm: 21, widthMm: 74, heightMm: 8, rotation: 0, fontFamily: 'Inter', fontSizePt: 10, bold: false, italic: false, align: 'center', color: '#FFFFFF' },
        { type: 'text', name: 'Телефон', text: ph, xMm: 8, yMm: 34, widthMm: 74, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 8, bold: false, italic: false, align: 'center', color: '#CBD5E1' }
      ],
      back: [
        { type: 'shape', shapeKind: 'rect', name: 'Фон оборота', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#0F172A', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Монограмма', text: 'КОНСАЛТИНГ И ПРАВО', xMm: 10, yMm: 21, widthMm: 70, heightMm: 8, rotation: 0, fontFamily: 'Playfair Display', fontSizePt: 10, bold: true, italic: false, align: 'center', color: '#FDE68A', isFoil: true }
      ]
    })
  },
  {
    id: 'tpl_beauty',
    title: '4. Салон / Бьюти-студия',
    badge: 'Нежный',
    accent: '#BE185D',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'rect', name: 'Пудровый фон', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#FDF2F8', stroke: 'none', strokeWidthMm: 0 },
        { type: 'shape', shapeKind: 'circle', name: 'Декор круг', xMm: 62, yMm: -8, widthMm: 34, heightMm: 34, rotation: 0, fill: '#FBCFE8', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Студия', text: c, xMm: 8, yMm: 10, widthMm: 65, heightMm: 10, rotation: 0, fontFamily: 'Playfair Display', fontSizePt: 13, bold: true, italic: true, align: 'left', color: '#831843' },
        { type: 'text', name: 'Мастер', text: p, xMm: 8, yMm: 23, widthMm: 65, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 9, bold: true, italic: false, align: 'left', color: '#9D174D' },
        { type: 'text', name: 'Запись', text: ph, xMm: 8, yMm: 36, widthMm: 74, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 8, bold: false, italic: false, align: 'left', color: '#475569' }
      ],
      back: [
        { type: 'shape', shapeKind: 'rect', name: 'Фон оборота', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#FCE7F3', stroke: 'none', strokeWidthMm: 0 },
        { type: 'qr', name: 'Онлайн-запись', qrData: 'https://reglet.ru', xMm: 36, yMm: 11, widthMm: 18, heightMm: 18, rotation: 0, fill: '#831843' },
        { type: 'text', name: 'Подпись', text: 'Онлайн-запись и портфолио', xMm: 10, yMm: 33, widthMm: 70, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 8, bold: true, italic: false, align: 'center', color: '#831843' }
      ]
    })
  },
  {
    id: 'tpl_auto',
    title: '5. Автосервис / Техника',
    badge: 'Контраст',
    accent: '#EA580C',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'rect', name: 'Верхняя плашка', xMm: -2, yMm: -2, widthMm: 94, heightMm: 18, rotation: 0, fill: '#18181B', stroke: 'none', strokeWidthMm: 0 },
        { type: 'shape', shapeKind: 'rect', name: 'Оранжевый акцент', xMm: -2, yMm: 16, widthMm: 94, heightMm: 2.5, rotation: 0, fill: '#EA580C', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Сервис', text: c.toUpperCase(), xMm: 6, yMm: 5, widthMm: 78, heightMm: 8, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 11, bold: true, italic: false, align: 'left', color: '#FFFFFF' },
        { type: 'text', name: 'Мастер', text: p, xMm: 6, yMm: 23, widthMm: 78, heightMm: 8, rotation: 0, fontFamily: 'Inter', fontSizePt: 10, bold: true, italic: false, align: 'left', color: '#18181B' },
        { type: 'text', name: 'Телефон', text: ph, xMm: 6, yMm: 36, widthMm: 78, heightMm: 7, rotation: 0, fontFamily: 'Roboto Mono', fontSizePt: 8.5, bold: true, italic: false, align: 'left', color: '#EA580C' }
      ],
      back: [
        { type: 'shape', shapeKind: 'rect', name: 'Тёмный оборот', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#18181B', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Услуги', text: 'ДИАГНОСТИКА • РЕМОНТ • ЗАПЧАСТИ', xMm: 8, yMm: 21, widthMm: 74, heightMm: 8, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 8.5, bold: true, italic: false, align: 'center', color: '#EA580C' }
      ]
    })
  },
  {
    id: 'tpl_it',
    title: '6. IT / Веб-студия / Дизайн',
    badge: 'Современный',
    accent: '#0284C7',
    build: (c, p, ph) => ({
      front: [
        { type: 'shape', shapeKind: 'rect', name: 'Синий блок', xMm: 56, yMm: -2, widthMm: 36, heightMm: 54, rotation: 0, fill: '#0284C7', stroke: 'none', strokeWidthMm: 0 },
        { type: 'qr', name: 'QR визитка', qrData: 'https://reglet.ru', xMm: 64, yMm: 15, widthMm: 20, heightMm: 20, rotation: 0, fill: '#FFFFFF' },
        { type: 'text', name: 'Студия', text: c, xMm: 6, yMm: 9, widthMm: 48, heightMm: 9, rotation: 0, fontFamily: 'Montserrat', fontSizePt: 11, bold: true, italic: false, align: 'left', color: '#0F172A' },
        { type: 'text', name: 'Специалист', text: p, xMm: 6, yMm: 21, widthMm: 48, heightMm: 8, rotation: 0, fontFamily: 'Inter', fontSizePt: 9, bold: false, italic: false, align: 'left', color: '#334155' },
        { type: 'text', name: 'Контакты', text: ph, xMm: 6, yMm: 36, widthMm: 48, heightMm: 7, rotation: 0, fontFamily: 'Inter', fontSizePt: 7.5, bold: true, italic: false, align: 'left', color: '#0284C7' }
      ],
      back: [
        { type: 'shape', shapeKind: 'rect', name: 'Синий оборот', xMm: -2, yMm: -2, widthMm: 94, heightMm: 54, rotation: 0, fill: '#0284C7', stroke: 'none', strokeWidthMm: 0 },
        { type: 'text', name: 'Слоган IT', text: 'DIGITAL & PRINT SOLUTIONS', xMm: 8, yMm: 21, widthMm: 74, heightMm: 8, rotation: 0, fontFamily: 'Roboto Mono', fontSizePt: 10, bold: true, italic: false, align: 'center', color: '#FFFFFF' }
      ]
    })
  }
];
