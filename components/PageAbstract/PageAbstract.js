import PropTypes from 'prop-types'
import React from 'react';

/**
 * The Abstract Component other Pages will extend from
 * @prop setCurrentPage {Function} - updates the Landing Page about the current page
 * @prop pageKey {String} - page key of the current page
 */
class PageAbstract extends React.Component {

    constructor (props) {
        super(props);

    }

    /**
     * When this components mounts it sets the currentPage key to the given pageKey
     */
    componentWillMount() {
        const {setCurrentPage, pageKey} = this.props;

        try{
            setCurrentPage(pageKey);
        } catch(e) {
            console.log(e);
        }
    }

}

export default PageAbstract;

PageAbstract.propTypes = {
  pageKey: PropTypes.any.isRequired,
  setCurrentPage: PropTypes.any.isRequired
}