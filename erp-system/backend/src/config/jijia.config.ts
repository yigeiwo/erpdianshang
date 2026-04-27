import { registerAs } from '@nestjs/config';

export default registerAs('jijia', () => ({
  appId: process.env.JIJIA_APP_ID || '',
  appKey: process.env.JIJIA_APP_KEY || '',
}));
