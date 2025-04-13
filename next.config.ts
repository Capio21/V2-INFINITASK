module.exports = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
      return [
          {
              source: "/api/:path*",
              headers: [
                  {
                      key: "Access-Control-Allow-Origin",
                      value: "http://127.0.0.1:8000",
                  },
                  {
                      key: "Access-Control-Allow-Credentials",
                      value: "true",
                  },
                  {
                      key: "Access-Control-Allow-Methods",
                      value: "GET, POST, PUT, DELETE, OPTIONS",
                  },
                  {
                      key: "Access-Control-Allow-Headers",
                      value: "Content-Type, Authorization",
                  },
              ],
          },
      ];
  },
};
