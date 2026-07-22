import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import * as cheerio from "cheerio";

import db from "@/lib/db";

interface ConfiguracionRow {
  id: number;
  plantilla_id: number;
  colores: string | null;
  tipografia: string | null;
  contenido: string | null;
  imagenes: string | null;
  secciones: string | null;
  social: string | null;
  contacto: string | null;
  plantilla_nombre: string | null;
  plantilla_folder: string | null;
}

type ConfigRecord = Record<string, unknown>;

function safeParse(
  value: string | null,
): ConfigRecord {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as ConfigRecord;
    }

    return {};
  } catch {
    return {};
  }
}

function getStringValue(
  object: ConfigRecord,
  aliases: string[],
): string {
  for (const alias of aliases) {
    const value = object[alias];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

function normalizeCssVariableName(
  key: string,
): string {
  const normalizedKey = key
    .trim()
    .replace(/^--/, "")
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1-$2",
    )
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return `--${normalizedKey}`;
}

function normalizeFontFamily(
  value: string,
): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (
    trimmedValue.includes(",") ||
    trimmedValue.includes('"') ||
    trimmedValue.includes("'")
  ) {
    return trimmedValue;
  }

  if (trimmedValue.includes(" ")) {
    return `"${trimmedValue}", sans-serif`;
  }

  return `${trimmedValue}, sans-serif`;
}

function normalizeCssSize(
  value: string,
): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^\d+(\.\d+)?$/.test(trimmedValue)) {
    return `${trimmedValue}px`;
  }

  return trimmedValue;
}

function normalizeImageValue(
  value: string,
): string {
  const trimmedValue = value.trim();

  const urlMatch = trimmedValue.match(
    /^url\((['"]?)(.*?)\1\)$/i,
  );

  if (urlMatch?.[2]) {
    return urlMatch[2];
  }

  return trimmedValue;
}

function sanitizeFileName(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function escapeAttributeValue(
  value: string,
): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function getHtmlFiles(
  directory: string,
  baseDirectory = directory,
): string[] {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  const htmlFiles: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(
      directory,
      entry.name,
    );

    if (entry.isDirectory()) {
      htmlFiles.push(
        ...getHtmlFiles(
          absolutePath,
          baseDirectory,
        ),
      );

      continue;
    }

    if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".html")
    ) {
      htmlFiles.push(
        path.relative(
          baseDirectory,
          absolutePath,
        ),
      );
    }
  }

  return htmlFiles;
}

function buildCustomizationCss(
  colores: ConfigRecord,
  tipografia: ConfigRecord,
): string {
  const cssVariables: string[] = [];
  const cssRules: string[] = [];

  /*
   * Guardar todos los colores y tipografías como variables CSS.
   * Esto mantiene compatibilidad con plantillas que ya usan variables.
   */
  Object.entries(colores).forEach(
    ([key, value]) => {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return;
      }

      cssVariables.push(
        `${normalizeCssVariableName(key)}: ${value.trim()};`,
      );
    },
  );

  Object.entries(tipografia).forEach(
    ([key, value]) => {
      if (
        typeof value !== "string" &&
        typeof value !== "number"
      ) {
        return;
      }

      const normalizedValue =
        String(value).trim();

      if (!normalizedValue) {
        return;
      }

      cssVariables.push(
        `${normalizeCssVariableName(key)}: ${normalizedValue};`,
      );
    },
  );

  /*
   * Buscar los nombres de colores utilizados por diferentes
   * versiones del panel de configuración.
   */
  const primaryColor = getStringValue(
    colores,
    [
      "primary",
      "primaryColor",
      "colorPrimary",
      "color-primary",
      "--color-primary",
      "--primary",
    ],
  );

  const secondaryColor = getStringValue(
    colores,
    [
      "secondary",
      "secondaryColor",
      "colorSecondary",
      "color-secondary",
      "--color-secondary",
      "--secondary",
    ],
  );

  const backgroundColor = getStringValue(
    colores,
    [
      "background",
      "backgroundColor",
      "colorBackground",
      "color-background",
      "--color-background",
      "--background",
    ],
  );

  const textColor = getStringValue(
    colores,
    [
      "text",
      "textColor",
      "colorText",
      "color-text",
      "--color-text",
      "--text",
    ],
  );

  const buttonColor = getStringValue(
    colores,
    [
      "button",
      "buttonColor",
      "colorButton",
      "color-button",
      "--color-button",
      "--button",
    ],
  );

  const accentColor = getStringValue(
    colores,
    [
      "accent",
      "accentColor",
      "colorAccent",
      "color-accent",
      "--color-accent",
      "--accent",
    ],
  );

  const headingColor = getStringValue(
    colores,
    [
      "heading",
      "headingColor",
      "titleColor",
      "colorHeading",
      "color-heading",
      "--color-heading",
    ],
  );

  const linkColor = getStringValue(
    colores,
    [
      "link",
      "linkColor",
      "colorLink",
      "color-link",
      "--color-link",
    ],
  );

  /*
   * Buscar los nombres de tipografía utilizados por diferentes
   * versiones del panel.
   */
  const bodyFont = getStringValue(
    tipografia,
    [
      "bodyFont",
      "body",
      "fontFamily",
      "font-family",
      "primaryFont",
      "fontBody",
      "font-body",
      "--font-body",
      "--font-family",
    ],
  );

  const headingFont = getStringValue(
    tipografia,
    [
      "headingFont",
      "heading",
      "titleFont",
      "fontHeading",
      "font-heading",
      "secondaryFont",
      "--font-heading",
    ],
  );

  const bodyFontSize = getStringValue(
    tipografia,
    [
      "bodySize",
      "bodyFontSize",
      "fontSize",
      "font-size",
      "--font-size",
    ],
  );

  const headingFontSize =
    getStringValue(
      tipografia,
      [
        "headingSize",
        "headingFontSize",
        "titleSize",
        "titleFontSize",
      ],
    );

  const lineHeight = getStringValue(
    tipografia,
    [
      "lineHeight",
      "line-height",
      "bodyLineHeight",
    ],
  );

  if (cssVariables.length > 0) {
    cssRules.push(`
      :root {
        ${cssVariables.join("\n")}
      }
    `);
  }

  if (backgroundColor) {
    cssRules.push(`
      html,
      body {
        background-color: ${backgroundColor} !important;
      }
    `);
  }

  if (textColor) {
    cssRules.push(`
      body,
      p,
      li,
      label,
      input,
      textarea,
      select,
      option,
      table,
      td,
      th,
      blockquote {
        color: ${textColor} !important;
      }

      input::placeholder,
      textarea::placeholder {
        color: ${textColor} !important;
        opacity: 0.7;
      }
    `);
  }

  const effectiveHeadingColor =
    headingColor ||
    primaryColor ||
    textColor;

  if (effectiveHeadingColor) {
    cssRules.push(`
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      .title,
      .section-title,
      .section-heading,
      [class*="section-title"],
      [class*="section_title"],
      [class*="heading-title"] {
        color: ${effectiveHeadingColor} !important;
      }
    `);
  }

  const effectiveLinkColor =
    linkColor || primaryColor;

  if (effectiveLinkColor) {
    cssRules.push(`
      a:not(.btn):not([class*="button"]):not([class*="btn"]) {
        color: ${effectiveLinkColor} !important;
      }

      a:not(.btn):not([class*="button"]):not([class*="btn"]):hover {
        color: ${
          accentColor ||
          secondaryColor ||
          effectiveLinkColor
        } !important;
      }
    `);
  }

  const effectiveButtonColor =
    buttonColor || primaryColor;

  if (effectiveButtonColor) {
    cssRules.push(`
      button,
      .btn,
      [class*="btn-"],
      [class*="button"],
      input[type="button"],
      input[type="submit"],
      input[type="reset"] {
        background-color: ${effectiveButtonColor} !important;
        border-color: ${effectiveButtonColor} !important;
      }
    `);
  }

  if (secondaryColor) {
    cssRules.push(`
      .bg-secondary,
      [class*="secondary-bg"],
      [class*="bg-secondary"] {
        background-color: ${secondaryColor} !important;
      }

      .text-secondary,
      [class*="text-secondary"] {
        color: ${secondaryColor} !important;
      }

      .border-secondary,
      [class*="border-secondary"] {
        border-color: ${secondaryColor} !important;
      }
    `);
  }

  if (primaryColor) {
    cssRules.push(`
      .bg-primary,
      [class*="primary-bg"],
      [class*="bg-primary"] {
        background-color: ${primaryColor} !important;
      }

      .text-primary,
      [class*="text-primary"] {
        color: ${primaryColor} !important;
      }

      .border-primary,
      [class*="border-primary"] {
        border-color: ${primaryColor} !important;
      }

      svg,
      svg path,
      svg circle,
      svg rect {
        --devioz-primary-color: ${primaryColor};
      }
    `);
  }

  if (accentColor) {
    cssRules.push(`
      .accent,
      .text-accent,
      [class*="accent-color"],
      [class*="text-accent"] {
        color: ${accentColor} !important;
      }

      .bg-accent,
      [class*="bg-accent"],
      [class*="accent-bg"] {
        background-color: ${accentColor} !important;
      }

      .border-accent,
      [class*="border-accent"] {
        border-color: ${accentColor} !important;
      }
    `);
  }

  if (bodyFont) {
    const normalizedBodyFont =
      normalizeFontFamily(bodyFont);

    cssRules.push(`
      html,
      body,
      p,
      span,
      li,
      a,
      button,
      input,
      textarea,
      select,
      option,
      label,
      table,
      td,
      th {
        font-family: ${normalizedBodyFont} !important;
      }
    `);
  }

  if (headingFont) {
    const normalizedHeadingFont =
      normalizeFontFamily(headingFont);

    cssRules.push(`
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      .title,
      .section-title,
      .section-heading,
      [class*="title"],
      [class*="heading"] {
        font-family: ${normalizedHeadingFont} !important;
      }
    `);
  }

  if (bodyFontSize) {
    cssRules.push(`
      body,
      p,
      li,
      label,
      input,
      textarea,
      select,
      button {
        font-size: ${normalizeCssSize(bodyFontSize)} !important;
      }
    `);
  }

  if (headingFontSize) {
    cssRules.push(`
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      .title,
      .section-title,
      .section-heading {
        font-size: ${normalizeCssSize(headingFontSize)} !important;
      }
    `);
  }

  if (lineHeight) {
    cssRules.push(`
      body,
      p,
      li,
      label,
      input,
      textarea,
      select,
      button {
        line-height: ${lineHeight} !important;
      }
    `);
  }

  return cssRules.join("\n");
}

function applyEditableValue(
  $: cheerio.CheerioAPI,
  key: string,
  value: string,
): void {
  const safeKey =
    escapeAttributeValue(key);

  $(`[data-editable="${safeKey}"]`).each(
    (_, currentElement) => {
      const selectedElement =
        $(currentElement);

      const editableAttribute =
        selectedElement.attr(
          "data-editable-attr",
        );

      const editableAttributeName =
        selectedElement.attr(
          "data-editable-attr-name",
        );

      const attributeName =
        editableAttributeName ||
        editableAttribute;

      if (attributeName) {
        selectedElement.attr(
          attributeName,
          value,
        );

        return;
      }

      const tagName =
        selectedElement
          .get(0)
          ?.tagName?.toLowerCase();

      if (
        tagName === "img" ||
        tagName === "video" ||
        tagName === "source"
      ) {
        return;
      }

      selectedElement.text(value);
    },
  );

  $(
    `[data-editable-attr="${safeKey}"]`,
  ).each((_, currentElement) => {
    const selectedElement =
      $(currentElement);

    const attributeName =
      selectedElement.attr(
        "data-editable-attr-name",
      );

    if (!attributeName) {
      return;
    }

    selectedElement.attr(
      attributeName,
      value,
    );
  });
}

function applyBackgroundImage(
  $: cheerio.CheerioAPI,
  key: string,
  value: string,
): void {
  const safeKey =
    escapeAttributeValue(key);

  $(
    `[data-editable-bg="${safeKey}"]`,
  ).each((_, currentElement) => {
    const selectedElement =
      $(currentElement);

    selectedElement.attr(
      "data-setbg",
      value,
    );

    const currentStyle =
      selectedElement.attr("style") || "";

    const styleWithoutBackground =
      currentStyle
        .replace(
          /background-image\s*:\s*url\((?:(['"])(.*?)\1|[^)])*\)\s*;?/gi,
          "",
        )
        .trim();

    const cleanedStyle =
      styleWithoutBackground
        .replace(/;+$/g, "")
        .trim();

    const newStyle = [
      cleanedStyle,
      `background-image: url("${value}") !important`,
    ]
      .filter(Boolean)
      .join("; ");

    selectedElement.attr(
      "style",
      `${newStyle};`,
    );
  });
}

function customizeHtml(
  originalHtml: string,
  colores: ConfigRecord,
  tipografia: ConfigRecord,
  contenido: ConfigRecord,
  imagenes: ConfigRecord,
  secciones: ConfigRecord,
  social: ConfigRecord,
  contacto: ConfigRecord,
): string {
  const $ = cheerio.load(originalHtml);

  /*
   * Inyectar el CSS utilizado por el editor dentro del HTML
   * descargado para que los colores y la tipografía se mantengan.
   */
  const customizationCss =
    buildCustomizationCss(
      colores,
      tipografia,
    );

  $("#devioz-custom-styles").remove();

  if (customizationCss.trim()) {
    const styleElement = `
      <style id="devioz-custom-styles">
        ${customizationCss}
      </style>
    `;

    if ($("head").length > 0) {
      $("head").append(styleElement);
    } else {
      $.root().prepend(
        `<head>${styleElement}</head>`,
      );
    }
  }

  /*
   * Aplicar textos y atributos.
   */
  Object.entries(contenido).forEach(
    ([key, value]) => {
      if (
        typeof value !== "string" &&
        typeof value !== "number"
      ) {
        return;
      }

      applyEditableValue(
        $,
        key,
        String(value),
      );
    },
  );

  /*
   * Aplicar imágenes normales y fondos.
   */
  Object.entries(imagenes).forEach(
    ([key, value]) => {
      const safeKey =
        escapeAttributeValue(key);

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        const normalizedValue =
          normalizeImageValue(value);

        $(
          `[data-editable="${safeKey}"]`,
        ).each((_, currentElement) => {
          const selectedElement =
            $(currentElement);

          const editableAttribute =
            selectedElement.attr(
              "data-editable-attr",
            );

          const editableAttributeName =
            selectedElement.attr(
              "data-editable-attr-name",
            );

          const attributeName =
            editableAttributeName ||
            editableAttribute;

          if (attributeName) {
            selectedElement.attr(
              attributeName,
              normalizedValue,
            );

            return;
          }

          const tagName =
            selectedElement
              .get(0)
              ?.tagName?.toLowerCase();

          if (
            tagName === "img" ||
            tagName === "video" ||
            tagName === "source"
          ) {
            selectedElement.attr(
              "src",
              normalizedValue,
            );

            if (tagName === "img") {
              selectedElement.removeAttr(
                "srcset",
              );

              selectedElement.removeAttr(
                "data-src",
              );

              selectedElement.removeAttr(
                "data-lazy-src",
              );
            }
          }
        });

        applyBackgroundImage(
          $,
          key,
          normalizedValue,
        );

        return;
      }

      if (Array.isArray(value)) {
        const imageValues = value.filter(
          (
            imageValue,
          ): imageValue is string =>
            typeof imageValue === "string" &&
            imageValue.trim().length > 0,
        );

        $(
          `[data-editable="${safeKey}"]`,
        ).each(
          (index, currentElement) => {
            const imageValue =
              imageValues[index];

            if (!imageValue) {
              return;
            }

            const normalizedValue =
              normalizeImageValue(
                imageValue,
              );

            const selectedElement =
              $(currentElement);

            const tagName =
              selectedElement
                .get(0)
                ?.tagName?.toLowerCase();

            if (
              tagName === "img" ||
              tagName === "video" ||
              tagName === "source"
            ) {
              selectedElement.attr(
                "src",
                normalizedValue,
              );

              if (tagName === "img") {
                selectedElement.removeAttr(
                  "srcset",
                );

                selectedElement.removeAttr(
                  "data-src",
                );

                selectedElement.removeAttr(
                  "data-lazy-src",
                );
              }
            }
          },
        );

        $(
          `[data-editable-bg="${safeKey}"]`,
        ).each(
          (index, currentElement) => {
            const imageValue =
              imageValues[index];

            if (!imageValue) {
              return;
            }

            const normalizedValue =
              normalizeImageValue(
                imageValue,
              );

            const selectedElement =
              $(currentElement);

            selectedElement.attr(
              "data-setbg",
              normalizedValue,
            );

            const currentStyle =
              selectedElement.attr(
                "style",
              ) || "";

            const styleWithoutBackground =
              currentStyle
                .replace(
                  /background-image\s*:\s*url\((?:(['"])(.*?)\1|[^)])*\)\s*;?/gi,
                  "",
                )
                .trim();

            const cleanedStyle =
              styleWithoutBackground
                .replace(/;+$/g, "")
                .trim();

            const newStyle = [
              cleanedStyle,
              `background-image: url("${normalizedValue}") !important`,
            ]
              .filter(Boolean)
              .join("; ");

            selectedElement.attr(
              "style",
              `${newStyle};`,
            );
          },
        );
      }
    },
  );

  /*
   * Mostrar u ocultar secciones.
   */
  Object.entries(secciones).forEach(
    ([key, value]) => {
      const safeKey =
        escapeAttributeValue(key);

      const section = $(
        `[data-section="${safeKey}"]`,
      );

      if (section.length === 0) {
        return;
      }

      section.each(
        (_, currentElement) => {
          const selectedElement =
            $(currentElement);

          const currentStyle =
            selectedElement.attr(
              "style",
            ) || "";

          const styleWithoutDisplay =
            currentStyle
              .replace(
                /display\s*:\s*[^;]+;?/gi,
                "",
              )
              .trim();

          const cleanedStyle =
            styleWithoutDisplay
              .replace(/;+$/g, "")
              .trim();

          if (value === false) {
            const newStyle = [
              cleanedStyle,
              "display: none !important",
            ]
              .filter(Boolean)
              .join("; ");

            selectedElement.attr(
              "style",
              `${newStyle};`,
            );

            return;
          }

          if (value === true) {
            if (cleanedStyle) {
              selectedElement.attr(
                "style",
                `${cleanedStyle};`,
              );
            } else {
              selectedElement.removeAttr(
                "style",
              );
            }
          }
        },
      );
    },
  );

  /*
   * Aplicar contacto y redes sociales.
   */
  const combinedValues = {
    ...social,
    ...contacto,
  };

  Object.entries(combinedValues).forEach(
    ([key, value]) => {
      if (
        typeof value !== "string" &&
        typeof value !== "number"
      ) {
        return;
      }

      applyEditableValue(
        $,
        key,
        String(value),
      );
    },
  );

  return $.html();
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const configuracionId =
      Number(id);

    if (
      !Number.isInteger(
        configuracionId,
      ) ||
      configuracionId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "El identificador de la configuración no es válido",
        },
        {
          status: 400,
        },
      );
    }

    const [rows] = await db.query(
      `
        SELECT
          c.id,
          c.plantilla_id,
          c.colores,
          c.tipografia,
          c.contenido,
          c.imagenes,
          c.secciones,
          c.social,
          c.contacto,
          t.name AS plantilla_nombre,
          t.folder AS plantilla_folder
        FROM configuraciones c
        INNER JOIN templates t
          ON c.plantilla_id = t.id
        WHERE c.id = ?
        LIMIT 1
      `,
      [configuracionId],
    );

    const configuraciones =
      rows as ConfiguracionRow[];

    if (
      configuraciones.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se encontró la configuración solicitada",
        },
        {
          status: 404,
        },
      );
    }

    const configuracion =
      configuraciones[0];

    if (
      !configuracion.plantilla_folder
    ) {
      return NextResponse.json(
        {
          error:
            "La plantilla no tiene una carpeta asociada",
        },
        {
          status: 400,
        },
      );
    }

    const templateDirectory =
      path.join(
        process.cwd(),
        "public",
        "templates",
        configuracion.plantilla_folder,
      );

    if (
      !fs.existsSync(
        templateDirectory,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "La carpeta original de la plantilla no existe",
        },
        {
          status: 404,
        },
      );
    }

    const htmlFiles =
      getHtmlFiles(
        templateDirectory,
      );

    if (htmlFiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "La plantilla no contiene archivos HTML",
        },
        {
          status: 404,
        },
      );
    }

    const colores = safeParse(
      configuracion.colores,
    );

    const tipografia = safeParse(
      configuracion.tipografia,
    );

    const contenido = safeParse(
      configuracion.contenido,
    );

    const imagenes = safeParse(
      configuracion.imagenes,
    );

    const secciones = safeParse(
      configuracion.secciones,
    );

    const social = safeParse(
      configuracion.social,
    );

    const contacto = safeParse(
      configuracion.contacto,
    );

    const zip = new AdmZip();

    zip.addLocalFolder(
      templateDirectory,
    );

    for (
      const relativeHtmlPath of htmlFiles
    ) {
      const absoluteHtmlPath =
        path.join(
          templateDirectory,
          relativeHtmlPath,
        );

      const originalHtml =
        fs.readFileSync(
          absoluteHtmlPath,
          "utf8",
        );

      const customizedHtml =
        customizeHtml(
          originalHtml,
          colores,
          tipografia,
          contenido,
          imagenes,
          secciones,
          social,
          contacto,
        );

      const zipPath =
        relativeHtmlPath.replace(
          /\\/g,
          "/",
        );

      zip.updateFile(
        zipPath,
        Buffer.from(
          customizedHtml,
          "utf8",
        ),
      );
    }

    const zipBuffer =
      zip.toBuffer();

    const templateName =
      configuracion.plantilla_nombre ||
      `plantilla-${configuracion.plantilla_id}`;

    const fileName =
      sanitizeFileName(
        `${templateName}-personalizada-${configuracion.id}`,
      ) ||
      `plantilla-personalizada-${configuracion.id}`;

    return new NextResponse(
      new Uint8Array(zipBuffer),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/zip",

          "Content-Disposition":
            `attachment; filename="${fileName}.zip"`,

          "Content-Length":
            String(zipBuffer.length),

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma: "no-cache",

          Expires: "0",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "Error generando la plantilla personalizada:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      {
        error:
          "No se pudo generar el archivo ZIP",
        detalle: message,
      },
      {
        status: 500,
      },
    );
  }
}