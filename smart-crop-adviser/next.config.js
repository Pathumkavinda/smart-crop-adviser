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

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Skip dynamic routes during static generation
  trailingSlash: true,
}

module.exports = nextConfig
