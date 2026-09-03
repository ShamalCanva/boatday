/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // lib/trips.ts reads data/trips/*.json off disk at request time (there's
  // no database — trip files are the database). Vercel's build only bundles
  // files it can trace static imports to, and a dynamic fs.readdirSync/
  // readFileSync isn't one of those, so without this the folder would be
  // missing from the deployed function and every trip lookup would 404.
  outputFileTracingIncludes: {
    "/**": ["./data/trips/**/*.json"],
  },
};

export default nextConfig;
