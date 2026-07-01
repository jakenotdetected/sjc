module.exports = {
  apps: [
    {
      name: "core-smp-bot",
      script: "index.js",
      cwd: "/opt/core-smp-bot",
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
