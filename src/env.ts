const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

export const env = {
  GITHUB_TOKEN: required("GITHUB_TOKEN"),
  PORT: Number(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
} as const;
