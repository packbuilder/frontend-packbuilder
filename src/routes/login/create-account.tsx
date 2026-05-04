import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createAccount, sendVerificationEmail } from '@/lib/api'
import { createUserDtoSchema } from '@/types/dtos/createProfileDto'
import { PopoverArrow } from '@radix-ui/react-popover'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MailSearch } from 'lucide-react'
import { useEffect, useState, type FormEvent} from 'react'

export const Route = createFileRoute('/login/create-account')({
  component: RouteComponent,
  loader: () => {
    const breadcrumbs = [{text: "Login"}, {text: "Create Account"}];
    return {breadcrumbs}
  },
})

function CreateAccountForm({ handleSubmit, ...props}: {handleSubmit: (event: FormEvent<HTMLFormElement>) => void} & React.ComponentProps<typeof Card>) {

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method='POST' id='CreateAccount' onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Display name</FieldLabel>
              <Input id="name" name='username' type="text" placeholder="Your username..." required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name='email'
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                Your email will be used to contact you for changing your account details and for verification.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name='password' type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" name='confirmPassword' type="password" required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="disabled" type="button" disabled>
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

// TODO: Add frontend timer to button.
function VerifyEmailCard({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const mutation = useMutation({
    mutationFn: async () => {
      const status = await sendVerificationEmail(email);

      console.log(status)

      if (!status || status < 200 || status > 200) {
        throw new Error("Unable to send verification email.");
      }
    },
    onSuccess: () => {
      setOpen(true);
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

  return (
    <Card>
      <CardHeader>
        <MailSearch className="size-10" />
        <CardTitle>Verify your email!</CardTitle>
        <CardDescription>
          An email has been sent to the email you signed up with containing
          instructions for verifying your email.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-center flex-col">
        <h2>Didn't recieve the verification email?</h2>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="w-auto px-3 py-1.5 text-sm pointer-events-none bg-white text-black shadow-md border"
          >
            Email sent!
            <PopoverArrow className="fill-white" />
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const [displayEmailVerification, setDisplayEmailVerification] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if(password !== confirmPassword) {
        throw new Error("Your password does not match your confirm password.")
      }

      const createUserDto = createUserDtoSchema.parse({name: username, email, password})

      const response = await createAccount(createUserDto);

      if(!response || response.status < 200 || response.status > 200) {
        throw new Error("Problem with creating account");
      }

      return email;
    },
    onSuccess: async (email: string) => {
      // TODO: On success get rid of form and pop up modal that shows user email verification info type beat
      setDisplayEmailVerification(true);
      setEmail(email);
    },
    onError: async (error: Error) => {
      // TODO: Display errors properly. Perhaps make error component to catch errors?
      console.error(error.message);
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutation.mutate(formData);
  }

  return <section className='w-full flex items-center justify-center mb-4'>
    {!displayEmailVerification && <CreateAccountForm className='max-w-9/10 w-full min-md:max-w-3/5' handleSubmit={handleSubmit} />}
    {displayEmailVerification && email && <VerifyEmailCard email={email} />}
  </section>
}
