import { Bookmark, BookmarkNode, BookmarkType, HierarchyParams } from '../types/bookmark';

export function createHierarchy(bookmarks: Bookmark[], params: HierarchyParams): BookmarkNode {
  const { verticalComplexity, horizontalComplexity } = params;
  
  const typeGroups = groupBookmarksByType(bookmarks);
  const rootNode: BookmarkNode = {
    name: 'Bookmarks',
    type: 'folder',
    children: []
  };
  
  const typeEntries = Object.entries(typeGroups);
  
  if (typeEntries.length <= horizontalComplexity) {
    typeEntries.forEach(([type, typeBookmarks]) => {
      if (typeBookmarks.length > 0) {
        const typeNode = createBranch(type, typeBookmarks, verticalComplexity - 1, horizontalComplexity);
        rootNode.children!.push(typeNode);
      }
    });
  } else {
    const mainTypes = typeEntries
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, horizontalComplexity - 1);
    
    const otherBookmarks = typeEntries
      .slice(horizontalComplexity - 1)
      .flatMap(([_, bookmarks]) => bookmarks);
    
    mainTypes.forEach(([type, typeBookmarks]) => {
      const typeNode = createBranch(type, typeBookmarks, verticalComplexity - 1, horizontalComplexity);
      rootNode.children!.push(typeNode);
    });
    
    if (otherBookmarks.length > 0) {
      const otherNode = createBranch('Autres ressources', otherBookmarks, verticalComplexity - 1, horizontalComplexity);
      rootNode.children!.push(otherNode);
    }
  }
  
  return rootNode;
}

function createBranch(name: string, bookmarks: Bookmark[], remainingDepth: number, horizontalComplexity: number): BookmarkNode {
  const node: BookmarkNode = {
    name: `${name} (${bookmarks.length})`,
    type: 'folder',
    children: [],
    count: bookmarks.length
  };
  
  if (remainingDepth <= 0 || bookmarks.length <= horizontalComplexity) {
    bookmarks.forEach(bookmark => {
      node.children!.push({
        name: bookmark.title,
        type: 'bookmark',
        bookmark
      });
    });
    return node;
  }
  
  const subGroups = createSubGroups(bookmarks, horizontalComplexity);
  
  subGroups.forEach(group => {
    const subNode = createBranch(group.name, group.bookmarks, remainingDepth - 1, horizontalComplexity);
    node.children!.push(subNode);
  });
  
  return node;
}

function createSubGroups(bookmarks: Bookmark[], maxGroups: number): { name: string, bookmarks: Bookmark[] }[] {
  const domainGroups = groupBookmarksByDomain(bookmarks);
  const keywordGroups = groupBookmarksByKeywords(bookmarks);
  
  const groups: { name: string, bookmarks: Bookmark[] }[] = [];
  
  const dominantDomains = Object.entries(domainGroups)
    .filter(([_, bookmarks]) => bookmarks.length >= Math.max(2, Math.ceil(bookmarks.length * 0.15)))
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, Math.floor(maxGroups * 0.6));
  
  dominantDomains.forEach(([domain, domainBookmarks]) => {
    const cleanDomain = domain.replace('www.', '');
    groups.push({
      name: generateFolderName(cleanDomain, domainBookmarks),
      bookmarks: domainBookmarks
    });
  });
  
  const usedBookmarks = new Set(dominantDomains.flatMap(([_, bookmarks]) => bookmarks));
  const remainingBookmarks = bookmarks.filter(b => !usedBookmarks.has(b));
  
  if (remainingBookmarks.length > 0 && groups.length < maxGroups) {
    const remainingGroups = Math.min(maxGroups - groups.length, 3);
    const keywordGroupEntries = Object.entries(keywordGroups)
      .filter(([_, bookmarks]) => bookmarks.some(b => remainingBookmarks.includes(b)))
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, remainingGroups);
    
    keywordGroupEntries.forEach(([keyword, keywordBookmarks]) => {
      const filteredBookmarks = keywordBookmarks.filter(b => remainingBookmarks.includes(b));
      if (filteredBookmarks.length >= 2) {
        groups.push({
          name: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} (${filteredBookmarks.length})`,
          bookmarks: filteredBookmarks
        });
        filteredBookmarks.forEach(b => usedBookmarks.add(b));
      }
    });
  }
  
  const finalRemainingBookmarks = bookmarks.filter(b => !usedBookmarks.has(b));
  if (finalRemainingBookmarks.length > 0) {
    groups.push({
      name: `Divers (${finalRemainingBookmarks.length})`,
      bookmarks: finalRemainingBookmarks
    });
  }
  
  return groups;
}

function groupBookmarksByType(bookmarks: Bookmark[]): Record<BookmarkType, Bookmark[]> {
  const groups: Record<BookmarkType, Bookmark[]> = {
    'Videos & Multimedia': [],
    'Development & Code': [],
    'Documentation & Help': [],
    'E-commerce & Shopping': [],
    'News & Blog': [],
    'Social Networks': [],
    'Cloud & Storage': [],
    'Tools & Utilities': [],
    'Formation & Learning': [],
    'Various Resources': []
  };
  
  bookmarks.forEach(bookmark => {
    groups[bookmark.type].push(bookmark);
  });
  
  return groups;
}

function groupBookmarksByDomain(bookmarks: Bookmark[]): Record<string, Bookmark[]> {
  const groups: Record<string, Bookmark[]> = {};
  
  bookmarks.forEach(bookmark => {
    const domain = bookmark.domain;
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(bookmark);
  });
  
  return groups;
}

function groupBookmarksByKeywords(bookmarks: Bookmark[]): Record<string, Bookmark[]> {
  const keywordCounts: Record<string, Bookmark[]> = {};
  
  bookmarks.forEach(bookmark => {
    bookmark.keywords.forEach(keyword => {
      if (!keywordCounts[keyword]) {
        keywordCounts[keyword] = [];
      }
      keywordCounts[keyword].push(bookmark);
    });
  });
  
  return Object.fromEntries(
    Object.entries(keywordCounts)
      .filter(([_, bookmarks]) => bookmarks.length >= 2)
  );
}

export function generateFolderName(identifier: string, bookmarks: Bookmark[]): string {
  const count = bookmarks.length;
  
  if (identifier.includes('.')) {
    const siteName = identifier.split('.')[0];
    return `${siteName.charAt(0).toUpperCase() + siteName.slice(1)} - ${count} liens`;
  }
  
  return `${identifier.charAt(0).toUpperCase() + identifier.slice(1)} - ${count} ressources`;
}