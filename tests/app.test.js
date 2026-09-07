const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { configured, safeLink, whatsappLink, localAsset } = require('../app');
test('campos provisórios nunca são tratados como dados reais', () => {
  for (const value of ['', undefined, '[CHAVE PIX]', '[NÚMERO DO WHATSAPP]', '   ']) assert.equal(configured(value), false);
  assert.equal(configured('exemplo-de-teste'), true);
});
test('mapas aceitam links HTTPS do Google Maps e rejeitam outros destinos', () => {
  for (const value of ['https://www.google.com/maps/place/Exemplo', 'https://maps.app.goo.gl/exemplo', 'https://goo.gl/maps/exemplo']) assert.ok(safeLink(value, 'map'));
  for (const value of ['[LINK DO GOOGLE MAPS]', 'javascript:alert(1)', 'https://google.com.evil.test/maps', 'https://www.google.com/search?q=x', 'http://maps.google.com', 'https://a:b@maps.google.com']) assert.equal(safeLink(value, 'map'), null);
});
test('cartão aceita somente provedores previstos, sem checkout próprio', () => {
  assert.ok(safeLink('https://mpago.la/exemplo', 'card'));
  assert.ok(safeLink('https://pagbank.com.br/exemplo', 'card'));
  assert.equal(safeLink('https://mercadopago.com.br.evil.test', 'card'), null);
  assert.equal(safeLink('[LINK EXTERNO DE PAGAMENTO]', 'card'), null);
});
test('WhatsApp bloqueia placeholder e codifica corretamente a mensagem', () => {
  assert.equal(whatsappLink('[NÚMERO DO WHATSAPP]', 'Ana', '', ''), null);
  assert.equal(whatsappLink('+55 11', 'Ana', '', ''), null);
  // Número sintético usado só no teste, nunca no convite ou em chamadas externas.
  const url = new URL(whatsappLink('5511000000000', ' Ana & João ', 'Bia', 'Até lá! 💛'));
  assert.equal(url.hostname, 'wa.me');
  assert.match(url.searchParams.get('text'), /Nome: Ana & João\nAcompanhantes: Bia\nMensagem: Até lá! 💛/);
  assert.match(decodeURIComponent(whatsappLink('5511000000000', 'Ana', '', '')), /Sem acompanhantes/);
});
test('fotos e QR aceitam apenas arquivos locais', () => {
  assert.equal(localAsset('assets/casal.jpg'), 'assets/casal.jpg');
  for (const value of ['https://example.com/foto.jpg', '../foto.jpg', '//example.com/a.jpg', '[FOTO]', 'data:image/png,x']) assert.equal(localAsset(value), null);
});
test('todos os destinos de navegação interna existem e IDs são únicos', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
  assert.equal((html.match(/data-link=/g) || []).length, 3);
  assert.ok(html.includes('lang="pt-BR"'));
});
