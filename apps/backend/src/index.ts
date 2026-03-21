import { buildApp } from './app';

const { app, env } = await buildApp();

try {
  await app.listen({ port: env.port, host: env.host });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
