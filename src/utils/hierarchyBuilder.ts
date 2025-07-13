/**
 * @fileoverview Constructeur de hiérarchie intelligente pour organiser les bookmarks
 * Crée une arborescence équilibrée basée sur les types, domaines et mots-clés
 * @author Chrome Bookmark to FreeMind Converter
 * @version 1.0.0
 */

import { Bookmark, BookmarkNode, BookmarkType, HierarchyParams, ExportOptions } from '../types/bookmark';

/**
 * Crée une hiérarchie intelligente à partir d'une liste de bookmarks
 * Respecte les contraintes de complexité verticale et horizontale
 * 
 * @param {Bookmark[]} bookmarks - Liste des bookmarks à organiser
 * @param {HierarchyParams} params - Paramètres de complexité de la hiérarchie
 * @returns {BookmarkNode} Noeud racine de l'arborescence générée
 * 
 * @example
 * ```typescript
 * const hierarchy = createHierarchy(bookmarks, {
 *   verticalComplexity: 4,
 *   horizontalComplexity: 8
 * });
 * ```
 */
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

/**
 * Crée récursivement une branche de l'arborescence
 * S'arrête quand la profondeur ou le seuil horizontal est atteint
 * 
 * @param {string} name - Nom du noeud/dossier
 * @param {Bookmark[]} bookmarks - Bookmarks à inclure dans cette branche
 * @param {number} remainingDepth - Profondeur restante autorisée
 * @param {number} horizontalComplexity - Nombre max de branches par niveau
 * @returns {BookmarkNode} Noeud de la branche créée
 */
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

/**
 * Crée des sous-groupes intelligents basés sur les domaines et mots-clés
 * Privilégie les domaines dominants puis les mots-clés fréquents
 * 
 * @param {Bookmark[]} bookmarks - Bookmarks à grouper
 * @param {number} maxGroups - Nombre maximum de groupes à créer
 * @returns {{name: string, bookmarks: Bookmark[]}[]} Liste des groupes créés
 */
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

/**
 * Génère un nom de dossier intelligent basé sur l'identifiant et le contenu
 * 
 * @param {string} identifier - Identifiant (domaine ou mot-clé)
 * @param {Bookmark[]} bookmarks - Bookmarks contenus dans ce dossier
 * @returns {string} Nom de dossier généré avec compteur
 * 
 * @example
 * ```typescript
 * generateFolderName('github.com', bookmarks);
 * // Retourne: 'Github - 15 liens'
 * ```
 */
export function generateFolderName(identifier: string, bookmarks: Bookmark[]): string {
  const count = bookmarks.length;
  
  if (identifier.includes('.')) {
    const siteName = identifier.split('.')[0];
    return `${siteName.charAt(0).toUpperCase() + siteName.slice(1)} - ${count} liens`;
  }
  
  return `${identifier.charAt(0).toUpperCase() + identifier.slice(1)} - ${count} ressources`;
}

/**
 * Filtre une hiérarchie selon les options d'export spécifiées
 * Supprime les bookmarks ou dossiers selon les paramètres
 * 
 * @param {BookmarkNode} node - Nœud à filtrer
 * @param {ExportOptions} options - Options de filtrage
 * @returns {BookmarkNode | null} Nœud filtré ou null si supprimé
 * 
 * @example
 * ```typescript
 * const foldersOnly = filterHierarchy(hierarchy, { includeBookmarks: false, includeFolders: true });
 * ```
 */
export function filterHierarchy(node: BookmarkNode, options: ExportOptions): BookmarkNode | null {
  // Filtrer selon le type de nœud
  if (node.type === 'bookmark' && !options.includeBookmarks) {
    return null;
  }
  
  if (node.type === 'folder' && !options.includeFolders) {
    // Si on n'inclut pas les dossiers mais qu'on a des enfants, 
    // on remonte les enfants au niveau supérieur
    if (node.children) {
      const filteredChildren = node.children
        .map(child => filterHierarchy(child, options))
        .filter((child): child is BookmarkNode => child !== null);
      
      // Créer un nœud virtuel pour regrouper les enfants
      if (filteredChildren.length > 0) {
        return {
          name: 'Flattened',
          type: 'folder',
          children: filteredChildren,
          count: filteredChildren.length
        };
      }
    }
    return null;
  }
  
  // Pour les nœuds conservés, filtrer récursivement les enfants
  if (node.children) {
    const filteredChildren = node.children
      .map(child => filterHierarchy(child, options))
      .filter((child): child is BookmarkNode => child !== null);
    
    const filteredNode: BookmarkNode = {
      ...node,
      children: filteredChildren,
      count: filteredChildren.length
    };
    
    // Ne conserver le nœud que s'il a des enfants ou si c'est un bookmark
    if (filteredChildren.length > 0 || node.type === 'bookmark') {
      return filteredNode;
    }
    
    return null;
  }
  
  // Nœud feuille : le conserver tel quel
  return { ...node };
}