// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Disable ESLint during builds to allow deployment despite linting errors
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
  
//   // Required for static export to GitHub Pages
//   output: 'export',
  
//   // Skip trailing slashes for better GitHub Pages compatibility
//   trailingSlash: true,
  
//   // Optional: Set base path if your repo isn't at root (e.g., username.github.io/repo-name)
//   // basePath: '/your-repo-name',
  
//   // Optional: Disable image optimization for static export
//   images: {
//     unoptimized: true,
//   },

//   webpack: (config) => {
//     // Treat the specific problematic file as raw text
//     config.module.rules.push({
//       test: /[\\/]src[\\/]app[\\/]home\.module\.css$/,
//       use: [
//         {
//           loader: require.resolve('raw-loader'),
//         },
//       ],
//     });
//     return config;
//   },
// };

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

