# Convite de casamento

Primeira versão estática em português, sem dependências, imagens externas, dados reais ou banco de dados.

## Visualizar

Abra `index.html` diretamente ou execute `node server.js` nesta pasta e acesse **http://127.0.0.1:4173**. O servidor escuta apenas o computador local. Encerre com Ctrl+C. O endereço local é preferível para testar a área de transferência.

## Personalizar

- Sugestões físicas: edite `presentesFisicos` em `config.js`. A lista recolhível tem três categorias e é somente informativa, sem preços, links de compra, reservas ou integração com o modal Pix.

- Edite `config.js`: nomes, data, história, igreja, recepção, orientações, links de mapas, favorecido, Pix e WhatsApp. Todos os dados pessoais estão entre colchetes.
- WhatsApp: use somente dígitos, no formato internacional, com país e DDD. A confirmação só acontece quando o convidado envia a mensagem no WhatsApp.
- Pix: prefira uma chave aleatória. Informe também o nome do favorecido. O botão não copia o placeholder. Confira ambos no aplicativo do banco.
- QR Code: obtenha um QR **verdadeiro no banco**, confira chave/favorecido e salve em `assets/pix.png`. Informe esse caminho em `qrCode`. Não há geração de QR ou comprovação automática de pagamentos. Prefira QR sem valor fixo para permitir as contribuições sugeridas.
- Foto: salve uma foto autorizada em `assets/casal.jpg`, preencha `foto` e descreva-a em `fotoAlt`. A pasta `assets` pode ser criada quando os arquivos estiverem disponíveis. Formatos aceitos: PNG, JPEG e WebP. As decorações atuais são apenas CSS e caracteres tipográficos.
- Mapas: use um link HTTPS do Google Maps específico para cada local. São aceitos google.com/maps, google.com.br/maps, maps.google.com, maps.app.goo.gl e goo.gl/maps.
- Cartão: informe um link HTTPS externo do Mercado Pago ou PagBank/PagSeguro. Outros provedores exigem inclusão explícita na lista de domínios confiáveis em `safeLink`, no `app.js`.
- Edite os presentes e valores na lista `gifts` em `app.js`. Selecionar um presente abre um modal acessível, fechado inicialmente, com a contribuição escolhida; não cria cobrança, reserva ou checkout. A opção livre aceita reais positivos no formato brasileiro, como `150,00` ou `1.250,90`. O valor deve ser informado no aplicativo do banco: não é incorporado à chave ou ao QR estático. Cartão só aparece com link válido configurado. Fechar, Esc e clique externo limpam a seleção e devolvem o foco ao cartão de origem.
- Para modificar o visual, edite `styles.css`. Os campos de configuração também aparecem no HTML como conteúdo provisório sem JavaScript; se precisar de conteúdo final sem JavaScript, atualize os textos correspondentes no `index.html`.

## Testes

Execute `node --test tests/*.test.js` ou `npm test`. Os testes verificam os links permitidos, bloqueio de placeholders, montagem da mensagem do WhatsApp, arquivos locais e âncoras.

Roteiro visual: em 320, 375, 768 e 1440 px, confira todas as seções, navegação por Tab, foco visível, presentes, avisos de configuração e ausência de rolagem horizontal. Teste também a preferência de movimento reduzido. Com dados reais, confira cada mapa, a cópia da chave e a abertura do WhatsApp; não é preciso enviar mensagem ou fazer pagamento para revisar os destinos.

Nenhum deploy, publicação ou operação de escrita no Git foi realizado.
