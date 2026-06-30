(function(){
  let data = STORE.load();

  // ── Etiquetas amigables ───────────────────────────────────────────────────
  const LABELS = {
    "hero.eyebrow":   "🏷️ Etiqueta superior Hero",
    "hero.title1":    "📝 Título Hero — línea 1",
    "hero.title2":    "✨ Título Hero — línea 2 (acento turquesa)",
    "hero.title3":    "📝 Título Hero — línea 3",
    "hero.desc":      "📄 Descripción Hero",
    "hero.cta":       "🔘 Botón Hero",
    "serv.title1":    "📝 Servicios — Título parte 1",
    "serv.title2":    "✨ Servicios — Título parte 2 (acento)",
    "serv.sub":       "📄 Servicios — Subtítulo",
    "carac.title":    "📝 Características — Título",
    "carac.sub":      "📄 Características — Subtítulo",
    "port.title":     "📝 Portafolio — Título",
    "port.sub":       "📄 Portafolio — Subtítulo",
    "vent.banner":    "📣 Ventajas — Texto banner destacado",
    "vent.bannerSub": "📄 Ventajas — Subtítulo banner",
    "vent.title":     "📝 Ventajas — Título sección",
    "prod.eyebrow":   "🏷️ Productos — Etiqueta superior",
    "prod.title1":    "📝 Productos — Título línea 1",
    "prod.title2":    "✨ Productos — Título línea 2 (acento)",
    "prod.sub":       "📄 Productos — Descripción",
    "foot.about":     "📄 Footer — Descripción empresa",
    "foot.ctaTitle":  "📝 Footer — Título CTA",
    "foot.ctaText":   "📄 Footer — Texto CTA",
    "foot.ctaBtn":    "🔘 Footer — Botón CTA",
    "foot.year":      "📅 Footer — Año copyright",
    "foot.tag":       "🏷️ Footer — Slogan"
  };

  // ── Etiquetas amigables para colores ─────────────────────────────────────
  const COLOR_LABELS = {
    "--color-accent":      "🎨 Color acento principal (turquesa)",
    "--color-accent-dark": "🎨 Color acento oscuro (hover)",
    "--color-bg-primary":  "🖼️ Fondo oscuro principal",
    "--color-bg-light":    "🖼️ Fondo secciones claras",
    "--color-bg-dark":     "🖼️ Fondo secciones muy oscuras",
    "--color-text":        "✏️ Color texto principal",
    "--color-text-muted":  "✏️ Color texto secundario",
    "--color-navbar":      "🖼️ Fondo navbar"
  };

  // ── Etiquetas para fondos de sección ─────────────────────────────────────
  const BG_LABELS = {
    "bg.inicio":         "🏠 Fondo — Sección Hero / Inicio",
    "bg.servicios":      "⚙️ Fondo — Sección Servicios",
    "bg.caracteristicas":"✨ Fondo — Sección Características",
    "bg.portafolio":     "🗂️ Fondo — Sección Portafolio",
    "bg.ventajas":       "⭐ Fondo — Sección Ventajas",
    "bg.productos":      "📦 Fondo — Sección Productos",
    "bg.footer":         "🔻 Fondo — Footer / Contacto"
  };

  // ---------- Tabs nav
  document.querySelectorAll(".admin-nav a").forEach(a=>{
    a.addEventListener("click", e=>{
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      document.querySelectorAll(".admin-nav a").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
      a.classList.add("active");
      document.getElementById(id).classList.add("active");
    });
  });

  function toast(msg){
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"), 1500);
  }
  function save(){ STORE.save(data); toast("Guardado ✓"); }

  // ---------- TEXTS
  const tForm = document.getElementById("texts-form");
  function renderTexts(){
    tForm.innerHTML = Object.keys(data.texts).map(k=>{
      const label = LABELS[k] || k;
      return `<div class="field">
        <label>${label}</label>
        <textarea data-key="${k}">${escapeHtml(data.texts[k])}</textarea>
      </div>`;
    }).join("");
    tForm.querySelectorAll("textarea").forEach(ta=>{
      ta.addEventListener("change", ()=>{ data.texts[ta.dataset.key] = ta.value; save(); });
    });
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

  // ---------- MEDIA (logo + hero)
  const mForm = document.getElementById("media-form");
  async function renderMedia(){
    mForm.innerHTML = "";
    for (const key of data.mediaKeys){
      const wrap = document.createElement("div");
      wrap.className = "media-item";
      const blob = await DB.getMedia(key);
      const isVideo = key.endsWith(".video") || (blob && blob.type && blob.type.startsWith("video"));
      const url = blob ? URL.createObjectURL(blob) : "";
      wrap.innerHTML = `
        <label>${key}</label>
        <div class="preview">${url ? (isVideo
          ? `<video src="${url}" controls muted></video>`
          : `<img src="${url}" />`) : `<span style="color:#9fb2b8;font-size:13px">Sin contenido</span>`}</div>
        <div class="actions">
          <label class="btn small">Subir archivo
            <input type="file" hidden accept="image/*,video/*" data-mkey="${key}" />
          </label>
          <button class="btn small ghost" data-del="${key}">Eliminar</button>
        </div>`;
      mForm.appendChild(wrap);
    }
    mForm.querySelectorAll('input[type="file"]').forEach(inp=>{
      inp.addEventListener("change", async ()=>{
        const f = inp.files[0]; if (!f) return;
        await DB.setMedia(inp.dataset.mkey, f);
        toast("Archivo subido ✓");
        renderMedia();
      });
    });
    mForm.querySelectorAll('[data-del]').forEach(b=>{
      b.addEventListener("click", async ()=>{
        await DB.delMedia(b.dataset.del);
        toast("Eliminado");
        renderMedia();
      });
    });
  }

  // ---------- FONDOS DE SECCIÓN (nuevo)
  const bgForm = document.getElementById("bg-form");
  async function renderBgs(){
    if (!bgForm) return;
    bgForm.innerHTML = "";
    for (const key of (data.bgKeys || [])){
      const wrap = document.createElement("div");
      wrap.className = "media-item";
      const blob = await DB.getMedia(key);
      const url = blob ? URL.createObjectURL(blob) : "";
      const label = BG_LABELS[key] || key;
      wrap.innerHTML = `
        <label>${label}</label>
        <div class="preview" style="height:120px;background:${url ? `url('${url}') center/cover` : "#0b1b22"};border-radius:8px;border:1px solid #1e3a4a;display:flex;align-items:center;justify-content:center;">
          ${!url ? `<span style="color:#9fb2b8;font-size:13px">Sin imagen de fondo</span>` : ""}
        </div>
        <div class="actions">
          <label class="btn small">Subir imagen de fondo
            <input type="file" hidden accept="image/*" data-bgkey="${key}" />
          </label>
          <button class="btn small ghost" data-delbg="${key}">Eliminar fondo</button>
        </div>`;
      bgForm.appendChild(wrap);
    }
    bgForm.querySelectorAll('input[type="file"]').forEach(inp=>{
      inp.addEventListener("change", async ()=>{
        const f = inp.files[0]; if (!f) return;
        await DB.setMedia(inp.dataset.bgkey, f);
        toast("Fondo subido ✓");
        renderBgs();
      });
    });
    bgForm.querySelectorAll('[data-delbg]').forEach(b=>{
      b.addEventListener("click", async ()=>{
        await DB.delMedia(b.dataset.delbg);
        toast("Fondo eliminado");
        renderBgs();
      });
    });
  }

  // ---------- COLORES (nuevo)
  const colorForm = document.getElementById("colors-form");
  function renderColors(){
    if (!colorForm) return;
    if (!data.colors) data.colors = JSON.parse(JSON.stringify(window.DEFAULT_DATA.colors));
    colorForm.innerHTML = `
      <p style="color:#7a9bab;font-size:13px;margin-bottom:16px">
        Los cambios de color se aplican al sitio en tiempo real al hacer clic en "Aplicar colores".
      </p>` +
      Object.entries(data.colors).map(([k, v])=>{
        const label = COLOR_LABELS[k] || k;
        return `<div class="field" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <label style="flex:1;min-width:200px">${label}</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="color" value="${v}" data-ckey="${k}"
              style="width:48px;height:36px;border:none;background:none;cursor:pointer;border-radius:6px;" />
            <input type="text" value="${v}" data-ctkey="${k}"
              style="width:100px;padding:6px 10px;background:#0b1b22;border:1px solid #1e3a4a;color:#e0eaed;border-radius:6px;font-family:monospace;" />
          </div>
        </div>`;
      }).join("") +
      `<div style="margin-top:20px;display:flex;gap:10px;">
        <button id="btn-apply-colors" class="btn">Aplicar colores al sitio</button>
        <button id="btn-reset-colors" class="btn ghost">Restaurar colores por defecto</button>
      </div>`;

    // Sync color picker → text input
    colorForm.querySelectorAll('input[type="color"]').forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const textInp = colorForm.querySelector(`input[data-ctkey="${inp.dataset.ckey}"]`);
        if (textInp) textInp.value = inp.value;
        data.colors[inp.dataset.ckey] = inp.value;
      });
    });
    // Sync text input → color picker
    colorForm.querySelectorAll('input[data-ctkey]').forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const colorInp = colorForm.querySelector(`input[data-ckey="${inp.dataset.ctkey}"]`);
        if (colorInp) colorInp.value = inp.value;
        data.colors[inp.dataset.ctkey] = inp.value;
      });
    });

    document.getElementById("btn-apply-colors").addEventListener("click", ()=>{
      applyColors(data.colors);
      save();
      toast("Colores aplicados ✓");
    });
    document.getElementById("btn-reset-colors").addEventListener("click", ()=>{
      data.colors = JSON.parse(JSON.stringify(window.DEFAULT_DATA.colors));
      save();
      applyColors(data.colors);
      renderColors();
      toast("Colores restaurados");
    });
  }

  function applyColors(colors){
    const root = document.documentElement;
    Object.entries(colors).forEach(([k,v])=> root.style.setProperty(k, v));
  }

  // ---------- LISTS
  const schemas = {
    services:   { title:"services-list",   fields:[{k:"icon",ph:"Icono (emoji)"},{k:"num",ph:"Número (ej. 150 +)"},{k:"name",ph:"Nombre"}] },
    features:   { title:"features-list",   fields:[{k:"tag",ph:"Etiqueta"},{k:"title",ph:"Título"},{k:"img",ph:"URL de imagen",full:true}] },
    portCats:   { title:"portcats-list",   fields:[{k:"key",ph:"clave (ej. web)"},{k:"label",ph:"Etiqueta visible"}], wide:true },
    portItems:  { title:"portitems-list",  fields:[{k:"cat",ph:"Categoría (key)"},{k:"title",ph:"Título"},{k:"img",ph:"URL imagen",full:true}] },
    advantages: { title:"advantages-list", fields:[{k:"icon",ph:"Icono"},{k:"title",ph:"Título"},{k:"desc",ph:"Descripción",full:true}] },
    products:   { title:"products-list",   fields:[{k:"cat",ph:"Categoría"},{k:"title",ph:"Título"},{k:"accent",ph:"Texto destacado"},{k:"bg",ph:"CSS background",full:true}] }
  };

  function renderList(name){
    const s = schemas[name];
    const list = document.getElementById(s.title);
    if(!list) return; // Validación por si algún contenedor no existe en el HTML
    list.innerHTML = data[name].map((item, idx)=>{
      const inputs = s.fields.map(f=>`
        <div class="${f.full?"full":""}">
          <label>${f.ph}</label>
          <input value="${escapeHtml(item[f.k]||"")}" data-name="${name}" data-idx="${idx}" data-field="${f.k}" />
        </div>`).join("");
      return `<div class="card-row ${s.wide?"wide":""}">${inputs}<button class="del" data-del-name="${name}" data-del-idx="${idx}">🗑</button></div>`;
    }).join("");
    list.querySelectorAll("input").forEach(i=>{
      i.addEventListener("change", ()=>{
        data[i.dataset.name][+i.dataset.idx][i.dataset.field] = i.value;
        save();
      });
    });
    list.querySelectorAll("[data-del-name]").forEach(b=>{
      b.addEventListener("click", ()=>{
        if(!confirm("¿Eliminar este elemento?")) return;
        data[b.dataset.delName].splice(+b.dataset.delIdx,1);
        save(); renderList(b.dataset.delName);
      });
    });
  }

  document.querySelectorAll("[data-add]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const name = b.dataset.add;
      const empty = {};
      schemas[name].fields.forEach(f=>empty[f.k]="");
      data[name].push(empty); save(); renderList(name);
    });
  });

  // ── [AGREGADO DE FORMA SEGURA]: GESTIÓN DE ENLACES DE MENÚ DINÁMICO ────────
  /**
   * Genera los "cuadritos nice" del menú actual cargado en la variable central 'data'
   */
  function renderMenuLinks() {
    const listContainer = document.getElementById('menu-links-list');
    if (!listContainer) return;

    // Si 'menuLinks' no existe aún en tu estructura STORE, la inicializamos vacía de forma segura
    if (!data.menuLinks) {
      data.menuLinks = [
        { name: "Inicio", link: "#inicio" },
        { name: "Servicios", link: "#services" },
        { name: "Características", link: "#features" },
        { name: "Portafolio", link: "#portfolio" },
        { name: "Ventajas", link: "#advantages" },
        { name: "Productos", link: "#products" },
        { name: "Contáctanos", link: "#contact" }
      ];
      STORE.save(data);
    }

    // Renderizamos los elementos en formato de tarjetas compactas estéticas
    listContainer.innerHTML = data.menuLinks.map((item, idx) => {
      return `
        <div class="card-row" style="display:flex; align-items:center; justify-content:between; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; gap:16px;">
          <div style="flex:1;">
            <label style="font-size:11px; color:#7a9bab; display:block; margin-bottom:2px;">Nombre de pestaña</label>
            <input type="text" value="${escapeHtml(item.name || '')}" data-menu-idx="${idx}" data-field="name" style="width:100%; padding:6px 10px; background:#0b1b22; border:1px solid #1e3a4a; color:#fff; border-radius:6px;" />
          </div>
          <div style="flex:1;">
            <label style="font-size:11px; color:#7a9bab; display:block; margin-bottom:2px;">Enlace de sección / ID</label>
            <input type="text" value="${escapeHtml(item.link || '')}" data-menu-idx="${idx}" data-field="link" style="width:100%; padding:6px 10px; background:#0b1b22; border:1px solid #1e3a4a; color:#2dd4bf; border-radius:6px;" />
          </div>
          <button class="del" data-del-menu="${idx}" style="background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; align-self:flex-end; height:34px;">🗑</button>
        </div>
      `;
    }).join("");

    // Evento para guardar cambios automáticos al editar los campos de texto
    listContainer.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        const idx = +inp.dataset.menuIdx;
        const field = inp.dataset.field;
        data.menuLinks[idx][field] = inp.value;
        save();
      });
    });

    // Evento para eliminar un enlace del menú
    listContainer.querySelectorAll("[data-del-menu]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!confirm("¿Deseas eliminar este apartado de la navegación?")) return;
        const idx = +btn.dataset.delMenu;
        data.menuLinks.splice(idx, 1);
        save();
        renderMenuLinks();
      });
    });
  }

  // Exponer la función global para que sea llamada por el botón "Añadir al menú" de tu html
  window.addCustomMenuItem = function() {
    const nameInput = document.getElementById('menu-name-input');
    const linkInput = document.getElementById('menu-link-input');
    
    if(!nameInput || !linkInput) return;

    const name = nameInput.value.trim();
    let link = linkInput.value.trim();

    if (!name || !link) {
      alert("Por favor introduce un nombre y un enlace válido.");
      return;
    }

    // Asegurar que use nomenclatura de anclaje si no es un link absoluto
    if(!link.startsWith('#') && !link.startsWith('http') && !link.startsWith('/')) {
      link = '#' + link;
    }

    if (!data.menuLinks) data.menuLinks = [];
    
    data.menuLinks.push({ name: name, link: link });
    save();
    
    nameInput.value = '';
    linkInput.value = '';
    
    renderMenuLinks();
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ---------- Header actions
  document.getElementById("btn-export").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="devioz-content.json"; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("file-import").addEventListener("change", e=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{
      try { data = JSON.parse(r.result); STORE.save(data); renderAll(); toast("Importado ✓"); }
      catch { alert("JSON inválido"); }
    };
    r.readAsText(f);
  });
  document.getElementById("btn-reset").addEventListener("click", async ()=>{
    if(!confirm("Esto restaurará todos los textos, colores y eliminará las imágenes. ¿Continuar?")) return;
    STORE.reset();
    for (const k of await DB.listKeys()) await DB.delMedia(k);
    data = STORE.load();
    renderAll();
    toast("Restaurado");
  });

  function renderAll(){
    renderTexts();
    renderMedia();
    renderBgs();
    renderColors();
    renderMenuLinks(); // <--- Llamado integrado de forma limpia
    if (data.colors) applyColors(data.colors);
    Object.keys(schemas).forEach(renderList);
  }
  renderAll();
})();