import { motion } from "framer-motion";

// Props interface for the FeedErrorBanner component
interface FeedErrorBannerProps {
  message: string;       // The error message text to display
  errorColor: string;    // The color used for error styling (text, border, icon)
}

export function FeedErrorBanner({ message, errorColor }: FeedErrorBannerProps) {
  return (
    <motion.div
      // Animation settings for fade in/out and slide up/down
      initial={{ opacity: 0, y: -8 }}   
      animate={{ opacity: 1, y: 0 }}    
      exit={{ opacity: 0, y: -8 }}      
      transition={{ duration: 0.35 }}   
      style={{
        display: "flex",                
        alignItems: "center",           
        gap: 10,                        
        margin: "0 auto 12px",          
        maxWidth: 520,                  
        padding: "10px 16px",           
        borderRadius: 10,               
        background: `${errorColor}1f`,  
        border: `1px solid ${errorColor}59`, 
        backdropFilter: "blur(8px)",    
      }}
    >
      {/* Error Icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path 
          d="M8 1.5L14.5 13H1.5L8 1.5Z" 
          stroke={errorColor} 
          strokeWidth="1.4" 
          strokeLinejoin="round"
        />
        <line 
          x1="8" y1="6" x2="8" y2="9.5" 
          stroke={errorColor} 
          strokeWidth="1.4" 
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.5" r="0.7" fill={errorColor}/>
      </svg>

      {/* Error message text */}
      <span style={{ color: errorColor, fontSize: 13, letterSpacing: "0.03em" }}>
        {message}
      </span>
    </motion.div>
  );
}