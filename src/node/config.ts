import { resolve } from 'node:path';
import fs from 'fs-extra';
import { loadConfigFromFile } from 'vite';
import { SiteConfig, UserConfig } from 'shared/types';

type RawConfig = UserConfig | Promise<UserConfig> | (() => UserConfig | Promise<UserConfig>);

export function defineConfig(config: UserConfig) {
  return config;
}
export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
) {
  // 1. 获取配置文件
  const configPath = getUserConfigPath(root);
  // 2. 读取配置文件内容
  const result = await loadConfigFromFile(
    {
      command,
      mode
    },
    configPath,
    root
  );

  if (result) {
    const { config: rawConfig = {} as RawConfig } = result;
    // 三种情况
    // 1 object 2. promise 3. function
    const userConfig = await (typeof rawConfig === 'function' ? rawConfig() : rawConfig);
    return [configPath, userConfig] as const;
  } else {
    return [configPath, {} as UserConfig] as const;
  }
}

function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ['config.ts', 'config.js'];
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync);
    return configPath;
  } catch (error) {
    console.error(`Failed to load user config: ${error}`);
    throw error;
  }
}

export function resolveSiteData(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || 'react-ssg',
    description: userConfig.description || 'SSG Framework',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {}
  };
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
): Promise<SiteConfig> {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode);
  const siteConfig: SiteConfig = {
    root,
    configPath: configPath,
    base: userConfig.base,
    siteData: resolveSiteData(userConfig as UserConfig)
  };
  return siteConfig;
}
