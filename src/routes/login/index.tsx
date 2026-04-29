import BreadCrumbLink from '@/components/breadcrumb-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api';
import store from '@/store/store';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie';
import { useState, type FormEvent } from 'react';

export const Route = createFileRoute('/login/')({
  component: Login,
  beforeLoad: ({context}) => {
    if(context.user) {
      throw redirect({to:"/"})
    }
  }
});

function Login() {
  const [formError, setFormError] = useState("");
  const {removeBreadCrumb} = store();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const token = await login(email, password);
    
      if (!token) {
        throw new Error("Problem logging in, check for correct email and password.")
      }
    
      return token;
    },
    onSuccess: (token: string) => {
      Cookies.set("_packbuilder_jwt", token, {
        secure: true,
        expires: 7
      });
      
      removeBreadCrumb("Login")
      navigate({to:"/"});
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as unknown as HTMLFormElement;
    const formData = new FormData(form);

    mutation.mutate(formData);
  }

  return (
    <section className="flex flex-col items-center justify-center p-2 w-full min-md:max-w-3/4 min-md:min-w-2/4">
      <Card className='max-w-9/10 w-full min-md:max-w-3/5'>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='' method='POST' id="login" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name='email'
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <BreadCrumbLink
                    link='/login/forgot-password'
                    text='Forgot Password'
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </BreadCrumbLink>
                </div>
                <Input id="password" name='password' type="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <Button variant="disabled" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <BreadCrumbLink link="/login/create-account" text='Sign up'>Sign up</BreadCrumbLink>
                </FieldDescription>
              </Field>
              <FieldError>
                {formError}
              </FieldError>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
