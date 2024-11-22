"use client";

import { CreateCompanyDialog } from "@/components/create-company-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function NavBar() {
  const { signOut } = useAuth();

  return (
    <div className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="font-medium">Alma AI Admin Panel</div>
        <div className="flex items-center gap-4">
          <CreateCompanyDialog />
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}