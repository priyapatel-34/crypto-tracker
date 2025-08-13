import { TrendingUp } from "lucide-react";

interface FullPageLoaderProps {
  text?: string;
}

export function FullPageLoader({ text = "Loading..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative w-full max-w-md px-8 py-12">
        <div className="relative h-24 w-full mb-8 overflow-hidden">
          <div className="absolute inset-0 flex items-end">
            <div className="h-1 bg-green-400/30 w-full">
              <div className="h-full w-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-chart-load"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-full border-r border-foreground/20"></div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          {['BTC', 'ETH', 'SOL', 'DOT'].map((symbol, i) => (
            <div 
              key={symbol}
              className="relative w-12 h-12 rounded-full bg-card border border-foreground/10 flex items-center justify-center text-xs font-mono font-bold text-foreground/70"
              style={{
                animation: `bounce 1.5s ease-in-out ${i * 0.15}s infinite`,
              }}
            >
              {symbol}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <TrendingUp className="w-6 h-6 text-green-400 animate-bounce" />
            <h3 className="text-xl font-semibold text-foreground">CryptoTracker</h3>
          </div>
          <p className="text-foreground/80">
            {text}
            <span className="inline-flex space-x-1 ml-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.1s]"></span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.3s]"></span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.5s]"></span>
            </span>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes chart-load {
          0% { width: 0; opacity: 0; }
          20% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `
      }}/>
    </div>
  );
}
