
window.dojoConfig = {
  isDebug: true,
  async: true,
  deps: ['app/main'],
  packages: [{
    name: 'app',
    location: location.pathname.replace(/\/[^\/]+$/, '') + 'app'
  }]
};
