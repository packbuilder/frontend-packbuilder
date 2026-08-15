import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function InfoPill({children, className} : {children: ReactNode, className?: string}) {
    return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--text-secondary)] text-[var(--text-secondary)]", className)}>
        {children}
    </span>
}