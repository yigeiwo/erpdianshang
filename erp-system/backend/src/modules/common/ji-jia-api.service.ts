import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';

export interface JiJiaApiResponse<T = unknown> {
  code: string;
  data?: T;
  messages?: string | string[];
}

@Injectable()
export class JiJiaApiService {
  private readonly logger = new Logger(JiJiaApiService.name);
  private accessToken: string | null = null;
  private tokenExpireTime = 0;
  private readonly HOSTNAME = 'open.gerpgo.com';
  private readonly BASE_PATH = '/api/open';

  constructor(private readonly configService: ConfigService) {}

  private getConfig(): { appId: string | null; appKey: string | null } {
    return {
      appId: this.configService.get('jijia.appId'),
      appKey: this.configService.get('jijia.appKey'),
    };
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpireTime - 300000) {
      return this.accessToken;
    }

    const { appId, appKey } = this.getConfig();
    if (!appId || !appKey) {
      this.logger.error('积加 API 配置缺失');
      return null;
    }

    return new Promise((resolve) => {
      const data = JSON.stringify({ appId, appKey });
      const options = {
        hostname: this.HOSTNAME,
        path: `${this.BASE_PATH}/api_token`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.code === '000000' || response.code === 200) {
              const tokenData = response.data;
              this.accessToken = tokenData.accessToken;
              this.tokenExpireTime = Date.now() + (tokenData.expiresIn || 7200) * 1000;
              this.logger.log('积加 Token 获取成功');
              resolve(this.accessToken);
            } else {
              this.logger.error(`获取 Token 失败: ${response.msg}`);
              resolve(null);
            }
          } catch (e: unknown) {
            const err = e as Error;
            this.logger.error(`解析 Token 响应失败: ${err.message}`);
            resolve(null);
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`请求 Token 失败: ${e.message}`);
        resolve(null);
      });

      req.write(data);
      req.end();
    });
  }

  async request<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: Record<string, unknown>,
  ): Promise<JiJiaApiResponse<T> | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    const data = body ? JSON.stringify(body) : '';

    return new Promise((resolve) => {
      const options = {
        hostname: this.HOSTNAME,
        path: `${this.BASE_PATH}${endpoint}`,
        method,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${token}`,
          'accessToken': token,
          'Content-Length': data.length,
        },
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const response = JSON.parse(responseBody);
            if (response.code === '000000' || response.code === 200) {
              resolve(response as JiJiaApiResponse<T>);
            } else {
              const msg = Array.isArray(response.messages) 
                ? response.messages.join(', ') 
                : response.messages || 'Unknown error';
              this.logger.error(`API 返回错误: ${msg}`);
              resolve(null);
            }
          } catch (e: unknown) {
            const err = e as Error;
            this.logger.error(`解析响应失败: ${err.message}`);
            resolve(null);
          }
        });
      });

      req.on('error', (e) => {
        this.logger.error(`请求失败: ${e.message}`);
        resolve(null);
      });

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  clearToken(): void {
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }
}
