"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-medium tracking-tight">Companies</h1>
      <Button size="sm" className="w-full h-9 sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Company
      </Button>
    </div>
  );
}