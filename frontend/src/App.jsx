import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, Droplet, RefreshCw, Leaf, Sprout, Sun, Grid, Search, Moon, Server, Cpu, Database, Globe, ArrowRight, MessageSquare, X, Send, Bot, CloudRain, TrendingUp, TrendingDown, MapPin, ThermometerSun, Banknote } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('diagnostics'); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState({});

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Agronomist. How can I help you manage your crops today?' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/cultivation')
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(err => console.error("Failed to load crop profiles", err));
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping, isChatOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:8001/predict', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis failed. Check your backend server.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to AI server');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "I'm here to help! For the most accurate advice, please upload a clear photo of your plant's leaves in the Diagnostics tab so my vision model can take a look.";
      const lowerInput = userText.toLowerCase();

      if (lowerInput.match(/\b(hi|hello|hey|greetings|morning)\b/)) {
        aiResponse = "Hello there! I am your AI Agronomist. Are you experiencing any issues with your crops today, or just looking for cultivation advice?";
      }
      else if (lowerInput.includes('blight') && (lowerInput.includes('not') || lowerInput.includes('avoid') || lowerInput.includes('prevent'))) {
        aiResponse = "Great question. To prevent or avoid worsening Early Blight, DO NOT water your plants from above (keep the foliage dry), avoid crowding them too closely, and never leave infected dead leaves on the soil.";
      }
      else if (lowerInput.includes('blight') || lowerInput.includes('spots') || lowerInput.includes('brown')) {
        aiResponse = "Brown spots with concentric rings usually indicate Early Blight. You should immediately apply a Copper-based or Mancozeb fungicide, and prune away the infected lower leaves to stop it from spreading upward.";
      }
      else if (lowerInput.includes('rain') || lowerInput.includes('water') || lowerInput.includes('humid')) {
        aiResponse = "High moisture and humidity are the biggest triggers for fungal outbreaks. If heavy rain is expected, ensure your soil has proper drainage and hold off on your regular watering schedule.";
      }
      else if (lowerInput.includes('cost') || lowerInput.includes('roi') || lowerInput.includes('money') || lowerInput.includes('expensive')) {
        aiResponse = "Untreated diseases can wipe out up to 60% of your yield. Spending just Rs. 3,500/Acre on preventative treatments can save you over Rs. 80,000/Acre in lost revenue at harvest. It's a critical investment.";
      }
      else if (lowerInput.includes('tomato')) {
        aiResponse = "Tomatoes are heavy feeders but very prone to soil-borne fungi. Make sure to stake them high to keep the lower leaves off the damp ground.";
      }
      else if (lowerInput.includes('potato')) {
        aiResponse = "For potatoes, monitor the foliage closely for late blight, especially in high coastal humidity. Have you noticed any dark, water-soaked lesions on the stems?";
      }
      else if (lowerInput.match(/\b(thanks|thank you|ok|okay|got it|awesome)\b/)) {
        aiResponse = "You're very welcome! Let me know if you need help analyzing a leaf photo or checking the weather risks for your region. Good luck with the harvest!";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
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
    
    const name = diseaseName.toLowerCase();
    
    if (name.includes("tomato")) return { revenueAtRisk: "Rs. 120,000 / Acre", treatmentCost: "Rs. 4,500 / Acre", netSaved: "Rs. 115,500 / Acre" };
    if (name.includes("potato")) return { revenueAtRisk: "Rs. 95,000 / Acre", treatmentCost: "Rs. 3,000 / Acre", netSaved: "Rs. 92,000 / Acre" };
    if (name.includes("apple") || name.includes("peach") || name.includes("cherry")) return { revenueAtRisk: "Rs. 250,000 / Acre", treatmentCost: "Rs. 8,000 / Acre", netSaved: "Rs. 242,000 / Acre" };
    if (name.includes("strawberry") || name.includes("grape") || name.includes("blueberry")) return { revenueAtRisk: "Rs. 180,000 / Acre", treatmentCost: "Rs. 5,500 / Acre", netSaved: "Rs. 174,500 / Acre" };
    if (name.includes("corn") || name.includes("wheat") || name.includes("soybean")) return { revenueAtRisk: "Rs. 75,000 / Acre", treatmentCost: "Rs. 2,500 / Acre", netSaved: "Rs. 72,500 / Acre" };
    
    return { revenueAtRisk: "Rs. 85,000 / Acre", treatmentCost: "Rs. 3,500 / Acre", netSaved: "Rs. 81,500 / Acre" };
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white relative ${themeBg}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${isDarkMode ? 'bg-emerald-600/15' : 'bg-emerald-400/20'}`}></div>
        <div className={`absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${isDarkMode ? 'bg-teal-500/10' : 'bg-teal-400/15'}`}></div>
      </div>

      <header className={`border-b backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${textPrimary}`}>
              AI Crop Guardian
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded-full font-medium">v4.0</span>
            </h1>
            <p className={`text-xs ${textSecondary}`}>Deep Learning Phytopathology Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex border rounded-lg p-1 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-emerald-500/20 text-emerald-500' : `${textSecondary} hover:${textPrimary}`}`}>Overview</button>
            <button onClick={() => setActiveTab('diagnostics')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'diagnostics' ? 'bg-emerald-500/20 text-emerald-500' : `${textSecondary} hover:${textPrimary}`}`}>Diagnostics</button>
            <button onClick={() => setActiveTab('guide')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'guide' ? 'bg-emerald-500/20 text-emerald-500' : `${textSecondary} hover:${textPrimary}`}`}>Cultivation</button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-indigo-500 hover:bg-slate-50 shadow-sm'}`}>
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 pb-24">
        
        {activeTab === 'overview' && (
           <div className="animate-fadeIn space-y-10">
             <div className="text-center max-w-3xl mx-auto mt-4">
               <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Intelligent Crop <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Diagnostics</span>
               </h2>
               <p className={`text-base md:text-lg mb-8 leading-relaxed ${textSecondary}`}>
                 AI Crop Guardian is an end-to-end phytopathology platform utilizing convolutional neural networks to deliver real-time agricultural diagnostics and sustainable cultivation regimens.
               </p>
               <div className="flex justify-center">
                 <button onClick={() => setActiveTab('diagnostics')} className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-lg transition-all bg-emerald-500 hover:bg-emerald-400 text-white transform hover:scale-105 active:scale-95 ${isDarkMode ? 'shadow-emerald-500/25' : 'shadow-emerald-500/40'}`}>
                   Launch AI Diagnostics <ArrowRight className="w-5 h-5" />
                 </button>
               </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6 mt-12">
               <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${cardBg}`}>
                 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl w-fit mb-4"><Cpu className="w-6 h-6" /></div>
                 <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Deep Learning Engine</h3>
                 <p className={`text-sm mb-4 ${textSecondary}`}>Powered by a fine-tuned ResNet-18 architecture built in PyTorch. The model extracts deep feature maps from leaf anomalies.</p>
                 <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Identifies 38 distinct plant disease classes</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Native GPU acceleration via CUDA</li>
                 </ul>
               </div>

               <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${cardBg}`}>
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl w-fit mb-4"><Database className="w-6 h-6" /></div>
                 <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Data Processing Pipeline</h3>
                 <p className={`text-sm mb-4 ${textSecondary}`}>Trained on a normalized segment of the PlantVillage dataset, capturing highly diverse environmental conditions.</p>
                 <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Automated image tensor normalization</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Dynamic treatment prescription mapping</li>
                 </ul>
               </div>

               <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${cardBg}`}>
                 <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl w-fit mb-4"><Server className="w-6 h-6" /></div>
                 <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>High-Speed Backend API</h3>
                 <p className={`text-sm mb-4 ${textSecondary}`}>The inference server operates on a localized Python ASGI framework, establishing the bridge between the UI and the AI.</p>
                 <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> Async /predict REST endpoint via FastAPI</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> Secure CORS middleware integration</li>
                 </ul>
               </div>

               <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${cardBg}`}>
                 <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl w-fit mb-4"><Globe className="w-6 h-6" /></div>
                 <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>UN SDG Alignment</h3>
                 <p className={`text-sm mb-4 ${textSecondary}`}>Built specifically to support global agricultural sustainability standards by drastically reducing crop mortality rates.</p>
                 <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> <b>Goal 2:</b> Zero Hunger (Yield protection)</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> <b>Goal 12:</b> Responsible Consumption</li>
                 </ul>
               </div>
             </div>
           </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            <div className={`border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-md ${isDarkMode ? 'bg-sky-950/20 border-sky-900/50' : 'bg-sky-50 border-sky-100'}`}>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Region Sensor</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>Karachi, Sindh</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-500/30 hidden md:block"></div>
                <div className="flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Climate</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>32°C / 78% RH</p>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-xl border max-w-lg ${isDarkMode ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                <CloudRain className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <p className="text-xs leading-relaxed font-medium">
                  <strong className="block text-sm mb-0.5 text-rose-500">Outbreak Alert: High Coastal Humidity</strong>
                  Current moisture levels (78%) create an optimal breeding environment for fungal spores. Elevated risk of Early/Late Blight propagation detected.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <section className={`border rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-5 transition-colors duration-300 ${cardBg}`}>
                <div>
                  <h2 className={`text-lg font-semibold flex items-center gap-2 ${textPrimary}`}>
                    <UploadCloud className="w-5 h-5 text-emerald-500" />
                    Upload Leaf Specimen
                  </h2>
                  <p className={`text-sm mt-1 ${textSecondary}`}>Upload a clear photo of an affected leaf for real-time disease identification.</p>
                </div>

                <label className={`relative border-2 border-dashed hover:border-emerald-500/60 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer group min-h-[260px] overflow-hidden ${dropzoneBg}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {previewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={previewUrl} alt="Uploaded Specimen" className="max-h-60 rounded-lg object-contain shadow-md" />
                      {loading && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                          <span className="text-xs font-medium text-emerald-300">Classifying Specimen...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`p-4 transition-all rounded-full border ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 group-hover:bg-emerald-500/10' : 'bg-white border-slate-200 text-slate-500 group-hover:bg-emerald-50'} shadow-sm`}>
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className={`text-sm font-medium ${textPrimary}`}>Click to browse or drag & drop</p>
                    </div>
                  )}
                </label>

                <button onClick={handleAnalyze} disabled={!selectedImage || loading} className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${!selectedImage || loading ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25'}`}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {loading ? 'Analyzing Plant Tissue...' : 'Run Diagnostics'}
                </button>
              </section>

              <section className={`border rounded-2xl p-6 backdrop-blur-sm shadow-xl min-h-[420px] flex flex-col transition-colors duration-300 ${cardBg}`}>
                <h2 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${textPrimary}`}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Diagnostic Report
                </h2>
                
                {!result ? (
                  <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 border rounded-xl ${isDarkMode ? 'bg-slate-950/30 border-slate-800/80 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <Leaf className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No active analysis</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-500">Detected Condition</span>
                      <h3 className={`text-xl font-bold mt-0.5 capitalize ${textPrimary}`}>
                        {result.disease ? result.disease.replace(/___/g, ' - ').replace(/_/g, ' ') : 'Healthy Plant'}
                      </h3>
                    </div>
                    
                    <div className={`p-4 border rounded-xl flex items-start gap-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-500 rounded-lg"><Droplet className="w-4 h-4" /></div>
                      <div>
                        <span className={`text-xs font-medium ${textSecondary}`}>Recommended Treatment</span>
                        <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>{result.recommendation?.pesticide}</p>
                      </div>
                    </div>

                    <div className={`p-4 border rounded-xl flex items-start gap-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${textSecondary}`}>Prescribed Dosage & Regimen</span>
                        <p className={`text-sm mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{result.recommendation?.dosage || 'Routine inspection and standard hydration.'}</p>
                      </div>
                    </div>

                    {getEconomics(result.disease) && (
                      <div className={`mt-2 border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                        <div className={`p-2.5 flex items-center gap-2 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                          <Banknote className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold uppercase tracking-wider">Commercial Impact Analysis</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                            <p className={`text-xs flex items-center gap-1 ${textSecondary}`}><TrendingDown className="w-3 h-3 text-red-500"/> Est. Yield Loss</p>
                            <p className={`text-sm font-bold text-red-500 mt-1`}>{getEconomics(result.disease).revenueAtRisk}</p>
                          </div>
                          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
                            <p className={`text-xs flex items-center gap-1 ${textSecondary}`}><TrendingUp className="w-3 h-3 text-emerald-500"/> Projected ROI</p>
                            <p className={`text-sm font-bold text-emerald-500 mt-1`}>{getEconomics(result.disease).netSaved}</p>
                          </div>
                        </div>
                        <div className={`p-2 text-center text-xs border-t ${isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          Treatment Cost: {getEconomics(result.disease).treatmentCost}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: CULTIVATION GUIDE */}
        {activeTab === 'guide' && (
          <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
            {Object.entries(profiles).map(([plantName, info]) => (
              <div key={plantName} className={`border rounded-2xl p-6 shadow-xl hover:border-emerald-500/50 transition-colors ${cardBg}`}>
                <h3 className={`text-xl font-bold flex items-center gap-2 mb-4 ${textPrimary}`}>
                  <Sprout className="w-6 h-6 text-emerald-500" />
                  {plantName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Search className="w-3.5 h-3.5"/> Seed ID
                    </span>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{info.seed_identification}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"><Grid className="w-3.5 h-3.5"/> Planting</span>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{info.planting}</p>
                  </div>
                  <div>
                    <span className="text-xs text-teal-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"><Droplet className="w-3.5 h-3.5"/> Watering</span>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{info.watering}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"><Sun className="w-3.5 h-3.5"/> Sunlight</span>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{info.sunlight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className={`mb-4 w-80 sm:w-96 rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-fadeIn ${cardBg}`}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2"><Bot className="w-5 h-5" /><h3 className="font-semibold text-sm">AI Agronomist</h3></div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className={`h-80 overflow-y-auto p-4 flex flex-col gap-3 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm flex items-start gap-2 ${msg.sender === 'user' ? 'bg-emerald-500 text-white rounded-br-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700' : 'bg-white text-slate-700 rounded-bl-sm border border-slate-200'}`}>
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div><div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about your crops..." className={`flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <button type="submit" disabled={!chatInput.trim() || isTyping} className={`p-2 rounded-xl flex items-center justify-center ${!chatInput.trim() || isTyping ? 'bg-slate-500/20 text-slate-500' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}><Send className="w-4 h-4 ml-0.5" /></button>
            </form>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isChatOpen ? 'bg-slate-800 text-white' : 'bg-emerald-500 text-white'}`}>
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}