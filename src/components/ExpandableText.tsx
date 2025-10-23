import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  onClick?: () => void;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  maxLength = 100, 
  className = "",
  onClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text should be truncated
  const shouldTruncate = text.length > maxLength || text.includes('\n');
  
  // Get display text
  const getDisplayText = () => {
    if (!shouldTruncate || isExpanded) {
      return text;
    }
    
    // If text has line breaks, truncate at first line break
    if (text.includes('\n')) {
      const firstLine = text.split('\n')[0];
      return firstLine.length > maxLength ? firstLine.substring(0, maxLength) : firstLine;
    }
    
    // Otherwise truncate at maxLength
    return text.substring(0, maxLength);
  };
  
  const displayText = getDisplayText();
  const isTruncated = shouldTruncate && !isExpanded;
  
  return (
    <p className={`whitespace-pre-wrap cursor-pointer ${className}`} onClick={onClick}>
      {displayText}
      {isTruncated && (
        <span 
          className="text-blue-500 hover:text-blue-400 cursor-pointer ml-1 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
        >
          ...see more
        </span>
      )}
      {isExpanded && shouldTruncate && (
        <span 
          className="text-blue-500 hover:text-blue-400 cursor-pointer ml-1 font-medium"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
        >
          see less
        </span>
      )}
    </p>
  );
};

export default ExpandableText;
