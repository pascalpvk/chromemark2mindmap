export interface Bookmark {
  title: string;
  url: string;
  type: BookmarkType;
  keywords: string[];
  domain: string;
}

export interface BookmarkNode {
  name: string;
  type: 'folder' | 'bookmark';
  children?: BookmarkNode[];
  bookmark?: Bookmark;
  count?: number;
}

export type BookmarkType = 
  | 'Videos & Multimedia'
  | 'Development & Code'
  | 'Documentation & Help'
  | 'E-commerce & Shopping'
  | 'News & Blog'
  | 'Social Networks'
  | 'Cloud & Storage'
  | 'Tools & Utilities'
  | 'Formation & Learning'
  | 'Various Resources';

export interface HierarchyParams {
  verticalComplexity: number;
  horizontalComplexity: number;
}

export interface BookmarkStats {
  totalBookmarks: number;
  detectedTypes: Record<BookmarkType, number>;
  uniqueDomains: number;
}