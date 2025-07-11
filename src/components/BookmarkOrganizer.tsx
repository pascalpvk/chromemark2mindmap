import React, { useState, useCallback, useMemo } from 'react';
import { 
  Upload, 
  Download, 
  FolderOpen, 
  Link, 
  Settings, 
  BarChart3, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Bookmark, BookmarkNode, BookmarkStats, HierarchyParams } from '../types/bookmark';
import { parseBookmarksHTML } from '../utils/bookmarkParser';
import { createHierarchy } from '../utils/hierarchyBuilder';
import { downloadFreeMindFile } from '../utils/freemindExporter';

const BookmarkOrganizer: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [hierarchy, setHierarchy] = useState<BookmarkNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [hierarchyParams, setHierarchyParams] = useState<HierarchyParams>({
    verticalComplexity: 4,
    horizontalComplexity: 8
  });

  const stats = useMemo<BookmarkStats>(() => {
    const detectedTypes = bookmarks.reduce((acc, bookmark) => {
      acc[bookmark.type] = (acc[bookmark.type] || 0) + 1;
      return acc;
    }, {} as BookmarkStats['detectedTypes']);

    const uniqueDomains = new Set(bookmarks.map(b => b.domain)).size;

    return {
      totalBookmarks: bookmarks.length,
      detectedTypes,
      uniqueDomains
    };
  }, [bookmarks]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.html')) {
      setError('Veuillez sélectionner un fichier HTML d\'export de bookmarks Chrome.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const parsedBookmarks = parseBookmarksHTML(content);
      
      if (parsedBookmarks.length === 0) {
        setError('Aucun bookmark trouvé dans le fichier. Vérifiez qu\'il s\'agit bien d\'un export Chrome.');
        return;
      }

      setBookmarks(parsedBookmarks);
      
      const newHierarchy = createHierarchy(parsedBookmarks, hierarchyParams);
      setHierarchy(newHierarchy);
      
    } catch (err) {
      setError('Erreur lors du traitement du fichier. Veuillez vérifier le format.');
      console.error('File processing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hierarchyParams]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleHierarchyParamsChange = useCallback((newParams: Partial<HierarchyParams>) => {
    const updatedParams = { ...hierarchyParams, ...newParams };
    setHierarchyParams(updatedParams);
    
    if (bookmarks.length > 0) {
      const newHierarchy = createHierarchy(bookmarks, updatedParams);
      setHierarchy(newHierarchy);
    }
  }, [bookmarks, hierarchyParams]);

  const handleExport = useCallback(() => {
    if (hierarchy) {
      downloadFreeMindFile(hierarchy);
    }
  }, [hierarchy]);

  const renderHierarchyNode = useCallback((node: BookmarkNode, depth: number = 0): React.ReactNode => {
    const indentStyle = { paddingLeft: `${depth * 20}px` };
    
    if (node.type === 'bookmark') {
      return (
        <div key={node.bookmark?.url} style={indentStyle} className="flex items-center py-1 text-sm">
          <Link className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="text-blue-700 truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.name} style={indentStyle} className="py-1">
        <div className="flex items-center text-sm font-medium">
          <FolderOpen className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
          <span className="text-gray-800">{node.name}</span>
        </div>
        {node.children?.map(child => renderHierarchyNode(child, depth + 1))}
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chrome Bookmarks to FreeMind
          </h1>
          <p className="text-gray-600">
            Convertissez et réorganisez vos bookmarks Chrome en carte mentale FreeMind
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Import des Bookmarks
                </h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-gray-600">Traitement en cours...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">
                        Glissez-déposez votre fichier HTML d'export Chrome
                      </p>
                      <p className="text-sm text-gray-500 mb-4">ou</p>
                      <label className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                        Sélectionner un fichier
                        <input
                          type="file"
                          accept=".html"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {bookmarks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Paramètres de Hiérarchie
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complexité Verticale: {hierarchyParams.verticalComplexity} niveaux
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={hierarchyParams.verticalComplexity}
                        onChange={(e) => handleHierarchyParamsChange({ verticalComplexity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complexité Horizontale: {hierarchyParams.horizontalComplexity} branches
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="15"
                        value={hierarchyParams.horizontalComplexity}
                        onChange={(e) => handleHierarchyParamsChange({ horizontalComplexity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {hierarchy && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Aperçu de la Hiérarchie
                    </h3>
                    <button
                      onClick={handleExport}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter FreeMind
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {renderHierarchyNode(hierarchy)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {bookmarks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Statistiques
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total bookmarks:</span>
                    <span className="font-semibold text-gray-900">{stats.totalBookmarks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Domaines uniques:</span>
                    <span className="font-semibold text-gray-900">{stats.uniqueDomains}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Types détectés:
                    </span>
                    <div className="space-y-1">
                      {Object.entries(stats.detectedTypes)
                        .filter(([_, count]) => count > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 truncate">{type}:</span>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hierarchy && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Prêt pour l'export
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Votre hiérarchie est prête à être exportée au format FreeMind (.mm). 
                  Le fichier sera téléchargé automatiquement.
                </p>
                
                <button
                  onClick={handleExport}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger FreeMind
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkOrganizer;