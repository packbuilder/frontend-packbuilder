import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AvatarImage, AvatarFallback, Avatar } from "../ui/avatar";
import { SquareUserRound, X } from "lucide-react";
import { Button } from "../ui/button";

export default function SelectAvatarDialog({curAvatar, setAvatar, avatarType} : {curAvatar: string, setAvatar: Dispatch<SetStateAction<string>>, avatarType: "profileAvatars" | "modpackAvatars"}) {
  const [isOpen, setOpen] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/${avatarType}/manifest.json`)
     .then(res => res.json())
      .then(value => setAvatars(value))
        .catch((err: Error) => console.error(err.message))
  }, []);

  return <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"outline"} className='size-fit'>
                Select your avatar <SquareUserRound />
            </Button>   
        </DialogTrigger>
        <DialogContent aria-describedby="" showCloseButton={false} className="flex flex-col justify-center items-center w-9/10">
            <DialogHeader className="w-full px-2 text-left">
                <DialogTitle>Select your avatar</DialogTitle>
                <DialogDescription>Choose between the stock profile pictures below.</DialogDescription>
            </DialogHeader>
            <div className='grid grid-cols-3 min-md:grid-cols-4 gap-4 max-sm:overflow-y-scroll p-2 w-full'>
              {
                avatars.map((value: string, index: number) => {
                  return <Avatar className={`${curAvatar === value ? "outline-white outline-3  " : ""} size-15 cursor-pointer`} key={index} onClick={() => setAvatar(value)}>
                    <AvatarImage src={`/${avatarType}/${value}`} alt={`Image ${index}`}/>
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                })
              }
            </div>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex flex-row justify-end items-center gap-2">
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Close <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}