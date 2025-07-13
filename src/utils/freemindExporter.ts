/**
 * @fileoverview Exporteur de fichiers FreeMind (.mm) à partir d'une hiérarchie de bookmarks
 * Génère du XML valide compatible avec FreeMind et déclenche le téléchargement
 * @author Chrome Bookmark to FreeMind Converter
 * @version 1.0.0
 */

import { BookmarkNode } from '../types/bookmark';

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
 * @returns {string} XML généré pour ce noeud
 */
function generateNodeXML(node: BookmarkNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  const escapedText = escapeXML(node.name);
  
  if (node.type === 'bookmark' && node.bookmark) {
    return `${indent}<node TEXT="${escapedText}" LINK="${escapeXML(node.bookmark.url)}"/>`;
  }
  
  if (!node.children || node.children.length === 0) {
    return `${indent}<node TEXT="${escapedText}"/>`;
  }
  
  const childrenXML = node.children
    .map(child => generateNodeXML(child, depth + 1))
    .join('\n');
  
  return `${indent}<node TEXT="${escapedText}">
${childrenXML}
${indent}</node>`;
}

/**
 * Génère le fichier XML FreeMind complet à partir du noeud racine
 * Inclut l'en-tête XML et la structure map conforme à FreeMind
 * 
 * @param {BookmarkNode} rootNode - Noeud racine de l'arborescence
 * @returns {string} Contenu XML complet du fichier FreeMind
 * 
 * @example
 * ```typescript
 * const xml = generateFreeMindXML(hierarchyRoot);
 * console.log('XML généré:', xml.length, 'caractères');
 * ```
 */
export function generateFreeMindXML(rootNode: BookmarkNode): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
<attribute_registry/>
${generateNodeXML(rootNode)}
</map>`;
  
  return xml;
}

/**
 * Génère et déclenche le téléchargement d'un fichier FreeMind
 * Crée un blob, génère un nom de fichier avec horodatage et nettoie les ressources
 * 
 * @param {BookmarkNode} rootNode - Noeud racine à exporter
 * @throws {Error} Si la génération du fichier échoue
 * 
 * @example
 * ```typescript
 * downloadFreeMindFile(hierarchy);
 * // Télécharge: bookmarks_reorganized_2024-01-15.mm
 * ```
 */
export function downloadFreeMindFile(rootNode: BookmarkNode): void {
  try {
    const xmlContent = generateFreeMindXML(rootNode);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `bookmarks_reorganized_${timestamp}.mm`;
    
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