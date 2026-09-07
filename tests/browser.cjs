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
    for (let attempt=0;attempt<30;attempt++) { if(await evaluate('[...document.querySelectorAll("img.lily")].every(i=>i.complete&&i.naturalWidth>0)')) break; await sleep(100); }
    assert.equal(await evaluate('[...document.querySelectorAll("img.lily")].every(i=>i.complete&&i.naturalWidth===1254&&i.alt===""&&i.getAttribute("aria-hidden")==="true"&&getComputedStyle(i).filter==="none")'), true);
    assert.equal(await evaluate('document.querySelectorAll("img.lily").length'), 8);
    assert.equal(await evaluate('/[✳✧☼★☆✦]/.test(document.body.textContent)'), false);
    assert.equal(await evaluate('document.querySelector("label[for=guest-name]").textContent.includes("*")'), true);
    assert.equal(await evaluate('[...document.querySelectorAll("img.lily")].every(i=>{const r=i.getBoundingClientRect();return r.left>=0&&r.right<=document.documentElement.clientWidth})'), true);
    assert.equal(await evaluate('(()=>{const targets=[...document.querySelectorAll(".hero-frame h1,.hero-frame .button,.couple-photo")];return [...document.querySelectorAll(".hero-frame .lily")].every(i=>{const a=i.getBoundingClientRect();return targets.every(t=>{const b=t.getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom})})})()'), true);
    if(width===390||width===1280){
      for(const [name,selector] of [['header','.site-header'],['opening','.hero'],['footer','footer']]){
        const box=await evaluate(`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:document.documentElement.clientWidth,height:Math.ceil(r.height),scale:1}})()`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:box});
        writeFileSync(path.join(__dirname,`../test-results/lily-${name}-${width}px.png`),Buffer.from(shot.data,'base64'));
      }
    }
    report.push(`${width}px: oito lírios carregados e decorativos, sem filtros, estrelas antigas ou sobreposição de nomes/foto/botão; asterisco obrigatório preservado`);
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
    assert.equal(await evaluate('document.getElementById("home-gifts-title").textContent'), 'Sugestões para o nosso lar');
    assert.match(await evaluate('document.querySelector(".home-gifts-intro").textContent'), /Sua presença é o nosso maior presente/);
    assert.equal(await evaluate('document.getElementById("toggle-home-gifts").getAttribute("aria-controls")'), 'home-gifts-list');
    assert.equal(await evaluate('document.getElementById("home-gifts-list").hidden'), true);
    await evaluate('document.querySelector(".home-gifts").scrollIntoView({behavior:"instant",block:"start"})');
    if (width === 390) {
      const closed = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path.join(__dirname, '../test-results/home-closed-390px.png'), Buffer.from(closed.data, 'base64'));
    }
    await evaluate('document.getElementById("toggle-home-gifts").focus({preventScroll:true})');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    assert.equal(await evaluate('document.getElementById("toggle-home-gifts").getAttribute("aria-expanded")'), 'true');
    assert.equal(await evaluate('document.getElementById("toggle-home-gifts").textContent'), 'Ocultar sugestões');
    assert.equal(await evaluate('document.getElementById("home-gifts-list").hidden'), false);
    const categories = await evaluate('[...document.querySelectorAll(".home-gifts-category")].map(el=>({categoria:el.querySelector("h4").textContent,itens:[...el.querySelectorAll("li")].map(li=>li.textContent)}))');
    assert.deepEqual(categories, await evaluate('window.WEDDING_CONFIG.presentesFisicos'));
    assert.deepEqual(categories.map(c=>c.itens.length), [14,4,3]);
    assert.equal(await evaluate('document.querySelectorAll("#home-gifts-list button,#home-gifts-list a,#home-gifts-list input").length'), 0);
    assert.equal(await evaluate('/R\$|Presentear/.test(document.getElementById("home-gifts-list").textContent)'), false);
    await evaluate('document.querySelector(".home-gifts-category li").click()');
    assert.equal(await evaluate('document.getElementById("pix").open'), false);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), true);
    await sleep(250);
    if (width === 390) {
      const size = await send('Page.getLayoutMetrics');
      const opened = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x:0, y:await evaluate('window.scrollY'), width:390, height:Math.ceil(await evaluate('document.querySelector(".home-gifts").getBoundingClientRect().height')), scale:1 } });
      writeFileSync(path.join(__dirname, '../test-results/home-open-390px.png'), Buffer.from(opened.data, 'base64'));
    }
    await evaluate('document.getElementById("toggle-home-gifts").click()');
    assert.equal(await evaluate('document.getElementById("toggle-home-gifts").getAttribute("aria-expanded")'), 'false');
    assert.equal(await evaluate('document.getElementById("home-gifts-list").hidden'), true);
    assert.equal(await evaluate('document.getElementById("toggle-home-gifts").textContent'), 'Ver sugestões para o nosso lar');
    report.push(`${width}px: sugestões físicas aprovadas — 21 itens em três categorias, abertura por teclado, fechamento, atributos acessíveis e nenhum preço ou ação de pagamento`);
    assert.equal(await evaluate('document.getElementById("pix").open'), false);
    await evaluate('document.getElementById("copy-pix").focus()');
    assert.notEqual(await evaluate('document.activeElement.id'), 'copy-pix');
    const giftData = await evaluate('[...document.querySelectorAll(".gift-card")].map(el=>({name:el.querySelector("h3").textContent,description:el.querySelector("p").textContent}))');
    for (let i = 0; i < 6; i++) {
      await evaluate(`document.querySelectorAll('.gift-card button')[${i}].scrollIntoView({behavior:'instant',block:'center'});document.querySelectorAll('.gift-card button')[${i}].focus()`);
      const oldScroll = await evaluate('window.scrollY');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      assert.equal(await evaluate('document.getElementById("pix").open'), true, `Modal ${width}px presente ${i}; erros ${errors.join(';')}; foco ${await evaluate('document.activeElement.outerHTML')}`);
      assert.equal(await evaluate('document.getElementById("selected-gift").textContent'), 'Você escolheu: ' + giftData[i].name);
      assert.equal(await evaluate('document.getElementById("gift-description").textContent'), giftData[i].description);
      assert.equal(await evaluate('document.getElementById("free-value-group").hidden'), i !== 5);
      if (i < 5) assert.equal(await evaluate('document.getElementById("gift-value").textContent.replace(/\u00a0/g," ")'), `Valor do presente: R$ ${[200,150,80,250,350][i]},00`);
      else {
        for (const value of ['0', '-10', '1,234', 'abc']) {
          await evaluate(`document.getElementById('free-value').value=${JSON.stringify(value)};document.getElementById('free-value').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('copy-pix').click()`);
          assert.equal(await evaluate('document.getElementById("free-value").getAttribute("aria-invalid")'), 'true');
          assert.equal(await evaluate('document.activeElement.id'), 'free-value');
        }
        await evaluate('document.getElementById("free-value").value="1.250,90";document.getElementById("free-value").dispatchEvent(new Event("input",{bubbles:true}))');
        assert.equal(await evaluate('document.getElementById("free-value").getAttribute("aria-invalid")'), 'false');
      }
      assert.equal(await evaluate('getComputedStyle(document.body).position'), 'fixed');
      assert.equal(await evaluate('document.getElementById("pix").scrollWidth <= document.getElementById("pix").clientWidth'), true);
      await evaluate('document.getElementById("close-payment").focus()');
      for (let t = 0; t < 6; t++) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        assert.equal(await evaluate('document.getElementById("pix").contains(document.activeElement)'), true);
      }
      if (i === 0) {
        await evaluate('document.getElementById("pix").scrollTop=0;document.getElementById("close-payment").focus()');
        const modalCapture = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path.join(__dirname, `../test-results/modal-${width}px.png`), Buffer.from(modalCapture.data, 'base64'));
      }
      if (i % 3 === 0) await evaluate('document.getElementById("close-payment").click()');
      else if (i % 3 === 1) await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      else {
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 2, y: 2, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 2, y: 2, button: 'left', clickCount: 1 });
      }
      await sleep(50);
      assert.equal(await evaluate('document.getElementById("pix").open'), false);
      assert.equal(await evaluate(`document.activeElement===document.querySelectorAll('.gift-card button')[${i}]`), true);
      assert.equal(await evaluate('document.getElementById("selected-gift").textContent'), '');
      assert.equal(await evaluate('document.getElementById("free-value").value'), '');
      assert.ok(Math.abs(await evaluate('window.scrollY') - oldScroll) <= 1, 'Posição da página restaurada');
    }
    report.push(`${width}px: seis presentes, valor livre, três formas de fechar, foco, teclado e modal sem rolagem horizontal aprovados`);
  }
  for (const key of ['mapaCerimonia', 'mapaRecepcao']) {
    assert.equal(await evaluate(`document.querySelector('[data-link="${key}"]').hasAttribute('href')`), false);
    await evaluate(`document.querySelector('[data-link="${key}"]').click()`);
    assert.equal(await evaluate('document.getElementById("notice").hidden'), false);
  }
  assert.equal(await evaluate('document.querySelector("[data-link=cartao]").hidden'), true);
  report.push('Mapas sem configuração: aviso; cartão sem link válido: oculto');
  await evaluate('document.querySelector(".gift-card button").click()');
  await evaluate('document.getElementById("copy-pix").click()');
  assert.match(await evaluate('document.getElementById("pix-status").textContent'), /ainda não está disponível/);
  assert.match(await evaluate('document.getElementById("selected-gift").textContent'), /Jantar romântico/);
  report.push('Pix não configurado: placeholder não é copiado');
  await evaluate('document.getElementById("close-payment").click()');
  await sleep(50);
  await evaluate('document.getElementById("guest-name").value="Convidado de teste"; document.getElementById("rsvp-form").requestSubmit()');
  assert.match(await evaluate('document.getElementById("rsvp-status").textContent'), /não foi enviada/);
  report.push('WhatsApp não configurado: confirmação não enviada e aviso explícito');
  await evaluate('document.querySelector(".gift-card button").click()');
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
