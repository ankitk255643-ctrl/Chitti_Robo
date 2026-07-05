import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Loader2, 
  Globe, 
  Command, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Volume2,
  Cpu
} from 'lucide-react';

interface VoiceCommandProps {
  onBack: () => void;
}

// Full background mappings (hidden from UI, processed in backend runtime)
const CATEGORIZED_LINKS: Record<string, string[]> = {
  "Student": [
    "https://chatgpt.com",
    "https://gemini.google.com",
    "https://claude.ai",
    "https://notebooklm.google.com",
    "https://www.khanacademy.org",
    "https://www.coursera.org",
    "https://www.udemy.com",
    "https://www.edx.org",
    "https://www.futurelearn.com",
    "https://www.codecademy.com",
    "https://www.geeksforgeeks.org",
    "https://www.w3schools.com",
    "https://www.tutorialspoint.com",
    "https://www.javatpoint.com",
    "https://www.toppr.com",
    "https://byjus.com",
    "https://nptel.ac.in",
    "https://swayam.gov.in",
    "https://ocw.mit.edu",
    "https://www.duolingo.com"
  ],
  "Developer": [
    "https://github.com",
    "https://gitlab.com",
    "https://bitbucket.org",
    "https://stackoverflow.com",
    "https://developer.mozilla.org",
    "https://codepen.io",
    "https://codesandbox.io",
    "https://replit.com",
    "https://vercel.com",
    "https://netlify.com",
    "https://firebase.google.com",
    "https://supabase.com",
    "https://railway.app",
    "https://render.com",
    "https://cloudflare.com",
    "https://openrouter.ai",
    "https://platform.openai.com",
    "https://ai.google.dev",
    "https://huggingface.co",
    "https://ollama.com"
  ],
  "AI": [
    "https://chatgpt.com",
    "https://claude.ai",
    "https://gemini.google.com",
    "https://grok.com",
    "https://perplexity.ai",
    "https://poe.com",
    "https://huggingface.co",
    "https://replicate.com",
    "https://fal.ai",
    "https://stability.ai",
    "https://runwayml.com",
    "https://elevenlabs.io",
    "https://leonardo.ai",
    "https://midjourney.com",
    "https://openrouter.ai",
    "https://deepseek.com",
    "https://mistral.ai",
    "https://together.ai",
    "https://groq.com",
    "https://anthropic.com"
  ],
  "Design": [
    "https://www.canva.com",
    "https://www.figma.com",
    "https://www.adobe.com",
    "https://pixlr.com",
    "https://www.photopea.com",
    "https://www.remove.bg",
    "https://icons8.com",
    "https://www.flaticon.com",
    "https://www.freepik.com",
    "https://undraw.co",
    "https://storyset.com",
    "https://coolors.co",
    "https://colorhunt.co",
    "https://fonts.google.com",
    "https://dribbble.com"
  ],
  "VideoEditing": [
    "https://www.capcut.com",
    "https://clipchamp.com",
    "https://www.descript.com",
    "https://www.veed.io",
    "https://www.kapwing.com",
    "https://runwayml.com",
    "https://www.invideo.io",
    "https://pictory.ai",
    "https://www.flexclip.com",
    "https://www.animaker.com"
  ],
  "SocialMedia": [
    "https://youtube.com",
    "https://facebook.com",
    "https://instagram.com",
    "https://x.com",
    "https://linkedin.com",
    "https://reddit.com",
    "https://discord.com",
    "https://telegram.org",
    "https://whatsapp.com",
    "https://snapchat.com",
    "https://threads.net",
    "https://pinterest.com",
    "https://tiktok.com",
    "https://quora.com",
    "https://medium.com"
  ],
  "Entertainment": [
    "https://youtube.com",
    "https://netflix.com",
    "https://primevideo.com",
    "https://disneyplus.com",
    "https://spotify.com",
    "https://jiosaavn.com",
    "https://wynk.in",
    "https://gaana.com",
    "https://hotstar.com",
    "https://zee5.com",
    "https://sonyliv.com",
    "https://twitch.tv",
    "https://crunchyroll.com",
    "https://vimeo.com",
    "https://soundcloud.com"
  ],
  "News": [
    "https://news.google.com",
    "https://bbc.com",
    "https://cnn.com",
    "https://reuters.com",
    "https://apnews.com",
    "https://thehindu.com",
    "https://indianexpress.com",
    "https://hindustantimes.com",
    "https://timesofindia.indiatimes.com",
    "https://ndtv.com",
    "https://livemint.com",
    "https://economictimes.indiatimes.com",
    "https://cnbc.com",
    "https://techcrunch.com",
    "https://theverge.com"
  ],
  "Research": [
    "https://scholar.google.com",
    "https://arxiv.org",
    "https://pubmed.ncbi.nlm.nih.gov",
    "https://researchgate.net",
    "https://semanticscholar.org",
    "https://ieeexplore.ieee.org",
    "https://acm.org",
    "https://springer.com",
    "https://nature.com",
    "https://sciencedirect.com",
    "https://jstor.org",
    "https://osf.io",
    "https://zenodo.org",
    "https://figshare.com",
    "https://paperswithcode.com"
  ],
  "Shopping": [
    "https://amazon.in",
    "https://flipkart.com",
    "https://myntra.com",
    "https://ajio.com",
    "https://meesho.com",
    "https://nykaa.com",
    "https://jiomart.com",
    "https://croma.com",
    "https://reliancedigital.in",
    "https://snapdeal.com"
  ],
  "Cloud": [
    "https://aws.amazon.com",
    "https://cloud.google.com",
    "https://azure.microsoft.com",
    "https://oracle.com/cloud",
    "https://digitalocean.com",
    "https://linode.com",
    "https://vultr.com",
    "https://heroku.com",
    "https://fly.io",
    "https://cloudflare.com"
  ],
  "Productivity": [
    "https://drive.google.com",
    "https://docs.google.com",
    "https://notion.so",
    "https://trello.com",
    "https://clickup.com",
    "https://slack.com",
    "https://zoom.us",
    "https://meet.google.com",
    "https://calendar.google.com",
    "https://onedrive.live.com"
  ]
};

const VOICE_FRIENDLY_MAP: Record<string, string> = {
  "chatgpt": "https://chatgpt.com",
  "chat gpt": "https://chatgpt.com",
  "gemini": "https://gemini.google.com",
  "claude": "https://claude.ai",
  "notebooklm": "https://notebooklm.google.com",
  "notebook lm": "https://notebooklm.google.com",
  "khan academy": "https://www.khanacademy.org",
  "khanacademy": "https://www.khanacademy.org",
  "coursera": "https://www.coursera.org",
  "udemy": "https://www.udemy.com",
  "edx": "https://www.edx.org",
  "futurelearn": "https://www.futurelearn.com",
  "future learn": "https://www.futurelearn.com",
  "codecademy": "https://www.codecademy.com",
  "code academy": "https://www.codecademy.com",
  "geeksforgeeks": "https://www.geeksforgeeks.org",
  "geeks for geeks": "https://www.geeksforgeeks.org",
  "w3schools": "https://www.w3schools.com",
  "w3 schools": "https://www.w3schools.com",
  "tutorialspoint": "https://www.tutorialspoint.com",
  "tutorials point": "https://www.tutorialspoint.com",
  "javatpoint": "https://www.javatpoint.com",
  "java t point": "https://www.javatpoint.com",
  "toppr": "https://www.toppr.com",
  "byjus": "https://byjus.com",
  "byju's": "https://byjus.com",
  "nptel": "https://nptel.ac.in",
  "swayam": "https://swayam.gov.in",
  "mit": "https://ocw.mit.edu",
  "mit courseware": "https://ocw.mit.edu",
  "duolingo": "https://www.duolingo.com",
  "github": "https://github.com",
  "git hub": "https://github.com",
  "gitlab": "https://gitlab.com",
  "git lab": "https://gitlab.com",
  "bitbucket": "https://bitbucket.org",
  "bit bucket": "https://bitbucket.org",
  "stackoverflow": "https://stackoverflow.com",
  "stack overflow": "https://stackoverflow.com",
  "developer mozilla": "https://developer.mozilla.org",
  "mdn": "https://developer.mozilla.org",
  "codepen": "https://codepen.io",
  "code pen": "https://codepen.io",
  "codesandbox": "https://codesandbox.io",
  "code sandbox": "https://codesandbox.io",
  "replit": "https://replit.com",
  "repl": "https://replit.com",
  "vercel": "https://vercel.com",
  "netlify": "https://netlify.com",
  "firebase": "https://firebase.google.com",
  "supabase": "https://supabase.com",
  "railway": "https://railway.app",
  "render": "https://render.com",
  "cloudflare": "https://cloudflare.com",
  "cloud flare": "https://cloudflare.com",
  "openrouter": "https://openrouter.ai",
  "open router": "https://openrouter.ai",
  "openai": "https://platform.openai.com",
  "open ai": "https://platform.openai.com",
  "google dev": "https://ai.google.dev",
  "huggingface": "https://huggingface.co",
  "hugging face": "https://huggingface.co",
  "ollama": "https://ollama.com",
  "grok": "https://grok.com",
  "perplexity": "https://perplexity.ai",
  "poe": "https://poe.com",
  "replicate": "https://replicate.com",
  "fal": "https://fal.ai",
  "stability": "https://stability.ai",
  "runwayml": "https://runwayml.com",
  "runway": "https://runwayml.com",
  "elevenlabs": "https://elevenlabs.io",
  "eleven labs": "https://elevenlabs.io",
  "leonardo": "https://leonardo.ai",
  "midjourney": "https://midjourney.com",
  "mid journey": "https://midjourney.com",
  "deepseek": "https://deepseek.com",
  "deep seek": "https://deepseek.com",
  "mistral": "https://mistral.ai",
  "together": "https://together.ai",
  "groq": "https://groq.com",
  "anthropic": "https://anthropic.com",
  "canva": "https://www.canva.com",
  "figma": "https://www.figma.com",
  "adobe": "https://www.adobe.com",
  "pixlr": "https://pixlr.com",
  "photopea": "https://www.photopea.com",
  "photo pea": "https://www.photopea.com",
  "remove bg": "https://www.remove.bg",
  "removebg": "https://www.remove.bg",
  "icons8": "https://icons8.com",
  "icons 8": "https://icons8.com",
  "flaticon": "https://www.flaticon.com",
  "flat icon": "https://www.flaticon.com",
  "freepik": "https://www.freepik.com",
  "free pik": "https://www.freepik.com",
  "undraw": "https://undraw.co",
  "storyset": "https://storyset.com",
  "coolors": "https://coolors.co",
  "colorhunt": "https://colorhunt.co",
  "google fonts": "https://fonts.google.com",
  "google font": "https://fonts.google.com",
  "dribbble": "https://dribbble.com",
  "dribble": "https://dribbble.com",
  "capcut": "https://www.capcut.com",
  "cap cut": "https://www.capcut.com",
  "clipchamp": "https://clipchamp.com",
  "clip champ": "https://clipchamp.com",
  "descript": "https://www.descript.com",
  "veed": "https://www.veed.io",
  "kapwing": "https://www.kapwing.com",
  "invideo": "https://www.invideo.io",
  "in video": "https://www.invideo.io",
  "pictory": "https://pictory.ai",
  "flexclip": "https://www.flexclip.com",
  "flex clip": "https://www.flexclip.com",
  "animaker": "https://www.animaker.com",
  "youtube": "https://youtube.com",
  "you tube": "https://youtube.com",
  "facebook": "https://facebook.com",
  "face book": "https://facebook.com",
  "instagram": "https://instagram.com",
  "x": "https://x.com",
  "twitter": "https://x.com",
  "linkedin": "https://linkedin.com",
  "linked in": "https://linkedin.com",
  "reddit": "https://reddit.com",
  "discord": "https://discord.com",
  "telegram": "https://telegram.org",
  "whatsapp": "https://whatsapp.com",
  "whats app": "https://whatsapp.com",
  "snapchat": "https://snapchat.com",
  "snap chat": "https://snapchat.com",
  "threads": "https://threads.net",
  "pinterest": "https://pinterest.com",
  "tiktok": "https://tiktok.com",
  "tik tok": "https://tiktok.com",
  "quora": "https://quora.com",
  "medium": "https://medium.com",
  "netflix": "https://netflix.com",
  "prime video": "https://primevideo.com",
  "primevideo": "https://primevideo.com",
  "amazon prime": "https://primevideo.com",
  "disney plus": "https://disneyplus.com",
  "disneyplus": "https://disneyplus.com",
  "spotify": "https://spotify.com",
  "jiosaavn": "https://jiosaavn.com",
  "jio saavn": "https://jiosaavn.com",
  "wynk": "https://wynk.in",
  "gaana": "https://gaana.com",
  "hotstar": "https://hotstar.com",
  "zee5": "https://zee5.com",
  "zee 5": "https://zee5.com",
  "sonyliv": "https://sonyliv.com",
  "sony liv": "https://sonyliv.com",
  "twitch": "https://twitch.tv",
  "crunchyroll": "https://crunchyroll.com",
  "crunchy roll": "https://crunchyroll.com",
  "vimeo": "https://vimeo.com",
  "soundcloud": "https://soundcloud.com",
  "sound cloud": "https://soundcloud.com",
  "google news": "https://news.google.com",
  "bbc": "https://bbc.com",
  "cnn": "https://cnn.com",
  "reuters": "https://reuters.com",
  "ap news": "https://apnews.com",
  "associated press": "https://apnews.com",
  "the hindu": "https://thehindu.com",
  "indian express": "https://indianexpress.com",
  "hindustan times": "https://hindustantimes.com",
  "times of india": "https://timesofindia.indiatimes.com",
  "ndtv": "https://ndtv.com",
  "livemint": "https://livemint.com",
  "live mint": "https://livemint.com",
  "economictimes": "https://economictimes.indiatimes.com",
  "economic times": "https://economictimes.indiatimes.com",
  "cnbc": "https://cnbc.com",
  "techcrunch": "https://techcrunch.com",
  "tech crunch": "https://techcrunch.com",
  "the verge": "https://theverge.com",
  "scholar": "https://scholar.google.com",
  "google scholar": "https://scholar.google.com",
  "arxiv": "https://arxiv.org",
  "pubmed": "https://pubmed.ncbi.nlm.nih.gov",
  "researchgate": "https://researchgate.net",
  "research gate": "https://researchgate.net",
  "semanticscholar": "https://semanticscholar.org",
  "semantic scholar": "https://semanticscholar.org",
  "ieee": "https://ieeexplore.ieee.org",
  "acm": "https://acm.org",
  "springer": "https://springer.com",
  "nature": "https://nature.com",
  "sciencedirect": "https://sciencedirect.com",
  "science direct": "https://sciencedirect.com",
  "jstor": "https://jstor.org",
  "osf": "https://osf.io",
  "zenodo": "https://zenodo.org",
  "figshare": "https://figshare.com",
  "paperswithcode": "https://paperswithcode.com",
  "papers with code": "https://paperswithcode.com",
  "amazon": "https://amazon.in",
  "flipkart": "https://flipkart.com",
  "myntra": "https://myntra.com",
  "ajio": "https://ajio.com",
  "meesho": "https://meesho.com",
  "nykaa": "https://nykaa.com",
  "jiomart": "https://jiomart.com",
  "jio mart": "https://jiomart.com",
  "croma": "https://croma.com",
  "reliance digital": "https://reliancedigital.in",
  "snapdeal": "https://snapdeal.com",
  "aws": "https://aws.amazon.com",
  "google cloud": "https://cloud.google.com",
  "azure": "https://azure.microsoft.com",
  "oracle cloud": "https://oracle.com/cloud",
  "digitalocean": "https://digitalocean.com",
  "digital ocean": "https://digitalocean.com",
  "linode": "https://linode.com",
  "vultr": "https://vultr.com",
  "heroku": "https://heroku.com",
  "fly.io": "https://fly.io",
  "drive": "https://drive.google.com",
  "google drive": "https://drive.google.com",
  "docs": "https://docs.google.com",
  "google docs": "https://docs.google.com",
  "notion": "https://notion.so",
  "trello": "https://trello.com",
  "clickup": "https://clickup.com",
  "click up": "https://clickup.com",
  "slack": "https://slack.com",
  "zoom": "https://zoom.us",
  "meet": "https://meet.google.com",
  "google meet": "https://meet.google.com",
  "calendar": "https://calendar.google.com",
  "google calendar": "https://calendar.google.com",
  "onedrive": "https://onedrive.live.com",
  "one drive": "https://onedrive.live.com"
};

export default function VoiceCommand({ onBack }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Click the center core to speak commands');
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatus('Listening carefully...');
        setTranscript('');
        transcriptRef.current = '';
      };

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        transcriptRef.current = result;
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setStatus('Could not pick up audio. Click core and try again.');
        setProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        const finalTranscript = transcriptRef.current;
        if (finalTranscript) {
          processCommand(finalTranscript);
        } else {
          setStatus('Standing by for voice inputs');
        }
      };
    } else {
      setStatus('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setProcessing(false);
      recognitionRef.current?.start();
    }
  };

  const processCommand = async (text: string) => {
    setProcessing(true);
    setStatus(`Analyzing intent: "${text}"`);
    
    // Normalize spoken command
    let command = text.toLowerCase().trim().replace(/[.,!?]$/, '');
    
    // Match common prefixes: "open [name]", "go to [name]", "visit [name]"
    const prefixMatch = command.match(/^(?:open|go to|visit)\s+(.+)$/i);
    let target = prefixMatch ? prefixMatch[1].trim() : command;

    // 1. Check direct local app commands
    const appMap: Record<string, string> = {
      'calculator': 'calc',
      'notepad': 'notepad',
      'vs code': 'code',
      'visual studio code': 'code',
      'paint': 'mspaint',
      'ms paint': 'mspaint',
      'ms word': 'winword',
      'word': 'winword',
      'excel': 'excel',
      'ms excel': 'excel',
      'powerpoint': 'powerpnt',
      'ms powerpoint': 'powerpnt',
      'chrome': 'chrome',
      'google chrome': 'chrome',
      'file explorer': 'explorer',
      'explorer': 'explorer',
      'camera': 'microsoft.windows.camera:',
      'antigravity': 'antigravity',
      'codex': 'codex'
    };

    if (appMap[target]) {
      const execTarget = appMap[target];
      setStatus(`Opening application: ${target}`);
      try {
        const res = await fetch('/api/open-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: execTarget })
        });
        const data = await res.json();
        if (data.success) {
          setStatus(`Successfully opened ${target}!`);
        } else {
          setStatus(`Failed to open ${target}.`);
        }
      } catch (error) {
        setStatus('Error connecting to backend.');
      }
      setProcessing(false);
      return;
    }

    // 2. Check Category Command Match (e.g. "Open Student Category" or "Student")
    // Clean target for match
    const categoryKey = Object.keys(CATEGORIZED_LINKS).find(key => {
      const cleanedKey = key.toLowerCase();
      return target === cleanedKey || 
             target === `${cleanedKey} websites` || 
             target === `${cleanedKey} links` || 
             target === `${cleanedKey} category` ||
             target === `${cleanedKey} sites`;
    });

    if (categoryKey) {
      const links = CATEGORIZED_LINKS[categoryKey];
      setStatus(`Spawning all ${links.length} links in "${categoryKey}" division...`);
      // Open all tabs safely (browser will prompt or open)
      links.forEach(url => window.open(url, '_blank'));
      setTimeout(() => setStatus(`Opened all ${categoryKey} category tabs successfully!`), 1200);
      setProcessing(false);
      return;
    }

    // 3. Check Friendly Website Match
    const matchedUrl = VOICE_FRIENDLY_MAP[target];
    if (matchedUrl) {
      setStatus(`Launching website: ${target}`);
      window.open(matchedUrl, '_blank');
      setTimeout(() => setStatus(`Successfully launched ${target}!`), 1000);
      setProcessing(false);
      return;
    }

    // 4. Try Direct Domain Match fallback
    setStatus(`Launching website: ${target}`);
    let fallbackUrl = target;
    if (!fallbackUrl.includes('.')) {
      fallbackUrl = `${fallbackUrl}.com`;
    }
    if (!fallbackUrl.startsWith('http')) {
      fallbackUrl = `https://${fallbackUrl}`;
    }
    fallbackUrl = fallbackUrl.replace(/\s+/g, '');
    window.open(fallbackUrl, '_blank');
    setTimeout(() => setStatus('Website launched successfully!'), 1000);
    setProcessing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030612] text-white relative overflow-hidden font-sans">
      
      {/* Immersive background orbs to match Chitti Robo AI theme */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-orb-slow-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-orb-slow-2" />

      {/* Header */}
      <header className="p-6 border-b border-purple-500/15 flex items-center justify-between bg-[#070b19]/80 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-white/5 border border-transparent hover:border-purple-500/20 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-purple-300" />
          </button>
          <div>
            <h2 className="text-xl font-bold font-display flex items-center gap-2 tracking-tight text-white">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" /> Command Core
            </h2>
            <p className="text-xs text-slate-400">Control browser links and apps with your voice (Chitti Robo Protocol)</p>
          </div>
        </div>
      </header>

      {/* Centered, highly polished atmospheric single mic view */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto w-full">
        
        <div className="w-full max-w-2xl bg-[#070b19]/60 border border-purple-500/15 rounded-3xl p-8 md:p-12 backdrop-blur-md relative overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center gap-8 min-h-[480px]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.03] to-cyan-500/[0.03] pointer-events-none" />
          
          <div className="space-y-4 max-w-md mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1 rounded-full">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              Chitti Voice Protocol Active
            </span>
            
            <h3 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight leading-tight min-h-[48px] px-2 flex items-center justify-center">
              {transcript ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                  "{transcript}"
                </span>
              ) : (
                "Say a website or category name"
              )}
            </h3>

            <p className="text-sm tracking-tight text-purple-300 font-mono font-medium max-w-sm mx-auto min-h-[40px] flex items-center justify-center leading-relaxed">
              {status}
            </p>
          </div>

          {/* Epic Glowing Sound-wave ripple / Voice Core Button */}
          <div className="relative flex items-center justify-center w-48 h-48 my-2">
            
            {/* Animated outer rings during listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 blur-md animate-ping" />
                <div className="absolute -inset-4 rounded-full border border-purple-500/30 opacity-40 animate-pulse" />
                <div className="absolute -inset-8 rounded-full border border-cyan-500/20 opacity-30 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="absolute -inset-12 rounded-full border border-purple-500/10 opacity-10 animate-pulse" style={{ animationDelay: '0.8s' }} />
              </>
            )}

            <button
              onClick={toggleListening}
              disabled={processing}
              className={`relative z-20 flex items-center justify-center w-36 h-36 rounded-full transition-all duration-500 cursor-pointer ${
                isListening 
                  ? 'bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-[0_0_60px_rgba(168,85,247,0.5)] scale-105' 
                  : 'bg-[#030612] hover:bg-purple-950/20 border-2 border-purple-500/25 hover:border-cyan-400/40 shadow-inner'
              } ${processing ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {processing ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : isListening ? (
                <Volume2 className="w-12 h-12 text-white animate-bounce" />
              ) : (
                <Mic className="w-12 h-12 text-slate-400 hover:text-cyan-400 transition-colors" />
              )}
            </button>
          </div>

          {/* Context tip & dynamic audio guide */}
          <div className="w-full max-w-md pt-6 border-t border-purple-500/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#030612]/70 border border-purple-500/10 space-y-1">
              <Command className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider">Launch Websites</h4>
              <p className="text-[10px] text-slate-400">Say: <span className="text-purple-300">"Open ChatGPT"</span>, <span className="text-purple-300">"Open Github"</span>, or <span className="text-purple-300">"Open Canva"</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030612]/70 border border-purple-500/10 space-y-1">
              <Globe className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-white text-[11px] uppercase tracking-wider">Launch Category Divisions</h4>
              <p className="text-[10px] text-slate-400">Say: <span className="text-cyan-300">"Open Student"</span>, <span className="text-cyan-300">"Open AI"</span>, or <span className="text-cyan-300">"Open Developer"</span></p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
