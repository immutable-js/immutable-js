import { DocsBreadcrumb } from '../../../../DocsBreadcrumb';
import { FocusType, Sidebar } from '../../../../sidebar';
import { getVersions } from '../../../../static/getVersions';
import { getDocDetail, getDocFiles } from '../../../../utils/doc';

export async function generateStaticParams() {
  const docFiles = getDocFiles();

  return docFiles.map((file) => ({
    type: file.slug,
  }));
}

type Params = {
  type: string;
};

type Props = {
  params: Promise<Params>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  return {
    title: `${params.type} — Immutable.js`,
  };
}

export default async function TypeDocPage(props: Props) {
  const params = await props.params;

  const { type } = params;

  const detail = getDocDetail(type);
  const focus = detail.reduce<FocusType>((carry, item) => {
    if (item.type === 'title') {
      const focus = {
        qualifiedName: item.name,
        label: item.name, // Like a name, but with () for callables.
        functions: {},
      };
      return [...carry, focus];
    }

    const lastItem = carry[carry.length - 1];

    if (lastItem) {
      lastItem.functions[item.name] = {
        label: item.name,
        url: `#${item.name}`,
      };
    }

    return carry;
  }, []);

  const { default: MdxContent } = await import(`@/docs/${type}.mdx`);
  const versions = getVersions();

  return (
    <div className="docs-grid">
      <Sidebar focus={focus} activeType={type} versions={versions} />

      <main className="docs-main">
        <article className="doc-article">
          <DocsBreadcrumb />

          <MdxContent />
        </article>
      </main>
    </div>
  );
}
