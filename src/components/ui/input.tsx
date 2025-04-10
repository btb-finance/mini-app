import * as React from "react"

import { cn } from "~/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Apply special styles for number inputs to ensure text is visible
    const isNumberInput = type === "number";
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-neutral-200 bg-white text-[#1A1E23] px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:ring-offset-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-[#A52A2A]",
          isNumberInput && "text-black !important bg-white !important",
          className
        )}
        ref={ref}
        style={isNumberInput ? {...props.style, color: 'black', backgroundColor: 'white'} : props.style}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
