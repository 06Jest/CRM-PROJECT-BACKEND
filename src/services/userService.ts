import { supabaseAdmin } from '../utils/supabase';
import { logAuditEvent } from './auditService';


export const banUser = async (
  userId: string,
  reason: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
 
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_active: false,
        is_banned: true,
        ban_reason: reason,
      })
      .eq('id', userId);

    if (error) throw error;


    await logAuditEvent({
      event_type: 'USER_BANNED',
      super_admin_id: superAdminId,
      target_user_id: userId,
      ip_address: ipAddress,
      details: { reason },
    });

    console.log(`✅ User ${userId} banned by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error banning user:', err);
    throw err;
  }
};


export const unbanUser = async (
  userId: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_active: true,
        is_banned: false,
        ban_reason: null,
      })
      .eq('id', userId);

    if (error) throw error;

    await logAuditEvent({
      event_type: 'USER_UNBANNED',
      super_admin_id: superAdminId,
      target_user_id: userId,
      ip_address: ipAddress,
      details: {},
    });

    console.log(`✅ User ${userId} unbanned by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error unbanning user:', err);
    throw err;
  }
};


export const deleteUser = async (
  userId: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
   
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();


    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

  
    await logAuditEvent({
      event_type: 'USER_DELETED',
      super_admin_id: superAdminId,
      target_user_id: userId,
      ip_address: ipAddress,
      details: { email: user?.email },
    });

    console.log(`✅ User ${userId} deleted by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};