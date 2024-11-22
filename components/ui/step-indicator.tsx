"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-200",
            currentStep === index + 1
              ? "h-1.5 w-6 rounded-full bg-primary"
              : "h-1.5 w-1.5 rounded-full bg-muted"
          )}
        />
      ))}
    </div>
  );
}