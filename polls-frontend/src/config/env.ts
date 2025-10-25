// Environment configuration
export const config = {
  apiBase: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  wsBase: import.meta.env.VITE_WS_BASE || 'ws://localhost:8000',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE', 'VITE_WS_BASE'];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0 && config.isProduction) {
  console.warn(
    `Missing environment variables: ${missingEnvVars.join(', ')}. Using default values.`
  );
}

export default config;
