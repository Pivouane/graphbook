import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/complete/epita",
        permanent: false,
        has: [
          {
            type: "query",
            key: "code",
          },
          {
            type: "query",
            key: "state",
          },
          {
            type: "query",
            key: "session_state",
          }
        ],
        destination: "/api/auth/callback/epita?code=:code&state=:state&session_state=:session_state",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
