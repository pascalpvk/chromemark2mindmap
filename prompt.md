Créé une application web React complète pour réorganiser automatiquement les marque-pages (bookmarks) exportés de Google Chrome et les convertir au format FreeMind (.mm).

## SPÉCIFICATIONS FONCTIONNELLES

### Import et Analyse
- Interface de glisser-déposer pour fichiers HTML d'export Chrome
- Parser le HTML des bookmarks pour extraire : titre, URL, hiérarchie de dossiers originale
- Classification automatique par type de contenu basée sur l'analyse des domaines et titres :
  * Vidéos & Multimédia (youtube.com, vimeo.com)
  * Développement & Code (github.com, gitlab.com)
  * Documentation & Aide (stackoverflow.com, docs.*, mots-clés "documentation")
  * E-commerce & Shopping (amazon.*, ebay.*, mots-clés "shop")
  * Actualités & Blog (domaines "news", "blog", mots-clés "actualité")
  * Réseaux Sociaux (linkedin.com, twitter.com, facebook.com)
  * Cloud & Stockage (drive.google.com, dropbox.com, mots-clés "cloud")
  * Outils & Utilitaires (mots-clés "outil", "tool", "app")
  * Formation & Apprentissage (mots-clés "cours", "formation", "learn")
  * Ressources Diverses (catégorie par défaut)

### Génération de Hiérarchie Intelligente
- Deux paramètres de complexité ajustables par curseurs :
  * **Complexité Verticale** (2-8 niveaux) : Contrôle la profondeur de l'arborescence
  * **Complexité Horizontale** (3-15 branches) : Contrôle le nombre de catégories par niveau
- Algorithme de nommage intelligent des dossiers basé sur :
  * Analyse des domaines dominants (>60% des liens) → "GitHub - 15 liens"
  * Mots-clés fréquents (>2 occurrences) → "React (8)"
  * Types de contenu dominants (>50%) → "Documentation & Aide (12)"
  * Noms génériques avec compteurs → "Javascript - 6 ressources"
- Regroupement automatique des petites catégories si dépassement de la complexité horizontale
- Mise à jour en temps réel de la hiérarchie lors du changement des paramètres

### Interface Utilisateur
- Design moderne avec Tailwind CSS
- Zone de glisser-déposer visuelle avec feedback
- Panneau de contrôle avec :
  * Curseurs pour complexité verticale/horizontale avec labels dynamiques
  * Statistiques en temps réel (total bookmarks, types détectés, domaines uniques)
  * Bouton d'export FreeMind avec icônes
- Aperçu interactif de l'arborescence avec :
  * Indentation visuelle par niveau
  * Icônes différentes pour dossiers vs bookmarks
  * Codes couleur (bleu pour bookmarks, gris pour dossiers)
  * Scroll vertical pour grandes hiérarchies
- Indicateur de chargement avec spinner animé
- Messages d'erreur explicites avec gestion d'exceptions

### Export FreeMind
- Génération d'un fichier XML (.mm) compatible FreeMind
- Structure XML correcte avec :
  * Déclaration XML avec encodage UTF-8
  * Balises map et attribute_registry conformes
  * Échappement XML complet pour caractères spéciaux
  * Attributs LINK pour URLs des bookmarks
- Nom de fichier avec horodatage : "bookmarks_reorganized_YYYY-MM-DD.mm"
- Gestion d'erreurs avec logging console et alertes utilisateur
- Nettoyage automatique des ressources mémoire

### Extraction de Mots-clés
- Filtrage des mots vides (français/anglais)
- Extraction des 3 premiers mots significatifs (>3 caractères)
- Nettoyage des caractères spéciaux
- Utilisation pour classification et nommage des dossiers

## SPÉCIFICATIONS TECHNIQUES

### Technologies
- React avec hooks (useState, useEffect, useCallback)
- Lucide React pour les icônes
- DOMParser pour parsing HTML
- Blob API pour génération de fichiers
- Tailwind CSS pour le styling

### Architecture du Code
- Composant principal BookmarkOrganizer
- Fonctions pures pour logique métier :
  * parseBookmarksHTML() - Parser le HTML Chrome
  * analyzeBookmarkType() - Classification automatique
  * extractKeywords() - Extraction mots-clés
  * generateFolderName() - Nommage intelligent
  * createHierarchy() - Construction arborescence
  * createBranch() - Création récursive des branches
  * generateFreeMindXML() - Export XML
- Gestion d'état avec useState pour bookmarks, hiérarchie, paramètres
- Gestion d'événements pour drag&drop et changements de paramètres

### Gestion d'Erreurs
- Try-catch pour URLs malformées
- Validation du type de fichier (.html uniquement)
- Messages d'erreur explicites pour l'utilisateur
- Logging console pour debug
- Fallbacks pour données manquantes

### Performance
- Parsing optimisé avec querySelectorAll
- Mise à jour hiérarchie uniquement si nécessaire
- Nettoyage mémoire pour URLs blob
- Limitation de profondeur pour éviter récursion infinie

Implémente cette application en respectant scrupuleusement ces spécifications. Assure-toi que l'export FreeMind fonctionne parfaitement et que les noms de dossiers sont vraiment descriptifs du contenu.