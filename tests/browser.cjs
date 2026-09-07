// Teste local opcional: node tests/browser.cjs. Usa Chrome instalado, sem pacotes.
const { spawn } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = mkdtempSync(path.join(tmpdir(), 'convite-browser-'));
const processChrome = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9223', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const deadline = setTimeout(() => { console.error('Tempo limite do teste de navegador.'); processChrome.kill(); process.exit(1); }, 45000);
(async () => {
  let tabs;
  for (let i = 0; i < 40; i++) { try { tabs = await (await fetch('http://127.0.0.1:9223/json')).json(); break; } catch { await sleep(250); } }
  assert.ok(tabs, 'Chrome deve iniciar');
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0; const pending = new Map(); const errors = [];
  socket.onmessage = event => { const value = JSON.parse(event.data); if (value.method === 'Runtime.exceptionThrown') errors.push(value.params.exceptionDetails.text); const entry = pending.get(value.id); if (entry) { pending.delete(value.id); value.error ? entry.reject(value.error) : entry.resolve(value.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  mkdirSync(path.join(__dirname, '../test-results'), { recursive: true });
  const report = [];
  for (const width of [390, 768, 1280]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 812 : 1000, deviceScaleFactor: 1, mobile: width < 600 });
    await send('Page.navigate', { url: 'http://127.0.0.1:4173' });
    for (let i = 0; i < 30; i++) { if (await evaluate('document.querySelectorAll(".gift-card").length === 6')) break; await sleep(100); }
    const layout = await evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,cards:document.querySelectorAll(".gift-card").length})');
    assert.equal(layout.scroll, layout.width, `Sem rolagem horizontal em ${width}px`); assert.equal(layout.cards, 6);
    for (let i = 0; i < 30; i++) { if (await evaluate('!!document.querySelector(".couple-photo")?.naturalWidth')) break; await sleep(100); }
    const photo = await evaluate('(()=>{const p=document.querySelector(".couple-photo");return p && {w:p.width,h:p.height,nw:p.naturalWidth,nh:p.naturalHeight,fit:getComputedStyle(p).objectFit}})()');
    assert.ok(photo && photo.nw > 0, 'Foto carregada');
    assert.ok(Math.abs(photo.w / photo.h - photo.nw / photo.nh) < .01, 'Proporção original preservada');
    assert.equal(photo.fit, 'contain');
    assert.equal(await evaluate('document.getElementById("titulo").textContent'), 'Aline & Marcos');
    assert.equal(await evaluate('document.querySelector("[data-field=historia]").textContent === window.WEDDING_CONFIG.historia'), true);
    assert.equal(await evaluate('document.querySelector("[data-field=historia]").textContent.includes("[")'), false);
    assert.equal(await evaluate('Array.from(document.querySelectorAll("[data-field=data]")).every(el => el.textContent === "8 de maio de 2027")'), true);
    assert.equal(await evaluate('window.WEDDING_CONFIG.dataISO'), '2027-05-08');
    assert.equal(await evaluate('document.body.textContent.includes("[DATA DO CASAMENTO]")'), false);
    const buttonColors = await evaluate('(()=>{const s=getComputedStyle(document.querySelector(".button"));return [s.color,s.backgroundColor]})()');
    const luminance = color => { const rgb = color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
    const [fg,bg] = buttonColors.map(luminance);
    const contrast = (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    assert.ok(contrast >= 4.5, `Contraste do botão: ${contrast}`);
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(path.join(__dirname, `../test-results/${width}px.png`), Buffer.from(capture.data, 'base64'));
    report.push(`${width}px: foto e história carregadas; data correta; 6 presentes; sem rolagem horizontal; contraste do botão ${contrast.toFixed(2)}:1`);
  }
  for (const key of ['mapaCerimonia', 'mapaRecepcao', 'cartao']) {
    assert.equal(await evaluate(`document.querySelector('[data-link="${key}"]').hasAttribute('href')`), false);
    await evaluate(`document.querySelector('[data-link="${key}"]').click()`);
    assert.equal(await evaluate('document.getElementById("notice").hidden'), false);
  }
  report.push('Mapas e cartão sem configuração: sem navegação; aviso exibido');
  await evaluate('document.getElementById("copy-pix").click()');
  assert.match(await evaluate('document.getElementById("pix-status").textContent'), /ainda não está disponível/);
  await evaluate('document.querySelector(".gift-card button").click()');
  assert.match(await evaluate('document.getElementById("selected-gift").textContent'), /Jantar romântico/);
  assert.equal(await evaluate('document.activeElement.id'), 'copy-pix');
  report.push('Presentear: seleciona contribuição e move foco ao Pix; placeholder não é copiado');
  await evaluate('document.getElementById("guest-name").value="Convidado de teste"; document.getElementById("rsvp-form").requestSubmit()');
  assert.match(await evaluate('document.getElementById("rsvp-status").textContent'), /não foi enviada/);
  report.push('WhatsApp não configurado: confirmação não enviada e aviso explícito');
  await evaluate('window.WEDDING_CONFIG.pix="CHAVE-SINTETICA-DE-TESTE"; window.WEDDING_CONFIG.favorecido="FAVORECIDO DE TESTE"; Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{window.copiedTestValue=text}}});document.getElementById("copy-pix").click()');
  assert.equal(await evaluate('window.copiedTestValue'), 'CHAVE-SINTETICA-DE-TESTE');
  assert.match(await evaluate('document.getElementById("pix-status").textContent'), /copiada/);
  await evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("negado")}}});document.getElementById("copy-pix").click()');
  assert.match(await evaluate('document.getElementById("pix-status").textContent'), /manualmente/);
  report.push('Pix com área de transferência simulada: sucesso e falha tratados corretamente');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'), 'auto');
  report.push('Movimento reduzido respeitado');
  assert.deepEqual(errors, []); report.push('Nenhuma exceção JavaScript no navegador');
  writeFileSync(path.join(__dirname, '../test-results/browser.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
  await send('Browser.close');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { clearTimeout(deadline); if (socket) socket.close(); processChrome.kill(); });
