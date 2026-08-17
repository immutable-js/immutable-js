import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocsBreadcrumb } from '../../../../../DocsBreadcrumb';
import { Sidebar } from '../../../../../sidebar';
import { getVersions } from '../../../../../static/getVersions';
import { GET_STARTED_LINKS } from '../../../currentVersion';

export async function generateStaticParams() {
  return GET_STARTED_LINKS.map((link) => ({ slug: link.slug }));
}

type Params = {
  slug: string;
};

type Props = {
  params: Promise<Params>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const link = GET_STARTED_LINKS.find((l) => l.slug === slug);

  return {
    title: `${link?.label ?? 'Get started'} — Immutable.js`,
    description: link?.description,
  };
}

export default async function GetStartedPage(props: Props) {
  const { slug } = await props.params;

  const index = GET_STARTED_LINKS.findIndex((link) => link.slug === slug);
  if (index === -1) {
    notFound();
  }

  const { default: MdxContent } = await import(
    `@/docs/get-started/${slug}.mdx`
  );
  const versions = getVersions();

  const previous = GET_STARTED_LINKS[index - 1];
  const next = GET_STARTED_LINKS[index + 1];

  return (
    <div className="docs-grid">
      <Sidebar versions={versions} />

      <main className="docs-main">
        <article className="doc-article">
          <DocsBreadcrumb />

          <MdxContent />

          {/* Sequential navigation: the guide is meant to be read in order. */}
          <nav className="doc-pager">
            {previous ? (
              <Link href={previous.url} className="doc-pager__link">
                <span className="doc-pager__dir">← Previous</span>
                <span className="doc-pager__label">{previous.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={next.url}
                className="doc-pager__link doc-pager__link--next"
              >
                <span className="doc-pager__dir">Next →</span>
                <span className="doc-pager__label">{next.label}</span>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </div>
  );
}
