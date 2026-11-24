// Pruebas extra: 9 tamaños de pantalla, conexión lenta (normal y "ahorro de datos") y accesibilidad con la recepcionista abierta.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const URL = process.env.URL || 'http://localhost:8080/';
const rep = []; const log = (s) => { rep.push(s); console.log(s); };
const nav = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

// 1) responsive
const tam = [['320x568', 320, 568, true], ['360x740', 360, 740, true], ['390x844', 390, 844, true], ['412x915', 412, 915, true],
  ['movil-horizontal 844x390', 844, 390, true], ['tablet 768x1024', 768, 1024, true], ['1024x768', 1024, 768, false], ['1366x768', 1366, 768, false], ['1920x1080', 1920, 1080, false]];
log('== RESPONSIVE ==');
for (const [nombre, w, h, tactil] of tam) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, hasTouch: tactil, isMobile: tactil && w < 900, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const err = [];
  p.on('pageerror', (e) => err.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const id = nombre.split(' ').pop();
  await p.screenshot({ path: `out/r-${id}-hero.png` });
  await p.locator('#probador').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.screenshot({ path: `out/r-${id}-probador.png` });
  const d = await p.evaluate((tactil) => {
    const ancho = document.documentElement.scrollWidth - innerWidth;
    const chicos = tactil ? [...document.querySelectorAll('a,button,input,label')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.height && r.bottom > 0 && (r.width < 44 || r.height < 44) && cs.visibility !== 'hidden' && cs.opacity !== '0' && !(e.tagName === 'LABEL' && e.htmlFor) && !e.closest('[hidden]'); })
      .map((e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 22)) : [];
    const cortado = [...document.querySelectorAll('h1,h2,h3,p,a,button')].filter((e) => { if (e.closest('#lista-proy')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).map((e) => e.textContent.trim().slice(0, 22));
    return { ancho, chicos, cortado: cortado.slice(0, 6) };
  }, tactil);
  log(`${nombre}: desborde ${d.ancho}px · objetivos<44: ${d.chicos.length} ${JSON.stringify(d.chicos.slice(0, 6))} · fuera de pantalla: ${JSON.stringify(d.cortado)}${err.length ? ' · ERRORES ' + err.join(' | ') : ''}`);
  await ctx.close();
}

// 2) conexión lenta (3G lenta + CPU x4), normal y con "ahorro de datos"
log('== CONEXIÓN LENTA (400 kbps, 400 ms, CPU x4) ==');
for (const ahorro of [false, true]) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript((ahorro) => {
    if (ahorro) Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '3g' } });
    window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  }, ahorro);
  const t0 = Date.now();
  await p.goto(URL, { waitUntil: 'load', timeout: 120000 });
  const carga = Date.now() - t0;
  await p.waitForTimeout(4000);
  const m = await p.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime | 0;
    const recursos = performance.getEntriesByType('resource'), nav = performance.getEntriesByType('navigation')[0];
    const kb = Math.round((recursos.reduce((s, r) => s + (r.transferSize || 0), 0) + (nav?.transferSize || 0)) / 1024);
    return { fcp, lcp: Math.round(window.__lcp), kb, seda: document.documentElement.classList.contains('seda'), telon: getComputedStyle(document.getElementById('telon')).display !== 'none' };
  });
  log(`${ahorro ? 'ahorro de datos' : 'normal'}: primer contenido ${m.fcp} ms · contenido principal ${m.lcp} ms · carga completa ${carga} ms · ${m.kb} KB transferidos · seda WebGL ${m.seda ? 'sí' : 'no'} · telón ${m.telon ? 'visible' : 'no'}`);
  await p.screenshot({ path: `out/lento-${ahorro ? 'ahorro' : 'normal'}.png` });
  await ctx.close();
}

// 3) accesibilidad con el probador usado y la recepcionista abierta
log('== ACCESIBILIDAD (probador usado + recepcionista abierta) ==');
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.fill('#neg', 'Panadería Luna'); await p.click('#coser'); await p.waitForTimeout(8000);
  const ax = await new AxeBuilder({ page: p }).analyze();
  log(`axe: ${ax.violations.length} problemas${ax.violations.map((v) => ` · [${v.impact}] ${v.id} (${v.nodes.length}) ${v.nodes.map((nd) => nd.target.join(' ')).join(' ; ')}`).join('')}`);
  const estado = await p.evaluate(() => ({ anuncio: document.getElementById('estadoPb')?.textContent, log: document.getElementById('msjs')?.getAttribute('role'), saltar: !!document.querySelector('.saltar') }));
  log(`lector de pantalla: ${JSON.stringify(estado)}`);
  // primer Tab: debe ser "Saltar al contenido"
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.keyboard.press('Tab');
  log(`primer Tab: ${await p.evaluate(() => document.activeElement.textContent.trim())}`);
  await ctx.close();
}
await nav.close();
fs.writeFileSync('out/extra.txt', rep.join('\n'));
