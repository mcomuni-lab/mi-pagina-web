/* Default content. Editable from admin.html. */
window.DEFAULT_DATA = {
  texts: {
    "hero.eyebrow":   "DEVIOZ - SOLUCIONES TI",
    "hero.title1":    "Liderando la",
    "hero.title2":    "Transformación",
    "hero.title3":    "Digital",
    "hero.desc":      "Creando el Futuro Digital: Servicios Integrales de Software, IoT, Ciberseguridad, Diseño, Multimedia, Marketing y Más.",
    "hero.cta":       "#SOFTWARE",
    "serv.title1":    "Nuestros servicios son",
    "serv.title2":    "Personalizables",
    "serv.sub":       "Descubre soluciones innovadoras diseñadas para potenciar tu negocio.",
    "carac.title":    "Características",
    "carac.sub":      "Frameworks modernos te ofrecen múltiples opciones personalizables.",
    "port.title":     "Portafolio Devioz",
    "port.sub":       "Selecciona una categoría para explorar nuestros proyectos.",
    "vent.banner":    "Devioz es la solución flexible que necesitas para impulsar tu negocio.",
    "vent.bannerSub": "Proporciona una amplia gama de elementos para crear soluciones a medida.",
    "vent.title":     "Ventajas de usar Devioz",
    "prod.eyebrow":   "● SERVICIOS DIGITALES DEVIOZ",
    "prod.title1":    "Soluciones Digitales",
    "prod.title2":    "a tu Medida",
    "prod.sub":       "Diseño, desarrollo, IA y más. Paquetes listos para escalar tu negocio.",
    "foot.about":     "Soluciones integrales en Gestión de Proyectos, Desarrollo de Software e IoT.",
    "foot.ctaTitle":  "¿LISTO PARA EMPEZAR?",
    "foot.ctaText":   "Cuéntanos tu proyecto y te contactamos en menos de 24h.",
    "foot.ctaBtn":    "📅 Solicitar Ahora",
    "foot.year":      "2026",
    "foot.tag":       "CONSTRUYENDO EL FUTURO DE LA INGENIERÍA DE SOFTWARE."
  },

  // ── COLORES DEL SITIO ─────────────────────────────────────────────────────
  colors: {
    "--color-accent":      "#2dd4bf",   // Color acento / turquesa principal
    "--color-accent-dark": "#0a9e8e",   // Acento oscuro (hover)
    "--color-bg-primary":  "#0b1b22",   // Fondo oscuro principal
    "--color-bg-light":    "#112230",   // Fondo secciones claras
    "--color-bg-dark":     "#07131a",   // Fondo secciones muy oscuras
    "--color-text":        "#e0eaed",   // Texto principal
    "--color-text-muted":  "#7a9bab",   // Texto secundario
    "--color-navbar":      "#0b1b22"    // Fondo navbar
  },

  // ── IMÁGENES DE FONDO POR SECCIÓN ─────────────────────────────────────────
  // Las claves terminan en ".bg" — se guardan en IndexedDB igual que logo/hero
  bgKeys: [
    "bg.inicio",
    "bg.servicios",
    "bg.caracteristicas",
    "bg.portafolio",
    "bg.ventajas",
    "bg.productos",
    "bg.footer"
  ],

  // Media keys originales
  mediaKeys: ["logo", "hero.image", "hero.video"],

  services: [
    {icon:"🖥️", num:"150 +", name:"Arq. de Software"},
    {icon:"📊", num:"120 +", name:"Gestion de Datos"},
    {icon:"🤖", num:"150 +", name:"RPA"},
    {icon:"🌐", num:"120 +", name:"IoT"},
    {icon:"🎧", num:"100 +", name:"Contact Center"},
    {icon:"☁️", num:"150 +", name:"Cloud Computing"},
    {icon:"📈", num:"250 +", name:"Gestion de Proyecto"},
    {icon:"🎨", num:"100 +", name:"Diseño y Marketing"}
  ],
  features: [
    {tag:"ESTRATEGIA",      title:"Gestión de Proyectos",    img:"https://images.unsplash.com/photo-1552664730-d307ca884978?w=600"},
    {tag:"INGENIERÍA",      title:"Desarrollo de Software",  img:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"},
    {tag:"INFRAESTRUCTURA", title:"Cloud Computing",         img:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600"},
    {tag:"CONECTIVIDAD",    title:"Internet of Things",      img:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"},
    {tag:"AUTOMATIZACIÓN",  title:"RPA",                     img:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600"},
    {tag:"DATOS",           title:"Big Data",                img:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600"},
    {tag:"EXPERIENCIA",     title:"Customer Experience",     img:"https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600"},
    {tag:"DISEÑO",          title:"UX / UI",                 img:"https://images.unsplash.com/photo-1561070791-2526d30994b8?w=600"}
  ],
  portCats: [
    {key:"todos",  label:"TODOS"},
    {key:"web",    label:"WEB"},
    {key:"app",    label:"APP"},
    {key:"bi",     label:"BI"},
    {key:"rpa",    label:"RPA"},
    {key:"cloud",  label:"CLOUD"},
    {key:"devops", label:"DEVOPS"},
    {key:"data",   label:"DATA"},
    {key:"ml",     label:"ML"},
    {key:"ia",     label:"IA"}
  ],
  portItems: [
    {cat:"web",  title:"Portal Corporativo RetailMax",     img:"https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600"},
    {cat:"web",  title:"Sistema de Gestión BancaDigital",  img:"https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600"},
    {cat:"web",  title:"E-Commerce AgroExport Perú",       img:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"},
    {cat:"app",  title:"Logística WarehouseOps",           img:"https://images.unsplash.com/photo-1565891741441-64926e441838?w=600"},
    {cat:"app",  title:"App Marketing CafeBlend",          img:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600"},
    {cat:"data", title:"Plataforma Analítica IoT",         img:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"}
  ],
  advantages: [
    {icon:"⚡", title:"Acelera tu desarrollo",         desc:"Acelere el desarrollo de su proyecto en 2 o incluso 3 veces usando esta plantilla."},
    {icon:"✓",  title:"Reduzca su control de calidad", desc:"Gracias a nosotros, las correcciones de tu proyecto se realizarán en un abrir y cerrar de ojos."},
    {icon:"$",  title:"Ahorra tu dinero",              desc:"Un desarrollo acelerado le permite ahorrar miles de dólares en la creación de sus proyectos."},
    {icon:"☺", title:"Sugerir y estar satisfecho",    desc:"La idea principal es crear un producto hecho por personas para la gente."}
  ],
  products: [
    {cat:"DISEÑO GRÁFICO",          title:"Flyers desde",  accent:"$49",             bg:"linear-gradient(135deg,#2dd4bf,#0a3d40)"},
    {cat:"DESARROLLO WEB",          title:"Tu web",        accent:"lista en 5 días", bg:"linear-gradient(135deg,#0b1b22,#1a2e36)"},
    {cat:"INTELIGENCIA ARTIFICIAL", title:"Agentes IA",    accent:"para tu negocio", bg:"linear-gradient(135deg,#7c3aed,#4c1d95)"}
  ]
};