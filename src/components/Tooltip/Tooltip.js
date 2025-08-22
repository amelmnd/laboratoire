import { useState } from 'react';

const Tooltip = ({ children, message }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)} 
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div 
          style={{
            position: 'absolute', 
            bottom: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            backgroundColor: 'black', 
            color: 'white', 
            padding: '5px', 
            borderRadius: '4px', 
            zIndex: 10
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
