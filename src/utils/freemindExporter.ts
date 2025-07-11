import { BookmarkNode } from '../types/bookmark';

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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

export function generateFreeMindXML(rootNode: BookmarkNode): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
<attribute_registry/>
${generateNodeXML(rootNode)}
</map>`;
  
  return xml;
}

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
    alert('Erreur lors de la génération du fichier FreeMind. Veuillez réessayer.');
  }
}