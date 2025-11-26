import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Image as ImageIcon,
    LogOut,
    Send,
    Copy,
    Zap,
    PenTool,
    Smile,
    User,
    Cpu,
    MoreVertical,
    Trash2,
    Plus,
    Terminal,
    Activity,
    Hexagon,
    Palette,
    X,
    Droplets,
    Wind,
    Sparkles,
    Layers,
    Box,
    Aperture
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    signInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyB0Fe-54kBPtVPgvQxU5T7wgRyjRzMrIY0",
    authDomain: "cheppu-ai.firebaseapp.com",
    projectId: "cheppu-ai",
    storageBucket: "cheppu-ai.firebasestorage.app",
    messagingSenderId: "877736040132",
    appId: "1:877736040132:web:9d463454a156ef5ed69b91",
    measurementId: "G-K8BC7BG0HN"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "cheppu-ai";

// --- THEME DEFINITIONS ---
const THEMES = {
    obsidian: {
        id: 'obsidian',
        name: 'Obsidian Flow',
        desc: 'Hyper-Luxury Dark. Polished volcanic glass.',
        bg: 'bg-black',
        text: 'text-gray-200',
        accent: 'text-white', // Holographic silver feel
        border: 'border-white/10',
        font: 'font-sans',
        radius: 'rounded-2xl',
        card: 'bg-white/5 backdrop-blur-3xl border border-white/5 shadow-2xl',
        button: 'bg-gradient-to-r from-gray-800 to-gray-600 text-white border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
        bubbleUser: 'bg-white/10 backdrop-blur-md border border-white/5 text-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
        bubbleAi: 'bg-black/50 backdrop-blur-xl border border-white/5 text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-gray-600',
    },
    nebula: {
        id: 'nebula',
        name: 'Nebula Glass',
        desc: 'Ethereal. Pastel galaxy & kinetic type.',
        bg: 'bg-[#1a103c]',
        text: 'text-purple-100',
        accent: 'text-pink-300',
        border: 'border-white/20',
        font: 'font-sans',
        radius: 'rounded-3xl',
        card: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        button: 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm',
        bubbleUser: 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-md border border-white/20 text-white',
        bubbleAi: 'bg-white/5 backdrop-blur-lg border border-white/10 text-pink-50',
    },
    kinetic: {
        id: 'kinetic',
        name: 'Kinetic Type',
        desc: 'High-Fashion Editorial. Stark & Massive.',
        bg: 'bg-white',
        text: 'text-black',
        accent: 'text-red-600',
        border: 'border-black',
        font: 'font-serif', // Editorial feel
        radius: 'rounded-none',
        card: 'bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]',
        button: 'bg-black text-white hover:bg-red-600 transition-colors uppercase font-bold tracking-tighter',
        bubbleUser: 'bg-black text-white text-right font-sans text-sm p-2', // Small user text
        bubbleAi: 'bg-transparent text-black text-3xl font-bold leading-tight tracking-tight', // Massive AI text
    },
    bio: {
        id: 'bio',
        name: 'Bioluminescent',
        desc: 'Organic Sci-Fi. Deep ocean neon.',
        bg: 'bg-[#000d1a]',
        text: 'text-cyan-100',
        accent: 'text-cyan-400',
        border: 'border-cyan-900/50',
        font: 'font-sans',
        radius: 'rounded-full', // Organic shapes
        card: 'bg-cyan-950/30 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]',
        button: 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]',
        bubbleUser: 'bg-cyan-600/20 border border-cyan-400/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
        bubbleAi: 'bg-blue-950/40 border border-blue-500/20 text-cyan-200',
    },
    porcelain: {
        id: 'porcelain',
        name: 'Porcelain & Gold',
        desc: 'Physical Luxury. Matte white & Gold.',
        bg: 'bg-[#f0f0f3]', // Off-white
        text: 'text-[#8a7e6b]', // Gold/Bronze
        accent: 'text-[#bfa37c]',
        border: 'border-[#d1d9e6]',
        font: 'font-sans',
        radius: 'rounded-xl',
        // Neumorphism: Light top-left shadow, dark bottom-right shadow
        card: 'bg-[#f0f0f3] shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff]',
        button: 'bg-[#f0f0f3] text-[#8a7e6b] font-bold shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] transition-all',
        // Inset chat bubbles for "pressed in" look
        bubbleUser: 'bg-[#f0f0f3] text-[#6d5e4a] font-semibold shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]',
        bubbleAi: 'bg-[#f0f0f3] text-[#8a7e6b] shadow-[-4px_-4px_8px_#ffffff,4px_4px_8px_#d1d9e6]',
    },
    prism: {
        id: 'prism',
        name: 'Prism Refraction',
        desc: 'Crystal. Split-light RGB edges.',
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        accent: 'text-indigo-500',
        border: 'border-white',
        font: 'font-sans',
        radius: 'rounded-lg',
        // Simulated chromatic aberration on borders
        card: 'bg-white/80 backdrop-blur-xl border-l-2 border-r-2 border-l-red-500/20 border-r-blue-500/20 shadow-xl',
        button: 'bg-white text-slate-900 border border-slate-200 shadow-[2px_2px_0_rgba(255,0,0,0.2),-2px_-2px_0_rgba(0,0,255,0.2)] hover:scale-105',
        bubbleUser: 'bg-slate-100 border-l-2 border-l-cyan-400 border-r-2 border-r-pink-400 text-slate-900',
        bubbleAi: 'bg-white/60 border border-white shadow-lg text-slate-600',
    },
    cybernoir: {
        id: 'cybernoir',
        name: 'Cyber-Noir',
        desc: 'Hacker Deluxe. Gritty scanlines.',
        bg: 'bg-[#0a0a0a]',
        text: 'text-amber-500',
        accent: 'text-amber-500',
        border: 'border-amber-900/50',
        font: 'font-mono',
        radius: 'rounded-sm',
        card: 'bg-black border border-amber-900/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        button: 'bg-amber-900/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500 hover:text-black uppercase tracking-widest',
        bubbleUser: 'bg-amber-950/30 border-l-2 border-amber-500 text-amber-100',
        bubbleAi: 'bg-black text-amber-600 border border-amber-900/30',
    },
    zen: {
        id: 'zen',
        name: 'Zen Garden',
        desc: 'Cognitive Tranquility. Soft pebbles.',
        bg: 'bg-[#e6e2d3]', // Sand color
        text: 'text-[#5c554b]',
        accent: 'text-[#8c857b]',
        border: 'border-[#d4cfc0]',
        font: 'font-sans',
        radius: 'rounded-[2rem]', // Pebble shapes
        card: 'bg-[#f2efe9] shadow-sm border border-[#e6e2d3]',
        button: 'bg-[#8c857b] text-[#f2efe9] hover:bg-[#5c554b] shadow-md',
        bubbleUser: 'bg-[#8c857b] text-[#f2efe9] shadow-md',
        bubbleAi: 'bg-white text-[#5c554b] shadow-sm',
    },
    invisible: {
        id: 'invisible',
        name: 'Invisible UI',
        desc: 'Spatial Future. Floating text.',
        bg: 'bg-black',
        text: 'text-white',
        accent: 'text-blue-400',
        border: 'border-white/10',
        font: 'font-sans',
        radius: 'rounded-xl',
        card: 'bg-black/40 backdrop-blur-md border border-white/10',
        button: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md',
        // Transparent bubbles
        bubbleUser: 'bg-transparent text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-l-2 border-white pl-4',
        bubbleAi: 'bg-transparent text-gray-200 font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
    },
    metal: {
        id: 'metal',
        name: 'Morphic Metal',
        desc: 'Liquid Terminator. Molten silver.',
        bg: 'bg-gray-300',
        text: 'text-gray-900',
        accent: 'text-gray-600',
        border: 'border-gray-400',
        font: 'font-sans',
        radius: 'rounded-3xl',
        // Metallic gradients
        card: 'bg-gradient-to-br from-gray-100 to-gray-400 border border-white/50 shadow-[5px_5px_15px_rgba(0,0,0,0.2)]',
        button: 'bg-gradient-to-b from-gray-200 to-gray-500 text-gray-900 border border-gray-400 shadow-inner hover:scale-105 transition-transform',
        bubbleUser: 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-lg border border-white/20',
        bubbleAi: 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 shadow-md',
    }
};

// --- BACKGROUND COMPONENT ---
const Background = ({ theme }) => {
    if (theme.id === 'obsidian') {
        return (
            <div className="fixed inset-0 z-0 bg-black">
                {/* Subtle flowing ripples */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black animate-spin-slow duration-[60s]"></div>
            </div>
        );
    }
    if (theme.id === 'nebula') {
        return (
            <div className="fixed inset-0 z-0 bg-[#1a103c] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[128px] animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-blob animation-delay-4000"></div>
            </div>
        );
    }
    if (theme.id === 'kinetic') {
        return (
            <div className="fixed inset-0 z-0 bg-white">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <h1 className="text-[20vw] font-bold leading-none tracking-tighter text-black">CHAT</h1>
                </div>
            </div>
        );
    }
    if (theme.id === 'bio') {
        return (
            <div className="fixed inset-0 z-0 bg-[#000d1a]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-[#000d1a]"></div>
                {/* Particles */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] animate-ping duration-1000"></div>
                <div className="absolute bottom-40 right-40 w-3 h-3 bg-green-400 rounded-full blur-[4px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full blur-[1px] animate-bounce"></div>
            </div>
        );
    }
    if (theme.id === 'porcelain') {
        return <div className="fixed inset-0 z-0 bg-[#f0f0f3]" />;
    }
    if (theme.id === 'prism') {
        return (
            <div className="fixed inset-0 z-0 bg-slate-50 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-pink-200/50 to-transparent blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-cyan-200/50 to-transparent blur-3xl"></div>
            </div>
        );
    }
    if (theme.id === 'cybernoir') {
        return (
            <div className="fixed inset-0 z-0 bg-[#050505]">
                {/* Scanlines */}
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)50%,rgba(0,0,0,0.2)50%,rgba(0,0,0,0.2))] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80"></div>
            </div>
        );
    }
    if (theme.id === 'zen') {
        return (
            <div className="fixed inset-0 z-0 bg-[#e6e2d3]">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]"></div>
            </div>
        );
    }
    if (theme.id === 'invisible') {
        return (
            <div className="fixed inset-0 z-0 bg-black">
                {/* Abstract 3D shape or globe placeholder */}
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>
        );
    }
    if (theme.id === 'metal') {
        return (
            <div className="fixed inset-0 z-0 bg-gray-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-400 to-gray-200 opacity-50"></div>
            </div>
        );
    }
    return <div className={`fixed inset-0 z-0 ${theme.bg}`} />;
};

// --- Mock AI Logic ---
const generateResponse = async (text, mode) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (mode === 'image') {
                resolve({
                    type: 'image',
                    content: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(text)}`,
                    alt: text
                });
            } else {
                let responseText = "SYSTEM: Processing data packet...";
                if (text.toLowerCase().includes('joke')) responseText = "Why do Java developers wear glasses? Because they don't C#.";
                else if (text.toLowerCase().includes('build')) responseText = "PROJECT INITIALIZED:\n> Frontend: React + Tailwind\n> Backend: Node.js + Firebase\n> Protocol: Secure";
                else if (text.toLowerCase().includes('hello')) responseText = "GREETINGS. I am Nexus-7. Ready for input.";

                resolve({
                    type: 'text',
                    content: responseText
                });
            }
        }, 2000);
    });
};

export default function App() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activeThemeId, setActiveThemeId] = useState('obsidian'); // Default to Obsidian
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [mode, setMode] = useState('chat');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString());
    const scrollRef = useRef(null);
    const theme = THEMES[activeThemeId];

    // --- Auth & Data Effects ---
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log("Starting auth initialization...");
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    console.log("Using custom token");
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    console.log("Signing in anonymously");
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
            } finally {
                setLoadingAuth(false);
            }
        };
        initAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user ? "User logged in" : "No user");
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, 'artifacts', appId, 'users', user.uid, 'chats'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (error) => {
            console.error("Data fetch error:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // --- Handlers ---
    const handleLogin = async () => {
        setLoadingAuth(true);
        setTimeout(async () => {
            if (!auth.currentUser) await signInAnonymously(auth);
            setLoadingAuth(false);
        }, 800);
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    const handleNewChat = () => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setInput('');
        setMode('chat');
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleHistoryClick = (sessionId) => {
        if (sessionId) {
            setCurrentSessionId(sessionId);
            if (window.innerWidth < 768) setSidebarOpen(false);
        }
    };

    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setInput('');
        setIsTyping(true);

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), {
            role: 'user',
            content: textToSend,
            type: 'text',
            sessionId: currentSessionId,
            createdAt: serverTimestamp()
        });

        const response = await generateResponse(textToSend, mode);

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), {
            role: 'ai',
            content: response.content,
            type: response.type,
            sessionId: currentSessionId,
            createdAt: serverTimestamp()
        });

        setIsTyping(false);
    };

    const clearHistory = async () => {
        if (!user || !window.confirm("PURGE DATA?")) return;
        messages.forEach(async (msg) => {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'chats', msg.id));
        });
    };

    const currentSessionMessages = messages.filter(m => m.sessionId === currentSessionId);

    // --- Render Components ---

    if (loadingAuth) {
        return (
            <div className={`h-screen w-full flex items-center justify-center ${theme.bg} ${theme.text} ${theme.font}`}>
                <div className="flex flex-col items-center gap-4">
                    <Activity className="animate-spin" size={48} />
                    <div className="text-xl tracking-widest animate-pulse">INITIALIZING...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} theme={theme} />;
    }

    return (
        <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font}`}>
            {/* --- Dynamic Background --- */}
            <Background theme={theme} />

            {/* --- Global Theme Styles & Keyframes --- */}
            <style>{`
        .glitch-text:hover {
          text-shadow: 2px 0 #ff0000, -2px 0 #00ffff;
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob 7s infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        /* Kinetic Type specific */
        .kinetic-reveal {
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Zen Garden Ripple */
        .zen-drop {
          animation: dropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes dropIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Custom Scrollbar based on theme */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(125,125,125,0.3); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(125,125,125,0.5); }
      `}</style>

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} md:relative fixed z-30 h-full transition-all duration-300 ease-in-out flex flex-col border-r ${theme.border} ${theme.card} backdrop-blur-md`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-10 h-10 border flex items-center justify-center ${theme.border} ${theme.radius} opacity-80`}>
                            {theme.id === 'bio' ? <Droplets size={20} /> : <Terminal size={20} />}
                        </div>
                        <span className={`text-xl font-bold tracking-widest ${theme.id === 'cybernoir' ? 'glitch-text' : ''} ${!sidebarOpen ? 'hidden' : ''}`}>
                            NEXUS_OS
                        </span>
                    </div>

                    <button
                        onClick={handleNewChat}
                        className={`w-full py-4 px-4 flex items-center justify-center gap-3 transition-all duration-200 group border ${theme.border} ${theme.button} mb-6 ${theme.radius}`}
                    >
                        <Plus size={18} />
                        <span className={`text-sm font-bold uppercase tracking-widest ${!sidebarOpen ? 'hidden' : ''}`}>New Session</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 pl-2 opacity-50 ${!sidebarOpen && 'hidden'}`}>Logs</div>
                    {messages.length > 0 ? (
                        messages.filter(m => m.role === 'user').slice(-10).reverse().map((msg, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleHistoryClick(msg.sessionId)}
                                className={`w-full text-left p-3 text-xs transition-all duration-200 truncate flex items-center gap-3 border-l-2 ${theme.radius}
                  ${msg.sessionId === currentSessionId
                                        ? `border-current bg-white/10 ${theme.accent}`
                                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
                                    }`}
                            >
                                <div className="opacity-50 text-[10px]">{'>'}</div>
                                <span className="truncate">{msg.content}</span>
                            </button>
                        ))
                    ) : (
                        <div className="text-xs opacity-30 text-center py-4">NO_DATA</div>
                    )}
                </div>

                <div className={`p-4 border-t ${theme.border} space-y-2 bg-black/5`}>
                    <button onClick={clearHistory} className={`w-full flex items-center gap-3 p-3 text-xs uppercase tracking-widest transition-colors opacity-70 hover:opacity-100`}>
                        <Trash2 size={16} />
                        <span className={!sidebarOpen ? 'hidden' : ''}>Purge Logs</span>
                    </button>

                    <div className={`flex items-center gap-3 p-3 border ${theme.border} bg-white/5 ${theme.radius}`}>
                        <div className={`w-8 h-8 border ${theme.border} flex items-center justify-center opacity-70 rounded-full`}>
                            <User size={14} />
                        </div>
                        <div className={`flex-1 min-w-0 ${!sidebarOpen && 'hidden'}`}>
                            <div className="text-xs font-bold">OPERATOR</div>
                            <div className="text-[10px] opacity-50">LEVEL 1 ACCESS</div>
                        </div>
                        <button onClick={handleSignOut} className="opacity-60 hover:opacity-100 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10 h-full bg-transparent">
                {/* Top Bar */}
                <header className={`h-20 flex items-center justify-between px-8 border-b ${theme.border} ${theme.card}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden opacity-70 hover:opacity-100">
                            <MoreVertical size={24} />
                        </button>

                        {/* Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('chat')}
                                className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${theme.radius} ${mode === 'chat'
                                    ? `${theme.button}`
                                    : `bg-transparent border-transparent opacity-50 hover:opacity-100 hover:border-current`
                                    }`}
                            >
                                <MessageSquare size={14} />
                                TEXT
                            </button>
                            <button
                                onClick={() => setMode('image')}
                                className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${theme.radius} ${mode === 'image'
                                    ? `${theme.button}`
                                    : `bg-transparent border-transparent opacity-50 hover:opacity-100 hover:border-current`
                                    }`}
                            >
                                <ImageIcon size={14} />
                                VISUAL
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 opacity-50 text-[10px] uppercase tracking-widest hidden md:flex">
                            <div className={`w-2 h-2 ${theme.id === 'cybernoir' ? 'bg-amber-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                            System Online
                        </div>

                        {/* THEME SWITCHER ICON */}
                        <button
                            onClick={() => setShowThemeModal(true)}
                            className={`p-2 rounded-lg transition-all hover:bg-white/10 ${theme.accent}`}
                        >
                            <Palette size={20} />
                        </button>
                    </div>
                </header>

                {/* Theme Selection Modal */}
                {showThemeModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                        <div className={`w-full max-w-5xl max-h-[80vh] overflow-y-auto ${theme.card} ${theme.radius} p-8 border ${theme.border} shadow-2xl`}>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold uppercase tracking-widest">Select Theme Protocol</h2>
                                <button onClick={() => setShowThemeModal(false)} className="hover:opacity-70"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.values(THEMES).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setActiveThemeId(t.id);
                                        }}
                                        className={`text-left p-6 border transition-all duration-300 relative group overflow-hidden ${t.radius} ${activeThemeId === t.id
                                            ? `border-current ${theme.accent} bg-white/10`
                                            : 'border-white/10 hover:border-white/30 bg-black/20 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {/* Mini Preview of theme BG */}
                                        <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none ${t.bg}`}></div>

                                        <div className="relative z-10">
                                            <div className={`font-bold text-lg mb-1 ${t.id === 'cybernoir' ? 'font-mono' : t.font}`}>{t.name}</div>
                                            <div className="text-xs opacity-60 leading-relaxed">{t.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <button onClick={() => setShowThemeModal(false)} className={`px-10 py-4 ${theme.button} ${theme.radius}`}>
                                    CONFIRM SELECTION
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-0">
                    <div className="max-w-4xl mx-auto py-10">

                        {currentSessionMessages.length === 0 ? (
                            <EmptyState
                                onAction={handleSend}
                                mode={mode}
                                theme={theme}
                            />
                        ) : (
                            <div className="space-y-8 px-4">
                                {currentSessionMessages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} theme={theme} />
                                ))}

                                {isTyping && (
                                    <div className={`flex items-start gap-4 ${theme.id === 'zen' ? 'zen-drop' : 'kinetic-reveal'}`}>
                                        <div className={`w-8 h-8 border flex items-center justify-center shrink-0 ${theme.border} ${theme.card} ${theme.radius}`}>
                                            <Activity size={16} className="animate-pulse" />
                                        </div>
                                        <div className={`p-4 border ${theme.border} ${theme.card} text-xs uppercase tracking-widest ${theme.radius}`}>
                                            {mode === 'image' ? 'RENDERING_VISUAL...' : 'COMPUTING_RESPONSE...'}
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 relative z-20">
                    <div className="max-w-4xl mx-auto">
                        <div className={`relative p-1 transition-all duration-300 border-2 focus-within:shadow-lg ${theme.border} ${theme.card} ${theme.radius}`}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={mode === 'image' ? "ENTER_VISUAL_PARAMETERS..." : "ENTER_COMMAND..."}
                                className={`w-full bg-transparent p-4 max-h-32 min-h-[60px] resize-none outline-none ${theme.text} placeholder-current/30 font-mono text-sm`}
                                rows={1}
                            />
                            <div className="absolute bottom-3 right-3">
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                    className={`p-2 transition-all duration-200 ${theme.radius} ${input.trim()
                                        ? `${theme.button}`
                                        : 'opacity-50 cursor-not-allowed bg-white/5'
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-3 text-[10px] opacity-40 uppercase tracking-[0.2em]">
                            Nexus_OS v1.0 // Prototype
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Sub-Components ---

function LoginPage({ onLogin, theme }) {
    return (
        <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${theme.bg} ${theme.text} ${theme.font}`}>
            <Background theme={theme} />

            <div className={`relative z-10 w-full max-w-md p-10 border ${theme.border} ${theme.card} shadow-2xl ${theme.radius}`}>
                <div className="text-center mb-10">
                    <div className={`w-20 h-20 mx-auto border-2 flex items-center justify-center mb-6 relative ${theme.border}`}>
                        <Hexagon size={40} />
                    </div>
                    <h1 className={`text-4xl font-bold mb-2 tracking-tighter ${theme.id === 'cybernoir' ? 'glitch-text' : ''}`}>AUTHENTICATE</h1>
                    <p className="opacity-50 text-xs uppercase tracking-[0.3em]">Secure Terminal Access</p>
                </div>

                <button
                    onClick={onLogin}
                    className={`w-full py-5 px-6 font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 group ${theme.button} ${theme.radius}`}
                >
                    <span className="group-hover:animate-pulse">Initialize Session</span>
                </button>
            </div>
        </div>
    );
}

function EmptyState({ onAction, mode, theme }) {
    const suggestions = mode === 'chat'
        ? [
            { label: "INIT_PROJECT", icon: Zap, prompt: "Help me build a React project structure" },
            { label: "GENERATE_NARRATIVE", icon: PenTool, prompt: "Write a short sci-fi story" },
            { label: "DECRYPT_HUMOR", icon: Smile, prompt: "Tell me a funny programmer joke" },
        ]
        : [
            { label: "RENDER_CITY", icon: ImageIcon, prompt: "A futuristic cyberpunk city with neon lights, realistic, 4k" },
            { label: "RENDER_LANDSCAPE", icon: ImageIcon, prompt: "A serene lake at sunset with mountains in background, oil painting style" },
        ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
            <div className={`w-24 h-24 mb-8 flex items-center justify-center border ${theme.border} ${theme.card} relative ${theme.radius}`}>
                <Cpu size={48} className="animate-pulse" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">
                NEXUS<span className="opacity-50">_7</span>
            </h2>
            <p className="text-sm md:text-base mb-10 max-w-md opacity-60 uppercase tracking-widest">
                {mode === 'chat' ? 'Awaiting command input...' : 'Awaiting visual parameters...'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {suggestions.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAction(item.prompt)}
                        className={`px-4 py-4 border hover:border-current ${theme.border} ${theme.card} opacity-70 hover:opacity-100 transition-all duration-300 group flex flex-col items-center gap-3 ${theme.radius}`}
                    >
                        <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function MessageBubble({ message, theme }) {
    const isAI = message.role === 'ai';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = message.content;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => setCopied(true));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch (err) {
                console.error('Fallback error', err);
            }
            document.body.removeChild(textArea);
        }
        setTimeout(() => setCopied(false), 2000);
    };

    // Specific animation class based on theme
    const animClass = theme.id === 'zen' ? 'zen-drop' : 'kinetic-reveal';

    return (
        <div className={`group flex gap-6 ${isAI ? 'items-start' : 'items-start flex-row-reverse'} ${animClass}`}>
            {/* Avatar (Hidden for Kinetic/Invisible to match vibe) */}
            {theme.id !== 'kinetic' && theme.id !== 'invisible' && (
                <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${theme.radius} ${isAI
                    ? `border-current ${theme.accent} ${theme.card}`
                    : `border-white/20 bg-white/5`
                    }`}>
                    {isAI ? <Cpu size={20} /> : <User size={20} />}
                </div>
            )}

            {/* Bubble Content */}
            <div className={`relative max-w-[85%] p-6 ${theme.radius} ${isAI
                ? theme.bubbleAi
                : theme.bubbleUser
                }`}>

                {message.type === 'image' ? (
                    <div className="space-y-2">
                        <div className={`relative border ${theme.border} overflow-hidden bg-black`}>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-10 pointer-events-none"></div>
                            <img
                                src={message.content}
                                alt="AI Generated"
                                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/000000/FF0000?text=DATA_CORRUPTED";
                                }}
                            />
                        </div>
                        <p className="text-[10px] opacity-70 uppercase tracking-widest">{'>>'} Render Complete</p>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </div>
                )}

                {isAI && message.type === 'text' && (
                    <button
                        onClick={handleCopy}
                        className="absolute -bottom-8 right-0 opacity-60 hover:opacity-100 text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                        {copied ? 'COPIED' : 'COPY_DATA'} <Copy size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}
