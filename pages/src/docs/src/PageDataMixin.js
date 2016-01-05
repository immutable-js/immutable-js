var React = require('react');

module.exports = {
  contextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  /**
   * Returns the most recent change event.
   */
  getPageData() {
    return this.context.getPageData();
  }
};
