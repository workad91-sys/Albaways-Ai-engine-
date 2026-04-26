/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Loader2, 
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  FileDown,
  FileText,
  FileCode,
  Moon,
  Map as MapIcon,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateItinerary, translateItinerary, draftItinerary, Itinerary, DayPlan, ItineraryItem } from "./lib/gemini";
import MapView from "./components/MapView";

const LOADING_MESSAGES: Record<string, string[]> = {
  English: [
    "Mapping out your journey...",
    "Finding the best local spots...",
    "Consulting the travel guides...",
    "Curating your experiences...",
    "Packing the virtual bags...",
  ],
  Arabic: [
    "يرسم مسار رحلتك...",
    "البحث عن أفضل الأماكن المحلية...",
    "استشارة أدلة السفر...",
    "تنظيم تجاربك...",
    "تعبئة الحقائب الافتراضية...",
  ],
  Spanish: [
    "Trazando tu viaje...",
    "Buscando los mejores lugares locales...",
    "Consultando las guías de viaje...",
    "Curando tus experiencias...",
    "Empacando las maletas virtuales...",
  ]
};

const UI_TRANSLATIONS = {
  English: {
    itinerary: "Itinerary",
    discover: "Discover",
    myPhotos: "My Photos",
    settings: "Settings",
    placeholder: "Where to? (e.g. '3 days in Tokyo')",
    planTrip: "Plan Trip",
    startJourney: "Your journey starts here.",
    print: "Print Guide",
    download: "Download HTML",
    overnight: "Overnight",
    personalSnapshot: "+ Add Personal Snapshot",
    investment: "Trip Investment",
    pricePerPerson: "Price per person (Shared Room)",
    privateUpgrade: "Private Room Upgrade",
    includes: "The Trip Includes",
    notIncludes: "Not Included",
    experience: "Experience",
    export: "Export Trip",
    asPdf: "Export as PDF",
    asHtml: "Export as HTML",
    includesItems: [
      "Boutique accommodation",
      "All specified ground transport",
      "Expert local curation",
      "Selected cultural entrance fees"
    ],
    notIncludesItems: [
      "International airfare",
      "Travel insurance",
      "Personal expenses",
      "Optional tipping"
    ],
    dayPrefix: "Day",
    curatedFor: "Curated experiences for",
    aiMode: "AI Generation",
    manualMode: "Manual Content",
    uploadHtml: "Upload HTML",
    manualPlaceholder: "Enter your itinerary details here (describe your days, activities, and locations)...",
    createTrip: "Create Trip",
    listView: "Narrative View",
    mapView: "Map Exploration",
    note: "Important Note"
  },
  Arabic: {
    itinerary: "مسار الرحلة",
    discover: "اكتشف",
    myPhotos: "صوري",
    settings: "الإعدادات",
    placeholder: "إلى أين؟ (مثلاً '3 أيام في طوكيو')",
    planTrip: "خطط للرحلة",
    startJourney: "رحلتك تبدأ من هنا.",
    print: "طباعة الدليل",
    download: "تحميل HTML",
    overnight: "المبيت",
    personalSnapshot: "+ أضف لقطة شخصية",
    investment: "استثمار الرحلة",
    pricePerPerson: "السعر للشخص الواحد (غرفة مشتركة)",
    privateUpgrade: "ترقية الغرفة الخاصة",
    includes: "تتضمن الرحلة",
    notIncludes: "لا تتضمن",
    experience: "تجربة",
    export: "تصدير الرحلة",
    asPdf: "تصدير كـ PDF",
    asHtml: "تصدير كـ HTML",
    includesItems: [
      "إقامة في فنادق فاخرة",
      "جميع وسائل النقل البري المحددة",
      "تنسيق محلي خبير",
      "رسوم دخول ثقافية مختارة"
    ],
    notIncludesItems: [
      "تذاكر الطيران الدولية",
      "تأمين السفر",
      "النفقات الشخصية",
      "الإكراميات الاختيارية"
    ],
    dayPrefix: "اليوم",
    curatedFor: "تجارب منسقة لـ",
    aiMode: "إنشاء الذكاء الاصطناعي",
    manualMode: "محتوى يدوي",
    uploadHtml: "رفع ملف HTML",
    manualPlaceholder: "أدخل تفاصيل مسار رحلتك هنا (صف أيامك وأنشطتك ومواقعك)...",
    createTrip: "إنشاء الرحلة",
    listView: "عرض سردي",
    mapView: "استكشاف الخريطة",
    note: "ملاحظة هامة"
  },
  Spanish: {
    itinerary: "Itinerario",
    discover: "Descubrir",
    myPhotos: "Mis Fotos",
    settings: "Ajustes",
    placeholder: "¿A dónde? (ej. '3 días en Tokio')",
    planTrip: "Planear Viaje",
    startJourney: "Tu viaje comienza aquí.",
    print: "Imprimir Guía",
    download: "Descargar HTML",
    overnight: "Pernoctar",
    personalSnapshot: "+ Añadir Foto Personal",
    investment: "Inversión del Viaje",
    pricePerPerson: "Precio por persona (Hab. Compartida)",
    privateUpgrade: "Mejora a Hab. Privada",
    includes: "El Viaje Incluye",
    notIncludes: "No Incluido",
    experience: "Experiencia",
    export: "Exportar Viaje",
    asPdf: "Exportar como PDF",
    asHtml: "Exportar como HTML",
    includesItems: [
      "Alojamiento boutique",
      "Todo el transporte terrestre especificado",
      "Curaduría local experta",
      "Entradas culturales seleccionadas"
    ],
    notIncludesItems: [
      "Vuelos internacionales",
      "Seguro de viaje",
      "Gastos personales",
      "Propinas opcionales"
    ],
    dayPrefix: "Día",
    curatedFor: "Experiencias curadas para",
    aiMode: "Generación por IA",
    manualMode: "Contenido Manual",
    uploadHtml: "Subir HTML",
    manualPlaceholder: "Ingresa los detalles de tu itinerario aquí (describe tus días, actividades y lugares)...",
    createTrip: "Crear Viaje",
    listView: "Vista Narrativa",
    mapView: "Exploración en Mapa",
    note: "Nota Importante"
  }
};

type Language = "English" | "Arabic" | "Spanish";

export default function App() {
  const [lang, setLang] = useState<Language>("English");
  const [prompt, setPrompt] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [itineraryLang, setItineraryLang] = useState<Language | null>(null);
  const [inputMode, setInputMode] = useState<"ai" | "manual" | "upload">("ai");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [userPhotos, setUserPhotos] = useState<Record<string, string[]>>({}); // activityKey -> blobUrls[]
  const fileInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const [activeActivityKey, setActiveActivityKey] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const t = UI_TRANSLATIONS[lang];
  const isRtl = lang === "Arabic";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setItinerary(null);
    
    // Cycle loading messages
    const msgs = LOADING_MESSAGES[lang];
    const msgInterval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % msgs.length);
    }, 2500);

    try {
      const data = inputMode === "ai" 
        ? await generateItinerary(prompt, lang)
        : await draftItinerary(prompt, lang);
      setItinerary(data);
      setItineraryLang(lang);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      alert(lang === "Arabic" ? "حدث خطأ ما أثناء التخطيط لرحلتك. يرجى المحاولة مرة أخرى." : lang === "Spanish" ? "Algo salió mal al planear tu viaje. Por favor intenta de nuevo." : "Something went wrong while planning your trip. Please try again.");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itinerary && itineraryLang && itineraryLang !== lang) {
      const performTranslation = async () => {
        setLoading(true);
        try {
          const translated = await translateItinerary(itinerary, lang);
          setItinerary(translated);
          setItineraryLang(lang);
        } catch (error) {
          console.error("Translation failed:", error);
        } finally {
          setLoading(false);
        }
      };
      performTranslation();
    }
  }, [lang, itinerary, itineraryLang]);

  const handleHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const bundleMatch = content.match(/const BUNDLE = (\{.*?\});/s);
        const photosMatch = content.match(/const PHOTOS = (\{.*?\});/s);

        if (bundleMatch && bundleMatch[1]) {
          const bundle = JSON.parse(bundleMatch[1]);
          const photos = photosMatch && photosMatch[1] ? JSON.parse(photosMatch[1]) : {};
          
          const importedItinerary = bundle[lang] || Object.values(bundle)[0];
          setItinerary(importedItinerary);
          setItineraryLang(lang);
          setUserPhotos(photos);
        } else {
          throw new Error("Invalid itinerary file");
        }
      } catch (err) {
        console.error("Failed to parse HTML:", err);
        alert(isRtl ? "فشل استيراد الملف. تأكد أنه ملف صالح تم تصديره من هذا التطبيق." : "Failed to import file. Make sure it's a valid HTML exported from this app.");
      } finally {
        setLoading(false);
        if (htmlInputRef.current) htmlInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeActivityKey) {
      const url = URL.createObjectURL(file);
      setUserPhotos(prev => {
        const existing = prev[activeActivityKey] || [];
        return { ...prev, [activeActivityKey]: [...existing, url] };
      });
      setActiveActivityKey(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deletePhoto = (key: string, idx: number) => {
    setUserPhotos(prev => {
      const existing = [...(prev[key] || [])];
      existing.splice(idx, 1);
      return { ...prev, [key]: existing };
    });
  };

  const getImageUrl = (item: ItineraryItem, dayIndex: number, itemIndex: number): string[] => {
    const key = `${dayIndex}-${itemIndex}`;
    const userUploaded = userPhotos[key] || [];
    
    if (userUploaded.length > 0) return userUploaded;
    
    // Fallback: Use the imageKeyword to get a seeded image from Picsum
    const seed = encodeURIComponent(`${item.imageKeyword}-${item.location}`);
    return [`https://picsum.photos/seed/${seed}/1200/1200`];
  };

  return (
    <div className={`min-h-screen bg-bg text-[#F2F2F2] font-sans selection:bg-accent/30 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="h-[70px] px-6 md:px-10 flex items-center justify-between border-b border-border sticky top-0 bg-bg/80 backdrop-blur-md z-40">
        <div className="font-serif text-xl md:text-2xl tracking-[2px] uppercase text-accent">Albaways</div>
        
        <div className="flex items-center gap-12">
          <nav className="hidden md:flex gap-8">
            <a href="#" className="text-white text-xs uppercase tracking-[1px] border-b border-accent pb-1">{t.itinerary}</a>
          </nav>

          <div className="flex items-center bg-card border border-border rounded-full p-1 h-10 shadow-lg">
            {(["English", "Arabic", "Spanish"] as Language[]).map((l) => {
              const labels = { English: "EN", Arabic: "AR", Spanish: "ES" };
              return (
                <button
                  key={l}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLang(l);
                  }}
                  className={`px-4 h-full rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer z-50 ${
                    lang === l ? "bg-accent text-bg shadow-inner scale-105" : "text-dim hover:text-white"
                  }`}
                >
                  {labels[l]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative transition-all duration-700 ease-in-out flex items-center justify-center overflow-hidden border-b border-border ${itinerary ? 'h-[25vh]' : 'h-[50vh]'}`}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
            className={`w-full h-full object-cover grayscale-[0.5] transition-opacity duration-1000 ${itinerary ? 'opacity-10' : 'opacity-30'}`}
            referrerPolicy="no-referrer"
            alt="Travel Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 text-center">
          <motion.div
            layout
            transition={{ duration: 0.8, type: "spring", bounce: 0 }}
          >
            <h1 className={`font-serif font-light tracking-tight transition-all duration-700 ${itinerary ? 'text-3xl md:text-4xl mb-4' : 'text-5xl md:text-7xl mb-6'}`}>
              Albaways <span className="font-sans italic font-normal text-white/40">AI</span>
            </h1>
            
            <AnimatePresence>
              {!itinerary && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-lg text-dim mb-10 max-w-xl mx-auto leading-relaxed uppercase tracking-[2px] text-xs overflow-hidden"
                >
                  Crafting bespoke journeys through machine intelligence.
                </motion.p>
              )}
            </AnimatePresence>

            <div className={`flex justify-center gap-4 mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button 
                type="button"
                onClick={() => setInputMode('ai')}
                className={`text-[10px] uppercase tracking-[2px] px-6 py-2 rounded-full border transition-all ${inputMode === 'ai' ? 'bg-accent border-accent text-bg font-bold shadow-lg scale-105' : 'border-border text-dim hover:text-white backdrop-blur-sm'}`}
              >
                {t.aiMode}
              </button>
              <button 
                type="button"
                onClick={() => setInputMode('manual')}
                className={`text-[10px] uppercase tracking-[2px] px-6 py-2 rounded-full border transition-all ${inputMode === 'manual' ? 'bg-accent border-accent text-bg font-bold shadow-lg scale-105' : 'border-border text-dim hover:text-white backdrop-blur-sm'}`}
              >
                {t.manualMode}
              </button>
              <button 
                type="button"
                onClick={() => setInputMode('upload')}
                className={`text-[10px] uppercase tracking-[2px] px-6 py-2 rounded-full border transition-all ${inputMode === 'upload' ? 'bg-accent border-accent text-bg font-bold shadow-lg scale-105' : 'border-border text-dim hover:text-white backdrop-blur-sm'}`}
              >
                {t.uploadHtml}
              </button>
            </div>

            <form onSubmit={handleGenerate} className="relative group max-w-2xl mx-auto">
              {inputMode === 'ai' ? (
                <div className="flex bg-bg/50 backdrop-blur-md border border-border rounded-full p-1 md:p-1.5 focus-within:border-accent transition-all shadow-2xl">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm focus:outline-none placeholder:text-dim/50"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className={`px-4 md:px-8 py-2.5 md:py-3 bg-accent text-bg hover:bg-white hover:text-bg disabled:bg-border disabled:text-dim disabled:cursor-not-allowed rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-[1px] transition-all flex items-center gap-2`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t.planTrip
                    )}
                  </button>
                </div>
              ) : inputMode === 'manual' ? (
                <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 focus-within:border-accent transition-all shadow-2xl">
                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.manualPlaceholder}
                    className="w-full bg-transparent ps-2 py-2 text-sm focus:outline-none placeholder:text-dim/50 resize-none mb-4 scrollbar-hide"
                    disabled={loading}
                  />
                  <div className={`flex justify-end`}>
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className={`px-12 py-3 bg-accent text-bg hover:bg-white hover:text-bg disabled:bg-border disabled:text-dim disabled:cursor-not-allowed rounded-full text-[11px] font-bold uppercase tracking-[1px] transition-all flex items-center gap-2`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.createTrip
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => htmlInputRef.current?.click()}
                  className="bg-card/30 backdrop-blur-md border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-card/50 transition-all group shadow-2xl"
                >
                   <Upload className="w-10 h-10 text-dim group-hover:text-accent mb-4 transition-colors" />
                   <div className="text-sm font-medium text-white mb-2">{t.uploadHtml}</div>
                   <div className="text-xs text-dim">{isRtl ? 'اسحب وأفلت الملف هنا أو انقر للاختيار' : 'Drag & drop file here or click to browse'}</div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212]/90 backdrop-blur-sm"
          >
            <div className="relative">
              <div className="w-24 h-24 border-2 border-white/10 rounded-full animate-pulse" />
              <Loader2 className="w-10 h-10 text-accent animate-spin absolute inset-0 m-auto" />
            </div>
            <motion.p 
              key={loadingMsgIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 text-xs font-medium tracking-[4px] uppercase text-accent"
            >
              {LOADING_MESSAGES[lang][loadingMsgIdx]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {itinerary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Itinerary Header */}
            <div className={`mb-12 md:mb-20 text-center md:text-start flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-border pb-12`}>
              <div className="max-w-2xl px-2 md:px-0">
                <div className={`flex items-center justify-center md:justify-start gap-2 text-accent mb-4 tracking-[3px] uppercase text-[9px] md:text-[10px] font-bold`}>
                  <span className="w-8 h-[1px] bg-accent" />
                  {itinerary.duration} &bull; {itinerary.destination}
                </div>
                <h2 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => setItinerary(prev => prev ? {...prev, title: (e.target as HTMLElement).innerText} : null)}
                  className="text-3xl md:text-6xl font-serif font-light mb-6 tracking-tight outline-none focus:text-accent transition-colors leading-tight"
                >
                  {itinerary.title}
                </h2>
                <div className="text-[10px] md:text-xs text-dim uppercase tracking-[1px] mb-6">
                  {t.discover} &bull; {itinerary.destination}
                </div>
                <p 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => setItinerary(prev => prev ? {...prev, overview: (e.target as HTMLElement).innerText} : null)}
                  className="text-sm md:text-base text-dim leading-relaxed font-light max-w-xl mx-auto md:mx-0 outline-none focus:text-white transition-colors"
                >
                  {itinerary.overview}
                </p>

                {/* View Mode Switcher */}
                <div className={`mt-10 flex gap-4 justify-center md:justify-start`}>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] uppercase tracking-[2px] transition-all ${viewMode === 'list' ? 'bg-accent border-accent text-bg font-bold shadow-lg' : 'border-border text-dim hover:text-white'}`}
                  >
                    <Layout size={14} />
                    {t.listView}
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] uppercase tracking-[2px] transition-all ${viewMode === 'map' ? 'bg-accent border-accent text-bg font-bold shadow-lg' : 'border-border text-dim hover:text-white'}`}
                  >
                    <MapIcon size={14} />
                    {t.mapView}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 relative">
                <div className="relative">
                  <button
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="px-8 py-3 bg-accent text-bg rounded-full hover:bg-white transition-all text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                  >
                    <FileDown className="w-4 h-4" />
                    {t.export}
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExportOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                      >
                        <button
                          onClick={() => {
                            window.print();
                            setIsExportOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-dim hover:text-white hover:bg-white/5 rounded-xl transition-colors text-xs font-medium"
                        >
                          <FileText className="w-4 h-4 text-accent" />
                          {t.asPdf}
                        </button>
                        <button
                          disabled={loading}
                          onClick={async () => {
                            if (!itinerary) return;
                            setLoading(true);
                            setIsExportOpen(false);

                            try {
                              const langs: Language[] = ["English", "Arabic", "Spanish"];
                              const dataBundle: Record<string, Itinerary> = {};
                              
                              await Promise.all(langs.map(async (l) => {
                                if (itineraryLang === l) {
                                  dataBundle[l] = itinerary;
                                } else {
                                  dataBundle[l] = await translateItinerary(itinerary, l);
                                }
                              }));

                              // Convert user photos to base64 for offline portability
                              const base64Photos: Record<string, string[]> = {};
                              const toBase64 = async (url: string) => {
                                if (url.startsWith('http')) return url; // Don't convert external URLs
                                try {
                                  const response = await fetch(url);
                                  const blob = await response.blob();
                                  return new Promise<string>((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(blob);
                                  });
                                } catch (e) {
                                  return url;
                                }
                              };

                              for (const key in userPhotos) {
                                base64Photos[key] = await Promise.all(userPhotos[key].map(toBase64));
                              }

                              const docLang = lang === 'Arabic' ? 'ar' : lang === 'Spanish' ? 'es' : 'en';
                              const docDir = lang === 'Arabic' ? 'rtl' : 'ltr';

                              const html = `
<!DOCTYPE html>
<html dir="${docDir}" lang="${docLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${itinerary.title}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    :root { --accent: #FBB040; --bg: #121212; --card: #1a1a1a; --text: #f2f2f2; --dim: #a0a0a0; }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); padding: 20px; margin: 0; transition: all 0.3s ease; line-height: 1.5; text-align: start; }
    @media (min-width: 768px) { body { padding: 40px; } }
    html[lang="ar"] body { font-family: 'Noto Sans Arabic', sans-serif; }
    .container { max-width: 1000px; margin-inline: auto; }
    h1, h2, h3 { font-family: 'Playfair Display', serif; color: var(--accent); }
    html[lang="ar"] h1, html[lang="ar"] h2, html[lang="ar"] h3 { font-family: 'Noto Sans Arabic', sans-serif; }
    .header { text-align: center; margin-bottom: 40px; }
    @media (min-width: 768px) { .header { margin-bottom: 60px; } }
    .brand { color: #666; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
    @media (min-width: 768px) { .brand { font-size: 11px; letter-spacing: 4px; margin-bottom: 24px; } }
    .title { font-size: 32px; margin: 0 0 10px 0; font-weight: normal; line-height: 1.2; color: white; }
    @media (min-width: 768px) { .title { font-size: 56px; line-height: 1.1; } }
    .meta { color: var(--accent); text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 600; }
    .overview { font-size: 15px; color: var(--dim); margin: 30px auto; line-height: 1.6; font-weight: 300; max-width: 800px; }
    @media (min-width: 768px) { .overview { font-size: 18px; margin: 40px auto; line-height: 1.7; } }
    #map { height: 350px; width: 100%; border-radius: 16px; margin-bottom: 40px; border: 1px solid #333; z-index: 1; }
    @media (min-width: 768px) { #map { height: 500px; border-radius: 24px; margin-bottom: 80px; } }
    .day { margin-bottom: 60px; border-inline-start: 2px solid var(--accent); padding-inline-start: 20px; position: relative; }
    @media (min-width: 768px) { .day { margin-bottom: 100px; border-inline-start-width: 3px; padding-inline-start: 40px; } }
    .day-header { margin-bottom: 30px; }
    .day-title { font-size: 24px; color: white; margin: 0 0 8px 0; }
    @media (min-width: 768px) { .day-title { font-size: 32px; } }
    .day-desc { color: var(--dim); font-size: 14px; font-style: italic; margin-bottom: 12px; }
    .overnight { color: var(--accent); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .activity { display: flex; flex-direction: column; gap: 20px; margin-bottom: 50px; align-items: flex-start; }
    @media (min-width: 768px) { .activity { flex-direction: row; gap: 40px; margin-bottom: 80px; } }
    .activity-imgs { width: 100%; display: flex; flex-direction: column; gap: 15px; }
    @media (min-width: 768px) { .activity-imgs { width: 320px; gap: 20px; } }
    .activity-img { width: 100%; height: 250px; border-radius: 12px; object-fit: cover; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
    @media (min-width: 768px) { .activity-img { height: 320px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); } }
    .activity-info { flex: 1; text-align: start; }
    .activity-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 15px; }
    .pill { background: rgba(251, 176, 64, 0.1); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .loc { color: #666; font-size: 11px; font-weight: 500; }
    .activity h3 { margin: 0 0 10px 0; color: white; font-size: 22px; font-weight: 400; font-family: 'Playfair Display', serif; }
    @media (min-width: 768px) { .activity h3 { font-size: 26px; margin: 0 0 15px 0; } }
    html[lang="ar"] .activity h3 { font-family: 'Noto Sans Arabic', sans-serif; font-weight: 700; }
    .activity p { margin: 0; line-height: 1.6; color: #ccc; font-size: 15px; font-weight: 300; }
    @media (min-width: 768px) { .activity p { line-height: 1.8; font-size: 16px; } }
    .investment-box { margin-top: 60px; padding: 25px; border: 1px solid rgba(251,176,64,0.3); background: #1a1a1a; border-radius: 16px; }
    @media (min-width: 768px) { .investment-box { margin-top: 100px; padding: 50px; border-radius: 24px; } }
    .inv-header { font-size: 20px; color: var(--accent); margin: 0 0 30px 0; border-bottom: 1px solid #333; padding-bottom: 15px; text-align: center; }
    .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px; }
    @media (min-width: 768px) { .pricing-grid { grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; } }
    .price-item { border-bottom: 1px solid #333; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
    .price-label { font-size: 10px; color: var(--dim); text-transform: uppercase; letter-spacing: 1px; }
    .price-val { font-size: 22px; color: white; font-family: 'Playfair Display', serif; }
    @media (min-width: 768px) { .price-val { font-size: 28px; } }
    .inclusions-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
    @media (min-width: 768px) { .inclusions-grid { grid-template-columns: 1fr 1fr; gap: 60px; } }
    .inc-header { font-size: 10px; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 16px; text-align: start; }
    .not-inc-header { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 16px; text-align: start; }
    .list { list-style: none; padding: 0; margin: 0; }
    .list li { color: var(--dim); font-size: 13px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px; text-align: start; }
    .dot { margin-top: 6px; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
    .dot-dim { margin-top: 6px; width: 4px; height: 4px; border-radius: 50%; background: #333; flex-shrink: 0; }
    .lang-picker { position: fixed; bottom: 20px; inset-inline-end: 20px; background: rgba(26,26,26,0.9); backdrop-filter: blur(10px); border: 1px solid var(--accent); border-radius: 40px; padding: 4px; display: flex; gap: 4px; z-index: 2000; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
    @media (min-width: 768px) { .lang-picker { top: 30px; bottom: auto; inset-inline-end: 30px; padding: 6px; gap: 6px; } }
    .lang-btn { background: transparent; border: none; color: #666; padding: 8px 14px; border-radius: 30px; cursor: pointer; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; transition: all 0.3s ease; }
    @media (min-width: 768px) { .lang-btn { padding: 10px 18px; font-size: 11px; } }
    .lang-btn.active { background: var(--accent); color: var(--bg); transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="lang-picker">
    <button class="lang-btn ${lang === 'English' ? 'active' : ''}" onclick="updateView('English')">EN</button>
    <button class="lang-btn ${lang === 'Arabic' ? 'active' : ''}" onclick="updateView('Arabic')">AR</button>
    <button class="lang-btn ${lang === 'Spanish' ? 'active' : ''}" onclick="updateView('Spanish')">ES</button>
  </div>
  <div class="container" id="content-root"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const UI = ${JSON.stringify(UI_TRANSLATIONS)};
    const BUNDLE = ${JSON.stringify(dataBundle)};
    const PHOTOS = ${JSON.stringify(base64Photos)};
    let map = null;
    let markers = [];

    function updateView(lang) {
      const data = BUNDLE[lang];
      const t = UI[lang];
      const isAr = lang === 'Arabic';
      document.documentElement.lang = isAr ? 'ar' : lang === 'Spanish' ? 'es' : 'en';
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';

      document.querySelectorAll('.lang-btn').forEach(btn => {
        const code = lang === 'English' ? 'EN' : isAr ? 'AR' : 'ES';
        btn.classList.toggle('active', btn.innerText === code);
      });
      const root = document.getElementById('content-root');
      root.innerHTML = \`
        <div class="header">
          <div class="brand">Albaways AI &bull; \${t.itinerary}</div>
          <h1 class="title">\${data.title}</h1>
          <div class="meta">\${data.duration} &bull; \${data.destination}</div>
          <p class="overview">\${data.overview}</p>
        </div>
        <div id="map"></div>
        \${data.days.map((d, dIdx) => \`
          <div class="day">
            <div class="day-header">
              <div class="meta">\${t.dayPrefix} \${d.day}</div>
              <h2 class="day-title">\${d.theme}</h2>
              <div class="day-snapshots" style="display: flex; gap: 10px; margin: 20px 0; overflow-x: auto; padding-bottom: 10px;">
                \${(PHOTOS['day-' + dIdx] || []).map(url => \`
                  <img src="\${url}" style="height: 120px; border-radius: 8px; object-fit: cover;">
                \`).join('')}
              </div>
              <p class="day-desc">\${d.description}</p>
              <p class="overnight"><strong>\${t.overnight}:</strong> \${d.overnightLocation}</p>
            </div>
            \${d.items.map((i, iIdx) => \`
              <div class="activity" style="flex-direction: \${isAr ? 'row-reverse' : 'row'}">
                <div class="activity-imgs">
                  \${getImgUrls(lang, dIdx, iIdx).map(url => \`
                    <img class="activity-img" src="\${url}" alt="\${i.activity}">
                  \`).join('')}
                </div>
                <div class="activity-info">
                  <div class="activity-meta" style="flex-direction: \${isAr ? 'row-reverse' : 'row'}">
                    <span class="pill">\${i.time || t.experience}</span>
                    <span class="loc">\${i.location}</span>
                  </div>
                  <h3>\${i.activity}</h3>
                  <p>\${i.description}</p>
                </div>
              </div>
            \`).join('')}
          </div>
        \`).join('')}
        <div class="investment-box">
          <h2 class="inv-header">\${t.investment}</h2>
          <div class="pricing-grid">
            <div class="price-item" style="flex-direction: \${isAr ? 'row-reverse' : 'row'}">
              <span class="price-label">\${t.pricePerPerson}</span>
              <span class="price-val">\${data.currencySymbol}\${(data.estimatedPricePerPerson || 1499).toLocaleString()}</span>
            </div>
            <div class="price-item" style="flex-direction: \${isAr ? 'row-reverse' : 'row'}">
              <span class="price-label">\${t.privateUpgrade}</span>
              <span class="price-val">+\${data.currencySymbol}\${(data.estimatedPrivateUpgrade || 450).toLocaleString()}</span>
            </div>
          </div>
          <div class="inclusions-grid">
            <div>
              <h4 class="inc-header">\${t.includes}</h4>
              <ul class="list">
                \${(data.includes || t.includesItems).map(item => \`
                  <li style="flex-direction: \${isAr ? 'row-reverse' : 'row'}"><span class="dot"></span>\${item}</li>
                \`).join('')}
              </ul>
            </div>
            <div>
              <h4 class="not-inc-header">\${t.notIncludes}</h4>
              <ul class="list">
                \${(data.notIncludes || t.notIncludesItems).map(item => \`
                  <li style="flex-direction: \${isAr ? 'row-reverse' : 'row'}"><span class="dot-dim"></span>\${item}</li>
                \`).join('')}
              </ul>
            </div>
          </div>
          \${data.note ? \`
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
              <h4 class="inc-header" style="color: #666;">\${t.note}</h4>
              <p style="font-size: 14px; color: var(--dim); line-height: 1.6; font-style: italic;">\${data.note}</p>
            </div>
          \` : ''}
        </div>
      \`;
      initMap(data);
    }

    function getImgUrls(lang, dIdx, iIdx) {
      const key = dIdx + '-' + iIdx;
      if (PHOTOS[key] && PHOTOS[key].length > 0) return PHOTOS[key];
      const activity = BUNDLE[lang].days[dIdx].items[iIdx];
      return ['https://picsum.photos/seed/' + encodeURIComponent(activity.activity) + '/800/800'];
    }

    function initMap(data) {
      if (map) { map.remove(); }
      const points = data.days.flatMap(d => d.items.filter(i => i.lat && i.lng).map(i => ({ lat: i.lat, lng: i.lng, title: i.activity })));
      if (points.length === 0) return;
      map = L.map('map').setView([points[0].lat, points[0].lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      markers = points.map(p => L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.title));
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    updateView('${lang}');
  </script>
</body>
</html>
`;
                              const blob = new Blob([html], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = itinerary.title.replace(/\\s+/g, '_') + '.html';
                              a.click();
                            } catch (err) {
                              console.error("Export failed:", err);
                              alert("Export failed. Please try again.");
                            } finally {
                              setLoading(false);
                            }
                          }
                        }
                          className="w-full flex items-center gap-3 px-4 py-3 text-dim hover:text-white hover:bg-white/5 rounded-xl transition-colors text-xs font-medium"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <FileCode className="w-4 h-4 text-accent" />}
                          {t.asHtml}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Content Display */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[350px_1fr] md:gap-1 px-0 bg-border overflow-hidden rounded-3xl">
                {itinerary.days.map((day, dayIdx) => (
                  <DayCard 
                    key={day.day} 
                    day={day} 
                    dayIdx={dayIdx} 
                    userPhotos={userPhotos}
                    getImageUrl={getImageUrl}
                    setActiveActivityKey={setActiveActivityKey}
                    fileInputRef={fileInputRef}
                    setItinerary={setItinerary}
                    deletePhoto={deletePhoto}
                    t={t}
                    isRtl={isRtl}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-20"
              >
                <MapView itinerary={itinerary} isRtl={isRtl} />
              </motion.div>
            )}

            {/* Pricing and Trip Details Section */}
            <div className={`mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 border-t border-border pt-12 md:pt-20 px-4 md:px-0`}>
              <div className="space-y-10">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl mb-8 text-accent text-center md:text-start">{t.investment}</h3>
                  <div className="space-y-6">
                    <div className={`flex justify-between items-end border-b border-border pb-4`}>
                      <span className="text-dim text-[10px] md:text-sm uppercase tracking-[1.5px]">{t.pricePerPerson}</span>
                      <span className="text-xl md:text-2xl font-serif text-white">{itinerary.currencySymbol}{(itinerary.estimatedPricePerPerson || 1499).toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-end border-b border-border pb-4`}>
                      <span className="text-dim text-[10px] md:text-sm uppercase tracking-[1.5px]">{t.privateUpgrade}</span>
                      <span className="text-xl md:text-2xl font-serif text-white">+{itinerary.currencySymbol}{(itinerary.estimatedPrivateUpgrade || 450).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-12">
                <div>
                  <h4 className="text-accent text-[10px] uppercase tracking-[3px] font-bold mb-6 text-center md:text-start">{t.includes}</h4>
                  <ul className="space-y-4 text-dim text-sm font-light">
                    {(itinerary.includes || t.includesItems).map((incl: string, idx: number) => (
                      <li key={idx} className={`flex items-start gap-3 text-start`}>
                        <span className="mt-1.5 w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                        <span className="leading-relaxed">{incl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white/40 text-[10px] uppercase tracking-[3px] font-bold mb-6 text-center md:text-start">{t.notIncludes}</h4>
                  <ul className="space-y-4 text-dim text-sm font-light">
                    {(itinerary.notIncludes || t.notIncludesItems).map((excl: string, idx: number) => (
                      <li key={idx} className={`flex items-start gap-3 text-start`}>
                        <span className="mt-1.5 w-1.5 h-1.5 bg-white/10 rounded-full shrink-0" />
                        <span className="leading-relaxed">{excl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {itinerary.note && (
              <div className="mt-12 md:mt-20 border-t border-border pt-12 px-4 md:px-0">
                <h4 className="text-dim text-[10px] uppercase tracking-[3px] font-bold mb-6 text-center md:text-start">{t.note}</h4>
                <p className="text-dim/80 italic text-sm leading-relaxed max-w-3xl text-center md:text-start">
                  {itinerary.note}
                </p>
              </div>
            )}
          </motion.div>
        ) : !loading && (
          <div className="text-center py-20 opacity-10">
            <Compass className="w-20 h-20 mx-auto mb-6" />
            <p className="text-sm tracking-[4px] uppercase font-light">{t.startJourney}</p>
          </div>
        )}
      </main>

      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={onFileUpload} 
        accept="image/*"
      />

      <input 
        type="file" 
        hidden 
        ref={htmlInputRef} 
        onChange={handleHtmlUpload} 
        accept=".html"
      />

      <footer className="border-t border-white/5 py-12 text-center text-white/20 text-xs tracking-[0.2em] uppercase">
        &copy; 2026 Albaways AI • Powered by Gemini
      </footer>
    </div>
  );
}

function DayCard({ 
  day, 
  dayIdx, 
  userPhotos,
  getImageUrl, 
  setActiveActivityKey, 
  fileInputRef,
  setItinerary,
  deletePhoto,
  t,
  isRtl
}: { 
  day: DayPlan, 
  dayIdx: number, 
  userPhotos: Record<string, string[]>,
  getImageUrl: (item: ItineraryItem, d: number, i: number) => string[],
  setActiveActivityKey: (key: string) => void,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  setItinerary: React.Dispatch<React.SetStateAction<Itinerary | null>>,
  deletePhoto: (key: string, idx: number) => void,
  t: any,
  isRtl: boolean
}) {
  return (
    <React.Fragment>
      {/* Sidebar Part */}
      <div className={`bg-bg p-6 md:p-10 flex flex-col min-h-[300px] md:min-h-[400px] border-inline-end border-border`}>
        <div className={`md:sticky md:top-[90px] self-start w-full`}>
          <div className={`relative mb-8 md:mb-10 border-border border-inline-start ps-6 md:ps-8 text-start`}>
            <div className={`absolute top-0 w-[5px] md:w-[7px] h-[5px] md:h-[7px] bg-accent rounded-full start-[-3px] md:start-[-4px]`} />
            <div className="text-accent text-[10px] md:text-[11px] font-bold uppercase tracking-[2px] mb-2">{t.dayPrefix} 0{day.day}</div>
            <h3 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setItinerary(prev => {
                if (!prev) return null;
                const next = { ...prev };
                next.days[dayIdx].theme = (e.target as HTMLElement).innerText;
                return next;
              })}
              className="font-serif text-xl md:text-2xl font-normal leading-tight mb-4 outline-none focus:text-accent transition-colors"
            >
              {day.theme}
            </h3>
            <p 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setItinerary(prev => {
                if (!prev) return null;
                const next = { ...prev };
                next.days[dayIdx].description = (e.target as HTMLElement).innerText;
                return next;
              })}
              className="text-dim text-[12px] md:text-[13px] leading-relaxed outline-none focus:text-white transition-colors"
            >
              {day.description}
            </p>
          </div>
          
          {/* Image Container */}
          <div className="flex flex-col gap-4 md:gap-6 w-full">
            <div className="flex flex-col gap-4 md:gap-6">
              {(userPhotos[`day-${dayIdx}`] || []).map((url, idx) => (
                <div key={idx} className="relative w-full h-[200px] md:h-[240px] rounded-xl overflow-hidden border border-border group/dayimg">
                  <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover/dayimg:scale-110" alt="Day snapshot" />
                  {/* Action buttons at top end */}
                  <div className="absolute top-3 end-3 flex gap-2 z-10 transition-opacity duration-300">
                    <button
                      onClick={() => deletePhoto(`day-${dayIdx}`, idx)}
                      className="w-8 h-8 bg-red-500/80 backdrop-blur-md border border-white/20 text-white rounded-md flex items-center justify-center transition-all hover:bg-red-600 hover:scale-105"
                      title="Delete Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveActivityKey(`day-${dayIdx}`);
                        fileInputRef.current?.click();
                      }}
                      className="w-8 h-8 bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-md flex items-center justify-center transition-all hover:bg-accent hover:border-accent hover:scale-105"
                      title="Add Another"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Extra photo placeholder button for Day snapshot */}
            <button 
              onClick={() => {
                setActiveActivityKey(`day-${dayIdx}`);
                fileInputRef.current?.click();
              }}
              className="w-full h-[100px] md:h-[120px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-dim hover:text-accent hover:border-accent hover:bg-white/5 transition-all group"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[1px] font-bold">{isRtl ? 'إضافة لقطة' : 'Add Snapshot'}</span>
            </button>
          </div>

          <div className={`mt-6 p-4 rounded-xl bg-card border border-border shadow-sm text-start`}>
            <div className={`flex items-center gap-2 text-accent mb-2 font-bold`}>
              <Moon className="w-3 h-3" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-[2px]">{t.overnight}</span>
            </div>
            <div 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setItinerary(prev => {
                if (!prev) return null;
                const next = { ...prev };
                next.days[dayIdx].overnightLocation = (e.target as HTMLElement).innerText;
                return next;
              })}
              className="text-white text-xs md:text-sm font-medium outline-none focus:text-accent transition-colors"
            >
              {day.overnightLocation}
            </div>
          </div>
        </div>
      </div>
      {/* Content Area Part - Vertical Narrative Flow */}
      <div className="bg-bg p-6 md:p-10 space-y-12 md:space-y-16 overflow-hidden">
        {day.items.slice(0, 4).map((item, itemIdx) => (
          <motion.div 
            key={itemIdx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col md:flex-row gap-6 md:gap-8 group`}
          >
            {/* Image Container */}
            <div className="flex flex-col gap-4 md:gap-6 w-full md:w-[240px] lg:w-[280px]">
              <div className="flex flex-col gap-4 md:gap-6">
                {getImageUrl(item, dayIdx, itemIdx).map((url, idx) => {
                  const activityKey = `${dayIdx}-${itemIdx}`;
                  const isUserUploaded = userPhotos[activityKey]?.includes(url);

                  return (
                    <div key={idx} className="relative w-full h-[240px] md:h-[280px] shrink-0 overflow-hidden bg-border rounded-2xl shadow-2xl border border-white/5 group/img">
                      <img 
                        src={url} 
                        alt={item.activity}
                        className="w-full h-full object-cover aspect-square transition-transform duration-1000 group-hover/img:scale-110 grayscale-[0.2] group-hover/img:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Action buttons at top end */}
                      <div className="absolute top-4 end-4 flex gap-2 z-10">
                        {isUserUploaded && (
                          <button
                            onClick={() => deletePhoto(activityKey, idx)}
                            className="w-10 h-10 bg-red-500/80 backdrop-blur-md border border-white/20 text-white rounded-lg flex items-center justify-center transition-all hover:bg-red-600 hover:scale-105"
                            title="Delete Photo"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveActivityKey(activityKey);
                            fileInputRef.current?.click();
                          }}
                          className="w-10 h-10 bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-lg flex items-center justify-center transition-all hover:bg-accent hover:border-accent hover:scale-105"
                          title="Add Another"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Square placeholder button for extra photo (Number 2 & 3) */}
              <button
                onClick={() => {
                  setActiveActivityKey(`${dayIdx}-${itemIdx}`);
                  fileInputRef.current?.click();
                }}
                className={`flex flex-col items-center justify-center gap-3 w-full h-[140px] md:h-[180px] bg-card/40 border-2 border-dashed border-border text-dim hover:text-accent hover:border-accent hover:bg-white/5 rounded-2xl transition-all group`}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-[2px] font-bold">{isRtl ? 'إضافة صورة' : 'Add Photo'}</span>
              </button>
            </div>

            {/* Content Details */}
            <div className={`flex-1 py-2 md:py-4 text-start`}>
              <div className={`flex flex-wrap items-center gap-3 md:gap-4 mb-4`}>
                <div className="bg-accent/10 px-3 md:px-4 py-1.5 rounded-full border border-accent/20">
                  <span 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => setItinerary(prev => {
                      if (!prev) return null;
                      const next = { ...prev };
                      next.days[dayIdx].items[itemIdx].time = (e.target as HTMLElement).innerText;
                      return next;
                    })}
                    className="text-accent text-[10px] md:text-[11px] font-bold uppercase tracking-[2px] outline-none"
                  >
                    {item.time || t.experience}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-dim text-[11px] md:text-xs font-light">
                  <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => setItinerary(prev => {
                      if (!prev) return null;
                      const next = { ...prev };
                      next.days[dayIdx].items[itemIdx].location = (e.target as HTMLElement).innerText;
                      return next;
                    })}
                    className="outline-none focus:text-white"
                  >
                    {item.location}
                  </span>
                </div>
              </div>
              
              <h4 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => setItinerary(prev => {
                  if (!prev) return null;
                  const next = { ...prev };
                  next.days[dayIdx].items[itemIdx].activity = (e.target as HTMLElement).innerText;
                  return next;
                })}
                className="text-xl md:text-3xl font-serif font-light mb-4 md:mb-6 tracking-tight text-white group-hover:text-accent transition-colors outline-none"
              >
                {item.activity}
              </h4>
              
              <p 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => setItinerary(prev => {
                  if (!prev) return null;
                  const next = { ...prev };
                  next.days[dayIdx].items[itemIdx].description = (e.target as HTMLElement).innerText;
                  return next;
                })}
                className="text-dim/90 text-sm md:text-lg leading-relaxed font-light font-sans max-w-2xl whitespace-pre-line outline-none focus:text-white"
              >
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </React.Fragment>
  );
}
