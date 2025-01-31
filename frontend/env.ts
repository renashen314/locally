export function validateEnv() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_MAPBOX_TOKEN'
    ];
  
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }