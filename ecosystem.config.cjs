module.exports = {
  apps: [
    {
      name: "openchaos-backend",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
