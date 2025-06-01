import { getDocFiles, getDocDetail } from '../../../../utils/doc';
import { Sidebar, FocusType } from '../../../../sidebar';
import { DocSearch } from '../../../../DocSearch';

export async function generateStaticParams() {
  const docFiles = getDocFiles();

  return docFiles.map((file) => ({
    type: file.slug,
  }));
}

type Params = {
  version: string;
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

  return (
    <div className="contents">
      <Sidebar focus={focus} activeType={type} />

      <div className="docContents">
        <DocSearch />
        <MdxContent />;
      </div>
    </div>
  );
}
