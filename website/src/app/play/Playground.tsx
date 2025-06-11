'use client';

import Repl from '../../repl/Repl';
import { bytesToString, stringToBytes } from './encoder';

export default function Playground() {
  {
    /*
Debug with:

List([
  'apple',
  'banana',
  'coconut',
  123,
  null,
  undefined,
  new Date()
])
  .push('dragonfruit')
  .map((fruit) => upperFirst(fruit))

*/
  }

  let decodedHash: string | null = null;

  try {
    decodedHash = window.location.hash
      ? bytesToString(window.location.hash.slice(1))
      : null;
  } catch (e) {
    console.warn('Error decoding hash', e);
  }

  const defaultValue =
    decodedHash ??
    `const upperFirst = (str) => typeof str === 'string'
? str.charAt(0).toUpperCase() + str.slice(1)
: str;
  
List([
'apple',
'banana',
'coconut',
])
.push('dragonfruit')
.map((fruit) => upperFirst(fruit))
`;

  return (
    <Repl
      defaultValue={defaultValue}
      onRun={(code) => {
        const bytes = stringToBytes(code);

        // adds bytes as url hash
        window.location.hash = bytes;
      }}
    />
  );
}
