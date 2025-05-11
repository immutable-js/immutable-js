import { JSX } from 'react';

type Props = {
  to: string;
  children?: React.ReactNode;
};

export default function CodeLink({ to, children }: Props): JSX.Element {
  const href = to.includes('#') ? to : `#${to}`;

  return (
    <a href={href}>
      <code>{children || href}</code>
    </a>
  );
}
