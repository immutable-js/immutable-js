import fs from 'fs';

const copyright = fs.readFileSync('./LICENSE', 'utf-8');
const lines = copyright.trim().split('\n');

export default `/**\n${lines.map(line => ` * ${line}`).join('\n')}\n */`;
