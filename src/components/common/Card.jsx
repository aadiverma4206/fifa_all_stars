import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'footy-card p-6 overflow-hidden transition-all duration-300',
        hover && 'footy-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
