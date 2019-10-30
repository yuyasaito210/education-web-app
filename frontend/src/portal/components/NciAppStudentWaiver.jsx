import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Moment from 'react-moment';
import { graphql } from 'react-apollo';
import { Grid, Row, Col } from 'react-bootstrap';

class NciAppStudentWaiver extends React.Component {

  static propTypes = {
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,
    data: PropTypes.shape({
      loading: PropTypes.bool,
      student: PropTypes.shape({
        name: PropTypes.string,
        dob: PropTypes.string,
        guardianList: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            email: PropTypes.string,
            phone: PropTypes.string
          })
        )
      })
    }).isRequired
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  render() {
    const student = !this.props.data.loading && this.props.data.student;
    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            <h1 style={{ color: '#8c8c8c', fontSize: '1.6em' }}>Emergency Medical Authorization, Youth Waiver & Release of Liability Section</h1>
            <h2 className="waiver-header">{student.name}</h2>

            <p>In consideration of being allowed to participate in any way in Nature’s Classroom Institute Environmental Education, Inc. related events and activities, the undersigned:</p>

            <ol className="waiver-ol">

              <li>Agree that the parent(s) and/or legal guardian(s) of the participant have the right to inspect the facilities and equipment to be used, and if the parent or guardian believes anything is unsafe, he or she should immediately advise supervisor (advisor, manager, etc.) of such condition(s) and refuse to participate.</li>

              <li>Acknowledge and fully understand that each member/participant will be engaging in activities that involve risk of injury, which might result not only from their own actions, inactions, or negligence but the action, inaction, and negligence of others, or the condition of the premises or of any equipment used. Further, that there may be other risks not known to us or not reasonably foreseeable at this time.</li>

              <li>Release, waive, discharge and covenant not to sue Nature’s Classroom Institute Environmental Education, Inc. its affiliated host sites, their respective administrators, directors, agents, and other employees of the organization, other members/participants, sponsoring agencies, sponsors, advertisers, and if applicable, owners and lessors or premises used in WI- Lake Geneva Youth Camp, TX- Stoney Creek Ranch, TX-Green Family Camp, and CA- Mt Cross Retreat Center, CA- Alpine Meadows Retreat Center, to conduct the event, all of which are hereinafter referred to as “releases,” from any and all liability to each of the undersigned, his or her heirs and next of kin for any and all claims, demands, losses, or damages on account of injury, damage to property, caused or alleged to be caused in whole or in part by the negligence of the releases or otherwise.</li>

              <li>All photos taken by Nature’s Classroom Institute can be potentially used in advertising and marketing. No child will be identified by name without the permission of the legal guardian and the Child's participating school.</li>

            </ol>

            <p style={{ margin: '20px 0' }}><strong>We, the undersigned, authorize and direct a physician on the medical staff at the Hospital used by Nature’s Classroom Institute Environmental Education, Inc. to treat and render medical service to our child listed below:</strong></p>

            <p style={{ marginBottom: 20 }}>I HAVE READ THE ABOVE MEDICAL AUTHORIZATION, WAIVER AND RELEASE, AND UNDERSTAND MY RIGHTS BY SIGNING IT AND SIGN IT VOLUNTARILY.</p>

            {student &&
              <span className="waiver-footer">
              <p>Date: <span className="date-line"><Moment format="L" /></span></p>
              <p>Signed: <span className="sig-line">{student.guardianList[0].name}</span>
                <br />Phone: <span className="phone-line">{student.guardianList[0].phone}</span>
                <br />Email: <span className="email-line">{student.guardianList[0].email}</span>
                <br />Relationship to student: <span className="sig-line">Parent/Guardian</span>
              </p>
              </span>
            }
          </Col>
        </Row>
      </Grid>
    );
  }
}

const STUDENT_QUERY = gql`
  query FoobarQuery($id: Int!) {
    student(id: $id) {
      id
      name
      dob
      guardianList {
        id
        name
        email
        phone
      }
    }
  }`;

export default graphql(STUDENT_QUERY, {
  options: ownProps => ({
    variables: {
      id: ownProps.params.id
    }
  })
})(NciAppStudentWaiver);
