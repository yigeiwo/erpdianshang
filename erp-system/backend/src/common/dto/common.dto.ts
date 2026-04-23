export class PaginationDto<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;

  static success<T>(data?: T, message = 'success'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
    };
  }

  static error(code: number, message: string, errors?: any[]): ApiResponse {
    return {
      code,
      message,
    };
  }
}

export class PageQueryDto {
  page: number = 1;
  pageSize: number = 10;
}
