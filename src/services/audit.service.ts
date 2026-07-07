import { supabaseAdmin} from '../config/supabase';

interface AuditEvent {
  event_type: string;
  super_admin_id: string;
  target_user_id?: string | null;
  target_org_id?: string | null;
  ip_address: string;
  details: any;
}

export const logAuditEvent = async (event: AuditEvent): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('super_admin_audit_log')
      .insert([
        {
          event_type: event.event_type,
          super_admin_id: event.super_admin_id,
          target_user_id: event.target_user_id || null,
          target_org_id: event.target_org_id || null,
          ip_address: event.ip_address,
          details: event.details,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (err) {
    console.error('Error in logAuditEvent:', err);
  }
};


export const getAuditLogs = async (
  superAdminId: string,
  limit: number = 100
): Promise<any[]> => {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('super_admin_audit_log')
      .select('*')
      .eq('super_admin_id', superAdminId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return logs || [];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    throw err;
  }
};

