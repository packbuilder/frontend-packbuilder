import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

export default function ClearableSearchInput({
    className,
    ...props
}: ComponentProps<typeof Input>) {
    const [value, setValue] = useState("");

    return (
        <div className="flex items-center justify-center w-full relative">
            <Input
                {...props}
                className={className}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <Button
                variant="ghost"
                className="absolute right-0 border-none h-full bg-none"
                onClick={() => setValue("")}
                type="button"
            >
                <X />
            </Button>
        </div>
    );
}