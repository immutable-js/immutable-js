import { JSX } from 'react';
import FunctionLink from './FunctionLink';

type FunctionDefinition = {
  label: string;
  url: string;
};

type Props = {
  title: string;
  functions: Array<FunctionDefinition>;
};

export default function FocusGroup({ title, functions }: Props): JSX.Element {
  return (
    <section>
      <h4 key={title} className="groupTitle">
        {title}
      </h4>
      {functions.map((member) => (
        <FunctionLink
          key={member.label}
          label={member.label}
          url={member.url}
        />
      ))}
    </section>
  );
}
