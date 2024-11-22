"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
import { StepIndicator } from "./ui/step-indicator";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../hooks/use-toast";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onCompanyCreated?: () => void;
}

export function CreateCompanyDialog({ onCompanyCreated }: Props) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canCreateOrganization, setCanCreateOrganization] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      slug: "",
      adminName: "",
      adminEmail: "",
    },
  });

  // Check if user is member of at least one organization
  useEffect(() => {
    const checkOrganizationMembership = async () => {
      if (!session?.user) return;

      const { data: membershipData, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        console.error('Error checking organization membership:', error);
        return;
      }

      setCanCreateOrganization(membershipData.length > 0);
    };

    checkOrganizationMembership();
  }, [session]);

  // Check slug availability with debounce
  useEffect(() => {
    const slug = form.watch('slug');
    if (!slug) return;

    const checkSlug = async () => {
      setCheckingSlug(true);
      try {
        const { data: existingCompanies, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', slug);

        if (error) {
          console.error('Error checking slug:', error);
          return;
        }

        if (existingCompanies && existingCompanies.length > 0) {
          form.setError('slug', {
            type: 'manual',
            message: 'This slug is already taken'
          });
        } else {
          form.clearErrors('slug');
        }
      } finally {
        setCheckingSlug(false);
      }
    };

    // Debounce the slug check
    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [form.watch('slug')]);

  const onSubmit = async (data: FormData) => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a company",
        variant: "destructive",
      });
      return;
    }

    if (!canCreateOrganization) {
      toast({
        title: "Error",
        description: "You must be a member of at least one organization to create a new one",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Call the create_organization function
      const { data: result, error: fnError } = await supabase
        .rpc('create_organization', {
          org_name: data.companyName,
          org_slug: data.slug,
          user_id: session.user.id
        });

      if (fnError) throw fnError;

      // Check if the organization was created successfully
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create organization');
      }

      toast({
        title: "Success",
        description: "Company created successfully",
      });

      // Close dialog and reset form
      setOpen(false);
      form.reset();
      setStep(1);

      // Refresh company list
      onCompanyCreated?.();

    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const isValid = await form.trigger(["companyName", "slug"]);
    if (isValid && !form.getFieldState('slug').error) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !canCreateOrganization) {
      toast({
        title: "Access Denied",
        description: "You must be a member of at least one organization to create a new one",
        variant: "destructive",
      });
      return;
    }
    
    setOpen(open);
    if (!open) {
      form.reset();
      setStep(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="h-8"
          disabled={!canCreateOrganization}
          title={!canCreateOrganization ? "You must be a member of at least one organization to create a new one" : undefined}
        >
          <Plus className="mr-2 h-3 w-3" />
          Create Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Company</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the company details to create a new company."
              : "Set up the account administrator."}
          </DialogDescription>
          <StepIndicator currentStep={step} totalSteps={2} />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 ? (
              <>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Slug</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter company slug" 
                            {...field}
                            onChange={(e) => {
                              // Convert to lowercase and replace spaces with hyphens
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, '-')
                                .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
                              field.onChange(value);
                            }}
                          />
                          {checkingSlug && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              Checking...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Admin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter admin email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="mt-2 sm:mt-0"
                >
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  disabled={checkingSlug}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || loading}
                >
                  {loading ? "Creating..." : "Create Company"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
