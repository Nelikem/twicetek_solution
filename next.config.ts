import type { NextConfig } from "next";

import { env } from "./lib/env";

const nextConfig: NextConfig = {
  async headers() {
    const supabaseOrigin = new URL(env.supabaseUrl()).origin;

    const csp = [
      "default-src 'self'",
      // Confirmed via the browser verification pass: Next.js 15's App Router
      // injects inline <script> tags itself (streaming/hydration payloads) even
      // in a production build with no third-party scripts involved -- a strict
      // 'self'-only script-src blocks the app from hydrating at all. Fixing this
      // properly needs per-request CSP nonces threaded through middleware into
      // next.config's experimental nonce support, which is a separate, larger
      // change; 'unsafe-inline' here is a known, explicit trade-off for now.
      "script-src 'self' 'unsafe-inline'",
      // Framer Motion writes inline `style="transform:...;opacity:..."` attributes
      // directly to the DOM for its animations -- no per-element CSP nonce hook
      // exists for that, so 'unsafe-inline' here is genuinely unavoidable while
      // framer-motion is used this way. Tailwind v4 ships a static compiled
      // stylesheet (no runtime <style> injection), so it doesn't independently
      // need this.
      "style-src 'self' 'unsafe-inline'",
      // Signed Supabase Storage URLs (organization-logos, business-logos, etc.)
      `img-src 'self' data: ${supabaseOrigin}`,
      // next/font/google self-hosts Geist/Geist Mono at build time -- zero
      // runtime requests to Google font origins, so no external font-src needed.
      "font-src 'self'",
      `connect-src 'self' ${supabaseOrigin}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: csp }] }];
  },
};

export default nextConfig;
