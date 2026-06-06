import { createRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { createRouter } from './router'

const router = createRouter()

createRoot(document.getElementById('root')!).render(<StartClient router={router} />)
