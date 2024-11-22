import { supabase } from './supabase';

export async function checkUserAuthorization(userId: string) {
  // Check if user is part of a matrix organization as an owner
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organization:organizations(type)
    `)
    .eq('user_id', userId)
    .eq('role', 'owner')
    .single();

  if (error) {
    throw new Error('Failed to verify user authorization');
  }

  if (!data || data.organization?.type !== 'matrix') {
    throw new Error('Unauthorized: Only matrix organization owners can access this panel');
  }

  return true;
}