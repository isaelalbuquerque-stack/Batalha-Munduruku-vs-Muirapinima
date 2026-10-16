# Batalha Munduruku vs Muirapinima — V1.5 · Rotas da Floresta

**Protótipo independente, não oficial**, inspirado na rivalidade artística do Festribal Jurutiense. As tribos do festival e os povos indígenas não devem ser confundidos; as lutas e habilidades sobrenaturais são **ficção de jogo**, e não documentação de tradições indígenas. Diferentes lendas brasileiras e amazônicas foram reunidas para a aventura; Jurupari tem significados específicos em diferentes tradições indígenas e não é representado aqui como divindade ou vilão de uma comunidade real. Para publicação oficial/comercial, consulte especialistas e representantes culturais locais sobre personagens, indumentárias, símbolos e nomes.

## Novidades da V1.5 — Rotas da Floresta

- **Quatro novos locais para encontrar a pé**, usando o joystick e a câmera: Acampamento do Igarapé, Mirante da Várzea, Clareira da Sumaúma e Trilha das Serras.
- **Pontos luminosos no cenário e no mapa**, mais marcador de destino, seta direcional e distância em metros de jogo.
- **Novo botão ROTAS** que abre um painel interativo: selecione qual local deseja rastrear, veja distâncias, desafios concluídos e recompensas.
- **Experiência e pontos por descoberta**: 90, 130, 170 e 220 XP (somente uma vez por tribo e arena), com progresso salvo localmente, sem depender da internet.
- **Correção da missão de abastecimento**: progresso de conclusão é preservado para evitar repetir a recompensa ao reiniciar o jogo.
- Preservados todos os recursos anteriores da V1.4, incluindo os cinco Guardiões e os duelos simplificados online quando configurados.

**Importante**: ainda é um protótipo com personagens estilizados e projeção Canvas 2D, não um jogo fotorrealista 3D. O combate 3x3 via rede não foi implementado. Esta entrega dá novos objetivos à exploração livre, preparando a migração futura para um motor 3D real.

## Recursos herdados da V1.4


- **Cinco Guardiões de fantasia acessíveis na Expedição**: Saci, Curupira, Matinta Perera, Mapinguari e Jurupari.
- Cada um possui **posição fixa no mapa**, barra de vida, ataques, dificuldade, desbloqueios e recompensas próprias.
- **Progressão com XP e níveis** (1–30), salva localmente **por tribo**. Recolher alimentos, pescar, realizar caça fictícia, enfrentar adversários, concluir a missão de abastecimento e descobrir rotas concedem XP; vencer Guardiões também.
- **Escolha de formação**: equipe com dois aliados IA (requisitos de nível menores, redução de dano) ou desafio individual (níveis maiores, sem aliados na arena).
- **Sequência de provas**: Saci → Curupira → Matinta Perera → Mapinguari → Jurupari. Não é possível atacar Guardiões bloqueados; ao se aproximar, o HUD mostra o requisito.
- **Amuletos exclusivos de cada Guardião** adicionam bônus permanente de poder após vitória, consultáveis no catálogo e na mochila.
- **Painel de Guardiões** acessível pelo menu inicial ou durante a expedição, com ações para marcar o destino no mapa ou reiniciar somente a progressão dos Guardiões.
- **Galeria de escolha de tribos atualizada** com os personagens humanos em imagens realistas previamente aprovadas. A arte é estática, não um personagem 3D animado.
- Mantidas as modalidades **Disputa Folclórica**, **Confronto** e **Expedição** da V1.3 e as salas online de duelos da versão anterior (quando configuradas).

## Guardiões e requisitos

| Guardião | Vida | Dano | Nível com equipe | Nível solo | Recompensa | XP |
|---|---:|---:|---:|---:|---|---:|
| Saci | 100 | 7 | 1 | 3 | Amuleto do Vento (+6 poder) | 180 |
| Curupira | 160 | 9 | 3 | 5 | Amuleto das Trilhas (+10 poder) | 260 |
| Matinta Perera | 220 | 12 | 5 | 8 | Amuleto da Noite (+14 poder) | 360 |
| Mapinguari | 330 | 17 | 8 | 12 | Amuleto da Força (+20 poder) | 520 |
| Jurupari | 430 | 20 | 11 | 16 | Amuleto da Visão (+30 poder) | 750 |

O jogo também exige vencer o Guardião anterior. Os pontos de vida e de dano são valores **fictícios de balanceamento**. Nível = 1 + parte inteira de (XP ÷ 160), limitado a 30. No modo equipe, dois aliados IA entram na expedição. O solo é um desafio opcional mais exigente.

## Controles

**Celular:** joystick esquerdo = mover; deslizar no fundo = girar câmera; COLETAR = recursos e pescaria; CONFRONTO = ataque com lança/arco; EQUIPE = seguir/defender; GUARDIÕES = catálogo e modo equipe/solo; MAPA = minimapa ampliado; BOLSA = inventário. Próximo a um Guardião, aproxime-se com a lança ou utilize o alcance maior do arco. Ferramentas são de fantasia de jogo.

**Computador:** WASD/setas = movimento; Q/R = virar câmera; Shift = correr; F ou espaço = coleta; J = confronto; E = comandar equipe; I = bolsa; M = mapa; Esc = sair.

## Estrutura e instalação

O ZIP está preparado para **GitHub Pages**, com arquivos na raiz, `index.html`, CSS/JavaScript, imagens `.webp`, `manifest.webmanifest` e `sw.js` com cache V1.5. Não exige ferramentas de compilação nem dependências JavaScript para o modo offline.

**Importante:** se você já configurou o Supabase em um repositório, preserve seu `config.js` ao enviar esta versão; o arquivo do ZIP vem com placeholders para evitar publicar credenciais. Nunca coloque a chave `service_role` no frontend. O multiplayer 3v3 em mundo aberto NÃO está implementado; o online atual, se configurado, é um duelo simplificado 1v1 entre dois aparelhos.

## Qualidade gráfica e limitações

Este **não é um jogo com avatares 3D realistas como PUBG**. O protótipo da Expedição usa projeção 3D feita em **Canvas 2D**, silhuetas estilizadas para os Guardiões e figuras básicas em movimento. As imagens aprovadas e realistas são usadas nas telas de seleção, não como malhas 3D. Converter personagens e mapas em humanos e ambientes fotorrealistas navegáveis requer um motor 3D/WebGL com malhas, rigging, animações, iluminação e otimização mobile, a desenvolver em próximas versões. As áreas chamadas “sagradas” e os amuletos são cenários ficcionais; nenhuma prática religiosa real é simulada.

## Privacidade e segurança

Cadastro por apelido, idade autodeclarada e tribo. A idade fica somente na sessão e não é enviada ao servidor. XP, recompensas e coletas ficam no armazenamento **local** e podem ser reiniciados. Menores de 18 anos ficam restritos a recursos offline nesta etapa, mas essa regra é baseada em autodeclaração, não em verificação robusta de idade. Antes de publicar para o público geral, complete o aviso de privacidade e revise medidas exigidas por LGPD e regras de proteção a crianças e adolescentes.

Consulte `INSTRUCOES_GITHUB.md` para instalar esta atualização.
