<div align="center">

  <img src="./logo.svg" alt="Frank Abanto Logo" width="64" height="64" />

  # Frank Abanto — Página Personal & Portafolio

  **Desarrollador Web & Especialista en Automatizaciones e IA · Cajamarca, Perú 🇵🇪**

  [![Sitio Web](https://img.shields.io/badge/Web-frank--abanto.pages.dev-22d3ee?style=flat-square&logo=cloudflare)](https://frank-abanto.pages.dev)
  [![GitHub](https://img.shields.io/badge/GitHub-FrankUsqAbant-181717?style=flat-square&logo=github)](https://github.com/FrankUsqAbant)
  [![X / Twitter](https://img.shields.io/badge/X-@FrankUsqAbanto-000000?style=flat-square&logo=x)](https://x.com/FrankUsqAbanto)
  [![Agenda](https://img.shields.io/badge/Cal.com-Agendar%20Llamada-ff5a36?style=flat-square)](https://cal.com/franquer-abanto-i45gjj/frank.pages.dev)

  <br />

  <a href="https://frank-abanto.pages.dev" target="_blank" rel="noopener noreferrer">
    <img src="./.github/assets/hero-preview.webp" alt="Hero Preview — Clic para abrir el sitio en vivo" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
  </a>

</div>

---

## 👨‍💻 Sobre Mí

Soy **Frank Abanto**, desarrollador web radicado en Cajamarca, Perú. Construyo sitios web de alto impacto, herramientas a medida y automatizaciones de procesos con IA para negocios locales y proyectos digitales.

> *"No vendo plantillas. Tomo las medidas de tu negocio —cómo vendes, cómo respondes, qué haces a mano— y construyo solo lo que le queda bien."*

- 🌐 **Especialidad:** Sitios web modernos, catálogos administrables, tiendas con pedidos por WhatsApp.
- 🤖 **IA & Automatizaciones:** Asistentes y bots con IA (Gemini API, Telegram), workflows en n8n, conexión de APIs y bases de datos (Supabase).
- ⚡ **Filosofía:** Cero código innecesario, máxima velocidad de carga, diseño cuidado al detalle y responsive en todo dispositivo.

---

## 🛠️ Arquitectura y Tecnologías del Sitio

Página construida en un **único archivo estático (`index.html`)** sin build step ni dependencias externas:

- **Efectos Visuales:** Canvas 2D interactivo (física de puntadas bordadas) y WebGL Fragment Shader (seda viva con iluminación reactiva al cursor).
- **El probador:** el visitante escribe su negocio y elige web, asistente o automatización; el hilo le cose una muestra hecha para él.
- **La recepcionista:** asistente con IA (Cloudflare Workers AI) que atiende consultas, averigua lo que el cliente necesita, guarda la ficha en Notion y avisa por Telegram. Nunca da precios ni plazos.
- **Auto-adaptación:** detecta equipos lentos, conexiones lentas o «ahorro de datos» y `prefers-reduced-motion`: muestra lo esencial sin WebGL ni animaciones pesadas. El telón de entrada solo aparece en la primera página de cada visita.
- **Accesibilidad:** enlace «Saltar al contenido», textos para lectores de pantalla, anuncios cortos al coser una muestra y chat como registro accesible.
- **Proyectos solos:** un robot de GitHub Actions lee cada 5 días los repos con el tema `portfolio`, saca las capturas que falten y publica.
- **Despliegue:** Cloudflare Pages, automático en cada cambio a `main` (`.github/workflows/publicar.yml`).

---

## 📂 Organización del Repositorio

```text
├── .github/
│   ├── assets/             # Captura del README
│   └── workflows/
│       └── publicar.yml    # Publica en Cloudflare: en cada cambio y cada 5 días
├── fonts/                  # Fuentes propias (sin Google Fonts)
├── proyectos/              # Capturas de proyectos (las genera el robot)
├── recepcionista/          # Worker de la recepcionista (IA + Notion + Telegram)
│   ├── src/index.js
│   ├── wrangler.jsonc
│   └── conectar-*.ps1      # Guardan las llaves en Cloudflare sin mostrarlas
├── scripts/proyectos.mjs   # Arma proyectos.json y las capturas
├── index.html              # Sitio completo (HTML, CSS y JS en un archivo)
├── 404.html · robots.txt · sitemap.xml · _headers
└── logo.svg · favicon.svg · frank-avatar.webp
```

Lo que sabe la recepcionista se edita en Notion, en la página «Lo que sabe la recepcionista» (sin tocar código).

---

## 💻 Desarrollo Local

```bash
# Servir localmente sin dependencias
npx serve .
```

*Parámetro útil:* `?sinseda` desactiva WebGL para pruebas en entornos sin GPU.

---

## 📬 Contacto

- 🌐 **Web:** [frank-abanto.pages.dev](https://frank-abanto.pages.dev)
- 🐙 **GitHub:** [@FrankUsqAbant](https://github.com/FrankUsqAbant)
- 🐦 **X (Twitter):** [@FrankUsqAbanto](https://x.com/FrankUsqAbanto)
- 📅 **Reunión:** [Agendar llamada de 30 minutos](https://cal.com/franquer-abanto-i45gjj/frank.pages.dev)
