# ---- HoyoLab service (keep alive with PM2) ----
# ecosystem.config.js for PM2

module.exports = {
  apps: [
    {
      name: 'hoyolab-checkin',
      script: 'src/index.js',
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      merge_logs: true,
    },
  ],
};
