import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#e3edf2] text-[#3b6a86] dark:bg-[#1f333d] dark:text-[#8fc0d9]",
        secondary:
          "border-transparent bg-[#eeece6] text-[#4a5a5c] dark:bg-[#2a2f2c] dark:text-[#b7c0c1]",
        destructive:
          "border-transparent bg-[#f6e2df] text-[#a3372f] dark:bg-[#2e1a18] dark:text-[#e2a49d]",
        outline: "border-border text-muted-foreground",
        success:
          "border-transparent bg-[#e6f0e5] text-[#4b7248] dark:bg-[#1e2a1d] dark:text-[#9dbf98]",
        warning:
          "border-transparent bg-[#f7e6d6] text-[#a05a2c] dark:bg-[#2e2016] dark:text-[#e7b092]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
