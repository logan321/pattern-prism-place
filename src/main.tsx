import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { createRouter } from './router'

// In TanStack Start, we don't usually need to pass the router to StartClient
// but we might need to initialize it or something if we use custom router logic.
// However, the standard way is just <StartClient />.
// The router is automatically loaded from the #tanstack-router-entry virtual module.

hydrateRoot(document.getElementById('root')!, <StartClient />)
