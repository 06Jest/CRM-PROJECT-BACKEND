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
    const { name, email, employeeId, tempPassword, orgName } = req.body;
    const adminUser = (req as any).user;

    // Validate
    if (!name || !email || !employeeId || !tempPassword) {
      res.status(400).json({
        success: false,
        error: 'name, email, employeeId, and tempPassword are required',
      });
      return;
    }

    // Get admin's org_id from the database server-side
    // Never trust org_id from the frontend request body
    const { data: adminProfile, error: adminError } =
      await supabaseAdmin
        .from('profiles')
        .select('org_id, org_name, name')
        .eq('id', adminUser.id)
        .single();

    if (adminError || !adminProfile?.org_id) {
      res.status(400).json({
        success: false,
        error: 'Admin organization not found. Make sure your account has an org_id.',
      });
      return;
    }

    const orgId = adminProfile.org_id;
    const resolvedOrgName = orgName || adminProfile.org_name || 'MiniCRM';
    const adminName = adminProfile.name || 'Admin';

    // Check Employee ID uniqueness within the org
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('org_id', orgId)
      .single();

    if (existing) {
      res.status(400).json({
        success: false,
        error: `Employee ID ${employeeId} is already in use in your organization`,
      });
      return;
    }

    // Create Supabase Auth user
    // Store org_id in metadata so agent's session always has it
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'agent',
          org_id: orgId,        // ← KEY: in JWT metadata
          org_name: resolvedOrgName,
          employee_id: employeeId,
        },
      });

    if (authError || !authData.user) {
      res.status(400).json({
        success: false,
        error: authError?.message || 'Failed to create auth user',
      });
      return;
    }

    // Create profile row with same org_id as admin
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name,
          email,
          role: 'agent',
          employee_id: employeeId,
          org_id: orgId,           // ← same as admin
          org_name: resolvedOrgName,
          is_active: true,
          created_by: adminUser.id,
        })
        .select()
        .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      res.status(500).json({
        success: false,
        error: 'Failed to create agent profile: ' + profileError.message,
      });
      return;
    }

    // Send invite email
    try {
      await sendAgentInviteEmail(
        email, name, employeeId, tempPassword,
        adminName, resolvedOrgName
      );
    } catch (emailErr) {
      console.error('[AGENTS] Invite email failed:', emailErr);
    }

    res.json({
      success: true,
      data: profile,
      message: `Agent ${name} created with org_id ${orgId}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};