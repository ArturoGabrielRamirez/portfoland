'use client'

/**
 * ConsoleStyle Component
 * 
 * Provides console-style status bar with terminal aesthetics:
 * - Command prompt format
 * - Connection status with timestamp
 * - Subtle burn-in effect
 */

interface ConsoleStyleProps {
  title: string
  status?: string
  showTimestamp?: boolean
  className?: string
}

export function ConsoleStyle({ 
  title, 
  status = "ONLINE", 
  showTimestamp = true, 
  className 
}: ConsoleStyleProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      {/* Console Title */}
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-mono text-xs">$</span>
        <span className="text-green-400 font-mono text-sm">_</span>
        <span className="text-cyan-400 font-mono text-sm">{title}</span>
        <span className="text-cyan-400 font-mono text-sm">--display</span>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {/* Main Status Text */}
        <div className="text-green-400 font-mono text-xs">
          {status}
        </div>
        
        {/* Timestamp with subtle burn-in */}
        {showTimestamp && (
          <div className="text-green-400 font-mono text-xs">
            <span 
              style={{
                opacity: 0.8,
                textShadow: '0 0 2px rgba(74, 222, 128, 0.2)',
              }}
            >
              [{new Date().toLocaleTimeString()}]
            </span>
          </div>
        )}
      </div>
    </div>
  )
}