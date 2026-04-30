import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { MailSearch } from 'lucide-react'
import { useState, type FormEvent } from 'react'
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
  loader: async ({deps: {token, userId}}) => {
    if(token === "" || userId === -1) {
      throw redirect({to: "/"});
    }

    const breadcrumbs = ["Profile", "reset-password"];

    return {breadcrumbs};
  },
  component: RouteComponent,
})

function SuccessCard() {
  return (
    <Card className='items-center max-w-9/10 w-full min-md:max-w-3/5'>
      <CardHeader className='w-full text-center'>Password changed</CardHeader>
      <CardDescription className='text-center w-8/10'>
        You have successfully changed your password! You can now login using your new password
      </CardDescription>
      <CardContent className='flex items-center justify-center'>
        <Link to='/login'>
          <Button variant={"default"}>
            Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const {token, userId} = Route.useSearch({
      select: (search) => ({
          token: search.token,
          userId: search.userId,
      })
  });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const newPassword = formData.get("newPassword") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if(newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const status = await resetPassword(userId, newPassword, token);

      if (!status || status < 200 || status > 200) {
        throw new Error("Unable to reset password");
      }
    },
    onSuccess: () => {
      setSuccess(true);
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

  return <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
    {!success && <Card className='max-w-9/10 w-full min-md:max-w-3/5'>
      <CardHeader className='flex flex-col items-center justify-center'>
        <MailSearch className="size-10" />
        <CardTitle>Reset your password</CardTitle>
        <CardDescription className='text-center'>
          Create a new password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-col text-center gap-2">
        <form className='w-full flex items-start justify-center gap-2 flex-col' method='POST' id='ResetPassword' onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input id="password" name='newPassword' type="password" required />
              <h3 className='text-sm text-left'>
                Must be at least 8 characters long.
              </h3>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" name='confirmPassword' type="password" required />
              <h3 className='text-sm text-left'>Please confirm your password.</h3>
            </Field>
          </FieldGroup>
          <Button variant={"default"} type='submit'>
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>}

    {success && <SuccessCard />}
  </section>
}
