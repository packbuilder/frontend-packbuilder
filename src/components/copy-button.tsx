import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";

export interface CopyButtonProps {
  text: string;
  tooltipLabel?: string;
  tooltipSide?: "bottom" | "top" | "left" | "right"
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltipLabel = "Copy to clipboard",
  tooltipSide,
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setOpen(true);
      setTimeout(() => {setCopied(false); setOpen(false)}, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon" 
            onClick={handleCopy}
            className="relative cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide || "top"}>
          <p>{copied ? "Copied!" : tooltipLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};