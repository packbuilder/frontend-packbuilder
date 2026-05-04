import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendVerificationEmail } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { MailSearch } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/profile/verify-email')({
  loader: async ({context}) => {
    const {user} = context;

    if(!user || user.emailVerified) {
      throw redirect({to: "/"})
    }

    const status = await sendVerificationEmail(user.email); 
    const breadcrumbs = [{text: "Profile"}, {text: "verify-email"}];

    return {curUser: user, status, breadcrumbs}
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {curUser} = Route.useLoaderData();
  const [cooldown, setCooldown] = useState(0);

  const mutation = useMutation({
    mutationFn: async () => {
      const status = await sendVerificationEmail(curUser.email);

      if (!status || status < 200 || status > 200) {
        throw new Error("Unable to send verification email.");
      }
    },
    onSuccess: () => {
      setCooldown(60);
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  useEffect(() => {
    if (cooldown === 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  return <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
    <Card>
      <CardHeader className='flex flex-col items-center justify-center'>
        <MailSearch className="size-10" />
        <CardTitle>Verify your email</CardTitle>
        <CardDescription className='text-center'>
          An email containing a link for verification has been sent to <span className='font-bold underline text-white-200'>{curUser.email}</span>. Links are valid for 24 hours after being sent and requesting the email to be resent will invalidate any old links.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-col text-center gap-2">
        <CardTitle>Didn't recieve the verification email?</CardTitle>
        <CardDescription>Be sure to check your spam folder before requesting another one to be sent!</CardDescription>
            <Button
              variant={`${cooldown > 0 || mutation.isPending ? "disabled" : "default"}`}
              onClick={() => mutation.mutate()}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : mutation.isPending
                ? "Sending..."
                : "Resend email"}
            </Button>
      </CardContent>
    </Card>
  </section>
}
