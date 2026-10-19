import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

export default function ResultDisplay({
    isLoading,
    isEmpty,
    className,
    children,
}: {isLoading: boolean, isEmpty: boolean, className?: string, children?: React.ReactNode}) {
    if (isLoading) {
        return (
            <div className={cn("displayContainer flex items-center justify-center w-full h-96", className)}>
                <Spinner className="size-20" />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className={cn("displayContainer flex items-center justify-center w-full h-96", className)}>
                <h2>It's looking empty in here...</h2>
            </div>
        );
    }

    return <div className={cn("displayContainer flex items-center justify-start w-full", className)}>{children}</div>
}