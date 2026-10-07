import { createModpackVersion } from "@/lib/api";
import { SuggestionState } from "@/types/enums";
import type { Modpack } from "@/types/modpack";
import type { Suggestion } from "@/types/suggestion";
import type { User } from "@/types/user";
import { Dialog, DialogFooter ,DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader } from "@/components/ui/dialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { appQueries } from "@/hooks/appQueries";

type MergeSuggestionDialogProps = {
    modpack: Modpack, 
    suggestion: Suggestion, 
    curUser: User | null
}

export default function MergeSuggestionDialog({modpack, suggestion, curUser} : MergeSuggestionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const canMerge = suggestion.state === SuggestionState.Verified && curUser?.id === modpack.userId && suggestion.modifications.length > 0;
    
    const mutation = useMutation({
        mutationFn: async () => {
            const status = await createModpackVersion(modpack.id, suggestion.id);
        
            if(!status || status < 200 || status > 299) {
                throw new Error(`There was a problem with merging ${suggestion.user?.name}'s suggestion into modpack ${modpack.name}.`);
            }
        },
        onSuccess: async () => {
            toast.success(`Successfully merged ${suggestion.user?.name}'s suggestion into modpack ${modpack.name}.`);
            
            setIsOpen(false);

            await queryClient.invalidateQueries({
                queryKey: appQueries.modpack(modpack.id).queryKey, 
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id, suggestion.id).queryKey, 
                refetchType: "all"
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.keys.modificationModData(suggestion.id), 
                refetchType: "all"
            });

            await router.invalidate({sync: true}); 
        },
        onError: (error: Error) => {
            toast.error(error.message);
            console.error(error);
        }
    })

    const handleClick = () => {
        if(canMerge) {
            mutation.mutate();
        }
    }

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={canMerge ? "default" : "disabled"} disabled={!canMerge}>
                <p>Merge</p>
            </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="flex justify-center items-center text-left">
                <DialogTitle className="text-xl font-bold">Are you sure you want do merge this suggestion into your modpack?</DialogTitle>
                <Separator />
                <DialogDescription>Doing so will create a new version for your modpack that implements the changes suggested by the user.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full items-start flex-row">
                <Button variant={"default"} disabled={mutation.isPending} onClick={handleClick}>Merge suggestion <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"} className="w-fit">Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}