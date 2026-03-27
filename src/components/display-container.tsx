import { cn } from "@/lib/utils";

export default function DisplayContainer({children, className} : {children:React.ReactNode, className?:string}) {
    return <div className={cn(`flex flex-col justify-start items-start min-w-[300px] border w-1/2 border-black dark:border-gray-400 bg-[var(--surface-1)] flex flex-col max-h-96 h-fit w-96 overflow-y-auto overflow-x-clip w-full`, className)}>
        {children}
    </div>
}