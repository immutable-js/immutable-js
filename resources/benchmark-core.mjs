// Run each bundle in a fresh process, on the same Node version and idle machine:
// node --expose-gc resources/benchmark-core.mjs /path/to/immutable.js
// Timings include allocation/GC during operations, but exclude fixture setup.
// Heap measurements retain only the result, not temporary construction garbage.
import { createRequire } from 'node:module';
import { cpus } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const require = createRequire(import.meta.url);
const bundle = path.resolve(process.argv[2] || 'dist/immutable.js');
const { List, Map, Seq, Set } = require(bundle);
if (!global.gc) {
  throw new Error('Run with node --expose-gc to measure retained heap.');
}
const samples = 9;
const filter = process.argv[3] || '';
let sink;

function median(values) {
  return values.slice().sort((a, b) => a - b)[values.length >> 1];
}

function measure(run) {
  let count = 1;
  // Warm up and calibrate batches to at least 30 ms.
  for (;;) {
    const start = performance.now();
    for (let i = 0; i < count; i++) {
      sink = run();
    }
    if (performance.now() - start >= 30) {
      break;
    }
    count *= 2;
  }
  const ns = [];
  for (let sample = 0; sample < samples; sample++) {
    global.gc();
    const start = performance.now();
    for (let i = 0; i < count; i++) {
      sink = run();
    }
    ns.push(((performance.now() - start) * 1e6) / count);
  }
  return { medianNs: median(ns), samplesNs: ns };
}

function retainedHeap(make, copies = 1) {
  const build =
    copies === 1 ? make : () => Array.from({ length: copies }, make);
  // Warm up constructors before measuring their retained output.
  sink = build();
  const bytes = [];
  for (let sample = 0; sample < samples; sample++) {
    sink = undefined;
    global.gc();
    const before = process.memoryUsage().heapUsed;
    sink = build();
    global.gc();
    bytes.push((process.memoryUsage().heapUsed - before) / copies);
  }
  return { copies, medianBytes: median(bytes), samplesBytes: bytes };
}

const timing = {};
for (const size of [8, 32, 1024, 32768]) {
  const array = Array.from({ length: size }, (_, i) => i);
  const sparse = new Array(size);
  sparse[size >> 1] = 1;
  const strings = array.map((i) => 'value' + i);
  const seq = Seq(array);
  const entries = array.map((i) => [i, i]);
  const stringEntries = array.map((i) => ['key' + i, i]);
  const map = Map(entries);
  const stringMap = Map(stringEntries);
  const list = List(array);
  const sliced = list.slice(3, -3);
  const cases = {
    'Map/build': () => Map(entries),
    'Map/build strings': () => Map(stringEntries),
    'Map/get': () => {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += map.get((i * 17) % size);
      }
      return sum;
    },
    'Map/get strings': () => {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += stringMap.get(stringEntries[i][0]);
      }
      return sum;
    },
    'Map/persistent set': () => map.set(size >> 1, -1),
    'Map/persistent insert': () => map.set(size, size),
    'Map/persistent delete': () => map.remove(size >> 1),
    'Map/map': () => map.map((v) => v + 1),
    'Map/map identity': () => map.map((v) => v),
    'Map/map one changed': () => map.map((v, k) => (k === 0 ? -1 : v)),
    'Map/map strings': () => stringMap.map((v) => v + 1),
    'Map/transient update': () =>
      map.withMutations((m) => {
        for (let i = 0; i < size; i++) {
          m.set(i, -i);
        }
      }),
    'Map/transient delete': () =>
      map.withMutations((m) => {
        for (let i = 0; i < size; i++) {
          m.remove((i * 17) % size);
        }
      }),
    'Map/forEach': () => {
      let sum = 0;
      map.forEach((v) => (sum += v));
      return sum;
    },
    'Map/values': () => {
      let sum = 0;
      for (const v of map.values()) {
        sum += v;
      }
      return sum;
    },
    'List/build': () => List(array),
    'List/build sparse': () => List(sparse),
    'List/build strings': () => List(strings),
    'List/build Seq': () => List(seq),
    'List/persistent set': () => list.set(size >> 1, -1),
    'List/push': () => list.push(size),
    'List/pop': () => list.pop(),
    'List/map': () => list.map((v) => v + 1),
    'List/forEach': () => {
      let sum = 0;
      list.forEach((v) => (sum += v));
      return sum;
    },
    'List/values': () => {
      let sum = 0;
      for (const v of list.values()) {
        sum += v;
      }
      return sum;
    },
    'List/sliced toArray': () => sliced.toArray(),
    'List/reverse toArray': () => list.toSeq().reverse().toArray(),
    'List/some': () => list.some((v) => v === size >> 1),
  };
  for (const [name, run] of Object.entries(cases)) {
    if (name.startsWith(filter)) {
      timing[name + '/' + size] = measure(run);
    }
  }
}

function collisionKeys(rounds) {
  let keys = [''];
  for (let i = 0; i < rounds; i++) {
    keys = keys.flatMap((key) => [key + 'Aa', key + 'BB']);
  }
  return keys;
}

for (const rounds of [8, 10, 12]) {
  const keys = collisionKeys(rounds);
  const entries = keys.map((key, i) => [key, i]);
  const map = Map(entries);
  const cases = {
    'Map/collisions build': () => Map(entries),
    'Map/collisions get': () => {
      let sum = 0;
      for (const key of keys) {
        sum += map.get(key);
      }
      return sum;
    },
    'Map/collisions delete': () =>
      map.withMutations((mutable) => {
        for (const key of keys) {
          mutable.remove(key);
        }
      }),
    'Map/collisions map': () => map.map((v) => v + 1),
    'Map/collisions persistent set/get': () =>
      map.set(keys[0], -1).get(keys[1]),
  };
  for (const [name, run] of Object.entries(cases)) {
    if (name.startsWith(filter)) {
      timing[name + '/' + keys.length] = measure(run);
    }
  }
}

const values = Array.from({ length: 100000 }, (_, i) => i);
const entries = values.map((i) => [i, i]);
const stringEntries = values.map((i) => ['key' + i, i]);
const sparse = new Array(values.length);
sparse[50000] = 1;
const collidingEntries = collisionKeys(12).map((key, i) => [key, i]);
const memory = {
  'Map collisions/4096': retainedHeap(() => Map(collidingEntries), 16),
  'Map/100000': retainedHeap(() => Map(entries)),
  'Map strings/100000': retainedHeap(() => Map(stringEntries)),
  'Set/100000': retainedHeap(() => Set(values)),
  // Retain a batch to keep small, sparse results above heap-measurement noise.
  'List sparse/100000': retainedHeap(() => List(sparse), 256),
  'List/100000': retainedHeap(() => List(values)),
};
// Keep the last result observable through the end of the measurements.
if (!sink || sink.size !== values.length) {
  throw new Error('Invalid benchmark result.');
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      cpu: cpus()[0].model,
      bundle,
      samples,
      filter,
      timing,
      memory,
    },
    null,
    2
  )
);
