import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'khanalens_language';

// Covers the app's reusable UI copy. Food names themselves are requested from
// the scanner in Nepali, rather than relying on a fragile client-side glossary.
const nepaliCopy = {
  'Scan. Analyze. Eat Smarter.': 'स्क्यान गर्नुहोस्। विश्लेषण गर्नुहोस्। स्वस्थ खानुहोस्।',
  'Home': 'होम', 'Progress': 'प्रगति', 'Scan': 'स्क्यान', 'History': 'इतिहास', 'Profile': 'प्रोफाइल',
  'Notifications': 'सूचनाहरू', 'Daily reminders': 'दैनिक सम्झना',
  'Language': 'भाषा', 'Choose your app language': 'एपको भाषा छान्नुहोस्',
  'English': 'अंग्रेजी', 'Nepali': 'नेपाली', 'Units': 'एकाइहरू',
  'Privacy policy': 'गोपनीयता नीति', 'How your data is used': 'तपाईंको डेटा कसरी प्रयोग हुन्छ',
  'Help & support': 'सहायता र समर्थन', 'Get answers': 'जवाफ पाउनुहोस्',
  'Personal information': 'व्यक्तिगत जानकारी', 'Body details': 'शरीरको विवरण',
  'Target weight': 'लक्ष्य तौल', 'Set your goal weight': 'लक्ष्य तौल सेट गर्नुहोस्',
  'Health conditions': 'स्वास्थ्य अवस्था', 'Optional health details': 'वैकल्पिक स्वास्थ्य विवरण',
  'YOUR PLAN': 'तपाईंको योजना', 'PREFERENCES': 'प्राथमिकताहरू',
  'Edit': 'सम्पादन', 'Set up': 'सेटअप', 'DAILY KCAL': 'दैनिक क्यालोरी',
  'ACTIVITY': 'गतिविधि', 'DAY STREAK': 'दिनको निरन्तरता',
  'Camera preview': 'क्यामेरा पूर्वावलोकन', 'Starting your camera…': 'क्यामेरा सुरु हुँदैछ…',
  'Photo Ready to Scan': 'तस्बिर स्क्यानका लागि तयार छ', 'Retake': 'फेरि खिच्नुहोस्',
  'Center your food in the frame': 'खानालाई फ्रेमको बीचमा राख्नुहोस्',
  'Tap Scan Food below to analyze nutrition': 'पोषण विश्लेषण गर्न तल स्क्यान फूड थिच्नुहोस्',
  'Reading your meal': 'तपाईंको खाना पढिँदैछ', 'Identifying ingredients and nutrients': 'सामग्री र पोषक तत्त्व पहिचान हुँदैछ',
  'Scan Food': 'खाना स्क्यान गर्नुहोस्', 'Scanning…': 'स्क्यान हुँदैछ…', 'Gallery': 'ग्यालेरी', 'Switch': 'बदल्नुहोस्',
  'Scan Result': 'स्क्यान नतिजा', 'Food Details': 'खानाको विवरण', 'Calories': 'क्यालोरी',
  'Protein': 'प्रोटिन', 'Carbs': 'कार्बोहाइड्रेट', 'Fat': 'बोसो', 'Save to History': 'इतिहासमा सुरक्षित गर्नुहोस्',
  'Rescan Food': 'खाना फेरि स्क्यान गर्नुहोस्', 'Back': 'पछाडि', 'Complete your profile': 'प्रोफाइल पूरा गर्नुहोस्',
  'Set up your profile': 'आफ्नो प्रोफाइल सेटअप गर्नुहोस्', 'Today\'s Summary': 'आजको सारांश',
  'View progress': 'प्रगति हेर्नुहोस्', 'Last 7 days': 'पछिल्ला ७ दिन', 'Edit Goal': 'लक्ष्य सम्पादन गर्नुहोस्',
  'Save': 'सुरक्षित गर्नुहोस्', 'Cancel': 'रद्द गर्नुहोस्', 'Logout': 'लगआउट', 'kcal': 'किलो क्यालोरी',
  'food items detected': 'खाना पहिचान भए', 'No scan result to show yet.': 'अहिलेसम्म स्क्यान नतिजा छैन।'
};

const translateText = (value, language) => {
  if (language !== 'ne' || !value) return value;
  const trimmed = value.trim();
  const translated = nepaliCopy[trimmed];
  if (!translated) return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)]);
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)]);
};

function translateDocument(language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName) || parent.closest('[data-no-translate]')) return;
    if (!node.__khanalensOriginal) node.__khanalensOriginal = node.nodeValue;
    node.nodeValue = translateText(node.__khanalensOriginal, language);
  });
  document.documentElement.lang = language === 'ne' ? 'ne' : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) === 'ne' ? 'ne' : 'en');
  const setLanguage = useCallback((nextLanguage) => setLanguageState(nextLanguage === 'ne' ? 'ne' : 'en'), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    translateDocument(language);
    const observer = new MutationObserver(() => translateDocument(language));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t: (value) => translateText(value, language) }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
