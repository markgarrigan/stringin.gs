(function() {
  var html = document.documentElement,
      supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
  if(supportsTouch) {
    html.className += ' touch';
  } else {
    html.className += ' no-touch';
  }
})();
