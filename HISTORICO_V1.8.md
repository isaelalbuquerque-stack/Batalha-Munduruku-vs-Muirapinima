# Batalha Munduruku vs. Muirapinima — V1.8

## Exploradores e o Poder do Trovão

Esta versão é uma atualização da V1.7, preservando o jogo folclórico, o confronto fictício, a expedição livre, as 4 rotas, 5 Guardiões e 21 encontros de fauna/lendas. O jogo segue independente, sem vínculo oficial com o Festribal ou comunidades indígenas.

### Novos perfis de personagem na Expedição

1. **Guerreiro / Guerreira:** personagem do universo ficcional tribal, lança, arco, escudo, bolsa, aliados IA e desafios antigos.
2. **Explorador / Exploradora:** personagem neutro, não representado como integrante de povo indígena. Seleciona o território da expedição, veste uniforme de campo, colete, botas, chapéu e mochila em **modelo 3D procedural**. Os acompanhantes também usam equipamento de campo. Seu progresso de coletas é salvo separadamente do guerreiro para não substituir as conquistas da V1.7.

### Equipamentos de explorador

- **Facão fictício de campo:** defesa de curta distância no confronto fictício.
- **Carabina fictícia:** 18 cargas iniciais, usadas apenas contra adversários de fantasia e Guardiões, não contra a fauna real.
- **Sinalizador:** 4 unidades iniciais para afugentar encontros perigosos; não abate animais.
- **Bolsa/mochila:** 4 águas (cantil), 4 rações, 2 curativos, bússola, binóculos e lanterna.
- Os 3 kits originais de primeiros socorros da V1.7 continuam disponíveis no inventário. Curativos de expedição recuperam 22 pontos de vida simulados; kits originais recuperam 45 e removem efeitos temporários.
- Saúde, energia, sede e alimentação são mecânicas simplificadas de jogo, **não orientação médica**. Recursos básicos e equipamentos do explorador são salvos no aparelho.
- Exploradores podem cumprir os dois objetivos de caça da missão herdada como **registro de observação da fauna sem abate**, usando COLETAR perto do animal fictício.

### Tupã · Voz do Trovão

Evento atmosférico ficcional com tempestades, chuva e relâmpagos. A tempestade ocorre ao longo da expedição e pode ser acionada para demonstração no painel **⚡ TUPÃ · TROVÃO**. Tupã não é um inimigo, não sofre ataques e não tem barra de vida. A janela explica que Tupã está ligado ao trovão em tradições tupi-guarani e que diferentes povos indígenas possuem cosmologias próprias. Em particular, as narrativas Munduruku incluem **Karosakaybu**. Não representar essas culturas como uma única religião.

Referências culturais de consulta, não endosso do jogo:
- https://educapes.capes.gov.br/handle/capes/1180250 — *A origem da religião Munduruku*, de Alcivan Saw Munduruku e Messias Furtado da Silva.
- https://www.indios.org.br/pt/Povo%3AMunduruku — Povos Indígenas no Brasil, seção de história e narrativa de origem.
- https://digicoll.lib.berkeley.edu/record/82998/files/ucp049-002.pdf — *Mundurucú Religion*, R. F. Murphy, estudo etnográfico clássico.
- Para aprofundar as referências e retratos culturais em uma futura publicação comercial, é recomendável consulta e participação de representantes de cada povo envolvido.

### Gráficos e desempenho

- Motor **WebGL 1** com z-buffer, malhas volumétricas, câmera terceira pessoa, névoa, terreno, rio, vegetação e um modelo exclusivo do explorador (colete, mochila, chapéu, rosto e equipamento na mão), com ciclo de caminhada simplificado.
- A tempestade modifica o céu, adiciona flashes e partículas tridimensionais de chuva. O fallback Canvas 2D também mostra a chuva.
- Qualidades **Normal / Leve**, com fallback 2D automático quando não há GPU WebGL funcional. Não depende de CDN ou bibliotecas externas.
- **O estilo segue geométrico, não fotorrealista.** Para chegar à qualidade visual próxima a PUBG será preciso incluir modelos e animações 3D profissionais, texturas PBR e otimização dos arquivos para celulares Android. Esta V1.8 é um protótipo jogável de sistemas, não um jogo comercial completo.

### Próximo passo

**Roteiros das missões ficam para uma atualização futura**, conforme solicitado. A V1.8 apenas adapta as missões já existentes para os dois tipos de personagem. O multiplayer 3×3 de mundo aberto ainda não foi implementado (a equipe local continua usando personagens controlados por IA).

## Publicação GitHub Pages / PWA

1. Salve backup do seu `config.js` atual e não publique credenciais secretas ou chave `service_role`.
2. Descompacte o arquivo ZIP e envie **todos os arquivos e a pasta `assets/`** para a raiz do repositório.
3. Inclua obrigatoriamente os novos arquivos `adventure18.js`, `adventure18.css` e `mythos18.js`; mantenha as pastas existentes.
4. O cache offline foi atualizado para `batalha-tribos-v1-8-0`; feche e reabra o PWA após a implantação (talvez seja necessário atualizar a página antes).
5. Abra Expedição → selecione **EXPLORADOR** → COMEÇAR. Confira mundo 3D, equipamentos, botões de tempestade, mapa e bestiário. Em caso de erro WebGL, use o fallback 2D ou gráficos Leve.
6. Consulte `TESTES_V1.8.md` para a lista de verificação do celular.
