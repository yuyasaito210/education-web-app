import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';

NextUp.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    myFieldTrips: PropTypes.arrayOf(
      PropTypes.object
    )
  }).isRequired
};

NextUp.defaultProps = {};

function NextUp(props) {
  const fieldtrips = props.data.myFieldTrips && props.data.myFieldTrips;
  return (
    fieldtrips
    ? <div>
      <h3 className="section-header">This Week</h3>

      {_.map(fieldtrips, fieldtrip => (
        <div key={fieldtrip.id} className="next-up">
          {/* <a className="notes" href="#"><FontAwesome name="search" /></a> */}
          <a href={`/app/fieldtrip/${fieldtrip.id}`} className="fieldtrip-name">{fieldtrip.name}</a>
          <ul className="school-list">
            {_.map(_.sortBy(fieldtrip.schoolList, 'name'), school => <li key={school.id}>{school.name}</li>)}
          </ul>
          <ul className="big-counts">
            <li><span>{fieldtrip.getTotalStudents}</span>Students</li>
            <li><span>{fieldtrip.getTotalAllergens}</span>Allergens</li>
            <li><span>{fieldtrip.getTotalDietaryRestrictions}</span>Dietary</li>
            <li><span>{fieldtrip.getTotalStudentNotes}</span>Notes</li>
          </ul>
          <ul className="main-buttons">
            <li><Link to={`/app/fieldtrip/${fieldtrip.id}/medlog`}><FontAwesome name="check-square-o" fixedWidth /> Med Log</Link></li>
            <li><Link to={`/app/fieldtrip/${fieldtrip.id}/dietary`}><FontAwesome name="cutlery" fixedWidth /> Dietary</Link></li>
            <li style={{ opacity: 0.3 }}><FontAwesome name="bed" fixedWidth /> Housing</li>
          </ul>
        </div>
      ))}

    </div>
    : <div className="next-up">Loading...</div>
  );
}

const MY_NEXT_FIELD_TRIP = gql`
  query MyFieldTrips($timeline: String) {
    myFieldTrips(timeline: $timeline) {
      id
      guid
      name
      getTotalStudents
      getTotalAllergens
      getTotalDietaryRestrictions
      getTotalStudentNotes
      getWeekName
      schoolList {
        id
        name
      }
      studentList {
        id
        name
        medicalrecord {
          id
          allergenCount
          foodAllergenCount
        }
      }
    }
  }`;

export default graphql(MY_NEXT_FIELD_TRIP, {
  options: {
    pollInterval: 4000,
    variables: {
      timeline: 'now'
    }
  }
})(NextUp);
