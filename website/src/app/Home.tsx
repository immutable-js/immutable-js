'use client';

import Link from 'next/link';
import Prism from 'prismjs';
import { type JSX, useMemo, useState } from 'react';
import { Header } from '../Header';
import { Logo } from '../Logo';
import { SVGSet } from '../SVGSet';
import { SiteFooter } from '../SiteFooter';
import Repl from '../repl/Repl';
import { VERSION } from './docs/currentVersion';
import './home.css';

const COLLECTIONS: Array<{ name: string; desc: string; href: string }> = [
  {
    name: 'List',
    desc: 'Ordered, indexed — like Array',
    href: `/docs/${VERSION}/List`,
  },
  {
    name: 'Map',
    desc: 'Keyed pairs, keys of any type',
    href: `/docs/${VERSION}/Map`,
  },
  {
    name: 'Set',
    desc: 'Unique values by equality',
    href: `/docs/${VERSION}/Set`,
  },
  {
    name: 'Record',
    desc: 'Typed keyed structures',
    href: `/docs/${VERSION}/Record`,
  },
  {
    name: 'OrderedMap',
    desc: 'Map that keeps insertion order',
    href: `/docs/${VERSION}/OrderedMap`,
  },
  {
    name: 'OrderedSet',
    desc: 'Set that keeps insertion order',
    href: `/docs/${VERSION}/OrderedSet`,
  },
  {
    name: 'Stack',
    desc: 'LIFO, fast prepend',
    href: `/docs/${VERSION}/Stack`,
  },
  {
    name: 'Seq',
    desc: 'Lazy — plus Range & Repeat',
    href: `/docs/${VERSION}/Seq`,
  },
];

const WHY: Array<{ label: string; title: string; desc: string }> = [
  {
    label: 'Performance',
    title: 'Fast & memory-light',
    desc: "New versions reuse the parts that didn't change — cheap to create, and the original is never touched. No defensive copying.",
  },
  {
    label: 'Lazy Seq',
    title: 'Chaining without cost',
    desc: 'Chain map, filter and more — even over infinite ranges — with zero intermediate arrays.',
  },
  {
    label: 'State',
    title: 'Simpler application state',
    desc: 'Data never mutates under you, so undo/redo, change detection and memoization become trivial. A natural fit for React & Redux.',
  },
  {
    label: 'fromJS / toJS',
    title: 'Interop with plain JS',
    desc: 'Convert to and from objects & arrays, shallow or deep, in a single call.',
  },
  {
    label: 'getIn / setIn / updateIn',
    title: 'Deep, without the pain',
    desc: 'Read and update values buried deep in nested structures with a path.',
  },
  {
    label: 'TypeScript & Flow',
    title: 'Typed out of the box',
    desc: 'Full generics, error detection and editor auto-complete — nothing to install.',
  },
];

const EXAMPLES: Array<{ label: string; caption: string; code: string }> = [
  {
    label: 'List',
    caption: 'Build & transform a List — every call returns a new List',
    code: `const upperFirst = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

List(['apple', 'banana', 'coconut'])
  .push('dragonfruit')
  .map((fruit) => upperFirst(fruit));
// → List [ "Apple", "Banana", "Coconut", "Dragonfruit" ]`,
  },
  {
    label: 'Range',
    caption: 'Group lazily over a range — work happens only when needed',
    code: `function isPrime(n) {
  for (let i = 2; i <= Math.sqrt(n); i++)
    if (n % i === 0) return false;
  return n > 1;
}

Range(1, 100)
  .filter(isPrime)
  .groupBy((nb) => Math.floor(nb / 10));
// → Map { 0: Seq [ 2, 3, 5, 7 ], 1: Seq [ 11, 13, 17, 19 ], … }`,
  },
  {
    label: 'Map',
    caption: 'Keyed updates — set & update return new Maps',
    code: `const inventory = Map({ apples: 3, bananas: 5 });

inventory
  .set('cherries', 12)
  .update('apples', (n) => n + 2);
// → Map { "apples": 5, "bananas": 5, "cherries": 12 }`,
  },
];

const TRY_IT_DEFAULT = `const m = Map({ a: 1, b: 2, c: 3 });

m.set('b', 50).get('b'); // 50`;

export default function Home(): JSX.Element {
  const [activeExample, setActiveExample] = useState(0);

  const highlighted = useMemo(
    () =>
      EXAMPLES.map((ex) =>
        Prism.highlight(ex.code, Prism.languages.javascript, 'javascript')
      ),
    []
  );

  return (
    <div className="home">
      <Header />

      {/* ============ HERO ============ */}
      <section id="top" className="home-hero">
        <div className="home-hero__glow" />
        <div className="home-hero__inner">
          <div className="home-hero__logo">
            <SVGSet>
              <Logo color="#FC4349" />
              <Logo color="#2C3E50" inline />
            </SVGSet>
          </div>

          <h1 className="home-hero__title">
            Persistent, <strong>immutable data structures</strong> for
            JavaScript / TypeScript
          </h1>

          <p className="home-hero__lede">
            <code className="home-code-pill">List</code>{' '}
            <code className="home-code-pill">Map</code>{' '}
            <code className="home-code-pill">Set</code>{' '}
            <code className="home-code-pill">Record</code> and a lazy{' '}
            <code className="home-code-pill">Seq</code> — highly efficient, with
            zero dependencies and TypeScript types in the box.
          </p>

          <div className="home-hero__ctas">
            <Link
              href={`/docs/${VERSION}`}
              className="home-btn home-btn--primary"
            >
              Read the docs
            </Link>
            <Link href="/play" className="home-btn home-btn--ghost">
              Try it in the browser
            </Link>
          </div>

          <div className="home-hero__install">
            <span className="home-hero__prompt">$</span> npm install immutable
          </div>
        </div>
      </section>

      {/* ============ COLLECTION FAMILY ============ */}
      <section className="home-section home-section--family">
        <div className="home-section__head--center">
          <div className="home-eyebrow">The collection family</div>
          <h2 className="home-h2">
            Several persistent collections, one familiar API
          </h2>
        </div>
        <div className="home-cards">
          {COLLECTIONS.map((c) => (
            <Link key={c.name} href={c.href} className="home-card">
              <div className="home-card__name">{c.name}</div>
              <div className="home-card__desc">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ WHY ============ */}
      <section className="home-section home-section--why">
        <div className="home-section__head">
          <div className="home-eyebrow">Why Immutable.js</div>
          <h2 className="home-h2">Built to make data simpler and faster</h2>
        </div>
        <div className="home-why-grid">
          {WHY.map((w) => (
            <div key={w.label} className="home-why-card">
              <div className="home-why-card__label">{w.label}</div>
              <div className="home-why-card__title">{w.title}</div>
              <div className="home-why-card__desc">{w.desc}</div>
            </div>
          ))}
        </div>

        {/* Examples (static tabbed) */}
        <h3 className="home-examples__title">Examples</h3>
        <div className="home-examples">
          <div className="home-examples__bar">
            <div className="home-tabs">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setActiveExample(i)}
                  className={`home-tab ${i === activeExample ? 'home-tab--active' : ''}`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <span className="home-examples__caption">
              {EXAMPLES[activeExample].caption}
            </span>
          </div>
          <pre className="home-examples__code">
            <code
              className="language-js"
              dangerouslySetInnerHTML={{ __html: highlighted[activeExample] }}
            />
          </pre>
        </div>
      </section>

      {/* ============ TRY IT ============ */}
      <section id="try" className="home-section home-section--try">
        <div className="home-try">
          <div className="home-try__copy">
            <div className="home-eyebrow">Live &amp; editable</div>
            <h2 className="home-try__title">Every example runs, right here</h2>
            <p className="home-try__text">
              Edit the code and press Run. No install, no setup — the same
              interactive editor appears throughout the docs so you can learn by
              trying.
            </p>
            <Link href="/play" className="home-try__link">
              Open the full Playground →
            </Link>
          </div>
          <div className="home-try__editor">
            <Repl defaultValue={TRY_IT_DEFAULT} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
