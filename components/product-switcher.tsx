// components/product-switcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Product {
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

interface ProductSwitcherProps {
  currentProduct: string;
  products: Product[];
}

export function ProductSwitcher({ currentProduct, products }: ProductSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const current = products.find(p => p.slug === currentProduct);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductChange = (productSlug: string) => {
    // Navigate to the same relative path in the new product, or to product home
    const currentPath = pathname.replace(`/docs/${currentProduct}`, '');
    const newPath = currentPath ? `/docs/${productSlug}${currentPath}` : `/docs/${productSlug}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="product-switcher-trigger"
      >
        <div className="product-switcher-content">
          <div className="product-switcher-icon">
            <span>{current?.icon || current?.name.charAt(0)}</span>
          </div>
          <div className="product-switcher-text">
            <span className="product-switcher-name">{current?.name}</span>
          </div>
        </div>
        <svg
          className={`product-switcher-chevron ${isOpen ? 'rotate' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="product-switcher-dropdown">
          {products.map((product) => (
            <button
              key={product.slug}
              onClick={() => handleProductChange(product.slug)}
              className={`product-switcher-item ${product.slug === currentProduct ? 'active' : ''}`}
            >
              <div className="product-switcher-icon">
                <span>{product.icon || product.name.charAt(0)}</span>
              </div>
              <div className="product-switcher-item-text">
                <span className="product-switcher-item-name">{product.name}</span>
                <span className="product-switcher-item-desc">{product.description}</span>
              </div>
              {product.slug === currentProduct && (
                <svg className="product-switcher-check" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
          
          <div className="product-switcher-divider">
            <button
              onClick={() => {
                router.push('/');
                setIsOpen(false);
              }}
              className="product-switcher-all"
            >
              <svg className="product-switcher-all-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>View all products</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .product-switcher-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border, #e2e8f0);
          background-color: var(--background, #ffffff);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        :global([data-theme="dark"]) .product-switcher-trigger {
          background-color: var(--muted, #1e293b);
          border-color: var(--border, #334155);
        }
        
        .product-switcher-trigger:hover {
          background-color: var(--muted, #f1f5f9);
        }
        
        :global([data-theme="dark"]) .product-switcher-trigger:hover {
          background-color: var(--border, #334155);
        }

        .product-switcher-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
          min-width: 0;
        }

        .product-switcher-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          background-color: rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.875rem;
        }

        .product-switcher-text {
          overflow: hidden;
          text-align: left;
        }

        .product-switcher-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--foreground, #0f172a);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        :global([data-theme="dark"]) .product-switcher-name {
          color: var(--foreground, #f8fafc);
        }

        .product-switcher-chevron {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
          margin-left: 0.5rem;
          color: var(--muted-foreground, #64748b);
          transition: transform 0.2s;
        }

        .product-switcher-chevron.rotate {
          transform: rotate(180deg);
        }

        .product-switcher-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          padding: 0.375rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border, #e2e8f0);
          background-color: var(--background, #ffffff);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
          max-height: 70vh;
          overflow-y: auto;
        }
        
        :global([data-theme="dark"]) .product-switcher-dropdown {
          background-color: var(--muted, #1e293b);
          border-color: var(--border, #334155);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
        }

        .product-switcher-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          border-radius: 0.375rem;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background-color 0.2s;
          text-align: left;
        }

        .product-switcher-item:hover {
          background-color: var(--muted, #f1f5f9);
        }
        
        :global([data-theme="dark"]) .product-switcher-item:hover {
          background-color: var(--border, #334155);
        }

        .product-switcher-item.active {
          background-color: var(--muted, #f1f5f9);
        }
        
        :global([data-theme="dark"]) .product-switcher-item.active {
          background-color: var(--border, #334155);
        }

        .product-switcher-item-text {
          flex: 1;
          overflow: hidden;
          min-width: 0;
        }

        .product-switcher-item-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--foreground, #0f172a);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        :global([data-theme="dark"]) .product-switcher-item-name {
          color: var(--foreground, #f8fafc);
        }

        .product-switcher-item-desc {
          font-size: 0.75rem;
          color: var(--muted-foreground, #64748b);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-switcher-check {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
          color: var(--primary-purple, #8b5cf6);
        }

        .product-switcher-divider {
          border-top: 1px solid var(--border, #e2e8f0);
          margin-top: 0.375rem;
          padding-top: 0.375rem;
        }
        
        :global([data-theme="dark"]) .product-switcher-divider {
          border-color: var(--border, #334155);
        }

        .product-switcher-all {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          border-radius: 0.375rem;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background-color 0.2s;
          color: var(--muted-foreground, #64748b);
          font-size: 0.875rem;
        }

        .product-switcher-all:hover {
          background-color: var(--muted, #f1f5f9);
        }
        
        :global([data-theme="dark"]) .product-switcher-all:hover {
          background-color: var(--border, #334155);
        }

        .product-switcher-all-icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default ProductSwitcher;
