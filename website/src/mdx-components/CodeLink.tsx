import { JSX } from 'react';

type Props = {
  to: string;
  children?: React.ReactNode;
};

export default function CodeLink({ to, children }: Props): JSX.Element {
  return (
    <a href={`#${to}`}>
      <code>{children || to}</code>
    </a>
  );
}
