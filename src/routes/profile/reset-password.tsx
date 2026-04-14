import { createFileRoute } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import z from 'zod'

// TODO: Finish this page by creating functionality and redirecting user if params are the default fallback values

const searchParamsSchema = z.object({
  token: fallback(z.string(), "").default(''),
  userId: fallback(z.number(), -1).default(-1)
})

export const Route = createFileRoute('/profile/reset-password')({
  validateSearch: zodValidator(searchParamsSchema),
  loaderDeps: ({search: {token, userId }}) => ({
      token,
      userId,
  }),
  loader: async () => {

  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profile/reset-password"!</div>
}
