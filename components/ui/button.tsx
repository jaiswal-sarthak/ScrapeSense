"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl border border-transparent text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/40 active:scale-[0.99]",
        secondary:
          "bg-white/80 text-slate-700 shadow-sm shadow-slate-900/5 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-slate-900/40",
        outline:
          "border-white/50 bg-transparent text-slate-700 hover:-translate-y-0.5 hover:border-white hover:bg-white/80 hover:text-slate-900 dark:border-white/20 dark:text-white dark:hover:bg-white/10",
        ghost:
          "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
        destructive:
          "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/40 hover:-translate-y-0.5",
        link: "text-sky-600 underline-offset-4 hover:underline dark:text-sky-300",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-3xl px-8 text-base",
        icon: "h-11 w-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

