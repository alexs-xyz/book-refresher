import type { ZodSchema } from 'zod';

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string, schema: ZodSchema<T>): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'GET'
    });

    const json = await response.json();
    return schema.parse(json);
  }

  async post<TRequest extends object, TResponse>(
    path: string,
    body: TRequest,
    schema: ZodSchema<TResponse>
  ): Promise<TResponse> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    return schema.parse(json);
  }
}
