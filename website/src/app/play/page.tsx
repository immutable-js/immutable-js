import { Metadata } from 'next';
import Playground from './Playground';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Playground — Immutable.js`,
  };
}

export default function PlaygroundPage() {
  return <Playground />;
}
