DEVIOZ — Sitio + Panel Administrador
=====================================

Cómo usar:
1. Abre la carpeta en Visual Studio Code.
2. Abre `index.html` en el navegador (doble clic, o usa la extensión "Live Server").
3. Para administrar contenido, abre `admin.html` o haz clic en el botón "Admin".

Panel Administrador (admin.html)
- Textos: edita cualquier texto del sitio. Se guarda automáticamente.
- Imágenes y videos: sube archivos desde tu computadora. Se almacenan en
  IndexedDB del navegador.
- Servicios / Características / Portafolio / Ventajas / Productos:
  añade, edita o elimina ítems libremente.
- Exportar contenido: descarga `devioz-content.json` con todos los textos.
- Importar: carga un JSON exportado para restaurar.
- Restaurar todo: vuelve a los valores por defecto y borra los archivos subidos.

Notas técnicas:
- Los textos se guardan en localStorage (clave `devioz.content`).
- Las imágenes/videos se guardan en IndexedDB (base de datos `deviozDB`).
- Esto significa que el contenido editado vive en TU navegador. Para
  publicarlo en internet con cambios persistentes para todos los visitantes,
  necesitarías un backend (puedes usar el JSON exportado como base).

Estructura:
  index.html        Sitio público
  admin.html        Panel administrador
  css/styles.css    Estilos del sitio
  css/admin.css     Estilos del panel
  js/data.js        Contenido por defecto
  js/db.js          Persistencia (localStorage + IndexedDB)
  js/site.js        Renderiza el sitio
  js/admin.js       Lógica del panel
