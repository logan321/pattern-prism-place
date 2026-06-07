# Plano de Migração: Arquitetura Baseada em UV Matrix

Este plano detalha a transição do sistema de posicionamento atual (baseado em cliques no modelo 3D) para um fluxo onde a **UV Matrix** é a fonte única de verdade para todas as personalizações.

## 1. Visão Geral da Nova Arquitetura

O novo fluxo separa a **definição espacial** (onde as coisas ficam) da **visualização 3D** (como elas parecem).

- **Fonte de Verdade:** A tabela `uv_matrices` armazenará as zonas com coordenadas em pixels (0-2048) e dimensões fixas.
- **Renderização de Textura:** O sistema criará um `Canvas` único combinando:
    1. Estampa Base (SVG/PNG)
    2. Elementos Dinâmicos (Nome, Número, Escudo, Logos) posicionados conforme as zonas da `uv_matrix`.
- **Three.js Simplificado:** O modelo 3D apenas aplicará a textura final gerada no `material.map`. Não haverá mais `emissiveMap` para overlays dinâmicos.

## 2. Etapas de Implementação

### Etapa 1: Reformulação do Editor de Zonas (`ZoneEditor.tsx`)
O editor deixará de ser focado no 3D e passará a ser um editor de gabarito 2D sobre a imagem de referência da UV Matrix.
- **Visualização:** Canvas 2D exibindo a `reference_url` (molhe UV) ao fundo.
- **Interação:** Ferramentas de "drag & drop" e "resize" diretamente sobre o mapa 2D.
- **Persistência:** Coordenadas salvas em pixels (ex: x: 820, y: 420) no campo `zones` (JSONB).

### Etapa 2: Motor de Geração de Textura (`src/lib/textureGenerator.ts`)
Criação de um utilitário robusto para compor a imagem final.
- **Entrada:** Estampa Base, Dados do Usuário (Nome, Número, etc.), Zonas da UV Matrix.
- **Processamento:**
    - Carrega a estampa base no Canvas.
    - Itera sobre as zonas e desenha o conteúdo correspondente.
- **Saída:** URL de dados (Base64) ou `CanvasTexture`.

### Etapa 3: Simplificação do Visualizador (`ThreeDViewer.tsx`)
- Remoção completa do sistema de `drawOnCanvas` interno que usava `emissiveMap`.
- O componente passará a receber apenas `finalTextureUrl`.
- Aplicação direta: `mesh.material.map = finalTexture`.

### Etapa 4: Ajustes no Simulador (`Simulator.tsx`)
- Integração com o novo `textureGenerator`.
- Garantia de que ao trocar a estampa (`pattern`), o sistema busque a `uv_matrix` vinculada e regenere a textura final.

## 3. Detalhes Técnicos (Para Desenvolvedores)

### Estrutura do Objeto Zona (JSONB)
```json
{
  "id": "escudo_peito",
  "name": "ESCUDO PEITO",
  "type": "logo",
  "x": 820,
  "y": 420,
  "width": 240,
  "height": 180,
  "rotation": 0
}
```

### Alterações no Banco de Dados
Nenhuma alteração de schema é estritamente necessária, pois os campos `uv_matrices.zones` e `uv_matrices.reference_url` já existem. A migração é puramente de **lógica de aplicação**.

## 4. Cronograma de Execução

1. **Sprint 1:** Refatoração do `ZoneEditor` para interface 2D (Gabarito).
2. **Sprint 2:** Implementação do `textureGenerator` e testes de composição de imagem.
3. **Sprint 3:** Limpeza do `ThreeDViewer` e integração final no `Simulator`.
