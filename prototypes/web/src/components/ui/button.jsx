import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-primary/90 depth-btn-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 depth-btn-primary",
        outline:     "border border-border/80 bg-background hover:bg-muted/60 hover:text-foreground depth-btn-light",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80 depth-btn-light",
        ghost:       "hover:bg-muted/50 hover:text-foreground active:scale-[0.97]",
        link:        "text-foreground underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 min-h-10 px-4 py-2",
        sm: "h-9 min-h-9 rounded-lg px-3 text-xs",
        lg: "h-11 min-h-11 rounded-lg px-8 text-[15px]",
        icon: "size-10 min-h-10 min-w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
