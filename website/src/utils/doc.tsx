import fs from 'node:fs';
import path from 'node:path';

function getMDXFiles(dir: string): Array<string> {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function getMDXData(dir: string): Array<{ slug: string }> {
  const files = getMDXFiles(dir);

  console.log('files', files);

  return files.map((file) => {
    const slug = path.basename(file, path.extname(file));

    return {
      slug,
    };
  });
}

export function getDocFiles() {
  const docsDir = path.join(process.cwd(), 'docs');

  return getMDXData(docsDir);
}
