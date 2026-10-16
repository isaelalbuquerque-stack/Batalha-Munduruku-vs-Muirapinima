# Relatório de validação V1.7 — Perigos da Floresta

**Concluído em:** 16/10/2026

## Verificações aprovadas

- Sintaxe JavaScript: todos os scripts passaram por `node --check`.
- Arquivos PWA: 38 recursos precache listados em `sw.js` estão presentes nos diretórios esperados.
- Componentes HTML: sem IDs duplicados no documento.
- Motor da fauna: 21 entidades inicializadas; XP liberado uma única vez por descoberta; progresso reaberto via armazenamento local; ataque provoca redução da vida; defesa repele o animal; kit recupera vida; malha 3D procedural gera geometria em chamada de teste.
- Teste de navegador com HTML/CSS/JS embutidos: página inicial e entrada na Expedição funcionaram; painel Bestiário apresentou 21 cartões e fechou; encontro concedeu pontos; alternância de gráficos funcionou; nenhum erro JavaScript foi detectado.
- Correção de usabilidade: diálogos da Expedição recebem eventos de toque/clique.

## Limitações do teste

- O ambiente de navegador automatizado bloqueia as URLs HTTP e `file://` e não expôs WebGL real. Por isso, os testes de interface foram feitos com recursos embutidos, usando o fallback Canvas 2D.
- O WebGL foi apenas validado estaticamente e por composição procedural de malhas, **não** por renderização real na GPU de um celular.
- O comportamento da fauna é uma mecânica de fantasia, não uma representação científica dos animais nem uma retratação oficial de narrativas indígenas.

## Teste recomendado no Android

1. Instale o ZIP no mesmo repositório GitHub Pages, preservando `config.js` se configurado.
2. Abra a Expedição e confirme `WEBGL 3D`, se disponível; use `GRÁFICOS: LEVE` quando necessário.
3. Acesse BESTIÁRIO e vá até um ponto verde ou vermelho no minimapa, observando a descoberta.
4. Equipe ESCUDO, use CONFRONTO perto do animal e confirme o afastamento.
5. Deixe um risco da floresta reduzir parte da sua vida; abra BOLSA e use o kit de cura.
6. Saia e volte à Expedição para confirmar que o bestiário permaneceu registrado.
7. Feche/reabra o PWA uma vez online para instalar o cache V1.7; teste também sem conexão após a atualização.
