/* Sem serviços externos, rastreamento ou armazenamento de dados. */
(function () {
  'use strict';
  const configured = value => typeof value === 'string' && value.trim() !== '' && !/[\[\]]/.test(value);
  function safeLink(value, kind) {
    if (!configured(value)) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      const host = url.hostname.toLowerCase();
      const subdomainOf = domain => host === domain || host.endsWith('.' + domain);
      if (kind === 'map') {
        const googleMap = (host === 'www.google.com' || host === 'www.google.com.br' || host === 'google.com' || host === 'google.com.br') && /^\/maps(?:\/|$)/.test(url.pathname);
        if (!(googleMap || host === 'maps.google.com' || host === 'maps.app.goo.gl' || (host === 'goo.gl' && url.pathname.startsWith('/maps/')))) return null;
      } else if (kind === 'card' && !['mercadopago.com.br', 'mercadopago.com', 'mpago.la', 'pagbank.com.br', 'pagseguro.uol.com.br'].some(subdomainOf)) return null;
      return url.href;
    } catch { return null; }
  }
  function whatsappLink(number, guest, companions, message) {
    if (!configured(number) || !/^[1-9]\d{7,14}$/.test(number)) return null;
    const text = `Olá! Quero confirmar minha presença no casamento.\n\nNome: ${guest.trim()}\nAcompanhantes: ${companions.trim() || 'Sem acompanhantes'}${message.trim() ? '\nMensagem: ' + message.trim() : ''}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }
  function localAsset(value) {
    return configured(value) && !value.includes('..') && /^(?:assets\/)?[a-zA-Z0-9_\-/]+\.(?:png|jpe?g|webp)$/i.test(value) ? value : null;
  }
  function parseMoney(value) {
    if (typeof value !== 'string' || !/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value.trim())) return null;
    const [whole, fraction = ''] = value.trim().replaceAll('.', '').split(',');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
  }
  // Exporta apenas as funções puras para os testes nativos do Node.
  if (typeof module !== 'undefined' && module.exports) { module.exports = { configured, safeLink, whatsappLink, localAsset, parseMoney }; return; }
  const config = window.WEDDING_CONFIG || {};
  document.querySelectorAll('[data-field]').forEach(element => {
    const value = config[element.dataset.field];
    if (typeof value === 'string' && value.trim()) element.textContent = value;
  });
  document.querySelector('[data-full-names]').textContent = `${config.noiva} e ${config.noivo}`;
  document.title = `${config.noivaCurto} & ${config.noivoCurto} · Nosso casamento`;
  const homeList = document.getElementById('home-gifts-list');
  (config.presentesFisicos || []).forEach(({ categoria, itens }, index) => {
    const group = document.createElement('section'); group.className = 'home-gifts-category';
    const title = document.createElement('h4'); title.id = `home-category-${index}`; title.textContent = categoria;
    group.setAttribute('aria-labelledby', title.id);
    const list = document.createElement('ul');
    itens.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });
    group.append(title, list); homeList.append(group);
  });
  const homeToggle = document.getElementById('toggle-home-gifts');
  homeToggle.addEventListener('click', () => {
    const expanded = homeToggle.getAttribute('aria-expanded') !== 'true';
    homeToggle.setAttribute('aria-expanded', String(expanded));
    homeToggle.textContent = expanded ? 'Ocultar sugestões' : 'Ver sugestões para o nosso lar';
    homeList.hidden = !expanded;
  });
  let noticeTimer;
  function notify(message) {
    const notice = document.getElementById('notice');
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 7000);
  }
  document.querySelectorAll('[data-link]').forEach(link => {
    const key = link.dataset.link;
    const href = safeLink(config[key], key === 'cartao' ? 'card' : 'map');
    if (key === 'cartao') {
      link.hidden = !href;
      document.querySelector('.card-note').hidden = !href;
    }
    if (href) {
      link.href = href;
      link.removeAttribute('aria-disabled');
    } else {
      const explain = event => {
        event.preventDefault();
        notify(key === 'cartao' ? 'O link de pagamento com cartão ainda não foi configurado.' : 'A localização deste evento ainda não foi configurada.');
      };
      link.addEventListener('click', explain);
      link.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') explain(event); });
    }
  });
  const gifts = [
    ['♧', 'Jantar romântico', 'Um brinde, duas taças e muitas histórias para contar.', 200],
    ['lily', 'Passeio na lua de mel', 'Para nos perdermos por aí e encontrarmos boas memórias.', 150],
    ['♨', 'Café dos recém-casados', 'Amor quentinho, pão na mesa e mais cinco minutinhos.', 80],
    ['⌂', 'Ajuda para o novo lar', 'Um pouquinho de carinho em cada cantinho da casa.', 250],
    ['lily', 'Uma experiência especial', 'Uma aventura a dois para guardar para sempre.', 350],
    ['♡', 'Presente com valor livre', 'O valor você escolhe. O carinho a gente guarda.', null],
  ];
  const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const payment = document.getElementById('pix');
  const freeGroup = document.getElementById('free-value-group');
  const freeValue = document.getElementById('free-value');
  const freeError = document.getElementById('free-value-error');
  let opener = null;
  let savedScroll = 0;
  document.getElementById('free-value-help').textContent = 'Informe um valor maior que zero, usando vírgula para os centavos. Exemplo: 150,00.';
  document.querySelector('.payment-note').textContent = 'A chave e o QR Code são estáticos: informe o valor no aplicativo do banco e confira o favorecido. O valor escolhido aqui não é inserido automaticamente no Pix nem no pagamento com cartão.';
  function validateFreeValue() {
    const cents = parseMoney(freeValue.value);
    freeError.textContent = cents === null ? 'Informe um valor maior que zero no formato brasileiro, como 150,00.' : '';
    freeValue.setAttribute('aria-invalid', String(cents === null));
    freeValue.setCustomValidity(cents === null ? freeError.textContent : '');
    document.getElementById('gift-value').textContent = cents === null ? '' : `Valor do presente: ${(cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    return cents;
  }
  freeValue.addEventListener('input', validateFreeValue);
  freeValue.addEventListener('blur', () => {
    const cents = validateFreeValue();
    if (cents !== null) freeValue.value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
  document.getElementById('close-payment').addEventListener('click', () => payment.close());
  let backdropStart = false;
  const outside = event => { const r = payment.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; };
  payment.addEventListener('pointerdown', event => { backdropStart = event.target === payment && outside(event); });
  payment.addEventListener('click', event => { if (backdropStart && event.target === payment && outside(event)) payment.close(); backdropStart = false; });
  payment.addEventListener('close', () => {
    document.getElementById('selected-gift').textContent = '';
    document.getElementById('gift-description').textContent = '';
    document.getElementById('gift-value').textContent = '';
    document.getElementById('pix-status').textContent = '';
    freeValue.value = ''; freeValue.setCustomValidity(''); freeValue.removeAttribute('aria-invalid');
    freeError.textContent = ''; freeGroup.hidden = true;
    document.body.classList.remove('payment-open');
    document.body.style.removeProperty('top');
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
    opener?.focus({ preventScroll: true }); opener = null;
  });
  // O dialog nativo torna o restante da página inerte; mantém Tab dentro dos controles.
  payment.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...payment.querySelectorAll('button, input, a[href]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  gifts.forEach(([icon, name, description, value]) => {
    const card = document.createElement('article');
    card.className = 'gift-card';
    const symbol = document.createElement(icon === 'lily' ? 'img' : 'span'); symbol.className = 'gift-icon'; symbol.setAttribute('aria-hidden', 'true');
    if (icon === 'lily') { symbol.classList.add('lily'); symbol.src = 'lirio-laranja.png'; symbol.alt = ''; symbol.width = 1254; symbol.height = 1254; } else symbol.textContent = icon;
    const title = document.createElement('h3'); title.textContent = name;
    const detail = document.createElement('p'); detail.textContent = description;
    const bottom = document.createElement('div'); bottom.className = 'gift-bottom';
    const price = document.createElement('strong'); price.textContent = value === null ? 'Seu carinho' : currency(value);
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Presentear ↗'; button.setAttribute('aria-label', 'Presentear: ' + name);
    button.addEventListener('click', () => {
      opener = button; savedScroll = window.scrollY;
      document.getElementById('selected-gift').textContent = `Você escolheu: ${name}`;
      document.getElementById('gift-description').textContent = description;
      document.getElementById('gift-value').textContent = value === null ? '' : `Valor do presente: ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
      freeGroup.hidden = value !== null;
      document.body.style.top = `-${savedScroll}px`;
      document.body.classList.add('payment-open');
      payment.showModal(); payment.scrollTop = 0;
    });
    bottom.append(price, button); card.append(symbol, title, detail, bottom); document.getElementById('gift-list').append(card);
  });
  const photo = localAsset(config.foto);
  if (photo) {
    const placeholder = document.querySelector('.photo-placeholder');
    const img = document.createElement('img'); img.className = 'couple-photo'; img.alt = configured(config.fotoAlt) ? config.fotoAlt : 'Fotografia do casal';
    img.addEventListener('load', () => { placeholder.replaceWith(img); }, { once: true });
    img.src = photo;
  }
  const qr = localAsset(config.qrCode);
  if (qr && configured(config.pix) && configured(config.favorecido)) {
    const image = document.getElementById('pix-qr');
    image.addEventListener('load', () => { image.hidden = false; document.getElementById('qr-placeholder').hidden = true; });
    image.src = qr;
  }
  document.getElementById('copy-pix').addEventListener('click', async () => {
    if (!freeGroup.hidden && validateFreeValue() === null) { freeValue.focus(); return; }
    const status = document.getElementById('pix-status');
    if (!configured(config.pix) || !configured(config.favorecido)) { status.textContent = 'O Pix ainda não está disponível. A chave e o favorecido precisam ser configurados.'; return; }
    try {
      await navigator.clipboard.writeText(config.pix.trim());
      status.textContent = 'Chave Pix copiada! Confira o favorecido no aplicativo do banco.';
    } catch { status.textContent = 'Não foi possível copiar automaticamente. Selecione a chave acima e copie manualmente.'; }
  });
  document.querySelector('[data-link="cartao"]').addEventListener('click', event => {
    if (!freeGroup.hidden && validateFreeValue() === null) { event.preventDefault(); freeValue.focus(); }
  });
  document.getElementById('rsvp-form').addEventListener('submit', event => {
    event.preventDefault();
    const guest = document.getElementById('guest-name');
    const status = document.getElementById('rsvp-status');
    if (!guest.value.trim()) { status.textContent = 'Por favor, informe seu nome.'; guest.focus(); return; }
    const url = whatsappLink(config.whatsapp, guest.value, document.getElementById('companions').value, document.getElementById('guest-message').value);
    if (!url) { status.textContent = 'O WhatsApp dos noivos ainda não foi configurado. Sua confirmação não foi enviada.'; return; }
    status.textContent = 'Revise a mensagem e toque em enviar no WhatsApp para confirmar.';
    window.location.assign(url);
  });
})();
