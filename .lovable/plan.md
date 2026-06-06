text
1. Infrastructure & Dependencies
   - Install Three.js, React Three Fiber/Drei, Zustand, Lucide React, and Tailwind utilities.
   - Define project folder structure: `src/components/simulator`, `src/store`, `src/types`, `src/hooks`, `src/lib/supabase`.

2. Database Schema (Supabase)
   - Create migration for core tables: `lojistas`, `usuarios`, `categorias`, `modelos`, `fontes`, `tipos_gola`, `tipos_manga`, `tipos_punho`, `simulacoes`, `orcamentos`, `uploads_imagem`.
   - Configure RLS policies for user-owned data and public leads.
   - Set up triggers for `updated_at` columns.

3. State Management (Zustand)
   - Create `useUniformStore` to manage:
     - Uniform configuration (colors, finishes, names, numbers, logos).
     - UI state (active tab, active piece, modal visibility).
     - Auth status and user profile data.

4. 3D Scene Architecture
   - Set up `Scene3D` component with `Canvas`, `OrbitControls`, `Stage`, and environment lighting.
   - Create a `UniformModel` component that renders a placeholder box (eventually replacing with GLB).
   - Implement dynamic texture/material updates based on store state.

5. Layout & UI Components
   - Implement `MainLayout` with fixed Header/Footer and split-screen responsive layout.
   - Build the `ConfigPanel` with 6 tabs: Modelo, Cores, Acabamentos, Nome/Número, Escudo/Patrocínio, Upload.
   - Create reusable UI components: `ColorPicker`, `TabButton`, `ThumbnailCard`, `Modal`.

6. Features & Integrations
   - Authentication flows (Login, Signup, Password Recovery).
   - "Enviar Orçamento" functionality with WhatsApp link generation.
   - Image upload system to Supabase Storage.
   - Cookie banner and Facebook Pixel integration.

Technical Details:
- Three.js: Use `useGLTF` for model loading and `Decal` or `CanvasTexture` for dynamic placement of numbers/logos.
- Styling: Tailwind CSS for all UI elements, ensuring mobile-first responsiveness.
- Performance: Memoize Three.js components and use `Suspense` for asset loading.
