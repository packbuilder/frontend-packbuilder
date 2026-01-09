import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import pfp from "@/Seed-Avatar.jpg"
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import Cookies from "js-cookie";
import { updateProfileDtoSchema } from "@/types/dtos/updateProfileDto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState, type FormEvent } from "react";
import { updateProfile } from '@/lib/api';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { appQueries } from '@/hooks/appQueries';
import type { Modpack } from '@/types/modpack';
import {ModpackCardCompact} from '@/components/modpack-card';
import type { User } from '@/types/user';
import type { Suggestion } from '@/types/suggestion';
import SuggestionCard from '@/components/suggestion-card';

export const Route = createFileRoute('/profile/$username/')({
  loader: async ({context, params}) => {
    const {user: curUser, queryClient} = context;
    const {username} = params;
    const userData = await queryClient.ensureQueryData(appQueries.userData(username));
    
    if(!userData) {
      throw redirect({to:"/"});
    }

    const userModpacks = await queryClient.ensureQueryData(appQueries.userModpacks(userData));
    const userSuggestions = await queryClient.ensureQueryData(appQueries.userSuggestions(userData));

    return {curUser, userData, userModpacks, userSuggestions, queryClient}
  },
  component: ProfileView,
});

function ProfileEdit() {
  const {curUser} = Route.useLoaderData();
  const [hideForm, setHideForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate({from: "/"});
  const router = useRouter();
  const formRef = useRef(null);

    const handleLogout = async () => {
      Cookies.remove("_packbuilder_jwt");
      await router.invalidate();
      navigate({to: "/login", reloadDocument: true});
    }

    const submitForm = () => {
      const form = formRef.current as unknown as HTMLFormElement;
      form.requestSubmit();
    }

    const mutation = useMutation({
      mutationFn: async (formData: FormData) => {
        const newName = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if(password.length > 0 && password !== confirmPassword) {
          throw new Error("New password and confirm password do not match.");
        }

        if(password.length > 0 && password.length < 7) {
          throw new Error("Your new password must be at least 7 characters long.");
        }

        const updateUserDto = updateProfileDtoSchema.parse({ name: newName, email, password: password.length > 0 ? password : null });
        const updatedProfile = await updateProfile(curUser!.name, updateUserDto);

        if(!updatedProfile) {
          throw new Error("There was a problem with updating your profile information, please try again.")
        }
      },
      onSuccess: async () => await handleLogout(),
      onError: (error) => {
        setErrorMessage(error.message);
        console.error(error)
      }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }

    // TODO: Maybe display total number of modpacks or something else to fill the void
    return <section className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center mb-4">
            <img className="rounded-full w-40 border-white border-2" alt={curUser!.avatar} src={pfp} />
            <div className={`flex flex-col items-center justify-center ${hideForm ? "" : "hidden"}`}>
                <h1 className="font-bold text-2xl m-2">{curUser!.name}'s profile</h1>
            </div>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className={`${hideForm ? "hidden" : ""} mb-4`} id={"profile-edit"} method="post">
            <div className="flex flex-col justify-center items-center gap-4">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-2xl self-center">Edit Profile</h1>
                    <p className="w-3/4 text-center">Editing your profile details will log you out.</p>
                </div>
                <div>
                    <Label className="self-start"><h1 className="font-bold text-lg">Name</h1></Label>
                    <Input 
                        className="w-full"
                        style={{background: "white", color: "black"}} 
                        placeholder="New username..." 
                        defaultValue={curUser!.name}
                        id={"username"}
                        name={"username"}
                    />
                </div>
                <div>

                    <Label className="self-start"><h1 className="font-bold text-lg">Email</h1></Label>
                    <Input 
                        type="email"
                        className="w-full"
                        style={{background: "white", color: "black"}} 
                        placeholder="New email..."
                        defaultValue={curUser!.email}
                        id={"email"}
                        name={"email"}
                    />
                </div>
                <div className="flex flex-col items-center justify-center gap-4">
                    <div>

                        <Label className="self-start"><h1 className="font-bold text-lg">New password</h1></Label>
                        <Input 
                            type="password"
                            className="w-full"
                            style={{background: "white", color: "black"}} 
                            placeholder="New password..."
                            id={"password"}
                            name={"password"}
                        />
                    </div>
                    <div>
                        <Label className="self-start"><h1 className="font-bold text-lg">Confirm new password</h1></Label>
                        <Input 
                            type="password"
                            className="w-full"
                            style={{background: "white", color: "black"}} 
                            placeholder="Confirm new password..." 
                            id={"confirmPassword"}
                            name={"confirmPassword"}
                        />
                    </div>
                </div>
            </div>
        </form>
        <div className={`bg-red-400 max-w-3/4 p-2 rounded-md flex items-cetner justify-center mb-4 ${hideForm ? "hidden" : ""}`}>
          <h1 className='text-center font-bold'>Error: {errorMessage}</h1>
        </div>
        <div className="flex items-center justify-center gap-2">
            <Button type="submit" variant={"default"} className={`${hideForm ? "hidden" : ""}`} onClick={() => submitForm()}>Save changes<Edit /></Button>
            <Button variant={"destructive"} className={`${hideForm ? "hidden" : ""}`} onClick={() => setHideForm(true)}>Cancel<X/></Button>
            <Button variant={"default"} className={`${hideForm ? "" : "hidden"} w-full`} onClick={() => setHideForm(false)}>Edit Profile<Edit/></Button>
        </div>
    </section>
}

function UserModpacksDisplay({userModpacks, user} : {userModpacks: Modpack[] | null, user: User}) {

  if(!userModpacks) {
    return (
      <div>
        <h1>This user has not created any modpacks</h1>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className="font-bold text-2xl m-2">{user.name}'s modpacks</h1>
      <div className='flex flex-wrap items-center justify-center'>
        {userModpacks.map((modpack, index) => {
          return (
            <ModpackCardCompact modpack={modpack} key={index} />
          )
        })}
      </div>
    </div>
  )

}

function UserSuggestionsDisplay({userSuggestions, user} : {userSuggestions: Suggestion[] | null, user: User}) {

  if(!userSuggestions) {
    return (
      <div>
        This user has not created any suggestions.
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center flex-col w-full'>
      <h1 className="font-bold text-2xl m-2">{user.name}'s suggestions</h1>
      <div className='flex items-center justify-center flex-wrap'>
        {userSuggestions.map((suggestion, index) => {
          return (
            <SuggestionCard suggestion={suggestion} key={index} />
          )
        })}
      </div>
    </div>
  )
}

export default function ProfileView() {
  const {curUser} = Route.useLoaderData();
  const {username} = Route.useParams();
  const {data: user} = useSuspenseQuery(appQueries.userData(username));
  const {data: userModpacks} = useSuspenseQuery(appQueries.userModpacks(user));
  const {data: userSuggestions} = useSuspenseQuery(appQueries.userSuggestions(user));

  if(!user) {
    return (
      <div>
        <h1>This profile does not exist.</h1>
      </div>
    )
  }


  return (
    <section className='flex flex-wrap gap-4 items-center justify-center'>
      <div className='flex items-center justify-end'>
        {curUser?.id === user.id ? <ProfileEdit />
          :
          <div className="flex flex-col justify-center items-center mb-4">
            <img className="rounded-full w-40 border-white border-2" alt={curUser!.avatar} src={pfp} />
            <div className={`flex flex-col items-center justify-center`}>
                <h1 className="font-bold text-2xl m-2">{curUser!.name}'s profile</h1>
            </div>
          </div>
        }
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <UserSuggestionsDisplay userSuggestions={userSuggestions} user={user} />
        <UserModpacksDisplay userModpacks={userModpacks} user={user} />
      </div>
      
    </section>
  );
}