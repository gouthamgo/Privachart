import type { Plugin, ResolvedConfig } from 'vite';

export function viteEnvHtmlPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-env-html',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml(html) {
      const env = config.env || {};
      return html
        .replace(/%VITE_ANALYTICS_ENDPOINT%/g, env.VITE_ANALYTICS_ENDPOINT || '')
        .replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, env.VITE_ANALYTICS_WEBSITE_ID || '');
    },
  };
}
