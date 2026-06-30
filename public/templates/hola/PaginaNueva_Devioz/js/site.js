(async function(){
  const data = STORE.load();

  // --- COLORES
  if (data.colors) {
    const root = document.documentElement;
    Object.entries(data.colors).forEach(([k,v])=> root.style.setProperty(k, v));
  }

  // ── [SISTEMA DINÁMICO REPARADO: BLOQUEO RADICAL DE CAJA BLANCA] ──────────
  const navContainer = document.getElementById('main-nav-container');

  // Borrado preventivo instantáneo al cargar la web
  const limpiarClones = () => {
    const clones = document.querySelectorAll('#dinamico, #dinamico-nuevo, .dinamico-section');
    clones.forEach(c => c.remove());
  };
  limpiarClones();

  if (navContainer) {
    // Lista de seguridad estricta: Secciones nativas originales de fábrica
    const nombresFijos = ["inicio", "servicios", "características", "caracteristicas", "portafolio", "ventajas", "contáctanos", "contacto"];

    // Menú base estandarizado (sin Productos — se gestiona en otro módulo)
    let menuItems = [
      { name: "Inicio", link: "#inicio" },
      { name: "Servicios", link: "#servicios" },
      { name: "Características", link: "#caracteristicas" },
      { name: "Portafolio", link: "#portafolio" },
      { name: "Ventajas", link: "#ventajas" },
      { name: "Contáctanos", link: "#contacto" }
    ];

    // Si el administrador tiene enlaces, filtramos y reordenamos asegurando IDs correctos
    if (data.menuLinks && data.menuLinks.length > 0) {
      menuItems = data.menuLinks
        .filter(item => item.name.trim().toLowerCase() !== "productos")
        .map(item => {
          const n = item.name.trim().toLowerCase();
          if (n === "inicio") return { name: item.name, link: "#inicio" };
          if (n === "servicios") return { name: item.name, link: "#servicios" };
          if (n === "características" || n === "caracteristicas") return { name: item.name, link: "#caracteristicas" };
          if (n === "portafolio") return { name: item.name, link: "#portafolio" };
          if (n === "ventajas") return { name: item.name, link: "#ventajas" };
          if (n === "contáctanos" || n === "contacto") return { name: item.name, link: "#contacto" };
          return item;
        });
    }

    // Renderizamos los botones limpios
    navContainer.innerHTML = menuItems.map((item, index) => {
      const isActive = index === 0 ? 'active' : '';
      return `<a href="${item.link}" class="nav-link ${isActive}" data-name="${item.name}">${item.name}</a>`;
    }).join("");

    // Controlador definitivo de clics libre de errores de persistencia
    navContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const nombreMenu = link.innerText.trim().toLowerCase();
        const href = link.getAttribute('href');

        // REGLA ABSOLUTA: Si es una sección fija de la plantilla, PROHIBIDO pintar bloques blancos
        if (nombresFijos.includes(nombreMenu)) {
          // Destruimos cualquier residuo por si las dudas
          limpiarClones();

          // Desplazamiento limpio y directo al contenedor original del HTML
          const targetSection = document.querySelector(href);
          if (targetSection) {
            e.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth' });
            navContainer.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        } else {
          // CASO EXCLUSIVO: Solo si es una pestaña NUEVA agregada de verdad en el Administrador
          e.preventDefault();
          limpiarClones();

          const nuevoComodin = document.createElement('section');
          nuevoComodin.id = 'dinamico-nuevo';
          nuevoComodin.style.cssText = "display: flex !important; min-height: 60vh; align-items: center; justify-content: center; background: #ffffff; flex-direction: column; width: 100%; padding: 60px 20px; box-sizing: border-box;";
          
          nuevoComodin.innerHTML = `
            <h2 style="font-size: 3rem; color: #111; font-weight: bold; margin-bottom: 10px; font-family: sans-serif;">${link.dataset.name}</h2>
            <p style="color: #666; font-size: 1.1rem; margin: 5px 0; font-family: sans-serif;">Estamos preparando el contenido de este nuevo apartado con soluciones a tu medida.</p>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px; font-family: sans-serif;">¡Próximamente disponible!</p>
            <a href="#" style="padding: 12px 24px; border: 1px solid #14ccb2; color: #14ccb2; border-radius: 5px; text-decoration: none; font-weight: bold; font-family: sans-serif;">💡 Consultar con un asesor</a>
          `;
          
          document.body.appendChild(nuevoComodin);
          nuevoComodin.scrollIntoView({ behavior: 'smooth' });
          
          navContainer.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });
  }
  // ──────────────────────────────────────────────────────────────────────────

  // --- TEXTOS
  document.querySelectorAll("[data-edit]").forEach(el=>{
    const k = el.getAttribute("data-edit");
    if (data.texts[k] !== undefined) el.textContent = data.texts[k];
  });

  // --- MEDIA (logo, hero.image, hero.video) desde IndexedDB
  const mediaEls = document.querySelectorAll("[data-media]");
  for (const el of mediaEls){
    const key = el.getAttribute("data-media");
    const blob = await DB.getMedia(key);
    if (blob){
      const url = URL.createObjectURL(blob);
      el.src = url;
      if (el.tagName === "VIDEO"){ el.load(); el.play().catch(()=>{}); }
    } else {
      if (key === "hero.image" && el.tagName === "IMG"){
        el.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200";
      }
    }
  }

  // --- FONDOS DE SECCIÓN desde IndexedDB
  const BG_SECTIONS = {
    "bg.inicio":          "#inicio",
    "bg.servicios":       "#servicios",
    "bg.caracteristicas": "#caracteristicas",
    "bg.portafolio":      "#portafolio",
    "bg.ventajas":        "#ventajas",
    "bg.productos":       "#productos",
    "bg.footer":          "#contacto"
  };
  for (const [key, selector] of Object.entries(BG_SECTIONS)){
    const blob = await DB.getMedia(key);
    if (blob){
      const url = URL.createObjectURL(blob);
      const el = document.querySelector(selector);
      if (el){
        el.style.backgroundImage = `url('${url}')`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundBlendMode = "overlay";
      }
    }
  }

  // --- SERVICIOS
  const sg = document.getElementById("services-grid");
  if (sg) {
    sg.innerHTML = data.services.map(s=>{
      const match = (s.num||"").match(/(\d+)/);
      const numVal = match ? parseInt(match[1]) : 0;
      const suffix = (s.num||"").replace(/\d+/,"").trim();
      return `<div class="service-card">
        <div class="icon">${s.icon||"⚙️"}</div>
        <div class="num" data-target="${numVal}" data-suffix="${suffix}">0</div>
        <div class="name">${s.name||""}</div>
      </div>`;
    }).join("");

    const counters = sg.querySelectorAll(".num[data-target]");
    const animateCounter = (el) => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || "";
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(()=>{
        current += step;
        if(current >= target){
          el.textContent = target + " " + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + " " + suffix;
        }
      }, 16);
    };
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ animateCounter(entry.target); observer.unobserve(entry.target); }
      });
    }, {threshold: 0.5});
    counters.forEach(c => observer.observe(c));
  }

  // --- CARACTERÍSTICAS
  const fg = document.getElementById("features-grid");
  if (fg) {
    fg.innerHTML = data.features.map(f=>`
      <div class="feature-card">
        <img src="${f.img||""}" alt="${f.title||""}" loading="lazy" />
        <span class="tag">${f.tag||""}</span>
        <div class="title">${f.title||""}</div>
      </div>`).join("");
  }

  // --- PORTAFOLIO
  const tabs = document.getElementById("port-tabs");
  const grid = document.getElementById("port-grid");
  function renderPort(activeKey){
    if (!tabs || !grid) return;
    tabs.innerHTML = data.portCats.map(c=>{
      const count = c.key==="todos" ? data.portItems.length : data.portItems.filter(i=>i.cat===c.key).length;
      return `<button class="port-tab ${c.key===activeKey?"active":""}" data-k="${c.key}">${c.label} <span class="count">${count}</span></button>`;
    }).join("");
    const items = activeKey==="todos" ? data.portItems : data.portItems.filter(i=>i.cat===activeKey);
    grid.innerHTML = items.map(i=>{
      const cat = data.portCats.find(c=>c.key===i.cat);
      return `<div class="port-card">
        <img src="${i.img||""}" alt="${i.title||""}" loading="lazy" />
        <div class="info"><div class="cat">${cat?cat.label:""}</div><div class="title">${i.title||""}</div></div>
      </div>`;
    }).join("");
    tabs.querySelectorAll(".port-tab").forEach(t=>{ t.onclick = ()=> renderPort(t.dataset.k); });
  }
  if (tabs && grid) renderPort("todos");

  // --- VENTAJAS
  const ag = document.getElementById("advantages-grid");
  if (ag) {
    ag.innerHTML = data.advantages.map(a=>`
      <div class="adv-card">
        <div class="icon">${a.icon||"⭐"}</div>
        <h4>${a.title||""}</h4>
        <p>${a.desc||""}</p>
      </div>`).join("");
  }

  // --- PRODUCTOS
  const pg = document.getElementById("products-grid");
  if (pg) {
    pg.innerHTML = data.products.map(p=>`
      <div class="prod-card" style="background:${p.bg||"#1a2e36"}">
        <div>
          <div class="cat">${p.cat||""}</div>
          <h3>${p.title||""} <div class="accent-line">${p.accent||""}</div></h3>
        </div>
        <a href="#" class="btn">Ver paquetes →</a>
      </div>`).join("");
  }

  // --- DETECTOR DE SCROLL EXCLUSIVO PARA SECCIONES REALES
  window.addEventListener("scroll", () => {
    const links = document.querySelectorAll(".nav-link");
    const y = window.scrollY + (window.innerHeight / 3); 
    
    const seccionesReales = ['#inicio', '#servicios', '#caracteristicas', '#portafolio', '#ventajas', '#contacto'];

    seccionesReales.forEach(selector => {
      const s = document.querySelector(selector);
      if (s) {
        if (s.offsetTop <= y && s.offsetTop + s.offsetHeight > y) {
          links.forEach(l => {
            l.classList.toggle("active", l.getAttribute("href") === selector);
          });
        }
      }
    });
  });

  // ── REVEAL ON SCROLL ─────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    '.section-title, .section-sub, .service-card, .feature-card, .port-card, .adv-card, .hero-text, .hero-media, .banner-cta'
  );
  revealEls.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = `${(i % 8) * 60}ms`; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // ── VIDEO HERO: autoplay + controles (play/pause, mute, timeline) ────────
  const video = document.getElementById('video-hero');
  const overlay = document.getElementById('video-overlay');
  const mainPlay = document.getElementById('main-play');
  const mainPlayIcon = document.getElementById('main-play-icon');
  const playBtn = document.getElementById('play-btn');
  const playBtnIcon = document.getElementById('play-btn-icon');
  const muteBtn = document.getElementById('mute-btn');
  const muteBtnIcon = document.getElementById('mute-btn-icon');
  const timeline = document.getElementById('timeline-container');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');

  if (video && overlay) {
    const ICON_PLAY  = '<path d="M8 5v14l11-7z"/>';
    const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
    const ICON_VOL   = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
    const ICON_MUTE  = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

    const fmt = (s) => { if(!isFinite(s)) return "00:00"; const m=Math.floor(s/60), x=Math.floor(s%60); return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`; };
    const syncIcons = () => {
      const playing = !video.paused && !video.ended;
      if (mainPlayIcon) mainPlayIcon.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      if (playBtnIcon)  playBtnIcon.innerHTML  = playing ? ICON_PAUSE : ICON_PLAY;
      overlay.classList.toggle('is-playing', playing);
      if (muteBtnIcon)  muteBtnIcon.innerHTML  = video.muted ? ICON_MUTE : ICON_VOL;
    };
    const toggle = () => { if (video.paused) video.play().catch(()=>{}); else video.pause(); };

    if (mainPlay) mainPlay.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(); });
    if (playBtn)  playBtn.addEventListener('click',  (e)=>{ e.stopPropagation(); toggle(); });
    video.addEventListener('click', toggle);

    if (muteBtn) muteBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 0.8;
      syncIcons();
    });

    video.addEventListener('play', syncIcons);
    video.addEventListener('pause', syncIcons);
    video.addEventListener('volumechange', syncIcons);
    video.addEventListener('loadedmetadata', ()=>{ if (totalDurationEl) totalDurationEl.textContent = fmt(video.duration); });
    video.addEventListener('timeupdate', ()=>{
      if (currentTimeEl) currentTimeEl.textContent = fmt(video.currentTime);
      if (progressBar && video.duration) progressBar.style.width = `${(video.currentTime/video.duration)*100}%`;
    });
    if (timeline) timeline.addEventListener('click', (e)=>{
      const rect = timeline.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (video.duration) video.currentTime = pct * video.duration;
    });

    // Autoplay garantizado (muted)
    const tryAutoplay = () => video.play().catch(()=>{});
    if (video.readyState >= 2) tryAutoplay(); else video.addEventListener('loadeddata', tryAutoplay, { once: true });
    syncIcons();
  }

  window.scrollTo(0, 0);
})();

