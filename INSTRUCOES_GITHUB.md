# COMO ATUALIZAR NO GITHUB — V1.5

## 1. Preparação

1. Baixe o arquivo `Batalha-Munduruku-vs-Muirapinima-V1.5.zip` e **extraia o conteúdo**.
2. Use **o repositório que já hospeda seu jogo**. Se ainda não criou, entre em https://github.com/new, crie um repositório **público**, como `batalha-munduruku-muirapinima`.
3. O GitHub Pages deve estar em **Settings → Pages → Deploy from a branch → main → /(root) → Save**.

## 2. Atualizar os arquivos

1. Entre no repositório do jogo → **Add file → Upload files**.
2. Faça o upload do conteúdo **extraído**, preservando a pasta `assets/`. **Não faça upload apenas do ZIP**.
3. Os arquivos `index.html`, `game.js`, `social.js`, `exploration.js`, `guardians.js`, `trails.js`, `styles.css`, `expedition.css`, `guardians.css`, `trails.css`, `sw.js`, `manifest.webmanifest` e as imagens precisam estar nos caminhos indicados. Todos os arquivos devem existir na raiz, exceto os itens em `assets/`.
4. Confirme **Commit changes** e espere a implantação em **Actions** ou **Settings → Pages**.
5. Exemplo de endereço: `https://SEU-USUARIO.github.io/batalha-munduruku-muirapinima/`.

**Atenção:** se já está usando Supabase para duelos privados, faça **backup do `config.js` atual** e preserve-o no repositório ao atualizar. O `config.js` deste pacote não contém chaves. Não use `service_role` ou credenciais sigilosas no GitHub Pages. O script `supabase-setup.sql` continua sendo o da V1.3; os Guardiões e as Rotas são somente offline e não exigem novas tabelas.

## 3. Atualizar no Android

1. Abra a URL do jogo no Chrome.
2. Se houver uma versão PWA instalada, feche e reabra o aplicativo com internet uma vez para atualizar o service worker (`batalha-tribos-v1-5-0`).
3. Se continuar aparecendo a tela antiga, tente recarregar o endereço, fechar/reabrir o PWA ou limpar **apenas o cache** do site. **Não limpe dados/armazenamento** sem antes aceitar perder seu progresso offline.
4. Use em **tela horizontal** para maior conforto durante a exploração.

## 4. Teste da V1.5

1. Faça o cadastro com um apelido e idade autodeclarada, confirme o aviso de privacidade.
2. Na tela inicial, toque **Conhecer os Guardiões** para abrir o catálogo com os cinco desafios.
3. Toque **Expedição**, selecione uma tribo e entre no mapa.
4. Abra **Guardiões** para escolher **Equipe de 3** ou **Sozinho**. Escolha **Marcar no mapa** para encontrar o Saci.
5. Use o joystick, colete alimentos e acumule XP. No catálogo, observe os requisitos de nível para os Guardiões seguintes.
6. Ao vencer o Saci, verifique o **Amuleto do Vento** na mochila e a liberação da prova do Curupira quando atingir o nível exigido.
7. Na expedição abra o botão **ROTAS**, marque o Mirante da Várzea, siga a seta de navegação e observe o marcador no minimapa. Ao chegar perto, confirme o XP.
8. Saia e entre novamente para conferir persistência das rotas, dos amuletos e do XP **neste aparelho**.
9. Confira que concluir a missão de abastecimento não repete o bônus ao reentrar.

## 5. Limitações claras

A expedição é um protótipo offline, com personagens estilizados em Canvas 2D. Não há humanos 3D fotorrealistas, multiplayer cooperativo de expedição ou batalhas 3v3 pela rede nesta versão. O modo online anterior só fica ativo quando Supabase é configurado e testado. Antes de divulgar publicamente, complete informações do controlador, contato e período de retenção em `privacidade.html` e revise a representação cultural.
