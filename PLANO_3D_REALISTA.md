# Pipeline de realismo gráfico — produção da versão principal 2.x

A fase atual é uma demonstração visual 2D para testar fluxos. **Este documento descreve trabalho futuro; não representa modelos entregues no pack.**

## Decisão de produção

- **Objetivo:** exploração em terceira pessoa, em estilo visual de sobrevivência contemporânea, com personagens de anatomia e movimento humanos, sem estética blocada ou de brinquedo.
- **Opção navegador/GitHub Pages:** WebGL via Three.js/Babylon.js, modelos `.glb` com materiais PBR metálico/rugoso, animações esqueléticas, sombras eficientes e LOD. Depende de otimização agressiva no Android.
- **Opção Android nativo com desempenho superior:** Unity URP ou Unreal com configuração móvel; construção e distribuição de APK, fora do GitHub Pages.
- **Prova de qualidade obrigatória:** primeiro produzir 1 personagem humano rigado, 1 facão realista, 1 onça, 1 jaguar/guardião fantástico e 1 microcenário de mata. Validar o resultado rodando em celular real **antes** de ampliar para dezenas de assets.

## Contratos visuais dos assets 3D (a produzir)

1. **Personagens:** anatomia proporcional, mãos/dedos, cabeça e cabelos diferenciados, vestimenta têxtil com textura PBR e deformação esquelética; animações de espera, andar, correr, abaixar, nadar, interagir e combate.
2. **Facão:** silhueta longa e curva, chanfro fino, lâmina de metal envelhecido, cabo orgânico, bainha; não representar lâmina como prisma retangular.
3. **Lança:** haste cilíndrica irregular, ponta polida, enrolamento de fibra e variação de material.
4. **Arco/flechas:** lâmina do arco curva, corda tensionada, aljava, flechas com corpos e penas; animação de disparo.
5. **Tacape:** madeira entalhada com seção progressiva, veios materiais e desgaste controlado.
6. **Bichos:** esqueletos e locomoção específicos por espécie; curvas e proporções anatômicas plausíveis (jacaré não deve compartilhar malha de sucuri, nem peixe a de inseto).
7. **Guardiões:** direção artística fantástica; Mapinguari pesado e volumoso, Curupira ágil com pés invertidos, Matinta em silhueta noturna, Saci rápido, Jurupari estilizado com revisão cultural adequada.
8. **Floresta:** vegetação instanciada, LOD, terreno PBR, raízes, folhas, igarapés, som ambiental e impostores vegetais distantes.

## Requisitos de performance e validação

- Perfil Android intermediário; meta inicial 30 fps sustentados em tela real de teste.
- Controlar triângulos e tamanho de textura conforme perfil de aparelho, perfil simplificado opcional.
- Priorizar 1 personagem + 1 clareira interativa em WebGL com qualidade real antes de mapear mundo completo.
- Colisões, navegação, salvamento, câmera e controles móveis testados em aparelho de referência.
- Validar licenças dos modelos 3D/áudio/textura externos antes de distribuir.
- Antes de publicar símbolos ou referências rituais de comunidades indígenas, fazer revisão e consentimento quando aplicável.

## Sequência sem regressão da V1.9

**A.** Obter arquivos atuais da V1.9, verificar licença e estrutura dos módulos.  
**B.** Implementar cena de qualidade 3D pequena e comparar visualmente com PUBG Mobile como meta, sem copiar assets protegidos.  
**C.** Integrar câmera, controle, personagem e inventário ao projeto atual.  
**D.** Substituir em lotes os elementos estilizados, mantendo os modos história, expedição, confrontos e guardiões existentes.  
**E.** Testar em celulares e hospedar primeiro em ramo de prévia, nunca sobrescrever a versão estável sem validação.
