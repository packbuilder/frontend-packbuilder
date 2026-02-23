import { appQueries } from "@/hooks/appQueries";
import { deleteSuggestion } from "@/lib/api";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";  
import type { Suggestion } from "@/types/suggestion";
import type { Modpack } from "@/types/modpack";

export default function DeleteSuggestionDialog({suggestion, modpack} : {suggestion: Suggestion, modpack: Modpack}) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const status = await deleteSuggestion(modpack.id.toString(), suggestion.id.toString());

            if(!status || status < 200 || status > 200 ) {
                throw new Error("Unable to delete suggestion.");
            }
        },
        onSuccess: async () => {
            navigate({to: "/"});

            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id.toString(), suggestion.id.toString()).queryKey,
                refetchType: "all"
            });

            await queryClient.invalidateQueries({
                queryKey: appQueries.suggestion(modpack.id.toString(), suggestion.id.toString()).queryKey,
                refetchType: "all"
            });

        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={"destructive"}>Delete suggestion <Trash2 /></Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="flex flex-col justify-center items-center w-fit gap-4">
            <DialogHeader className="mt-4 flex justify-center items-center">
                <DialogTitle className="text-3xl font-bold">Are you sure you want do delete this suggestion?</DialogTitle>
                <DialogDescription>Doing so is irriversable and will delete all data related to your suggestion.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full px-2">
                <Button variant={"default"} onClick={() => mutation.mutate()}>Yes I want to delete this <Check /></Button>
                <DialogClose asChild>
                    <Button variant={"destructive"}>Cancel <X/></Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}