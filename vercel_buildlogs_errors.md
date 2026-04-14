23:15:16.546 Running build in Washington, D.C., USA (East) – iad1
23:15:16.547 Build machine configuration: 2 cores, 8 GB
23:15:16.665 Cloning github.com/Siyeolryu/Fieldmanageros (Branch: db, Commit: f0f0cb0)
23:15:16.666 Previous build caches not available.
23:15:16.911 Cloning completed: 246.000ms
23:15:17.243 Running "vercel build"
23:15:18.051 Vercel CLI 50.43.0
23:15:18.316 Warning: Detected "engines": { "node": ">=18.0.0" } in your `package.json` that will automatically upgrade when a new major Node.js Version is released. Learn More: https://vercel.link/node-version
23:15:18.328 Running "install" command: `npm ci`...
23:15:30.825 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
23:15:34.848 
23:15:34.849 > nomu-pro@1.0.0 postinstall
23:15:34.849 > prisma generate
23:15:34.849 
23:15:35.315 Environment variables loaded from .env
23:15:35.318 Prisma schema loaded from prisma/schema.prisma
23:15:35.778 
23:15:35.779 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 161ms
23:15:35.780 
23:15:35.780 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
23:15:35.781 
23:15:35.781 Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse
23:15:35.781 
23:15:35.981 
23:15:35.982 added 112 packages, and audited 113 packages in 17s
23:15:35.982 
23:15:35.983 12 packages are looking for funding
23:15:35.983   run `npm fund` for details
23:15:36.090 
23:15:36.091 3 vulnerabilities (2 high, 1 critical)
23:15:36.091 
23:15:36.091 To address issues that do not require attention, run:
23:15:36.091   npm audit fix
23:15:36.091 
23:15:36.092 To address all issues possible, run:
23:15:36.092   npm audit fix --force
23:15:36.092 
23:15:36.092 Some issues need review, and may require choosing
23:15:36.092 a different dependency.
23:15:36.092 
23:15:36.093 Run `npm audit` for details.
23:15:36.156 Detected Next.js version: 15.1.6
23:15:36.158 Running "npm run build"
23:15:36.265 
23:15:36.265 > nomu-pro@1.0.0 build
23:15:36.265 > next build
23:15:36.265 
23:15:36.858 Attention: Next.js now collects completely anonymous telemetry regarding usage.
23:15:36.858 This information is used to shape Next.js' roadmap and prioritize features.
23:15:36.859 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
23:15:36.859 https://nextjs.org/telemetry
23:15:36.859 
23:15:36.922    ▲ Next.js 15.1.6
23:15:36.923    - Environments: .env
23:15:36.923    - Experiments (use with caution):
23:15:36.923      · typedRoutes
23:15:36.923 
23:15:36.940    Creating an optimized production build ...
23:15:44.843 Failed to compile.
23:15:44.843 
23:15:44.844 app/layout.tsx
23:15:44.844 An error occurred in `next/font`.
23:15:44.844 
23:15:44.844 Error: Cannot find module '@tailwindcss/postcss'
23:15:44.844 Require stack:
23:15:44.844 - /vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js
23:15:44.845 - /vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/index.js
23:15:44.845 - /vercel/path0/node_modules/next/dist/build/webpack/config/index.js
23:15:44.845 - /vercel/path0/node_modules/next/dist/build/webpack-config.js
23:15:44.845 - /vercel/path0/node_modules/next/dist/build/webpack-build/impl.js
23:15:44.845 - /vercel/path0/node_modules/next/dist/compiled/jest-worker/processChild.js
23:15:44.845     at Module.<anonymous> (node:internal/modules/cjs/loader:1456:15)
23:15:44.845     at /vercel/path0/node_modules/next/dist/server/require-hook.js:55:36
23:15:44.845     at require.resolve (node:internal/modules/helpers:163:19)
23:15:44.845     at loadPlugin (/vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:49:32)
23:15:44.846     at /vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:56
23:15:44.846     at Array.map (<anonymous>)
23:15:44.846     at getPostCssPlugins (/vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:47)
23:15:44.851     at async /vercel/path0/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
23:15:44.852     at async /vercel/path0/node_modules/next/dist/build/webpack/loaders/next-font-loader/index.js:86:33
23:15:44.852     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:153:20)
23:15:44.852 
23:15:44.852 ./app/auth/login/page.tsx
23:15:44.852 Module not found: Can't resolve '@/lib/supabase/client'
23:15:44.852 
23:15:44.852 https://nextjs.org/docs/messages/module-not-found
23:15:44.852 
23:15:44.853 ./app/auth/signup/page.tsx
23:15:44.853 Module not found: Can't resolve '@/lib/supabase/client'
23:15:44.853 
23:15:44.854 https://nextjs.org/docs/messages/module-not-found
23:15:44.854 
23:15:44.855 ./app/companies/page.tsx
23:15:44.855 Module not found: Can't resolve '@/lib/supabase/client'
23:15:44.855 
23:15:44.855 https://nextjs.org/docs/messages/module-not-found
23:15:44.855 
23:15:44.856 ./app/components/companies/DeleteCompanyButton.tsx
23:15:44.856 Module not found: Can't resolve '../../ui/Button'
23:15:44.856 
23:15:44.856 https://nextjs.org/docs/messages/module-not-found
23:15:44.856 
23:15:44.857 
23:15:44.857 > Build failed because of webpack errors
23:15:44.882 Error: Command "npm run build" exited with 1