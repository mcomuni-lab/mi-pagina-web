"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import type {
  TemplateConfig,
  Template,
} from "@/lib/templates";

interface EditorPreviewProps {
  config: TemplateConfig;
  template: Template;
}

type TemplateConfigWithVideo = TemplateConfig & {
  video?: {
    heroVideo?: string;
  };
};

const escapeAttributeValue = (
  value: string,
) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

export function EditorPreview({
  config,
  template,
}: EditorPreviewProps) {
  const iframeRef =
    useRef<HTMLIFrameElement>(null);

  const previewSrc = template.folder
    ? `/templates/${template.folder}/index.html`
    : "/templates/restobar/index.html";

  const injectStyles = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (
      !iframe ||
      !doc?.head ||
      !doc.body
    ) {
      return;
    }

    // =========================================================
    // 1. COLORES Y TIPOGRAFÍA
    // =========================================================
    const styleId =
      "devioz-editor-styles";

    let style = doc.getElementById(
      styleId,
    ) as HTMLStyleElement | null;

    if (!style) {
      style = doc.createElement("style");
      style.id = styleId;
      doc.head.appendChild(style);
    }

    style.textContent = `
      :root {
        --color-primary: ${config.colors.primary};
        --color-secondary: ${config.colors.secondary};
        --color-background: ${config.colors.background};
        --color-text: ${config.colors.text};
        --color-button: ${config.colors.button};
        --font-family: "${config.typography.fontFamily}", sans-serif;
      }

      html,
      body {
        background-color: ${config.colors.background} !important;
        color: ${config.colors.text} !important;
        font-family: "${config.typography.fontFamily}", sans-serif !important;
      }

      body,
      body * {
        font-family: "${config.typography.fontFamily}", sans-serif !important;
      }

      body p,
      body span,
      body li,
      body label,
      body small,
      body strong,
      body em,
      body blockquote,
      body address,
      body td,
      body th {
        color: ${config.colors.text} !important;
      }

      body h1,
      body h2,
      body h3,
      body h4,
      body h5,
      body h6 {
        color: ${config.colors.primary} !important;
      }

      body a:not(.btn):not(.button):not([class*="btn"]):not([class*="button"]) {
        color: ${config.colors.primary} !important;
      }

      body button,
      body input[type="button"],
      body input[type="submit"],
      body .btn,
      body .button,
      body [class*="btn-"],
      body [class*="button-"],
      body a.btn,
      body a.button {
        background-color: ${config.colors.button} !important;
        border-color: ${config.colors.button} !important;
        color: #ffffff !important;
      }

      body button *,
      body .btn *,
      body .button *,
      body [class*="btn-"] *,
      body [class*="button-"] * {
        color: #ffffff !important;
      }

      body header,
      body nav,
      body footer,
      body [class*="header"],
      body [class*="navbar"],
      body [class*="footer"] {
        border-color: ${config.colors.secondary} !important;
      }

      body input,
      body textarea,
      body select {
        color: ${config.colors.text} !important;
        border-color: ${config.colors.secondary} !important;
      }

      body input::placeholder,
      body textarea::placeholder {
        color: ${config.colors.text} !important;
        opacity: 0.65;
      }

      body [class*="primary"]:not(button):not(.btn):not(.button),
      body [class*="accent"]:not(button):not(.btn):not(.button) {
        color: ${config.colors.primary} !important;
      }

      body [class*="secondary"]:not(button):not(.btn):not(.button) {
        color: ${config.colors.secondary} !important;
      }

      body .bg-primary,
      body [class*="bg-primary"] {
        background-color: ${config.colors.primary} !important;
      }

      body .bg-secondary,
      body [class*="bg-secondary"] {
        background-color: ${config.colors.secondary} !important;
      }

      body section:not([style*="background-image"]),
      body main,
      body article {
        color: ${config.colors.text} !important;
      }
    `;

    // =========================================================
    // 2. TEXTOS Y ATRIBUTOS EDITABLES
    // =========================================================
    const applyEditableValues = (
      values: Record<string, unknown>,
    ) => {
      Object.entries(values).forEach(
        ([key, value]) => {
          if (
            typeof value !== "string"
          ) {
            return;
          }

          const escapedKey =
            escapeAttributeValue(key);

          const textElements =
            doc.querySelectorAll(
              `[data-editable="${escapedKey}"]`,
            );

          textElements.forEach(
            (element) => {
              if (
                element instanceof
                  HTMLImageElement ||
                element instanceof
                  HTMLVideoElement ||
                element instanceof
                  HTMLSourceElement
              ) {
                return;
              }

              element.textContent =
                value;
            },
          );

          const attributeElements =
            doc.querySelectorAll(
              `[data-editable-attr="${escapedKey}"]`,
            );

          attributeElements.forEach(
            (element) => {
              const attributeName =
                element.getAttribute(
                  "data-editable-attr-name",
                );

              if (!attributeName) {
                return;
              }

              element.setAttribute(
                attributeName,
                value,
              );
            },
          );

          const editableAttributeElements =
            doc.querySelectorAll(
              `[data-editable="${escapedKey}"][data-editable-attr-name]`,
            );

          editableAttributeElements.forEach(
            (element) => {
              const attributeName =
                element.getAttribute(
                  "data-editable-attr-name",
                );

              if (!attributeName) {
                return;
              }

              element.setAttribute(
                attributeName,
                value,
              );
            },
          );
        },
      );
    };

    applyEditableValues(
      config.content,
    );

    applyEditableValues(
      config.contact,
    );

    // =========================================================
    // 3. IMÁGENES NORMALES, GALERÍAS Y FONDOS
    // =========================================================
    Object.entries(
      config.images,
    ).forEach(([key, value]) => {
      const escapedKey =
        escapeAttributeValue(key);

      const imageElements =
        Array.from(
          doc.querySelectorAll<HTMLImageElement>(
            `img[data-editable="${escapedKey}"]`,
          ),
        );

      const backgroundElements =
        Array.from(
          doc.querySelectorAll<HTMLElement>(
            `[data-editable-bg="${escapedKey}"]`,
          ),
        );

      if (
        typeof value === "string"
      ) {
        if (!value) {
          return;
        }

        imageElements.forEach(
          (image) => {
            image.src = value;

            image.setAttribute(
              "src",
              value,
            );
          },
        );

        backgroundElements.forEach(
          (element) => {
            const safeValue =
              value.replace(
                /"/g,
                '\\"',
              );

            element.style.backgroundImage =
              `url("${safeValue}")`;

            element.setAttribute(
              "data-setbg",
              value,
            );
          },
        );

        return;
      }

      if (Array.isArray(value)) {
        imageElements.forEach(
          (image, index) => {
            const imageUrl =
              value[index];

            if (
              typeof imageUrl !==
                "string" ||
              !imageUrl
            ) {
              return;
            }

            image.src = imageUrl;

            image.setAttribute(
              "src",
              imageUrl,
            );
          },
        );

        backgroundElements.forEach(
          (element, index) => {
            const imageUrl =
              value[index];

            if (
              typeof imageUrl !==
                "string" ||
              !imageUrl
            ) {
              return;
            }

            const safeValue =
              imageUrl.replace(
                /"/g,
                '\\"',
              );

            element.style.backgroundImage =
              `url("${safeValue}")`;

            element.setAttribute(
              "data-setbg",
              imageUrl,
            );
          },
        );
      }
    });

    // =========================================================
    // 4. VIDEO
    // =========================================================
    const videoConfig =
      config as TemplateConfigWithVideo;

    const heroVideo =
      videoConfig.video?.heroVideo;

    if (heroVideo) {
      const videos =
        doc.querySelectorAll<HTMLVideoElement>(
          '[data-editable="heroVideo"]',
        );

      videos.forEach((video) => {
        const source =
          video.querySelector<HTMLSourceElement>(
            "source",
          );

        if (source) {
          source.src = heroVideo;
        } else {
          video.src = heroVideo;
        }

        video.load();
      });
    }
  }, [config]);

  // =========================================================
  // 5. APLICAR AL CARGAR EL IFRAME
  // =========================================================
  useEffect(() => {
    const iframe =
      iframeRef.current;

    if (!iframe) {
      return;
    }

    const applyPreview = () => {
      requestAnimationFrame(() => {
        injectStyles();

        window.setTimeout(
          injectStyles,
          150,
        );

        window.setTimeout(
          injectStyles,
          500,
        );
      });
    };

    const handleLoad = () => {
      applyPreview();
    };

    iframe.addEventListener(
      "load",
      handleLoad,
    );

    if (
      iframe.contentDocument
        ?.readyState === "complete"
    ) {
      applyPreview();
    }

    return () => {
      iframe.removeEventListener(
        "load",
        handleLoad,
      );
    };
  }, [
    previewSrc,
    injectStyles,
  ]);

  // =========================================================
  // 6. CAMBIOS EN TIEMPO REAL
  // =========================================================
  useEffect(() => {
    const iframe =
      iframeRef.current;

    if (
      !iframe?.contentDocument?.body
    ) {
      return;
    }

    requestAnimationFrame(() => {
      injectStyles();

      window.setTimeout(
        injectStyles,
        100,
      );
    });
  }, [injectStyles]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 shadow-2xl">
      <iframe
        key={previewSrc}
        ref={iframeRef}
        src={previewSrc}
        className="w-full border-0"
        title="Vista previa de la plantilla"
        style={{
          height: "85vh",
          minHeight: "700px",
          transform: "scale(0.75)",
          transformOrigin:
            "top left",
          width: "133%",
        }}
      />
    </div>
  );
}