"use client";

import { useEffect, useState } from "react";

interface Configuracion {
  id: number;
  plantilla_id: number;
  plantilla_nombre: string | null;
  usuario_nombre: string;
  usuario_email: string;
  colores: string;
  tipografia: string;
  contenido: string;
  imagenes: string;
  secciones: string;
  social: string;
  contacto: string;
  comentarios: string | null;
  estado: string;
  precio_plantilla: string;
  precio_personalizacion: string;
  precio_total: string;
  created_at: string;
  updated_at: string;
}

const ESTADOS: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
  },
  en_proceso: {
    label: "En proceso",
    color: "bg-blue-100 text-blue-800",
  },
  completado: {
    label: "Completado",
    color: "bg-green-100 text-green-800",
  },
  rechazado: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800",
  },
};

function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function obtenerMensajeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
}

function obtenerResumenComentario(
  comentario: string | null,
) {
  const texto = comentario?.trim();

  if (!texto) {
    return "Sin comentarios";
  }

  if (texto.length <= 55) {
    return texto;
  }

  return `${texto.slice(0, 55)}...`;
}

export default function ComprasPage() {
  const [solicitudes, setSolicitudes] = useState<
    Configuracion[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [seleccionada, setSeleccionada] =
    useState<Configuracion | null>(null);

  useEffect(() => {
    void cargarSolicitudes();
  }, []);

  async function cargarSolicitudes() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/configuraciones",
        {
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(
          "No se pudieron cargar las solicitudes",
        );
      }

      const data: Configuracion[] =
        await res.json();

      setSolicitudes(data);
      setError(null);
    } catch (err: unknown) {
      setError(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  }

  function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleString(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  function formatPrecio(precio: string) {
    const valor = Number(precio);

    if (Number.isNaN(valor)) {
      return "0.00";
    }

    return valor.toFixed(2);
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground">
          Historial de Compras
        </h1>

        <p className="mt-2 text-muted-foreground">
          Aquí se muestran las solicitudes y
          configuraciones enviadas por los clientes.
        </p>

        {loading && (
          <p className="mt-8 text-muted-foreground">
            Cargando solicitudes...
          </p>
        )}

        {error && (
          <div className="mt-8">
            <p className="text-red-600">
              Error: {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void cargarSolicitudes()
              }
              className="mt-3 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Volver a intentar
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          solicitudes.length === 0 && (
            <p className="mt-8 text-muted-foreground">
              Todavía no hay solicitudes enviadas por
              clientes.
            </p>
          )}

        {!loading &&
          !error &&
          solicitudes.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3">
                      Cliente
                    </th>

                    <th className="p-3">
                      Plantilla
                    </th>

                    <th className="p-3">
                      Comentario
                    </th>

                    <th className="p-3">
                      Fecha
                    </th>

                    <th className="p-3">
                      Total
                    </th>

                    <th className="p-3">
                      Estado
                    </th>

                    <th className="p-3">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {solicitudes.map(
                    (solicitud) => {
                      const estadoInfo =
                        ESTADOS[
                          solicitud.estado
                        ] ?? ESTADOS.pending;

                      const tieneComentario =
                        Boolean(
                          solicitud.comentarios?.trim(),
                        );

                      return (
                        <tr
                          key={solicitud.id}
                          className="border-t border-border align-top"
                        >
                          <td className="p-3">
                            <div className="font-medium">
                              {
                                solicitud.usuario_nombre
                              }
                            </div>

                            <div className="text-muted-foreground">
                              {
                                solicitud.usuario_email
                              }
                            </div>
                          </td>

                          <td className="p-3">
                            {solicitud.plantilla_nombre ||
                              `#${solicitud.plantilla_id}`}
                          </td>

                          <td className="max-w-[260px] p-3">
                            <div
                              className={
                                tieneComentario
                                  ? "text-foreground"
                                  : "italic text-muted-foreground"
                              }
                              title={
                                solicitud.comentarios ||
                                "Sin comentarios"
                              }
                            >
                              {obtenerResumenComentario(
                                solicitud.comentarios,
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap p-3">
                            {formatFecha(
                              solicitud.created_at,
                            )}
                          </td>

                          <td className="whitespace-nowrap p-3">
                            S/
                            {formatPrecio(
                              solicitud.precio_total,
                            )}
                          </td>

                          <td className="p-3">
                            <span
                              className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${estadoInfo.color}`}
                            >
                              {estadoInfo.label}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSeleccionada(
                                    solicitud,
                                  )
                                }
                                className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:opacity-90"
                              >
                                Ver configuración
                              </button>

                              <a
                                href={`/api/configuraciones/${solicitud.id}/descargar`}
                                className="rounded bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:opacity-90"
                              >
                                Descargar
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {seleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSeleccionada(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold">
                Detalle de la solicitud #
                {seleccionada.id}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSeleccionada(null)
                }
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <span className="font-semibold">
                  Cliente:
                </span>{" "}
                {seleccionada.usuario_nombre} (
                {seleccionada.usuario_email})
              </div>

              <div>
                <span className="font-semibold">
                  Plantilla:
                </span>{" "}
                {seleccionada.plantilla_nombre ||
                  `#${seleccionada.plantilla_id}`}
              </div>

              <div>
                <span className="font-semibold">
                  Fecha:
                </span>{" "}
                {formatFecha(
                  seleccionada.created_at,
                )}
              </div>

              <div>
                <span className="font-semibold">
                  Estado:
                </span>{" "}
                {ESTADOS[seleccionada.estado]
                  ?.label ?? "Pendiente"}
              </div>

              <div>
                <span className="font-semibold">
                  Precios:
                </span>{" "}
                Plantilla S/
                {formatPrecio(
                  seleccionada.precio_plantilla,
                )}
                {" + "}
                Personalización S/
                {formatPrecio(
                  seleccionada.precio_personalizacion,
                )}
                {" = "}
                Total S/
                {formatPrecio(
                  seleccionada.precio_total,
                )}
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="font-semibold">
                  Comentarios del cliente
                </div>

                {seleccionada.comentarios?.trim() ? (
                  <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-foreground">
                    {
                      seleccionada.comentarios
                    }
                  </p>
                ) : (
                  <p className="mt-2 italic text-muted-foreground">
                    El cliente no agregó comentarios
                    adicionales.
                  </p>
                )}
              </div>

              <div>
                <div className="font-semibold">
                  Colores
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.colores,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Tipografía
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.tipografia,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Textos
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.contenido,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Imágenes
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.imagenes,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Secciones
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.secciones,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Contacto
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.contacto,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <div className="font-semibold">
                  Redes sociales
                </div>

                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(
                    safeParse(
                      seleccionada.social,
                    ),
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setSeleccionada(null)
                  }
                  className="rounded border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cerrar
                </button>

                <a
                  href={`/api/configuraciones/${seleccionada.id}/descargar`}
                  className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                >
                  Descargar ZIP
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}