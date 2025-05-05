/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // Optimizes for deployment platforms
  experimental: {
    serverComponentsExternalPackages: ["bcrypt"], // Handle packages that need native dependencies
    // Add the temp directory to the output file tracing to include it in the build
    outputFileTracingExcludes: {
      "*": [
        "node_modules/@swc/core-linux-x64-gnu",
        "node_modules/@swc/core-linux-x64-musl",
        "node_modules/@esbuild/linux-x64",
      ],
    },
    outputFileTracingIncludes: {
      "*": ["temp/**/*"],
    },
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix for the canvas module which is used by pdfjs-dist
    if (!isServer) {
      // We're in the browser build, so we need to ignore the canvas module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

    return config;
  },
  // Enable output file tracing
  outputFileTracing: true,
};

module.exports = nextConfig;

// Check the current configuration
