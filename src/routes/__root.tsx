import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
