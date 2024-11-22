import { supabase } from './supabase';

interface OrganizationResponse {
  role: string;
  organization: {
    type: string;
  };
}

export async function checkUserAuthorization(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organization:organizations(type)
    `)
    .eq('user_id', userId)
    .eq('role', 'owner')
    .single() as unknown as {
      data: OrganizationResponse | null;
      error: any;
    };

  if (error) {
    throw new Error('Failed to verify user authorization');
  }

  if (!data || data.organization?.type !== 'matrix') {
    throw new Error('Unauthorized: Only matrix organization owners can access this panel');
  }

  return true;
}