# Chrome Bookmarks to FreeMind Converter

Une application web React moderne qui convertit automatiquement les bookmarks exportés de Google Chrome en cartes mentales FreeMind (.mm). L'application utilise des algorithmes intelligents de classification et d'organisation pour créer une hiérarchie structurée et navigable.

## 🚀 Fonctionnalités

### Import et Analyse Intelligente
- **Interface de glisser-déposer** intuitive pour les fichiers HTML d'export Chrome
- **Parser HTML robuste** qui extrait automatiquement titre, URL et hiérarchie d'origine
- **Classification automatique** par type de contenu basée sur l'analyse des domaines et mots-clés

### 10 Catégories de Classification
1. **Videos & Multimedia** - YouTube, Vimeo, Netflix, etc.
2. **Development & Code** - GitHub, GitLab, CodePen, etc.
3. **Documentation & Help** - StackOverflow, docs.*, wikis, etc.
4. **E-commerce & Shopping** - Amazon, eBay, boutiques en ligne
5. **News & Blog** - Sites d'actualités et blogs
6. **Social Networks** - Facebook, Twitter, LinkedIn, etc.
7. **Cloud & Storage** - Google Drive, Dropbox, OneDrive, etc.
8. **Tools & Utilities** - Outils en ligne, convertisseurs, etc.
9. **Formation & Learning** - Udemy, Coursera, plateformes éducatives
10. **Various Resources** - Catégorie par défaut pour les autres contenus

### Génération de Hiérarchie Intelligente
- **Complexité Verticale** ajustable (2-8 niveaux) contrôle la profondeur de l'arborescence
- **Complexité Horizontale** ajustable (3-15 branches) contrôle le nombre de catégories par niveau
- **Algorithme de nommage intelligent** basé sur :
  - Domaines dominants (>60% des liens) → "GitHub - 15 liens"
  - Mots-clés fréquents (>2 occurrences) → "React (8)"
  - Types de contenu dominants (>50%) → "Documentation & Aide (12)"
- **Regroupement automatique** des petites catégories
- **Mise à jour en temps réel** lors du changement des paramètres

### Interface Utilisateur Moderne
- **Design moderne** avec Tailwind CSS et icônes Lucide React
- **Panneau de contrôle** avec curseurs interactifs
- **Statistiques en temps réel** (total bookmarks, types détectés, domaines uniques)
- **Aperçu interactif** de l'arborescence avec codes couleur
- **Gestion d'erreurs** explicite et logging pour debugging

### Export FreeMind Compatible
- **Génération XML valide** compatible FreeMind
- **Échappement XML complet** pour caractères spéciaux
- **Options d'export flexibles** :
  - Export complet (dossiers + bookmarks)
  - Export structure seule (dossiers uniquement)
- **Noms de fichiers horodatés** : `bookmarks_reorganized_YYYY-MM-DD.mm` ou `bookmarks_folders_only_YYYY-MM-DD.mm`
- **Téléchargement automatique** avec nettoyage des ressources

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 avec TypeScript
- **Styling**: Tailwind CSS
- **Icônes**: Lucide React
- **Build Tool**: Vite
- **APIs**: DOMParser, Blob API, URL API

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/chromemark2mindmap.git
cd chromemark2mindmap

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173/`

## 🎯 Utilisation

### 1. Exporter vos bookmarks depuis Chrome
1. Ouvrez Chrome
2. Allez dans **Paramètres** → **Bookmarks** → **Gestionnaire de bookmarks**
3. Cliquez sur **⋮** → **Exporter les bookmarks**
4. Sauvegardez le fichier HTML

### 2. Importer dans l'application
1. Glissez-déposez le fichier HTML sur la zone prévue
2. Ou cliquez sur "Sélectionner un fichier" pour choisir votre export

### 3. Configurer la hiérarchie
- **Complexité Verticale** : Ajustez la profondeur (2-8 niveaux)
- **Complexité Horizontale** : Ajustez le nombre de branches (3-15)
- L'aperçu se met à jour automatiquement

### 4. Configurer l'export
- **Options d'export** :
  - ✅ **Inclure les bookmarks individuels** : Export complet avec liens cliquables
  - ✅ **Inclure l'arborescence des dossiers** : Structure organisationnelle
  - 📁 **Mode "Structure seule"** : Décocher les bookmarks pour n'exporter que l'arborescence

### 5. Exporter vers FreeMind
- Cliquez sur "Exporter FreeMind" ou "Exporter Structure"
- Le fichier `.mm` se télécharge automatiquement
- Ouvrez-le dans FreeMind pour naviguer dans votre organisation

## 🏗️ Architecture du Code

### Structure des Dossiers
```
src/
├── components/
│   └── BookmarkOrganizer.tsx    # Composant principal
├── types/
│   └── bookmark.ts              # Interfaces TypeScript
├── utils/
│   ├── bookmarkParser.ts        # Parser HTML et classification
│   ├── hierarchyBuilder.ts      # Construction de hiérarchie
│   └── freemindExporter.ts     # Export XML FreeMind
└── App.tsx                     # Point d'entrée
```

### Composants Clés

#### `BookmarkOrganizer`
Composant principal React gérant :
- État de l'application (bookmarks, hiérarchie, paramètres)
- Interface utilisateur et interactions
- Coordination entre les utilitaires

#### `bookmarkParser`
Fonctions de traitement des données :
- `parseBookmarksHTML()` - Parse le HTML Chrome
- `analyzeBookmarkType()` - Classification automatique
- `extractKeywords()` - Extraction de mots-clés

#### `hierarchyBuilder` 
Algorithmes de construction d'arborescence :
- `createHierarchy()` - Point d'entrée principal
- `createBranch()` - Construction récursive
- `generateFolderName()` - Nommage intelligent

#### `freemindExporter`
Export vers FreeMind :
- `generateFreeMindXML()` - Génération XML
- `downloadFreeMindFile()` - Téléchargement
- `escapeXML()` - Sécurisation XML

## 🔧 Algorithmes

### Classification Automatique
```typescript
// Analyse domaine + mots-clés pour déterminer le type
const type = analyzeBookmarkType(title, domain);
```

### Construction de Hiérarchie
```typescript
// Respecte les contraintes de complexité
const hierarchy = createHierarchy(bookmarks, {
  verticalComplexity: 4,   // Profondeur max
  horizontalComplexity: 8  // Branches max par niveau
});
```

### Nommage Intelligent
- **Domaines dominants** : "GitHub - 15 liens"
- **Mots-clés fréquents** : "React (8)"  
- **Types de contenu** : "Documentation & Aide (12)"
- **Fallback générique** : "Divers (5)"

## 🧪 Tests et Développement

```bash
# Mode développement avec hot reload
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 📝 Format de Sortie

Le fichier FreeMind généré utilise la structure XML standard :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
<attribute_registry/>
<node TEXT="Bookmarks">
  <node TEXT="Development & Code (25)">
    <node TEXT="GitHub - 15 liens">
      <node TEXT="React Repository" LINK="https://github.com/facebook/react"/>
      <!-- ... autres bookmarks -->
    </node>
  </node>
</map>
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Résolution de Problèmes

### Erreurs Communes

**"Aucun bookmark trouvé"**
- Vérifiez que le fichier est un export HTML de Chrome
- Assurez-vous que le fichier contient des liens `<a href="...">`

**"Erreur lors du traitement"**
- Le fichier est peut-être corrompu
- Réexportez vos bookmarks depuis Chrome

**"Export FreeMind échoue"**
- Vérifiez la console pour les erreurs détaillées
- Essayez de réduire la complexité de la hiérarchie

### Support

Pour obtenir de l'aide :
1. Consultez la documentation ci-dessus
2. Vérifiez les [Issues GitHub](https://github.com/votre-username/chromemark2mindmap/issues)
3. Ouvrez une nouvelle issue avec les détails du problème

---

**Développé avec ❤️ pour organiser vos bookmarks intelligemment**