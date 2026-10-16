# Batalha Munduruku vs. Muirapinima — V1.9

## KIT DE SOBREVIVÊNCIA, BOTÂNICA E FAUNA DOS RIOS

Atualização incremental da V1.8. Mantém os perfis Guerreiro/Guerreira e Explorador/Exploradora, o modo Expedição 3D WebGL com fallback Canvas 2D, 4 rotas, 5 Guardiões, modo em equipe com IA, progressão e clima de Tupã. As novas regras de sobrevivência são fictícias; o jogo é independente e não representa tratamentos reais ou práticas oficiais dos povos indígenas.

### Novidade 1 — Kit médico acessível durante a Expedição

- Novo botão fixo **🧰 KIT MÉDICO** na lateral direita. A bolsa do inventário também abre o mesmo painel.
- **Soro antiofídico do jogo**: para picada de cobra peçonhenta identificada; o jogador é evacuado automaticamente ao **posto de saúde fictício** (não se autoaplica soro), com consumo de uma dose.
- **Soro antiaracnídico do jogo**: atendimento simulado de acidentes de aranha/escorpião, seguindo as mesmas regras de resgate.
- **Rádio de resgate**: retorno rápido ao acampamento e assistência de NPC do jogo, inclusive para ferroadas e acidentes aquáticos.
- **Repelente fictício**: afasta encontros de mosquitos e carrapatos por 90 segundos jogáveis.
- **Bálsamo de conforto, curativo e compressa anestésica de fantasia**: alívio limitado de efeitos simulados; **não são antídotos**.
- Status de ferimentos temporários no HUD. Tratamentos corretos têm impacto no estoque e na sobrevivência; ferimentos causam redução de vida/energia, com retorno ao acampamento se a vida zerar.

### Novidade 2 — Plantas coletáveis e bancada de criação

O mapa 3D, o minimapa e o fallback 2D têm **16 pontos de coleta** distribuídos em quatro grupos:

1. Folhagem aromática 🌿 — elemento do repelente fictício.
2. Resina da mata 🌳 — recurso genérico inspirado em árvores amazônicas, **sem alegação clínica**.
3. Folhas calmantes 🍃 — material para bálsamo de jogo.
4. Jambu encantado 🌸 — referência cultural ao jambu; a compressa anestésica é uma mecânica de fantasia, não orientação medicinal.

Aproxime-se até 3,6 unidades e pressione **COLETAR**. A coleta rende 25 XP, o objeto some do mundo e o recurso vai para a mochila. O botão **KIT MÉDICO** abre a bancada: combine itens **apenas no sistema de jogo**, consumindo inventário para obter repelente, bálsamo ou compressa. Ingredientes do mundo real NÃO devem ser preparados com base nessas receitas fictícias.

### Novidade 3 — Rios e fauna ampliada

O Bestiário passou de **21 para 30 encontros**, com nove novos registros:

- **Poraquê/puraquê (peixe-elétrico)**, com descarga fictícia;
- **Cobra-d’água**, sem tratá-la automaticamente como peçonhenta;
- **Insetos aquáticos** (percevejos d’água);
- **Arraia de água doce**;
- **Marimbondos**;
- **Cabas**, nome regional de vespas;
- **Mosquitos/pernilongos**;
- **Carrapatos**;
- **Formiga tocandira**.

O **cardume de piranhas** continua no rio desde a V1.7. Os novos animais possuem marcadores no mapa, modelos geométricos 3D básicos, aparição no modo Canvas 2D, descoberta e recompensa de XP. Os encontros perigosos afugentam-se e não são abatidos. Risco e agressividade são simplificações de videogame.

### Novidade 4 — Missão do Botânico e dos Rios

Explore em qualquer perfil de Expedição; registre os **4 tipos de plantas**, fabrique **1 repelente** e descubra **1 poraquê**. A conclusão libera **300 XP uma única vez por perfil/tribo/arena**. A missão coexistirá com a missão tradicional de abastecimento, sem apagá-la.

### Salvamento

Todos os recursos, coletas, tempo restante de repelente e progresso botânico são salvos no armazenamento local com a chave `batalha_sobrevivencia_v19_PERFIL_TRIBO_ARENA`. O progresso da V1.8 e versões anteriores não é sobrescrito. Quando reiniciar a expedição e as coletas pelo menu, o estoque de plantas V1.9 também recomeçará. O cadastro excluído remove os dados locais do módulo V1.9.

### Aviso importante

**Este jogo não orienta tratamento de envenenamento, picadas ou alergias.** Na vida real, antivenenos dependem da indicação e supervisão médica; plantas, receitas caseiras e repelentes caseiros não substituem assistência. Se houver suspeita de acidente por animal peçonhento, procure atendimento médico, não tente fabricar soro ou tratar por conta própria.

Fontes de contexto: Ministério da Saúde — [tratamento de acidentes ofídicos](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/animais-peconhentos/acidentes-ofidicos/tratamento) e [tratamentos caseiros](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/animais-peconhentos/acidentes-ofidicos/faq/faq/tratamentos-caseiros-funcionam).

### Instalação

1. Faça backup de `config.js`, repositório e progresso do aparelho.
2. Extraia o ZIP e **envie todos os arquivos e a pasta `assets/` para a raiz do GitHub Pages**, substituindo os arquivos da V1.8. Inclua especialmente `survival19.js` e `survival19.css`.
3. O cache offline passa para `batalha-tribos-v1-9-0`. Após o upload, atualize a página, feche e abra o PWA para usar a nova versão.
4. Abra **EXPEDIÇÃO → Guerreiro ou Explorador → COMEÇAR** e use **🧰 KIT MÉDICO**. Confira `TESTES_V1.9.md`.

### Limitações conhecidas

- Esta entrega implementa sistemas jogáveis e **modelos geométricos 3D**, não criaturas cinematográficas fotorrealistas no nível PUBG.
- O mundo aberto continua uma sessão offline local, não multiplayer em tempo real.
- O inventário fica no dispositivo atual, sem sincronização online da progressão.
