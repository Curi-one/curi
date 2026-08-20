import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-[colors,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:   "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.12)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        outline:   "border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
