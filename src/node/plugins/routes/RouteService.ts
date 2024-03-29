import path from 'node:path';
import fastGlob from 'fast-glob';
import { normalizePath } from 'vite';

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #scanDir: string;
  #routeData: RouteMeta[] = [];
  constructor(scanDir: string) {
    this.#scanDir = scanDir;
  }

  async init() {
    const files = fastGlob
      .sync(['**/*.{js,jsx,ts,tsx,md,mdx}'], {
        cwd: this.#scanDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/build/**', 'config.ts']
      })
      .sort();
    files.forEach((file) => {
      const fileRelativePath = normalizePath(path.relative(this.#scanDir, file));
      // 1. 路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);
      // 2. 文件绝对路径
      this.#routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }
  static getRoutePathFromFile(filePath: string, root: string): string | undefined {
    const fileRelativePath = path.relative(root, filePath);
    const routePath = RouteService.normalizeRoutePath(fileRelativePath);
    return routePath;
  }

  static normalizeRoutePath(rawPath: string) {
    const routePath = rawPath
      .replace(/\.(.*)?$/, '')
      .replace(/index$/, '')
      .replaceAll('\\', '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }

  // 获取路由数据，方便测试
  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }
  generateRoutesCode(ssr = false) {
    return `
import React from 'react';
${ssr ? '' : 'import loadable from "@loadable/component";'}
${this.#routeData
  .map((route, index) => {
    return ssr
      ? `import Route${index} from "${route.absolutePath}";`
      : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
  })
  .join('\n')}
export const routes = [
  ${this.#routeData
    .map((route, index) => {
      return `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}')}`;
      // return `{ path: '${route.routePath}', element: React.createElement(Route${index}) }`;
    })
    .join(',\n')}
];
`;
  }
}
