/* eslint-disable @typescript-eslint/no-explicit-any -- http-proxy's Server/IncomingMessage types aren't worth pulling in for this dev-only cookie rewrite. */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const proxyBase = {
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: { '*': '' },
    cookiePathRewrite: { '*': '/' },

    configure: (proxy: any) => {
      proxy.on('proxyRes', (proxyRes: any) => {
        const sc = proxyRes.headers['set-cookie'];
        if (sc) {
          proxyRes.headers['set-cookie'] = (Array.isArray(sc) ? sc : [sc]).map(
            (c) => c.replace(/;\s*Secure/gi, ''),
          );
        }
      });
    },
  };

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    server: {
      proxy: {
        // When VITE_GATEWAY_URL_LOCAL is set locally, route auth-service to that target.
        // In all other environments this block is absent and auth falls through to /api.
        ...(env.VITE_GATEWAY_URL_LOCAL
          ? {
              '/api/v1/auth-service': {
                target: env.VITE_GATEWAY_URL_LOCAL,
                ...proxyBase,
              },
            }
          : {}),
        '/api': {
          target: env.VITE_GATEWAY_URL,
          ...proxyBase,
        },
      },
    },
  };
});
