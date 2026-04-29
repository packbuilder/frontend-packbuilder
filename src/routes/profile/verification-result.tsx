import BreadCrumbLink from '@/components/breadcrumb-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { MailCheck, MailX } from 'lucide-react';
import { useEffect } from 'react';
import z from 'zod';

const searchParamsSchema = z.object({
  status: fallback(z.string(), "").default(''),
})

export const Route = createFileRoute('/profile/verification-result')({
  validateSearch: zodValidator(searchParamsSchema),
  loaderDeps: ({search: { status }}) => ({
      status
  }),
  loader: async ({context, deps: {status}}) => {
    const {user, queryClient} = context;

    if(!status || !user) {
      throw redirect({to: "/"});
    }

    return {user, queryClient};
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {status} = Route.useSearch({
      select: (search) => ({
          status: search.status,
      })
  });
  const router = useRouter();

  useEffect(() => {
    if(status === "success") {
      router.invalidate();
    }
  }, [status]);

  return <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
    <Card className='min-w-1/2 w-fit'>
      <CardHeader className='flex flex-col items-center justify-center'>
        {
          status === "success" ? <MailCheck className='size-10' /> : <MailX className='size-10' /> 
        }
        <CardTitle className='text-center'>{status === "success" ? "Your email was successfully verified!" : "There was a problem with verifying your email."}</CardTitle>
        <CardDescription className='text-center'>
          {
            status === "success" ? "You may return to the homepage." : "The link you used was either invalid or expired. Request a new link here."
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-col text-center gap-2">
        {
            status === "success" ? 
              <BreadCrumbLink link='/' text='Home'>
                <Button variant='default'>
                  <span>Home</span>
                </Button>
              </BreadCrumbLink>
             :
              <BreadCrumbLink link='/profile/verify-email' text='Verify Email'>
                <Button variant={"default"}>
                  <span>Request new verification email</span>
                </Button>
              </BreadCrumbLink>
        }
      </CardContent>
    </Card>
  </section>
}
