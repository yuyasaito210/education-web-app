import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Button, Row, Col } from 'react-bootstrap';

import BasicContainer from '../../website/base/BasicContainer';

class ApprovalRequestContainer extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      token: PropTypes.string,
      school: PropTypes.string
    }).isRequired,
    approvalRequest: PropTypes.shape({
      loading: PropTypes.bool,
      account: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        email: PropTypes.string,
        assocSchoolList: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
          guid: PropTypes.string,
          schooladdressSet: PropTypes.shape({
            id: PropTypes.number,
            streetAddress: PropTypes.string
          })
        })
      })
    }).isRequired
  }

  handleApprove = () => {
    console.log('handleApprove!');
    const i = this;

    this.props.approveTeacher({
      variables: {
        token: i.props.params.token,
        school: i.props.params.school
      }
    })
      .then(({ data }) => {
        console.log('approveTeacher data @@@@@@@@@@', data);
      }).catch((error) => {
        i.setState({ err: 'Unable to approve teacher at this time.' });
        // console.log('error @@@@@@@@@@', error);
      });
  }

  handleReject = () => {
    console.log('handleReject!');
  }

  render() {
    console.log('ApprovalRequestContainer props @@@@', this.props);
    console.log('ApprovalRequestContainer state @@@@', this.state);

    const user = this.props.approvalRequest.approvalRequest &&
      this.props.approvalRequest.approvalRequest;

    const school = user &&
      _.find(user.assocSchoolList, { guid: this.props.params.school });

    return (
      <BasicContainer>
        <Row className="sans-block">
          {user &&
            <Col md={6} mdOffset={3}>

              <h1>Teacher Approval Request</h1>

              <p>The following Teacher just created an account that requires your approval because their email address was not found on their schools email white list.</p>

              <hr />
              <Row>
                <Col md={10}>
                  <FontAwesome name="user" style={{ fontSize: '3em', float: 'left' }} />
                  <ul style={{ listStyleType: 'none' }}>
                    <li><strong>{user.name}</strong></li>
                    <li><a href={`mailto:${user.email}`}>{user.email}</a></li>
                    {user.phone && <li>{user.phone}</li>}
                  </ul>
                  <ul style={{ marginTop: 20, listStyleType: 'none' }}>
                    <li style={{ marginBottom: 5 }}>Requesting access to:</li>
                    <li><strong>{school.name}</strong></li>
                    <li>{school.schooladdressSet[0].streetAddress}</li>
                    {school.phone && <li style={{ marginTop: 15 }}>Phone: {school.phone}</li>}
                  </ul>
                </Col>
              </Row>
              <hr />

              <p style={{ marginTop: 20 }}>Once active, they will be able to sign into their NCI Dashboard and manage their student records.</p>

              <p style={{ marginBottom: 20 }}>If you question the authenticity of this request, do not hesitate to contact the school directly and ask if it is OK for this teacher to have access.</p>

              <Button bsStyle="success" onClick={this.handleApprove}>Approve</Button>{' '}
              <Button bsStyle="danger" onClick={this.handleReject}>Reject</Button>

            </Col>
          }
        </Row>
      </BasicContainer>
    );
  }
}

const APPROVAL_REQUEST = gql`
  query ApprovalRequest($token: String!, $school: String!) {
    approvalRequest(
      token: $token
      school: $school
    ) {
      id
      name
      email
      phone
      isActive
      assocSchoolList {
        id
        name
        phone
        guid
        schooladdressSet {
          id
          streetAddress
        }
      }
    }
  }`;

const APPROVE_TEACHER = gql`
  mutation ApproveTeacher($token: String!, $school: String!) {
    approveTeacher(
      token: $token
      school: $school
    ) {
      account {
        id
        name
        email
        isActive
      }
    }
  }`;

const ApprovalRequest = compose(
  graphql(APPROVAL_REQUEST, {
    name: 'approvalRequest',
    options: ownProps => ({
      variables: {
        token: ownProps.params.token,
        school: ownProps.params.school
      }
    })
  }),
  graphql(APPROVE_TEACHER, { name: 'approveTeacher' })
)(ApprovalRequestContainer);

export default ApprovalRequest;
