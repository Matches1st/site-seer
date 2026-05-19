import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { ExternalLink, Globe2, Shield, Settings2, Server } from 'lucide-react';

export default function App() {
  const [history, setHistory] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [proxyMode, setProxyMode] = useState('uv'); // 'uv', 'direct', 'gtranslate', 'allorigins'
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [swRegistered, setSwRegistered] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Expose an option to change bare server since public ones are often volatile
  const [bareServerUrl, setBareServerUrl] = useState('https://v.hollywoodct.edu.eu.org/');

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/uv-sw.js', {
            scope: '/proxy/uv/'
          });
          console.log('✅ UV Service Worker registered successfully');
          setSwRegistered(true);
        } catch (err) {
          console.error('❌ Service Worker registration failed:', err);
        }
      };
      registerSW();
    }
  }, []);

  // Sync Bare Server URL
  useEffect(() => {
    const config = (window as any).__uv$config;
    if (config) {
      config.bare = bareServerUrl;
      console.log('Bare server updated to:', bareServerUrl);
    }
  }, [bareServerUrl]);

  const handlePreview = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (proxyMode === 'uv' && !swRegistered) {
      alert("Ultraviolet is still initializing. Try again in a few seconds.");
      return;
    }

    let finalUrl = urlInput.trim();
    if (!finalUrl) return;

    // Automatically add https:// if missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setUrlInput(finalUrl);
    setCurrentUrl(finalUrl);
    // Updating the key forces the iframe to completely unmount and remount.
    // This prevents the iframe's navigation from polluting the parent browser's History API.
    setIframeKey(Date.now()); 

    // Update history (max 100 entries, prepend new)
    setHistory((prev) => {
      const newHistory = prev.filter(u => u !== finalUrl); // Remove duplicates
      newHistory.unshift(finalUrl);
      return newHistory.slice(0, 100);
    });
  };

  const handleHistoryClick = (historicUrl: string) => {
    setUrlInput(historicUrl);
    setCurrentUrl(historicUrl);
    setIframeKey(Date.now());
  };

  const getProxiedUrl = (url: string) => {
    if (!url) return '';

    if (proxyMode === 'uv') {
      const config = (window as any).__uv$config;
      if (!config || !swRegistered) {
        console.warn("UV not fully ready — falling back to direct");
        return url;
      }
      try {
        return config.prefix + config.encodeUrl(url);
      } catch (e) {
        console.error("UV encoding failed", e);
        return url;
      }
    } 
    else if (proxyMode === 'gtranslate') {
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(url)}`;
    } 
    else if (proxyMode === 'allorigins') {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    return url; // direct
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#454545] p-4 md:p-8 gap-4 md:gap-8 font-sans">
      
      {/* Sidebar */}
      <div className="hidden md:flex w-72 bg-[#1e1e1e] rounded-[2rem] p-6 text-white flex-col items-center shadow-lg hover:shadow-xl transition-shadow relative">
        <p className="text-center font-bold text-sm mb-6 leading-snug px-2">
          Urls of past websites you visited, click to revisit, can hold up to 100 past urls:
        </p>
        
        <div className="w-full flex-1 overflow-y-auto pr-2 space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 text-xs italic mt-10">No history yet.</p>
          ) : (
            history.map((url, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(url)}
                className="w-full text-left truncate px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-xs transition-colors duration-200"
                title={url}
              >
                {url}
              </button>
            ))
          )}
        </div>
        
        {/* Advanced Settings Button */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Advanced proxy settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {showAdvanced && (
           <div className="absolute bottom-20 left-0 mx-4 right-0 bg-[#2a2a2a] p-4 rounded-xl border border-[#3a3a3a] shadow-xl z-10">
             <div className="flex items-center gap-2 mb-2">
               <Server className="w-4 h-4 text-blue-400" />
               <span className="text-sm font-semibold text-gray-200">Bare Server URL</span>
             </div>
             
             <select 
               value={['https://v.hollywoodct.edu.eu.org/', 'https://bare.benjicraft.dev/', 'https://bare.coolmathgames.lol/', 'https://bare.therockypool.com/', 'custom'].includes(bareServerUrl) ? bareServerUrl : 'custom'}
               onChange={e => setBareServerUrl(e.target.value)}
               className="w-full text-xs bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-gray-300 mb-2"
             >
               <option value="https://v.hollywoodct.edu.eu.org/">v.hollywoodct.edu.eu.org</option>
               <option value="https://bare.benjicraft.dev/">bare.benjicraft.dev</option>
               <option value="https://bare.coolmathgames.lol/">bare.coolmathgames.lol</option>
               <option value="https://bare.therockypool.com/">bare.therockypool.com</option>
               <option value="custom">Custom...</option>
             </select>

             {(!['https://v.hollywoodct.edu.eu.org/', 'https://bare.benjicraft.dev/', 'https://bare.coolmathgames.lol/', 'https://bare.therockypool.com/'].includes(bareServerUrl) || bareServerUrl === 'custom') && (
               <input 
                 type="text" 
                 value={bareServerUrl === 'custom' ? '' : bareServerUrl}
                 onChange={e => setBareServerUrl(e.target.value)}
                 placeholder="https://..."
                 className="w-full text-xs bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-gray-300"
               />
             )}
             
             <p className="text-[10px] text-gray-500 mt-2">
               Ultraviolet requires a backend node. If the preview fails, provide a custom Bare server.
             </p>
           </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <h1 className="text-white text-5xl font-bold mb-6 text-center tracking-tight">
          Web Previewer
        </h1>
        
        {/* Controls Container */}
        <form onSubmit={handlePreview} className="w-full flex flex-col md:flex-row gap-3 mb-4 mx-auto">
          {/* Input Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter website URL (e.g., youtube.com)"
              className="block w-full pl-10 pr-3 py-3 rounded-lg border-none ring-2 ring-transparent focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 focus:outline-none shadow-md transition-all text-lg"
            />
          </div>

          {/* Proxy Options */}
          <div className="flex gap-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <select
                value={proxyMode}
                onChange={(e) => setProxyMode(e.target.value)}
                className="appearance-none block w-fit min-w-[170px] pl-10 pr-8 py-3 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md cursor-pointer font-medium"
                title="Select Proxy Mode"
              >
                <option value="uv">Ultraviolet (Unblock)</option>
                <option value="direct">Direct (No Proxy)</option>
                <option value="gtranslate">Translate Proxy</option>
                <option value="allorigins">AllOrigins API</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex flex-shrink-0 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              disabled={proxyMode === 'uv' && !swRegistered}
            >
              <ExternalLink className="w-5 h-5" />
              {proxyMode === 'uv' && !swRegistered ? 'Registering SW...' : 'Preview Website'}
            </button>
          </div>
        </form>

        {/* Warning Toast */}
        {!swRegistered && proxyMode === 'uv' && (
          <div className="bg-blue-500/20 text-blue-200 text-sm py-2 px-4 rounded-lg mb-4 flex items-center gap-2 max-w-fit mx-auto border border-blue-500/50 transition-all">
            <Server className="w-4 h-4 animate-spin" />
            <span>Initializing local proxy service worker...</span>
          </div>
        )}

        {/* Frame Area */}
        <div className="flex-1 w-full bg-[#f3f4f6] rounded-md shadow-inner relative overflow-hidden border-4 border-gray-300">
          {!currentUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Globe2 className="w-24 h-24 mb-4 opacity-50" />
              <p className="font-medium text-xl">Enter a URL above to start previewing.</p>
            </div>
          ) : (
            <iframe
              key={iframeKey} 
              src={getProxiedUrl(currentUrl)}
              className="w-full h-full border-none bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Preview Website Frame"
            />
          )}
        </div>
      </div>
      
    </div>
  );
}
