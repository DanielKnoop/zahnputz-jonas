// scripts/send-elmex-push.mjs
import webpush from 'web-push';
import { shouldSendNow } from './push-guard.js';

const force = process.argv.includes('--force');
if (!force && !shouldSendNow(new Date())) {
  console.log('Nicht der Sendezeitpunkt (Berlin != So 19:30). Überspringe.');
  process.exit(0);
}

const pub = process.env.VAPID_PUBLIC_KEY;
const priv = process.env.VAPID_PRIVATE_KEY;
const sub = process.env.PUSH_SUBSCRIPTION;
if (!pub || !priv || !sub) {
  console.error('Fehlende Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION.');
  process.exit(1);
}

webpush.setVapidDetails('mailto:daniel.knoop@mum.de', pub, priv);

const payload = JSON.stringify({
  title: 'Beim Teutates — elmex-Tag!',
  body: 'Heute ist Sonntag, Jonas: elmex gelée nicht vergessen! 🛡️',
});

try {
  await webpush.sendNotification(JSON.parse(sub), payload);
  console.log('elmex-Push gesendet.');
} catch (e) {
  console.error('Senden fehlgeschlagen:', e.statusCode, e.body || e.message);
  process.exit(1);
}
