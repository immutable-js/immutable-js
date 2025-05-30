'use client';
import React, { JSX } from 'react';

function BurgerNav(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <div className="MenuButton__Toggle">
      <button
        type="button"
        onClick={() => {
          document
            .getElementsByClassName('sideBar')[0]
            .classList.toggle('sideBar--visible');
        }}
      >
        <svg
          width={32}
          height={32}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Open menu"
          {...props}
        >
          <rect
            x="6"
            y="9"
            width="20"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
          <rect
            x="6"
            y="15"
            width="20"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
          <rect
            x="6"
            y="21"
            width="20"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

export default BurgerNav;
