import { Button } from "@/components/ui/button";
import { getModpackVersionManifest } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Download, X } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";

export function DownloadCurseForgeManifestDialog({modpackId, versionIteration} : {modpackId: string, versionIteration: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const downloadRef = useRef<HTMLAnchorElement | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const manifest = await getModpackVersionManifest(modpackId, versionIteration);

            if(!manifest) {
                throw new Error("Unable to download manifest.json");
            }

            return manifest;
        },
        onSuccess: async (manifest: Blob) => {
            const url = URL.createObjectURL(manifest);
            setDownloadUrl(url);
        },
        onError: (error: Error) => {
            console.log(error.message);
        }
    });

    useEffect(() => {
        if (downloadUrl && downloadRef.current) {
            downloadRef.current.click();

            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
                setDownloadUrl(null);
                setIsOpen(false);
            }, 100);
        }
    }, [downloadUrl]);

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={"default"}>Download <Download /></Button>
        </DialogTrigger>
        <DialogContent aria-describedby="" showCloseButton={false} className="flex flex-col justify-center items-center">
            {downloadUrl && (
                <a
                    ref={downloadRef}
                    href={downloadUrl}
                    download="manifest.zip"
                    className="hidden"
                />
            )}
            <DialogHeader className="w-full px-2">
                <DialogTitle className="text-xl text-left">How to import your modpack to curseforge.</DialogTitle>
            </DialogHeader>
             <div className="flex items-center flex-col justify-center text-md">
                <div className="flex flex-col items-start justify-center">
                    <div className="rounded-md px-4 py-2 gap-4 text-left flex border flex-col justify-start items-start w-full flex flex-col h-fit w-96 overflow-y-auto w-[80%]">
                        <p>1. Launch the CurseForge app and make sure the Minecraft profile is selected.</p>
                        <p>2. Click “Minecraft” in the top menu and switch to the “Modpacks” section.</p>
                        <p>3. On the right side, look for “Add Modpack” or “Import Modpack” (wording may vary depending on version) and then select “Import from ZIP”.</p>
                        <p>4. Navigate to the ZIP file you downloaded (it should be named manifest.zip). Select it and click Open.</p>
                        <p>5. Curseforge should then create a new profile and download all of your mods, once that's finished you can then launch your modpack!</p>
                    </div>
                </div>
            </div>
            <DialogFooter className="w-full px-2">
                <div className="w-full flex items-center gap-2">
                    <Button variant={"default"} onClick={() => mutation.mutate()} disabled={mutation.isPending}>Start your download <Download /></Button>
                    <DialogClose asChild>
                        <Button variant={"destructive"}>Cancel <X/></Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}