import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  BookOpen, 
  Cpu, 
  Table as TableIcon, 
  Search, 
  MessageSquare, 
  Image as ImageIcon, 
  Code, 
  Zap, 
  ShieldAlert, 
  ChevronRight, 
  Menu, 
  X,
  XCircle,
  Globe,
  Layers,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Palette,
  Layout,
  FileText,
  User,
  Activity,
  Wallet,
  Heart,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
  Send,
  Mic,
  MicOff,
  Volume2,
  Type as TypeIcon,
  Plus,
  Minus,
  Lock,
  Trash2,
  ArrowUp,
  ArrowLeft,
  BarChart3,
  Users,
  Clock,
  Share2,
  FileDown,
  Key,
  Settings,
  HelpCircle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { aiList, AIInfo } from './data';
import { generateEnhancedPrompt } from './promptEngine';

type Section = 'intro' | 'sheets' | 'table' | 'analysis' | 'seniors' | 'promptGen' | 'research';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('intro');
  const [selectedAI, setSelectedAI] = useState<string>(aiList[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState(1);

  // Prompt Generator State
  const [promptInput, setPromptInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecordingLocked, setIsRecordingLocked] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(20).fill(0));
  const [promptSource, setPromptSource] = useState<'gemini' | 'local'>('local');
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('gemini_api_key') || '') : '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [chartViewMode, setChartViewMode] = useState<'donut' | 'bars'>('donut');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Speech Recognition & Visualizer Setup
  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Visualizer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateFrequencies = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Map to 20 bars
          const bars = Array.from({ length: 20 }, (_, i) => {
            const index = Math.floor((i / 20) * bufferLength);
            return dataArray[index] / 255;
          });
          setAudioFrequencies(bars);
          animationFrameRef.current = requestAnimationFrame(updateFrequencies);
        }
      };
      updateFrequencies();

      // Setup Recognition
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        if (!isRecordingLocked) {
          stopListening();
        }
      };
      recognition.onerror = () => stopListening();
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setPromptInput(prev => prev + ' ' + finalTranscript);
          if (finalTranscript.toLowerCase().includes('eu preciso de')) {
            setTimeout(() => generatePrompt(finalTranscript), 500);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setIsRecordingLocked(false);
    setDragY(0);
    setDragX(0);
    setAudioFrequencies(new Array(20).fill(0));
  };

  const cancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    stopListening();
    setPromptInput('');
  };

  const speakPrompt = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // Slightly slower for better clarity
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveApiKey = (key: string) => {
    const trimmed = key.trim();
    setUserApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setShowKeyModal(false);
  };

  const generatePrompt = async (inputOverride?: string) => {
    const finalInput = inputOverride || promptInput;
    if (!finalInput.trim()) return;
    
    setIsGenerating(true);
    setGeneratedPrompt('');
    
    try {
      const result = await generateEnhancedPrompt(finalInput, { customApiKey: userApiKey });
      setGeneratedPrompt(result.text);
      setPromptSource(result.source);
    } catch (error) {
      console.error('Erro ao gerar prompt:', error);
      // Fallback garantido sem expor mensagem de erro
      setGeneratedPrompt(
        `# 🎯 [Comando Rápido para IA]\n\n` +
        `Aja como um especialista qualificado e atenda ao seguinte pedido com excelência:\n\n` +
        `> **${finalInput}**\n\n` +
        `### Diretrizes de Resposta:\n` +
        `- Responda de forma direta, com explicações práticas e exemplos do mundo real.\n` +
        `- Divida em tópicos organizados e use negrito para facilitar a leitura.\n` +
        `- Evite jargões desnecessários ou explicações vagas.`
      );
      setPromptSource('local');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const adjustFontSize = (delta: number) => {
    setFontSizeScale(prev => Math.min(Math.max(prev + delta, 0.8), 2.0));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * fontSizeScale}px`;
  }, [fontSizeScale]);

  const currentAI = useMemo(() => 
    aiList.find(ai => ai.id === selectedAI) || aiList[0]
  , [selectedAI]);

  const navItems = [
    { id: 'intro', label: 'O Começo', icon: BookOpen },
    { id: 'sheets', label: 'Conheça as IAs', icon: Cpu },
    { id: 'table', label: 'Lado a Lado', icon: TableIcon },
    { id: 'analysis', label: 'Papo Reto', icon: Activity },
    { id: 'seniors', label: 'Melhor Idade', icon: Heart },
    { id: 'promptGen', label: 'AprendAI', icon: Sparkles },
    { id: 'research', label: 'Pesquisa Técnica', icon: BarChart3 },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Manual de IA',
          text: 'Confira este manual incrível sobre Inteligência Artificial!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100 transition-all duration-300">
      {/* Global Actions - Identity Visual Manual */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 p-1.5 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-gray-100/50">
        <button
          onClick={handleShare}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-full hover:bg-black transition-all active:scale-95 group shadow-lg shadow-black/10"
        >
          <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Compartilhar</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#1A1A1A] border border-gray-200/60 rounded-full hover:bg-gray-50 transition-all active:scale-95 group shadow-sm"
        >
          <FileDown className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Baixar PDF</span>
        </button>
      </div>
      {/* Font Size Controls - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-[70] flex items-center gap-2 bg-white p-3 rounded-2xl shadow-2xl border-2 border-indigo-100 ring-4 ring-white/50">
        <button 
          onClick={() => adjustFontSize(-0.1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 active:scale-95"
          title="Diminuir letra"
        >
          <Minus className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center gap-0 px-3 border-x border-gray-100">
          <TypeIcon className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{Math.round(fontSizeScale * 100)}%</span>
        </div>
        <button 
          onClick={() => adjustFontSize(0.1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 active:scale-95"
          title="Aumentar letra"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">Manual IA</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 hidden lg:flex items-center gap-3 border-b border-gray-100">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight tracking-tight">Manual Técnico</h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Inteligência Artificial</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${activeSection === item.id 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}

              {activeSection === 'sheets' && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Modelos Disponíveis</p>
                  <div className="space-y-1">
                    {aiList.map((ai) => (
                      <button
                        key={ai.id}
                        onClick={() => setSelectedAI(ai.id)}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium transition-all
                          ${selectedAI === ai.id 
                            ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100 translate-x-1' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                        `}
                      >
                        <span>{ai.name}</span>
                        {selectedAI === ai.id && <ChevronRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status do Sistema</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-gray-600">Base de Dados Atualizada</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="max-w-5xl mx-auto p-6 lg:p-12">
            <AnimatePresence mode="wait">
              {activeSection === 'intro' && (
                <motion.section
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Pra começar: O básico
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                      <span className="text-indigo-600">AprendAI</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                      Um guia descomplicado para você entender sobre as inteligências artificiais, suas funções e seus usos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                      <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Globe className="text-blue-600 w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">Afinal, o que é IA?</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        É como ensinar um computador a aprender com exemplos, para que ele possa nos ajudar em tarefas como conversar, criar imagens e resolver problemas.
                      </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                      <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Layers className="text-purple-600 w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">Os tipos de IA</h3>
                      <ul className="space-y-3">
                        <li className="text-sm text-gray-600">
                          <strong className="text-gray-900">Generativa:</strong> É a que cria coisas novas, tipo textos, imagens ou músicas.
                        </li>
                        <li className="text-sm text-gray-600">
                          <strong className="text-gray-900">Analítica:</strong> Ela olha pra um monte de dados e encontra padrões que a gente nem imaginava.
                        </li>
                        <li className="text-sm text-gray-600">
                          <strong className="text-gray-900">Preditiva:</strong> Tenta adivinhar o que vai acontecer no futuro com base no que já rolou.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-3xl shadow-sm flex gap-4 items-start">
                    <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <h4 className="text-amber-800 font-bold">Aviso importante!</h4>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        As IAs são incríveis, mas elas também podem errar ou inventar coisas (as famosas "alucinações"). 
                        <strong> Sempre confira as informações importantes em outras fontes confiáveis</strong> antes de usar em trabalhos sérios ou tomar decisões. Não confie cegamente!
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200 space-y-8">
                    <h3 className="text-2xl font-bold">O que são os Prompts (Comandos)?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                          <h4 className="text-indigo-300 font-bold text-xs uppercase tracking-widest mb-2">O que é e para que serve</h4>
                          <p className="text-sm text-indigo-50/90 leading-relaxed">
                            Um <strong>prompt</strong> (ou comando) é a instrução que você dá para a IA. Imagine que é o seu pedido em um restaurante: quanto mais detalhado for o pedido, melhor virá o prato. Ele serve para guiar a IA e dizer exatamente o que você espera dela.
                          </p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                          <h4 className="text-indigo-300 font-bold text-xs uppercase tracking-widest mb-2">A função do comando</h4>
                          <p className="text-sm text-indigo-50/90 leading-relaxed">
                            Ele funciona como o "mapa" para a IA. Sem um bom mapa, ela pode se perder e dar respostas genéricas ou até erradas. A função do prompt é dar o <strong>contexto</strong> necessário para o robô entender o seu mundo.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-indigo-500/30 p-6 rounded-2xl border border-indigo-400/30 flex gap-4 h-full flex-col justify-center">
                          <h4 className="text-white font-bold text-lg">Por que um bom comando é importante?</h4>
                          <p className="text-sm text-indigo-50/90 leading-relaxed">
                            Saber escrever um bom comando é a habilidade mais importante para usar IA. Com um bom prompt, você evita que a IA "alucine" (invente mentiras) e garante que a resposta seja útil de verdade para o seu dia a dia, economizando o seu tempo.
                          </p>
                          <div className="flex gap-2 pt-2">
                             <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">Eficiência</span>
                             <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">Precisão</span>
                             <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">Clareza</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold">Dicas para conversar com a IA</h3>
                    <div className="prose prose-indigo max-w-none text-gray-600">
                      <p>
                        Para ter as melhores respostas, você precisa saber como pedir. Aqui estão algumas dicas simples para criar seus "prompts" (comandos):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">01</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Seja Específico</h5>
                            <p className="text-sm">Em vez de "fale sobre comida", tente "me dê 3 receitas saudáveis com frango para o jantar".</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">02</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Dê um Papel à IA</h5>
                            <p className="text-sm">Peça: "Aja como um professor de culinária" ou "Aja como um guia de viagens".</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">03</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Defina o Formato</h5>
                            <p className="text-sm">Peça para a resposta vir em lista, em um parágrafo curto ou até em formato de tabela.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">04</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Peça Exemplos</h5>
                            <p className="text-sm">Se algo estiver difícil, peça: "Me dê um exemplo prático de como isso funciona no dia a dia".</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Benefícios de um bom prompt
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Respostas Precisas:</strong> Você recebe exatamente o que precisa.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Economiza Tempo:</strong> Menos idas e vindas com a IA.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Mais Criatividade:</strong> Ideias muito mais interessantes.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Menos Erros:</strong> Evita que a IA invente informações.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === 'sheets' && (
                <motion.section
                  key="sheets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* AI Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                          Ficha Técnica
                        </span>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                          currentAI.category === 'Pesquisa' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {currentAI.category}
                        </span>
                        <span className="text-gray-400 font-medium text-sm">{currentAI.company}</span>
                      </div>
                      <h2 className="text-5xl font-black tracking-tighter text-gray-900">
                        {currentAI.name}
                        {currentAI.id === 'gemini' && (
                          <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
                            <ImageIcon className="w-3 h-3 mr-1" /> NOVO: IMAGEN 3 (IMAGENS REAIS)
                          </span>
                        )}
                      </h2>
                      <p className="text-lg text-indigo-600 font-medium">{currentAI.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {currentAI.multimodal.text && <MessageSquare className="w-5 h-5 text-gray-400" />}
                      {currentAI.multimodal.image && <ImageIcon className="w-5 h-5 text-gray-400" />}
                      {currentAI.multimodal.video && <Activity className="w-5 h-5 text-gray-400" />}
                      {currentAI.technology.online && <Globe className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Main Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Functions */}
                      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Função</h4>
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-md ${
                              currentAI.category === 'Pesquisa' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {currentAI.category}
                            </span>
                            <p className="text-sm text-gray-500 italic">
                              {currentAI.category === 'Relacionamento' 
                                ? 'Focada em conversas, criação de textos e interação como se fosse uma pessoa.'
                                : 'Focada em buscas na internet, análise de arquivos ou criação de imagens e códigos.'}
                            </p>
                          </div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">O que ela faz?</h4>
                          <p className="text-lg font-medium text-gray-800 leading-relaxed">{currentAI.mainFunction}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Outras coisas que ela faz</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAI.secondaryFunctions.map((func, i) => (
                              <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                                {func}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* How to use & Multimodal */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-indigo-900 text-white p-6 rounded-3xl space-y-4 shadow-xl shadow-indigo-100">
                          <div className="flex items-center gap-2 text-indigo-300">
                            <Zap className="w-5 h-5" />
                            <h4 className="font-bold text-sm uppercase tracking-tight">Como fazer funcionar?</h4>
                          </div>
                          <p className="text-sm text-indigo-50 leading-relaxed font-medium">{currentAI.howToUse}</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4 font-medium h-full">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Layers className="w-5 h-5" />
                            <h4 className="font-bold text-sm uppercase tracking-tight">Habilidades e Formatos</h4>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{currentAI.multimodal.details}</p>
                          {currentAI.id === 'gemini' && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-medium">
                              <p>✨ <strong>Destaque:</strong> O Gemini agora cria imagens com perfeição cinematográfica. Tente pedir: "Crie uma imagem de um astronauta em um jardim futurista".</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className={`flex items-center gap-2 text-[10px] font-bold ${currentAI.multimodal.text ? 'text-emerald-600' : 'text-gray-300'}`}>
                              <CheckCircle2 className="w-3 h-3" /> TEXTO
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-bold ${currentAI.multimodal.image ? 'text-emerald-600' : 'text-gray-300'}`}>
                              <CheckCircle2 className="w-3 h-3" /> IMAGEM
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-bold ${currentAI.multimodal.pdf ? 'text-emerald-600' : 'text-gray-300'}`}>
                              <CheckCircle2 className="w-3 h-3" /> PDF/ARQUIVOS
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-bold ${currentAI.multimodal.video ? 'text-emerald-600' : 'text-gray-300'}`}>
                              <CheckCircle2 className="w-3 h-3" /> VÍDEO
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Applications */}
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Como ela te ajuda no dia a dia?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex gap-3">
                            <GraduationCap className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">Educação</h5>
                              <p className="text-xs text-gray-500">{currentAI.applications.education}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Briefcase className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">Empresas</h5>
                              <p className="text-xs text-gray-500">{currentAI.applications.business}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Code className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">Programação</h5>
                              <p className="text-xs text-gray-500">{currentAI.applications.programming}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Palette className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">Design</h5>
                              <p className="text-xs text-gray-500">{currentAI.applications.design}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                      <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 space-y-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        
                        <div className="space-y-4 relative z-10">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-300" />
                            <h4 className="font-bold text-sm uppercase tracking-tight text-white">Por que ela é boa?</h4>
                          </div>
                          <ul className="space-y-3">
                            {currentAI.strengths.map((s, i) => (
                              <li key={i} className="flex gap-2 text-xs text-indigo-50 leading-relaxed font-medium">
                                <CheckCircle2 className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-6 border-t border-indigo-500/50 space-y-4 relative z-10">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-indigo-200" />
                            <h4 className="font-bold text-sm uppercase tracking-tight text-indigo-100">Grátis ou Pago?</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                              <span className="text-[10px] font-bold text-indigo-200 uppercase block mb-1">Na Faixa (Grátis):</span>
                              <p className="text-xs text-indigo-50 leading-relaxed">{currentAI.versions.free}</p>
                            </div>
                            <div className="bg-indigo-500/30 p-4 rounded-2xl border border-white/10">
                              <span className="text-[10px] font-bold text-amber-300 uppercase block mb-1">Versão Completa (Paga):</span>
                              <p className="text-xs text-indigo-50 leading-relaxed font-semibold">{currentAI.versions.paid}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-indigo-500/50 space-y-3 relative z-10">
                          <div className="flex items-center gap-2 text-amber-300 animate-pulse">
                            <AlertTriangle className="w-5 h-5" />
                            <h4 className="font-bold text-sm uppercase tracking-tight">O que você precisa saber</h4>
                          </div>
                          <p className="text-xs text-indigo-100 italic leading-relaxed bg-indigo-900/40 p-3 rounded-xl border border-white/5">
                            {currentAI.limits}
                          </p>
                        </div>
                      </div>

                      <div className="bg-rose-600 text-white p-7 rounded-[2rem] shadow-2xl shadow-rose-200 space-y-5 border-4 border-rose-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <ShieldAlert className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <AlertTriangle className="w-6 h-6 text-rose-100 animate-pulse" />
                          <h4 className="font-black text-lg uppercase tracking-wider">Pontos Negativos</h4>
                        </div>
                        <ul className="space-y-4 relative z-10">
                          {currentAI.limitations.map((l, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed bg-white/10 p-3 rounded-xl border border-white/20">
                              <XCircle className="w-5 h-5 text-rose-200 flex-shrink-0 mt-0.5" />
                              {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === 'table' && (
                <motion.section
                  key="table"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Tabela Comparativa Final</h2>
                    <p className="text-gray-500">Uma visão panorâmica das principais ferramentas do mercado.</p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da IA</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Empresa</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Função</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Imagens</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest relative group cursor-help">
                              Criação de Código
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl shadow-xl z-50 normal-case font-medium">
                                <p>Capacidade da IA de escrever linguagens de programação (como Python, HTML, Javascript) ou arrumar erros em sites e aplicativos.</p>
                                <div className="absolute top-full left-4 border-8 border-transparent border-t-gray-900" />
                              </div>
                            </th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Melhor Para</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {aiList.map((ai) => (
                            <tr key={ai.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-bold text-gray-900 text-sm">{ai.name}</td>
                              <td className="p-4 text-xs text-gray-500">{ai.company}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                                  ai.category === 'Pesquisa' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {ai.category}
                                </span>
                              </td>
                              <td className="p-4">
                                {ai.multimodal.image ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                              </td>
                              <td className="p-4">
                                {ai.secondaryFunctions.includes('Criação de código') || ai.id.includes('copilot') ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                              </td>
                              <td className="p-4 text-xs font-medium text-gray-600">{ai.bestFor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === 'analysis' && (
                <motion.section
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Papo Reto: Análise Final</h2>
                    <p className="text-xl text-gray-500 max-w-2xl">Como navegar com sabedoria nesse mar de Inteligência Artificial.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-[2rem] border-2 border-indigo-50 shadow-xl shadow-indigo-100/20 space-y-4 relative overflow-hidden group hover:border-indigo-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors" />
                        <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 relative z-10 group-hover:rotate-12 transition-transform">
                          <Search className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 relative z-10">Pesquisa vs Geração</h3>
                        <p className="text-sm text-gray-600 leading-relaxed relative z-10">
                          É muito importante saber a diferença: IAs de <strong>Pesquisa</strong> (tipo o Perplexity) são como bibliotecários — buscam fatos reais com fontes. Já as de <strong>Geração</strong> (tipo o ChatGPT) são como poetas — focam em ser criativas, mas podem "alucinar" e inventar histórias.
                        </p>
                      </div>
 
                      <div className="bg-white p-8 rounded-[2rem] border-2 border-amber-50 shadow-xl shadow-amber-100/20 space-y-4 relative overflow-hidden group hover:border-amber-200 transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors" />
                        <div className="bg-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 relative z-10 group-hover:-rotate-12 transition-transform">
                          <Lightbulb className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 relative z-10">Use a sua cabeça!</h3>
                        <p className="text-sm text-gray-600 leading-relaxed relative z-10">
                          A IA é o seu <strong>estagiário nota 10</strong>, não o seu substituto. Você é o chefe! Sempre revise o que ela entrega. Ter "letramento digital" hoje em dia é saber usar a IA como uma ferramenta, sem nunca desligar o seu senso crítico.
                        </p>
                      </div>
                    </div>
 
                    <div className="bg-indigo-900 text-white p-10 rounded-[3rem] space-y-8 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-40 h-40" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight relative z-10">Qual usar e quando? 🧐</h3>
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-default">
                          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-lg font-black shrink-0">1</div>
                          <div>
                            <p className="text-base font-bold text-indigo-300 uppercase tracking-tighter">Escrever e Programar</p>
                            <p className="text-sm text-indigo-100">Claude ou ChatGPT são imbatíveis.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-default">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-lg font-black shrink-0">2</div>
                          <div>
                            <p className="text-base font-bold text-blue-300 uppercase tracking-tighter">Achar Fatos Reais</p>
                            <p className="text-sm text-blue-100">Perplexity ou Microsoft Copilot.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-default">
                          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-lg font-black shrink-0">3</div>
                          <div>
                            <p className="text-base font-bold text-rose-300 uppercase tracking-tighter">Arte e Design</p>
                            <p className="text-sm text-rose-100">Midjourney ou Canva IA.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-default text-emerald-400">
                          <CheckCircle2 className="w-6 h-6 animate-pulse" />
                          <p className="text-sm font-bold">Dica: O Gemini é o melhor 'pau pra toda obra' se você usa Google!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] space-y-6">
                    <h3 className="text-2xl font-bold">O futuro e você</h3>
                    <p className="text-gray-400 leading-relaxed">
                      A IA não veio pra substituir a gente, mas pra dar um "up" na nossa criatividade. O segredo é entender como elas funcionam, saber seus limites e usar com ética. Quem souber colaborar com a IA vai estar um passo à frente!
                    </p>
                    <div className="pt-6 flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">Ética</div>
                      <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">Confira Sempre</div>
                      <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">Criatividade</div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === 'seniors' && (
                <motion.section
                  key="seniors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Especial: Tecnologia que Cuida
                    </span>
                    <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">IA para a Melhor Idade</h2>
                    <p className="text-2xl text-gray-500 max-w-2xl">A tecnologia não tem idade! Veja como a IA pode ser uma grande aliada no dia a dia.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                      <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                        <Heart className="text-rose-600 w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold">Saúde e Bem-estar</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        IAs podem lembrar o horário dos remédios, monitorar batimentos cardíacos através de relógios inteligentes e até ajudar a identificar sintomas precoces de doenças.
                      </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                      <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="text-blue-600 w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold">Companhia e Lazer</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Não sabe com quem conversar? IAs como o ChatGPT podem bater papo, contar histórias, sugerir receitas ou ajudar a aprender um novo hobby sem pressa.
                      </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                      <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="text-emerald-600 w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold">Segurança Digital</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        A IA também ajuda a bloquear chamadas de golpistas e identificar e-mails falsos, protegendo quem ainda está se acostumando com o mundo digital.
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-10 rounded-[2.5rem] space-y-10">
                    <h3 className="text-3xl font-bold text-indigo-900">Dicas de Ouro para Idosos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <PhoneCall className="text-indigo-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-indigo-900">Use a Voz</h4>
                          <p className="text-lg text-indigo-700/80">Não precisa digitar! Fale com a IA (como a Alexa ou o Google) para pedir músicas, notícias ou ligar para alguém.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Search className="text-indigo-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-indigo-900">Peça Explicações Simples</h4>
                          <p className="text-lg text-indigo-700/80">Se não entendeu algo, peça: "Explique como se eu tivesse 10 anos". A IA vai usar palavras bem fáceis.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <ShieldAlert className="text-rose-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-rose-900">Cuidado com Dados</h4>
                          <p className="text-lg text-rose-700/80">Nunca passe senhas ou dados bancários para a IA. Ela é inteligente, mas você deve manter seus segredos guardados.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Zap className="text-amber-600 w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-amber-900">Peça Ajuda para Ler</h4>
                          <p className="text-lg text-amber-700/80">Se a letra estiver pequena, peça para a IA ler o texto em voz alta ou resumir o que é mais importante.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center space-y-6">
                    <p className="text-gray-500 italic text-xl">"A tecnologia é uma ponte, não um muro. Use a IA para ficar mais perto de quem você ama e descobrir coisas novas todos os dias."</p>
                  </div>
                </motion.section>
              )}

              {activeSection === 'promptGen' && (
                <motion.section
                  key="promptGen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Ferramenta Mágica
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">AprendAI</h2>
                    <p className="text-xl text-gray-500 max-w-2xl">Fale ou escreva o que você precisa, e eu crio o comando perfeito para você enviar a sua IA</p>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                        <Zap className="text-amber-500 w-5 h-5" />
                        Como usar com a voz?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Toque no botão do **Microfone** e diga algo como: <span className="font-bold text-indigo-600 italic">"Crie um resumo de um livro"</span> ou <span className="font-bold text-indigo-600 italic">"Escreva um e-mail pedindo folga"</span>.
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        Eu vou escrever o comando e você ainda pode clicar no ícone de **Som** para me ouvir lendo o resultado para você!
                      </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label htmlFor="prompt-input" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            O que você precisa hoje?
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              {userApiKey ? 'Google Gemini API Ativa' : 'Motor AprendAI (Compatível c/ GitHub Pages)'}
                            </span>
                            <button
                              onClick={() => {
                                setTempKeyInput(userApiKey);
                                setShowKeyModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-full border border-indigo-100 transition-colors"
                              title="Configurar Chave de API da Google Gemini"
                            >
                              <Key className="w-3 h-3" />
                              {userApiKey ? 'Chave Gemini Salva' : 'Chave Gemini (Opcional)'}
                            </button>
                          </div>
                        </div>

                        {/* Quick Prompts Suggestions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sugestões rápidas:</span>
                          {[
                            'Carta formal de agradecimento',
                            'Explicar fotossíntese para crianças',
                            'Script Python para automação',
                            'Roteiro para Reels de produtividade',
                            'Dicas de segurança para idosos'
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setPromptInput(suggestion);
                                generatePrompt(suggestion);
                              }}
                              className="text-xs px-3 py-1 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-full transition-all active:scale-95 text-left font-medium"
                            >
                              ✨ {suggestion}
                            </button>
                          ))}
                        </div>
                          
                          {/* Advanced Microphone Button */}
                          <div className="relative flex items-center gap-4 flex-1 justify-end">
                            <AnimatePresence>
                              {isListening && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 flex-1"
                                >
                                  <div className="flex items-center gap-1 h-4 flex-1">
                                    {audioFrequencies.map((freq, i) => (
                                      <motion.div
                                        key={i}
                                        animate={{ height: `${Math.max(4, freq * 100)}%` }}
                                        className="w-1 bg-rose-400 rounded-full"
                                      />
                                    ))}
                                  </div>
                                  {!isRecordingLocked && (
                                    <div className="flex items-center gap-4 text-rose-400 text-[10px] font-bold uppercase tracking-tighter">
                                      <div className="flex items-center gap-1 animate-pulse">
                                        <ArrowLeft className="w-3 h-3" /> Arraste para cancelar
                                      </div>
                                      <div className="flex items-center gap-1 animate-pulse">
                                        <ArrowUp className="w-3 h-3" /> Arraste para travar
                                      </div>
                                    </div>
                                  )}
                                  {isRecordingLocked && (
                                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                                      <Lock className="w-3 h-3" /> Gravando...
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="relative">
                              <AnimatePresence>
                                {isListening && !isRecordingLocked && (
                                  <>
                                    <motion.div 
                                      style={{ y: dragY }}
                                      className="absolute -top-12 left-1/2 -translate-x-1/2 text-rose-400"
                                    >
                                      <Lock className="w-5 h-5" />
                                    </motion.div>
                                    <motion.div 
                                      style={{ x: dragX }}
                                      className="absolute top-1/2 -left-12 -translate-y-1/2 text-rose-400"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>

                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  startListening();
                                }}
                                onMouseMove={(e) => {
                                  if (isListening && !isRecordingLocked && e.buttons === 1) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const dy = e.clientY - rect.top;
                                    const dx = e.clientX - rect.left;
                                    
                                    if (dy < -50) setIsRecordingLocked(true);
                                    if (dx < -50) cancelRecording();
                                    
                                    setDragY(Math.min(0, dy));
                                    setDragX(Math.min(0, dx));
                                  }
                                }}
                                onMouseUp={() => {
                                  if (isListening && !isRecordingLocked) stopListening();
                                }}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  startListening();
                                }}
                                onTouchMove={(e) => {
                                  if (isListening && !isRecordingLocked) {
                                    const touch = e.touches[0];
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const dy = touch.clientY - rect.top;
                                    const dx = touch.clientX - rect.left;
                                    
                                    if (dy < -60) setIsRecordingLocked(true);
                                    if (dx < -60) cancelRecording();
                                    
                                    setDragY(Math.min(0, dy));
                                    setDragX(Math.min(0, dx));
                                  }
                                }}
                                onTouchEnd={() => {
                                  if (isListening && !isRecordingLocked) stopListening();
                                }}
                                className={`
                                  relative z-10 p-4 rounded-full transition-all shadow-xl
                                  ${isListening 
                                    ? 'bg-rose-600 text-white scale-125' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                                `}
                              >
                                {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                {isListening && (
                                  <motion.div 
                                    layoutId="mic-ring"
                                    className="absolute inset-0 rounded-full bg-rose-600/20 animate-ping"
                                  />
                                )}
                              </button>
                              
                              {isRecordingLocked && (
                                <button 
                                  onClick={stopListening}
                                  className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              {isRecordingLocked && (
                                <button 
                                  onClick={cancelRecording}
                                  className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 bg-rose-100 text-rose-600 rounded-full shadow-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                      <div className="relative">
                        <textarea
                          id="prompt-input"
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          placeholder="O que você quer que a IA faça? Ex: Escreva uma carta de aniversário, explique um conceito difícil, crie um código..."
                          className="w-full h-32 p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-indigo-500 focus:ring-0 transition-all resize-none text-lg"
                        />
                        <button
                          onClick={() => generatePrompt()}
                          disabled={isGenerating || !promptInput.trim()}
                          className={`
                            absolute bottom-4 right-4 p-4 rounded-2xl transition-all flex items-center gap-2 font-bold
                            ${isGenerating || !promptInput.trim() 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}
                          `}
                        >
                          {isGenerating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          Gerar Prompt
                        </button>
                      </div>
                    </div>

                    {generatedPrompt && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4 pt-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Seu Prompt está pronto:</h4>
                          <div className="flex gap-4">
                            <button
                              onClick={() => speakPrompt(generatedPrompt)}
                              className={`
                                flex items-center gap-2 font-bold text-sm transition-colors
                                ${isSpeaking ? 'text-rose-600' : 'text-amber-600 hover:text-amber-700'}
                              `}
                            >
                              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                              {isSpeaking ? 'Falando...' : 'Ouvir Prompt'}
                            </button>
                            <button
                              onClick={copyToClipboard}
                              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                            >
                              {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {hasCopied ? 'Copiado!' : 'Copiar Prompt'}
                            </button>
                          </div>
                        </div>
                        <div className="p-8 bg-indigo-950 text-white rounded-[2.5rem] border-4 border-indigo-500/30 leading-loose font-bold text-xl markdown-body shadow-2xl shadow-indigo-200">
                          <Markdown>{generatedPrompt}</Markdown>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 flex items-center gap-4">
                          <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black">!</div>
                          <div>
                            <h5 className="font-bold text-amber-900">Como usar esse comando?</h5>
                            <p className="text-sm text-amber-800">Clique no botão <strong>Copiar Prompt</strong> acima, abra a sua IA favorita (como o ChatGPT ou Gemini) e <strong>cole</strong> o texto no campo de mensagem dela.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                      <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Sparkles className="text-amber-500 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900">Por que usar?</h4>
                        <p className="text-sm text-amber-800/80">As IAs dão respostas melhores quando o pedido é bem detalhado. Eu cuido dessa parte chata para você!</p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex gap-4">
                      <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Layout className="text-indigo-600 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-900">Funciona em todas</h4>
                        <p className="text-sm text-indigo-800/80">Os prompts gerados aqui funcionam no ChatGPT, Gemini, Claude, Copilot e qualquer outra IA de texto.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-gray-100">
                    <h3 className="text-2xl font-bold">Dicas para conversar com a IA</h3>
                    <div className="prose prose-indigo max-w-none text-gray-600">
                      <p>
                        Para ter as melhores respostas, você precisa saber como pedir. Aqui estão algumas dicas simples para criar seus "prompts" (comandos):
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">01</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Seja Específico</h5>
                            <p className="text-sm">Em vez de "fale sobre comida", tente "me dê 3 receitas saudáveis com frango para o jantar".</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">02</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Dê um Papel à IA</h5>
                            <p className="text-sm">Peça: "Aja como um professor de culinária" ou "Aja como um guia de viagens".</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">03</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Defina o Formato</h5>
                            <p className="text-sm">Peça para a resposta vir em lista, em um parágrafo curto ou até em formato de tabela.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">04</div>
                          <div>
                            <h5 className="font-bold text-gray-900">Peça Exemplos</h5>
                            <p className="text-sm">Se algo estiver difícil, peça: "Me dê um exemplo prático de como isso funciona no dia a dia".</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Benefícios de um bom prompt
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Respostas Precisas:</strong> Você recebe exatamente o que precisa.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Economiza Tempo:</strong> Menos idas e vindas com a IA.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Mais Criatividade:</strong> Ideias muito mais interessantes.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800"><strong>Menos Erros:</strong> Evita que a IA invente informações.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
              {activeSection === 'research' && (
                    <motion.section
                      key="research"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-12"
                    >
                      <div className="space-y-4">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                          Resultados Oficiais da Pesquisa
                        </span>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Pesquisa Técnica: Todos os Resultados</h2>
                        <p className="text-xl text-gray-500 max-w-3xl leading-relaxed">
                          Mapeamento estatístico completo com <strong>76 respostas coletadas</strong> via Microsoft Forms. Todos os votos, percentuais e respostas estão detalhados abaixo.
                        </p>
                      </div>

                      {/* Header Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Respostas Totais</p>
                            <p className="text-3xl font-black text-gray-900">76</p>
                            <span className="text-[10px] text-emerald-600 font-bold">100% Concluídas</span>
                          </div>
                          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usam com Frequência</p>
                            <p className="text-3xl font-black text-indigo-600">63.2%</p>
                            <span className="text-[10px] text-gray-500 font-semibold">48 de 76 pessoas</span>
                          </div>
                          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Activity className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conferem Antes</p>
                            <p className="text-3xl font-black text-pink-600">76.3%</p>
                            <span className="text-[10px] text-gray-500 font-semibold">58 pesquisam fatos</span>
                          </div>
                          <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NPS Global</p>
                            <p className="text-3xl font-black text-amber-600">-38</p>
                            <span className="text-[10px] text-amber-700 font-semibold">Postura de Cautela</span>
                          </div>
                          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Frequency Chart - All 4 responses visible */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:col-span-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pergunta 1 de 5</span>
                              <h3 className="text-2xl font-black text-gray-900">Com que frequência você usa as IAs?</h3>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">Base: 76 respostas únicas computadas.</p>
                            </div>
                            <span className="self-start sm:self-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                              4 Respostas Mapeadas
                            </span>
                          </div>

                          <div className="relative h-[320px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                                <Pie
                                  data={[
                                    { name: 'Algumas vezes/semana', value: 31, color: '#ec4899', percentLabel: '40.8%' },
                                    { name: 'Raramente', value: 24, color: '#10b981', percentLabel: '31.6%' },
                                    { name: 'Todos os dias', value: 17, color: '#3b82f6', percentLabel: '22.4%' },
                                    { name: 'Nunca', value: 4, color: '#8b5cf6', percentLabel: '5.3%' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={115}
                                  paddingAngle={4}
                                  dataKey="value"
                                  animationDuration={1200}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.52;
                                    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                                    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                                    if (Number(percent) < 0.04) return null;
                                    return (
                                      <text
                                        x={x}
                                        y={y}
                                        fill="#ffffff"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="font-black text-xs pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                                      >
                                        {`${value} (${(Number(percent) * 100).toFixed(0)}%)`}
                                      </text>
                                    );
                                  }}
                                >
                                  {[
                                    { color: '#ec4899' },
                                    { color: '#10b981' },
                                    { color: '#3b82f6' },
                                    { color: '#8b5cf6' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(val: any, name: any) => [`${val} votos (${((Number(val)/76)*100).toFixed(1)}%)`, name]}
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            {/* Center hole summary badge */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total</span>
                              <span className="text-2xl font-black text-gray-900">76</span>
                              <span className="text-[10px] font-bold text-pink-600">40.8% Líder</span>
                            </div>
                          </div>

                          {/* 4 Cards with Complete Visible Results */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                            {[
                              { name: 'Algumas vezes/semana', color: '#ec4899', value: 31, percent: '40.8%', tag: 'Mais votada' },
                              { name: 'Raramente', color: '#10b981', value: 24, percent: '31.6%', tag: '2º Lugar' },
                              { name: 'Todos os dias', color: '#3b82f6', value: 17, percent: '22.4%', tag: 'Uso Diário' },
                              { name: 'Nunca', color: '#8b5cf6', value: 4, percent: '5.3%', tag: 'Não usam' }
                            ].map((item, i) => (
                              <div key={i} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1 mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-bold text-gray-800">{item.name}</span>
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-gray-400">{item.tag}</span>
                                </div>
                                <div className="flex items-baseline justify-between pt-2 border-t border-gray-200/60">
                                  <span className="text-2xl font-black text-gray-900">{item.value} <span className="text-xs font-bold text-gray-500">votos</span></span>
                                  <span className="text-sm font-black px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: item.color }}>
                                    {item.percent}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: item.percent, backgroundColor: item.color }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Usage Situations - Multiple Choice with All 5 Options Visible */}
                        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:col-span-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pergunta 2 de 5 (Múltipla Escolha)</span>
                              <h3 className="text-2xl font-black text-gray-900">Em quais situações você pede ajuda à IA?</h3>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                76 alunos responderam marcando múltiplas opções, somando <strong>214 votos no total</strong>.
                              </p>
                            </div>
                            <span className="self-start sm:self-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                              5 Categorias Mapeadas
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
                            {/* Donut Distribution of Mentions */}
                            <div className="lg:col-span-5 relative h-[300px] w-full flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                  <Pie
                                    data={[
                                      { name: 'Explicar conteúdo', value: 54, color: '#3b82f6' },
                                      { name: 'Resumir/criar textos', value: 47, color: '#ec4899' },
                                      { name: 'Dar ideias/roteiros', value: 44, color: '#10b981' },
                                      { name: 'Respostas e questões', value: 35, color: '#8b5cf6' },
                                      { name: 'Tradução', value: 34, color: '#f59e0b' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={105}
                                    paddingAngle={3}
                                    dataKey="value"
                                    animationDuration={1200}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                                      const RADIAN = Math.PI / 180;
                                      const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.52;
                                      const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                                      const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                                      return (
                                        <text
                                          x={x}
                                          y={y}
                                          fill="#ffffff"
                                          textAnchor="middle"
                                          dominantBaseline="central"
                                          className="font-black text-[11px] pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                                        >
                                          {`${value}`}
                                        </text>
                                      );
                                    }}
                                  >
                                    {[
                                      { color: '#3b82f6' },
                                      { color: '#ec4899' },
                                      { color: '#10b981' },
                                      { color: '#8b5cf6' },
                                      { color: '#f59e0b' }
                                    ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    formatter={(val: any, name: any) => [`${val} escolhas (${((Number(val)/76)*100).toFixed(1)}% dos alunos)`, name]}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>

                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total</span>
                                <span className="text-2xl font-black text-gray-900">214</span>
                                <span className="text-[10px] font-bold text-blue-600">Votos Totais</span>
                              </div>
                            </div>

                            {/* Complete Ranked List with 100% of Options & Respondents % */}
                            <div className="lg:col-span-7 space-y-3.5">
                              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-400 pb-1 border-b border-gray-100">
                                <span>Situação de Uso</span>
                                <span>Votos e % dos 76 Alunos</span>
                              </div>

                              {[
                                { rank: '#1', name: 'Explicar conteúdo de matérias', votes: 54, percent: '71.1%', color: '#3b82f6', bg: 'bg-blue-500' },
                                { rank: '#2', name: 'Resumir e criar textos', votes: 47, percent: '61.8%', color: '#ec4899', bg: 'bg-pink-500' },
                                { rank: '#3', name: 'Dar ideias, temas e roteiros', votes: 44, percent: '57.9%', color: '#10b981', bg: 'bg-emerald-500' },
                                { rank: '#4', name: 'Respostas e tirar dúvidas de exercícios', votes: 35, percent: '46.1%', color: '#8b5cf6', bg: 'bg-purple-500' },
                                { rank: '#5', name: 'Tradução e auxílio em outros idiomas', votes: 34, percent: '44.7%', color: '#f59e0b', bg: 'bg-amber-500' }
                              ].map((item, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80 hover:bg-gray-100/60 transition-colors">
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: item.color }}>
                                        {item.rank}
                                      </span>
                                      <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-sm font-black text-gray-900">{item.votes} votos</span>
                                      <span className="text-xs font-black px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: item.color }}>
                                        {item.percent}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: item.percent, backgroundColor: item.color }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. Trustfulness Chart - Both options clear and prominent */}
                        <div className="bg-indigo-950 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <ShieldCheck className="w-40 h-40" />
                          </div>
                          
                          <div className="space-y-2 relative z-10">
                            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Pergunta 3 de 5</span>
                            <h3 className="text-2xl font-black leading-tight text-white">Você acredita realmente nas respostas geradas por IA?</h3>
                            <p className="text-xs text-indigo-200/70 font-medium">Postura dos 76 entrevistados quanto à confiabilidade.</p>
                          </div>

                          <div className="relative h-[240px] w-full flex items-center justify-center relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <Pie
                                  data={[
                                    { name: 'Pesquiso pra confirmar', value: 58 },
                                    { name: 'Acredito realmente', value: 18 }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={95}
                                  paddingAngle={4}
                                  dataKey="value"
                                  stroke="#1e1b4b"
                                  strokeWidth={2}
                                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.52;
                                    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                                    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                                    return (
                                      <text
                                        x={x}
                                        y={y}
                                        fill="#ffffff"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="font-black text-xs pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                                      >
                                        {`${value} (${(Number(percent) * 100).toFixed(0)}%)`}
                                      </text>
                                    );
                                  }}
                                >
                                  <Cell fill="#ec4899" />
                                  <Cell fill="#3b82f6" />
                                </Pie>
                                <Tooltip 
                                  formatter={(val: any, name: any) => [`${val} votos (${((Number(val)/76)*100).toFixed(1)}%)`, name]}
                                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e1b4b', color: '#fff' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Maioria</span>
                              <span className="text-xl font-black text-pink-400">76.3%</span>
                              <span className="text-[9px] font-bold text-white/80">Pesquisa</span>
                            </div>
                          </div>

                          <div className="space-y-3 relative z-10">
                            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shrink-0" />
                                  <span className="text-sm font-bold text-white">Pesquiso pra confirmar antes de usar</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-black text-pink-300">58</span>
                                  <span className="text-xs font-bold text-pink-200">(76.3%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 rounded-full" style={{ width: '76.3%' }} />
                              </div>
                            </div>

                            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
                                  <span className="text-sm font-bold text-white">Acredito realmente sem pesquisar</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-black text-blue-300">18</span>
                                  <span className="text-xs font-bold text-blue-200">(23.7%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '23.7%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4 & 5. Errors and Fake News Perception - Complete Sim & Não */}
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
                          <div className="space-y-6">
                            <div>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Perguntas 4 e 5</span>
                              <h3 className="text-2xl font-black text-gray-900">Percepção de Erros e Verdades</h3>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">Experiências práticas vivenciadas pelos 76 entrevistados.</p>
                            </div>

                            {/* Item 4 */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-bold text-gray-800">Já viu alguma informação <u>errada</u> fornecida por IA?</p>
                                <span className="text-xs font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">63.2% SIM</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                <div className="flex items-center justify-between p-2 bg-indigo-50 text-indigo-900 rounded-xl">
                                  <span>SIM: 48 votos</span>
                                  <span className="font-black">63.2%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-gray-200/70 text-gray-700 rounded-xl">
                                  <span>NÃO: 28 votos</span>
                                  <span className="font-black">36.8%</span>
                                </div>
                              </div>

                              <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-200">
                                <div className="h-full bg-indigo-600 rounded-l-full" style={{ width: '63.2%' }} title="SIM: 48 (63.2%)" />
                                <div className="h-full bg-gray-400 rounded-r-full" style={{ width: '36.8%' }} title="NÃO: 28 (36.8%)" />
                              </div>
                            </div>

                            {/* Item 5 */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-bold text-gray-800">Já acreditou em uma <u>notícia falsa</u> (alucinação) gerada por IA?</p>
                                <span className="text-xs font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">40.8% SIM</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                <div className="flex items-center justify-between p-2 bg-rose-50 text-rose-900 rounded-xl">
                                  <span>SIM: 31 votos</span>
                                  <span className="font-black">40.8%</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-emerald-50 text-emerald-900 rounded-xl">
                                  <span>NÃO: 45 votos</span>
                                  <span className="font-black">59.2%</span>
                                </div>
                              </div>

                              <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-200">
                                <div className="h-full bg-rose-500 rounded-l-full" style={{ width: '40.8%' }} title="SIM: 31 (40.8%)" />
                                <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: '59.2%' }} title="NÃO: 45 (59.2%)" />
                              </div>
                            </div>
                          </div>

                          {/* NPS Box */}
                          <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200/80 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">-38</div>
                                <div>
                                  <h4 className="font-bold text-amber-950 uppercase tracking-widest text-[10px]">Net Promoter Score (NPS)</h4>
                                  <p className="text-xs text-amber-800 font-semibold">Índice de Confiabilidade Percebida</p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-full text-[10px] font-black uppercase">Zona de Cautela</span>
                            </div>

                            {/* Pointer Slider */}
                            <div className="relative h-7 my-2 px-3">
                              <div className="absolute top-1/2 left-0 right-0 h-2 bg-amber-200/80 rounded-full -translate-y-1/2" />
                              <div className="absolute top-1/2 left-[31%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="w-5 h-5 bg-amber-600 rounded-full border-2 border-white shadow-md animate-pulse" />
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-amber-900/70">
                              <span>-100 (Crítico)</span>
                              <span className="font-black text-amber-900">NPS: -38</span>
                              <span>+100 (Excelente)</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200 text-center">
                              <div className="bg-white/70 p-2 rounded-xl">
                                <span className="text-[10px] text-rose-700 font-bold block">Detratores (0-6)</span>
                                <span className="text-base font-black text-rose-700">36 (47.4%)</span>
                              </div>
                              <div className="bg-white/70 p-2 rounded-xl">
                                <span className="text-[10px] text-amber-800 font-bold block">Passivos (7-8)</span>
                                <span className="text-base font-black text-amber-800">33 (43.4%)</span>
                              </div>
                              <div className="bg-white/70 p-2 rounded-xl">
                                <span className="text-[10px] text-emerald-700 font-bold block">Promotores (9-10)</span>
                                <span className="text-base font-black text-emerald-700">7 (9.2%)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Microsoft Forms Link Card */}
                      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-center justify-between border border-white/10 shadow-xl">
                        <div className="flex items-center gap-5">
                          <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                            <ExternalLink className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-black">Painel Oficial Microsoft Forms</h4>
                            <p className="text-indigo-200 text-sm max-w-xl">
                              Todos os dados acima foram extraídos diretamente do relatório oficial com os 76 formulários respondidos. Você pode auditar a pesquisa original online.
                            </p>
                          </div>
                        </div>
                        <a 
                          href="https://forms.cloud.microsoft/Pages/DesignPageV2.aspx?prevorigin=shell&origin=NeoPortalPage&subpage=design&id=SxwFsZQ7q0GUQec6cjQv3bcV-qcHlAZDr0ubnFYce-xUMklZMkdEQU1GUldUNVNVN0VFRk1GMEU5RS4u&analysis=true"
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-3.5 bg-white text-gray-900 rounded-2xl font-bold shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shrink-0"
                        >
                          <span>Abrir Pesquisa Original</span>
                          <ExternalLink className="w-4 h-4 text-indigo-600" />
                        </a>
                      </div>

                      <p className="text-center text-gray-400 text-xs pb-4 italic">
                        * Relatório atualizado e verificado conforme dados da pesquisa com 76 respondentes.
                      </p>
                    </motion.section>
                  )}
                </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Gemini API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900">Chave Google Gemini</h3>
                    <p className="text-xs text-gray-400 font-medium">Configuração Opcional para o AprendAI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  O <strong>AprendAI já funciona 100% de graça</strong> no GitHub Pages e no Google graças ao nosso motor inteligente offline!
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  💡 Caso queira conectar diretamente a sua própria chave pessoal da Google Gemini (AI Studio), insira-a abaixo. Ela ficará salva exclusivamente no seu navegador:
                </p>
                <div>
                  <input
                    type="password"
                    value={tempKeyInput}
                    onChange={(e) => setTempKeyInput(e.target.value)}
                    placeholder="Cole sua chave da Gemini (AIzaSy...)"
                    className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-600 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {userApiKey && (
                  <button
                    onClick={() => {
                      saveApiKey('');
                      setTempKeyInput('');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 py-2 px-3 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Remover Chave
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => saveApiKey(tempKeyInput)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-lg shadow-indigo-200"
                  >
                    Salvar Chave
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-indigo-600 w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">Manual Técnico IA</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">© 2026 Guia Educacional STEAM. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Activity className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
