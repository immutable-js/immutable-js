import { SideBar } from '@/Sidebar';
import { DocSearch } from '@/DocSearch';
import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getVersions } from '../../../static/getVersions';

export default async function VersionLayout(props: {
  children: React.ReactNode;
  params: Promise<{ version: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const versions = getVersions();

  const version = 'v5';

  // TODO get the real links from the file list
  const sidebarLinks = [
    { label: 'List', url: `/docs/${version}/List` },
    { label: 'Map', url: `/docs/${version}/Map` },
    { label: 'OrderedMap', url: `/docs/${version}/OrdererMap` },
    { label: 'Set', url: `/docs/${version}/Set` },
    { label: 'OrderedSet', url: `/docs/${version}/OrderedSet` },
    { label: 'Stack', url: `/docs/${version}/Stack` },
    { label: 'Range()', url: `/docs/${version}/Range()` },
    { label: 'Repeat()', url: `/docs/${version}/Repeat()` },
    { label: 'Record', url: `/docs/${version}/Record` }, // TODO
    { label: 'Record.Factory', url: `/docs/${version}/Record.Factory` },
    { label: 'Seq', url: `/docs/${version}/Seq` }, // TODO
    { label: 'Seq.Keyed', url: `/docs/${version}/Seq.Keyed` }, // TODO
    { label: 'Seq.Indexed', url: `/docs/${version}/Seq.Indexed` }, // TODO
    { label: 'Seq.Set', url: `/docs/${version}/Seq.Set` }, // TODO
    { label: 'Collection', url: `/docs/${version}/Collection` }, // TODO
    { label: 'Collection.Keyed', url: `/docs/${version}/Collection.Keyed` }, // TODO
    { label: 'Collection.Indexed', url: `/docs/${version}/Collection.Indexed` }, // TODO
    { label: 'Collection.Set', url: `/docs/${version}/Collection.Set` }, // TODO
    { label: 'ValueObject', url: `/docs/${version}/ValueObject` },
    { label: 'OrderedCollection', url: `/docs/${version}/OrderedCollection` },

    // functions
    { label: 'fromJS()', url: `/docs/${version}/fromJS()` },
    { label: 'is()', url: `/docs/${version}/is()` },
    { label: 'hash()', url: `/docs/${version}/hash()` }, // TODO
    { label: 'isImmutable()', url: `/docs/${version}/isImmutable()` }, // TODO
    { label: 'isCollection()', url: `/docs/${version}/isCollection()` }, // TODO
    { label: 'isKeyed()', url: `/docs/${version}/isKeyed()` }, // TODO
    { label: 'isIndexed()', url: `/docs/${version}/isIndexed()` }, // TODO
    { label: 'isAssociative()', url: `/docs/${version}/isAssociative()` }, // TODO
    { label: 'isOrdered()', url: `/docs/${version}/isOrdered()` }, // TODO
    { label: 'isValueObject()', url: `/docs/${version}/isValueObject()` }, // TODO
    { label: 'isSeq()', url: `/docs/${version}/isSeq()` }, // TODO
    { label: 'isList()', url: `/docs/${version}/isList()` }, // TODO
    { label: 'isMap()', url: `/docs/${version}/isMap()` }, // TODO
    { label: 'isOrderedMap()', url: `/docs/${version}/isOrderedMap()` }, // TODO
    { label: 'isStack()', url: `/docs/${version}/isStack()` }, // TODO
    { label: 'isSet()', url: `/docs/${version}/isSet()` }, // TODO
    { label: 'isOrderedSet()', url: `/docs/${version}/isOrderedSet()` }, // TODO
    { label: 'isRecord()', url: `/docs/${version}/isRecord()` }, // TODO
    { label: 'get()', url: `/docs/${version}/get()` }, // TODO
    { label: 'has()', url: `/docs/${version}/has()` }, // TODO
    { label: 'remove()', url: `/docs/${version}/remove()` }, // TODO
    { label: 'set()', url: `/docs/${version}/set()` }, // TODO
    { label: 'update()', url: `/docs/${version}/update()` }, // TODO
    { label: 'getIn()', url: `/docs/${version}/getIn()` }, // TODO
    { label: 'hasIn()', url: `/docs/${version}/hasIn()` }, // TODO
    { label: 'removeIn()', url: `/docs/${version}/removeIn()` }, // TODO
    { label: 'setIn()', url: `/docs/${version}/setIn()` }, // TODO
    { label: 'updateIn()', url: `/docs/${version}/updateIn()` }, // TODO
    { label: 'merge()', url: `/docs/${version}/merge()` }, // TODO
    { label: 'mergeWith()', url: `/docs/${version}/mergeWith()` }, // TODO
    { label: 'mergeDeep()', url: `/docs/${version}/mergeDeep()` },
    { label: 'mergeDeepWith()', url: `/docs/${version}/mergeDeepWith()` },
  ];

  return (
    <div>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">
          <SideBar links={sidebarLinks} />

          <div className="docContents">
            <DocSearch />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
