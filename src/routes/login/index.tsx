import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/api';
import store from '@/store/store';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie';
import { LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export const Route = createFileRoute('/login/')({
  component: Login,
  beforeLoad: ({context}) => {
    if(context.user) {
      throw redirect({to:"/"})
    }
  }
});

// TODO: Restyle login form and add functionality for user to reset password if they forgot it

function Login() {
  const [formError, setFormError] = useState("");
  const {removeBreadCrumb} = store();
  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
  
    const token = await login(email, password);
  
    if (!token) {
      setFormError("Problem logging in, check for correct email and password.")
      return;
    }
  
    Cookies.set("_packbuilder_jwt", token, {
      secure: true,
      expires: 7
    });
    
    removeBreadCrumb("Login")
    navigate({to:"/"});
  }

  return (
    <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
      <form method="post" id="login" onSubmit={(event: FormEvent<HTMLFormElement>) => handleLogin(event)}>
          <div>{formError}</div>
          <div className="flex flex-col justify-center items-center gap-2">
              <Label className=""><h1>Email</h1></Label>
              <Input id={"email"} type="email" name={"email"} placeholder="Your message..." required />

              <Label className=""><h1>Password</h1></Label>
              <Input
              id={"password"} type="password" name={"password"} placeholder="Your message..."/>
              <Button variant={"default"} type="submit">Login <LogIn/></Button>
          </div>
      </form>
      <Button variant={"default"}>
        <p>Forgot password?</p>
      </Button>
    </section>
  )
}
