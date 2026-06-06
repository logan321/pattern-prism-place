Desenvolveremos o simulador 3D para o Macro Master focado na flexibilidade de estampas via UV Map.

### Estrutura do Projeto
1. **Visualizador 3D (R3F):** Componente principal usando React Three Fiber para renderizar o modelo da camisa (exportado do CLO3D).
2. **Sistema de Materiais:** Uso de texturas dinâmicas. O UV Map da estampa será aplicado como um `Decal` ou substituindo o `map` principal do material, dependendo da complexidade do modelo.
3. **Painel de Customização:** 
    - Seletor de Modelo (baseado nas imagens PNG da frente).
    - Grade de Estampas (miniaturas).
    - Editor de Cores (usando as texturas de máscara UV para colorir partes específicas).
    - Upload de Logotipos (posicionamento via Decals).

### Detalhes Técnicos
- **Modelos 3D:** Devem ser exportados do CLO3D em formato `.glb` com UVs bem definidos.
- **Mapeamento de Estampas:** Cada estampa terá uma miniatura (PNG/JPG) e um arquivo de textura correspondente (UV Map) que se encaixa perfeitamente no modelo 3D.
- **Performance:** Carregamento progressivo das texturas e uso de `compressed textures` (Basis/KTX2) se necessário para mobile.

### Próximos Passos
1. Implementar a estrutura básica do layout (Header, Canvas 3D lateral, Menu de opções).
2. Adicionar o primeiro modelo 3D de camisa (usaremos um modelo genérico de alta qualidade para começar, ou um placeholder se você ainda não tiver o do CLO3D).
3. Criar o fluxo de troca de estampas baseado no mapeamento UV solicitado.

Deseja que eu comece pela interface do editor ou pela integração do primeiro modelo 3D?
