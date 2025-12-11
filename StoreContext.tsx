import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DocumentItem, Location, DocumentCategory } from '../types';

interface StoreContextType {
  documents: DocumentItem[];
  locations: Location[];
  addDocument: (doc: DocumentItem) => void;
  updateDocument: (doc: DocumentItem) => void;
  deleteDocument: (id: string) => void;
  addLocation: (loc: Location) => void;
  updateLocation: (loc: Location) => void;
  deleteLocation: (id: string) => void;
  getLocationName: (id: string) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_DOCS = 'docflow_documents';
const STORAGE_KEY_LOCS = 'docflow_locations';

// Seed data removed as requested
const SEED_LOCATIONS: Location[] = [];
const SEED_DOCUMENTS: DocumentItem[] = [];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedDocs = localStorage.getItem(STORAGE_KEY_DOCS);
    const storedLocs = localStorage.getItem(STORAGE_KEY_LOCS);

    if (storedDocs) setDocuments(JSON.parse(storedDocs));
    else setDocuments(SEED_DOCUMENTS);

    if (storedLocs) setLocations(JSON.parse(storedLocs));
    else setLocations(SEED_LOCATIONS);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
      localStorage.setItem(STORAGE_KEY_LOCS, JSON.stringify(locations));
    }
  }, [documents, locations, isLoaded]);

  const addDocument = (doc: DocumentItem) => {
    setDocuments(prev => [...prev, doc]);
  };

  const updateDocument = (doc: DocumentItem) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addLocation = (loc: Location) => {
    setLocations(prev => [...prev, loc]);
  };

  const updateLocation = (loc: Location) => {
    setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const getLocationName = (id: string) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : 'Local Desconhecido';
  };

  return (
    <StoreContext.Provider value={{ 
      documents, 
      locations, 
      addDocument, 
      updateDocument, 
      deleteDocument, 
      addLocation, 
      updateLocation,
      deleteLocation,
      getLocationName
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};