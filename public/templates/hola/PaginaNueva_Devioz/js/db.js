/* IndexedDB wrapper for media (images / videos) blobs + background images.
   localStorage stores texts, structured lists, colors and bg config. */
window.DB = (function(){
  const DB_NAME = "deviozDB", STORE = "media", VERSION = 1;
  function open(){
    return new Promise((res, rej)=>{
      const r = indexedDB.open(DB_NAME, VERSION);
      r.onupgradeneeded = ()=>{ r.result.createObjectStore(STORE); };
      r.onsuccess = ()=> res(r.result);
      r.onerror = ()=> rej(r.error);
    });
  }
  async function setMedia(key, blob){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = ()=>res(true);
      tx.onerror = ()=>rej(tx.error);
    });
  }
  async function getMedia(key){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = ()=> res(r.result || null);
      r.onerror = ()=> rej(r.error);
    });
  }
  async function delMedia(key){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = ()=>res(true);
      tx.onerror = ()=>rej(tx.error);
    });
  }
  async function listKeys(){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).getAllKeys();
      r.onsuccess = ()=> res(r.result || []);
      r.onerror = ()=> rej(r.error);
    });
  }
  return { setMedia, getMedia, delMedia, listKeys };
})();

window.STORE = {
  _migrate(obj) {
    if (!obj || !obj.texts) return obj;
    const map = {
      "inicio.subtitulo":    "hero.eyebrow",
      "inicio.titulo1":      "hero.title1",
      "inicio.titulo2":      "hero.title2",
      "inicio.titulo3":      "hero.title3",
      "inicio.descripcion":  "hero.desc",
      "inicio.boton":        "hero.cta",
      "servicios.titulo1":   "serv.title1",
      "servicios.titulo2":   "serv.title2",
      "servicios.subtitulo": "serv.sub",
      "caracteristicas.titulo":    "carac.title",
      "caracteristicas.subtitulo": "carac.sub",
      "portafolio.titulo":   "port.title",
      "portafolio.subtitulo":"port.sub",
      "ventajas.banner":     "vent.banner",
      "ventajas.bannerSub":  "vent.bannerSub",
      "ventajas.titulo":     "vent.title",
      "productos.subtitulo": "prod.eyebrow",
      "productos.titulo1":   "prod.title1",
      "productos.titulo2":   "prod.title2",
      "productos.descripcion":"prod.sub",
      "footer.descripcion":  "foot.about",
      "footer.cta.titulo":   "foot.ctaTitle",
      "footer.cta.texto":    "foot.ctaText",
      "footer.cta.boton":    "foot.ctaBtn",
      "footer.año":          "foot.year",
      "footer.slogan":       "foot.tag"
    };
    const newTexts = {};
    for (const [k, v] of Object.entries(obj.texts)) {
      const newKey = map[k] || k;
      newTexts[newKey] = v;
    }
    obj.texts = newTexts;
    return obj;
  },

  load(){
    try {
      const raw = localStorage.getItem("devioz.content");
      if (!raw) return JSON.parse(JSON.stringify(window.DEFAULT_DATA));
      let obj = JSON.parse(raw);
      obj = this._migrate(obj);
      const def = JSON.parse(JSON.stringify(window.DEFAULT_DATA));
      const merged = Object.assign(def, obj);
      merged.texts = Object.assign(
        JSON.parse(JSON.stringify(window.DEFAULT_DATA.texts)),
        obj.texts
      );
      merged.colors = Object.assign(
        JSON.parse(JSON.stringify(window.DEFAULT_DATA.colors || {})),
        obj.colors || {}
      );
      merged.bgKeys = window.DEFAULT_DATA.bgKeys || [];
      return merged;
    } catch { return JSON.parse(JSON.stringify(window.DEFAULT_DATA)); }
  },
  save(data){ localStorage.setItem("devioz.content", JSON.stringify(data)); },
  reset(){ localStorage.removeItem("devioz.content"); }
};