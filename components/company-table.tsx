"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const companies = [
  { id: 1, name: "Acme Corp", status: "active" },
  { id: 2, name: "Tech Industries", status: "inactive" },
  { id: 3, name: "Global Solutions", status: "active" },
];

export function CompanyTable() {
  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px] h-10 text-xs font-medium">ID</TableHead>
            <TableHead className="h-10 text-xs font-medium">Company Name</TableHead>
            <TableHead className="hidden h-10 text-xs font-medium sm:table-cell">Status</TableHead>
            <TableHead className="w-[50px] h-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="h-12 hover:bg-slate-50">
              <TableCell className="text-sm text-muted-foreground py-2">{company.id}</TableCell>
              <TableCell className="text-sm py-2">{company.name}</TableCell>
              <TableCell className="hidden py-2 sm:table-cell">
                <StatusBadge status={company.status} />
              </TableCell>
              <TableCell className="py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem className="text-sm">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm text-destructive focus:text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "active" ? "success" : "secondary"}
      className="capitalize text-xs font-normal"
    >
      {status}
    </Badge>
  );
}