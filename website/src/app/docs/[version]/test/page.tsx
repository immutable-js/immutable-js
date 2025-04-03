import prism from 'prismjs';
import JSRepl from '../../../../JSRepl/JSRepl';
import { SideBar } from '../../../../Sidebar';
import { getSidebarLinks } from '../../../../getSidebarLinks';
import { getTypeDefs } from '../../../../static/getTypeDefs';
import { getVersions } from '../../../../static/getVersions';
import { getVersionFromParams } from '../../../getVersionFromParams';

export async function generateStaticParams() {
  return [...getVersions().map((version) => ({ version }))];
}

function Doc({ content }: { content: string }) {
  // return <Editor defaultValue={content} />;

  const html = prism.highlight(
    content,
    prism.languages.javascript,
    'javascript'
  );

  return (
    // <code className="codeBlock memberSignature">
    <code
      className="codeBlock memberSignature"
      dangerouslySetInnerHTML={{ __html: html }}
    />

    // </code>
  );

  // return (
  //   <Sandpack
  //     template="vanilla-ts"
  //     options={{
  //       // DISPLAY ONY THE code
  //       layout: 'code',
  //       // editorWidthPercentage: 100,
  //       editorHeight: '52px',

  //       readOnly: true,
  //       showReadOnly: false,

  //       // skipEval: true,
  //     }}
  //     // customTheme={{
  //     //   activeLine: { background: 'transparent' }, // Remove active line style
  //     // }}
  //     files={{
  //       'index.ts': content,
  //     }}
  //   />
  // );
}

export default function Test({ params }: { params: { version: string } }) {
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);
  const sidebarLinks = getSidebarLinks(defs);

  return (
    <>
      <SideBar links={sidebarLinks} />

      <div key="Overview" className="docContents">
        <h3 className="groupTitle">Construction</h3>

        <div className="interfaceMember" id="List()">
          <h4 className="memberLabel">
            <a href="/docs/v4.3.5/List/#List()">List()</a>
          </h4>
          <div className="detail">
            <div className="markdown docSynopsis">
              <p>
                Create a new immutable List containing the values of the
                provided collection-like.
              </p>
            </div>

            <Doc content="List<T>(collection?: Iterable<T> | ArrayLike<T>): List<T>" />
            <JSRepl defaultValue={`List([ 'apple', 'banana', 'coconut' ])`} />

            <section>
              <h4 className="infoHeader">Discussion</h4>
              <div className="markdown discussion">
                <p>
                  Note:
                  <code>
                    <a href="/docs/v4.3.5/List">List</a>
                  </code>
                  is a factory function and not a class, and does not use the
                  <code>
                    <span className="token keyword">new</span>
                  </code>
                  keyword during construction.
                </p>
              </div>
            </section>

            <h2>Devtools !</h2>
            <Doc content="push(...values: Array<T>): List<T>" />

            <JSRepl
              defaultValue={`List([ 'apple', 'banana', 'coconut' ]).push('dragonfruit')`}
            />

            {/* <h2>Sandpack</h2>
            <SandpackTest
              needImports={['List', 'Set']}
              content={`export const emptyList = List()
// List []

const plainArray = [ 1, 2, 3, 4 ]
export const listFromPlainArray = List(plainArray)
// List [ 1, 2, 3, 4 ]

const plainSet = Set([ 1, 2, 3, 4 ])
export const listFromPlainSet = List(plainSet)
// List [ 1, 2, 3, 4 ]

const arrayIterator = plainArray[Symbol.iterator]()
export const listFromCollectionArray = List(arrayIterator)
// List [ 1, 2, 3, 4 ]

listFromPlainArray.equals(listFromCollectionArray) // true
listFromPlainSet.equals(listFromCollectionArray) // true
listFromPlainSet.equals(listFromPlainArray) // true`}
            />
          </div>

          <h2>Sandpack !</h2>
          <div className="interfaceMember" id="push()">
            <h4 className="memberLabel">
              <a href="/docs/v4.3.5/List/#push()">push()</a>
            </h4>
            <div className="detail">
              <div className="markdown docSynopsis">
                <p>
                  Returns a new List with the provided{' '}
                  <code>
                    <span className="t param">values</span>
                  </code>{' '}
                  appended, starting at this List's{' '}
                  <code>
                    <a href="/docs/v4.3.5/List#size">size</a>
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>
          <Doc content="push(...values: Array<T>): List<T>" />
          <SandpackTest
            needImports={['List']}
            content={`export default List([ 1, 2, 3, 4 ])
  .push(5)`}
          /> */}
          </div>
        </div>
      </div>
    </>
  );
}
