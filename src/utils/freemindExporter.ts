/**
 * @fileoverview Exporteur de fichiers FreeMind (.mm) à partir d'une hiérarchie de bookmarks
 * Génère du XML valide compatible avec FreeMind et déclenche le téléchargement
 * @author Chrome Bookmark to FreeMind Converter
 * @version 1.0.0
 */

import { BookmarkNode, ExportOptions } from '../types/bookmark';

/**
 * Échappe les caractères spéciaux pour une utilisation sécurisée dans du XML
 * 
 * @param {string} str - Chaîne à échapper
 * @returns {string} Chaîne échappée pour XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Génère récursivement le XML pour un noeud et ses enfants
 * Applique l'indentation et gère les différents types de noeuds
 * 
 * @param {BookmarkNode} node - Noeud à convertir en XML
 * @param {number} depth - Profondeur actuelle pour l'indentation
 * @param {ExportOptions} options - Options d'export (bookmarks, dossiers)
 * @returns {string} XML généré pour ce noeud
 */
function generateNodeXML(node: BookmarkNode, depth: number = 0, options: ExportOptions = { includeBookmarks: true, includeFolders: true }): string {
  const indent = '  '.repeat(depth);
  const escapedText = escapeXML(node.name);
  
  // Filtrer selon les options d'export
  if (node.type === 'bookmark' && !options.includeBookmarks) {
    return ''; // Ne pas inclure les bookmarks si l'option est désactivée
  }
  
  if (node.type === 'folder' && !options.includeFolders) {
    // Si on n'inclut pas les dossiers, traiter directement les enfants
    if (node.children) {
      return node.children
        .map(child => generateNodeXML(child, depth, options))
        .filter(xml => xml.length > 0)
        .join('\n');
    }
    return '';
  }
  
  // Pour les bookmarks : créer un nœud avec lien
  if (node.type === 'bookmark' && node.bookmark) {
    return `${indent}<node TEXT="${escapedText}" LINK="${escapeXML(node.bookmark.url)}"/>`;
  }
  
  if (!node.children || node.children.length === 0) {
    return `${indent}<node TEXT="${escapedText}"/>`;
  }
  
  const childrenXML = node.children
    .map(child => generateNodeXML(child, depth + 1, options))
    .filter(xml => xml.length > 0)
    .join('\n');
  
  // Si un dossier n'a pas d'enfants après filtrage
  if (childrenXML.length === 0 && node.type === 'folder') {
    // En mode "structure seule", garder les dossiers même vides
    if (!options.includeBookmarks && options.includeFolders) {
      return `${indent}<node TEXT="${escapedText}"/>`;
    }
    // Sinon, ne pas inclure les dossiers vides
    return '';
  }
  
  return `${indent}<node TEXT="${escapedText}">
${childrenXML}
${indent}</node>`;
}

/**
 * Génère le fichier XML FreeMind complet à partir du noeud racine
 * Inclut l'en-tête XML et la structure map conforme à FreeMind
 * 
 * @param {BookmarkNode} rootNode - Noeud racine de l'arborescence
 * @param {ExportOptions} options - Options d'export (bookmarks, dossiers)
 * @returns {string} Contenu XML complet du fichier FreeMind
 * 
 * @example
 * ```typescript
 * const xml = generateFreeMindXML(hierarchyRoot, { includeBookmarks: false, includeFolders: true });
 * console.log('XML généré:', xml.length, 'caractères');
 * ```
 */
export function generateFreeMindXML(rootNode: BookmarkNode, options: ExportOptions = { includeBookmarks: true, includeFolders: true }): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
<attribute_registry/>
${generateNodeXML(rootNode, 0, options)}
</map>`;
  
  return xml;
}

/**
 * Génère et déclenche le téléchargement d'un fichier FreeMind
 * Crée un blob, génère un nom de fichier avec horodatage et nettoie les ressources
 * 
 * @param {BookmarkNode} rootNode - Noeud racine à exporter
 * @param {ExportOptions} options - Options d'export (bookmarks, dossiers)
 * @throws {Error} Si la génération du fichier échoue
 * 
 * @example
 * ```typescript
 * downloadFreeMindFile(hierarchy, { includeBookmarks: false, includeFolders: true });
 * // Télécharge: bookmarks_folders_only_2024-01-15.mm
 * ```
 */
export function downloadFreeMindFile(rootNode: BookmarkNode, options: ExportOptions = { includeBookmarks: true, includeFolders: true }): void {
  try {
    const xmlContent = generateFreeMindXML(rootNode, options);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const exportType = !options.includeBookmarks && options.includeFolders ? 'folders_only' : 'reorganized';
    const filename = `bookmarks_${exportType}_${timestamp}.mm`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`FreeMind file "${filename}" generated successfully`);
  } catch (error) {
    console.error('Error generating FreeMind file:', error);
    alert('Erreur lors de la g�n�ration du fichier FreeMind. Veuillez r�essayer.');
  }
}