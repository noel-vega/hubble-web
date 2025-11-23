import { createFileRoute, redirect } from '@tanstack/react-router'
import { fetchMe } from './login'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchContainers } from '@/features/containers/api/fetch-containers'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    try {
      const auth = await context.queryClient.ensureQueryData({
        queryKey: ['auth', 'me'],
        queryFn: fetchMe
      })
      if (!auth.authenticated) {
        throw redirect({ to: "/login" })
      }

      const queryOptions = {
        queryKey: ["containers"],
        queryFn: fetchContainers,
      }
      await context.queryClient.ensureQueryData(queryOptions)
      return { auth, queryOptions }
    } catch {
      throw redirect({ to: "/login" })
    }

  },
  component: RouteComponent,
})

function RouteComponent() {
  const { queryOptions } = Route.useRouteContext()
  const query = useSuspenseQuery(queryOptions)

  return <ul>{query.data.containers.map(c => <li key={c.id}>{c.name}</li>)}</ul>
}
