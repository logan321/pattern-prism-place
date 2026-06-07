Para permitir que o usuário edite o texto ou logo e aplique na estampa via UV Matriz de forma invisível, mas renderizada no 3D, seguiremos este plano:

1.  **Atualizar o `useCustomizerStore`**:
    *   Adicionar estado para `zonesConfiguration` (opcional, para mapear nomes de zonas para posições UV predefinidas se necessário).
    *   Manter a lógica atual de desenho em canvas que utiliza as zonas da `activeUVMatriz`.

2.  **Aprimorar `ThreeDViewer.tsx`**:
    *   Ajustar a função `drawOnCanvas` para aceitar um objeto de `zones` vindo diretamente da `activeUVMatriz` vinculada ao padrão selecionado.
    *   Garantir que a renderização `CanvasTexture` trate a estampa base (cor de fundo) e sobreponha os elementos (nome, número, escudo) nas coordenadas UV exatas definidas na matriz.
    *   Isso fará com que qualquer alteração no simulador (texto/imagem) seja projetada dinamicamente no 3D sem que o usuário precise gerenciar camadas, apenas editando as zonas.

3.  **Fluxo de Edição**:
    *   O usuário seleciona a estampa.
    *   O sistema carrega a `uv_matriz` associada.
    *   Ao editar Nome/Número/Escudo, o `ThreeDViewer` redesenha o canvas baseado nas coordenadas UV da matriz do padrão.
    *   A textura é aplicada no material do modelo 3D.

Dessa forma, o usuário apenas "preenche as zonas" e o sistema cuida da projeção no UV Map.