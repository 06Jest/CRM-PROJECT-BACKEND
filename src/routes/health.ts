import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

router.get('/', async (_req, res) => {
  const timestamp = new Date().toISOString();

  let database: 'ok' | 'down' = 'down';
  let authentication: 'ok' | 'down' = 'down';

  try {
    const { error } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1);

    if (!error) {
      database = 'ok';
    }
  } catch {
    database = 'down';
  }


  try {
    const { error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (!error) {
      authentication = 'ok';
    }
  } catch {
    authentication = 'down';
  }

  const healthy =
    database === 'ok' &&
    authentication === 'ok';

  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    server: 'ok',
    database,
    authentication,
    status: healthy ? 'operational' : 'degraded',
    message: healthy
      ? 'All systems operational'
      : 'One or more services are experiencing issues',
    timestamp,
  });
});

export default router;