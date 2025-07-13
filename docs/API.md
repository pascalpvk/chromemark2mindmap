# Documentation API

## Vue d'ensemble

Cette documentation décrit l'API interne de l'application Chrome Bookmarks to FreeMind Converter. Toutes les fonctions sont typées avec TypeScript et documentées avec JSDoc.

## Types de Données

### Interfaces Principales

#### `Bookmark`
Représente un bookmark individuel parsé depuis Chrome.

```typescript
interface Bookmark {
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
```

#### `BookmarkNode`
Nœud dans l'arborescence hiérarchique des bookmarks.

```typescript
interface BookmarkNode {
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
```

#### `BookmarkType`
Types de contenu détectés pour la classification automatique.

```typescript
type BookmarkType = 
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
```

#### `HierarchyParams`
Paramètres de configuration pour la génération de hiérarchie.

```typescript
interface HierarchyParams {
  /** Profondeur maximale de l'arborescence (2-8 niveaux) */
  verticalComplexity: number;
  /** Nombre maximum de branches par niveau (3-15 branches) */
  horizontalComplexity: number;
}
```

#### `ExportOptions`
Options de configuration pour l'export FreeMind.

```typescript
interface ExportOptions {
  /** Inclure les bookmarks individuels dans l'export */
  includeBookmarks: boolean;
  /** Inclure les dossiers dans l'export */
  includeFolders: boolean;
}
```

#### `BookmarkStats`
Statistiques calculées sur l'ensemble des bookmarks.

```typescript
interface BookmarkStats {
  /** Nombre total de bookmarks importés */
  totalBookmarks: number;
  /** Répartition par type de contenu détecté */
  detectedTypes: Record<BookmarkType, number>;
  /** Nombre de domaines uniques */
  uniqueDomains: number;
}
```

## Module: bookmarkParser

### `parseBookmarksHTML(htmlContent: string): Bookmark[]`

Parse un fichier HTML d'export de bookmarks Chrome et extrait tous les bookmarks.

**Paramètres:**
- `htmlContent` (string): Contenu HTML du fichier d'export Chrome

**Retourne:**
- `Bookmark[]`: Liste des bookmarks parsés avec classification automatique

**Exemple:**
```typescript
const htmlContent = await file.text();
const bookmarks = parseBookmarksHTML(htmlContent);
console.log(`${bookmarks.length} bookmarks trouvés`);
```

**Erreurs:**
- Ignore les URLs malformées avec warning console
- Filtre automatiquement les liens non-HTTP

---

### `analyzeBookmarkType(title: string, domain: string): BookmarkType`

Analyse le titre et le domaine d'un bookmark pour déterminer son type de contenu.

**Paramètres:**
- `title` (string): Titre du bookmark
- `domain` (string): Nom de domaine de l'URL

**Retourne:**
- `BookmarkType`: Type de contenu détecté

**Exemple:**
```typescript
const type = analyzeBookmarkType('React Documentation', 'react.dev');
// Retourne: 'Documentation & Help'
```

**Algorithme:**
1. Vérifie correspondance domaine dans patterns
2. Vérifie correspondance mots-clés dans titre
3. Retourne 'Various Resources' si aucune correspondance

---

### `extractKeywords(title: string): string[]`

Extrait les mots-clés significatifs d'un titre de bookmark.

**Paramètres:**
- `title` (string): Titre du bookmark

**Retourne:**
- `string[]`: Liste des mots-clés extraits (max 3)

**Exemple:**
```typescript
const keywords = extractKeywords('React Tutorial for Beginners');
// Retourne: ['react', 'tutorial', 'beginners']
```

**Traitement:**
1. Conversion en minuscules
2. Suppression caractères spéciaux
3. Filtrage mots vides (stop words)
4. Sélection des 3 premiers mots >3 caractères

---

### `getDomainFromUrl(url: string): string`

Extrait le nom de domaine d'une URL.

**Paramètres:**
- `url` (string): URL complète

**Retourne:**
- `string`: Nom de domaine en minuscules, ou chaîne vide si invalide

**Exemple:**
```typescript
const domain = getDomainFromUrl('https://www.example.com/page');
// Retourne: 'www.example.com'
```

## Module: hierarchyBuilder

### `createHierarchy(bookmarks: Bookmark[], params: HierarchyParams): BookmarkNode`

Crée une hiérarchie intelligente à partir d'une liste de bookmarks.

**Paramètres:**
- `bookmarks` (Bookmark[]): Liste des bookmarks à organiser
- `params` (HierarchyParams): Paramètres de complexité de la hiérarchie

**Retourne:**
- `BookmarkNode`: Noeud racine de l'arborescence générée

**Exemple:**
```typescript
const hierarchy = createHierarchy(bookmarks, {
  verticalComplexity: 4,
  horizontalComplexity: 8
});
```

**Algorithme:**
1. Groupement par types de contenu
2. Respect contraintes de complexité horizontale
3. Construction récursive des branches
4. Regroupement des types minoritaires si nécessaire

---

### `generateFolderName(identifier: string, bookmarks: Bookmark[]): string`

Génère un nom de dossier intelligent basé sur l'identifiant et le contenu.

**Paramètres:**
- `identifier` (string): Identifiant (domaine ou mot-clé)
- `bookmarks` (Bookmark[]): Bookmarks contenus dans ce dossier

**Retourne:**
- `string`: Nom de dossier généré avec compteur

**Exemple:**
```typescript
generateFolderName('github.com', bookmarks);
// Retourne: 'Github - 15 liens'

generateFolderName('react', bookmarks);
// Retourne: 'React - 6 ressources'
```

**Logique de nommage:**
- **Domaines** (contient '.'): "NomSite - X liens"
- **Mots-clés**: "MotClé - X ressources"
- Capitalisation automatique du premier caractère

## Module: freemindExporter

### `generateFreeMindXML(rootNode: BookmarkNode, options?: ExportOptions): string`

Génère le fichier XML FreeMind complet à partir du nœud racine.

**Paramètres:**
- `rootNode` (BookmarkNode): Nœud racine de l'arborescence
- `options` (ExportOptions, optionnel): Options d'export (par défaut: tout inclus)

**Retourne:**
- `string`: Contenu XML complet du fichier FreeMind

**Exemple:**
```typescript
// Export complet
const xml = generateFreeMindXML(hierarchyRoot);

// Export structure seule
const xmlFolders = generateFreeMindXML(hierarchyRoot, { 
  includeBookmarks: false, 
  includeFolders: true 
});
console.log('XML généré:', xml.length, 'caractères');
```

**Structure XML générée:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
<attribute_registry/>
<node TEXT="Bookmarks">
  <node TEXT="Development & Code (25)">
    <node TEXT="GitHub - 15 liens">
      <node TEXT="React Repository" LINK="https://github.com/facebook/react"/>
    </node>
  </node>
</map>
```

---

### `downloadFreeMindFile(rootNode: BookmarkNode, options?: ExportOptions): void`

Génère et déclenche le téléchargement d'un fichier FreeMind.

**Paramètres:**
- `rootNode` (BookmarkNode): Nœud racine à exporter
- `options` (ExportOptions, optionnel): Options d'export (par défaut: tout inclus)

**Throws:**
- `Error`: Si la génération du fichier échoue

**Exemple:**
```typescript
// Export complet
downloadFreeMindFile(hierarchy);
// Télécharge: bookmarks_reorganized_2024-01-15.mm

// Export structure seule
downloadFreeMindFile(hierarchy, { includeBookmarks: false, includeFolders: true });
// Télécharge: bookmarks_folders_only_2024-01-15.mm
```

**Processus:**
1. Génération du contenu XML
2. Création d'un Blob avec type MIME approprié
3. Génération nom de fichier avec timestamp
4. Création lien de téléchargement temporaire
5. Déclenchement automatique du téléchargement
6. Nettoyage des ressources (URL.revokeObjectURL)

**Gestion d'erreurs:**
- Try-catch avec logging console
- Alert utilisateur en cas d'échec
- Nettoyage automatique même en cas d'erreur

## Constantes de Configuration

### Patterns de Classification

```typescript
const TYPE_PATTERNS: Record<BookmarkType, { domains: string[], keywords: string[] }> = {
  'Videos & Multimedia': {
    domains: ['youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv', 'netflix.com'],
    keywords: ['video', 'film', 'movie', 'streaming', 'watch', 'multimedia', 'cinema']
  },
  // ... autres patterns
};
```

### Mots Vides (Stop Words)

```typescript
const STOP_WORDS = new Set([
  // Français
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais',
  // Anglais
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'
  // ... liste complète
]);
```

## Gestion d'Erreurs

### Stratégie Globale
- **Fonctions pures**: Retournent des valeurs par défaut sûres
- **Logging**: Warnings console pour problèmes non-critiques
- **Validation**: Vérification des entrées utilisateur
- **Graceful degradation**: Fonctionnement même avec données partielles

### Codes d'Erreur Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid URL` | URL malformée dans bookmark | Ignore le bookmark, continue le traitement |
| `No bookmarks found` | Fichier HTML invalide | Vérifier format d'export Chrome |
| `XML generation failed` | Erreur lors de l'export | Vérifier la hiérarchie, réessayer |

## Performance

### Complexité Algorithmique

| Fonction | Complexité | Notes |
|----------|------------|-------|
| `parseBookmarksHTML` | O(n) | n = nombre de liens dans HTML |
| `analyzeBookmarkType` | O(1) | Lookup dans patterns constants |
| `createHierarchy` | O(n log n) | Tri + regroupements |
| `generateFreeMindXML` | O(n) | Parcours linéaire de l'arbre |

### Recommandations d'Usage

- **Fichiers volumineux** (>5000 bookmarks): Augmenter timeout
- **Hiérarchie complexe** (>6 niveaux): Peut ralentir le rendu
- **Export fréquent**: Réutiliser la hiérarchie existante

## Module: hierarchyBuilder (Nouvelles fonctions)

### `filterHierarchy(node: BookmarkNode, options: ExportOptions): BookmarkNode | null`

Filtre une hiérarchie selon les options d'export spécifiées.

**Paramètres:**
- `node` (BookmarkNode): Nœud à filtrer
- `options` (ExportOptions): Options de filtrage

**Retourne:**
- `BookmarkNode | null`: Nœud filtré ou null si supprimé

**Exemple:**
```typescript
const foldersOnly = filterHierarchy(hierarchy, { 
  includeBookmarks: false, 
  includeFolders: true 
});
```

**Algorithme:**
1. Filtre selon le type de nœud (bookmark/folder)
2. Traite récursivement les enfants
3. Supprime les nœuds vides après filtrage
4. Remonte les enfants si le parent est exclu

## Cas d'Usage des Options d'Export

### Mode "Structure seule"
```typescript
const options: ExportOptions = {
  includeBookmarks: false,
  includeFolders: true
};
```
- **Usage** : Créer un plan/template de l'organisation
- **Résultat** : Arborescence sans liens, uniquement la structure
- **Fichier** : `bookmarks_folders_only_YYYY-MM-DD.mm`

### Mode "Complet" (par défaut)
```typescript
const options: ExportOptions = {
  includeBookmarks: true,
  includeFolders: true
};
```
- **Usage** : Export traditionnel avec tout le contenu
- **Résultat** : Hiérarchie complète avec liens cliquables
- **Fichier** : `bookmarks_reorganized_YYYY-MM-DD.mm`

---

Cette API est conçue pour être stable et extensible. Toutes les fonctions publiques respectent les contrats définis et maintiennent la compatibilité descendante.