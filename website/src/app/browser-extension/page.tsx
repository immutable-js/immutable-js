import { Metadata } from 'next';
import Prism from 'prismjs';
import { SiteFooter } from '../../SiteFooter';
import './extension.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Browser extension — Immutable.js`,
  };
}

const ENABLE_SNIPPET = `import * as Immutable from 'immutable';
import installDevTools from '@immutable/devtools';

installDevTools(Immutable);`;

export default function BrowserExtensionPage() {
  const enableHtml = Prism.highlight(
    ENABLE_SNIPPET,
    Prism.languages.javascript,
    'javascript'
  );

  return (
    <>
      {/* HERO */}
      <section className="ext-hero">
        <div className="ext-pill">Browser DevTools</div>
        <h1 className="ext-hero__title">
          Inspect Immutable collections
          <br />
          the way you think about them
        </h1>
        <p className="ext-hero__lede">
          Out of the box, DevTools shows the internal data structure of a
          collection — not its contents. A custom formatter fixes that, so a{' '}
          <code className="ext-inline-code">List</code> reads like a list, right
          in the Console.
        </p>
      </section>

      {/* BEFORE / AFTER */}
      <section className="ext-beforeafter">
        <div className="ext-beforeafter__grid">
          <BeforeAfterFigure
            caption="Without the formatter"
            variant="before"
            src="/before.png"
            alt="Console output without the formatter"
          />
          <div className="ext-arrow">→</div>
          <BeforeAfterFigure
            caption="With the formatter"
            variant="after"
            src="/after.png"
            alt="Console output with the formatter"
          />
        </div>
        <p className="ext-note">
          Supported in Chrome (v47+) and Firefox (116+) via custom DevTools
          formatters.
        </p>
      </section>

      {/* INSTALLATION */}
      <section className="ext-install">
        <h2 className="ext-h2">Install the extension</h2>
        <p className="ext-install__sub">
          Add it to your browser and it just works — no configuration.
        </p>
        <div className="ext-store-grid">
          <StoreCard
            href="https://chromewebstore.google.com/detail/immutablejs-object-format/lfdmhpmheemfkgjpifhenbkgcaaopckp"
            logo="/store-logo-chrome.svg"
            alt="Chrome Web Store"
            title="Chrome / Chromium"
            subtitle="Chrome Web Store →"
          />
          <StoreCard
            href="https://addons.mozilla.org/firefox/addon/immutable-js-devtool-extension/"
            logo="/store-logo-firefox.svg"
            alt="Firefox Add-ons"
            title="Firefox"
            subtitle="Firefox Add-ons →"
          />
        </div>
      </section>

      {/* ALTERNATIVE */}
      <section className="ext-alt">
        <h2 className="ext-h2 ext-h2--sm">
          Prefer not to install an extension?
        </h2>
        <p className="ext-alt__lede">
          Add the devtools as a dev dependency in your project instead.
        </p>

        <div className="ext-label">Install</div>
        <pre className="ext-code ext-code--install">
          npm install --save-dev @immutable/devtools
        </pre>

        <div className="ext-label">Enable</div>
        <pre className="ext-code">
          <code
            className="language-js"
            dangerouslySetInnerHTML={{ __html: enableHtml }}
          />
        </pre>

        <p className="ext-alt__more">
          See more details in the{' '}
          <a
            href="https://github.com/immutable-js/immutable-devtools"
            target="_blank"
            rel="noopener"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>

      <SiteFooter />
    </>
  );
}

function BeforeAfterFigure({
  caption,
  variant,
  src,
  alt,
}: {
  caption: string;
  variant: 'before' | 'after';
  src: string;
  alt: string;
}) {
  return (
    <figure
      className={`ext-figure ${variant === 'after' ? 'ext-figure--lg' : 'ext-figure--sm'}`}
    >
      <figcaption>
        <span className={`ext-figure__dot ext-figure__dot--${variant}`} />
        {caption}
      </figcaption>
      <div className="ext-figure__body">
        <img src={src} alt={alt} />
      </div>
    </figure>
  );
}

function StoreCard({
  href,
  logo,
  alt,
  title,
  subtitle,
}: {
  href: string;
  logo: string;
  alt: string;
  title: string;
  subtitle: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener" className="ext-store-card">
      <img src={logo} alt={alt} />
      <div>
        <div className="ext-store-card__title">{title}</div>
        <div className="ext-store-card__sub">{subtitle}</div>
      </div>
    </a>
  );
}
