import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { LanguageCode } from '../types';
import { translations, TranslationDict, getTranslations } from '../data/translations';
import { farmerTranslations, FarmerTranslationDict, getFarmerTranslations } from '../data/farmerTranslations';
import { buyerTranslations, BuyerTranslationsDict, getBuyerTranslations } from '../data/buyerTranslations';
import { adminTranslations, AdminTranslationsDict, getAdminTranslations } from '../data/adminTranslations';
import { authTranslations, AuthTranslationsDict, getAuthTranslations } from '../i18n/authTranslations';
import {
  getLocalizedCropName,
  getLocalizedCategoryName,
  getLocalizedStatusName,
  getLocalizedUnit,
} from '../utils/cropLocalization';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  // Translation Dictionaries
  translations: TranslationDict;
  farmerTranslations: FarmerTranslationDict;
  buyerTranslations: BuyerTranslationsDict;
  adminTranslations: AdminTranslationsDict;
  authTranslations: AuthTranslationsDict;
  // Key Path Translator
  t: (keyPath: string, fallback?: string) => string;
  // Shorthands
  tf: FarmerTranslationDict;
  tb: BuyerTranslationsDict;
  ta: AdminTranslationsDict;
  // Entity Localizers
  getCropName: (crop: string | undefined) => string;
  getCategoryName: (category: string | undefined) => string;
  getStatusName: (status: string | undefined) => string;
  getUnitName: (unit: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEYS = ['kisansetu_lang', 'agrohub_lang', 'kisansetu_language'];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      for (const key of STORAGE_KEYS) {
        const saved = localStorage.getItem(key);
        if (saved && (saved === 'hi' || saved === 'en' || saved === 'pa' || saved === 'hr' || saved === 'te' || saved === 'ta')) {
          return saved as LanguageCode;
        }
      }
    } catch {
      // Storage unavailable
    }
    return 'hi';
  });

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('kisansetu_lang', lang);
      localStorage.setItem('agrohub_lang', lang);
    } catch {
      // Storage unavailable
    }
  };

  // Keep in sync if changed in another window/tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key && STORAGE_KEYS.includes(e.key) && e.newValue) {
        const newLang = e.newValue as LanguageCode;
        if (['hi', 'en', 'pa', 'hr', 'te', 'ta'].includes(newLang)) {
          setCurrentLanguageState(newLang);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const generalDict = useMemo(() => getTranslations(currentLanguage), [currentLanguage]);
  const farmerDict = useMemo(() => getFarmerTranslations(currentLanguage), [currentLanguage]);
  const buyerDict = useMemo(() => getBuyerTranslations(currentLanguage), [currentLanguage]);
  const adminDict = useMemo(() => getAdminTranslations(currentLanguage), [currentLanguage]);
  const authDict = useMemo(() => getAuthTranslations(currentLanguage), [currentLanguage]);

  // Nested key path lookup function: t('nav.home') or t('benefits.item1.title')
  const t = (keyPath: string, fallback?: string): string => {
    try {
      const parts = keyPath.split('.');
      let current: any = generalDict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return fallback || keyPath;
        }
      }
      if (typeof current === 'string') {
        return current;
      }
    } catch {
      // Fall through to fallback
    }
    return fallback || keyPath;
  };

  const getCropName = (crop: string | undefined) => getLocalizedCropName(crop, currentLanguage);
  const getCategoryName = (cat: string | undefined) => getLocalizedCategoryName(cat, currentLanguage);
  const getStatusName = (status: string | undefined) => getLocalizedStatusName(status, currentLanguage);
  const getUnitName = (unit: string | undefined) => getLocalizedUnit(unit, currentLanguage);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        translations: generalDict,
        farmerTranslations: farmerDict,
        buyerTranslations: buyerDict,
        adminTranslations: adminDict,
        authTranslations: authDict,
        t,
        tf: farmerDict,
        tb: buyerDict,
        ta: adminDict,
        getCropName,
        getCategoryName,
        getStatusName,
        getUnitName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
