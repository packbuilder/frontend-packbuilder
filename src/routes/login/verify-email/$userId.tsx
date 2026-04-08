
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { MailSearch } from 'lucide-react'

export const Route = createFileRoute('/login/verify-email/$userId')({
  loader: async ({context, params}) => {
    const {user} = context;
    const {userId} = params

    if(user) {
      throw redirect({to: "/"})
    }

    return userId
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {userId} = Route.useLoaderData();

  return <Card>
      <CardHeader>
        <MailSearch className='size-10'/>
        <CardTitle>Verify your email!</CardTitle>
        <CardDescription>
          An email has been sent to the email you signed up with containing instructions for verifying your email.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex items-center justify-center flex-col'>
        <h2>Didn't recieve the verification email?</h2>
        <Button variant='default'>
          Resend email
        </Button>
      </CardContent>
    </Card>
}
