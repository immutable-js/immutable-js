import BurgerNav from './BurgerNav';
import { HeaderLinks, HeaderLogoLink } from './Header';

export function DocHeader({
  versions,
  currentVersion,
}: {
  versions: Array<string>;
  currentVersion?: string;
}) {
  return (
    <div className="header">
      <div className="miniHeader">
        <div className="miniHeaderContents">
          <HeaderLogoLink />
          <HeaderLinks versions={versions} currentVersion={currentVersion} />
        </div>

        <BurgerNav />
      </div>
    </div>
  );
}
