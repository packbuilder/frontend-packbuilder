import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clipboard } from "lucide-react";

export interface CopyButtonProps {
  text: string;
  tooltipLabel?: string;
  tooltipSide?: "bottom" | "top" | "left" | "right"
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {setCopied(false)}, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Button
      variant="default"
      size="icon" 
      onClick={handleCopy}
      className="cursor-pointer w-fit"
    >
      {copied ? (
        <span className="flex justsify-center items-center gap-2 p-2">Copied <Check className="h-4 w-4" /></span>
      ) : (
        <span className="flex justsify-center items-center gap-2 p-2">Link to modpack <Clipboard className="h-4 w-4" /></span>
      )}
    </Button>
  );
};