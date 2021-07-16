import type { CSSProperties, ReactNode } from 'react';

export function SVGSet({
  style,
  children,
}: {
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <svg className="svg" style={style} viewBox="0 0 300 42.2">
      {children}
    </svg>
  );
}
