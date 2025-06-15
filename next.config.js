/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");

const nextConfig = {
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
          },
        ],
        destination:
          "/api/auth/callback/epita?code=:code&state=:state&session_state=:session_state",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);
