import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverArrow } from "@radix-ui/react-popover";

export interface CopyButtonProps {
  text: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  side = "bottom",
}) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setOpen(true);

      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className={`cursor-pointer ${className ?? ""}`}
        >
          {!open ? <ClipboardCopy /> : <Check />}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align="center"
        sideOffset={8}
        className="w-auto px-3 py-1.5 text-sm pointer-events-none bg-white text-black shadow-md border"
      >
        Modpack link copied!
        <PopoverArrow className="fill-white" />
      </PopoverContent>
    </Popover>
  );
};

