'use client';

import { Fragment, useState } from 'react';
import { SIDEBAR_LINKS } from '../app/docs/currentVersion';
import Focus, { FocusType } from './Focus';
import SidebarMainLink from './SidebarMainLink';

export type SidebarLinks = Array<{ label: string; url: string }>;

export default function SideBar({
  links = SIDEBAR_LINKS,
  focus,
  activeType,
}: {
  links?: SidebarLinks;
  focus?: FocusType;
  activeType?: string;
}) {
  const [isForcedClosed, setIsForcedClosed] = useState(false);

  return (
    <div className="sideBar">
      <div className="sideBar__background" />
      <div className="scrollContent">
        <h2>Immutable.js</h2>
        {links.map((link) => {
          const isCurrent = activeType === link.label;
          const isActive = isCurrent && !isForcedClosed;
          return (
            <Fragment key={link.url}>
              <SidebarMainLink
                label={link.label}
                url={link.url}
                isActive={isActive}
                canBeFocused={Boolean(focus?.length)}
                onClick={() => setIsForcedClosed((prev) => !prev)}
              />

              {isActive && <Focus focus={focus} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
