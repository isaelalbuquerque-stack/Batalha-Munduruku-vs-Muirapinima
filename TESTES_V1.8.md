# Validação da V1.8 (16/10/2026)

## Verificações realizadas

- [x] JavaScript sintaticamente válido em todos os módulos (Node `--check`).
- [x] Tela inicial e seleção do perfil explorador na Expedição; escolha de região não exige pertencer a um povo.
- [x] Seleção de arsenal alterna facão, carabina, sinalizador e bolsa.
- [x] Água do cantil eleva hidratação e gasta um recurso quando necessário.
- [x] Curativo eleva saúde simulada e diminui a quantidade disponível.
- [x] Disparo fictício da carabina só consome munição com alvo de fantasia ao alcance.
- [x] Sinalizador consome carga e permite a reação de afugentamento da fauna.
- [x] Janela de contexto cultural e botão que ativa tempestade de demonstração.
- [x] Bestiário de 21 criaturas e mapa da V1.7 abrem normalmente.
- [x] Voltar ao modo guerreiro restaura as quatro ferramentas anteriores.
- [x] Nenhuma exceção de página durante os testes de interface em Chromium (HTML e JS carregados em memória).
- [x] Renderizador WebGL executado em **contexto simulado**: geração de cenário, personagem e envio das malhas 3D sem erro de JavaScript.
- [x] Arquivos listados no cache PWA verificados e ZIP íntegro.

## Pendência (requer dispositivo real)

- [ ] Compilar os shaders e renderizar WebGL 1 na GPU do celular Android. No navegador de teste, WebGL é bloqueado por política do ambiente e ativou o fallback 2D.
- [ ] Validar FPS, bateria e aquecimento com gráficos **Normal** e **Leve** durante 10 minutos.
- [ ] Verificar controles multitoque, câmera, tamanho dos botões e HUD em modo retrato/paisagem.
- [ ] Verificar atualização do service worker e uso offline após visita online.

**Limitação visual:** personagem e fauna continuam procedurais geométricos. A otimização de personagens realistas com modelos profissionais e texturas detalhadas segue como uma etapa distinta.
