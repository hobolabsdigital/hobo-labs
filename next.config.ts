import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.0.0.13", "10.0.0.14"],

  images: {
    // 90 is for work screenshots and comic art, where q75 visibly smears line work.
    qualities: [75, 90],
    // Showreel posters live in Emile's Higgsfield storage.
    remotePatterns: [new URL("https://d2ol7oe51mr4n9.cloudfront.net/user_3Eqykldhtmuqrb56bPCwGP0px9L/**")],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Deliberately minimal CSP: framing/base/form protections only.
          // A strict script-src lockdown is a project of its own — Next.js relies on
          // inline scripts (hydration, RSC payloads) which would require a full
          // nonce/hash pipeline. Do not add script-src here without that work.
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
