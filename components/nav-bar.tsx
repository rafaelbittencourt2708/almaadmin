"use client";

import { CreateCompanyDialog } from "@/components/create-company-dialog";

export function NavBar() {
  return (
    <div className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="font-medium">Alma AI Admin Panel</div>
        <CreateCompanyDialog />
      </div>
    </div>
  );
}