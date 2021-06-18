import { memo, MouseEvent } from 'react';
import { useRouter } from 'next/router';

type Props = {
  contents: string;
  className?: string;
};

export const MarkdownContent = memo<Props>(({ contents, className }) => {
  const router = useRouter();

  const handleClick = (event: MouseEvent) => {
    const link = event.target as HTMLAnchorElement;
    if (link.tagName === 'A' && link.target !== '_blank') {
      event.preventDefault();
      router.push(link.href);
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: contents }}
    />
  );
});
