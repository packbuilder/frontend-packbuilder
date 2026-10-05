import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { appQueries } from "@/hooks/appQueries";
import { verifySuggestion } from "@/lib/api";
import type { Modpack } from "@/types/modpack";
import type { Suggestion } from "@/types/suggestion";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CloudCog, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function VerifySuggestionDialog({suggestion, modpack, modificationReferenceIds} : {suggestion: Suggestion, modpack: Modpack, modificationReferenceIds: string[]}) {
    const [isOpen, setOpen] = useState(false);
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async () => {
            const status = await verifySuggestion(suggestion.id, modpack.id);

            if(!status || status < 200 || status > 299 ) {
                throw new Error("There was a problem with starting verification for your suggestion.");
            }
        },
        onSuccess: async () => {
            toast.success("Your suggestion is now undergoing verification!");
            setOpen(false);
            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id, suggestion.id).queryKey,
                refetchType: "all",
            });
            await queryClient.invalidateQueries({
                queryKey: appQueries.modificationModData(suggestion.id, modificationReferenceIds).queryKey,
                refetchType: "all"
            });
        },
        onError: (error) => {
            toast.error(error.message);
            console.error(error.message);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"default"}>
                    Verify suggestion <CloudCog />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex-col items-center justify-center">
                <DialogHeader className="mt-4 flex justify-center items-center">
                    <DialogTitle className="text-3xl font-bold">Verifying your suggestion</DialogTitle>
                    <DialogDescription>What to expect when verifying your suggestion?</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex border flex-col justify-start items-start w-full flex flex-col h-96 w-96 overflow-y-auto w-[80%]">
                        <div className="flex flex-col items-start justify-center">
                            <h2 className="font-bold text-xl px-4 py-2">Things to know about verification.</h2>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <p> 1. Verification of your suggestion happens automatically but may take some time.</p>
                                <p> 2. You cannot make changes to your suggestion while it's in a pending state.</p>
                                <p> 3. Once your suggestion is verified, the modpack owner will be able to merge your suggestion into the modpack.</p>
                                <p> 4. If you make changes to your suggestion after it has been verified, you will have to re-verify the suggestion again.</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col items-start justify-center">
                            <h2 className="font-bold text-xl px-4 py-2">What happens during verification.</h2>
                            <Separator />
                            <div className="rounded-md px-4 py-2 flex flex-col items-center justify-start gap-4 text-left">
                                <p> 1. All missing required mod dependencies are resolved automatically by being added to your suggestion modification list.</p>
                                <p> 2. Any incompatible mods that are already in the modpack will be added to your modifications list as mods to be removed.</p>
                                <p> 3. Any conflicting modifications that are in your suggestion will automatically be deleted.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="w-full px-2">
                    <div className="w-full flex flex-row justify-start items-center gap-2">
                        <Button variant={"default"} onClick={() => mutation.mutate()} disabled={mutation.isPending} type="submit">Begin Verification <Save/></Button>
                        <DialogClose asChild>
                            <Button variant={"destructive"}>Cancel <X/></Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}