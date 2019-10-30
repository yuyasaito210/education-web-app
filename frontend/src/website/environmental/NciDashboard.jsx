import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Row, Col, Button } from 'react-bootstrap';

import BasicContainer from '../base/BasicContainer';
import NciDashboardParent from './NciDashboardParent';
import NciDashboardTeacher from './NciDashboardTeacher';
import NciDashboardModalUpdateMyProfile from './MyNciProfile';
import NciTechSupportModal from './NciTechSupportModal';

import imgLoader from '../../common/loader.svg';

class NciDashboardContainer extends React.Component {
  static propTypes = {
    schoolList: PropTypes.shape({
      schools: PropTypes.array
    }).isRequired,
    myAccountQuery: PropTypes.shape({
      me: PropTypes.shape({
        email: PropTypes.string,
        accountType: PropTypes.string
      })
    }).isRequired
  };

  state = {
    showMyProfile: false,
    showTechSupport: false
  };

  openMyProfile = () => this.setState({ showMyProfile: true });

  closeMyProfile = () => this.setState({ showMyProfile: false });

  openTechSupport = () => this.setState({ showTechSupport: true });

  closeTechSupport = () => this.setState({ showTechSupport: false });

  render() {
    const { myAccountQuery, schoolList } = this.props;
    const { showMyProfile, showTechSupport } = this.state;
    const { me } = myAccountQuery;
    return (
      <BasicContainer>

        {!myAccountQuery.loading && me
          ? (
            <span>
              <Row>

                <Col md={10} mdOffset={1} className="center bottom-30">

                  <h2>My NCI Dashboard</h2>

                  <Button onClick={this.openMyProfile}>
                    <FontAwesome name="edit" fixedWidth /> Edit My Profile
                  </Button>

                  {' '}

                  <Button onClick={() => this.openTechSupport()}>
                    <FontAwesome name="question-circle" fixedWidth /> Help / Support
                  </Button>

                  {' '}

                  {(me.accountType === 'EE_STAFF' || me.accountType === 'TEACHER') && (
                    <a href="/app" className="btn btn-default">
                      NCI App
                      {' '}
                      <FontAwesome name="external-link" fixedWidth />
                    </a>
                  )}

                  {' '}

                  <a className="btn btn-default" href="/logout">
                    Logout ({me.email})
                  </a>

                  {' '}

                  <NciDashboardModalUpdateMyProfile
                    showMyProfile={showMyProfile}
                    closeMyProfile={this.closeMyProfile}
                    me={me}
                  />

                  <NciTechSupportModal
                    showModal={showTechSupport}
                    handleCloseModal={this.closeTechSupport}
                  />

                </Col>
              </Row>
              <Row>
                <Col md={10} mdOffset={1}>

                  {(me.accountType === 'PARENT' || me.accountType === 'EE_STAFF') && (
                    <NciDashboardParent data={me} schoolList={schoolList} />
                  )}

                  {me.accountType === 'TEACHER' && (
                    <NciDashboardTeacher me={me} schoolList={schoolList} />
                  )}

                </Col>
              </Row>
            </span>
          )
          : (
            <Row>
              <Col md={12} className="center">
                <span>
                  <img src={imgLoader} alt="" style={{ width: 32, marginTop: 80 }} />
                  <div style={{ marginTop: 30 }}>
                    Not loading? Try <a href="/logout">logging out</a> and back in.
                  </div>
                </span>
              </Col>
            </Row>
          )
        }

      </BasicContainer>
    );
  }
}

const SCHOOL_LIST = gql`
  {
    schools {
      id
      name,
      schoolType
    }
  }`;
const MY_ACCOUNT_QUERY = gql`
  query MyAccountQuery {
    me {
      id
      name
      email
      title
      accountType
      phone
      bio
      assocSchoolList {
        id
        slug
      }
      studentSet {
        id
        name
        firstName
        lastName
        dob
        isActive
        getClassroomDisplay
        hasAllergies
        hasFoodAllergens
        allergenCount
        foodAllergenCount
        classroom
        modified
        photoWaiver
        currentSchool {
          id
          name
        }
        insuranceDependentsList {
          id
          companyName
        }
        medicalrecord {
          id
          getNonRxTypeDisplay
          nonRxType
          nonRxNotes
          lastTetanus
          noTetanusVaccine
          restrictions
          allergies
          allergiesExpanded
          foodAllergens
          recentTrauma
          dietaryNeeds
          gender
          weight
          height
          modified
          dietaryCaution
          medicationSet {
            id
            administrationTimes
            administrationTimesOther
            medicationName
            amount
            amountHuman
            amountUnit
            getAmountUnitDisplay
            notes
          }
        }
      }
      insuranceSet {
        id
        companyName
        holderName
        policyNum
        groupNum
        modified
        dependentsList {
          id
          firstName
        }
      }
    }
  }`;

const NciDashboard = compose(
  graphql(SCHOOL_LIST, { name: 'schoolList' }),
  graphql(MY_ACCOUNT_QUERY, {
    name: 'myAccountQuery',
    options: {
      pollInterval: 4000
    }
  })
)(NciDashboardContainer);

export default NciDashboard;
