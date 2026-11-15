# Frank Abanto — Software e IA hechos a tu medida

Página de inicio del portafolio. Es un sitio **estático de un solo archivo** (`index.html`), sin build ni dependencias.

## Qué incluye
- Hero con titular bordado con puntadas en canvas y seda en WebGL (se adapta solo a equipos lentos).
- Manifiesto, servicios, proceso, proyectos y cierre con etiqueta bordada.
- **Proyectos automáticos:** se leen de GitHub (`FrankUsqAbant`). Aparece todo repo público con el tema `portfolio` **y** una web publicada (campo *Website*). El tema `featured` lo pone primero. `abanto.dev` se excluye. Las capturas se buscan en `abanto.pages.dev/images/projects/<repo>.webp` y, si no existe, se usa la tarjeta de GitHub.
- Carrusel con autodesplazamiento (pausa con cursor, foco, toque, pestaña oculta, fuera de pantalla o movimiento reducido).
- Botones "Agendar llamada" hacia Cal.com.

## Probar en local
```bash
npx serve .
```
Parámetros de prueba: `?sinseda` (sin WebGL, para navegadores sin tarjeta gráfica).

## Publicar
Producción: **https://frank-abanto.pages.dev** (proyecto `frank-abanto` de Cloudflare Pages, cuenta de Frank).

Subir solo los archivos del sitio desde una carpeta limpia (sin `wrangler.jsonc` ni `.git`):
```bash
npx wrangler login            # si la sesión caducó
npx wrangler pages deploy . --project-name frank-abanto --branch main
```
Notas: wrangler 4.x puede mandar un proyecto *nuevo* a Workers en vez de Pages; por eso el proyecto se creó con `--force`. Al existir ya, los despliegues van directos a Pages. Si wrangler usa un ID de cuenta antiguo, fijar `CLOUDFLARE_ACCOUNT_ID`.

## Notas
- Tipografías: Instrument Serif, Inter y JetBrains Mono (Google Fonts); la firma usa La Belle Aurore recortada a "Frank Abanto". Si cambias el texto de la firma, actualiza el parámetro `text=` del enlace.
- `frank-avatar.webp` es un recorte de 96 px del retrato.
