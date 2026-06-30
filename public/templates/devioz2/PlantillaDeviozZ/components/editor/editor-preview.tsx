'use client';

import { useEffect, useRef } from 'react';
import type { TemplateConfig, Template } from '@/lib/templates';

interface EditorPreviewProps {
  config: TemplateConfig;
  template: Template;
}

export function EditorPreview({ config, template }: EditorPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const injectStyles = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const styleId = 'devioz-editor-styles';
    let style = doc.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = doc.createElement('style');
      style.id = styleId;
      doc.head.appendChild(style);
    }

    style.textContent = `
      :root {
        --gold-crayola: ${config.colors.primary} !important;
        --smoky-black-1: ${config.colors.background} !important;
        --smoky-black-2: ${config.colors.background} !important;
        --smoky-black-3: ${config.colors.background} !important;
        --eerie-black-1: ${config.colors.background} !important;
        --eerie-black-2: ${config.colors.background} !important;
        --eerie-black-3: ${config.colors.background} !important;
        --eerie-black-4: ${config.colors.secondary} !important;
        --white: ${config.colors.text} !important;
        --fontFamily-dm_sans: '${config.typography.fontFamily}', sans-serif !important;
        --fontFamily-forum: '${config.typography.fontFamily}', sans-serif !important;
      }

      body {
        background-color: ${config.colors.background} !important;
        color: ${config.colors.text} !important;
        font-family: '${config.typography.fontFamily}', sans-serif !important;
      }

      .btn {
        color: ${config.colors.primary} !important;
        border-color: ${config.colors.primary} !important;
      }

      .btn::before {
        background-color: ${config.colors.primary} !important;
      }

      .btn-secondary {
        background-color: ${config.colors.primary} !important;
        color: ${config.colors.background} !important;
      }

      .contact-number,
      .section-subtitle,
      .btn-text,
      .menu-card .span,
      .gold { 
        color: ${config.colors.primary} !important; 
      }

      .separator {
        border-color: ${config.colors.primary} !important;
      }

      .hover-underline::after {
        border-color: ${config.colors.primary} !important;
      }

      ::-webkit-scrollbar-thumb {
        background-color: ${config.colors.primary} !important;
      }

      .preload {
        background-color: ${config.colors.primary} !important;
      }

      .back-top-btn {
        background-color: ${config.colors.primary} !important;
      }
    `;

    // Cambiar textos
    const phoneEl = doc.querySelector('a[href^="tel"] .span') as HTMLElement;
    if (phoneEl) phoneEl.textContent = config.contact.phone;

    const emailEl = doc.querySelector('a[href^="mailto"] .span') as HTMLElement;
    if (emailEl) emailEl.textContent = config.contact.email;

    const addressEl = doc.querySelector('.navbar .body-4') as HTMLElement;
    if (addressEl) addressEl.textContent = config.contact.address;

    // Cambiar imágenes
    if (config.images.logo) {
      const logos = doc.querySelectorAll('.logo img') as NodeListOf<HTMLImageElement>;
      logos.forEach(img => img.src = config.images.logo);
    }

    if (config.images.heroImage) {
      const heroImgs = doc.querySelectorAll('.slider-bg img') as NodeListOf<HTMLImageElement>;
      heroImgs.forEach(img => img.src = config.images.heroImage);
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => injectStyles();
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    injectStyles();
  }, [config]);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50">
      <iframe
        ref={iframeRef}
        src="/templates/restobar/index.html"
        className="w-full border-0"
        title="Template Preview"
        style={{ 
          height: '85vh', 
          minHeight: '700px',
          transform: 'scale(0.75)',
          transformOrigin: 'top left',
          width: '133%'
        }}
      />
    </div>
  );
}