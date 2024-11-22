-- Create a function to handle organization creation with member assignment
create or replace function create_organization(
  org_name text,
  org_slug text,
  user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id text;
begin
  -- Start transaction
  begin
    -- Create the organization
    insert into organizations (name, slug, active, created_by)
    values (org_name, org_slug, true, user_id)
    returning id into new_org_id;

    -- Create the organization member with owner role
    insert into organization_members (organization_id, user_id, role)
    values (new_org_id, user_id, 'owner');

    -- Return the created organization id
    return json_build_object(
      'organization_id', new_org_id,
      'success', true
    );
  exception
    when others then
      -- Return error details
      return json_build_object(
        'success', false,
        'error', SQLERRM
      );
  end;
end;
$$;
