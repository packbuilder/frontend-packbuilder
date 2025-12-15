import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: App,
})

function App() {
  return (
    <div>This is the login page</div>
  )
}
