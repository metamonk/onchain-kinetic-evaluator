import React from 'react';

interface LogoProps {
  width?: string;
  height?: string;
  viewBox?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = '25',
  height = '25',
  viewBox = '0 0 250 250',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current text-black dark:text-white shadow-lg shadow-black/10"
    >
      <rect width="250" height="250" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 50V200H200V50H50ZM150 100H100V150H150V100Z"
      />
    </svg>
  );
};

export default Logo;
