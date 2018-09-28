var React = require('react');

var DocSearch = React.createClass({
  getInitialState() {
    return { enabled: true };
  },
  componentDidMount() {
    var script = document.createElement('script');
    var firstScript = document.getElementsByTagName('script')[0];
    script.src =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.js';
    script.addEventListener(
      'load',
      () => {
        // Initialize Algolia search.
        if (window.docsearch) {
          window.docsearch({
            apiKey: '83f61f865ef4cb682e0432410c2f7809',
            indexName: 'immutable_js',
            inputSelector: '#algolia-docsearch',
          });
        } else {
          console.warn('Search has failed to load and now is being disabled');
          this.setState({ enabled: false });
        }
      },
      false
    );
    firstScript.parentNode.insertBefore(script, firstScript);

    var link = document.createElement('link');
    var firstLink = document.getElementsByTagName('link')[0];
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.css';
    firstLink.parentNode.insertBefore(link, firstLink);
  },
  render() {
    return this.state.enabled ? (
      <div>
        <br />
        <br />
        <input id="algolia-docsearch" />
      </div>
    ) : null;
  },
});

module.exports = DocSearch;
