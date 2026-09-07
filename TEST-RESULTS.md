# Verificação atual — lírios decorativos

- `lirio-laranja.png` encontrado na raiz, 1254 × 1254 px. Fundo realmente transparente: 1.294.131 pixels com alpha zero e 277.530 com transparência parcial. Sem fundo branco, preto ou quadriculado incorporado.
- Original reutilizado diretamente nos oito ornamentos, sem duplicação, otimização, recoloração ou filtros. SHA-256: `DD87C900D4753B57D19DB6CF0F30683EEF8E36BC458C4E7117EDF94A185B4030`.
- Substituídos: cabeçalho, dois cantos da abertura, moldura, confirmação, encerramento e os símbolos decorativos de sol/estrela em dois cartões. Demais ícones e asterisco obrigatório preservados.
- `node --test tests/*.test.js`: **7 passaram, 0 falharam**.
- `node tests/browser.cjs`: **passou em 390, 768 e 1280 px**. PNGs carregados; `alt=""`, `aria-hidden="true"`, dimensões declaradas, sem filtros; nenhuma estrela decorativa antiga; asterisco obrigatório presente. Nenhuma sobreposição com nomes/foto/botão e nenhuma rolagem horizontal.
- Todos os testes anteriores de sugestões físicas, contribuições, modal, valor livre, foco, Pix simulado e WhatsApp passaram. Nenhuma exceção JavaScript.
- Alterados: `index.html`, `app.js`, `styles.css`, `tests/browser.cjs`, `TEST-RESULTS.md`. Nenhum arquivo de imagem original alterado ou duplicado.
- Criadas seis capturas: `test-results/lily-header-390px.png`, `test-results/lily-opening-390px.png`, `test-results/lily-footer-390px.png` e equivalentes `1280px`. Demais capturas existentes e `test-results/browser.txt` regenerados pelos testes.
- Sem deploy, publicação ou operações de escrita no Git.

---

# Registro anterior — sugestões para o lar

- `node --test tests/*.test.js`: **7 passaram, 0 falharam**. Sintaxe de `app.js` e `config.js` aprovada.
- `node tests/browser.cjs`: **passou em 390, 768 e 1280 px**. Título, texto acolhedor, três categorias e 21 itens renderizados de acordo com `config.js` (14 + 4 + 3).
- Bloco fechado inicialmente; abertura com Enter e fechamento por botão; rótulos alternados, `aria-expanded` e `aria-controls` verificados. Conteúdo fechado usa `hidden`; animação de abertura desativada com movimento reduzido.
- Nenhum preço, botão Presentear, link ou campo dentro das sugestões. Clique em item físico não abre o modal. Sem estados de reserva.
- Lista e modal sem rolagem horizontal nas três larguras. Todos os testes anteriores de contribuições, valor livre, Pix simulado, fechamento por botão/Esc/clique externo, foco, posição da página e WhatsApp continuam passando. Nenhuma exceção JavaScript.
- Capturas novas: `test-results/home-closed-390px.png` e `test-results/home-open-390px.png` (aberta mostra o bloco completo em largura de celular).
- Alterados: `config.js`, `index.html`, `app.js`, `styles.css`, `tests/browser.cjs`, `README.md`, `TEST-RESULTS.md`. Capturas gerais, capturas de modal e `test-results/browser.txt` regenerados.
- Sem deploy, publicação, git add, commit ou push.

---

# Registro anterior — modal de presentes

- `node --test tests/*.test.js`: **7 passaram, 0 falharam**, incluindo validação monetária brasileira, valores positivos e rejeição de formatos inválidos. Sintaxe de `app.js` e `tests/browser.cjs` aprovada.
- `node tests/browser.cjs`: **passou em 390, 768 e 1280 px**. Seis presentes testados em cada largura: abertura pelo teclado, nome, descrição, valor original, campo livre e ausência de rolagem horizontal no modal.
- Modal fechado inicialmente e fora do foco; fundo inerte pelo `dialog` nativo e rolagem bloqueada. Tab permanece nos controles. Fechamento por botão, Esc e clique externo testado; seleção e valor livre limpos; foco e posição da página restaurados.
- Pix: placeholder bloqueado, sucesso e falha de cópia simulados. Valores livres inválidos impedem a ação. A transferência continua externa ao site, com orientação explícita sobre valor manual.
- Cartão oculto sem link válido. QR verdadeiro continua configurável; nenhum QR ou link foi inventado.
- Nomes, história, data, foto, cartões e demais funcionalidades preservados. Movimentos reduzidos respeitados; nenhuma exceção JavaScript.
- Capturas do modal: `test-results/modal-390px.png`, `test-results/modal-768px.png`, `test-results/modal-1280px.png`. Desktop em janela limitada; celular com rolagem interna vertical.
- Alterados: `index.html`, `app.js`, `styles.css`, `tests/app.test.js`, `tests/browser.cjs`, `README.md`, `TEST-RESULTS.md`. Regenerados as três capturas gerais em `test-results` e `test-results/browser.txt`; adicionadas as três capturas do modal.
- Nenhum deploy, publicação, git add, commit ou push.

---

# Registro anterior — terracota, história e data

- Paleta central: terracota `#B85C45`, escuro `#8F4436`, claro `#D98A72`; fúcsia complementar. Botões, ornamentos, divisórias e detalhes de bordas atualizados; nenhum laranja antigo no CSS.
- História substituída integralmente pelo texto solicitado, centralizado em `config.js`. Mantidos parágrafo alinhado à esquerda, largura máxima de 680 px, fonte de 17 px no desktop e 16 px no celular.
- Data visual em todos os quatro locais: **8 de maio de 2027**. Data interna: `2027-05-08`. Nenhum placeholder de data nos arquivos do site. Não existe contagem regressiva.
- `node --test tests/*.test.js`: **6 passaram, 0 falharam**. Sintaxe de `config.js` validada.
- `node tests/browser.cjs`: **passou em 390, 768 e 1280 px**, sem rolagem horizontal; foto proporcional e carregada; nomes, história e datas verificados.
- Contraste calculado: branco/terracota **4,51:1**; branco/terracota escuro no hover **6,89:1**; terracota escuro/creme **6,54:1**; texto secundário/creme **5,24:1**; texto principal/creme **14,85:1**. Terracota claro usado somente como detalhe de moldura.
- Presentes, avisos de mapas/cartão/WhatsApp, Pix com clipboard simulado e movimento reduzido passaram. Nenhuma exceção JavaScript.
- Fotografia preservada: SHA-256 `6BAE9DD4089B04DDD7EE63898FB8EAB8CBBD3B6102F88A51CAFEA14759BF37B1`. Enquadramento e geometria da moldura inalterados.
- Alterados nesta etapa: `config.js`, `styles.css`, `index.html`, `tests/browser.cjs`, `TEST-RESULTS.md`; regenerados `test-results/390px.png`, `test-results/768px.png`, `test-results/1280px.png` e `test-results/browser.txt`.
- Sem deploy, publicação ou operação de escrita no Git. Demais campos pendentes preservados.

---

# Registro anterior — personalização de Aline & Marcos

## Resultado da etapa anterior

- `node --test tests/*.test.js`: **6 passaram, 0 falharam**. Verificações de sintaxe de `app.js` e `config.js` passaram.
- `node tests/browser.cjs`: **passou** em Chrome, executado fora da restrição que impedia o processo gráfico. A tentativa inicial restrita atingiu o tempo limite.
- **390, 768 e 1280 px:** sem rolagem horizontal; foto carregada, proporção original preservada e `object-fit: contain`; seis presentes renderizados.
- Abertura `Aline & Marcos`, nomes completos em uma única linha discreta; história igual ao texto configurado, sem placeholder. Retrato inteiro, sem cortar rostos ou mãos, abaixo dos nomes no celular e ao lado no desktop.
- Mapas/cartão sem configuração mostram aviso. Seleção de presente e foco no Pix funcionam. WhatsApp não configurado informa que nada foi enviado. Pix bloqueia placeholders e trata sucesso/falha da área de transferência simulada.
- Movimento reduzido respeitado; nenhuma exceção JavaScript no navegador.
- Foto via HTTP: **200**, 198157 bytes. Original e cópia com SHA-256 idêntico: `6BAE9DD4089B04DDD7EE63898FB8EAB8CBBD3B6102F88A51CAFEA14759BF37B1`.
- Corrigido o teste de largura: compara `scrollWidth` com `clientWidth` para considerar a barra vertical.

Alterados: `config.js`, `index.html`, `app.js`, `styles.css`, `tests/browser.cjs`, `TEST-RESULTS.md`.

Criado: `foto-casal.jpeg`, cópia idêntica de `foto-casal.jpeg.jpeg`, preservando o original.

Gerados: `test-results/390px.png`, `test-results/768px.png`, `test-results/1280px.png`, `test-results/browser.txt`.

Demais dados pendentes preservados. Nenhum deploy, publicação ou operação de escrita no Git. Sem repositório Git.

---

# Registro histórico da primeira versão

Data: 07/09/2026.

## Resultados confirmados

- `node --test tests/*.test.js`: **6 testes passaram, 0 falharam**.
- `node --check app.js`, `node --check config.js`, `node --check server.js` e `node --check tests/browser.cjs`: sem erros de sintaxe.
- Requisição HTTP local a `http://127.0.0.1:4173`: **200 OK**.
- Testes cobrem: rejeição de campos provisórios; links HTTPS permitidos para mapas e cartão; rejeição de destinos malformados; montagem/codificação da mensagem do WhatsApp; caminhos de fotos/QR locais; âncoras internas existentes e IDs únicos.

## Limitações e pendências

- A ferramenta de execução da skill de navegador não estava disponível. A tentativa alternativa com navegador local não concluiu a conexão dentro do prazo de teste.
- Portanto, **não foram confirmados em navegador**: aparência em celular/desktop, ausência de rolagem horizontal, navegação por teclado e cliques em Pix, mapas e WhatsApp.
- A implementação inclui layouts responsivos e movimento reduzido, mas isso não substitui a verificação visual.
- A cópia real para a área de transferência e os destinos externos finais dependem de dados que ainda não foram fornecidos. Não houve pagamento nem envio de mensagem.
- `tests/browser.cjs` contém um roteiro automatizado para 320, 375, 768 e 1440 px, avisos de configuração, seleção de presente e simulação de sucesso/falha da área de transferência. Execute com o servidor local ativo: `node tests/browser.cjs`. Requer Chrome instalado no caminho padrão (ou `CHROME_PATH`) e porta 9223 livre. Só gera capturas e relatório em `test-results` quando consegue se conectar. O perfil temporário do navegador é isolado do perfil pessoal.

## Git e publicação

A pasta inicial estava vazia, sem `.git`, e o comando Git não estava disponível. `git diff` não se aplica. Nenhum `git add`, commit, push, deploy ou publicação foi realizado.

## Arquivos criados

`index.html`, `styles.css`, `config.js`, `app.js`, `package.json`, `server.js`, `README.md`, `TEST-RESULTS.md`, `tests/app.test.js` e `tests/browser.cjs`.
