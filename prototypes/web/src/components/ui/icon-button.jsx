import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition-[color,background-color,border-color,box-shadow,transform] duration-150 hover:border-border hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.92] [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "depth-btn-light",
        ghost:   "border-transparent bg-transparent hover:bg-muted/60 active:scale-[0.92]"
      },
      size: {
        default: "size-10",
        sm: "size-9 [&_svg]:size-3.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const IconButton = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} type="button" className={cn(iconButtonVariants({ variant, size, className }))} {...props} />;
});
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
