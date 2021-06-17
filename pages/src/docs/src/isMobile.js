var isMobile =
  window.matchMedia && window.matchMedia('(max-device-width: 680px)');
module.exports = false && !!(isMobile && isMobile.matches);
