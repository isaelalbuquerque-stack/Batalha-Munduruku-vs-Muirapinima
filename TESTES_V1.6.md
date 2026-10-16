# Checklist de teste V1.6

1. Verificar logo, seleção de tribos, papéis e três modalidades.
2. Abrir Expedição: status deve indicar WEBGL 3D quando compatível; mover joystick e câmera.
3. Testar NORMAL/LEVE e atualizar a página para verificar persistência.
4. Coletar recurso; confirmar que mochila, contador, pontuação e XP aumentam apenas uma vez.
5. Visitar ROTAS e marcar objetivos; verificar marcador e XP após descoberta.
6. Localizar os Guardiões e iniciar um combate; confirmar vida, bloqueios e progresso.
7. Voltar para o menu, acessar Disputa Folclórica e Confronto; conferir jogabilidade antiga.
8. Fechar e reabrir a PWA; verificar progresso salvo e ausência de repetições indevidas.
9. Testar offline depois de deixar PWA completar o cache, desligando a internet; modo online requer rede.
10. Se aparecer MODO 2D, testar outro navegador/dispositivo com WebGL ativado.

Teste automatizado local: checagem sintática JavaScript, navegação nos menus, Expedição e mudança de qualidade, além de sequência de desenho em interface WebGL simulada. O Chromium deste ambiente bloqueou a GPU real e não permitiu avaliação visual do modo 3D; deve-se validar o 3D em dispositivo físico.
