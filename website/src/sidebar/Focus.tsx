import { JSX } from 'react';
import FocusGroup from './FocusGroup';

type FocusItem = {
  label: string;
  functions: Record<string, { label: string; url: string }>;
};

export type FocusType = Array<FocusItem>;

export default function Focus({
  focus,
}: {
  focus?: FocusType;
}): JSX.Element | null {
  if (focus?.length === 0) {
    return null;
  }

  return (
    <div className="members">
      {focus?.map((def) => (
        <FocusGroup
          key={def.label}
          title={def.label}
          functions={Object.values(def.functions)}
        />
      ))}
    </div>
  );
}
