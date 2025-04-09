import { getDocFiles } from '@/utils/doc';

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

  console.log('params', params);

  return {
    title: `${params.type} — Immutable.js`,
  };
}

export default async function TypeDocPage(props: Props) {
  const params = await props.params;

  const { type } = params;

  const { default: MdxContent } = await import(`@/docs/${type}.mdx`);

  return <MdxContent />;
}
