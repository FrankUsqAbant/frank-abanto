// Prueba remota del probador: 3 negocios x 3 opciones, escritorio y móvil, más movimiento reducido.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const URL = (process.env.URL || 'http://localhost:8080/') + (fs.existsSync('sitio/probador.html') ? 'probador.html' : '');
const rep = [];
const log = (s) => { rep.push(s); console.log(s); };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const casos = [
  ['esc', { viewport: { width: 1440, height: 900 } }],
  ['movil', { ...devices['iPhone 13'] }],
  ['reducido', { ...devices['iPhone 13'], reducedMotion: 'reduce' }],
];
const pruebas = [['Panadería Luna', 'web'], ['Hostal Sol', 'asistente'], ['Pollería El Rey', 'auto']];
for (const [nombre, opts] of casos) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `out/p-${nombre}-0-inicio.png` });
  let k = 0;
  for (const [neg, tipo] of (nombre === 'reducido' ? pruebas.slice(0, 1) : pruebas)) {
    await page.fill('#neg', neg);
    await page.check(`input[name=tipo][value=${tipo}]`, { force: true });
    await page.click('#coser');
    await page.waitForTimeout(nombre === 'reducido' ? 800 : 9000);
    const estado = await page.evaluate(() => ({
      recep: !document.getElementById('recep').hidden,
      vistos: document.querySelectorAll('#muestra .ap.ver').length,
      total: document.querySelectorAll('#muestra .ap').length,
      boton: document.getElementById('coser').disabled,
      desborde: document.documentElement.scrollWidth - innerWidth,
    }));
    log(`${nombre} · ${neg} · ${tipo}: ${JSON.stringify(estado)}`);
    await page.locator('#tela').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `out/p-${nombre}-${++k}-${tipo}.png` });
  }
  // recepcionista: recorrer el guion de cotizar
  await page.getByRole('button', { name: 'Sí, quiero cotizar' }).click(); await page.waitForTimeout(7000);
  await page.fill('#txt', 'Quiero que mis clientes pidan tortas por la web, para fin de mes'); await page.click('#enviar'); await page.waitForTimeout(7000);
  const fin = await page.evaluate(() => ({ msjs: document.querySelectorAll('#msjs .burbuja').length, cita: !!document.querySelector('#chips a.cita'), ultima: [...document.querySelectorAll('#msjs .burbuja')].pop()?.textContent }));
  log(`${nombre} · recepcionista: ${JSON.stringify(fin)}`);
  await page.locator('#recep').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `out/p-${nombre}-9-recep.png` });
  // botón Escríbeme del encabezado: abre la recepcionista sin muestra
  await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  const pill = page.locator('.nav .pill[data-recep]');
  if (await pill.count()) { await page.evaluate(() => window.scrollTo(0, 0)); await page.locator('[data-recep]:visible').first().click(); await page.waitForTimeout(1500);
    log(`{nombre} · Escríbeme: {JSON.stringify(await page.evaluate(() => ({ abierta: !document.getElementById('recep').hidden, foco: document.activeElement.id, saludo: document.querySelector('#msjs .burbuja')?.textContent })))}`);
    await page.screenshot({ path: `out/p-{nombre}-8-escribeme.png` }); }
  // teclado
  await page.goto(URL, { waitUntil: 'networkidle' });
  const foco = [];
  for (let t = 0; t < 6; t++) { await page.keyboard.press('Tab'); foco.push(await page.evaluate(() => { const e = document.activeElement; return e.tagName + ':' + (e.value || e.textContent || '').trim().slice(0, 18); })); }
  log(`${nombre} · teclado: ${foco.join(' | ')}`);
  errores.forEach((e) => log(`  ERROR: ${e}`));
  await ctx.close();
}
await browser.close();
fs.writeFileSync('out/probador.txt', rep.join('\n'));
