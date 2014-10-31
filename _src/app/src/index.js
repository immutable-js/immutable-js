var React = require('react');
var Header = require('./Header');


var Index = React.createClass({

  render: function () {
    return (
      <div>
        <Header />
        <div className="pageBody" id="body">
          <div className="contents">
            <div dangerouslySetInnerHTML={{__html:

`<article class="markdown-body entry-content" itemprop="mainContentOfPage"><h1>
<a name="user-content-immutable-data-collections" class="anchor" href="#immutable-data-collections" aria-hidden="true"><span class="octicon octicon-link"></span></a>Immutable Data Collections</h1>

<p><strong>Converting to v3 from v2? Check out the <a href="https://github.com/facebook/immutable-js/wiki/Upgrading-to-Immutable-v3">upgrade guide</a>.</strong></p>

<p>Immutable data cannot be changed once created, leading to much simpler
application development, no defensive copying, and enabling advanced memoization
techniques.</p>

<p><code>Immutable</code> provides <code>List</code>, <code>Stack</code>, <code>Map</code>,
<code>OrderedMap</code>, and <code>Set</code> by using persistent <a href="http://en.wikipedia.org/wiki/Hash_array_mapped_trie">hash maps tries</a>
and <a href="http://hypirion.com/musings/understanding-persistent-vector-pt-1">vector tries</a>
as popularized by Clojure and Scala. They achieve efficiency on modern
JavaScript VMs by using structural sharing and minimizing the need to copy or
cache data.</p>

<p><code>Immutable</code> also provides a lazy <code>Seq</code>, allowing efficient
chaining of collection methods like <code>map</code> and <code>filter</code> without creating
intermediate representations. Create some <code>Seq</code> with <code>Range</code> and <code>Repeat</code>.</p>

<h2>
<a name="user-content-getting-started" class="anchor" href="#getting-started" aria-hidden="true"><span class="octicon octicon-link"></span></a>Getting started</h2>

<p>Install <code>immutable</code> using npm.</p>

<div class="highlight highlight-shell"><pre>npm install immutable
</pre></div>

<p>Then require it into any module.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">Immutable</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">'immutable'</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">map</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
</pre></div>

<h3>
<a name="user-content-browser" class="anchor" href="#browser" aria-hidden="true"><span class="octicon octicon-link"></span></a>Browser</h3>

<p>To use <code>immutable</code> from a browser, download <a href="https://github.com/facebook/immutable-js/blob/master/dist/immutable.min.js">dist/immutable.min.js</a>
or use a CDN such as <a href="https://cdnjs.com/libraries/immutable">CDNJS</a>
or <a href="http://www.jsdelivr.com/#!immutable.js">jsDelivr</a>.</p>

<p>Then, add it as a script tag to your page:</p>

<div class="highlight highlight-html"><pre><span class="nt">&lt;script </span><span class="na">src=</span><span class="s">"immutable.min.js"</span><span class="nt">&gt;&lt;/script&gt;</span>
<span class="nt">&lt;script&gt;</span>
    <span class="kd">var</span> <span class="nx">map</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
    <span class="nx">map</span> <span class="o">=</span> <span class="nx">map</span><span class="p">.</span><span class="nx">set</span><span class="p">(</span><span class="s1">'b'</span><span class="p">,</span> <span class="mi">20</span><span class="p">);</span>
    <span class="nx">map</span><span class="p">.</span><span class="nx">get</span><span class="p">(</span><span class="s1">'b'</span><span class="p">);</span> <span class="c1">// 20</span>
<span class="nt">&lt;/script&gt;</span>
</pre></div>

<p>Or use an AMD loader (such as <a href="http://requirejs.org/">RequireJS</a>):</p>

<div class="highlight highlight-javascript"><pre><span class="nx">require</span><span class="p">([</span><span class="s1">'./immutable.min.js'</span><span class="p">],</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">Immutable</span><span class="p">)</span> <span class="p">{</span>
    <span class="kd">var</span> <span class="nx">map</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
    <span class="nx">map</span> <span class="o">=</span> <span class="nx">map</span><span class="p">.</span><span class="nx">set</span><span class="p">(</span><span class="s1">'b'</span><span class="p">,</span> <span class="mi">20</span><span class="p">);</span>
    <span class="nx">map</span><span class="p">.</span><span class="nx">get</span><span class="p">(</span><span class="s1">'b'</span><span class="p">);</span> <span class="c1">// 20</span>
<span class="p">});</span>
</pre></div>

<p>If you're using <a href="http://browserify.org/">browserify</a>, the <code>immutable</code> npm module
also works from the browser.</p>

<h3>
<a name="user-content-typescript" class="anchor" href="#typescript" aria-hidden="true"><span class="octicon octicon-link"></span></a>TypeScript</h3>

<p>Use these Immutable collections and sequences as you would use native
collections in your <a href="http://typescriptlang.org">TypeScript</a> programs while still taking
advantage of type generics, error detection, and auto-complete in your IDE.</p>

<p>Just add a reference with a relative path to the type declarations at the top
of your file.</p>

<div class="highlight highlight-javascript"><pre><span class="c1">///&lt;reference path='./node_modules/immutable/dist/Immutable.d.ts'/&gt;</span>
<span class="kr">import</span> <span class="nx">Immutable</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">'immutable'</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">map</span><span class="o">:</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="o">&lt;</span><span class="nx">string</span><span class="p">,</span> <span class="nx">number</span><span class="o">&gt;</span><span class="p">;</span>
<span class="nx">map</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
<span class="nx">map</span> <span class="o">=</span> <span class="nx">map</span><span class="p">.</span><span class="nx">set</span><span class="p">(</span><span class="s1">'b'</span><span class="p">,</span> <span class="mi">20</span><span class="p">);</span>
<span class="nx">map</span><span class="p">.</span><span class="nx">get</span><span class="p">(</span><span class="s1">'b'</span><span class="p">);</span> <span class="c1">// 20</span>
</pre></div>

<h2>
<a name="user-content-the-case-for-immutability" class="anchor" href="#the-case-for-immutability" aria-hidden="true"><span class="octicon octicon-link"></span></a>The case for Immutability</h2>

<p>Much of what makes application development difficult is tracking mutation and
maintaining state. Developing with immutable data encourages you to think
differently about how data flows through your application.</p>

<p>Subscribing to data events throughout your application, by using
<code>Object.observe</code>, or any other mechanism, creates a huge overhead of
book-keeping which can hurt performance, sometimes dramatically, and creates
opportunities for areas of your application to get out of sync with each other
due to easy to make programmer error. Since immutable data never changes,
subscribing to changes throughout the model is a dead-end and new data can only
ever be passed from above.</p>

<p>This model of data flow aligns well with the architecture of <a href="http://facebook.github.io/react/">React</a>
and especially well with an application designed using the ideas of <a href="http://facebook.github.io/flux/docs/overview.html">Flux</a>.</p>

<p>When data is passed from above rather than being subscribed to, and you're only
interested in doing work when something has changed, you can use equality.
<code>Immutable</code> always returns itself when a mutation results in an identical
collection, allowing for using <code>===</code> equality to determine if something
has changed.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">map1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
<span class="kd">var</span> <span class="nx">map2</span> <span class="o">=</span> <span class="nx">map1</span><span class="p">.</span><span class="nx">set</span><span class="p">(</span><span class="s1">'b'</span><span class="p">,</span> <span class="mi">2</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">map1</span> <span class="o">===</span> <span class="nx">map2</span><span class="p">);</span>
</pre></div>

<p>If an object is immutable, it can be "copied" simply by making another reference
to it instead of copying the entire object. Because a reference is much smaller
than the object itself, this results in memory savings and a potential boost in
execution speed for programs which rely on copies (such as an undo-stack).</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">map1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">});</span>
<span class="kd">var</span> <span class="nx">clone</span> <span class="o">=</span> <span class="nx">map1</span><span class="p">;</span>
</pre></div>

<h2>
<a name="user-content-javascript-first-api" class="anchor" href="#javascript-first-api" aria-hidden="true"><span class="octicon octicon-link"></span></a>JavaScript-first API</h2>

<p>While <code>immutable</code> is inspired by Clojure, Scala, Haskell and other functional
programming environments, it's designed to bring these powerful concepts to
JavaScript, and therefore has an Object-Oriented API that closely mirrors that
of ES6 <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a>,
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">Map</a>, and
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set">Set</a>.</p>

<p>The difference for the immutable collections is that methods which would mutate
the collection, like <code>push</code>, <code>set</code>, <code>unshift</code> or <code>splice</code> instead return a new
immutable collection. Methods which return new arrays like <code>slice</code> or <code>concat</code>
instead return new immutable collections.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">list1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">List</span><span class="p">.</span><span class="nx">of</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">list2</span> <span class="o">=</span> <span class="nx">list1</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="mi">3</span><span class="p">,</span> <span class="mi">4</span><span class="p">,</span> <span class="mi">5</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">list3</span> <span class="o">=</span> <span class="nx">list2</span><span class="p">.</span><span class="nx">unshift</span><span class="p">(</span><span class="mi">0</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">list4</span> <span class="o">=</span> <span class="nx">list1</span><span class="p">.</span><span class="nx">concat</span><span class="p">(</span><span class="nx">list2</span><span class="p">,</span> <span class="nx">list3</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list1</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">2</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list2</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">5</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list3</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">6</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list4</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">13</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list4</span><span class="p">.</span><span class="nx">get</span><span class="p">(</span><span class="mi">0</span><span class="p">)</span> <span class="o">===</span> <span class="mi">1</span><span class="p">);</span>
</pre></div>

<p>Almost all of the methods on <code>Array</code> will be found in similar form on
<code>Immutable.List</code>, those of <code>Map</code> found on <code>Immutable.Map</code>, and those of <code>Set</code>
found on <code>Immutable.Set</code>, including collection operations like <code>forEach()</code>
and <code>map()</code>.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">alpha</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">,</span> <span class="nx">d</span><span class="o">:</span><span class="mi">4</span><span class="p">});</span>
<span class="nx">alpha</span><span class="p">.</span><span class="nx">map</span><span class="p">((</span><span class="nx">v</span><span class="p">,</span> <span class="nx">k</span><span class="p">)</span> <span class="o">=&gt;</span> <span class="nx">k</span><span class="p">.</span><span class="nx">toUpperCase</span><span class="p">()).</span><span class="nx">join</span><span class="p">();</span>
<span class="c1">// 'A,B,C,D'</span>
</pre></div>

<h3>
<a name="user-content-accepts-raw-javascript-objects" class="anchor" href="#accepts-raw-javascript-objects" aria-hidden="true"><span class="octicon octicon-link"></span></a>Accepts raw JavaScript objects.</h3>

<p>Designed to inter-operate with your existing JavaScript, <code>immutable</code>
accepts plain JavaScript Arrays and Objects anywhere a method expects an
<code>Iterable</code> with no performance penalty.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">map1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">,</span> <span class="nx">d</span><span class="o">:</span><span class="mi">4</span><span class="p">});</span>
<span class="kd">var</span> <span class="nx">map2</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">c</span><span class="o">:</span><span class="mi">10</span><span class="p">,</span> <span class="nx">a</span><span class="o">:</span><span class="mi">20</span><span class="p">,</span> <span class="nx">t</span><span class="o">:</span><span class="mi">30</span><span class="p">});</span>
<span class="kd">var</span> <span class="nx">obj</span> <span class="o">=</span> <span class="p">{</span><span class="nx">d</span><span class="o">:</span><span class="mi">100</span><span class="p">,</span> <span class="nx">o</span><span class="o">:</span><span class="mi">200</span><span class="p">,</span> <span class="nx">g</span><span class="o">:</span><span class="mi">300</span><span class="p">};</span>
<span class="kd">var</span> <span class="nx">map3</span> <span class="o">=</span> <span class="nx">map1</span><span class="p">.</span><span class="nx">merge</span><span class="p">(</span><span class="nx">map2</span><span class="p">,</span> <span class="nx">obj</span><span class="p">);</span>
<span class="c1">// Map { a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 }</span>
</pre></div>

<p>This is possible because <code>immutable</code> can treat any JavaScript Array or Object
as an Iterable. You can take advantage of this in order to get sophisticated
collection methods on JavaScript Objects, which otherwise have a very sparse
native API. Because Seq evaluates lazily and does not cache intermediate
results, these operations can be extremely efficient.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">myObject</span> <span class="o">=</span> <span class="p">{</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span><span class="nx">b</span><span class="o">:</span><span class="mi">2</span><span class="p">,</span><span class="nx">c</span><span class="o">:</span><span class="mi">3</span><span class="p">};</span>
<span class="nx">Seq</span><span class="p">(</span><span class="nx">myObject</span><span class="p">).</span><span class="nx">map</span><span class="p">(</span><span class="nx">x</span> <span class="o">=&gt;</span> <span class="nx">x</span> <span class="o">*</span> <span class="nx">x</span><span class="p">).</span><span class="nx">toObject</span><span class="p">();</span>
<span class="c1">// { a: 1, b: 4, c: 9 }</span>
</pre></div>

<h3>
<a name="user-content-converts-back-to-raw-javascript-objects" class="anchor" href="#converts-back-to-raw-javascript-objects" aria-hidden="true"><span class="octicon octicon-link"></span></a>Converts back to raw JavaScript objects.</h3>

<p>All <code>immutable</code> Iterables can be converted to plain JavaScript Arrays and
Objects shallowly with <code>toArray()</code> and <code>toObject()</code> or deeply with <code>toJS()</code>.
All Immutable Iterables also implement <code>toJSON()</code> allowing them to be passed to
<code>JSON.stringify</code> directly.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">deep</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span> <span class="nx">a</span><span class="o">:</span> <span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span> <span class="mi">2</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">List</span><span class="p">.</span><span class="nx">of</span><span class="p">(</span><span class="mi">3</span><span class="p">,</span> <span class="mi">4</span><span class="p">,</span> <span class="mi">5</span><span class="p">)</span> <span class="p">});</span>
<span class="nx">deep</span><span class="p">.</span><span class="nx">toObject</span><span class="p">()</span> <span class="c1">// { a: 1, b: 2, c: List [ 3, 4, 5 ] }</span>
<span class="nx">deep</span><span class="p">.</span><span class="nx">toArray</span><span class="p">()</span> <span class="c1">// [ 1, 2, List [ 3, 4, 5 ] ]</span>
<span class="nx">deep</span><span class="p">.</span><span class="nx">toJS</span><span class="p">()</span> <span class="c1">// { a: 1, b: 2, c: [ 3, 4, 5 ] }</span>
<span class="nx">JSON</span><span class="p">.</span><span class="nx">stringify</span><span class="p">(</span><span class="nx">deep</span><span class="p">)</span> <span class="c1">// '{"a":1,"b":2,"c":[3,4,5]}'</span>
</pre></div>

<h2>
<a name="user-content-nested-structures" class="anchor" href="#nested-structures" aria-hidden="true"><span class="octicon octicon-link"></span></a>Nested Structures</h2>

<p>The collections in <code>immutable</code> are intended to be nested, allowing for deep
trees of data, similar to JSON.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">nested</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">fromJS</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="p">{</span><span class="nx">b</span><span class="o">:</span><span class="p">{</span><span class="nx">c</span><span class="o">:</span><span class="p">[</span><span class="mi">3</span><span class="p">,</span><span class="mi">4</span><span class="p">,</span><span class="mi">5</span><span class="p">]}}});</span>
<span class="c1">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ] } } }</span>
</pre></div>

<p>A few power-tools allow for reading and operating on nested data. The
most useful are <code>mergeDeep</code>, <code>getIn</code>, <code>setIn</code>, and <code>updateIn</code>, found on <code>List</code>,
<code>Map</code> and <code>OrderedMap</code>.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">nested2</span> <span class="o">=</span> <span class="nx">nested</span><span class="p">.</span><span class="nx">mergeDeep</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="p">{</span><span class="nx">b</span><span class="o">:</span><span class="p">{</span><span class="nx">d</span><span class="o">:</span><span class="mi">6</span><span class="p">}}});</span>
<span class="c1">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 6 } } }</span>
</pre></div>

<div class="highlight highlight-javascript"><pre><span class="nx">nested2</span><span class="p">.</span><span class="nx">getIn</span><span class="p">([</span><span class="s1">'a'</span><span class="p">,</span> <span class="s1">'b'</span><span class="p">,</span> <span class="s1">'d'</span><span class="p">]);</span> <span class="c1">// 6</span>

<span class="kd">var</span> <span class="nx">nested3</span> <span class="o">=</span> <span class="nx">nested2</span><span class="p">.</span><span class="nx">updateIn</span><span class="p">([</span><span class="s1">'a'</span><span class="p">,</span> <span class="s1">'b'</span><span class="p">,</span> <span class="s1">'d'</span><span class="p">],</span> <span class="nx">value</span> <span class="o">=&gt;</span> <span class="nx">value</span> <span class="o">+</span> <span class="mi">1</span><span class="p">);</span>
<span class="c1">// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 7 } } }</span>

<span class="kd">var</span> <span class="nx">nested4</span> <span class="o">=</span> <span class="nx">nested3</span><span class="p">.</span><span class="nx">updateIn</span><span class="p">([</span><span class="s1">'a'</span><span class="p">,</span> <span class="s1">'b'</span><span class="p">,</span> <span class="s1">'c'</span><span class="p">],</span> <span class="nx">list</span> <span class="o">=&gt;</span> <span class="nx">list</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="mi">6</span><span class="p">));</span>
<span class="c1">// Map { a: Map { b: Map { c: List [ 3, 4, 5, 6 ], d: 7 } } }</span>
</pre></div>

<h2>
<a name="user-content-lazy-seq" class="anchor" href="#lazy-seq" aria-hidden="true"><span class="octicon octicon-link"></span></a>Lazy Seq</h2>

<p><code>Seq</code> describes a lazy operation, allowing them to efficiently chain
use of all the Iterable methods (such as <code>map</code> and <code>filter</code>).</p>

<p><strong>Seq is immutable</strong> — Once a Seq is created, it cannot be
changed, appended to, rearranged or otherwise modified. Instead, any mutative
method called on a Seq will return a new Seq.</p>

<p><strong>Seq is lazy</strong> — Seq does as little work as necessary to respond to any
method call.</p>

<p>For example, the following does not perform any work, because the resulting
Seq is never used:</p>

<pre><code>var oddSquares = Immutable.Sequence.of(1,2,3,4,5,6,7,8)
  .filter(x =&gt; x % 2).map(x =&gt; x * x);
</code></pre>

<p>Once the Seq is used, it performs only the work necessary. In this
example, no intermediate arrays are ever created, filter is called three times
twice, and map is only called two times:</p>

<pre><code>console.log(oddSquares.get(1)); // 9
</code></pre>

<p>Any collection can be converted to a lazy Seq with <code>.toSeq()</code>.</p>

<pre><code>var seq = Immutable.Map({a:1, b:1, c:1}).toSeq();
</code></pre>

<p>Seq allow for the efficient chaining of sequence operations, especially when
converting to a different concrete type (such as to a JS object):</p>

<pre><code>seq.flip().map(key =&gt; key.toUpperCase()).flip().toObject();
// Map { A: 1, B: 1, C: 1 }
</code></pre>

<p>As well as expressing logic that would otherwise seem memory-limited:</p>

<pre><code>Immutable.Range(1, Infinity)
  .skip(1000)
  .map(n =&gt; -n)
  .filter(n =&gt; n % 2 === 0)
  .take(2)
  .reduce((r, n) =&gt; r * n, 1);
// 1006008
</code></pre>

<p>Note: An iterable is always iterated in the same order, however that order may
not always be well defined, as is the case for the <code>Map</code>.</p>

<h2>
<a name="user-content-equality-treats-collections-as-data" class="anchor" href="#equality-treats-collections-as-data" aria-hidden="true"><span class="octicon octicon-link"></span></a>Equality treats Collections as Data</h2>

<p><code>Immutable</code> provides equality which treats immutable data structures as pure
data, performing a deep equality check if necessary.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">map1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">1</span><span class="p">});</span>
<span class="kd">var</span> <span class="nx">map2</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">Map</span><span class="p">({</span><span class="nx">a</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">b</span><span class="o">:</span><span class="mi">1</span><span class="p">,</span> <span class="nx">c</span><span class="o">:</span><span class="mi">1</span><span class="p">});</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">map1</span> <span class="o">!==</span> <span class="nx">map2</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">Immutable</span><span class="p">.</span><span class="nx">is</span><span class="p">(</span><span class="nx">map1</span><span class="p">,</span> <span class="nx">map2</span><span class="p">)</span> <span class="o">===</span> <span class="kc">true</span><span class="p">);</span>
</pre></div>

<p><code>Immutable.is()</code> uses the same measure of equality as <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is">Object.is</a>
including if both are immutable and all keys and values are equal
using the same measure of equality.</p>

<h2>
<a name="user-content-batching-mutations" class="anchor" href="#batching-mutations" aria-hidden="true"><span class="octicon octicon-link"></span></a>Batching Mutations</h2>

<blockquote>
<p>If a tree falls in the woods, does it make a sound?</p>

<p>If a pure function mutates some local data in order to produce an immutable
return value, is that ok?</p>

<p>— Rich Hickey, Clojure</p>
</blockquote>

<p>Applying a mutation to create a new immutable object results in some overhead,
which can add up to a performance penalty. If you need to apply a series of
mutations locally before returning, <code>Immutable</code> gives you the ability to create
a temporary mutable (transient) copy of a collection and apply a batch of
mutations in a performant manner by using <code>withMutations</code>. In fact, this is
exactly how  <code>Immutable</code> applies complex mutations itself.</p>

<p>As an example, building <code>list2</code> results in the creation of 1, not 3, new
immutable Lists.</p>

<div class="highlight highlight-javascript"><pre><span class="kd">var</span> <span class="nx">list1</span> <span class="o">=</span> <span class="nx">Immutable</span><span class="p">.</span><span class="nx">List</span><span class="p">.</span><span class="nx">of</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span><span class="mi">2</span><span class="p">,</span><span class="mi">3</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">list2</span> <span class="o">=</span> <span class="nx">list1</span><span class="p">.</span><span class="nx">withMutations</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">list</span><span class="p">)</span> <span class="p">{</span>
  <span class="nx">list</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="mi">4</span><span class="p">).</span><span class="nx">push</span><span class="p">(</span><span class="mi">5</span><span class="p">).</span><span class="nx">push</span><span class="p">(</span><span class="mi">6</span><span class="p">);</span>
<span class="p">});</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list1</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">3</span><span class="p">);</span>
<span class="nx">assert</span><span class="p">(</span><span class="nx">list2</span><span class="p">.</span><span class="nx">size</span> <span class="o">===</span> <span class="mi">6</span><span class="p">);</span>
</pre></div>

<p>Note: <code>immutable</code> also provides <code>asMutable</code> and <code>asImmutable</code>, but only
encourages their use when <code>withMutations</code> will not suffice. Use caution to not
return a mutable copy, which could result in undesired behavior.</p>

<h2>
<a name="user-content-api-documentation" class="anchor" href="#api-documentation" aria-hidden="true"><span class="octicon octicon-link"></span></a>API Documentation</h2>

<p>All documentation is contained within the type definition file, <a href="https://github.com/facebook/immutable-js/blob/master/type-definitions/Immutable.d.ts">Immutable.d.ts</a>.</p>

<h2>
<a name="user-content-contribution" class="anchor" href="#contribution" aria-hidden="true"><span class="octicon octicon-link"></span></a>Contribution</h2>

<p>Use <a href="https://github.com/facebook/immutable-js/issues">Github issues</a> for requests.</p>

<p>We actively welcome pull requests, learn how to <a href="https://github.com/facebook/immutable-js/blob/master/CONTRIBUTING.md">contribute</a>.</p>

<h2>
<a name="user-content-thanks" class="anchor" href="#thanks" aria-hidden="true"><span class="octicon octicon-link"></span></a>Thanks</h2>

<p><a href="https://github.com/hughfdjackson/">Hugh Jackson</a>, for providing the npm package
name. If you're looking for his unsupported package, see <a href="https://www.npmjs.org/package/immutable/1.4.1">v1.4.1</a>.</p>

<p><a href="https://www.youtube.com/watch?v=K2NYwP90bNs">Phil Bagwell</a>, for his inspiration
and research in persistent data structures.</p>

<h2>
<a name="user-content-license" class="anchor" href="#license" aria-hidden="true"><span class="octicon octicon-link"></span></a>License</h2>

<p><code>Immutable</code> is <a href="https://github.com/facebook/immutable-js/blob/master/LICENSE">BSD-licensed</a>. We also provide an additional <a href="https://github.com/facebook/immutable-js/blob/master/PATENTS">patent grant</a>.</p>
</article>`


            }} />
          </div>
        </div>
      </div>
    );
  }
});


module.exports = Index;
