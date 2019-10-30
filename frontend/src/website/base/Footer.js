// import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
// import gql from 'graphql-tag';
// import { graphql } from 'react-apollo';
import { Row, Col } from 'react-bootstrap';

// import NavLink from './NavLink';

Footer.propTypes = {
  recentParentsCornerPosts: PropTypes.shape({
    loading: PropTypes.bool,
    posts: PropTypes.array,
    events: PropTypes.array
  })
};

Footer.defaultProps = {
  recentParentsCornerPosts: {
    loading: true,
    posts: [],
    events: []
  }
};

export default function Footer(props) {
  return (
    <div className="container footer-container">


      {/* }<Row>

        <Col md={3} mdOffset={1}>

          <h4>Latest Parents Corner Updates</h4>

          <ul className="footer-list">
            {props.recentParentsCornerPosts.posts &&
              _.map(props.recentParentsCornerPosts.posts, post => (
                <li key={post.id}>
                  <NavLink to={post.getAbsoluteUrl}>{post.title}</NavLink>
                </li>
              ))
            }
          </ul>

        </Col>

        <Col md={3}>

          <h4>Upcoming Events</h4>

          <ul className="footer-list">
            {props.recentParentsCornerPosts.events &&
              _.map(props.recentParentsCornerPosts.events, event => (
                <li key={event.id}>
                  <NavLink to={event.getAbsoluteUrl}>{event.title}</NavLink>
                </li>
              ))
            }
          </ul>

        </Col>

        <Col md={4}>
          <h4>About Nature&apos;s Classroom</h4>
          <p>Nature's Classroom Institute is the nation's premier environmental
          education program. It offers a fully customized, highly engaging experience that has
          direct positive impacts on classroom community and academic performance. With
          thousands of classes and activities to choose from, every student and teacher
          receives a unique and individualized experience.</p>
        </Col>

      </Row> */}

      <Row>
        <Col md={12} className="top-20">
          <p className="center">
            Learning through experience. Growing through expression.
            <a
              href="https://www.facebook.com/NaturesClassroomMontessori"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 15, color: '#5bb3ff' }}
            >
              <FontAwesome name="thumbs-o-up" fixedWidth /> Like us on Facebook
            </a>
            &nbsp;&nbsp;
            <a
              href="https://www.instagram.com/naturesclassroominstitute/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 15, color: '#5bb3ff' }}
            >
              <FontAwesome name="instagram" fixedWidth /> Follow us on Instagram
            </a>
          </p>
        </Col>
      </Row>

    </div>
  );
}

// const RECENT_PARENTS_CORNER_POSTS_QUERY = gql`
//   query RecentParentsCornerPosts {
//     posts(limit: 6) {
//       id
//       title
//       slug
//       publishDate
//       getAbsoluteUrl
//     },
//     events(limit: 6) {
//       id
//       title
//       slug
//       isFeatured
//       getAbsoluteUrl
//     }
//   }
// `;

// export default graphql(RECENT_PARENTS_CORNER_POSTS_QUERY, { name: 'recentParentsCornerPosts' })(Footer);
