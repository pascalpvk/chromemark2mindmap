/**
 * @fileoverview Types et interfaces pour la gestion des bookmarks et leur conversion
 * @author Chrome Bookmark to FreeMind Converter
 * @version 1.0.0
 */

/**
 * Représente un bookmark individuel parsé depuis Chrome
 * @interface Bookmark
 */
export interface Bookmark {
  /** Titre du bookmark tel qu'affiché dans Chrome */
  title: string;
  /** URL complète du bookmark */
  url: string;
  /** Type de contenu détecté automatiquement */
  type: BookmarkType;
  /** Mots-clés extraits du titre (maximum 3) */
  keywords: string[];
  /** Nom de domaine extrait de l'URL */
  domain: string;
}

/**
 * Nœud dans l'arborescence hiérarchique des bookmarks
 * Peut représenter soit un dossier soit un bookmark individuel
 * @interface BookmarkNode
 */
export interface BookmarkNode {
  /** Nom affiché du nœud */
  name: string;
  /** Type de nœud: dossier ou bookmark */
  type: 'folder' | 'bookmark';
  /** Nœuds enfants (uniquement pour les dossiers) */
  children?: BookmarkNode[];
  /** Données du bookmark (uniquement pour les bookmarks) */
  bookmark?: Bookmark;
  /** Nombre d'éléments contenus (uniquement pour les dossiers) */
  count?: number;
}

/**
 * Types de contenu détectés pour la classification automatique
 * Basés sur l'analyse des domaines et mots-clés
 * @type BookmarkType
 */
export type BookmarkType = 
  | 'Videos & Multimedia'     // YouTube, Vimeo, Netflix, etc.
  | 'Development & Code'      // GitHub, GitLab, CodePen, etc.
  | 'Documentation & Help'    // StackOverflow, docs.*, wiki, etc.
  | 'E-commerce & Shopping'   // Amazon, eBay, boutiques en ligne
  | 'News & Blog'            // Sites d'actualités et blogs
  | 'Social Networks'        // Facebook, Twitter, LinkedIn, etc.
  | 'Cloud & Storage'        // Google Drive, Dropbox, OneDrive, etc.
  | 'Tools & Utilities'      // Outils en ligne, convertisseurs, etc.
  | 'Formation & Learning'   // Udemy, Coursera, plateformes éducatives
  | 'Various Resources';     // Catégorie par défaut

/**
 * Paramètres de configuration pour la génération de hiérarchie
 * @interface HierarchyParams
 */
export interface HierarchyParams {
  /** Profondeur maximale de l'arborescence (2-8 niveaux) */
  verticalComplexity: number;
  /** Nombre maximum de branches par niveau (3-15 branches) */
  horizontalComplexity: number;
}

/**
 * Statistiques calculées sur l'ensemble des bookmarks
 * @interface BookmarkStats
 */
export interface BookmarkStats {
  /** Nombre total de bookmarks importés */
  totalBookmarks: number;
  /** Répartition par type de contenu détecté */
  detectedTypes: Record<BookmarkType, number>;
  /** Nombre de domaines uniques */
  uniqueDomains: number;
}