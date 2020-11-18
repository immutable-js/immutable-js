import React from 'react';
import constants from '../constants';

export default function Disclaimer() {
  return (
    <section className="disclaimer">
      This documentation is generated from{' '}
      <a href={constants.typeDefURL}>Immutable.d.ts</a>. Pull requests and{' '}
      <a href={constants.issuesURL}>Issues</a> welcome.
    </section>
  );
}
