import { JSX } from 'react';
import Link from 'next/link';
import { ArrowDown } from '..//ArrowDown';
import { usePathname } from 'next/navigation';

type Props = {
  label: string;
  url: string;
  canBeFocused: boolean;
  isActive: boolean;
  onClick: () => void;
};

export default function SidebarMainLink({
  label,
  url,
  canBeFocused,
  isActive,
  onClick,
}: Props): JSX.Element {
  const pathname = usePathname();

  const isCurrent = pathname === url;

  return (
    <div className={`sideBar__Link ${isActive ? 'sideBar__Link--active' : ''}`}>
      <Link
        href={url}
        onClick={(e) => {
          if (isCurrent) {
            e.preventDefault();

            onClick();
          }
        }}
      >
        {label}
        {isActive && canBeFocused && (
          <>
            {' '}
            <ArrowDown isActive={isActive} />
          </>
        )}
      </Link>
    </div>
  );
}
