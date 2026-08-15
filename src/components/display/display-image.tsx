import type React from "react";

export default function DisplayImage({className, ...props} : React.ImgHTMLAttributes<HTMLImageElement>) {
    return <img className={`bg-[var(--surface-3)] border border-[var(--surface-2)] rounded-md size-15 rounded-sm shrink-0 min-md:size-25 ${className}`} {...props} />
}