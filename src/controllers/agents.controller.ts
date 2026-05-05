import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { sendAgentInviteEmail } from '../services/email.service';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const createAgent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      employeeId,
      tempPassword,
      orgId,
      orgName,
      adminName,
    } = req.body;

    // Validate required fields
    if (!name || !email || !employeeId || !tempPassword || !orgId) {
      res.status(400).json({
        success: false,
        error: 'name, email, employeeId, tempPassword, and orgId are required',
      });
      return;
    }

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (existing) {
      res.status(400).json({
        success: false,
        error: `Employee ID ${employeeId} is already in use`,
      });
      return;
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // skip email verification
        user_metadata: {
          name,
          role: 'agent',
        },
      });

    if (authError || !authData.user) {
      res.status(400).json({
        success: false,
        error: authError?.message || 'Failed to create auth user',
      });
      return;
    }

    const adminUser = (req as any).user;
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name,
          email,
          role: 'agent',
          employee_id: employeeId,
          org_id: orgId,
          org_name: orgName,
          is_active: true,
          created_by: adminUser?.id,
        })
        .select()
        .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      res.status(500).json({
        success: false,
        error: 'Failed to create profile: ' + profileError.message,
      });
      return;
    }

    try {
      await sendAgentInviteEmail(
        email,
        name,
        employeeId,
        tempPassword,
        adminName || 'Admin',
        orgName || 'MiniCRM'
      );
    } catch (emailErr) {
      console.error('[AGENTS] Invite email failed:', emailErr);
    }

    console.log(`[AGENTS] Created agent: ${name} (${employeeId})`);

    res.json({
      success: true,
      data: profile,
      message: `Agent ${name} created. Invite email sent to ${email}.`,
    });
  } catch (err: any) {
    console.error('[AGENTS] Create error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};