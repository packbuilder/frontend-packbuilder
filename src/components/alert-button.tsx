import React, { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverArrow } from "@radix-ui/react-popover";

export interface AlertButtonProps {
  children: ReactNode;
  alertText: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export const AlertButton: React.FC<AlertButtonProps> = ({
  children,
  alertText,
  className,
  side = "bottom",
}) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    setOpen(true);

    setTimeout(() => {
    setOpen(false);
    }, 2000);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size="icon"
          onClick={handleCopy}
          className={`cursor-pointer transition w-fit p-2 duration-200 ${className ?? ""}`}
        >
          {children}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align="center"
        sideOffset={8}
        className="w-auto px-3 py-1.5 text-sm pointer-events-none bg-white text-black shadow-md border"
      >
        {alertText}
        <PopoverArrow className="fill-white" />
      </PopoverContent>
    </Popover>
  );
};

