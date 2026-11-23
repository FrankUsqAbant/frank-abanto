import { chromium, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const URL = process.env.URL || 'https://frank-abanto.pages.dev/';
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

// De dónde sale el bloqueo: CPU x4 (como Lighthouse móvil), 10 s, tareas largas por variante
log(`== bloqueo por variante (movil, CPU x4, 10 s) == ${URL}`);
for (const [nombre, sufijo, extra] of [['completo', '', {}], ['sin seda', '?sinseda', {}], ['sin animacion', '', { reducedMotion: 'reduce' }]]) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], ...extra });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__lt = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(URL + sufijo, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(10000);
  const lt = await page.evaluate(() => window.__lt);
  const tbt = lt.reduce((s, [, d]) => s + Math.max(0, d - 50), 0);
  const fcp = await page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime | 0);
  log(`  ${nombre}: bloqueo ${Math.round(tbt)} ms en ${lt.length} tareas largas, FCP ${fcp} ms`);
  await ctx.close();
}
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
  // botón flotante: ¿aparece al subir y se esconde al bajar?
  const flota = async (y) => { await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(500); return page.evaluate(() => document.getElementById('flota')?.classList.contains('ver')); };
  const sube = await flota(vh * 1.5), baja = await flota(vh * 2.2);
  await flota(vh * 1.6); await page.screenshot({ path: `out/${nombre}-flota-al-subir.png` });
  log(`  flotante: al subir ${sube ? 'visible' : 'oculto'}, al bajar ${baja ? 'visible' : 'oculto'}`);
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
