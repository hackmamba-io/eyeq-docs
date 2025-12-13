import { 
  pfcSdkSource, 
  videoSdkSource, 
  videoCliSource, 
  webApiSource, 
  browserSdkSource 
} from "@/lib/source";
import { getLLMText } from "@/lib/get-llm-text";

// cached forever
export const revalidate = false;

export async function GET() {
  // Combine pages from all sources
  const allSources = [
    pfcSdkSource,
    videoSdkSource,
    videoCliSource,
    webApiSource,
    browserSdkSource,
  ];

  const allPages = allSources.flatMap(source => source.getPages());
  
  // Map pages to the format expected by getLLMText
  const scan = allPages.map(page => {
    const llmPage = {
      url: page.url,
      data: {
        title: page.data.title,
        getText: (page.data as any).getText,
      }
    };
    return getLLMText(llmPage);
  });
  
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"));
}
