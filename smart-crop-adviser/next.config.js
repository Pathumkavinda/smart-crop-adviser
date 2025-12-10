/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static HTML export output when you want to host on GitHub Pages
  output: "export",

  // If you use next/image and want to avoid image optimization issues with export:
  images: {
    unoptimized: true,
  },

  // If your site will be served under a repo subpath (e.g. https://username.github.io/repo-name),
  // set basePath and assetPrefix. Uncomment and set your repo path if needed:
  // basePath: "/REPO_NAME",
  // assetPrefix: "/REPO_NAME/",
};

module.exports = nextConfig;

