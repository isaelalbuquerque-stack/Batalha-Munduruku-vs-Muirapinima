# Batalha Munduruku vs. Muirapinima — Pack 2.1

**Guardiões da Floresta — prévia jogável e pacote de pré-produção gráfica**

## Importante — o que este ZIP é

Este ZIP é **uma demonstração independente em HTML5 Canvas 2D e PWA**, com telas, exploração, mecânica básica de inventário e bestiário. **Não é uma atualização diretamente integrada à versão 1.9 original**, porque o código-fonte completo da 1.9 não estava disponível para edição nesta sessão. **Não é um jogo 3D fotorrealista**, nem traz personagens humanos prontos no padrão visual PUBG. A nova interface é mais elaborada, mas a arte do mundo continua sendo prototípica. Consulte `PLANO_3D_REALISTA.md` para a conversão 3D.

## O que funciona nesta prévia

- Menu reformulado com a arte oficial fornecida anteriormente pelo criador.
- Seleção de equipe Munduruku, Muirapinima ou explorador livre e seleção de perfil.
- Exploração de floresta em 2D top-down, com vegetação, trilhas, rio, recursos e personagens de vista superior.
- Movimento por **WASD/setas** ou **direcional na tela** (Android), e animação simples de caminhada.
- 30 entradas de bestiário (fauna, riscos ambientais, insetos e os 5 guardiões fantásticos).
- Observação não letal de animais, coleção de recursos, experiência e missão do Cartógrafo.
- 16 recursos no catálogo; 7 itens de sobrevivência descritos (somente curativos estão operacionais).
- Arsenal com 6 ícones vetoriais desenhados para o pack. Equipar item muda poder e alcance contra guardiões.
- Confronto simplificado contra os 5 guardiões e cura simplificada.
- Interface de arsenal, mochila, mapa, bestiário e opções do jogo.
- Chuva de fantasia alternável; salvamento em `localStorage` **exclusivo da prévia**.
- Sem necessidade de cadastro ou Supabase; recursos locais instaláveis como PWA em HTTPS.

## Controles

| Ação | Teclado | Android |
| --- | --- | --- |
| Andar | WASD ou setas | Direcional na tela |
| Observar/coletar | E | OBSERVAR / COLETAR |
| Atacar guardião | Espaço | ATACAR GUARDIÃO |
| Curativo | H | USAR CURATIVO |
| Bestiário | B | Aba BESTIÁRIO |
| Mochila | I | Aba MOCHILA |

## Como testar sem arriscar sua V1.9

1. Extraia o ZIP. Os arquivos HTML/JS/CSS devem ficar na raiz do repositório; `assets/` e `data/` devem permanecer como pastas.
2. Crie um repositório separado, como `batalha-v21-preview`, **sem apagar ou sobrescrever** seu repositório original V1.9.
3. Envie os arquivos **extraídos**, não o ZIP, por `Add file → Upload files`.
4. Ative `Settings → Pages → Deploy from a branch → main → /(root)`.
5. Abra a URL do GitHub Pages em Chrome, selecione `Iniciar expedição` e explore.
6. Opcionalmente use `Adicionar à tela inicial` no Android. O primeiro carregamento deve estar online; o Service Worker armazena os arquivos do protótipo para acessos seguintes.

**Para abrir localmente no PC:** sirva a pasta via `python -m http.server 8000` e abra `http://localhost:8000/`. Abrir `index.html` diretamente por `file://` não é recomendado para módulos JavaScript.

## Limites desta prévia

- Os modelos 3D PBR realistas e animações humanas (meta visual PUBG Mobile) **não foram produzidos**; personagens e animais são silhuetas/vetores de demonstração.
- Mundo livre em 2D; travessia fluvial e biomas extras ainda não são jogáveis.
- Comportamentos dos animais são simples; combate com guardiões é de aproximação, sem IA completa.
- São 30 **entradas no bestiário**, não 30 espécies com modelos 3D distintos.
- Os 7 itens do kit são catálogo, mas só os curativos funcionam como consumíveis. Antídotos mágicos são fictícios: não são orientação de primeiros socorros.
- Não há multiplayer em tempo real, servidor ou sincronização entre aparelhos.
- A seleção de facção na demonstração não oferece missões distintas de cada equipe.

## Estrutura

- `index.html`: telas e estrutura.
- `styles.css`: visual responsivo.
- `app.js`: simulação 2D, interação, combate e salvamento.
- `data/catalog.js`: dados editáveis de equipamentos, criaturas e recursos.
- `assets/arsenal.svg`: arte vetorial das seis armas/objetos.
- `assets/logo-aprovado.webp`: logo aprovado já presente no histórico do projeto.
- `sw.js`, `manifest.webmanifest`, `assets/icon.svg`: PWA.
- `PLANO_3D_REALISTA.md`: especificação da conversão gráfica séria.

## Próxima integração

Para atualizar de fato a versão 1.9 sem regressões, disponibilize o ZIP original `Jogo-V1.9.zip` ou os arquivos atuais do GitHub. Então deve-se fazer diff, migrar telas e catálogos, testar salvamentos e manter os modos existentes, sem sobrescrever os arquivos originais às cegas.

**Observação cultural:** estética de jogo inspirada no Festribal de Juruti, não representação documental. Antes de uma versão pública, a iconografia, nomes e rituais devem ser revisados com representantes culturais e detentores de direitos pertinentes.
