# Instalar V1.9 no GitHub Pages

1. Guarde um backup da V1.8 e de `config.js`.
2. Extraia `Batalha-Munduruku-vs-Muirapinima-V1.9-Kit-Sobrevivencia-Rios.zip`.
3. No GitHub, entre no repositório do jogo na branch publicada pelo GitHub Pages.
4. Envie **todos os arquivos** descompactados e **a pasta `assets/`**, mantendo a hierarquia. Se estiver atualizando, substitua arquivos com nomes iguais.
5. Confirme que os arquivos novos `survival19.js` e `survival19.css` foram enviados, junto com `fauna.js`, `exploration.js`, `expedition3d.js`, `index.html`, `sw.js`, `social.js` e `game.js` atualizados.
6. Selecione **Commit changes**. O projeto funciona sem bibliotecas externas, após ser servido por HTTPS pelo GitHub Pages.
7. No Android, abra o jogo online uma vez para carregar o cache V1.9. Se ainda aparecer V1.8, atualize a guia e reabra o PWA instalado. Em caso de cache antigo persistente, limpe os dados de site do jogo com cuidado: isso também apaga saves locais.
8. Teste **Expedição → Kit Médico → Plantas / Criar** e o **Bestiário 0/30**. Use `TESTES_V1.9.md` como roteiro.

**Importante:** `config.js` pode conter configuração pública, mas nunca coloque chave secreta `service_role` nem senhas no GitHub.

A PWA é instalável quando hospedada em HTTPS. O teste no ambiente de desenvolvimento validou inicialização do módulo, coleta, menu, soro/resgate e 30 entradas do bestiário em navegador headless com scripts locais injetados; o funcionamento final em seu celular deve ser conferido depois da publicação.
