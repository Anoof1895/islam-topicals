// src/components/SmartText.jsx
import React from 'react';

const SmartText = ({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => {
  // Convert children to string for checking
  const text = typeof children === 'string' ? children : '';
  
  // Check for Dhivehi characters
  const isDhivehi = /[\u0780-\u07BF]/.test(text);
  const lang = isDhivehi ? 'dv' : 'en';
  
  return (
    <Component 
      lang={lang}
      className={`${isDhivehi ? 'dhivehi-text' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default SmartText;