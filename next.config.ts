import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The copy deck pins canonical to "https://nova.example.com/" — with the
  // trailing slash. Next's metadata resolver collapses a root URL down to its
  // origin unless trailing slashes are enabled, so this keeps canonical and
  // og:url byte-identical to 05-COPY-DECK.
  trailingSlash: true,
};

export default nextConfig;
