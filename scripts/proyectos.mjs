// Arma proyectos.json y saca las capturas que falten. Lo corre GitHub Actions (publicar.yml) cada 6 h.
// Regla para que un repo salga en el portafolio: público, con el tema "portfolio" y con su web (homepage).
// Con el tema "featured" sale primero. Para renovar una captura, borra proyectos/<repo>.webp y vuelve a correrlo.
import fs from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';

const USER = 'FrankUsqAbant', EXCLUIR = new Set(['abanto.dev', 'frank-abanto']);
const cab = { 'User-Agent': 'portafolio-frank', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) cab.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const r = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers: cab });
if (!r.ok) { console.error('GitHub respondió', r.status); process.exit(1); }
const repos = (await r.json()).filter((x) => !x.fork && !x.archived && !EXCLUIR.has(x.name) && x.homepage && (x.topics || []).includes('portfolio'));

fs.mkdirSync('proyectos', { recursive: true });
const faltan = repos.filter((x) => !fs.existsSync(`proyectos/${x.name}.webp`));
const nuevas = [];
if (faltan.length) {
  const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const x of faltan) {
    const url = /^https?:/.test(x.homepage) ? x.homepage : 'https://' + x.homepage;
    try {
      const p = await nav.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      const res = await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      if (!res || res.status() >= 400) throw new Error(`HTTP ${res && res.status()}`);
      await p.waitForTimeout(2500);
      const png = await p.screenshot();
      await sharp(png).resize(1200).webp({ quality: 76 }).toFile(`proyectos/${x.name}.webp`);
      nuevas.push(x.name); console.log('captura nueva:', x.name);
      await p.close();
    } catch (e) { console.warn('sin captura:', x.name, e.message); }
  }
  await nav.close();
}

const campos = ['name', 'homepage', 'html_url', 'description', 'topics', 'language', 'pushed_at', 'fork', 'archived'];
const salida = repos.map((x) => ({ ...Object.fromEntries(campos.map((k) => [k, x[k]])), captura: fs.existsSync(`proyectos/${x.name}.webp`) }));
fs.writeFileSync('proyectos.json', JSON.stringify(salida));
console.log(`proyectos.json: ${salida.length} proyectos; capturas nuevas: ${nuevas.length ? nuevas.join(', ') : 'ninguna'}`);
