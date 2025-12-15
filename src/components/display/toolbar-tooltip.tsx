import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ToolbarTooltipProps = {
  side?: 'bottom' | 'left' | 'right' | 'top';
  content: string; // Or could be another React.ReactNode.
  children: React.ReactNode;
};

export default function ToolbarTooltip({
  side,
  content,
  children,
}: ToolbarTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={`${side ? side : "bottom"}`} sideOffset={3}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}