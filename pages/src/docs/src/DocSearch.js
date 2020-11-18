import React, { Component } from 'react';

class DocSearch extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      enabled: true,
    };
  }

  componentDidMount() {
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.src =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.js';
    script.addEventListener(
      'load',
      () => {
        // Initialize Algolia search - unless we are pre-rendering.
        if (typeof document !== 'undefined' && window.docsearch) {
          window.docsearch({
            apiKey: '83f61f865ef4cb682e0432410c2f7809',
            indexName: 'immutable_js',
            inputSelector: '#algolia-docsearch',
          });
        } else {
          this.setState({ enabled: false });
        }
      },
      false
    );
    firstScript.parentNode.insertBefore(script, firstScript);

    const link = document.createElement('link');
    const firstLink = document.getElementsByTagName('link')[0];
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.css';
    firstLink.parentNode.insertBefore(link, firstLink);
  }

  render() {
    return this.state.enabled ? (
      <input
        id="algolia-docsearch"
        className="docSearch"
        type="search"
        placeholder="Search Immutable.js Documentation"
      />
    ) : null;
  }
}

export default DocSearch;
