import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT  = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║        MiniCRM Backend Server         ║
  ╠═══════════════════════════════════════╣
  ║  Status:  Running                     ║
  ║  Port:    ${PORT}                        ║
  ║  Env:     ${process.env.NODE_ENV || 'development'}                 ║
  ╚═══════════════════════════════════════╝
    `);
});