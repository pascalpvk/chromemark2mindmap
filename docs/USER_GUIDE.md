# Guide d'Utilisation

## Démarrage Rapide

### 1. Exporter vos bookmarks depuis Chrome

1. **Ouvrir le gestionnaire de bookmarks**
   - Appuyez sur `Ctrl+Shift+O` (Windows/Linux) ou `Cmd+Option+B` (Mac)
   - Ou allez dans Chrome → **Paramètres** → **Bookmarks** → **Gestionnaire de bookmarks**

2. **Exporter les bookmarks**
   - Cliquez sur le menu **⋮** (trois points) en haut à droite
   - Sélectionnez **"Exporter les bookmarks"**
   - Choisissez un emplacement et sauvegardez le fichier HTML

### 2. Importer dans l'application

1. **Lancer l'application**
   ```bash
   npm run dev
   ```
   Ouvrez http://localhost:5173 dans votre navigateur

2. **Charger le fichier**
   - **Méthode 1** : Glissez-déposez votre fichier HTML sur la zone prévue
   - **Méthode 2** : Cliquez sur "Sélectionner un fichier" et choisissez votre export

3. **Vérification automatique**
   - L'application parse automatiquement le fichier
   - Les bookmarks sont classifiés par type de contenu
   - Les statistiques s'affichent en temps réel

### 3. Configurer la hiérarchie

#### Complexité Verticale (2-8 niveaux)
- **2-3 niveaux** : Structure simple, bonne pour <500 bookmarks
- **4-5 niveaux** : Équilibre idéal pour la plupart des cas
- **6-8 niveaux** : Structure détaillée pour >2000 bookmarks

#### Complexité Horizontale (3-15 branches)
- **3-5 branches** : Groupes très concentrés
- **6-10 branches** : Répartition équilibrée (recommandé)
- **11-15 branches** : Granularité fine, nombreuses catégories

### 4. Prévisualiser et exporter

1. **Aperçu de la hiérarchie**
   - L'arborescence se met à jour automatiquement
   - Les dossiers sont en gris, les bookmarks en bleu
   - Les compteurs indiquent le nombre d'éléments

2. **Export FreeMind**
   - Cliquez sur **"Exporter FreeMind"**
   - Le fichier `.mm` se télécharge automatiquement
   - Nom format : `bookmarks_reorganized_YYYY-MM-DD.mm`

## Interface Utilisateur

### Zone d'Import
- **Glisser-déposer** : Zone réactive avec feedback visuel
- **Sélection manuelle** : Bouton pour choisir un fichier
- **Validation** : Seuls les fichiers `.html` sont acceptés
- **Feedback** : Spinner de chargement et messages d'erreur

### Panneau de Contrôle
- **Curseurs interactifs** : Ajustement en temps réel
- **Labels dynamiques** : Affichage des valeurs actuelles
- **Mise à jour automatique** : Recalcul immédiat de la hiérarchie

### Statistiques
- **Total bookmarks** : Nombre total importé
- **Types détectés** : Répartition par catégorie
- **Domaines uniques** : Diversité des sources

### Aperçu Hiérarchique
- **Indentation visuelle** : Structure claire
- **Icônes différenciées** : Dossiers vs bookmarks
- **Codes couleur** : Gris pour dossiers, bleu pour bookmarks
- **Scroll automatique** : Navigation dans les grandes hiérarchies

## Classification Automatique

### 10 Catégories Disponibles

1. **🎬 Videos & Multimedia**
   - **Domaines** : youtube.com, vimeo.com, netflix.com, twitch.tv
   - **Mots-clés** : video, film, movie, streaming, watch, cinema

2. **💻 Development & Code**
   - **Domaines** : github.com, gitlab.com, codepen.io, jsfiddle.net
   - **Mots-clés** : code, programming, development, git, api, framework

3. **📚 Documentation & Help**
   - **Domaines** : stackoverflow.com, docs.*, wiki*, help.*
   - **Mots-clés** : documentation, docs, help, tutorial, guide, reference

4. **🛒 E-commerce & Shopping**
   - **Domaines** : amazon.*, ebay.*, shopify.*, etsy.com
   - **Mots-clés** : shop, store, buy, sell, price, product, cart

5. **📰 News & Blog**
   - **Domaines** : *news*, *blog*, medium.com, wordpress.*
   - **Mots-clés** : news, blog, article, post, actualité, information

6. **👥 Social Networks**
   - **Domaines** : facebook.com, twitter.com, linkedin.com, instagram.com
   - **Mots-clés** : social, network, share, post, follow, friend

7. **☁️ Cloud & Storage**
   - **Domaines** : drive.google.com, dropbox.com, onedrive.*, icloud.com
   - **Mots-clés** : cloud, storage, drive, sync, backup, file, share

8. **🔧 Tools & Utilities**
   - **Domaines** : *tools*, *util*, *app*, chrome.google.com/webstore
   - **Mots-clés** : tool, utility, app, service, generator, converter

9. **🎓 Formation & Learning**
   - **Domaines** : udemy.com, coursera.org, edx.org, *khan*
   - **Mots-clés** : course, learn, education, training, formation, cours

10. **📁 Various Resources**
    - **Catégorie par défaut** pour tous les autres contenus

### Algorithme de Classification

1. **Analyse du domaine** : Correspondance avec patterns prédéfinis
2. **Analyse du titre** : Recherche de mots-clés spécifiques
3. **Priorité** : Domaine prioritaire sur mots-clés
4. **Fallback** : "Various Resources" si aucune correspondance

## Génération de Hiérarchie

### Algorithme Intelligent

#### Niveau 1 : Classification par Type
- Regroupement initial par les 10 catégories
- Respect de la contrainte horizontale
- Fusion des types minoritaires si nécessaire

#### Niveau 2+ : Sous-groupement
1. **Domaines dominants** (>15% des bookmarks du type)
   - Exemple : "GitHub - 15 liens"
   - Nettoyage automatique ("www." supprimé)

2. **Mots-clés fréquents** (≥2 occurrences)
   - Exemple : "React (8)"
   - Capitalisation automatique

3. **Groupe "Divers"** pour les éléments restants

#### Nommage Intelligent
- **Format domaine** : "NomSite - X liens"
- **Format mot-clé** : "MotClé (X)"
- **Format type** : "Type de contenu (X)"
- **Compteurs** : Toujours entre parenthèses

### Contraintes Respectées

#### Complexité Verticale
- **Arrêt automatique** quand profondeur max atteinte
- **Conversion en feuilles** : Bookmarks individuels au niveau final

#### Complexité Horizontale
- **Limitation** du nombre de branches par niveau
- **Regroupement** des catégories excédentaires
- **Distribution équilibrée** des éléments

## Export FreeMind

### Format de Sortie

#### Structure XML Standard
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

#### Caractéristiques
- **Encodage UTF-8** : Support caractères internationaux
- **Échappement XML** : Sécurisation complète des caractères spéciaux
- **Attributs LINK** : URLs cliquables dans FreeMind
- **Indentation** : Structure lisible et bien formatée

### Compatibilité FreeMind

#### Versions Supportées
- **FreeMind 1.0.x** : Compatibilité complète
- **FreeMind 0.9.x** : Compatible avec warnings mineurs
- **Freeplane** : Import possible avec conversion automatique

#### Fonctionnalités FreeMind
- **Navigation** : Expansion/réduction des branches
- **Liens cliquables** : Accès direct aux bookmarks
- **Recherche** : Fonction de recherche intégrée
- **Export** : Vers PDF, HTML, images

## Conseils d'Utilisation

### Optimisation des Paramètres

#### Pour <500 bookmarks
- **Complexité verticale** : 3-4 niveaux
- **Complexité horizontale** : 6-8 branches
- **Résultat** : Structure simple et navigable

#### Pour 500-2000 bookmarks
- **Complexité verticale** : 4-5 niveaux
- **Complexité horizontale** : 8-10 branches
- **Résultat** : Équilibre optimal

#### Pour >2000 bookmarks
- **Complexité verticale** : 5-6 niveaux
- **Complexité horizontale** : 10-12 branches
- **Résultat** : Structure détaillée mais gérable

### Bonnes Pratiques

#### Préparation des Bookmarks
1. **Nettoyage préalable** : Supprimer bookmarks obsolètes dans Chrome
2. **Organisation basique** : Créer quelques dossiers principaux
3. **Titres descriptifs** : Améliorer les titres peu clairs

#### Utilisation de l'Application
1. **Test des paramètres** : Essayer différentes configurations
2. **Aperçu détaillé** : Vérifier la structure avant export
3. **Sauvegarde** : Conserver le fichier HTML d'origine

#### Dans FreeMind
1. **Premier import** : Laisser toutes les branches fermées
2. **Navigation progressive** : Explorer par catégories
3. **Personnalisation** : Ajouter couleurs et icônes si souhaité

## Résolution de Problèmes

### Erreurs d'Import

#### "Aucun bookmark trouvé"
**Causes possibles :**
- Fichier HTML corrompu
- Export incomplet depuis Chrome
- Format de fichier incorrect

**Solutions :**
1. Réexporter depuis Chrome
2. Vérifier que le fichier contient des balises `<a href>`
3. Ouvrir le fichier dans un navigateur pour vérifier

#### "Erreur lors du traitement"
**Causes possibles :**
- Caractères spéciaux dans les URLs
- Bookmarks avec URLs malformées
- Fichier trop volumineux

**Solutions :**
1. Vérifier la console du navigateur pour détails
2. Nettoyer les bookmarks dans Chrome avant export
3. Diviser en plusieurs exports si >5000 bookmarks

### Problèmes de Performance

#### Lenteur de l'interface
**Causes possibles :**
- Fichier très volumineux (>3000 bookmarks)
- Complexité trop élevée
- Navigateur surchargé

**Solutions :**
1. Réduire la complexité horizontale
2. Fermer autres onglets du navigateur
3. Utiliser Chrome ou Firefox récent

#### Export FreeMind échoue
**Causes possibles :**
- Hiérarchie trop complexe
- Caractères incompatibles
- Problème de mémoire

**Solutions :**
1. Réduire les niveaux de complexité
2. Vérifier les erreurs en console
3. Redémarrer l'application

### Amélioration des Résultats

#### Classification imprécise
**Solutions :**
1. Améliorer les titres dans Chrome avant export
2. Ajouter mots-clés descriptifs aux titres
3. Organiser manuellement dans FreeMind après import

#### Hiérarchie déséquilibrée
**Solutions :**
1. Ajuster les paramètres de complexité
2. Tester différentes configurations
3. Préorganiser dans Chrome si nécessaire

---

Ce guide vous permet d'utiliser efficacement l'application pour transformer vos bookmarks Chrome en cartes mentales organisées et navigables.