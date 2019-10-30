import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
// import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';

class NciAppFieldTripMedLogContainer extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      fieldtrip: PropTypes.object
    }).isRequired
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  render() {
    const fieldtrip = this.props.data.fieldtrip &&
      this.props.data.fieldtrip;

    const studentListBySchool = fieldtrip &&
      _(fieldtrip.studentList).groupBy(e => e.currentSchool.name).map(
        (value, key) => ({ name: key, students: value })
      ).value();

    return (
      <div className="nciapp-fieldtrip-detail">
        {this.props.data.loading
          ? <span>Loading field trip details...</span>
          : <span>

            <div className="nci-navbar-header" style={{ position: 'fixed', zIndex: 999 }}>
              <div className="nci-navbar-header-back">
                <button type="button" onClick={() => { window.history.back(); }} className="btn-nostyle">
                  <FontAwesome name="chevron-left" fixedWidth /> Back
                </button>
              </div>
              <div className="nci-navbar-header-title">
                <h2>Dietary Overview</h2>
                <p>{fieldtrip.getWeekName} (<span style={{ textTransform: 'uppercase' }}><Moment date={fieldtrip.startDate} format="MMM D" /></span>-<Moment date={fieldtrip.endDate} format="Do\, YYYY" />)</p>
              </div>
              <div className="nci-navbar-header-share">
                {/* <a href=""><FontAwesome name="share-square-o" fixedWidth /></a> */}
              </div>
            </div>

            <div className="student-list-by-school" style={{ position: 'relative', top: 63 }}>
              <ul className="item-list">
                {_.map(studentListBySchool, school => (
                  <ul key={school.name} className="item-list">
                    <li className="header">
                      {school.name}
                      <div className="pull-right">
                        <span className="header-badge"><FontAwesome name="user" />{school.students.length}</span>
                        {/* <FontAwesome name="chevron-right" style={{ marginLeft: 10, color: '#BDE5D2' }} /> */}
                      </div>
                    </li>
                    {_.map(_.sortBy(school.students, 'lastName'), student => (
                      student.hasDietaryRestriction &&
                        <li key={student.id}>
                          <div className="pull-right">
                            {student.hasAllergies === 'true' && <FontAwesome name="exclamation-triangle" style={{ color: '#FECB2F', marginRight: 10 }} />}
                            <FontAwesome name="chevron-right" style={{ color: '#cccccc' }} />
                          </div>
                          <Link to={`/app/student/${student.id}`}>{student.name}</Link>

                          <div style={{ marginTop: 8, marginLeft: 10, color: '#d78a43', fontSize: '0.9em' }}>{student.medicalrecord && student.medicalrecord.getFoodAllergensDisplay}</div>
                          <div style={{ fontSize: '0.8em', marginTop: 3, marginLeft: 10, paddingLeft: 10, marginRight: 40, borderLeft: '3px solid #ffa450', color: '#606060' }}>{student.medicalrecord && student.medicalrecord.dietaryNeeds}</div>

                          {student.medicalrecord && student.medicalrecord.restrictions && <div style={{ marginTop: 8, marginLeft: 10, color: '#ff5050', fontSize: '0.9em' }}>Restrictions</div>}
                          <div style={{ fontSize: '0.8em', marginTop: 3, marginLeft: 10, paddingLeft: 10, marginRight: 40, borderLeft: '3px solid #ff5050', color: '#606060' }}>{student.medicalrecord && student.medicalrecord.restrictions}</div>
                        </li>
                    ))}
                  </ul>
                ))}
              </ul>
            </div>
          </span>
        }
      </div>
    );
  }
}

const FIELD_TRIP_MED_LOG = gql`
  query FieldTripMedLog($id: Int!) {
  fieldtrip(id: $id) {
    id
    name
    getWeekName
    getTotalStudents
    studentList {
      id
      name
      firstName
      lastName
      hasAllergies
      hasFoodAllergens
      hasDietaryRestriction
      currentSchool {
        id
        name
      }
      medicalrecord {
        id
        restrictions
        allergies
        getAllergiesDisplay
        allergiesExpanded
        foodAllergens
        getFoodAllergensDisplay
        foodAllergenCount,
        dietaryNeeds
        dietaryCaution
      }
    }
  }
}`;

const NciAppFieldTripMedLog = compose(
  graphql(FIELD_TRIP_MED_LOG, {
    options: ownProps => ({
      pollInterval: 2000,
      variables: {
        id: ownProps.params.id
      }
    })
  })
)(NciAppFieldTripMedLogContainer);

export default NciAppFieldTripMedLog;
