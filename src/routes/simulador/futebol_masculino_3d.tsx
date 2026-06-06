import { createFileRoute } from "@tanstack/react-router";
import SimulatorPage from "@/pages/simulator/SimulatorPage";

export const Route = createFileRoute("/simulador/futebol_masculino_3d")({
  component: SimulatorPage,
});
