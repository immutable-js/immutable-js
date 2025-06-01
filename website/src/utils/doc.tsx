import fs from 'node:fs';
import path from 'node:path';

function getMDXFiles(dir: string): Array<string> {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

type MDXFile = {
  slug: string;
};

function getMDXData(dir: string): Array<MDXFile> {
  const files = getMDXFiles(dir);

  return files.map((file) => {
    const slug = path.basename(file, path.extname(file));

    return {
      slug,
    };
  });
}

export function getDocFiles(): Array<MDXFile> {
  const docsDir = path.join(process.cwd(), 'docs');

  return getMDXData(docsDir);
}

export function getDocDetail(
  slug: string
): Array<{ type: 'title' | 'functionName'; name: string }> {
  const docsDir = path.join(process.cwd(), 'docs');
  const file = path.join(docsDir, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    return [];
  }

  const content = fs.readFileSync(file, 'utf-8');

  const regex = new RegExp(
    '^(## (?<title>.*)|<MemberLabel.*label="(?<functionName>[^"]*)")',
    'gm'
  );

  const titleMatch = content.matchAll(regex);

  return Array.from(titleMatch).map((match) => {
    if (match.groups?.title) {
      return { type: 'title', name: match.groups.title };
    }

    if (match.groups?.functionName) {
      return { type: 'functionName', name: match.groups.functionName };
    }

    throw new Error(`Unexpected match groups: ${JSON.stringify(match.groups)}`);
  });
}
