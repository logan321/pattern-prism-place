import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      fontSize: '2rem',
      fontWeight: 'bold',
      fontFamily: 'sans-serif'
    }}>
      funcionando
    </div>
  )
}
