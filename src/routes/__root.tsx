import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import { getUserToken } from '@/lib/api'
import { parseUserToken } from '@/lib/utils'
import { userSchema, type User } from '@/types/user'
import { SignalRProvider } from '@/components/signalr/signalr-provider'

interface MyRouterContext {
  queryClient: QueryClient,
  user: User | null
}

const queryClient = new QueryClient();

function RootLayout() {
  const { user } = Route.useRouteContext();

  return (
    <>
    <SignalRProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="website-theme">
          <main className="min-h-dvh size-full bg-background flex flex-col items-center justify-start">
            <Header user={user} />
            <Outlet />
          </main>
        </ThemeProvider>
      </QueryClientProvider>
    </SignalRProvider>
    </>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  const {user} = Route.useRouteContext();
  return (
    <SignalRProvider>
      <ThemeProvider defaultTheme="dark" storageKey="website-theme">
        <main className="min-h-dvh size-full bg-background">
          <Header user={user} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl text-center text-bold">
              There was an error rendering this page :(
            </h1>
            <h2 className="text-2xl text-center text-bold">{error.message}</h2>
          </div>
        </main>
      </ThemeProvider>
    </SignalRProvider>
  );
}

function NotFoundComponent() {
  const {user} = Route.useRouteContext();
  return (
    <SignalRProvider>
      <ThemeProvider defaultTheme="dark" storageKey="website-theme">
        <main className="min-h-dvh size-full bg-background">
          <Header user={user} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl text-center text-bold">
              This page does not exist :(
            </h1>
            <h2 className="text-2xl text-center text-bold">Maybe try searching a little harder?</h2>
          </div>
        </main>
      </ThemeProvider>
    </SignalRProvider>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const token = getUserToken();

    if(!token) {
      return;
    }

    try {
      const user = userSchema.parse(parseUserToken(token));
      
      console.log(user);
      
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
