import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
// import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';

class NciAppGuardianDetailContainer extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool,
      guardian: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    }).isRequired
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  render() {
    const guardian = this.props.data.guardian && this.props.data.guardian;
    return (
      <div className="nciapp-fieldtrip-detail">
        {this.props.data.loading
          ? <span>Loading Parent/guardian details...</span>
          : <span>

            <div className="nci-navbar-header">
              <div className="nci-navbar-header-back">
                <button onClick={() => window.history.back()} style={{ background: 'none', padding: 0, border: 'none' }}>
                  <FontAwesome name="chevron-left" fixedWidth />{' '}Back
                </button>
              </div>
              <div className="nci-navbar-header-title">
                <h2>Parent / Guardian Profile</h2>
              </div>
              <div className="nci-navbar-header-share">
                {/* <a href=""><FontAwesome name="share-square-o" fixedWidth /></a> */}
              </div>
            </div>

            <div className="student-profile-header">
              <div className="profile-photo-fa">
                <FontAwesome name="user-circle" />
              </div>
              <h2>{guardian.name}</h2>
              <p style={{ marginBottom: 10 }}>
                  {guardian.assocSchoolList[0].name}
                  {' '}
                  <FontAwesome name="arrow-circle-right" />
              </p>
            </div>

            <ul className="display-list">
              <li>Email <span className="pull-right">{guardian.email}</span></li>
              <li>Phone <span className="pull-right"><a href="tel:{guardian.phone}">{guardian.phone}</a></span></li>
            </ul>

            <div style={{ marginBottom: 7, fontWeight: 'bold', fontSize: '1.1em', padding: 10, background: '#b33e92', color: 'white' }}>
              Children
            </div>

            <ul className="display-list">
              {_.map(guardian.studentSet, student => (
                <li key={student.id}>
                  <Link to={`/app/student/${student.id}`}>{student.name}</Link>
                  <span className="pull-right">
                    {student.hasAllergies === 'true' && <FontAwesome name="exclamation-triangle" style={{ color: '#FECB2F', marginRight: 10 }} />}
                    <FontAwesome name="chevron-right" style={{ color: '#cccccc' }} />
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ marginBottom: 7, fontWeight: 'bold', fontSize: '1.1em', padding: 10, background: '#b33e92', color: 'white' }}>
              Health Insurance
            </div>

            {guardian.insuranceSet.length > 0 ?
              <ul className="display-list">
                <li>Provider <span className="pull-right">{guardian.insuranceSet[0].companyName}</span></li>
                <li>Group # <span className="pull-right">{guardian.insuranceSet[0].groupNum}</span></li>
                <li>Policy # <span className="pull-right">{guardian.insuranceSet[0].policyNum}</span></li>
                <li>Policy Holder <span className="pull-right">{guardian.insuranceSet[0].holderName}</span></li>
              </ul>
              : <ul className="display-list">
                <li style={{ color: '#BC5D5E' }}>
                  Missing Insurance Information
                  <span className="pull-right">
                    <FontAwesome name="exclamation-triangle" style={{ color: '#FECB2F', marginRight: 10 }} />
                  </span>
                </li>
              </ul>
            }

            <div style={{ marginBottom: 7, fontWeight: 'bold', fontSize: '1.1em', padding: 10, background: '#b33e92', color: 'white' }}>
              NCI Account Details
            </div>

            <ul className="display-list">
              <li>Date joined <span className="pull-right"><Moment date={guardian.dateJoined} format="L" /></span></li>
              <li>Last login  <span className="pull-right"><Moment date={guardian.lastLogin} format="L @ h:mm a" /></span></li>
              {/* <li><a href="#">Reset Password</a> <span className="pull-right"><FontAwesome name="chevron-right" style={{ color: '#cccccc' }} /></span></li>
              <li><a href="#">Deactivate Account</a> <span className="pull-right"><FontAwesome name="chevron-right" style={{ color: '#cccccc' }} /></span></li> */}
            </ul>


          </span>
        }
      </div>
    );
  }
}

const GUARDIAN_DETAIL = gql`
  query GuardianDetail($id: Int!) {
    guardian(id: $id) {
      id
      name
      email
      phone
      dateJoined
      lastLogin
      title
      insuranceSet {
        id
        companyName
        groupNum
        policyNum
        holderName
      }
      assocSchoolList {
        id
        name
      }
      studentSet {
        id
        name
        hasAllergies
      }
    }
  }`;

const NciAppGuardianDetail = compose(
  graphql(GUARDIAN_DETAIL, {
    options: ownProps => ({
      pollInterval: 2000,
      variables: {
        id: ownProps.params.id
      }
    })
  }),
  // graphql(CHECK_IN_MEDICATION, { name: 'checkInMedication' }),
)(NciAppGuardianDetailContainer);

export default NciAppGuardianDetail;
