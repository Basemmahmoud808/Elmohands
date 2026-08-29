import * as Sentry from '@sentry/nextjs';

export function register() {
  Sentry.init({
    dsn: 'https://609c4584a9ccbb231fb13fb886b92b7d@o4511859034882048.ingest.de.sentry.io/4511859038224464',
    tracesSampleRate: 1.0,
  });
}
