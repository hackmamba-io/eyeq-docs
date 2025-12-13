// Product definitions for the EyeQ documentation portal
export interface Product {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  category: 'image' | 'video' | 'cloud';
  platforms?: string[];
  status?: 'stable' | 'beta' | 'coming-soon';
}

export const products: Product[] = [
  {
    name: 'Perfectly Clear SDK',
    slug: 'pfc-sdk',
    description: 'Full-featured image correction for desktop and server applications',
    icon: '📷',
    color: 'blue',
    category: 'image',
    platforms: ['C/C++', '.NET', 'iOS', 'Android'],
    status: 'stable',
  },
  {
    name: 'Video SDK',
    slug: 'video-sdk',
    description: 'Real-time video correction for mobile applications',
    icon: '🎬',
    color: 'purple',
    category: 'video',
    platforms: ['iOS', 'Android'],
    status: 'stable',
  },
  {
    name: 'Video CLI',
    slug: 'video-cli',
    description: 'Command-line video processing for batch workflows',
    icon: '⌨️',
    color: 'green',
    category: 'video',
    platforms: ['Windows', 'macOS', 'Linux'],
    status: 'stable',
  },
  {
    name: 'Web API',
    slug: 'web-api',
    description: 'REST API for cloud-based image correction',
    icon: '☁️',
    color: 'orange',
    category: 'cloud',
    platforms: ['REST', 'Webhooks'],
    status: 'stable',
  },
  {
    name: 'Browser SDK',
    slug: 'browser-sdk',
    description: 'Client-side image correction using WebAssembly',
    icon: '🌐',
    color: 'cyan',
    category: 'cloud',
    platforms: ['JavaScript', 'WebAssembly'],
    status: 'stable',
  },
];

export const productCategories = [
  {
    name: 'Image Processing',
    slug: 'image',
    description: 'SDKs for photo correction in native applications',
  },
  {
    name: 'Video Processing', 
    slug: 'video',
    description: 'Tools for video enhancement and batch processing',
  },
  {
    name: 'Cloud & Web',
    slug: 'cloud',
    description: 'APIs and SDKs for web-based image correction',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
