import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { Edit, Lock, Save, X } from "lucide-react";
import { updateProfileDtoSchema } from "@/types/dtos/updateProfileDto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState, type FormEvent } from "react";
import { changeEmail, logout, updateProfile } from '@/lib/api';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { appQueries } from '@/hooks/appQueries';
import SuggestionDisplay from '@/components/suggestion/suggestion-display';
import { Separator } from '@/components/ui/separator';
import ModpackDisplay from '@/components/display/modpack/modpack-display';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';
import { ImageType, SuggestionState } from '@/types/enums';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeEmailDtoSchema } from '@/types/dtos/changeEmailDto';
import SelectAvatarDialog from '@/components/display/select-avatar-dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import DisplayRadioGroup from '@/components/display/radio-display-buttons';
import ResultFilterForm from '@/components/display/result-filter-form';
import SuggestionFilterSelect from '@/components/display/suggestion/suggestion-filter-select';
import ResultsState from '@/components/display/result-state';
import { isResponseSuccess } from '@/lib/utils';

const searchParamsSchema = z.object({
    display: fallback(z.enum(["modpacks", "suggestions"]), "modpacks").default("modpacks"),
    modpacksPage: fallback(z.number(), 1).default(1),
    suggestionsPage: fallback(z.number(), 1).default(1),
    modpacksQuery: fallback(z.string(), "").default(""),
    suggestionsQuery: fallback(z.string(), "").default(""),
    suggestionsFilter: fallback(z.enum(SuggestionState).nullable(), null).default(null)
});

export const Route = createFileRoute('/profile/$username/$userId/')({
    validateSearch: zodValidator(searchParamsSchema),
    params: {
        parse: (raw) => ({
            username: raw.username,
            userId: Number(raw.userId),
        }),
    },
    loaderDeps: ({search: {display, modpacksPage, suggestionsPage, modpacksQuery, suggestionsQuery, suggestionsFilter}}) => ({
        display,
        modpacksPage,
        suggestionsPage,
        modpacksQuery,
        suggestionsQuery,
        suggestionsFilter
    }),
    loader: async ({context, params, deps}) => {
        if (!Number.isInteger(params.userId)) {
            throw redirect({ to: "/" });
        }

        const {modpacksPage, modpacksQuery, suggestionsPage, suggestionsQuery, suggestionsFilter} = deps
        const {user: curUser, queryClient} = context;
        const {userId} = params;

        const userData = await queryClient.ensureQueryData(appQueries.userData(userId));

        if(!userData) {
            throw redirect({to: "/"});
        }

        const userModpacks = await queryClient.ensureQueryData(appQueries.userModpacks(userData.id, modpacksPage, modpacksQuery));
        const userSuggestions = await queryClient.ensureQueryData(appQueries.userSuggestions(userData.id, suggestionsPage, suggestionsQuery, suggestionsFilter));

        const breadcrumbs = [{text: `${userData.name}'s profile`}];

        return {curUser, userData, userModpacks, userSuggestions, queryClient, breadcrumbs}
    },
    component: ProfileView,
});

function EditProfileDialog() {
  const {curUser} = Route.useLoaderData();
  const {userId} = Route.useParams();
  const [isOpen, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(curUser?.imageValue || "profile_avatar_1.jpg");
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

        const result = updateProfileDtoSchema.safeParse({name:newName, imageType, imageValue});

        if (!result.success) {
            throw new Error(result.error.issues[0].message);
        }

        const status = await updateProfile(curUser!.id, result.data);

        if(!status || status < 200 || status > 200) {
          throw new Error("There was a problem with updating your account details.");
        }

        return newName;
      },
      onSuccess: async (newName: string) => {
        toast.success("Successfully updated your account details!");
        setOpen(false);
        await queryClient.invalidateQueries({queryKey: appQueries.userData(userId).queryKey, refetchType: "all"});
        navigate({to: "/profile/$username/$userId", params: {username: newName, userId: userId}, replace: true});
    },
      onError: (error) => {
        toast.error(error.message);
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
            <DialogHeader className="w-full text-left">
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
                        <FieldLabel htmlFor='avatar' className='font-bold'>Change profile picture</FieldLabel>
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
                        <FieldLabel htmlFor="username" className='font-bold'>Change your username</FieldLabel>
                        <Input id="username" name='username' type="text" placeholder="Your username..." defaultValue={curUser?.name} required />
                    </Field>
                </FieldGroup>
              </form>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-start items-center gap-2">
                    <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Update Profile <Save/></Button>
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
    const navigate = useNavigate();
    const router = useRouter();
    const formRef = useRef(null);

    const handleLogout = async () => {
        try {
            const response = await logout();

            if(!isResponseSuccess(response)) {
                throw new Error("There was a problem with logging out, please try again.")
            }

            await router.invalidate({sync: true});
            navigate({to: "/login", reloadDocument: true});
        
        } catch(error) {
            const err = error as unknown as Error 
            toast.error(err.message);
        }
    }

    const submitForm = () => {
      const form = formRef.current as unknown as HTMLFormElement;
      form.requestSubmit();
    }

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const newEmail = formData.get("newEmail") as string;
            const password = formData.get("password") as string;

            const result = changeEmailDtoSchema.safeParse({ newEmail, password });

            if (!result.success) {
                throw new Error(result.error.issues[0].message);
            }

            const status = await changeEmail(result.data);

            if(!status || status < 200 || status > 200) {
                throw new Error("There was a problem with updating your email.")
            }

            return newEmail;
        },
        onSuccess: async (newEmail: string) => {
            toast.success(`Your email was successfully updated to ${newEmail}, You have been logged out of your account.`);
            
            setOpen(false);
            
            await handleLogout();
        },
        onError: (error) => {
            toast.error(error.message)
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
                      <div className='flex flex-col items-center justify-center gap-4 w-full'>
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
                    <Button variant={"default"} onClick={submitForm} disabled={mutation.isPending} type="submit">Change Email <Save/></Button>
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
        navigate({search: (prev) => ({...prev, display: newValue}), resetScroll: false});
    }

    return (
        <DisplayRadioGroup  
            value={display} 
            onValueChange={handleValueChange}
            options={[
                { value: "modpacks", label: "Modpacks" },
                { value: "suggestions", label: "Suggestions" },
            ]} 
        />    
    )
}

export default function ProfileView() {
    const {userId} = Route.useParams();
    const {data: userProfileData} = useSuspenseQuery(appQueries.userData(userId));
    const { curUser } = Route.useLoaderData();
    const navigate = useNavigate();

     if(!userProfileData) {
        return (
            <div>
            <h1>This profile does not exist.</h1>
        </div>
        )
    }

    const {display, modpacksPage, suggestionsPage, modpacksQuery, suggestionsQuery, suggestionsFilter: suggestionsFilterParam} = Route.useSearch({
        select: ({display, modpacksPage, suggestionsPage, suggestionsFilter, modpacksQuery, suggestionsQuery}) => ({
            display,
            modpacksPage,
            suggestionsPage,
            suggestionsFilter,
            modpacksQuery,
            suggestionsQuery
        })
    });

    const {data: userModpacks, isPending: pendingModpackData} = useQuery(appQueries.userModpacks(userProfileData.id, modpacksPage, modpacksQuery));
    const {data: userSuggestions, isPending: pendingSuggestionData} = useQuery(appQueries.userSuggestions(userProfileData.id, suggestionsPage, suggestionsQuery, suggestionsFilterParam));

    const isLoading = display === "modpacks" ? pendingModpackData : pendingSuggestionData;

    const isEmpty = display === "modpacks" ? userModpacks?.items.length === 0 : userSuggestions?.items.length === 0;

    const [suggestionsFilter, setSuggestionsFilter] = useState<SuggestionState | null>(suggestionsFilterParam);
    
    const handleFilterChange = (newValue: "All" | SuggestionState) => {
        setSuggestionsFilter(newValue === "All" ? null : newValue)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newSearchQuery = formData.get("searchQuery") as string;

        if(display === "mods") {
            navigate({search: (prev) => ({...prev, modpacksPage: 1, modpacksQuery: newSearchQuery}), resetScroll: false, from: Route.fullPath});
        } else {
            navigate({search: (prev) => ({...prev, suggestionsPage: 1, suggestionsQuery: newSearchQuery, suggestionsFilter}), resetScroll: false, from: Route.fullPath});
        }
    }
    
    return <section className="flex flex-col items-center max-w-9/10 justify-center p-2 min-md:max-w-3/4 min-md:min-w-2/4">
        <header className="flex flex-col justify-between items-center max-w-full gap-3 min-md:flex-row min-md:gap-6">
            <div className="flex flex-col max-w-full items-center justify-center gap-3 min-md:flex-row min-md:justify-between">
                <img className='size-40 border-white/30 border-1' src={userProfileData.imageType === ImageType.Stock ? `/profileAvatars/${userProfileData.imageValue}` : userProfileData.imageValue} alt={"user profile picture"} />
                <div className="flex flex-col max-w-full min-md:items-start items-center justify-center gap-3">
                        <h1 className="font-bold line-clamp-1 leading-normal">{userProfileData.name}</h1>
                        {curUser?.id === userProfileData.id && <div className="flex items-center max-w-full flex-wrap justify-center gap-2">
                            <EditProfileDialog />
                            <ChangeEmailDialog />
                            <Button variant={"default"} onClick={() => navigate({to: "/login/forgot-password"})}>
                                Change password <Lock />
                            </Button>
                        </div>}
                </div>
            </div>
        </header>

        <Separator className="my-4"/>
        
        <section className="flex items-center justify-center gap-4 flex-col w-19/20">
            <SelectDisplayRadioGroup />

            <div className="flex flex-col justify-center items-center w-full h-fit gap-2 overflow-visible">
                <div className="flex items-center justify-center w-full gap-1">
                    <ResultFilterForm handleSubmit={handleSubmit}>
                        {
                            display === "suggestions" &&
                            <SuggestionFilterSelect suggestionFilter={suggestionsFilter} handleFilterChange={handleFilterChange} />
                        }
                    </ResultFilterForm>
                </div>
                <div className="w-full max-h-fit">
                    <ResultsState isEmpty={isEmpty} isLoading={isLoading}>
                        {display === "modpacks" ? 
                            userModpacks?.items.map((modpack, index) => {
                                return <div key={index} className="size-full p-0">
                                    <ModpackDisplay modpack={modpack} />
                                </div>
                            })  
                            :   
                            userSuggestions?.items.map((suggestion, index) => {
                                return <div key={index} className="size-full max-w-full p-0">
                                    <SuggestionDisplay suggestion={suggestion} />
                                </div>
                            })  
                        }
                    </ResultsState>
                </div>
            </div>
        </section>
    </section>
}