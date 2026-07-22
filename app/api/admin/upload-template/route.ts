import { NextResponse } from "next/server";
import { writeFile, mkdir, readdir, rm, cp, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import AdmZip from "adm-zip";
import * as cheerio from "cheerio";
import db from "@/lib/db";

export const runtime = "nodejs";

function extractZip(buffer: Buffer, destDir: string): void {
  const zip = new AdmZip(buffer);
  zip.extractAllTo(destDir, true);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CLAVES_RESERVADAS = new Set([
  "businessName",
  "tagline",
  "logo",
  "heroImage",
  "aboutImage",
  "description",
  "ctaText",
  "aboutText",
  "heroTitle",
  "bannerTitle",
  "bannerSubtitle",
  "bannerButtonText",
  "chooseUsTitle",
  "chooseUsSubtitle",
  "classesTitle",
  "classesSubtitle",
  "pricingTitle",
  "pricingSubtitle",
  "teamTitle",
  "teamSubtitle",
  "teamButtonText",
  "address",
  "phone",
  "email",
]);

const TAGS_PERMITIDOS = new Set([
  "a",
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "label",
  "button",
  "strong",
  "em",
  "small",
]);

function normalizarTexto(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

function generarClaveDesdeTexto(texto: string, tag: string): string {
  const base = `${tag}-${texto}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return base || `${tag}-text`;
}

function esNombreDeArchivoUtil(nombre: string): boolean {
  const limpio = nombre.trim().toLowerCase();

  if (!limpio) {
    return false;
  }

  const sinExtension = limpio.replace(/\.[^/.]+$/, "");

  if (!sinExtension || sinExtension.length <= 2) {
    return false;
  }

  const genericos = [
    "img",
    "img1",
    "img2",
    "img3",
    "image",
    "images",
    "photo",
    "photos",
    "picture",
    "pictures",
    "avatar",
    "logo",
    "icon",
    "arrow",
    "bullet",
    "banner",
    "hero",
    "bg",
    "background",
  ];

  if (genericos.includes(sinExtension)) {
    return false;
  }

  if (
    /^(img|photo|image|picture|avatar|logo|icon|arrow|bullet|banner|hero|bg|background)\d*$/i.test(
      sinExtension
    )
  ) {
    return false;
  }

  return true;
}

function agregarMarcasImagenesAutomaticas(html: string): string {
  const $ = cheerio.load(html);
  const clavesUsadas = new Set<string>();

  $("[data-editable], [data-editable-bg], [data-editable-attr]").each(
    (_index, element) => {
      const $el = $(element);

      const valor =
        $el.attr("data-editable") ||
        $el.attr("data-editable-bg") ||
        $el.attr("data-editable-attr");

      if (valor) {
        clavesUsadas.add(valor);
      }
    }
  );

  $("img").each((_index, element) => {
    const $el = $(element);

    if ($el.attr("data-editable") || $el.attr("data-editable-bg")) {
      return;
    }

    const src = ($el.attr("src") || "").trim();
    const alt = ($el.attr("alt") || "").trim();
    const className = ($el.attr("class") || "").trim();
    const idName = ($el.attr("id") || "").trim();

    if (!src || src.startsWith("data:image")) {
      return;
    }

    const srcSinParametros = src.split("?")[0].split("#")[0];
    const nombreArchivoCompleto = srcSinParametros.split("/").pop() || "";
    const nombreArchivo = nombreArchivoCompleto.replace(/\.[^/.]+$/, "");

    const datosImagen = [
      src,
      alt,
      className,
      idName,
      nombreArchivo,
    ]
      .join(" ")
      .toLowerCase();

    const datosAncestros = $el
      .parents()
      .toArray()
      .map((parent) => {
        const $parent = $(parent);

        return [
          parent.tagName || "",
          $parent.attr("class") || "",
          $parent.attr("id") || "",
        ].join(" ");
      })
      .join(" ")
      .toLowerCase();

    const estaEnHeaderONav =
      $el.parents("header, nav").length > 0;

    const estaEnContenedorLogo =
      $el.parents(
        ".logo, .site-logo, .navbar-brand, .brand, [class*='logo'], [id*='logo'], [class*='brand'], [id*='brand']"
      ).length > 0;

    const tieneNombreDeLogo =
      /(^|[\s/_-])(logo|brand)([\s/_.-]|$)/i.test(datosImagen) ||
      /(^|[\s/_-])(logo|brand)([\s/_.-]|$)/i.test(datosAncestros);

    const esLogo =
      estaEnContenedorLogo ||
      tieneNombreDeLogo ||
      (estaEnHeaderONav &&
        /logo|brand/i.test(
          `${src} ${alt} ${className} ${idName} ${datosAncestros}`
        ));

    if (!esLogo) {
      const tieneAncestroNoPermitido = $el
        .parents()
        .toArray()
        .some((parent) => {
          const $parent = $(parent);

          const parentClass = $parent.attr("class") || "";
          const parentId = $parent.attr("id") || "";

          return /social|footer-icon|nav-icon/i.test(
            `${parentClass} ${parentId}`
          );
        });

      if (tieneAncestroNoPermitido) {
        return;
      }

      const width = $el.attr("width") || "";
      const height = $el.attr("height") || "";

      if (
        width &&
        /^\d+(\.\d+)?$/.test(width) &&
        Number(width) < 40
      ) {
        return;
      }

      if (
        height &&
        /^\d+(\.\d+)?$/.test(height) &&
        Number(height) < 40
      ) {
        return;
      }

      if (
        alt &&
        /^(icon|arrow|bullet)$/i.test(alt) &&
        !alt.includes(" ")
      ) {
        return;
      }
    }

    let claveBase: string;

    if (esLogo) {
      claveBase = "logo";
    } else {
      const baseTexto = esNombreDeArchivoUtil(nombreArchivo)
        ? nombreArchivo
        : alt || "image";

      claveBase = slugify(baseTexto) || "image";
    }

    let clave = claveBase;
    let contador = 2;

    while (
      clavesUsadas.has(clave) ||
      (CLAVES_RESERVADAS.has(clave) && clave !== "logo")
    ) {
      clave = `${claveBase}-${contador}`;
      contador += 1;
    }

    clavesUsadas.add(clave);
    $el.attr("data-editable", clave);
  });

  return $.html();
}

function agregarMarcasFondoAutomaticas(html: string): string {
  const $ = cheerio.load(html);
  const clavesUsadas = new Set<string>();

  $("[data-editable], [data-editable-bg], [data-editable-attr]").each(
    (_index, element) => {
      const $el = $(element);

      const valor =
        $el.attr("data-editable") ||
        $el.attr("data-editable-bg") ||
        $el.attr("data-editable-attr");

      if (valor) {
        clavesUsadas.add(valor);
      }
    }
  );

  $("[data-setbg]").each((_index, element) => {
    const $el = $(element);

    if ($el.attr("data-editable") || $el.attr("data-editable-bg")) {
      return;
    }

    const valor = ($el.attr("data-setbg") || "").trim();

    if (!valor || valor.startsWith("data:")) {
      return;
    }

    const nombreArchivo =
      valor.match(/\/([^/?#]+)(?:\.[^/?#]+)?$/)?.[1] || "";

    const baseTexto = nombreArchivo
      ? nombreArchivo.replace(/\.[^/.]+$/, "")
      : "background";

    const claveBase = slugify(baseTexto) || "background";

    let clave = claveBase;
    let contador = 2;

    while (
      clavesUsadas.has(clave) ||
      CLAVES_RESERVADAS.has(clave)
    ) {
      clave = `${claveBase}-${contador}`;
      contador += 1;
    }

    clavesUsadas.add(clave);
    $el.attr("data-editable-bg", clave);
  });

  $("*[style]").each((_index, element) => {
    const $el = $(element);

    if ($el.attr("data-editable") || $el.attr("data-editable-bg")) {
      return;
    }

    const style = ($el.attr("style") || "").trim();

    if (!style) {
      return;
    }

    const match = style.match(
      /background-image\s*:\s*url\((['"]?)(.*?)\1\)/i
    );

    const valor = match?.[2]?.trim();

    if (
      !valor ||
      valor.startsWith("data:") ||
      valor === "none"
    ) {
      return;
    }

    const nombreArchivo =
      valor.match(/\/([^/?#]+)(?:\.[^/?#]+)?$/)?.[1] || "";

    const baseTexto = nombreArchivo
      ? nombreArchivo.replace(/\.[^/.]+$/, "")
      : "background";

    const claveBase = slugify(baseTexto) || "background";

    let clave = claveBase;
    let contador = 2;

    while (
      clavesUsadas.has(clave) ||
      CLAVES_RESERVADAS.has(clave)
    ) {
      clave = `${claveBase}-${contador}`;
      contador += 1;
    }

    clavesUsadas.add(clave);
    $el.attr("data-editable-bg", clave);
  });

  return $.html();
}

function agregarMarcasAutomaticas(html: string): string {
  const $ = cheerio.load(html);
  const clavesUsadas = new Set<string>();

  $("*").each((_index, element) => {
    if (element.type !== "tag") {
      return;
    }

    const tagName = element.tagName.toLowerCase();
    const $el = $(element);

    if ($el.attr("data-editable") || $el.attr("data-editable-bg")) {
      return;
    }

    const tieneAncestroMarcado = $el
      .parents()
      .toArray()
      .some((parent) => {
        const $parent = $(parent);

        return (
          $parent.attr("data-editable") ||
          $parent.attr("data-editable-bg")
        );
      });

    if (tieneAncestroMarcado) {
      return;
    }

    if (!TAGS_PERMITIDOS.has(tagName)) {
      return;
    }

    if (
      [
        "script",
        "style",
        "svg",
        "img",
        "input",
        "textarea",
        "select",
        "option",
        "noscript",
      ].includes(tagName)
    ) {
      return;
    }

    const texto = normalizarTexto($el.text());

    if (!texto || texto.length < 2) {
      return;
    }

    const claveBase = generarClaveDesdeTexto(texto, tagName);

    let clave = claveBase;
    let contador = 2;

    while (
      clavesUsadas.has(clave) ||
      CLAVES_RESERVADAS.has(clave)
    ) {
      clave = `${claveBase}-${contador}`;
      contador += 1;
    }

    clavesUsadas.add(clave);
    $el.attr("data-editable", clave);
  });

  $("input, textarea, img").each((_index, element) => {
    const $el = $(element);

    if ($el.attr("data-editable") || $el.attr("data-editable-bg")) {
      return;
    }

    const placeholder = $el.attr("placeholder");

    if (placeholder && placeholder.trim()) {
      const claveBase =
        `placeholder-${$el[0].tagName.toLowerCase()}`;

      let clave = claveBase;
      let contador = 2;

      while (
        clavesUsadas.has(clave) ||
        CLAVES_RESERVADAS.has(clave)
      ) {
        clave = `${claveBase}-${contador}`;
        contador += 1;
      }

      clavesUsadas.add(clave);
      $el.attr("data-editable-attr", clave);
      $el.attr("data-editable-attr-name", "placeholder");
    }

    const alt = $el.attr("alt");

    if (alt && alt.trim()) {
      const claveBase =
        `alt-${$el[0].tagName.toLowerCase()}`;

      let clave = claveBase;
      let contador = 2;

      while (
        clavesUsadas.has(clave) ||
        CLAVES_RESERVADAS.has(clave)
      ) {
        clave = `${claveBase}-${contador}`;
        contador += 1;
      }

      clavesUsadas.add(clave);
      $el.attr("data-editable-attr", clave);
      $el.attr("data-editable-attr-name", "alt");
    }

    const title = $el.attr("title");

    if (title && title.trim()) {
      const claveBase =
        `title-${$el[0].tagName.toLowerCase()}`;

      let clave = claveBase;
      let contador = 2;

      while (
        clavesUsadas.has(clave) ||
        CLAVES_RESERVADAS.has(clave)
      ) {
        clave = `${claveBase}-${contador}`;
        contador += 1;
      }

      clavesUsadas.add(clave);
      $el.attr("data-editable-attr", clave);
      $el.attr("data-editable-attr-name", "title");
    }
  });

  return $.html();
}

function normalizarColor(valor: string): string | null {
  const texto = valor.trim().toLowerCase();

  if (
    !texto ||
    texto.includes("var(") ||
    texto.includes("transparent") ||
    texto.includes("currentcolor")
  ) {
    return null;
  }

  const hex = texto.match(/^#([0-9a-f]{3,8})$/i);

  if (hex) {
    const valorHex = hex[1];

    if (valorHex.length === 3 || valorHex.length === 4) {
      return `#${valorHex
        .split("")
        .map((c) => c + c)
        .join("")}`;
    }

    return `#${valorHex}`;
  }

  const rgb = texto.match(/^rgba?\(([^)]+)\)$/i);

  if (rgb) {
    return `rgba(${rgb[1].replace(/\s+/g, "")})`;
  }

  return null;
}

async function encontrarArchivosCss(
  destDir: string
): Promise<string[]> {
  const resultados: string[] = [];

  async function recorrer(actual: string): Promise<void> {
    const entries = await readdir(actual, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(actual, entry.name);

      if (entry.isDirectory()) {
        if (
          ["__MACOSX", ".git", "node_modules"].includes(
            entry.name
          )
        ) {
          continue;
        }

        await recorrer(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".css")
      ) {
        resultados.push(fullPath);
      }
    }
  }

  await recorrer(destDir);

  return resultados.sort();
}

async function aplicarVariablesCssAutomaticas(
  destDir: string
): Promise<void> {
  const archivosCss = await encontrarArchivosCss(destDir);

  if (archivosCss.length === 0) {
    return;
  }

  const cssPrincipal =
    archivosCss.find((archivo) => {
      const nombre = path.basename(archivo).toLowerCase();

      return nombre === "style.css" || nombre === "main.css";
    }) || archivosCss[0];

  if (!cssPrincipal) {
    return;
  }

  const cssActual = await readFile(cssPrincipal, "utf8");

  if (!cssActual || cssActual.length > 250000) {
    return;
  }

  if (
    /--color-primary|--color-secondary|--color-background|--color-text|--color-button/i.test(
      cssActual
    )
  ) {
    return;
  }

  const bloques = [
    ...cssActual.matchAll(/([^{}]+)\{([^{}]*)\}/g),
  ];

  if (bloques.length > 250) {
    return;
  }

  const conteosBackground: Record<string, number> = {};
  const conteosBackgroundBotones: Record<string, number> = {};
  const conteosColor: Record<string, number> = {};
  const rawPorValor: Record<string, string> = {};

  const selectorBotonRegex =
    /\b(button|btn|cta|primary|secondary|hover|active|nav|menu)\b/i;

  for (const match of bloques) {
    const selector = (match[1] || "").trim();
    const bloque = match[2] || "";
    const esBoton = selectorBotonRegex.test(selector);

    const declaraciones = [
      ...bloque.matchAll(/([a-zA-Z-]+)\s*:\s*([^;]+);/g),
    ];

    for (const declaracion of declaraciones) {
      const propiedad =
        (declaracion[1] || "").trim().toLowerCase();

      const valor = (declaracion[2] || "").trim();
      const valorNormalizado = normalizarColor(valor);

      if (!valorNormalizado) {
        continue;
      }

      rawPorValor[valorNormalizado] =
        rawPorValor[valorNormalizado] || valor;

      if (
        propiedad === "background-color" ||
        propiedad === "border-color"
      ) {
        conteosBackground[valorNormalizado] =
          (conteosBackground[valorNormalizado] || 0) + 1;

        if (esBoton) {
          conteosBackgroundBotones[valorNormalizado] =
            (conteosBackgroundBotones[valorNormalizado] || 0) +
            1;
        }
      }

      if (propiedad === "color") {
        conteosColor[valorNormalizado] =
          (conteosColor[valorNormalizado] || 0) + 1;
      }
    }
  }

  const coloresBackground = Object.entries(
    conteosBackground
  ).sort((a, b) => b[1] - a[1]);

  const coloresBackgroundBotones = Object.entries(
    conteosBackgroundBotones
  ).sort((a, b) => b[1] - a[1]);

  const coloresTexto = Object.entries(conteosColor).sort(
    (a, b) => b[1] - a[1]
  );

  if (
    coloresBackground.length < 2 ||
    coloresTexto.length < 1
  ) {
    return;
  }

  const primary =
    coloresBackgroundBotones[0]?.[0] ||
    coloresBackground[0]?.[0];

  const secondary =
    coloresBackgroundBotones[1]?.[0] ||
    coloresBackground[1]?.[0] ||
    primary;

  const background =
    coloresBackground.find(
      ([color]) =>
        color !== primary && color !== secondary
    )?.[0] ||
    coloresBackground[0]?.[0] ||
    primary;

  const text = coloresTexto[0]?.[0] || primary;

  const button =
    coloresBackgroundBotones.find(
      ([color]) =>
        color !== primary && color !== secondary
    )?.[0] || primary;

  if (!primary || !secondary || !background || !text) {
    return;
  }

  const valores = [
    {
      nombre: "--color-primary",
      valor: rawPorValor[primary] || primary,
    },
    {
      nombre: "--color-secondary",
      valor: rawPorValor[secondary] || secondary,
    },
    {
      nombre: "--color-background",
      valor: rawPorValor[background] || background,
    },
    {
      nombre: "--color-text",
      valor: rawPorValor[text] || text,
    },
    {
      nombre: "--color-button",
      valor: rawPorValor[button] || primary,
    },
  ];

  const bloqueRoot = `:root {\n${valores
    .map(
      ({ nombre, valor }) =>
        `  ${nombre}: ${valor};`
    )
    .join("\n")}\n}\n\n`;

  let cssFinal = `${bloqueRoot}${cssActual}`;

  const reemplazos = [
    {
      original: rawPorValor[primary] || primary,
      reemplazo: "var(--color-primary)",
    },
    {
      original: rawPorValor[secondary] || secondary,
      reemplazo: "var(--color-secondary)",
    },
    {
      original: rawPorValor[background] || background,
      reemplazo: "var(--color-background)",
    },
    {
      original: rawPorValor[text] || text,
      reemplazo: "var(--color-text)",
    },
    {
      original: rawPorValor[button] || primary,
      reemplazo: "var(--color-button)",
    },
  ].filter(({ original }) => original);

  reemplazos.forEach(({ original, reemplazo }) => {
    cssFinal = cssFinal.replaceAll(original, reemplazo);
  });

  if (cssFinal !== cssActual) {
    await writeFile(cssPrincipal, cssFinal, "utf8");
  }
}

function aplicarMarcasGym(html: string): string {
  let resultado = html;

  const reglas = [
    {
      patron:
        /<div class="section-title">\s*<span>Why chose us\?<\/span>\s*<h2>PUSH YOUR LIMITS FORWARD<\/h2>/,
      reemplazo:
        '<div class="section-title">\n                        <span data-editable="chooseUsTitle">Why chose us?</span>\n                        <h2 data-editable="chooseUsSubtitle">PUSH YOUR LIMITS FORWARD</h2>',
    },
    {
      patron:
        /<div class="section-title">\s*<span>Our Classes<\/span>\s*<h2>WHAT WE CAN OFFER<\/h2>/,
      reemplazo:
        '<div class="section-title">\n                        <span data-editable="classesTitle">Our Classes</span>\n                        <h2 data-editable="classesSubtitle">WHAT WE CAN OFFER</h2>',
    },
    {
      patron:
        /<div class="section-title">\s*<span>Our Plan<\/span>\s*<h2>Choose your pricing plan<\/h2>/,
      reemplazo:
        '<div class="section-title">\n                        <span data-editable="pricingTitle">Our Plan</span>\n                        <h2 data-editable="pricingSubtitle">Choose your pricing plan</h2>',
    },
    {
      patron:
        /<div class="team-title">\s*<div class="section-title">\s*<span>Our Team<\/span>\s*<h2>TRAIN WITH EXPERTS<\/h2>\s*<\/div>\s*<a href="#" class="primary-btn btn-normal appoinment-btn">appointment<\/a>/,
      reemplazo:
        '<div class="team-title">\n                        <div class="section-title">\n                            <span data-editable="teamTitle">Our Team</span>\n                            <h2 data-editable="teamSubtitle">TRAIN WITH EXPERTS</h2>\n                        </div>\n                        <a href="#" class="primary-btn btn-normal appoinment-btn" data-editable="teamButtonText">appointment</a>',
    },
  ];

  reglas.forEach(({ patron, reemplazo }) => {
    resultado = resultado.replace(patron, reemplazo);
  });

  return resultado;
}

async function encontrarCarpetaDeIndex(
  destDir: string,
  maxProfundidad = 5
): Promise<string | null> {
  const entries = await readdir(destDir, {
    withFileTypes: true,
  });

  const tieneIndex = entries.some(
    (entry) =>
      entry.isFile() &&
      entry.name.toLowerCase() === "index.html"
  );

  if (tieneIndex) {
    return destDir;
  }

  if (maxProfundidad <= 0) {
    return null;
  }

  const carpetasValidas = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !["__MACOSX", ".git", "node_modules"].includes(
        entry.name
      )
  );

  for (const carpeta of carpetasValidas) {
    const resultado = await encontrarCarpetaDeIndex(
      path.join(destDir, carpeta.name),
      maxProfundidad - 1
    );

    if (resultado) {
      return resultado;
    }
  }

  return null;
}

async function aplanarCarpetaSiHaceFalta(
  destDir: string
): Promise<void> {
  const carpetaConIndex =
    await encontrarCarpetaDeIndex(destDir);

  if (!carpetaConIndex) {
    console.warn(
      "No se encontró index.html dentro del ZIP extraído en:",
      destDir
    );

    return;
  }

  if (carpetaConIndex === destDir) {
    return;
  }

  const items = await readdir(carpetaConIndex, {
    withFileTypes: true,
  });

  for (const item of items) {
    const origen = path.join(
      carpetaConIndex,
      item.name
    );

    const destino = path.join(
      destDir,
      item.name
    );

    let intentos = 0;

    while (true) {
      try {
        await cp(origen, destino, {
          recursive: true,
          force: true,
        });

        break;
      } catch (error) {
        intentos += 1;

        if (intentos >= 5) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 200)
        );
      }
    }
  }

  let carpetaSobrante = carpetaConIndex;

  while (
    path.dirname(carpetaSobrante) !== destDir
  ) {
    carpetaSobrante =
      path.dirname(carpetaSobrante);
  }

  try {
    await rm(carpetaSobrante, {
      recursive: true,
      force: true,
    });
  } catch {
    // Los archivos ya fueron copiados correctamente.
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(
      formData.get("name") || ""
    ).trim();

    const category = String(
      formData.get("category") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const price = String(
      formData.get("price") || ""
    ).trim();

    const file = formData.get("file");
    const previewImage = formData.get("image");

    if (
      !name ||
      !category ||
      !price ||
      !(file instanceof File) ||
      file.size === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan campos requeridos: nombre, categoría, precio y archivo ZIP.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !(previewImage instanceof File) ||
      previewImage.size === 0
    ) {
      return NextResponse.json(
        {
          error:
            "La imagen de preview es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (!previewImage.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "El archivo preview debe ser una imagen.",
        },
        {
          status: 400,
        }
      );
    }

    const isZip =
      file.name.toLowerCase().endsWith(".zip") ||
      file.type === "application/zip" ||
      file.type ===
        "application/x-zip-compressed";

    if (!isZip) {
      return NextResponse.json(
        {
          error:
            "El archivo de la plantilla debe ser un ZIP.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedPrice = Number(price);

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      return NextResponse.json(
        {
          error: "El precio no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const folder = slugify(name);

    if (!folder) {
      return NextResponse.json(
        {
          error:
            "No se pudo generar un nombre válido para la carpeta.",
        },
        {
          status: 400,
        }
      );
    }

    const destDir = path.join(
      process.cwd(),
      "public",
      "templates",
      folder
    );

    if (existsSync(destDir)) {
      await rm(destDir, {
        recursive: true,
        force: true,
      });
    }

    await mkdir(destDir, {
      recursive: true,
    });

    const zipBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    if (zipBuffer.length === 0) {
      return NextResponse.json(
        {
          error: "El archivo ZIP está vacío.",
        },
        {
          status: 400,
        }
      );
    }

    extractZip(zipBuffer, destDir);

    await aplanarCarpetaSiHaceFalta(destDir);
    await aplicarVariablesCssAutomaticas(destDir);

    const indexPath = path.join(
      destDir,
      "index.html"
    );

    if (existsSync(indexPath)) {
      const htmlOriginal = await readFile(
        indexPath,
        "utf8"
      );

      const htmlConEscaneoGeneral =
        agregarMarcasAutomaticas(htmlOriginal);

      const htmlConMarcasImagenes =
        agregarMarcasImagenesAutomaticas(
          htmlConEscaneoGeneral
        );

      const htmlConMarcasFondo =
        agregarMarcasFondoAutomaticas(
          htmlConMarcasImagenes
        );

      const htmlModificado =
        folder === "gym"
          ? aplicarMarcasGym(
              htmlConMarcasFondo
            )
          : htmlConMarcasFondo;

      if (htmlModificado !== htmlOriginal) {
        await writeFile(
          indexPath,
          htmlModificado,
          "utf8"
        );
      }
    }

    const previewsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "previews"
    );

    if (!existsSync(previewsDir)) {
      await mkdir(previewsDir, {
        recursive: true,
      });
    }

    const extension =
      path.extname(previewImage.name).toLowerCase() ||
      ".png";

    const imageName =
      `${Date.now()}-${folder}${extension}`;

    const imagePath = path.join(
      previewsDir,
      imageName
    );

    const imageBuffer = Buffer.from(
      await previewImage.arrayBuffer()
    );

    await writeFile(
      imagePath,
      imageBuffer
    );

    const imageUrl =
      `/uploads/previews/${imageName}`;

    const [result]: any = await db.query(
      `INSERT INTO templates
      (name, category, description, price, folder, image_url)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        description,
        parsedPrice,
        folder,
        imageUrl,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      folder,
      image_url: imageUrl,
      message:
        "Plantilla subida correctamente",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al subir la plantilla.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}