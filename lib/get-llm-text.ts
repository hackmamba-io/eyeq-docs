// Generic page type for LLM text generation
interface LLMPage {
  url: string;
  data: {
    title?: string;
    getText?: (type: 'raw' | 'processed') => Promise<string>;
  };
}

export async function getLLMText(page: LLMPage) {
  const title = page.data.title || 'Untitled';
  
  // Check if getText method exists (it may not in all configurations)
  if (typeof page.data.getText === 'function') {
    try {
      const processed = await page.data.getText("processed");
      return `# ${title} (${page.url})

${processed}`;
    } catch {
      // Fall back to just title and URL if getText fails
      return `# ${title} (${page.url})`;
    }
  }
  
  // Fallback if getText is not available
  return `# ${title} (${page.url})`;
}
