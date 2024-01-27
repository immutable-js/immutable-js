'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  version: string;
};

export default function RedirectExistingDocs({ version }: Props) {
  const router = useRouter();

  useEffect(() => {
    const [, type, member] = window.location.hash?.split('/') || [];
    let route = `/docs/${version}`;
    if (type) {
      route += `/${type}`;
    }
    if (member) {
      route += `#${member}`;
    }
    router.replace(route);
  }, [version, router]);

  return <div className="contents">Redirecting...</div>;
}
