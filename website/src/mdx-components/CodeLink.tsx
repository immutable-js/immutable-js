import { JSX } from 'react';

type Props = {
  to: string;
  children?: React.ReactNode;
};

export default function CodeLink({ to, children }: Props): JSX.Element {
  const href = to.includes('#') || to.startsWith('.') ? to : `#${to}`;

  const text = children || to.replace(/^[./]*/g, '');

  return (
    <a href={href}>
      <code>{text}</code>
    </a>
  );
}
