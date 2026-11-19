/**
 * Точка входа: первичная отрисовка, стартовый шаблон и прогрев шрифтов.
 */
document.addEventListener('DOMContentLoaded', function () {
  renderTemplatesGallery();
  bindAllEvents();
  // Применяем стартовый корпоративный шаблон визитки при запуске
  applyBusinessCardTemplate('tpl_corp');
  loadVectorFont('Inter', false);
  loadVectorFont('Inter', true);
  loadVectorFont('Montserrat', true);
  loadVectorFont('Playfair Display', false);
  loadVectorFont('Playfair Display', true);
  loadVectorFont('Playfair Display', true, true);
  loadVectorFont('Roboto Mono', true);
});
