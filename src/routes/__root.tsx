import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import { getUserToken } from '@/lib/api'
import { parseUserToken } from '@/lib/utils'
import type { User } from '@/types/user'

interface MyRouterContext {
  queryClient: QueryClient,
  user: User | null
}

const queryClient = new QueryClient();

function RootLayout() {
  const { user } = Route.useRouteContext();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="website-theme">
          <main className="container mx-auto min-h-dvh w-full size-full bg-gradient-to-r from-sky-500 to-emerald-500">
            <Header user={user} />
            <Outlet />
          </main>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  const {user} = Route.useRouteContext();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="website-theme">
      <main className="container mx-auto min-h-dvh w-full size-full bg-gradient-to-r from-sky-500 to-emerald-500">
        <Header user={user} />
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl text-center text-bold">
            There was an error rendering this page :(
          </h1>
          <h2 className="text-2xl text-center text-bold">{error.message}</h2>
        </div>
      </main>
    </ThemeProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl text-center text-bold">
        This page does not exist :(
      </h1>
      <h2 className="text-2xl text-center text-bold">Maybe try searching a little harder?</h2>
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const token = getUserToken();

    if(!token) {
      return;
    }

    try {
      const user = parseUserToken(token) as User;
      
      if(!user) {
        return;
      }
      
      return { user };
    } catch (error) {
      console.log(error);
    }
  },
  component: RootLayout,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent
})
