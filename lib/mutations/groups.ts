import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

export async function createGroup(name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Generate 8 char code
  const code = 'HABIT-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  try {
    const { data: group, error: groupErr } = await (supabase.from('groups') as any).insert({
      name,
      invite_code: code,
      created_by: user.id
    }).select().single();

    if (groupErr || !group) throw groupErr;

    const { error: memberErr } = await (supabase.from('group_members') as any).insert({
      group_id: group.id,
      user_id: user.id
    });

    if (memberErr) throw memberErr;

    // Update store optimistically
    useAppStore.getState().updateProfile({ groupId: group.id, groupCode: code });
    return code;

  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
}

export async function joinGroup(code: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const { data: group, error: groupErr } = await (supabase.from('groups') as any).select('id').eq('invite_code', code).single();
    if (groupErr || !group) throw groupErr;

    const { error: memberErr } = await (supabase.from('group_members') as any).insert({
      group_id: group.id,
      user_id: user.id
    });

    if (memberErr) throw memberErr;

    useAppStore.getState().updateProfile({ groupId: group.id, groupCode: code });
    return true;

  } catch (error) {
    console.error('Error joining group:', error);
    return false;
  }
}
