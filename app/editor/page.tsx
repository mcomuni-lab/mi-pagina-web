"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Palette,
  Type,
  Image as ImageIcon,
  Layers,
  Share2,
  Settings,
  Save,
  Eye,
  Send,
  ChevronLeft,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

import {
  defaultConfig,
  type TemplateConfig,
  type Template,
} from "@/lib/templates";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { EditorPreview } from "@/components/editor/editor-preview";
import { ColorPanel } from "@/components/editor/panels/color-panel";
import { TypographyPanel } from "@/components/editor/panels/typography-panel";
import { ContentPanel } from "@/components/editor/panels/content-panel";
import { SectionsPanel } from "@/components/editor/panels/sections-panel";
import { SocialPanel } from "@/components/editor/panels/social-panel";
import { ContactPanel } from "@/components/editor/panels/contact-panel";
import {
  ImagesPanel,
  type DynamicImageField,
} from "@/components/editor/panels/images-panel";

type PanelType =
  | "colors"
  | "typography"
  | "images"
  | "content"
  | "sections"
  | "social"
  | "contact"
  | "comments";

type ViewportSize =
  | "desktop"
  | "tablet"
  | "mobile";

type DynamicField = {
  key: string;
  label: string;
  originalValue?: string;
  multiline?: boolean;
};

type DetectedSection = {
  name: string;
  priority: number;
};

const panels = [
  {
    id: "colors" as PanelType,
    label: "Colores",
    icon: Palette,
  },
  {
    id: "typography" as PanelType,
    label: "Tipografía",
    icon: Type,
  },
  {
    id: "images" as PanelType,
    label: "Imágenes",
    icon: ImageIcon,
  },
  {
    id: "content" as PanelType,
    label: "Contenido",
    icon: Layers,
  },
  {
    id: "sections" as PanelType,
    label: "Secciones",
    icon: Layers,
  },
  {
    id: "social" as PanelType,
    label: "Redes Sociales",
    icon: Share2,
  },
  {
    id: "contact" as PanelType,
    label: "Contacto",
    icon: Settings,
  },
  {
    id: "comments" as PanelType,
    label: "Comentarios",
    icon: MessageSquare,
  },
];

const formatFieldLabel = (
  key: string,
) =>
  key
    .replace(/[_-]+/g, " ")
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /^./,
      (character) =>
        character.toUpperCase(),
    );

const SECTION_RULES: Array<{
  pattern: RegExp;
  name: string;
  priority: number;
}> = [
  {
    pattern:
      /\b(header|navbar|navigation|menu|logo|brand)\b/i,
    name: "General",
    priority: 0,
  },
  {
    pattern:
      /\b(hero|banner|slider|carousel|home|masthead|cover)\b/i,
    name: "Portada",
    priority: 10,
  },
  {
    pattern:
      /\b(about|nosotros|company|empresa|history|historia)\b/i,
    name: "Nosotros",
    priority: 20,
  },
  {
    pattern:
      /\b(class|classes|clase|clases|program|programs|course|courses)\b/i,
    name: "Clases",
    priority: 30,
  },
  {
    pattern:
      /\b(service|services|servicio|servicios|feature|features|benefit|benefits)\b/i,
    name: "Servicios",
    priority: 35,
  },
  {
    pattern:
      /\b(gallery|galeria|portfolio|project|projects|work|works)\b/i,
    name: "Galería",
    priority: 40,
  },
  {
    pattern:
      /\b(team|trainer|trainers|member|members|staff|coach|coaches|expert|experts)\b/i,
    name: "Equipo",
    priority: 50,
  },
  {
    pattern:
      /\b(testimonial|testimonials|review|reviews|opinion|opiniones)\b/i,
    name: "Testimonios",
    priority: 60,
  },
  {
    pattern:
      /\b(price|pricing|plan|plans|membership|package|packages)\b/i,
    name: "Planes",
    priority: 70,
  },
  {
    pattern:
      /\b(contact|contacto|location|ubicacion|address|direccion)\b/i,
    name: "Contacto",
    priority: 80,
  },
  {
    pattern:
      /\b(footer|pie-de-pagina|copyright)\b/i,
    name: "Pie de página",
    priority: 90,
  },
];

const cleanSectionName = (
  value: string,
): string =>
  value
    .replace(/[_-]+/g, " ")
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /\b(section|container|wrapper|content|area|row|col|column|inner|outer)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

const findSectionHeading = (
  element: Element,
): string => {
  const section = element.closest(
    "section, header, footer, main, article, [role='region']",
  );

  if (!section) {
    return "";
  }

  const heading = section.querySelector(
    "h1, h2, h3, h4, [class*='title'], [class*='heading']",
  );

  const text =
    heading?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  if (!text || text.length > 45) {
    return "";
  }

  return text;
};

const detectSection = (
  element: Element,
): DetectedSection => {
  const contextParts: string[] = [];
  let current: Element | null =
    element;
  let depth = 0;

  while (current && depth < 7) {
    contextParts.push(
      current.tagName,
      current.id || "",
      current.className || "",
      current.getAttribute(
        "data-section",
      ) || "",
      current.getAttribute(
        "aria-label",
      ) || "",
    );

    current = current.parentElement;
    depth += 1;
  }

  const context =
    contextParts.join(" ");

  for (const rule of SECTION_RULES) {
    if (rule.pattern.test(context)) {
      return {
        name: rule.name,
        priority: rule.priority,
      };
    }
  }

  const closestSection =
    element.closest(
      "section[id], section[class], header[id], header[class], footer[id], footer[class], main[id], main[class], article[id], article[class]",
    );

  if (closestSection) {
    const candidate =
      closestSection.id ||
      closestSection.getAttribute(
        "data-section",
      ) ||
      closestSection.className ||
      "";

    const cleaned =
      cleanSectionName(candidate)
        .split(" ")
        .filter(
          (part) =>
            part.length > 2,
        )
        .slice(0, 3)
        .join(" ");

    if (cleaned) {
      return {
        name: formatFieldLabel(
          cleaned,
        ),
        priority: 75,
      };
    }
  }

  const heading =
    findSectionHeading(element);

  if (heading) {
    return {
      name: heading,
      priority: 75,
    };
  }

  return {
    name: "Otras imágenes",
    priority: 85,
  };
};

const buildImageLabel = ({
  key,
  section,
  type,
  sectionIndex,
  globalIndex,
}: {
  key: string;
  section: string;
  type:
    | "image"
    | "background";
  sectionIndex: number;
  globalIndex: number;
}): string => {
  const normalizedKey =
    key.toLowerCase();

  if (normalizedKey === "logo") {
    return "Logo principal";
  }

  if (
    normalizedKey.startsWith(
      "logo-",
    )
  ) {
    return `Logo ${sectionIndex}`;
  }

  if (
    /\b(hero|banner|cover|main)\b/i.test(
      normalizedKey,
    ) &&
    type === "image"
  ) {
    return `${section} · Imagen principal`;
  }

  if (type === "background") {
    return sectionIndex === 1
      ? `${section} · Fondo`
      : `${section} · Fondo ${sectionIndex}`;
  }

  const usefulKey =
    formatFieldLabel(key);

  if (
    usefulKey &&
    !/^(Image|Img|Photo|Picture|Background)( \d+)?$/i.test(
      usefulKey,
    )
  ) {
    return `${section} · ${usefulKey}`;
  }

  return `${section} · Imagen ${
    sectionIndex || globalIndex
  }`;
};

const buildTextLabel = ({
  key,
  section,
  sectionIndex,
  element,
}: {
  key: string;
  section: string;
  sectionIndex: number;
  element: Element;
}): string => {
  const normalizedKey =
    key.toLowerCase();

  const tagName =
    element.tagName.toLowerCase();

  const text =
    element.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  if (
    normalizedKey ===
    "businessname"
  ) {
    return "General · Nombre del negocio";
  }

  if (
    normalizedKey === "tagline"
  ) {
    return "General · Frase principal";
  }

  if (
    normalizedKey ===
    "herotitle"
  ) {
    return "Portada · Título principal";
  }

  if (
    normalizedKey ===
    "description"
  ) {
    return `${section} · Descripción`;
  }

  if (
    normalizedKey === "ctatext"
  ) {
    return `${section} · Texto del botón`;
  }

  if (
    normalizedKey ===
    "abouttext"
  ) {
    return "Nosotros · Descripción";
  }

  if (
    normalizedKey ===
    "bannertitle"
  ) {
    return "Portada · Título";
  }

  if (
    normalizedKey ===
    "bannersubtitle"
  ) {
    return "Portada · Subtítulo";
  }

  if (
    normalizedKey ===
    "bannerbuttontext"
  ) {
    return "Portada · Texto del botón";
  }

  const usefulKey =
    formatFieldLabel(key);

  if (
    /^h[1-6]$/.test(tagName)
  ) {
    return sectionIndex === 1
      ? `${section} · Título`
      : `${section} · Título ${sectionIndex}`;
  }

  if (tagName === "button") {
    return sectionIndex === 1
      ? `${section} · Texto del botón`
      : `${section} · Botón ${sectionIndex}`;
  }

  if (tagName === "a") {
    return sectionIndex === 1
      ? `${section} · Enlace`
      : `${section} · Enlace ${sectionIndex}`;
  }

  if (
    usefulKey &&
    !/^(P|Span|Label|Strong|Em|Small|Text)( \d+)?$/i.test(
      usefulKey,
    )
  ) {
    return `${section} · ${usefulKey}`;
  }

  if (
    text &&
    text.length <= 34
  ) {
    return `${section} · ${text}`;
  }

  return sectionIndex === 1
    ? `${section} · Texto`
    : `${section} · Texto ${sectionIndex}`;
};

function EditorPageContent() {
  const searchParams =
    useSearchParams();

  const templateId =
    searchParams.get("template");

  const [
    template,
    setTemplate,
  ] =
    useState<Template | null>(
      null,
    );

  const [
    loadingTemplate,
    setLoadingTemplate,
  ] = useState(true);

  const [config, setConfig] =
    useState<TemplateConfig>(
      defaultConfig,
    );

  const [
    comentarios,
    setComentarios,
  ] = useState("");

  const [
    activePanel,
    setActivePanel,
  ] =
    useState<PanelType>(
      "colors",
    );

  const [
    viewport,
    setViewport,
  ] =
    useState<ViewportSize>(
      "desktop",
    );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    dynamicTextFields,
    setDynamicTextFields,
  ] = useState<DynamicField[]>(
    [],
  );

  const [
    dynamicImageFields,
    setDynamicImageFields,
  ] = useState<
    DynamicImageField[]
  >([]);

  useEffect(() => {
    if (!templateId) {
      setLoadingTemplate(false);
      return;
    }

    const loadTemplate =
      async () => {
        try {
          const response =
            await fetch(
              `/api/plantillas/${templateId}`,
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Error al cargar la plantilla",
            );
          }

          setTemplate({
            id: String(
              data.id,
            ),
            name: data.name,
            category:
              data.category,
            price: Number(
              data.price,
            ),
            rating:
              data.rating ?? 5,
            reviews:
              data.reviews ?? 0,
            image:
              data.image_url || "",
            featured:
              data.featured ??
              false,
            description:
              data.description || "",
            tags:
              data.tags ?? [],
            folder:
              data.folder || "",
          });
        } catch (error) {
          console.error(
            "Error cargando plantilla:",
            error,
          );
        } finally {
          setLoadingTemplate(
            false,
          );
        }
      };

    void loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (!template?.folder) {
      setDynamicTextFields([]);
      setDynamicImageFields(
        [],
      );
      return;
    }

    let cancelled = false;

    const loadDynamicFields =
      async () => {
        try {
          const htmlPath =
            `/templates/${template.folder}/index.html`;

          const response =
            await fetch(
              htmlPath,
            );

          if (!response.ok) {
            throw new Error(
              "No se pudo cargar el HTML de la plantilla",
            );
          }

          const html =
            await response.text();

          if (cancelled) {
            return;
          }

          const parser =
            new DOMParser();

          const documentParsed =
            parser.parseFromString(
              html,
              "text/html",
            );

          const discoveredTextFields =
            new Map<
              string,
              DynamicField & {
                order: number;
                sectionPriority: number;
              }
            >();

          const textSectionCounters =
            new Map<
              string,
              number
            >();

          documentParsed
            .querySelectorAll(
              "[data-editable]",
            )
            .forEach(
              (
                element,
                domIndex,
              ) => {
                const key =
                  element.getAttribute(
                    "data-editable",
                  );

                if (!key) {
                  return;
                }

                const tagName =
                  element.tagName.toLowerCase();

                if (
                  tagName ===
                    "img" ||
                  tagName ===
                    "video" ||
                  tagName ===
                    "source"
                ) {
                  return;
                }

                if (
                  discoveredTextFields.has(
                    key,
                  )
                ) {
                  return;
                }

                const section =
                  detectSection(
                    element,
                  );

                const counterKey =
                  `${section.name}-${tagName}`;

                const sectionIndex =
                  (textSectionCounters.get(
                    counterKey,
                  ) || 0) + 1;

                textSectionCounters.set(
                  counterKey,
                  sectionIndex,
                );

                const originalValue =
                  element.textContent
                    ?.replace(
                      /\s+/g,
                      " ",
                    )
                    .trim() || "";

                discoveredTextFields.set(
                  key,
                  {
                    key,
                    label:
                      buildTextLabel(
                        {
                          key,
                          section:
                            section.name,
                          sectionIndex,
                          element,
                        },
                      ),
                    originalValue,
                    multiline:
                      tagName ===
                        "p" ||
                      tagName ===
                        "textarea" ||
                      originalValue.length >
                        80,
                    order:
                      domIndex,
                    sectionPriority:
                      section.priority,
                  },
                );
              },
            );

          const textFields =
            Array.from(
              discoveredTextFields.values(),
            )
              .sort(
                (
                  firstField,
                  secondField,
                ) => {
                  if (
                    firstField.sectionPriority !==
                    secondField.sectionPriority
                  ) {
                    return (
                      firstField.sectionPriority -
                      secondField.sectionPriority
                    );
                  }

                  return (
                    firstField.order -
                    secondField.order
                  );
                },
              )
              .map(
                ({
                  order:
                    _order,
                  sectionPriority:
                    _sectionPriority,
                  ...field
                }) => field,
              );

          const discoveredImageFields =
            new Map<
              string,
              DynamicImageField & {
                order: number;
                sectionPriority: number;
              }
            >();

          const sectionCounters =
            new Map<
              string,
              number
            >();

          let globalImageIndex =
            0;

          documentParsed
            .querySelectorAll(
              "img[data-editable], [data-editable-bg]",
            )
            .forEach(
              (
                element,
                domIndex,
              ) => {
                const imageKey =
                  element.getAttribute(
                    "data-editable",
                  );

                const backgroundKey =
                  element.getAttribute(
                    "data-editable-bg",
                  );

                const key =
                  imageKey ||
                  backgroundKey;

                if (!key) {
                  return;
                }

                if (
                  discoveredImageFields.has(
                    key,
                  )
                ) {
                  return;
                }

                const type:
                  | "image"
                  | "background" =
                  backgroundKey
                    ? "background"
                    : "image";

                const section =
                  key ===
                  "logo"
                    ? {
                        name: "General",
                        priority: 0,
                      }
                    : detectSection(
                        element,
                      );

                const counterKey =
                  `${section.name}-${type}`;

                const sectionIndex =
                  (sectionCounters.get(
                    counterKey,
                  ) || 0) + 1;

                sectionCounters.set(
                  counterKey,
                  sectionIndex,
                );

                globalImageIndex +=
                  1;

                let originalValue =
                  "";

                if (
                  type ===
                  "image"
                ) {
                  originalValue =
                    element.getAttribute(
                      "src",
                    ) || "";
                } else {
                  const dataBackground =
                    element.getAttribute(
                      "data-setbg",
                    ) || "";

                  const inlineBackground =
                    element instanceof
                    HTMLElement
                      ? element.style
                          .backgroundImage
                      : "";

                  originalValue =
                    dataBackground ||
                    inlineBackground ||
                    "";
                }

                discoveredImageFields.set(
                  key,
                  {
                    key,
                    label:
                      buildImageLabel(
                        {
                          key,
                          section:
                            section.name,
                          type,
                          sectionIndex,
                          globalIndex:
                            globalImageIndex,
                        },
                      ),
                    type,
                    originalValue,
                    order:
                      key ===
                      "logo"
                        ? -1
                        : domIndex,
                    sectionPriority:
                      section.priority,
                  },
                );
              },
            );

          const imageFields =
            Array.from(
              discoveredImageFields.values(),
            )
              .sort(
                (
                  firstField,
                  secondField,
                ) => {
                  if (
                    firstField.sectionPriority !==
                    secondField.sectionPriority
                  ) {
                    return (
                      firstField.sectionPriority -
                      secondField.sectionPriority
                    );
                  }

                  return (
                    firstField.order -
                    secondField.order
                  );
                },
              )
              .map(
                ({
                  order:
                    _order,
                  sectionPriority:
                    _sectionPriority,
                  ...field
                }) => field,
              );

          if (!cancelled) {
            setDynamicTextFields(
              textFields,
            );

            setDynamicImageFields(
              imageFields,
            );

            setConfig(
              (
                previousConfig,
              ) => {
                const updatedContent =
                  {
                    ...previousConfig.content,
                  };

                textFields.forEach(
                  (field) => {
                    const currentValue =
                      updatedContent[
                        field.key
                      ];

                    if (
                      currentValue ===
                        undefined ||
                      currentValue ===
                        ""
                    ) {
                      updatedContent[
                        field.key
                      ] =
                        field.originalValue ||
                        "";
                    }
                  },
                );

                const updatedImages =
                  {
                    ...previousConfig.images,
                  };

                imageFields.forEach(
                  (field) => {
                    const currentValue =
                      updatedImages[
                        field.key
                      ];

                    if (
                      currentValue ===
                        undefined ||
                      currentValue ===
                        ""
                    ) {
                      updatedImages[
                        field.key
                      ] =
                        field.originalValue ||
                        "";
                    }
                  },
                );

                return {
                  ...previousConfig,
                  content:
                    updatedContent,
                  images:
                    updatedImages,
                };
              },
            );
          }
        } catch (error) {
          console.error(
            "Error generando campos dinámicos:",
            error,
          );

          if (!cancelled) {
            setDynamicTextFields(
              [],
            );

            setDynamicImageFields(
              [],
            );
          }
        }
      };

    void loadDynamicFields();

    return () => {
      cancelled = true;
    };
  }, [template?.folder]);

  const updateConfig =
    useCallback(
      (
        updates: Partial<TemplateConfig>,
      ) => {
        setConfig(
          (
            previousConfig,
          ) => ({
            ...previousConfig,
            ...updates,
          }),
        );
      },
      [],
    );

  const handleSetActivePanel =
    useCallback(
      (panel: string) => {
        setActivePanel(
          panel as PanelType,
        );
      },
      [],
    );

  const guardarConfiguracion =
    async () => {
      if (!template) {
        throw new Error(
          "La plantilla no está disponible",
        );
      }

      const response =
        await fetch(
          "/api/configuraciones",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              {
                plantilla_id:
                  template.id,
                colores:
                  config.colors,
                tipografia:
                  config.typography,
                contenido:
                  config.content,
                imagenes:
                  config.images,
                secciones:
                  config.sections,
                social:
                  config.social,
                contacto:
                  config.contact,
                comentarios:
                  comentarios.trim(),
              },
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Debes iniciar sesión para guardar la configuración",
          );
        }

        throw new Error(
          data.error ||
            "No se pudo guardar la configuración",
        );
      }

      return data;
    };

  const handleSave =
    async () => {
      if (
        !template ||
        isSaving
      ) {
        return;
      }

      setIsSaving(true);

      try {
        await guardarConfiguracion();

        alert(
          "¡Configuración guardada exitosamente!",
        );
      } catch (error) {
        console.error(
          "Error al guardar:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Error al guardar";

        alert(message);
      } finally {
        setIsSaving(false);
      }
    };

  const handleSendToTeam =
    async () => {
      if (
        !template ||
        isSending
      ) {
        return;
      }

      setIsSending(true);

      try {
        await guardarConfiguracion();

        alert(
          "¡Configuración enviada al equipo de desarrollo!",
        );
      } catch (error) {
        console.error(
          "Error al enviar configuración:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Error al enviar";

        alert(message);
      } finally {
        setIsSending(false);
      }
    };

  const renderPanel = () => {
    switch (activePanel) {
      case "colors":
        return (
          <ColorPanel
            config={config}
            updateConfig={
              updateConfig
            }
          />
        );

      case "typography":
        return (
          <TypographyPanel
            config={config}
            updateConfig={
              updateConfig
            }
          />
        );

      case "images":
        return (
          <ImagesPanel
            config={
              config.images
            }
            dynamicFields={
              dynamicImageFields
            }
            onChange={(
              images,
            ) =>
              updateConfig({
                images: {
                  ...config.images,
                  ...images,
                },
              })
            }
          />
        );

      case "content":
        return (
          <ContentPanel
            config={config}
            updateConfig={
              updateConfig
            }
            dynamicTextFields={
              dynamicTextFields
            }
          />
        );

      case "sections":
        return (
          <SectionsPanel
            config={config}
            updateConfig={
              updateConfig
            }
          />
        );

      case "social":
        return (
          <SocialPanel
            config={config}
            updateConfig={
              updateConfig
            }
          />
        );

      case "contact":
        return (
          <ContactPanel
            config={config}
            updateConfig={
              updateConfig
            }
          />
        );

      case "comments":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">
                Comentarios adicionales
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Escribe cualquier indicación que quieras enviar al equipo de desarrollo.
              </p>
            </div>

            <textarea
              value={comentarios}
              onChange={(event) =>
                setComentarios(
                  event.target
                    .value,
                )
              }
              placeholder="Ejemplo: Quiero que el logo sea más grande, que el botón diga Reservar ahora y que cambien la imagen principal..."
              maxLength={2000}
              rows={10}
              className="min-h-[220px] w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Este comentario aparecerá en el historial de compras.
              </span>

              <span>
                {
                  comentarios.length
                }
                /2000
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loadingTemplate) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Cargando plantilla...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Plantilla no encontrada.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="glass flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-4">
          <Link href="/marketplace">
            <Button
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Atrás
            </Button>
          </Link>

          <div className="h-6 w-px bg-border" />

          <div>
            <h1 className="text-sm font-semibold">
              {template.name}
            </h1>

            <p className="text-xs text-muted-foreground">
              Editor Visual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            {[
              {
                id: "desktop" as ViewportSize,
                icon: Monitor,
              },
              {
                id: "tablet" as ViewportSize,
                icon: Tablet,
              },
              {
                id: "mobile" as ViewportSize,
                icon: Smartphone,
              },
            ].map(
              ({
                id,
                icon: Icon,
              }) => (
                <Button
                  key={id}
                  variant={
                    viewport ===
                    id
                      ? "default"
                      : "ghost"
                  }
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setViewport(
                      id,
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ),
            )}
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={
              handleSave
            }
            disabled={
              isSaving ||
              isSending
            }
          >
            <Save className="mr-2 h-4 w-4" />

            {isSaving
              ? "Guardando..."
              : "Guardar"}
          </Button>

          <Button
            className="bg-primary hover:bg-primary/90"
            size="sm"
            onClick={
              handleSendToTeam
            }
            disabled={
              isSending ||
              isSaving
            }
          >
            <Send className="mr-2 h-4 w-4" />

            {isSending
              ? "Enviando..."
              : "Enviar al Equipo"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          panels={panels}
          activePanel={
            activePanel
          }
          setActivePanel={
            handleSetActivePanel
          }
        />

        <motion.div
          className="glass w-80 shrink-0 overflow-y-auto border-r border-border/50"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <div className="p-4">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              {panels.find(
                (panel) =>
                  panel.id ===
                  activePanel,
              )?.icon && (
                <span className="text-primary">
                  {(() => {
                    const Icon =
                      panels.find(
                        (
                          panel,
                        ) =>
                          panel.id ===
                          activePanel,
                      )?.icon;

                    return Icon ? (
                      <Icon className="h-5 w-5" />
                    ) : null;
                  })()}
                </span>
              )}

              {
                panels.find(
                  (panel) =>
                    panel.id ===
                    activePanel,
                )?.label
              }
            </h2>

            {renderPanel()}
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col overflow-auto bg-secondary/30 p-4">
          <div
            className={cn(
              "mx-auto transition-all duration-300",
              viewport ===
                "desktop" &&
                "w-full max-w-[1200px]",
              viewport ===
                "tablet" &&
                "w-[768px]",
              viewport ===
                "mobile" &&
                "w-[375px]",
            )}
            style={{
              minHeight:
                "900px",
            }}
          >
            <EditorPreview
              config={config}
              template={
                template
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-muted-foreground">
          Cargando editor...
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}