'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { ArrowDown } from '../../../ArrowDown';
import { SidebarLinks } from '../../../sidebar';
import { SIDEBAR_LINKS } from '../currentVersion';
import type { TypeDefinition } from './TypeDefs';
import { collectMemberGroups } from './collectMemberGroups';

function Links({
  links,
  focus,
  showInGroups,
  showInherited,
}: {
  links: SidebarLinks;
  focus?: TypeDefinition;
  showInGroups?: boolean;
  showInherited?: boolean;
}) {
  const [isForcedClosed, setIsForcedClosed] = useState(false);
  useEffect(() => {
    setIsForcedClosed(false);
  }, [focus?.label]);

  return (
    <div>
      <h2>Immutable.js</h2>
      {links.map((link) => {
        const isCurrent = focus?.label === link.label;
        const isActive = isCurrent && !isForcedClosed;
        return (
          <Fragment key={link.url}>
            <div
              className={`sideBar__Link ${
                isActive ? 'sideBar__Link--active' : ''
              }`}
            >
              <Link
                href={link.url}
                onClick={(e) => {
                  if (isCurrent) {
                    e.preventDefault();
                    setIsForcedClosed(!isForcedClosed);
                  }
                }}
              >
                {link.label}
                {isActive && (focus?.interface || focus?.functions) && (
                  <>
                    {' '}
                    <ArrowDown isActive={isActive} />
                  </>
                )}
              </Link>
            </div>

            {isActive && (
              <Focus
                focus={focus}
                showInherited={showInherited}
                showInGroups={showInGroups}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function Focus({
  focus,
  showInGroups,
  showInherited,
}: {
  focus?: TypeDefinition;
  showInGroups?: boolean;
  showInherited?: boolean;
}) {
  if (!focus || (!focus.interface && !focus.functions)) {
    return null;
  }

  return (
    <div className="members">
      {focus.call && (
        <section>
          <h4 className="groupTitle">Construction</h4>
          <div>
            <Link href={focus.call.url}>{focus.call.label}</Link>
          </div>
        </section>
      )}

      {focus.functions && (
        <section>
          <h4 className="groupTitle">Static Methods</h4>
          {Object.values(focus.functions).map((fn) => (
            <div key={fn.id}>
              <Link href={fn.url}>{fn.label}</Link>
            </div>
          ))}
        </section>
      )}

      <section>
        {collectMemberGroups(
          focus.interface,
          showInGroups,
          showInherited
        ).flatMap(([title, groupMembers]) =>
          groupMembers.length === 0
            ? null
            : [
                <h4 key={title || 'Members'} className="groupTitle">
                  {title || 'Members'}
                </h4>,
                groupMembers.map((member) => (
                  <div key={member.id}>
                    <Link href={member.url}>{member.label}</Link>
                  </div>
                )),
              ]
        )}
      </section>
    </div>
  );
}

export function SideBarV4({
  links = SIDEBAR_LINKS,
  focus,
  toggleShowInherited,
  toggleShowInGroups,
  showInherited,
  showInGroups,
}: {
  links?: SidebarLinks;
  focus?: TypeDefinition;
  toggleShowInherited?: () => void;
  toggleShowInGroups?: () => void;
  showInherited?: boolean;
  showInGroups?: boolean;
}) {
  return (
    <div className="sideBar">
      <div className="sideBar__background" />
      <div className="scrollContent">
        {toggleShowInherited && toggleShowInGroups && (
          <div className="toolBar">
            <div onClick={toggleShowInGroups} onKeyPress={toggleShowInGroups}>
              <span className={showInGroups ? 'selected' : undefined}>
                Grouped
              </span>
              {' • '}
              <span className={!showInGroups ? 'selected' : undefined}>
                Alphabetized
              </span>
            </div>
            <div onClick={toggleShowInherited} onKeyPress={toggleShowInherited}>
              <span className={showInherited ? 'selected' : undefined}>
                Inherited
              </span>
              {' • '}
              <span className={!showInherited ? 'selected' : undefined}>
                Defined
              </span>
            </div>
          </div>
        )}
        <Links
          links={links}
          focus={focus}
          showInGroups={showInGroups}
          showInherited={showInherited}
        />
      </div>
    </div>
  );
}
