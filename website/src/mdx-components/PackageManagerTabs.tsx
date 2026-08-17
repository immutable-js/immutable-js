'use client';

import { type JSX, useState } from 'react';

const COMMANDS: Array<{ label: string; command: string }> = [
  { label: 'npm', command: 'npm install immutable' },
  { label: 'yarn', command: 'yarn add immutable' },
  { label: 'pnpm', command: 'pnpm add immutable' },
  { label: 'bun', command: 'bun add immutable' },
];

/**
 * The install command, with a tab per package manager. npm is shown first, so
 * readers who don't care about the others can just copy the default.
 */
export default function PackageManagerTabs(): JSX.Element {
  const [active, setActive] = useState(0);

  return (
    <div className="pm-tabs">
      <div className="pm-tabs__bar" role="tablist" aria-label="Package manager">
        {COMMANDS.map((entry, index) => (
          <button
            key={entry.label}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`pm-tabs__tab ${
              index === active ? 'pm-tabs__tab--active' : ''
            }`}
            onClick={() => setActive(index)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <pre className="pm-tabs__code">
        <code>
          <span className="pm-tabs__prompt">$</span> {COMMANDS[active].command}
        </code>
      </pre>
    </div>
  );
}
