import { matchRoutes } from 'react-router-dom';
import siteData from 'react-ssg:site-data';
import { routes } from 'react-ssg:routes';
import { PageData } from 'shared/types';
import { Layout } from '../theme-default';

export function App() {
  console.log('站点数据', siteData);
  return <Layout />;
}

export async function initPageData(routePath: string): Promise<PageData> {
  const matchedRoutes = matchRoutes(routes, routePath);
  if (matchedRoutes) {
    const moduleInfo = await matchedRoutes[0].route.preload();
    return {
      pageType: 'doc',
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath
    };
  }
  return {
    pageType: '404',
    siteData,
    frontmatter: {},
    pagePath: routePath
  };
}
