import { createFileRoute } from '@tanstack/react-router'
import { SimulatorContainer } from '../components/simulator/SimulatorContainer'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <SimulatorContainer />
}
