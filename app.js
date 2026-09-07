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
  // Exporta apenas as funções puras para os testes nativos do Node.
  if (typeof module !== 'undefined' && module.exports) { module.exports = { configured, safeLink, whatsappLink, localAsset }; return; }
  const config = window.WEDDING_CONFIG || {};
  document.querySelectorAll('[data-field]').forEach(element => {
    const value = config[element.dataset.field];
    if (typeof value === 'string' && value.trim()) element.textContent = value;
  });
  document.querySelector('[data-full-names]').textContent = `${config.noiva} e ${config.noivo}`;
  document.title = `${config.noivaCurto} & ${config.noivoCurto} · Nosso casamento`;
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
    ['☼', 'Passeio na lua de mel', 'Para nos perdermos por aí e encontrarmos boas memórias.', 150],
    ['♨', 'Café dos recém-casados', 'Amor quentinho, pão na mesa e mais cinco minutinhos.', 80],
    ['⌂', 'Ajuda para o novo lar', 'Um pouquinho de carinho em cada cantinho da casa.', 250],
    ['✧', 'Uma experiência especial', 'Uma aventura a dois para guardar para sempre.', 350],
    ['♡', 'Presente com valor livre', 'O valor você escolhe. O carinho a gente guarda.', null],
  ];
  const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  gifts.forEach(([icon, name, description, value]) => {
    const card = document.createElement('article');
    card.className = 'gift-card';
    const symbol = document.createElement('span'); symbol.className = 'gift-icon'; symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = icon;
    const title = document.createElement('h3'); title.textContent = name;
    const detail = document.createElement('p'); detail.textContent = description;
    const bottom = document.createElement('div'); bottom.className = 'gift-bottom';
    const price = document.createElement('strong'); price.textContent = value === null ? 'Seu carinho' : currency(value);
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Presentear ↗'; button.setAttribute('aria-label', 'Presentear: ' + name);
    button.addEventListener('click', () => {
      document.getElementById('selected-gift').textContent = `${name} · ${value === null ? 'Contribua com o valor que desejar.' : 'Sugestão de ' + currency(value) + '. Informe o valor no aplicativo do seu banco.'}`;
      const panel = document.getElementById('pix');
      panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      document.getElementById('copy-pix').focus({ preventScroll: true });
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
    const status = document.getElementById('pix-status');
    if (!configured(config.pix) || !configured(config.favorecido)) { status.textContent = 'O Pix ainda não está disponível. A chave e o favorecido precisam ser configurados.'; return; }
    try {
      await navigator.clipboard.writeText(config.pix.trim());
      status.textContent = 'Chave Pix copiada! Confira o favorecido no aplicativo do banco.';
    } catch { status.textContent = 'Não foi possível copiar automaticamente. Selecione a chave acima e copie manualmente.'; }
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
