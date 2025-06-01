import Link from 'next/link';
import { JSX } from 'react';

type Props = {
  label: string;
  url: string;
};

export default function FunctionLink({ label, url }: Props): JSX.Element {
  return (
    <div key={label}>
      <Link href={url}>{label}</Link>
    </div>
  );
}
