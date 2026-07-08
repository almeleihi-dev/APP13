import type { SupportedLocale } from "./locale-types.js";

export type MessageKey =
  | "brand.tagline"
  | "entry.startFirstAct"
  | "entry.continueGuest"
  | "entry.whatCanActDo"
  | "guest.banner"
  | "guest.tryGoal"
  | "guest.tryProfession"
  | "guest.viewDemos"
  | "guest.demoLabel"
  | "builder.stepGoal"
  | "builder.stepProfession"
  | "builder.titleGoal"
  | "builder.titleProfession"
  | "builder.buildPreview"
  | "builder.discoverActions"
  | "preview.goalBecomes"
  | "preview.discoveredActions"
  | "preview.createPassportSave"
  | "preview.passportStores"
  | "passport.eyebrow"
  | "passport.createTitle"
  | "passport.country"
  | "passport.city"
  | "passport.region"
  | "passport.timeZone"
  | "passport.serviceRadius"
  | "passport.availability"
  | "passport.availability.remote"
  | "passport.availability.local"
  | "passport.availability.hybrid"
  | "passport.languages"
  | "location.remote"
  | "location.local"
  | "location.hybrid"
  | "marketplace.filter.location"
  | "marketplace.filter.language"
  | "marketplace.filter.remote"
  | "marketplace.nearMe"
  | "marketplace.sameCity"
  | "marketplace.sameCountry"
  | "marketplace.worldwide"
  | "team.languages"
  | "team.coverage"
  | "project.location"
  | "project.remoteTeamPossible"
  | "project.localTeamRequired"
  | "inventory.readyNow"
  | "inventory.needsVerification"
  | "inventory.unlockable"
  | "language.select";

const EN: Record<MessageKey, string> = {
  "brand.tagline": "One Action Can Change Everything",
  "entry.startFirstAct": "Start your first act",
  "entry.continueGuest": "Continue as Guest",
  "entry.whatCanActDo": "What can an act do for me?",
  "guest.banner": "Guest Preview — explore before registration",
  "guest.tryGoal": "Try a goal",
  "guest.tryProfession": "Try a profession",
  "guest.viewDemos": "View Guest demos",
  "guest.demoLabel": "Guest Preview · Demo Data",
  "builder.stepGoal": "Step 1 of 3 · Describe your goal",
  "builder.stepProfession": "Step 1 of 3 · Describe your profession",
  "builder.titleGoal": "What do you want to accomplish today?",
  "builder.titleProfession": "What profession or capability do you bring?",
  "builder.buildPreview": "Build preview",
  "builder.discoverActions": "Discover my actions",
  "preview.goalBecomes": "Your goal becomes {count} acts",
  "preview.discoveredActions": "We discovered {count} actions you can perform",
  "preview.createPassportSave": "Create your Professional Passport to save this act",
  "preview.passportStores": "Your passport stores actions, contracts, evidence, and trust growth.",
  "passport.eyebrow": "Professional Passport",
  "passport.createTitle": "Create your Professional Passport",
  "passport.country": "Country",
  "passport.city": "City",
  "passport.region": "Region",
  "passport.timeZone": "Time zone",
  "passport.serviceRadius": "Service radius (km)",
  "passport.availability": "Availability",
  "passport.availability.remote": "Remote 🌍",
  "passport.availability.local": "Local 📍",
  "passport.availability.hybrid": "Hybrid 🔁",
  "passport.languages": "Languages spoken",
  "location.remote": "Remote",
  "location.local": "Local",
  "location.hybrid": "Hybrid",
  "marketplace.filter.location": "Location",
  "marketplace.filter.language": "Language",
  "marketplace.filter.remote": "Remote availability",
  "marketplace.nearMe": "Near me",
  "marketplace.sameCity": "Same city",
  "marketplace.sameCountry": "Same country",
  "marketplace.worldwide": "Worldwide",
  "team.languages": "Languages",
  "team.coverage": "Coverage",
  "project.location": "Project location",
  "project.remoteTeamPossible": "Remote team possible",
  "project.localTeamRequired": "Local team required",
  "inventory.readyNow": "Ready Now",
  "inventory.needsVerification": "Needs Verification",
  "inventory.unlockable": "Unlockable",
  "language.select": "Language",
};

const DE: Record<MessageKey, string> = {
  ...EN,
  "brand.tagline": "Eine Handlung kann alles verändern",
  "entry.startFirstAct": "Starte deinen ersten Act",
  "entry.continueGuest": "Als Gast fortfahren",
  "entry.whatCanActDo": "Was kann an act für mich tun?",
  "guest.banner": "Gastvorschau — erkunden vor der Registrierung",
  "guest.tryGoal": "Ziel ausprobieren",
  "guest.tryProfession": "Beruf ausprobieren",
  "guest.viewDemos": "Gast-Demos ansehen",
  "guest.demoLabel": "Gastvorschau · Demo-Daten",
  "builder.stepGoal": "Schritt 1 von 3 · Beschreibe dein Ziel",
  "builder.stepProfession": "Schritt 1 von 3 · Beschreibe deinen Beruf",
  "builder.titleGoal": "Was möchtest du heute erreichen?",
  "builder.titleProfession": "Welchen Beruf oder welche Fähigkeit bringst du mit?",
  "builder.buildPreview": "Vorschau erstellen",
  "builder.discoverActions": "Meine Actions entdecken",
  "preview.goalBecomes": "Dein Ziel wird zu {count} Acts",
  "preview.discoveredActions": "Wir haben {count} Actions gefunden, die du ausführen kannst",
  "preview.createPassportSave": "Erstelle deinen Professional Passport, um diesen Act zu speichern",
  "preview.passportStores": "Dein Passport speichert Actions, Verträge, Nachweise und Vertrauenswachstum.",
  "passport.createTitle": "Erstelle deinen Professional Passport",
  "passport.country": "Land",
  "passport.city": "Stadt",
  "passport.region": "Region",
  "passport.timeZone": "Zeitzone",
  "passport.serviceRadius": "Service-Radius (km)",
  "passport.availability": "Verfügbarkeit",
  "passport.availability.remote": "Remote 🌍",
  "passport.availability.local": "Lokal 📍",
  "passport.availability.hybrid": "Hybrid 🔁",
  "passport.languages": "Gesprochene Sprachen",
  "marketplace.filter.location": "Standort",
  "marketplace.filter.language": "Sprache",
  "marketplace.filter.remote": "Remote-Verfügbarkeit",
  "marketplace.nearMe": "In meiner Nähe",
  "marketplace.sameCity": "Gleiche Stadt",
  "marketplace.sameCountry": "Gleiches Land",
  "marketplace.worldwide": "Weltweit",
  "team.languages": "Sprachen",
  "team.coverage": "Abdeckung",
  "project.location": "Projektstandort",
  "project.remoteTeamPossible": "Remote-Team möglich",
  "project.localTeamRequired": "Lokales Team erforderlich",
  "inventory.readyNow": "Sofort bereit",
  "inventory.needsVerification": "Verifizierung nötig",
  "inventory.unlockable": "Freischaltbar",
  "language.select": "Sprache",
};

const AR: Record<MessageKey, string> = {
  ...EN,
  "brand.tagline": "فعل واحد يمكن أن يغيّر كل شيء",
  "entry.startFirstAct": "ابدأ أول act",
  "entry.continueGuest": "المتابعة كضيف",
  "entry.whatCanActDo": "ماذا يمكن أن يفعل an act من أجلي؟",
  "guest.banner": "معاينة الضيف — استكشف قبل التسجيل",
  "guest.tryGoal": "جرّب هدفًا",
  "guest.tryProfession": "جرّب مهنة",
  "guest.viewDemos": "عرض demos الضيف",
  "guest.demoLabel": "معاينة الضيف · بيانات تجريبية",
  "builder.stepGoal": "الخطوة 1 من 3 · صِف هدفك",
  "builder.stepProfession": "الخطوة 1 من 3 · صِف مهنتك",
  "builder.titleGoal": "ماذا تريد أن تنجز اليوم؟",
  "builder.titleProfession": "ما المهنة أو القدرة التي تقدّمها؟",
  "builder.buildPreview": "إنشاء معاينة",
  "builder.discoverActions": "اكتشف actions الخاصة بي",
  "preview.goalBecomes": "هدفك يصبح {count} acts",
  "preview.discoveredActions": "اكتشفنا {count} actions يمكنك تنفيذها",
  "preview.createPassportSave": "أنشئ Professional Passport لحفظ هذا act",
  "preview.passportStores": "يخزّن passport الخاص بك actions وcontracts وevidence ونمو الثقة.",
  "passport.createTitle": "أنشئ Professional Passport",
  "passport.country": "البلد",
  "passport.city": "المدينة",
  "passport.region": "المنطقة",
  "passport.timeZone": "المنطقة الزمنية",
  "passport.serviceRadius": "نطاق الخدمة (كم)",
  "passport.availability": "التوفر",
  "passport.availability.remote": "عن بُعد 🌍",
  "passport.availability.local": "محلي 📍",
  "passport.availability.hybrid": "مختلط 🔁",
  "passport.languages": "اللغات المتحدثة",
  "marketplace.filter.location": "الموقع",
  "marketplace.filter.language": "اللغة",
  "marketplace.filter.remote": "التوفر عن بُعد",
  "marketplace.nearMe": "بالقرب مني",
  "marketplace.sameCity": "نفس المدينة",
  "marketplace.sameCountry": "نفس البلد",
  "marketplace.worldwide": "عالمي",
  "team.languages": "اللغات",
  "team.coverage": "التغطية",
  "project.location": "موقع المشروع",
  "project.remoteTeamPossible": "فريق عن بُعد ممكن",
  "project.localTeamRequired": "فريق محلي مطلوب",
  "inventory.readyNow": "جاهز الآن",
  "inventory.needsVerification": "يحتاج تحقق",
  "inventory.unlockable": "قابل للفتح",
  "language.select": "اللغة",
};

export const MESSAGES: Record<SupportedLocale, Record<MessageKey, string>> = {
  en: EN,
  de: DE,
  ar: AR,
};

export function translate(
  locale: SupportedLocale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text = MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, String(value));
    }
  }
  return text;
}
