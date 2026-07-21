'use client';

import { useEffect, useRef } from 'react';
import type { TemplateConfig, Template } from '@/lib/templates';

interface EditorPreviewProps {
  config: TemplateConfig;
  template: Template;
}

export function EditorPreview({ config, template }: EditorPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewSrc = template.folder
    ? `/templates/${template.folder}/index.html`
    : '/templates/restobar/index.html';

  const injectStyles = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // ===== 1. COLORES =====
    const styleId = 'devioz-editor-styles';
    let style = doc.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = doc.createElement('style');
      style.id = styleId;
      doc.head.appendChild(style);
    }

    style.textContent = `
      :root {
        --color-primary: ${config.colors.primary} !important;
        --color-secondary: ${config.colors.secondary} !important;
        --color-background: ${config.colors.background} !important;
        --color-text: ${config.colors.text} !important;
        --color-button: ${config.colors.button} !important;
        --font-family: '${config.typography.fontFamily}', sans-serif !important;
      }
    `;

    // ===== 2. TEXTOS =====
    Object.entries(config.content).forEach(([key, value]) => {
      if (typeof value !== 'string' || value === '') return;
      const elementos = doc.querySelectorAll(`[data-editable="${key}"]`);
      elementos.forEach((el) => {
        const element = el as HTMLElement;
        element.textContent = value;
      });
    });

    Object.entries(config.contact).forEach(([key, value]) => {
      if (typeof value !== 'string' || value === '') return;
      const elementos = doc.querySelectorAll(`[data-editable="${key}"]`);
      elementos.forEach((el) => {
        const element = el as HTMLElement;
        element.textContent = value;
      });
    });

    // ===== 3. IMÁGENES =====
    Object.entries(config.images).forEach(([key, value]) => {
      if (typeof value !== 'string' || value === '') return;
      const elementos = doc.querySelectorAll(
        `[data-editable="${key}"]`
      ) as NodeListOf<HTMLImageElement>;
      elementos.forEach((img) => {
        img.src = value;
        img.setAttribute('src', value);
      });

      const backgroundElementos = doc.querySelectorAll(
        `[data-editable-bg="${key}"]`
      ) as NodeListOf<HTMLElement>;
      backgroundElementos.forEach((element) => {
        element.style.backgroundImage = `url(${value})`;
        element.setAttribute('data-setbg', value);
      });
    });

    // ===== 5. VIDEO =====
    const heroVideo = (config as any).video?.heroVideo as string | undefined;
    if (heroVideo) {
      const videos = doc.querySelectorAll(
        '[data-editable="heroVideo"]'
      ) as NodeListOf<HTMLVideoElement>;
      videos.forEach((video) => {
        const source = video.querySelector('source');
        if (source) {
          source.src = heroVideo;
        } else {
          video.src = heroVideo;
        }
        video.load();
      });
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const applyPreview = () => {
      requestAnimationFrame(() => {
        injectStyles();
        window.setTimeout(() => injectStyles(), 150);
      });
    };

    const handleLoad = () => {
      applyPreview();
    };

    iframe.addEventListener('load', handleLoad);
    if (iframe.contentDocument?.readyState === 'complete') {
      applyPreview();
    }

    return () => iframe.removeEventListener('load', handleLoad);
  }, [previewSrc]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;

    requestAnimationFrame(() => {
      injectStyles();
      window.setTimeout(() => injectStyles(), 100);
    });
  }, [
    config.colors.primary,
    config.colors.secondary,
    config.colors.background,
    config.colors.text,
    config.colors.button,
    config.typography.fontFamily,
    config.content,
    config.contact,
    config.images,
    (config as any).video?.heroVideo,
  ]);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50">
      <iframe
        key={previewSrc}
        ref={iframeRef}
        src={previewSrc}
        className="w-full border-0"
        title="Template Preview"
        style={{
          height: '85vh',
          minHeight: '700px',
          transform: 'scale(0.75)',
          transformOrigin: 'top left',
          width: '133%',
        }}
      />
    </div>
  );
}