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

## 🚀 Proyectos Destacados en el Portafolio

La web se sincroniza automáticamente con mi API de GitHub para mostrar proyectos con la etiqueta `portfolio`:

| Proyecto | Descripción | Stack | Demo |
|---|---|---|:---:|
| **Chavez Originals** | Tienda de calzado con vitrina interactiva, catálogo administrable en Supabase y pedidos por WhatsApp. | React, Supabase, Tailwind, Vite | [Ver Demo ↗](https://chavez-originals.pages.dev) |
| **Hostal Aguilar** | Plataforma para hospedaje con concepto *«la luz encendida»*, reservas por WhatsApp y panel. | React, Supabase, Tailwind, Vite | [Ver Demo ↗](https://hostal-aguilar.pages.dev) |
| **JIRÉH Pastelería** | Catálogo con módulo interactivo *«Arma tu torta»* en vivo y pedidos directos por WhatsApp. | React, Supabase, Tailwind, Vite | [Ver Demo ↗](https://jireh-pasteleria.pages.dev) |
| **Concepto Un Día** | Experimento visual con cielo interactivo en WebGL según la hora y posición del sol. | HTML5, Canvas, WebGL Shader | [Ver Demo ↗](https://concepto-un-dia.pages.dev) |

---

## 🛠️ Arquitectura y Tecnologías del Sitio

Página construida en un **único archivo estático (`index.html`)** sin build step ni dependencias externas:

- **Efectos Visuales:** Canvas 2D interactivo (física de puntadas bordadas) y WebGL Fragment Shader (seda viva con iluminación reactiva al cursor).
- **Auto-adaptación:** Detecta equipos lentos o preferencias de reducción de movimiento (`prefers-reduced-motion`) para ahorrar batería y recursos.
- **Seguridad:** Aislamiento con `rel="noopener noreferrer"`, sanitización estricta de URLs de la API de GitHub y cabeceras reforzadas (`_headers`).
- **Despliegue:** Cloudflare Pages (Edge CDN con compresión Brotli y carga instantánea).

---

## 📂 Organización del Repositorio

```text
├── .github/
│   └── assets/           # Recursos visuales del README (captura Hero)
├── proyectos/            # Capturas de proyectos en formato WebP
├── index.html            # Sitio web completo (HTML, CSS y JS integrado)
├── logo.svg              # Isotipo artesanal oficial
├── favicon.svg           # Favicon vectorial escalable
├── frank-avatar.webp     # Fotografía de perfil optimizada
├── _headers              # Cabeceras de seguridad y caché HTTP
└── README.md             # Documentación principal
```

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
