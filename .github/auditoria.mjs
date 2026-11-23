import { chromium, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const URL = 'https://frank-abanto.pages.dev/';
const rep = [];
const log = (s) => { rep.push(s); console.log(s); };

// Resumen Lighthouse
for (const f of ['mobile', 'desktop']) {
  try {
    const j = JSON.parse(fs.readFileSync(`out/lh-${f}.json`, 'utf8'));
    log(`== Lighthouse ${f} ==`);
    for (const [k, c] of Object.entries(j.categories)) log(`${k}: ${Math.round(c.score * 100)}`);
    for (const k of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'total-byte-weight'])
      log(`  ${k}: ${j.audits[k]?.displayValue}`);
    for (const a of Object.values(j.audits))
      if (a.score !== null && a.score < 0.9 && ['binary', 'numeric', 'metricSavings'].includes(a.scoreDisplayMode))
        log(`  [${Math.round(a.score * 100)}] ${a.title} ${a.displayValue ?? ''}`);
  } catch (e) { log(`Lighthouse ${f}: sin datos (${e.message})`); }
}

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const casos = [
  ['escritorio', { viewport: { width: 1440, height: 900 } }],
  ['movil', { ...devices['iPhone 13'] }],
  ['movil-reducido', { ...devices['iPhone 13'], reducedMotion: 'reduce' }],
];
for (const [nombre, opts] of casos) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errores = [], fallidos = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('requestfailed', (r) => fallidos.push(r.url()));
  page.on('response', (r) => r.status() >= 400 && fallidos.push(`${r.status()} ${r.url()}`));
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `out/${nombre}-hero.png` });
  // bajar poco a poco para disparar perezosos y animaciones
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = opts.viewport?.height ?? 844;
  let i = 0;
  for (let y = 0; y < h; y += vh) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `out/${nombre}-${String(++i).padStart(2, '0')}.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  log(`== ${nombre} == alto ${h}px, desborde horizontal ${overflow}px, pantallas ${i}`);
  errores.forEach((e) => log(`  consola: ${e}`));
  fallidos.forEach((e) => log(`  recurso fallido: ${e}`));
  if (nombre !== 'movil-reducido') {
    const axe = await new AxeBuilder({ page }).analyze();
    for (const v of axe.violations) log(`  axe [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    // objetivos táctiles chicos en móvil
    if (nombre === 'movil') {
      const chicos = await page.evaluate(() => [...document.querySelectorAll('a,button')].filter((e) => {
        const r = e.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44);
      }).map((e) => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30)));
      log(`  objetivos < 44px: ${chicos.length} ${JSON.stringify(chicos.slice(0, 15))}`);
    }
  }
  // teclado: primeros 12 tabs
  if (nombre === 'escritorio') {
    await page.evaluate(() => window.scrollTo(0, 0));
    const foco = [];
    for (let t = 0; t < 12; t++) {
      await page.keyboard.press('Tab');
      foco.push(await page.evaluate(() => {
        const e = document.activeElement; const s = getComputedStyle(e);
        const visible = s.outlineStyle !== 'none' || s.boxShadow !== 'none';
        return `${e.tagName}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)}${visible ? '' : ' (SIN FOCO VISIBLE)'}`;
      }));
    }
    log(`  teclado: ${foco.join(' | ')}`);
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync('out/reporte.txt', rep.join('\n'));
