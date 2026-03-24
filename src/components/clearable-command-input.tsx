import { useState } from "react";
import { CommandInput } from "./ui/command";
import {Command as CommandPrimitive} from "cmdk"
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function ClearableCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    const [value, setValue] = useState("");
    
    const handleValueChange = (newValue: string) => {
        setValue(newValue);
    }

    return <div className="flex items-center justify-center w-full relative">
        <CommandInput value={value} onValueChange={handleValueChange}  className={className} {...props}/>
        <Button variant={"ghost"} className="absolute right-1" onClick={() => handleValueChange("")}><X/></Button>
    </div>
}