#!/usr/bin/env node
/**
 * Generates a VAPID keypair for Web Push. Run once before deploying.
 *
 *   node scripts/generate-vapid-keys.mjs
 *
 * Paste the printed values into Netlify env vars:
 *
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  (exposed to the browser — fine)
 *   VAPID_PRIVATE_KEY             (server-only — keep secret)
 *   VAPID_CONTACT                 (mailto: address or URL for push servers)
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log('VAPID_CONTACT=mailto:you@example.com');
console.log("");
console.log("Add these to Netlify -> Site settings -> Environment variables.");
