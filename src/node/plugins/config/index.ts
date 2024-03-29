import { relative, join } from 'node:path';
import fs from 'fs-extra';
import { Plugin } from 'vite';
import { SiteConfig } from 'shared/types';
import sirv from 'sirv';
import { PACKAGE_ROOT, PUBLIC_DIR } from '../../constants';

const SITE_DATA_ID = 'react-ssg:site-data';

export function pluginConfig(config: SiteConfig, restartServer?: () => Promise<void>): Plugin {
  return {
    name: 'react-ssg:config',
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        return '\0' + SITE_DATA_ID;
      }
    },
    load(id) {
      if (id === '\0' + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`;
      }
    },
    async handleHotUpdate(ctx) {
      const customWatchedFiles = [config.configPath];
      const include = (id: string) => customWatchedFiles.some((file) => id.includes(file));

      if (include(ctx.file)) {
        console.log(`\n${relative(config.root, ctx.file)} changed, restarting server...`);
        // 重点: 重启 Dev Server
        // 重启 Dev Server
        // 方案讨论:
        // 1. 插件内重启 Vite 的 dev server
        // await server.restart();
        // ❌ 没有作用，因为并没有进行 react-ssg 框架配置的重新读取
        // 2. 手动调用 dev.ts 中的 createServer
        // 然后每次 import 新的产物
        // ✅ 可行
        await restartServer?.();
      }
    },
    config() {
      return {
        root: PACKAGE_ROOT,
        resolve: {
          alias: {
            '@runtime': join(PACKAGE_ROOT, 'src', 'runtime', 'index.ts')
          }
        },
        css: {
          modules: {
            localsConvention: 'camelCaseOnly'
          }
        }
      };
    },
    configureServer(server) {
      const publicDir = join(config.root, PUBLIC_DIR);
      if (fs.pathExistsSync(publicDir)) {
        server.middlewares.use(sirv(publicDir));
      }
    }
  };
}
