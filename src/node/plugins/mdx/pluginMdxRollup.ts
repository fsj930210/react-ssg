import pluginMdx from '@mdx-js/rollup';
import type { Plugin } from 'vite';
import remarkPluginGFM from 'remark-gfm';
import rehypePluginAutolinkHeadings from 'rehype-autolink-headings';
import rehypePluginSlug from 'rehype-slug';
import remarkPluginMDXFrontMatter from 'remark-mdx-frontmatter';
import remarkPluginFrontmatter from 'remark-frontmatter';
import { rehypePluginPreWrapper } from './rehypePlugins/preWrapper';
import { rehypePluginShiki } from './rehypePlugins/shiki';
import shiki from 'shiki';
import { remarkPluginToc } from './remarkPlugins/toc';

export async function pluginMdxRollup(): Promise<Plugin> {
  return pluginMdx({
    remarkPlugins: [
      remarkPluginGFM,
      remarkPluginToc,
      remarkPluginFrontmatter,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [remarkPluginMDXFrontMatter, { name: 'frontmatter' }]
    ],
    rehypePlugins: [
      rehypePluginSlug,
      rehypePluginPreWrapper,
      [rehypePluginShiki, { highlighter: await shiki.getHighlighter({ theme: 'nord' }) }],
      [
        rehypePluginAutolinkHeadings,
        {
          properties: {
            class: 'header-anchor'
          },
          content: {
            type: 'text',
            value: '#'
          }
        }
      ]
    ]
  }) as unknown as Plugin;
}
