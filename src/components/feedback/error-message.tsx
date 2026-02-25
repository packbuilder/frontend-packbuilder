import { CircleAlert } from "lucide-react";

export default function ErrorMessage({text, className} : {text: string, className?: string}) {
    return <div className={className + " flex items-center gap-2 text-destructive"}>
        <CircleAlert className="size-6" />
        <span className="text-sm">{text}</span>
    </div>
}