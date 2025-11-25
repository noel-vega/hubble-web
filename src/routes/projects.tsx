import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects')({
  beforeLoad: async () => { },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/projects"!</div>
}
