import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { sendPasswordResetEmail } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { MailSearch } from 'lucide-react';
import { useState, useEffect, type FormEvent } from 'react';

export const Route = createFileRoute('/login/forgot-password')({
  component: RouteComponent,
  loader: () => {
    const breadcrumbs = [{text: "Login", link: "/login"}, {text: "Forgot Password"}];
    return {breadcrumbs}
  }
})

function RouteComponent() {
  const [cooldown, setCooldown] = useState(0);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = formData.get("email") as string;
      const status = await sendPasswordResetEmail(email);

      if (!status || status < 200 || status > 299) {
        throw new Error("Unable to send verification email.");
      }
    },
    onSuccess: () => {
      setCooldown(30);
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as unknown as HTMLFormElement
    const formData = new FormData(form);
    mutation.mutate(formData);
  }

  useEffect(() => {
    if (cooldown === 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  return <section className="flex flex-col items-center w-9/10 justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
      <Card className='max-w-9/10 w-full min-md:max-w-3/5'>
      <CardHeader className='flex flex-col items-center justify-center'>
        <MailSearch className="size-10" />
        <CardTitle>Requesting a password reset</CardTitle>
        <CardDescription className='text-center'>
          Enter the email associated with your account. If an account with that email exists, you will recieve an email that will contain a link to reset your password that will only be valid for 15 minutes.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-col text-center gap-2">
            <form className='w-full flex items-start justify-center flex-col gap-2' method='POST' id='ResetPassword' onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name='email' type="email" required />
                </Field>
              </FieldGroup>
              <Button
                variant={`${cooldown > 0 || mutation.isPending ? "disabled" : "default"}`}
                type='submit'
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : mutation.isPending
                  ? "Sending..."
                  : "Send email"}
              </Button>
            </form>
      </CardContent>
    </Card>
  </section>
}
