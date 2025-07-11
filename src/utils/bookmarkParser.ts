import { Bookmark, BookmarkType } from '../types/bookmark';

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that',
  'these', 'those', 'it', 'its', 'they', 'them', 'their', 'you', 'your', 'we', 'our', 'us'
]);

const TYPE_PATTERNS: Record<BookmarkType, { domains: string[], keywords: string[] }> = {
  'Videos & Multimedia': {
    domains: ['youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv', 'netflix.com', 'amazon.com/prime'],
    keywords: ['video', 'film', 'movie', 'streaming', 'watch', 'multimedia', 'cinema']
  },
  'Development & Code': {
    domains: ['github.com', 'gitlab.com', 'bitbucket.org', 'codepen.io', 'jsfiddle.net', 'replit.com'],
    keywords: ['code', 'programming', 'development', 'git', 'api', 'framework', 'library', 'dev']
  },
  'Documentation & Help': {
    domains: ['stackoverflow.com', 'docs.', 'documentation', 'help.', 'support.', 'wiki'],
    keywords: ['documentation', 'docs', 'help', 'tutorial', 'guide', 'reference', 'manual', 'how-to']
  },
  'E-commerce & Shopping': {
    domains: ['amazon.', 'ebay.', 'shopify.', 'etsy.com', 'alibaba.', 'aliexpress.'],
    keywords: ['shop', 'store', 'buy', 'sell', 'price', 'product', 'cart', 'commerce', 'shopping']
  },
  'News & Blog': {
    domains: ['news', 'blog', 'medium.com', 'wordpress.', 'blogger.', 'substack.'],
    keywords: ['news', 'blog', 'article', 'post', 'actualité', 'information', 'journal', 'magazine']
  },
  'Social Networks': {
    domains: ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'tiktok.com', 'reddit.com'],
    keywords: ['social', 'network', 'share', 'post', 'follow', 'friend', 'community', 'réseau']
  },
  'Cloud & Storage': {
    domains: ['drive.google.com', 'dropbox.com', 'onedrive.', 'icloud.com', 'box.com'],
    keywords: ['cloud', 'storage', 'drive', 'sync', 'backup', 'file', 'share', 'stockage']
  },
  'Tools & Utilities': {
    domains: ['tools.', 'util', 'app.', 'chrome.google.com/webstore'],
    keywords: ['tool', 'utility', 'app', 'service', 'generator', 'converter', 'calculator', 'outil']
  },
  'Formation & Learning': {
    domains: ['udemy.com', 'coursera.org', 'edx.org', 'khan', 'pluralsight.com', 'lynda.com'],
    keywords: ['course', 'learn', 'education', 'training', 'tutorial', 'formation', 'cours', 'école']
  },
  'Various Resources': {
    domains: [],
    keywords: []
  }
};

export function parseBookmarksHTML(htmlContent: string): Bookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const bookmarks: Bookmark[] = [];
  
  const bookmarkLinks = doc.querySelectorAll('a[href]');
  
  bookmarkLinks.forEach(link => {
    const url = link.getAttribute('href');
    const title = link.textContent?.trim();
    
    if (url && title && url.startsWith('http')) {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        const type = analyzeBookmarkType(title, domain);
        const keywords = extractKeywords(title);
        
        bookmarks.push({
          title,
          url,
          type,
          keywords,
          domain
        });
      } catch (error) {
        console.warn(`Invalid URL: ${url}`);
      }
    }
  });
  
  return bookmarks;
}

export function analyzeBookmarkType(title: string, domain: string): BookmarkType {
  const titleLower = title.toLowerCase();
  const domainLower = domain.toLowerCase();
  
  for (const [type, patterns] of Object.entries(TYPE_PATTERNS)) {
    if (type === 'Various Resources') continue;
    
    const domainMatch = patterns.domains.some(pattern => 
      domainLower.includes(pattern.toLowerCase())
    );
    
    const keywordMatch = patterns.keywords.some(keyword => 
      titleLower.includes(keyword.toLowerCase())
    );
    
    if (domainMatch || keywordMatch) {
      return type as BookmarkType;
    }
  }
  
  return 'Various Resources';
}

export function extractKeywords(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word));
  
  return words.slice(0, 3);
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}