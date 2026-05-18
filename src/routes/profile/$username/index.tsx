import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { Edit, Link, Save, X } from "lucide-react";
import Cookies from "js-cookie";
import { updateProfileDtoSchema } from "@/types/dtos/updateProfileDto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { changeEmail, updateProfile } from '@/lib/api';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { appQueries } from '@/hooks/appQueries';
import { SuggestionDisplay } from '@/components/suggestion/suggestion-display';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ModpackDisplay from '@/components/modpack/modpack-display';
import DisplayContainer from '@/components/display-container';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';
import { ImageType, SuggestionFilter, SuggestionState } from '@/types/enums';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import ClearableCommandInput from "@/components/clearable-command-input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeEmailDtoSchema } from '@/types/dtos/changeEmailDto';
import SelectAvatarDialog from '@/components/SelectAvatarDialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';

const dataDisplaySchema = z.object({
    display: fallback(z.enum(["modpacks", "suggestions"]), "modpacks").default("modpacks"),
});

export const Route = createFileRoute('/profile/$username/')({
  validateSearch: zodValidator(dataDisplaySchema),
    loaderDeps: ({search: {display}}) => ({
        display
    }),
  loader: async ({context, params}) => {
    const {user: curUser, queryClient} = context;
    const {username} = params;
    const userData = await queryClient.ensureQueryData(appQueries.userData(username));
    
    if(!userData) {
      throw redirect({to:"/"});
    }

    const userModpacks = await queryClient.ensureQueryData(appQueries.userModpacks(userData));
    const userSuggestions = await queryClient.ensureQueryData(appQueries.userSuggestions(userData));
    const breadcrumbs = [{text: `${userData.name}'s profile`}];

    return {curUser, userData, userModpacks, userSuggestions, queryClient, breadcrumbs}
  },
  component: ProfileView,
});

function EditProfileDialog() {
  const {curUser} = Route.useLoaderData();
  const {username} = Route.useParams();
  const [isOpen, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(curUser?.imageValue || "profile_avatar_1.jpg");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

    const submitForm = () => {
      const form = formRef.current as unknown as HTMLFormElement;
      form.requestSubmit();
    }

    const mutation = useMutation({
      mutationFn: async (formData: FormData) => {
        const newName = formData.get("username") as string;
        const imageValue = formData.get("imageValue") as string;
        const imageType = ImageType.Stock;

        const updateUserDto = updateProfileDtoSchema.parse({name:newName, imageType, imageValue});

        const status = await updateProfile(curUser!.id, updateUserDto);

        if(!status || status < 200 || status > 200) {
          throw new Error("There was a problem with updating your profile information, please try again.")
        }

        return newName
      },
      onSuccess: async (newName: string) => {
        console.log("Successfully updated user profile");
        queryClient.invalidateQueries({queryKey: appQueries.userData(username).queryKey, refetchType: "all"});
        navigate({to: "/profile/$username", params: {username: newName}, replace: true});
    },
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

    return <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"}>
                Edit profile <Edit />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle>
                    Update your profile
                </DialogTitle>
                <DialogDescription>
                    Change your profile picture and username!
                </DialogDescription>
            </DialogHeader>
              <form ref={formRef} onSubmit={handleSubmit} className='w-full flex flex-col items-start justify-center gap-2 mb-4' id={"profile-edit"} method="post">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor='avatar' className='text-lg font-bold'>Change profile picture</FieldLabel>
                        <div className='flex items-center justify-start gap-2'>
                            <div className='size-fit'>
                            <Avatar className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]">
                                <AvatarImage src={`/profileAvatars/${avatar}`} alt="Profile Picture" />
                                <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                            </div>
                            <Input id='avatar' name='imageValue' value={avatar} readOnly hidden/>
                            <SelectAvatarDialog curAvatar={avatar} setAvatar={setAvatar} avatarType={"profileAvatars"} />
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username" className='text-lg font-bold'>Change your username</FieldLabel>
                        <Input id="username" name='username' type="text" placeholder="Your username..." defaultValue={curUser?.name} required />
                    </Field>
                </FieldGroup>
                {errorMessage}
              </form>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                    <Button variant={"default"} onClick={submitForm} type="submit">Update Profile <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function ChangeEmailDialog() {
  const [isOpen, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const formRef = useRef(null);

    const handleLogout = async () => {
      Cookies.remove("_packbuilder_jwt");
      queryClient.invalidateQueries();
      await router.invalidate();
    }

    const submitForm = () => {
      const form = formRef.current as unknown as HTMLFormElement;
      form.requestSubmit();
    }

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newEmail = formData.get("newEmail") as string;
            const password = formData.get("password") as string;

            const changeEmailDto = changeEmailDtoSchema.parse({ newEmail, password });

            const status = await changeEmail(changeEmailDto);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was an error with updating your email.")
            }

            return newEmail
        },
        onSuccess: async (newEmail: string) => {
            await handleLogout();
            setErrorMessage(null);
            setSuccessMessage(`Your email has been updated, a new verification link has been sent to ${newEmail}. You have been logged out of packbuilder.`);
        },
        onError: (error) => {
            setSuccessMessage(null);
            setErrorMessage(error.message);
            console.error(error)
        }
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutation.mutate(formData);
    }

    return <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"}>
                Change email <Edit />
            </Button>   
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit">
            <DialogHeader className="w-full px-2">
                <DialogTitle>
                    Change your email
                </DialogTitle>
                <DialogDescription>
                    This action requires you to enter your password. Doing this will automatically log you out and un-verify your account. A new verification link will automatically be sent to your new email.
                </DialogDescription>
            </DialogHeader>
              <form ref={formRef} onSubmit={handleSubmit} className='w-full flex flex-col items-start justify-center gap-2 mb-4' id={"profile-edit"} method="post">
                  <div className="flex flex-col justify-center items-center gap-4 w-full">
                      <h2 className='text-red-500'>{errorMessage}</h2>
                      <h2 className='text-green-500'>{successMessage}</h2>
                      <div className='w-full'>
                          <Label className="self-start"><h2 className="font-bold text-lg">New Email</h2></Label>
                          <Input 
                              className="w-full"
                              placeholder="New email..." 
                              id={"newEmail"}
                              name={"newEmail"}
                          />
                      </div>
                      <div className="flex flex-col items-center justify-center gap-4 w-full">
                          <Label className="self-start"><h2 className="font-bold text-lg">Password</h2></Label>
                          <Input 
                              type="password"
                              className="w-full"
                              placeholder="Your password..."
                              id={"password"}
                              name={"password"}
                          />
                      </div>
                  </div>
              </form>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                    <Button variant={"default"} onClick={submitForm} type="submit">Change Email <Save/></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function SelectDisplayRadioGroup() {
    const navigate = useNavigate({from: Route.fullPath});
    const {display} = Route.useSearch({
        select: (search) => ({
            display: search.display
        })
    });

    const handleValueChange = (newValue: string) => {
        navigate({search: () => ({display: newValue}), resetScroll: false});
    }

    return (
        <RadioGroup
        defaultValue={display}
        onValueChange={handleValueChange}
        className="inline-flex rounded-full bg-muted p-1"
        >
            <label className="cursor-pointer">
                <RadioGroupItem value="modpacks" className="peer sr-only" />
                <div className={`px-4 py-1.5 text-sm rounded-full transition duration-200
                ${display === "modpacks" ? "bg-primary text-white" : ""}
                text-muted-foreground`}>
                Modpacks
                </div>
            </label>

            <label className="cursor-pointer">
                <RadioGroupItem value="suggestions" className="peer sr-only" />
                <div className={`px-4 py-1.5 text-sm rounded-full transition duration-200
                ${display === "suggestions" ? "bg-primary text-white" : ""}
                text-muted-foreground`}>
                Suggestions
                </div>
            </label>
        </RadioGroup>
  )
}

export default function ProfileView() {
    const {username} = Route.useParams();
    const {data: user} = useSuspenseQuery(appQueries.userData(username));
    const {data: userModpacks, isPending: pendingModpackData} = useSuspenseQuery(appQueries.userModpacks(user));
    const {data: userSuggestions, isPending: pendingSuggestionData} = useSuspenseQuery(appQueries.userSuggestions(user))
    const { curUser } = Route.useLoaderData();
    const {display} = Route.useSearch({
        select: (search) => ({
            display: search.display
        })
    });
  
    if(!user) {
        return (
            <div>
            <h1>This profile does not exist.</h1>
        </div>
        )
    }

    const [suggestionFilter, setSuggestionFilter] = useState<SuggestionFilter>(SuggestionFilter.All);

    // TODO: Properly style for mobile and desktop and update style to match other pages
  
    const filteredSuggestions = useMemo(() => {
        if (!userSuggestions) return [];

        switch (suggestionFilter) {
            case SuggestionFilter.Verified:
                return userSuggestions?.filter(
                    suggestion => suggestion.state === SuggestionState.Unverified
                );
            case SuggestionFilter.Unverified:
                return userSuggestions?.filter(
                    suggestion => suggestion.state === SuggestionState.Verified
                );
            default:
                return userSuggestions;
        }
    }, [userSuggestions, suggestionFilter]);
    
    const handleFilterChange = (newValue: SuggestionFilter) => {
        setSuggestionFilter(newValue);
    }
    
    return <section className="flex flex-col items-center justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
        <header className="flex flex-col justify-between items-center gap-3 min-md:flex-row min-md:gap-6">
            <div className="flex flex-col items-center justify-center gap-3 min-md:flex-row min-md:justify-between">
                <img className='size-40 border-white/30 border-1' src={user.imageType === ImageType.Stock ? `/profileAvatars/${user.imageValue}` : user.imageValue} alt={"user profile picture"} />
                <div className="flex flex-col min-md:items-start items-center justify-center gap-3">
                        <h1 className="font-bold line-clamp-1">{user.name}</h1>
                        {curUser?.id === user.id && <div className="flex items-center justify-center gap-2">
                            <EditProfileDialog />
                            <ChangeEmailDialog />
                        </div>}
                </div>
            </div>

        </header>

        <Separator className="my-4"/>
        
        <section className="flex items-center justify-center gap-4 flex-col w-19/20">
            <SelectDisplayRadioGroup />

            <Command className="flex flex-col justify-center items-center w-full h-fit gap-2 overflow-visible">
                <div className="flex items-center justify-center w-full gap-1">
                    <ClearableCommandInput  placeholder="Search..." />
                    <div className="flex max-md:flex-col items-center justify-center">
                        <div className="flex items-center max-md:flex-col justify-center gap-2 z-1">
                            <div className="flex items-center justify-center gap-2">
                                {
                                    display === "suggestions" ?
                                    <Select value={suggestionFilter} onValueChange={handleFilterChange}>
                                        <SelectTrigger>
                                            <span className="text-sm">Filter:</span>
                                            <SelectValue placeholder="Filter modifications..."/>
                                            <Separator orientation="vertical"  className="h-full" />
                                        </SelectTrigger> 
                                        <SelectContent>
                                            <SelectGroup>     
                                                <SelectLabel>Select filter</SelectLabel>
                                                <SelectItem className="cursor-pointer" value={"0"}>All</SelectItem>
                                                <SelectItem className="cursor-pointer" value={"1"}>Unverified</SelectItem>
                                                <SelectItem className="cursor-pointer" value={"2"}>Verified</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select> : ""
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <CommandList className="w-full max-h-fit">
                    <CommandEmpty className={display === "mods" && pendingModpackData || display === "suggestions" && pendingSuggestionData ? "hidden" : ""}>
                        <DisplayContainer className="flex items-center justify-center h-96">
                            <h2>It's looking empty in here...</h2>
                        </DisplayContainer>
                    </CommandEmpty>
                    {display === "modpacks" ? 
                        <CommandGroup className="w-full">
                            <DisplayContainer className={`${userModpacks && userModpacks.length === 0 ? "hidden" : ""}`}>
                                    {
                                        pendingModpackData ? (
                                            <div className="size-96 max-w-full flex items-center justify-center w-full">
                                                <Spinner className="size-20" />
                                            </div>
                                        )
                                        :
                                        userModpacks && userModpacks.map((modpack, index) => {
                                            return <CommandItem value={modpack.name} key={index} className="size-full p-0">
                                                <ModpackDisplay modpack={modpack} />
                                            </CommandItem>
                                        })  
                                    }
                            </DisplayContainer>
                        </CommandGroup>
                        :
                        <CommandGroup>
                            <DisplayContainer className={`${filteredSuggestions.length === 0 ? "hidden" : ""}`}>
                                {
                                    pendingSuggestionData ? (
                                        <div className="size-full flex items-center justify-center w-full">
                                            <Spinner className="size-20" />
                                        </div>
                                    )
                                    :
                                    filteredSuggestions && userSuggestions ? filteredSuggestions.map((suggestion, index) => {
                                        return <CommandItem value={suggestion.username} key={index} className="size-full max-w-full p-0">
                                            <SuggestionDisplay suggestion={suggestion} />
                                        </CommandItem>
                                    })  
                                    : ""
                                }
                            </DisplayContainer>
                        </CommandGroup>
                    }
                </CommandList>
            </Command>
        </section>
    </section>
}