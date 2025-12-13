import { pfcSdk, videoSdk, videoCli, webApi, browserSdk } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { products } from './products';

// Create loaders for each product
export const pfcSdkSource = loader({
  baseUrl: '/docs/pfc-sdk',
  source: pfcSdk.toFumadocsSource(),
});

export const videoSdkSource = loader({
  baseUrl: '/docs/video-sdk',
  source: videoSdk.toFumadocsSource(),
});

export const videoCliSource = loader({
  baseUrl: '/docs/video-cli',
  source: videoCli.toFumadocsSource(),
});

export const webApiSource = loader({
  baseUrl: '/docs/web-api',
  source: webApi.toFumadocsSource(),
});

export const browserSdkSource = loader({
  baseUrl: '/docs/browser-sdk',
  source: browserSdk.toFumadocsSource(),
});

// Map of product slugs to their sources
const sourceMap: Record<string, ReturnType<typeof loader>> = {
  'pfc-sdk': pfcSdkSource,
  'video-sdk': videoSdkSource,
  'video-cli': videoCliSource,
  'web-api': webApiSource,
  'browser-sdk': browserSdkSource,
};

// Helper to get source by product slug
export function getSourceByProduct(product: string) {
  return sourceMap[product];
}

// Get all valid product slugs
export function getProductSlugs(): string[] {
  return Object.keys(sourceMap);
}

// Re-export products for convenience
export { products };
