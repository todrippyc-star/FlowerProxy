/* Flower-matched color palettes for CaydenProxy. Preferences stay on this device. */
(() => {
  'use strict';
  const KEY = 'cp-floral-theme-v1';
  const themes = [
    {id:'daisy-cream', name:'Daisy Cream', flower:'🌼', colorLabel:'Cream + sunny yellow', description:'Warm paper, butter-yellow petals, and soft garden greens.', colors:{bg:'#fff8e9',panel:'#fffdf7',panel2:'#fff1d6',ink:'#493628',muted:'#7f6a57',line:'#eadbc2',yellow:'#ffd54f',coral:'#e98b9c',green:'#6bbf59',blue:'#74c8e9',brown:'#6b4f3b',accent:'#d69a29',focus:'#147ab6'}},
    {id:'sunflower-gold', name:'Sunflower Gold', flower:'🌻', colorLabel:'Gold + honey', description:'A sunny, high-energy palette for bright game sessions.', colors:{bg:'#fff5cf',panel:'#fffbe8',panel2:'#ffeb9b',ink:'#48331c',muted:'#7c5e32',line:'#ead18a',yellow:'#ffc928',coral:'#f18a63',green:'#65a94b',blue:'#5fb8cf',brown:'#6d4728',accent:'#a76b00',focus:'#086b9f'}},
    {id:'cherry-blossom', name:'Cherry Blossom', flower:'🌸', colorLabel:'Petal pink + blush', description:'Blush backgrounds, rosy buttons, and calm green details.', colors:{bg:'#fff0f4',panel:'#fffafd',panel2:'#ffe0e9',ink:'#512c3c',muted:'#815a6b',line:'#efc7d5',yellow:'#ffd875',coral:'#f17d9a',green:'#69a879',blue:'#8dcde2',brown:'#704557',accent:'#cf5b83',focus:'#176b9c'}},
    {id:'rose-garden', name:'Rose Garden', flower:'🌹', colorLabel:'Rose + coral', description:'A bolder rosy palette with warm coral and leafy accents.', colors:{bg:'#fff0eb',panel:'#fffaf7',panel2:'#ffdcd3',ink:'#4e2b2b',muted:'#825b55',line:'#edc3b9',yellow:'#ffd36e',coral:'#ed6b73',green:'#5c9d68',blue:'#7fc4d6',brown:'#6f4640',accent:'#c94f61',focus:'#155f90'}},
    {id:'lavender-haze', name:'Lavender Haze', flower:'🪻', colorLabel:'Lilac + violet', description:'Soft purple panels and cool, dreamy accents.', colors:{bg:'#f7f1ff',panel:'#fffbff',panel2:'#eae0ff',ink:'#3d3156',muted:'#716483',line:'#d9c9f0',yellow:'#f8d777',coral:'#e99bb7',green:'#7aae8d',blue:'#8dbce9',brown:'#665078',accent:'#8762c6',focus:'#315fc0'}},
    {id:'bluebell-sky', name:'Bluebell Sky', flower:'🪻', colorLabel:'Sky blue + indigo', description:'Fresh bluebell color with cool clouds and gentle leafy green.', colors:{bg:'#edf8ff',panel:'#fbfeff',panel2:'#d9efff',ink:'#243e55',muted:'#5e788c',line:'#c1dfee',yellow:'#ffe083',coral:'#ee91a6',green:'#65a878',blue:'#5bb8eb',brown:'#4c6271',accent:'#278ac1',focus:'#124c98'}},
    {id:'clover-meadow', name:'Clover Meadow', flower:'🍀', colorLabel:'Meadow green + mint', description:'Leafy greens and mint for a light, nature-first look.', colors:{bg:'#f0faed',panel:'#fcfff9',panel2:'#ddf1d5',ink:'#2f4931',muted:'#607a61',line:'#c7e1c1',yellow:'#f6d86c',coral:'#ed9a98',green:'#4eaa65',blue:'#82cbd8',brown:'#4d674e',accent:'#36874a',focus:'#126b9e'}},
    {id:'iris-twilight', name:'Iris Twilight', flower:'💜', colorLabel:'Deep violet + moonlight', description:'A dark purple garden for low-light play. High contrast remains a separate override.', colors:{bg:'#211c35',panel:'#302a49',panel2:'#3c3457',ink:'#fff5e8',muted:'#cbbddd',line:'#5b4e76',yellow:'#f7ce73',coral:'#ff91b0',green:'#9bdd92',blue:'#83d4f3',brown:'#e3b79d',accent:'#ffcf77',focus:'#8ee7ff'}}
  ];
  const byId = new Map(themes.map(theme => [theme.id, theme]));
  let activeId = 'daisy-cream';
  try { const stored = localStorage.getItem(KEY); if (byId.has(stored)) activeId = stored; } catch (_) {}
  function apply(id, options = {}) {
    if (!byId.has(id)) return false;
    activeId = id;
    document.body.dataset.floralTheme = id;
    document.body.classList.toggle('twilight', id === 'iris-twilight');
    try { localStorage.setItem(KEY, id); sessionStorage.setItem('cp-theme', id === 'iris-twilight' ? 'twilight' : 'day'); } catch (_) {}
    if (window.CaydenProxyMainCatalog?.setTheme) window.CaydenProxyMainCatalog.setTheme(id === 'iris-twilight' ? 'twilight' : 'day');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = byId.get(id).colors.bg;
    if (options.clearBackground !== false) {
      if (window.CaydenProxyMainCatalog?.resetBackground) window.CaydenProxyMainCatalog.resetBackground();
      else {
        try { sessionStorage.removeItem('cp-bg'); } catch (_) {}
        document.body.style.removeProperty('--bg');
      }
    }
    if (meta) meta.content = byId.get(id).colors.bg;
    if (window.CaydenProxyMainCatalog?.updateThemeControls) window.CaydenProxyMainCatalog.updateThemeControls();
    return true;
  }
  window.CaydenFloralThemes = { themes, apply, get currentId(){return activeId;}, get current(){return byId.get(activeId);} };
  apply(activeId, {clearBackground:false});
})();
