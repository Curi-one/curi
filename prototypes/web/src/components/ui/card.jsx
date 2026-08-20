import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return <div data-slot="card" className={cn("rounded-xl border border-border/60 bg-card text-card-foreground depth-surface", className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-base font-semibold leading-snug tracking-tight sm:text-lg", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
