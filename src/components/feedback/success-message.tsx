import { CircleCheck } from "lucide-react";

export default function SuccessMessage({text, className} : {text: string, className?: string}) {
    return <div className={className + " flex items-center gap-2 text-green-500 w-full"}>
        <CircleCheck className="size-6" />
        <span className="text-sm">{text}</span>
    </div>
}