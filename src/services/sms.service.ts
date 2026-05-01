import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SmsResult {
  sid: string;
  status: string;
  to: string;
  body: string;
  simulated: true;
}

export const sendSms = async (data: {
  to: string;
  body: string;
  userId?: string;
  contactName?: string;
}): Promise<SmsResult> => {
  const sid = `SM${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 32)}`;

  const { error } = await supabase
    .from('sms_logs')
    .insert([{
      to_number: data.to,
      body: data.body,
      status: 'delivered',
      sid,
      contact_name: data.contactName,
      user_id: data.userId,
    }]);

  if (error) {
    console.error('[SMS] Failed to log simulated SMS:', error.message);
  }

  await new Promise(resolve => 
    setTimeout(resolve, Math.floor(Math.random() * 100) + 50)
  );

  console.log(`[SMS] Simulated SMS to ${data.to}: "${data.body.slice(0, 40)}...`)

  return {
    sid,
    status: 'delivered',
    to: data.to,
    body: data.body,
    simulated: true,
  };
};
export const getSmsStatus = async (sid: string): Promise<string> => {
  const { data } = await supabase
    .from('sms_logs')
    .select('status')
    .eq('sid', sid)
    .single();

  return data?.status || 'delivered';
};

export const getSmsHistory = async (
  contactName: string,
  userId: string
): Promise<any[]> => {
  const { data } = await supabase
    .from('sms_logs')
    .select('*')
    .eq('contact_name', contactName)
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })

  return data || [];
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 7 &&  cleaned.length <= 15;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return phone;
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
  return phone; 
};