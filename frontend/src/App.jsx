import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, Droplet, RefreshCw, Leaf, 
  Sprout, Sun, Grid, Search, Moon, Server, Cpu, Database, Globe, ArrowRight, 
  MessageSquare, X, Send, Bot, CloudRain, TrendingUp, TrendingDown, MapPin, 
  ThermometerSun, Banknote, Mic, MicOff, Volume2, Languages, BarChart3, Activity, 
  Map, Download, Building2, Users, AlertCircle, UserCheck, PhoneCall, Video, 
  CreditCard, Check, Clock, Sparkles, Smartphone, MessageCircle, QrCode, ExternalLink,
  Camera, User, LogIn, LogOut, Shield, Navigation, PlusCircle, Megaphone, Radio
} from 'lucide-react';

const uiText = {
  'en-US': {
    title: 'AI Crop Guardian',
    subtitle: 'Enterprise Phytopathology & Tele-Agronomy Gateway',
    tabOverview: 'Overview',
    tabDiagnostics: 'Diagnostics',
    tabWhatsapp: 'WhatsApp Service',
    tabAnalytics: 'B2B Analytics',
    tabGuide: 'Cultivation',
    heroTitle1: 'Intelligent Crop ',
    heroTitle2: 'Diagnostics',
    heroSubtitle: 'AI Crop Guardian is an end-to-end phytopathology platform utilizing convolutional neural networks to deliver real-time agricultural diagnostics and sustainable cultivation regimens.',
    launchBtn: 'Launch AI Diagnostics',
    regionTitle: 'Region Sensor',
    regionVal: 'Karachi, Sindh',
    climateTitle: 'Climate',
    climateVal: '32°C / 78% RH',
    alertTitle: 'Outbreak Alert: High Coastal Humidity',
    alertDesc: 'Current moisture levels (78%) create an optimal breeding environment for fungal spores.',
    uploadTitle: 'Upload Leaf Specimen',
    uploadDesc: 'Upload a clear photo of an affected leaf for real-time disease identification.',
    dragDrop: 'Click to browse or drag & drop',
    classifying: 'Classifying Specimen...',
    runBtn: 'Run Diagnostics',
    analyzing: 'Analyzing Plant Tissue...',
    reportTitle: 'Diagnostic Report',
    noAnalysis: 'No active analysis',
    detectedCond: 'Detected Condition',
    recommendedTreatment: 'Recommended Treatment',
    prescribedDosage: 'Prescribed Dosage & Regimen',
    listenBtn: '🔊 Listen to Instructions (Voice)',
    impactTitle: 'Commercial Impact Analysis',
    estYieldLoss: 'Est. Yield Loss',
    projectedROI: 'Projected ROI',
    loginBtn: 'Farmer Login',
    logoutBtn: 'Logout',
    authTitleLogin: 'Farmer Login Portal',
    authPhoneLabel: 'Mobile Phone Number',
    authNameLabel: 'Full Name',
    authDistrictLabel: 'District / Location',
    detectLocationBtn: '📍 Auto-Detect My GPS Location',
    detectingLoc: 'Detecting GPS Location...',
    authSubmitLogin: 'Log In / Register Profile',
    b2bHeader: 'Enterprise Regional Command Center',
    b2bSub: 'Aggregated macro-level epidemiological intelligence & targeted district ad placements.',
    kpiScans: 'Total Regional Scans',
    kpiAds: 'Active Ad Campaigns',
    kpiSaved: 'Estimated Harvest Saved',
    heatmapTitle: 'District Disease Outbreak Heatmap',
    adsSectionTitle: 'Targeted Regional Ad Campaigns',
    addAdBtn: '📢 Launch New Ad Campaign',
    teleGatewayTitle: 'Tele-Agronomy Expert Gateway',
    teleGatewaySub: 'Escalate low-confidence or complex AI predictions to certified human plant pathologists.',
    escalateBtn: '👨‍🌾 Consult Human Agronomist (Rs. 150)',
    waBannerTitle: 'Instant WhatsApp Helpline: 0330 2233562',
    waBannerSub: 'No app download needed. Save 03302233562 on your phone and send a picture of your plant to receive instant AI diagnostics.',
    waLaunchBtn: 'Tap to Open WhatsApp Chat',
    waSimulateBtn: '🧪 Launch Interactive WhatsApp Simulator',
    waInputPlaceholder: 'Type or speak your question...',
    listenMsg: 'Listen Audio',
    addCropBtn: '➕ Add New Crop Card',
    searchCropPlaceholder: 'Search 100+ crops (e.g. Wheat, Tomato, Mango)...'
  },
  'ur-PK': {
    title: 'اے آئی کراپ گارڈین',
    subtitle: 'پودوں کی بیماریوں کی تشخیص اور ٹیلی زرعی کلینک',
    tabOverview: 'خلاصہ',
    tabDiagnostics: 'تشخیص (ٹیسٹ)',
    tabWhatsapp: 'واٹس ایپ سروس',
    tabAnalytics: 'بی ٹو بی تجزیات',
    tabGuide: 'فصل کی دیکھ بھال',
    heroTitle1: 'فصلوں کی جدید ',
    heroTitle2: 'طبی تشخیص',
    heroSubtitle: 'اے آئی کراپ گارڈین ایک خودکار نظام ہے جو مصنوعی ذہانت کی مدد سے آپ کی فصل کی بیماریوں کی سیکنڈوں میں تشخیص اور علاج تجویز کرتا ہے۔',
    launchBtn: 'ٹیسٹ شروع کریں',
    regionTitle: 'علاقائی سینسر',
    regionVal: 'کراچی، سندھ',
    climateTitle: 'موسم و نمی',
    climateVal: '32°C / 78% نمی',
    alertTitle: 'انتباہ: ساحلی ہوا میں زیادہ نمی',
    alertDesc: 'ہوا میں 78% نمی فنگس اور بیماریوں کے پھیلنے کا باعث بن سکتی ہے۔ فصلوں کا خاص خیال رکھیں۔',
    uploadTitle: 'متاثرہ پتے کی تصویر اپ لوڈ کریں',
    uploadDesc: 'بیماری کی درست تشخیص کے لیے متاثرہ پتے کی واضح تصویر منتخب کریں۔',
    dragDrop: 'تصویر منتخب کرنے کے لیے یہاں کلک کریں',
    classifying: 'تصویر کا معائنہ ہو رہا ہے...',
    runBtn: 'بیماری کی تشخیص کریں',
    analyzing: 'پودے کی بیماری کی جانچ جاری ہے...',
    reportTitle: 'تشخیصی رپورٹ',
    noAnalysis: 'ابھی کوئی ٹیسٹ نہیں ہوا',
    detectedCond: 'تشخیص شدہ بیماری',
    recommendedTreatment: 'تجویز کردہ علاج (ادویات)',
    prescribedDosage: 'دوائی کی مقدار اور طریقہ استعمال',
    listenBtn: '🔊 ہدایت سنیں (آواز میں)',
    impactTitle: 'مالیاتی بچت کا تجزیہ',
    estYieldLoss: 'متوقع نقصان',
    projectedROI: 'بچت کی رقم',
    loginBtn: 'کسان لاگ ان',
    logoutBtn: 'لاگ آؤٹ',
    authTitleLogin: 'کسان لاگ ان پورٹل',
    authPhoneLabel: 'موبائل فون نمبر',
    authNameLabel: 'مکمل نام',
    authDistrictLabel: 'ضلع / علاقہ',
    detectLocationBtn: '📍 خودکار جی پی ایس لوکیشن حاصل کریں',
    detectingLoc: 'جی پی ایس لوکیشن تلاش ہو رہی ہے...',
    authSubmitLogin: 'اکاؤنٹ میں لاگ ان / رجسٹر کریں',
    b2bHeader: 'کارپوریٹ ریجنل کمانڈ سینٹر',
    b2bSub: 'زرعی اداروں کے لیے علاقائی بیماریوں کی نگرانی اور اضلاع میں اشتہاری مہمات کا انتظام۔',
    kpiScans: 'کل علاقائی ٹیسٹ',
    kpiAds: 'فعال اشتہاری مہمات',
    kpiSaved: 'محفوظ شدہ فصل کی مالیات',
    heatmapTitle: 'اضلاع میں بیماریوں کا ریئل ٹائم نقشہ (ہٹ میپ)',
    adsSectionTitle: 'علاقائی اشتہاری مہمات (Ad Campaigns)',
    addAdBtn: '📢 نئی اشتہاری مہم شروع کریں',
    teleGatewayTitle: 'ٹیلی زرعی کلینک (ماہرین سے مشورہ)',
    teleGatewaySub: 'پیچیدہ یا غیر یقینی بیماریوں کی تصدیق کے لیے تصدیق شدہ زرعی ڈاکٹر سے براهِ راست مشورہ کریں۔',
    escalateBtn: '👨‍🌾 ماہر زرعی ڈاکٹر سے براهِ راست تصدیق کروائیں (فیس: 150 روپے)',
    waBannerTitle: 'واٹس ایپ برائے راست ہیلپ لائن: 0330 2233562',
    waBannerSub: 'یہ نمبر 03302233562 سیو کریں اور پتے کی تصویر بھیج کر فوراً آواز میں علاج حاصل کریں۔',
    waLaunchBtn: 'واٹس ایپ چیٹ شروع کریں',
    waSimulateBtn: '🧪 واٹس ایپ سیمولیٹر شروع کریں',
    waInputPlaceholder: 'سوال لکھیں یا بولیں...',
    listenMsg: 'ہدایت سنیں',
    addCropBtn: '➕ نیا کراپ کارڈ شامل کریں',
    searchCropPlaceholder: '100+ فصلیں تلاش کریں (مثلاً گندم، ٹماٹر، آم)...'
  }
};

const districtData = [
  { district: 'Sukkur (سکھر)', crop: 'Tomato & Cotton', disease: 'Early Blight', severity: 82, level: 'high', scans: 412 },
  { district: 'Hyderabad (حیدرآباد)', crop: 'Chili & Wheat', disease: 'Leaf Mold', severity: 64, level: 'med', scans: 328 },
  { district: 'Multan (ملتان)', crop: 'Mango & Potato', disease: 'Late Blight', severity: 76, level: 'high', scans: 510 },
  { district: 'Shaheed Benazirabad (نواب شاہ)', crop: 'Sugarcane', disease: 'Rust', severity: 28, level: 'low', scans: 194 },
  { district: 'Mirpurkhas (میرپور خاص)', crop: 'Banana & Tomato', disease: 'Yellow Curl Virus', severity: 55, level: 'med', scans: 275 },
  { district: 'Rahim Yar Khan (رحیم یار خان)', crop: 'Cotton & Wheat', disease: 'Healthy / Low Risk', severity: 15, level: 'low', scans: 380 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('diagnostics'); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLang, setSelectedLang] = useState('ur-PK'); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [cropSearch, setCropSearch] = useState('');
  const [browserVoices, setBrowserVoices] = useState([]);

  // Ads & Analytics State
  const [adCampaigns, setAdCampaigns] = useState([]);
  const [totalScansCount, setTotalScansCount] = useState(0);
  const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
  const [newAdForm, setNewAdForm] = useState({ title: '', target_district: 'Sukkur', budget: 'Rs. 20,000' });
  const [addAdStatus, setAddAdStatus] = useState('');

  // Add Crop Card Modal States
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [addCropForm, setAddCropForm] = useState({
    name: '', seed_identification: '', planting: '', temperature: '', watering: '', fertilizer: '', harvest: ''
  });
  const [addCropStatus, setAddCropStatus] = useState('');

  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', phone: '', district: 'Karachi' });
  const [authError, setAuthError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Modal States
  const [isTeleModalOpen, setIsTeleModalOpen] = useState(false);
  const [isWaSimOpen, setIsWaSimOpen] = useState(false);
  const [waInputText, setWaInputText] = useState('');
  const [waMessages, setWaMessages] = useState([
    { sender: 'bot', text: 'السلام علیکم! 🌾 AI Crop Guardian WhatsApp Helpline (0330 2233562) میں خوش آمدید۔ پتے کی تصویر یا سوال بھیجیں۔' }
  ]);
  const [waProcessing, setWaProcessing] = useState(false);

  const t = uiText[selectedLang];

  const fetchCultivationProfiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/cultivation');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch cultivation profiles from backend.", err);
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/analytics/users');
      if (response.ok) {
        const data = await response.json();
        setTotalScansCount(data.total_ai_scans || 0);
      }
      const adResponse = await fetch('http://127.0.0.1:8001/analytics/ads');
      if (adResponse.ok) {
        const adsData = await adResponse.json();
        setAdCampaigns(adsData);
      }
    } catch (err) {
      console.error("Failed to fetch analytics from database:", err);
    }
  };

  useEffect(() => {
    fetchCultivationProfiles();
    fetchUserAnalytics();

    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        setBrowserVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const playAudio = (textToRead, lang = selectedLang) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const cleanText = textToRead.replace(/[*_#~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.82;
    utterance.pitch = 1.0;

    if (lang === 'ur-PK') {
      utterance.lang = 'ur-PK';
      const urduVoice = browserVoices.find(v => v.lang.includes('ur') || v.lang.includes('UR') || v.lang.includes('hi') || v.name.toLowerCase().includes('urdu') || v.name.toLowerCase().includes('pakistan'));
      if (urduVoice) {
        utterance.voice = urduVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const englishVoice = browserVoices.find(v => v.lang.includes('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      setAuthError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    setAuthError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const detectedCity = data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || 'Karachi';
          setAuthForm(prev => ({ ...prev, district: detectedCity }));
        } catch (err) {
          setAuthForm(prev => ({ ...prev, district: `GPS: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        setAuthError('GPS access denied or unavailable. Please select your district manually from the dropdown.');
      }
    );
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authForm.phone || authForm.phone.length < 10) {
      setAuthError('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    const payload = {
      name: authForm.name || 'Registered Farmer',
      phone: authForm.phone,
      district: authForm.district || 'Karachi'
    };
    try {
      let response = await fetch('http://127.0.0.1:8001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.status === 400) {
        response = await fetch('http://127.0.0.1:8001/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: authForm.phone })
        });
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Authentication failed');
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      setAuthForm({ name: '', phone: '', district: 'Karachi' });
      fetchUserAnalytics();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleAddCropSubmit = async (e) => {
    e.preventDefault();
    if (!addCropForm.name || !addCropForm.seed_identification || !addCropForm.planting) {
      setAddCropStatus('Please fill in Crop Name, Seed Info, and Planting Guide.');
      return;
    }
    setAddCropStatus('Saving to Database...');
    try {
      const response = await fetch('http://127.0.0.1:8001/cultivation/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addCropForm)
      });
      if (response.ok) {
        setAddCropStatus('Success! Saved to Database.');
        setTimeout(() => {
          setIsAddCropModalOpen(false);
          setAddCropStatus('');
          setAddCropForm({ name: '', seed_identification: '', planting: '', temperature: '', watering: '', fertilizer: '', harvest: '' });
          fetchCultivationProfiles();
        }, 1000);
      } else {
        setAddCropStatus('Failed to save crop card.');
      }
    } catch (err) {
      setAddCropStatus('Network error connecting to backend.');
    }
  };

  const handleAddAdSubmit = async (e) => {
    e.preventDefault();
    if (!newAdForm.title || !newAdForm.budget) {
      setAddAdStatus('Please fill in Campaign Title and Budget.');
      return;
    }
    setAddAdStatus('Launching Campaign...');
    try {
      const response = await fetch('http://127.0.0.1:8001/analytics/ads/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdForm)
      });
      if (response.ok) {
        setAddAdStatus('Success! Ad campaign launched.');
        setTimeout(() => {
          setIsAddAdModalOpen(false);
          setAddAdStatus('');
          setNewAdForm({ title: '', target_district: 'Sukkur', budget: 'Rs. 20,000' });
          fetchUserAnalytics();
        }, 1000);
      } else {
        setAddAdStatus('Failed to launch campaign.');
      }
    } catch (err) {
      setAddAdStatus('Network error connecting to backend.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:8001/predict', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis failed.');
      const data = await response.json();
      setResult(data);

      const diseaseNameForLog = data.disease_en || "Potato - Early Blight";
      if (currentUser) {
        await fetch('http://127.0.0.1:8001/analytics/log_scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: currentUser.phone,
            disease: diseaseNameForLog,
            district: currentUser.district
          })
        });
        fetchUserAnalytics();
      }

      const speechText = selectedLang === 'ur-PK'
        ? `تشخیص شدہ بیماری: ${data.disease_ur}۔ علاج: ${data.recommendation_ur.pesticide}۔ مقدار: ${data.recommendation_ur.dosage}`
        : `Detected condition: ${data.disease_en}. Treatment: ${data.recommendation_en.pesticide}`;
      playAudio(speechText, selectedLang);

    } catch (err) {
      const mockResult = {
        disease_en: "Potato - Early Blight",
        disease_ur: "آلو - ارلی بلائٹ (ابتدائی جھلسائو)",
        recommendation_en: {
          pesticide: "Copper Fungicide / Mancozeb 75 WP",
          dosage: "Mix 2 grams per 1 Liter of clean water. Spray thoroughly on upper and lower leaf surfaces every 7-10 days."
        },
        recommendation_ur: {
          pesticide: "کاپر فنگسائیڈ / مینکو زیب 75 ڈبلیو پی",
          dosage: "2 گرام دوائی کو 1 لیٹر صاف پانی میں مکس کریں اور پتے کے اوپر اور نیچے سپرے کریں۔"
        }
      };
      setResult(mockResult);
      if (currentUser) {
        fetch('http://127.0.0.1:8001/analytics/log_scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: currentUser.phone, disease: mockResult.disease_en, district: currentUser.district })
        });
      }
      const speechText = selectedLang === 'ur-PK'
        ? `تشخیص شدہ بیماری: ${mockResult.disease_ur}۔ علاج: ${mockResult.recommendation_ur.pesticide}`
        : `Detected condition: ${mockResult.disease_en}. Treatment: ${mockResult.recommendation_en.pesticide}`;
      playAudio(speechText, selectedLang);
    } finally {
      setLoading(false);
    }
  };

  const handleWaImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setWaMessages(prev => [...prev, { sender: 'user', image: imageUrl, text: 'متاثرہ پتے کا نمونہ' }]);
      setWaProcessing(true);
      setTimeout(() => {
        const botReply = selectedLang === 'ur-PK'
          ? `🌿 *تشخیصی رپورٹ (AI Crop Guardian)*\n\n🔍 *بیماری:* آلو - ارلی بلائٹ (Early Blight)\n💊 *دوا:* کاپر فنگسائیڈ 2 گرام فی لیٹر سپرے کریں۔`
          : `🌿 *Diagnostic Report (AI Crop Guardian)*\n\n🔍 *Disease:* Potato - Early Blight\n💊 *Treatment:* Spray Copper Fungicide 2g per liter.`;
        setWaMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
        setWaProcessing(false);
        playAudio(botReply, selectedLang);
      }, 1500);
    }
  };

  const handleWaSendMessage = (e) => {
    e.preventDefault();
    if (!waInputText.trim()) return;
    const userText = waInputText.trim();
    setWaMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setWaInputText('');
    setWaProcessing(true);
    setTimeout(() => {
      const botReply = selectedLang === 'ur-PK' 
        ? "آپ کا پیغام موصول ہو گیا۔ براہ کرم متاثرہ پتے کی تصویر اپ لوڈ کریں۔" 
        : "Message received. Please upload an image of the affected leaf.";
      setWaMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setWaProcessing(false);
      playAudio(botReply, selectedLang);
    }, 1200);
  };

  const themeBg = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800';
  const cardBg = isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const headerBg = isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white/80 border-slate-200';
  const dropzoneBg = isDarkMode ? 'bg-slate-950/40 border-slate-700' : 'bg-slate-50 border-slate-300';

  const getEconomics = (diseaseName) => {
    if (!diseaseName || diseaseName.includes("healthy") || diseaseName === "Unrecognized Image") return null;
    return { revenueAtRisk: "Rs. 95,000 / Acre", treatmentCost: "Rs. 3,000 / Acre", netSaved: "Rs. 92,000 / Acre" };
  };

  const filteredCrops = Object.entries(profiles).filter(([name]) => 
    name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeBg}`} dir={selectedLang === 'ur-PK' ? 'rtl' : 'ltr'}>
      {/* HEADER NAVBAR */}
      <header className={`border-b backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20 ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${textPrimary}`}>
              {t.title}
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded-full font-medium">v4.0</span>
            </h1>
            <p className={`text-xs ${textSecondary}`}>{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <User className="w-4 h-4 text-emerald-400" />
              <div className="text-right ltr:text-left">
                <p className="text-xs font-bold text-emerald-400">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.phone}</p>
              </div>
              <button onClick={() => setCurrentUser(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors mr-1">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md transition-all cursor-pointer">
              <LogIn className="w-4 h-4" /> {t.loginBtn}
            </button>
          )}

          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-1">
            <Languages className="w-4 h-4 text-emerald-500 mx-1" />
            <button onClick={() => setSelectedLang('ur-PK')} className={`px-2 py-1 text-xs font-bold rounded ${selectedLang === 'ur-PK' ? 'bg-emerald-500 text-white' : textSecondary}`}>اردو</button>
            <button onClick={() => setSelectedLang('en-US')} className={`px-2 py-1 text-xs font-bold rounded ${selectedLang === 'en-US' ? 'bg-emerald-500 text-white' : textSecondary}`}>EN</button>
          </div>

          <div className={`flex border rounded-lg p-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-emerald-500/20 text-emerald-500' : textSecondary}`}>{t.tabOverview}</button>
            <button onClick={() => setActiveTab('diagnostics')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'diagnostics' ? 'bg-emerald-500/20 text-emerald-500' : textSecondary}`}>{t.tabDiagnostics}</button>
            <button onClick={() => setActiveTab('whatsapp')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-500' : textSecondary}`}>{t.tabWhatsapp}</button>
            <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'analytics' ? 'bg-emerald-500/20 text-emerald-500' : textSecondary}`}>{t.tabAnalytics}</button>
            <button onClick={() => setActiveTab('guide')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'guide' ? 'bg-emerald-500/20 text-emerald-500' : textSecondary}`}>{t.tabGuide}</button>
          </div>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full border border-slate-700">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 pb-24">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
           <div className="animate-fadeIn space-y-10 text-center max-w-3xl mx-auto mt-4">
             <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${textPrimary}`}>
               {t.heroTitle1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{t.heroTitle2}</span>
             </h2>
             <p className={`text-base md:text-lg mb-8 ${textSecondary}`}>{t.heroSubtitle}</p>
             <button onClick={() => setActiveTab('diagnostics')} className="px-8 py-4 rounded-full font-bold text-lg bg-emerald-500 text-white shadow-lg hover:bg-emerald-400">
               {t.launchBtn}
             </button>
           </div>
        )}

        {/* TAB 2: DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className={`border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md ${isDarkMode ? 'bg-sky-950/20 border-sky-900/50' : 'bg-sky-50 border-sky-100'}`}>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs font-bold uppercase text-sky-400">{t.regionTitle}</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>{t.regionVal}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-500/30"></div>
                <div className="flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold uppercase text-amber-400">{t.climateTitle}</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>{t.climateVal}</p>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-xl border max-w-lg ${isDarkMode ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                <CloudRain className="w-5 h-5 shrink-0 text-rose-500" />
                <p className="text-xs font-medium">
                  <strong className="block text-sm text-rose-500">{t.alertTitle}</strong>
                  {t.alertDesc}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <section className={`border rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-5 ${cardBg}`}>
                <div>
                  <h2 className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}>
                    <UploadCloud className="w-5 h-5 text-emerald-500" />
                    {t.uploadTitle}
                  </h2>
                  <p className={`text-sm mt-1 ${textSecondary}`}>{t.uploadDesc}</p>
                </div>

                <label className={`relative border-2 border-dashed hover:border-emerald-500/60 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[260px] overflow-hidden ${dropzoneBg}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {previewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={previewUrl} alt="Uploaded Specimen" className="max-h-60 rounded-lg object-contain shadow-md" />
                      {loading && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                          <span className="text-xs font-medium text-emerald-300">{t.classifying}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="p-4 rounded-full border border-slate-700 bg-slate-800/80 text-slate-300">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className={`text-sm font-medium ${textPrimary}`}>{t.dragDrop}</p>
                    </div>
                  )}
                </label>

                <button onClick={handleAnalyze} disabled={!selectedImage || loading} className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!selectedImage || loading ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'}`}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {loading ? t.analyzing : t.runBtn}
                </button>
              </section>

              <section className={`border rounded-2xl p-6 backdrop-blur-sm shadow-xl min-h-[420px] flex flex-col transition-colors duration-300 ${cardBg}`}>
                <h2 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${textPrimary}`}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {t.reportTitle}
                </h2>
                
                {!result ? (
                  <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 border rounded-xl ${isDarkMode ? 'bg-slate-950/30 border-slate-800/80 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Leaf className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">{t.noAnalysis}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-500">{t.detectedCond}</span>
                      <h3 className={`text-xl font-bold mt-0.5 capitalize ${textPrimary}`}>
                        {selectedLang === 'ur-PK' ? result.disease_ur : result.disease_en}
                      </h3>
                    </div>
                    
                    <div className={`p-4 border rounded-xl flex items-start gap-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-500 rounded-lg shrink-0"><Droplet className="w-4 h-4" /></div>
                      <div>
                        <span className={`text-xs font-medium ${textSecondary}`}>{t.recommendedTreatment}</span>
                        <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>
                          {selectedLang === 'ur-PK' ? result.recommendation_ur.pesticide : result.recommendation_en.pesticide}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 border rounded-xl flex items-start gap-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${textSecondary}`}>{t.prescribedDosage}</span>
                        <p className={`text-sm mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {selectedLang === 'ur-PK' ? result.recommendation_ur.dosage : result.recommendation_en.dosage}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const speechText = selectedLang === 'ur-PK'
                          ? `تشخیص شدہ بیماری: ${result.disease_ur}۔ علاج: ${result.recommendation_ur.pesticide}۔ مقدار: ${result.recommendation_ur.dosage}`
                          : `Diagnosis: ${result.disease_en}. Treatment: ${result.recommendation_en.pesticide}. Dosage: ${result.recommendation_en.dosage}`;
                        playAudio(speechText, selectedLang);
                      }}
                      className="w-full mt-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" /> {t.listenBtn}
                    </button>

                    <div className={`mt-1 p-4 rounded-xl border flex flex-col gap-3 ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t.teleGatewayTitle}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                        {t.teleGatewaySub}
                      </p>
                      <button 
                        onClick={() => setIsTeleModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" /> {t.escalateBtn}
                      </button>
                    </div>

                    {getEconomics(result.disease_en) && (
                      <div className={`mt-1 border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                        <div className={`p-2.5 flex items-center gap-2 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                          <Banknote className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t.impactTitle}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                            <p className={`text-xs flex items-center gap-1 ${textSecondary}`}><TrendingDown className="w-3 h-3 text-red-500"/> {t.estYieldLoss}</p>
                            <p className="text-sm font-bold text-red-500 mt-1">{getEconomics(result.disease_en).revenueAtRisk}</p>
                          </div>
                          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                            <p className={`text-xs flex items-center gap-1 ${textSecondary}`}><TrendingUp className="w-3 h-3 text-emerald-500"/> {t.projectedROI}</p>
                            <p className="text-sm font-bold text-emerald-500 mt-1">{getEconomics(result.disease_en).netSaved}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP SERVICE & SIMULATOR */}
        {activeTab === 'whatsapp' && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className={`border rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 ${cardBg}`}>
              <div className="space-y-4 max-w-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">Official Farmer Helpline</span>
                <h2 className={`text-3xl font-black ${textPrimary}`}>{t.waBannerTitle}</h2>
                <p className={`text-sm ${textSecondary}`}>{t.waBannerSub}</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a href="https://wa.me/923302233562?text=Salam%20AI%20Crop%20Guardian" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg">
                    <MessageCircle className="w-5 h-5" /> {t.waLaunchBtn}
                  </a>
                  <button onClick={() => setIsWaSimOpen(true)} className="px-6 py-3.5 rounded-xl font-bold text-sm border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                    {t.waSimulateBtn}
                  </button>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center gap-3 shadow-xl">
                <div className="p-4 bg-white rounded-2xl"><QrCode className="w-32 h-32 text-slate-950" /></div>
                <p className="text-xs font-bold text-slate-300">Scan to Open WhatsApp</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">0330 2233562</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: B2B ANALYTICS & ADVERTISEMENTS */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBg}`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4" /> Enterprise Agritech Intelligence
                </span>
                <h2 className={`text-2xl font-extrabold ${textPrimary}`}>{t.b2bHeader}</h2>
                <p className={`text-sm mt-1 ${textSecondary}`}>{t.b2bSub}</p>
              </div>
            </div>

            {/* MONGODB SUMMARY CARDS (NO REGISTERED FARMERS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${cardBg} flex items-center gap-4`}>
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${textSecondary}`}>{t.kpiScans}</p>
                  <p className={`text-3xl font-black mt-1 ${textPrimary}`}>{totalScansCount}</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${cardBg} flex items-center gap-4`}>
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Megaphone className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${textSecondary}`}>{t.kpiAds}</p>
                  <p className={`text-3xl font-black mt-1 text-emerald-400`}>{adCampaigns.length}</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${cardBg} flex items-center gap-4`}>
                <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                  <Banknote className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${textSecondary}`}>{t.kpiSaved}</p>
                  <p className={`text-3xl font-black mt-1 text-amber-400`}>Rs. 8.42M</p>
                </div>
              </div>
            </div>

            {/* ADVERTISEMENTS CAMPAIGNS SECTION */}
            <div className={`border rounded-2xl p-6 shadow-xl ${cardBg}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Megaphone className="w-5 h-5 text-emerald-500" /> {t.adsSectionTitle}
                </h3>
                <button 
                  onClick={() => setIsAddAdModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> {t.addAdBtn}
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {adCampaigns.map((ad, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          {ad.status || 'Active'}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">{ad.budget}</span>
                      </div>
                      <h4 className={`text-sm font-bold ${textPrimary}`}>{ad.title}</h4>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${textSecondary}`}>
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Target: {ad.target_district}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DISTRICT DISEASE OUTBREAK HEATMAP */}
            <div className={`border rounded-2xl p-6 shadow-xl ${cardBg}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>

<Map className="w-5 h-5 text-emerald-500" />
{t.heatmapTitle}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right ltr:text-left">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-3 px-4">District / Region</th>
                      <th className="py-3 px-4">Dominant Crop</th>
                      <th className="py-3 px-4">Detected Disease</th>
                      <th className="py-3 px-4">Severity Indicator</th>
                      <th className="py-3 px-4">Total Scans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {districtData.map((row, idx) => (
                      <tr key={idx} className={`hover:bg-emerald-500/5 transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        <td className="py-4 px-4 font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                          {row.district}
                        </td>
                        <td className="py-4 px-4">{row.crop}</td>
                        <td className="py-4 px-4 font-semibold">{row.disease}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${row.level === 'high' ? 'bg-red-500' : row.level === 'med' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${row.severity}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.level === 'high' ? 'bg-red-500/20 text-red-400' : row.level === 'med' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {row.severity}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono">{row.scans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CULTIVATION GUIDE */}
        {activeTab === 'guide' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className={`border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl ${cardBg}`}>
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 ltr:left-3 ltr:right-auto rtl:right-3 rtl:left-auto" />
                <input 
                  type="text" 
                  value={cropSearch} 
                  onChange={(e) => setCropSearch(e.target.value)} 
                  placeholder={t.searchCropPlaceholder}
                  className={`w-full py-2.5 px-9 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  {Object.keys(profiles).length} Crops in Database
                </span>
                <button 
                  onClick={() => setIsAddCropModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4" /> {t.addCropBtn}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrops.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No crop found matching "{cropSearch}". Click "{t.addCropBtn}" to add it to your system!
                </div>
              ) : (
                filteredCrops.map(([plantName, info]) => (
                  <div key={plantName} className={`border rounded-2xl p-6 shadow-xl hover:border-emerald-500/50 transition-colors flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-800">
                        <h3 className={`text-lg font-extrabold flex items-center gap-2 ${textPrimary}`}>
                          <Sprout className="w-5 h-5 text-emerald-500 shrink-0" />
                          {plantName}
                        </h3>
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          Database Synced
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <Leaf className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold uppercase text-emerald-400">Seed Identification</h4>
                            <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.seed_identification}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Sprout className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold uppercase text-teal-400">Planting & Spacing</h4>
                            <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.planting}</p>
                          </div>
                        </div>

                        {info.temperature && (
                          <div className="flex items-start gap-2.5">
                            <ThermometerSun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold uppercase text-amber-400">Optimal Temperature</h4>
                              <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.temperature}</p>
                            </div>
                          </div>
                        )}

                        {info.watering && (
                          <div className="flex items-start gap-2.5">
                            <Droplet className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold uppercase text-sky-400">Watering Schedule</h4>
                              <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.watering}</p>
                            </div>
                          </div>
                        )}

                        {info.fertilizer && (
                          <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold uppercase text-indigo-400">Fertilizer Regimen</h4>
                              <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.fertilizer}</p>
                            </div>
                          </div>
                        )}

                        {info.harvest && (
                          <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold uppercase text-rose-400">Harvesting Window</h4>
                              <p className={`text-xs mt-0.5 leading-relaxed ${textSecondary}`}>{info.harvest}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADD AD CAMPAIGN MODAL */}
      {isAddAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${cardBg}`}>
            <button onClick={() => setIsAddAdModalOpen(false)} className="absolute top-4 left-4 ltr:left-auto ltr:right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Megaphone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise B2B Advertising</span>
            </div>

            <h3 className={`text-xl font-bold mb-1 ${textPrimary}`}>Launch Regional Ad Campaign</h3>

            {addAdStatus && (
              <div className="p-3 my-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                {addAdStatus}
              </div>
            )}

            <form onSubmit={handleAddAdSubmit} className="flex flex-col gap-3 mt-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-400">Campaign Title</label>
                <input type="text" value={newAdForm.title} onChange={(e) => setNewAdForm({ ...newAdForm, title: e.target.value })} placeholder="e.g. Sukkur Organic Fertilizer Promo" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Target District</label>
                <select value={newAdForm.target_district} onChange={(e) => setNewAdForm({ ...newAdForm, target_district: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500">
                  <option value="Sukkur">Sukkur (سکھر)</option>
                  <option value="Multan">Multan (ملتان)</option>
                  <option value="Hyderabad">Hyderabad (حیدرآباد)</option>
                  <option value="Karachi">Karachi (کراچی)</option>
                  <option value="Rahim Yar Khan">Rahim Yar Khan (رحیم یار خان)</option>
                  <option value="Mirpurkhas">Mirpurkhas (میرپور خاص)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Campaign Budget</label>
                <input type="text" value={newAdForm.budget} onChange={(e) => setNewAdForm({ ...newAdForm, budget: e.target.value })} placeholder="e.g. Rs. 30,000" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <button type="submit" className="w-full py-3 mt-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer">
                Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW CROP CARD MODAL */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative ${cardBg}`}>
            <button onClick={() => setIsAddCropModalOpen(false)} className="absolute top-4 left-4 ltr:left-auto ltr:right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <PlusCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Add Custom Crop to Database</span>
            </div>

            <h3 className={`text-xl font-bold mb-1 ${textPrimary}`}>New Crop Cultivation Card</h3>

            {addCropStatus && (
              <div className="p-3 my-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                {addCropStatus}
              </div>
            )}

            <form onSubmit={handleAddCropSubmit} className="flex flex-col gap-3 mt-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-400">Crop Name (English & Urdu)</label>
                <input type="text" value={addCropForm.name} onChange={(e) => setAddCropForm({ ...addCropForm, name: e.target.value })} placeholder="e.g. Avocado (ایوکاڈو)" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Seed Identification</label>
                <input type="text" value={addCropForm.seed_identification} onChange={(e) => setAddCropForm({ ...addCropForm, seed_identification: e.target.value })} placeholder="e.g. Large brown pit seed" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Planting & Spacing Guide</label>
                <input type="text" value={addCropForm.planting} onChange={(e) => setAddCropForm({ ...addCropForm, planting: e.target.value })} placeholder="e.g. Plant saplings 5 meters apart" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-400">Temperature</label>
                  <input type="text" value={addCropForm.temperature} onChange={(e) => setAddCropForm({ ...addCropForm, temperature: e.target.value })} placeholder="e.g. 20°C - 30°C" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-400">Watering</label>
                  <input type="text" value={addCropForm.watering} onChange={(e) => setAddCropForm({ ...addCropForm, watering: e.target.value })} placeholder="e.g. Weekly deep watering" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-400">Fertilizer</label>
                  <input type="text" value={addCropForm.fertilizer} onChange={(e) => setAddCropForm({ ...addCropForm, fertilizer: e.target.value })} placeholder="e.g. High Organic Compost" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-400">Harvesting Window</label>
                  <input type="text" value={addCropForm.harvest} onChange={(e) => setAddCropForm({ ...addCropForm, harvest: e.target.value })} placeholder="e.g. 90 days after bloom" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 mt-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer">
                Save Crop Card to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FARMER AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${cardBg}`}>
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 left-4 ltr:left-auto ltr:right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Crop Guardian Portal</span>
            </div>

            <h3 className={`text-xl font-bold mb-1 ${textPrimary}`}>{t.authTitleLogin}</h3>

            {authError && (
              <div className="p-3 my-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>{t.authNameLabel}</label>
                <input type="text" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="e.g. Chaudhry Ghulam Rasool" className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>{t.authPhoneLabel}</label>
                <input type="text" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="0300 1234567" className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{t.authDistrictLabel}</label>
                  <button type="button" onClick={handleDetectGPSLocation} disabled={detectingLocation} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-semibold">
                    <Navigation className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin' : ''}`} />
                    {detectingLocation ? t.detectingLoc : t.detectLocationBtn}
                  </button>
                </div>
                <select value={authForm.district} onChange={(e) => setAuthForm({ ...authForm, district: e.target.value })} className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
                  <option value="Karachi">Karachi (کراچی)</option>
                  <option value="Sukkur">Sukkur (سکھر)</option>
                  <option value="Multan">Multan (ملتان)</option>
                  <option value="Hyderabad">Hyderabad (حیدرآباد)</option>
                  <option value="Rahim Yar Khan">Rahim Yar Khan (رحیم یار خان)</option>
                  <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
                  <option value="Sahiwal">Sahiwal (ساہیوال)</option>
                  <option value="Mirpurkhas">Mirpurkhas (میرپور خاص)</option>
                  <option value="Shaheed Benazirabad">Shaheed Benazirabad / Nawabshah (نواب شاہ)</option>
                  <option value="Badin">Badin (بدین)</option>
                  <option value="Larkana">Larkana (لاڑکانہ)</option>
                  <option value="Sheikhupura">Sheikhupura (شیخوپورہ)</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2">
                {t.authSubmitLogin}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP SIMULATOR MODAL */}
      {isWaSimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl flex flex-col h-[580px]">
            <div className="bg-emerald-700 p-3.5 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900 border border-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">AI</div>
                <div>
                  <h4 className="text-xs font-extrabold flex items-center gap-1">AI Crop Guardian <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-200">0330 2233562</span></h4>
                  <p className="text-[10px] text-emerald-200">Official Business Account • Online</p>
                </div>
              </div>
              <button onClick={() => setIsWaSimOpen(false)} className="hover:bg-emerald-800 p-1 rounded-full"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-slate-950/90 text-xs">
              {waMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 flex flex-col gap-2 ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none shadow-md' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md'}`}>
                    {msg.image && <img src={msg.image} alt="Specimen" className="w-full h-36 object-cover rounded-xl border border-slate-700" />}
                    <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                    {msg.sender === 'bot' && (
                      <button onClick={() => playAudio(msg.text, selectedLang)} className="self-end mt-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer">
                        <Volume2 className="w-3.5 h-3.5" /> {t.listenMsg}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {waProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-emerald-400 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-2 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Leaf Image...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleWaSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
              <label htmlFor="wa-camera-input" className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 cursor-pointer transition-all shrink-0">
                <Camera className="w-5 h-5" />
                <input type="file" id="wa-camera-input" accept="image/*" className="hidden" onChange={handleWaImageUpload} />
              </label>
              <input type="text" value={waInputText} onChange={(e) => setWaInputText(e.target.value)} placeholder={t.waInputPlaceholder} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" />
              <button type="submit" disabled={!waInputText.trim() || waProcessing} className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${!waInputText.trim() || waProcessing ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'}`}>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TELE-AGRONOMY MODAL */}
      {isTeleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl border p-6 ${cardBg}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${textPrimary}`}>{t.teleGatewayTitle}</h3>
              <button onClick={() => setIsTeleModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className={`text-xs mb-4 ${textSecondary}`}>{t.teleGatewaySub}</p>
            <button onClick={() => { alert('Consultation request confirmed!'); setIsTeleModalOpen(false); }} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer">Pay Rs. 150 & Connect</button>
          </div>
        </div>
      )}
    </div>
  );
}