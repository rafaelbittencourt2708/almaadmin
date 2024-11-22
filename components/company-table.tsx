"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/lib/supabase";

interface Company {
  id: number;
  name: string;
  status: string;
}

const ITEMS_PER_PAGE = 10;

export function CompanyTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  async function fetchCompanies() {
    try {
      setLoading(true);
      setError(null);

      // Get total count for pagination
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Fetch paginated data
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
        .order('id', { ascending: true });

      if (error) throw error;

      setCompanies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching companies');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-md border border-border/50 p-6 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <Button onClick={fetchCompanies} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

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
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="h-12">
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              </TableRow>
            ))
          ) : companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                No companies found
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
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
            ))
          )}
        </TableBody>
      </Table>

      {!loading && companies.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount}
          >
            Next
          </Button>
        </div>
      )}
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
