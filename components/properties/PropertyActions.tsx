import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PropertyActionState } from "@/lib/status";

interface ActionButtonProps extends ButtonProps {
  state: PropertyActionState;
  label: string;
}

/** A single property-card action button. Disabled actions stay visible with an explanatory tooltip. */
export function ActionButton({ state, label, ...buttonProps }: ActionButtonProps) {
  const button = (
    <Button {...buttonProps} disabled={!state.enabled}>
      {label}
    </Button>
  );

  if (state.enabled) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-block">
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>{state.reason}</TooltipContent>
    </Tooltip>
  );
}
