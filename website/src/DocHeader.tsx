import { type JSX } from 'react';
import { Header } from './Header';

/**
 * Header used inside docs / playground / extension layouts. Same global
 * header, with flush (26px) horizontal padding to align with the docs grid.
 */
export function DocHeader(): JSX.Element {
  return <Header flush />;
}
