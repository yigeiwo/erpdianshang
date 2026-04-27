import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const password = process.env.DB_PASSWORD;

  if (process.env.NODE_ENV === 'production' && !password) {
    throw new Error('DB_PASSWORD environment variable must be set in production');
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: password || 'postgres',
    database: process.env.DB_DATABASE || 'erp_system',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
});
