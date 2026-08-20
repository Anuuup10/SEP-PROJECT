import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  Home: 'गृहपृष्ठ',
  Progress: 'प्रगति',
  Scan: 'स्क्यान',
  History: 'इतिहास',
  Profile: 'प्रोफाइल',
  Dashboard: 'ड्यासबोर्ड',
  'AI Scanner': 'एआई स्क्यानर',
  'Scan Food': 'खाना स्क्यान गर्नुहोस्',
  'Scan Result': 'स्क्यानको नतिजा',
  'Retake': 'फेरि खिच्नुहोस्',
  Gallery: 'ग्यालरी',
  'Switch camera': 'क्यामेरा बदल्नुहोस्',
  'Toggle flash': 'फ्ल्यास बदल्नुहोस्',
  'Photo Ready to Scan': 'फोटो स्क्यान गर्न तयार छ',
  'Tap Scan Food below to analyze nutrition': 'पोषण विश्लेषण गर्न तलको खाना स्क्यान गर्नुहोस्',
  'Center your food in the frame': 'खानालाई फ्रेमको बीचमा राख्नुहोस्',
  'Reading your meal': 'तपाईंको खाना पढिँदैछ',
  'Identifying ingredients and nutrients': 'सामग्री र पोषक तत्व पहिचान हुँदैछ',
  'Rescan Food': 'खाना फेरि स्क्यान गर्नुहोस्',
  'Nutrition Dashboard & History': 'पोषण ड्यासबोर्ड र इतिहास',
  'This Week': 'यो हप्ता',
  'Last 14 Days': 'पछिल्ला १४ दिन',
  'This Month': 'यो महिना',
  Calories: 'क्यालोरी',
  Protein: 'प्रोटिन',
  Carbs: 'कार्बोहाइड्रेट',
  'Total kcal': 'जम्मा क्यालोरी',
  Fats: 'बोसो',
  'Detected Items': 'पहिचान गरिएका खाना',
  'food items detected': 'खाना पहिचान गरियो',
  'Add to Tracker': 'ट्र्याकरमा थप्नुहोस्',
  'Added to Tracker': 'ट्र्याकरमा थपियो',
  'Save to history': 'इतिहासमा सुरक्षित गर्नुहोस्',
  'Saved to history': 'इतिहासमा सुरक्षित भयो',
  'Your Goals': 'तपाईंका लक्ष्यहरू',
  'Daily Goals': 'दैनिक लक्ष्यहरू',
  'Calorie Goal': 'क्यालोरी लक्ष्य',
  'Protein Goal': 'प्रोटिन लक्ष्य',
  'Daily Progress': 'दैनिक प्रगति',
  'Meal Planner': 'खाना योजना',
  'Meal Plan': 'खाना योजना',
  'Personal information': 'व्यक्तिगत जानकारी',
  'Target weight': 'लक्षित तौल',
  'Health conditions': 'स्वास्थ्य अवस्था',
  Units: 'एकाइहरू',
  Language: 'भाषा',
  'Privacy policy': 'गोपनीयता नीति',
  'Help & support': 'सहयोग र समर्थन',
  'Choose your preferred language': 'आफ्नो मनपर्ने भाषा छान्नुहोस्',
  English: 'अङ्ग्रेजी',
  'Set up': 'सेटअप गर्नुहोस्',
  Edit: 'सम्पादन गर्नुहोस्',
  'Set up your profile': 'आफ्नो प्रोफाइल सेटअप गर्नुहोस्',
  'Complete your profile': 'आफ्नो प्रोफाइल पूरा गर्नुहोस्',
  'Log out': 'लगआउट',
  Save: 'सुरक्षित गर्नुहोस्',
  Cancel: 'रद्द गर्नुहोस्',
  Close: 'बन्द गर्नुहोस्',
  Continue: 'जारी राख्नुहोस्',
  Back: 'पछाडि',
  'Save profile': 'प्रोफाइल सुरक्षित गर्नुहोस्',
  'Save units': 'एकाइहरू सुरक्षित गर्नुहोस्',
  'Save health details': 'स्वास्थ्य विवरण सुरक्षित गर्नुहोस्',
  'Save personal information': 'व्यक्तिगत जानकारी सुरक्षित गर्नुहोस्',
  Age: 'उमेर',
  Gender: 'लिङ्ग',
  Height: 'उचाइ',
  'Current weight': 'हालको तौल',
  'Select gender': 'लिङ्ग छान्नुहोस्',
  Female: 'महिला',
  Male: 'पुरुष',
  'Prefer not to say': 'भन्न चाहन्नँ',
  'No known conditions': 'कुनै ज्ञात स्वास्थ्य अवस्था छैन',
  Diabetes: 'मधुमेह',
  'High blood pressure': 'उच्च रक्तचाप',
  'High cholesterol': 'उच्च कोलेस्ट्रोल',
  'Food allergies': 'खानाको एलर्जी',
  Other: 'अन्य',
  'Privacy Policy': 'गोपनीयता नीति',
  'Need a hand?': 'सहयोग चाहिन्छ?',
  'Loading your profile…': 'तपाईंको प्रोफाइल लोड हुँदैछ…',
  'Please wait a moment.': 'कृपया केही समय पर्खनुहोस्।',
  'Complete your profile first': 'पहिले आफ्नो प्रोफाइल पूरा गर्नुहोस्',
  'Meal analyzed successfully': 'खानाको विश्लेषण सफल भयो',
  'No scan result to show yet.': 'अहिलेसम्म देखाउन स्क्यान नतिजा छैन।',
  'YOUR JOURNEY': 'तपाईंको यात्रा',
  'Goal Progress': 'लक्ष्य प्रगति',
  'Daily goal': 'दैनिक लक्ष्य',
  'AT A GLANCE': 'एक नजरमा',
  'Goal completion': 'लक्ष्य पूरा',
  'Small, consistent steps add up. Keep tracking to stay on course.': 'साना र निरन्तर प्रयासहरू जोडिँदै जान्छन्। सही बाटोमा रहन ट्र्याक गरिरहनुहोस्।',
  'Food Details': 'खानाको विवरण',
  'Nutrition Facts': 'पोषण विवरण',
  'REMOVE DETECTED FOOD': 'पहिचान गरिएको खाना हटाउनुहोस्',
  'Remove item': 'खाना हटाउनुहोस्',
  'READY TO TRACK': 'ट्र्याक गर्न तयार',
  'This meal will be added to your dashboard, history, and progress totals.': 'यो खाना तपाईंको ड्यासबोर्ड, इतिहास र प्रगति विवरणमा थपिनेछ।',
  'Add to tracker': 'ट्र्याकरमा थप्नुहोस्',
  'Welcome back!': 'फेरि स्वागत छ!',
  'Log in to your account': 'आफ्नो खातामा लगइन गर्नुहोस्',
  Email: 'इमेल',
  Password: 'पासवर्ड',
  'or continue with': 'वा यसबाट जारी राख्नुहोस्',
  'Create your account': 'आफ्नो खाता बनाउनुहोस्',
  'Full name': 'पूरा नाम',
  '7-Day Meal Plan': '७-दिने खाना योजना',
  '7 Days Starting Today': 'आजदेखि सुरु हुने ७ दिन',
  'Could not create 7-day meal plan': '७-दिने खाना योजना बनाउन सकिएन',
  'Generate Your 7-Day Plan': 'आफ्नो ७-दिने योजना बनाउनुहोस्',
  'Generate 7-Day Meal Plan': '७-दिने खाना योजना बनाउनुहोस्',
  Consumed: 'खाइसकेको',
  Left: 'बाँकी',
  'Daily Goal': 'दैनिक लक्ष्य',
  'Menu Items:': 'मेनुका खाना:',
  'Scan your food or add a meal to view your nutrition history here.': 'आफ्नो पोषण इतिहास हेर्न खाना स्क्यान गर्नुहोस् वा खाना थप्नुहोस्।',
  'Scan food now': 'अहिले खाना स्क्यान गर्नुहोस्',
  'Items breakdown': 'खानाको विवरण',
  'Last 7 days': 'पछिल्ला ७ दिन',
  'View progress': 'प्रगति हेर्नुहोस्',
  'Track your nutrition today': 'आजको पोषण ट्र्याक गर्नुहोस्',
  'Scan Your Food': 'आफ्नो खाना स्क्यान गर्नुहोस्',
  'Tap to scan or upload your meal': 'स्क्यान गर्न वा खाना अपलोड गर्न ट्याप गर्नुहोस्',
  'Scan your meal': 'आफ्नो खाना स्क्यान गर्नुहोस्',
  'Edit nutrition goals': 'पोषण लक्ष्यहरू सम्पादन गर्नुहोस्',
  'Save nutrition goals': 'पोषण लक्ष्यहरू सुरक्षित गर्नुहोस्',
  'Enter the targets that match your personal plan.': 'आफ्नो व्यक्तिगत योजनासँग मिल्ने लक्ष्यहरू लेख्नुहोस्।',
  'Complete your profile': 'आफ्नो प्रोफाइल पूरा गर्नुहोस्',
  'Select an avatar or upload your photo below.': 'अवतार छान्नुहोस् वा तल आफ्नो फोटो अपलोड गर्नुहोस्।',
  'Complete your profile': 'आफ्नो प्रोफाइल पूरा गर्नुहोस्',
  'What we collect': 'हामी के सङ्कलन गर्छौं',
  'How we use it': 'हामी यसको प्रयोग कसरी गर्छौं',
  'AI and sharing': 'एआई र साझेदारी',
  'Your choices': 'तपाईंका विकल्पहरू',
  'Scan. Analyze. Eat Smarter.': 'स्क्यान गर्नुहोस्। विश्लेषण गर्नुहोस्। अझ स्मार्ट खानुहोस्।',
  'AI-powered nutrition analysis': 'एआईद्वारा पोषण विश्लेषण',
  'for your everyday meals.': 'तपाईंका दैनिक खानाका लागि।',
  'Don’t have an account?': 'खाता छैन?',
  'Sign Up': 'साइन अप',
  'Scanning…': 'स्क्यान हुँदैछ…',
  Switch: 'बदल्नुहोस्',
};

const LanguageContext = createContext({ language: 'en', setLanguage: () => {} });

const nepaliToEnglish = Object.fromEntries(Object.entries(translations).map(([english, nepali]) => [nepali, english]));

const translateTree = (root, language) => {
  if (!root) return;
  const dictionary = language === 'ne' ? translations : nepaliToEnglish;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  nodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) return;
    const original = textNode.nodeValue;
    const trimmed = original.trim();
    if (!trimmed || !dictionary[trimmed]) return;
    textNode.nodeValue = original.replace(trimmed, dictionary[trimmed]);
  });
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('nutrilens_language') || 'en');
  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage) => {
      const next = nextLanguage === 'ne' ? 'ne' : 'en';
      localStorage.setItem('nutrilens_language', next);
      setLanguageState(next);
    },
  }), [language]);

  useEffect(() => {
    document.documentElement.lang = language === 'ne' ? 'ne' : 'en';
    const apply = () => translateTree(document.getElementById('root'), language);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return React.createElement(LanguageContext.Provider, { value }, children);
}

export const useLanguage = () => useContext(LanguageContext);
