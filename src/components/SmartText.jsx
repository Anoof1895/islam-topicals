import React from 'react';

const SmartText = ({
  children,
  className = '',
  as = 'span',
  ...props
}) => {
  const Tag = as;
  const text = typeof children === 'string' ? children : '';
  const isDhivehi = /[\u0780-\u07BF]/.test(text);
  const lang = isDhivehi ? 'dv' : 'en';

  return (
    <Tag
      lang={lang}
      dir={isDhivehi ? 'rtl' : undefined}
      className={`${isDhivehi ? 'dhivehi-text' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default SmartText;
