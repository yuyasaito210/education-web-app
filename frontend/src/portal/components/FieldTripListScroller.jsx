import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';

class FieldTripListScrollerContainer extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool,
      myFieldTrips: PropTypes.array
    }).isRequired
  }

  state = {}

  handleAddNewFieldTrip = () => {
    console.log('handleAddNewFieldTrip');
  }

  render() {
    const props = this.props;
    return (
      <span>
        <h3 className="section-header">Upcoming Field Trips ({props.data.myFieldTrips && props.data.myFieldTrips.length})</h3>
        <div className="fieldtrip-list-scroller-wrapper">
          <div>

            {this.props.data.loading
              ? <div className="fieldtrip-panel-add">
                  <span>Loading field trips...</span>
                </div>
              : <span>

                {props.data.myFieldTrips && _.map(_.sortBy(props.data.myFieldTrips, 'name'), (fieldtrip, index) => (
                  // index > 0 &&  the first in the list is usually the 'next up' so we ommit it here.
                    <div key={fieldtrip.id} className="fieldtrip-panel">
                      <Link href={`/app/fieldtrip/${fieldtrip.id}`} className="fieldtrip-name">{fieldtrip.name}</Link>
                      <ul className="school-list">
                        {_.map(fieldtrip.schoolList, (school, index) => index <= 2 && <li key={school.id}>•&nbsp;&nbsp;{school.name}</li>)}
                        {fieldtrip.schoolList.length >= 4 && <li style={{ color: '#656464' }}>{(fieldtrip.schoolList.length - 3)} more</li>}
                      </ul>
                      <span className="head-count"><FontAwesome name="user" fixedWidth /> {fieldtrip.getTotalStudents}</span>
                      <span className="date"><Moment date={fieldtrip.startDate} fromNow /></span>
                    </div>
                ))}

                <div className="fieldtrip-panel-add" onClick={this.handleAddNewFieldTrip}>
                  <span><FontAwesome name="plus" fixedWidth /> Add New</span>
                </div>

              </span>
            }

          </div>
        </div>
      </span>
    );
  }
}

const MY_FIELDTRIPS = gql`
  query MyFieldTrips($timeline: String) {
    myFieldTrips(timeline: $timeline) {
      id
      name
      regStartDate
      regEndDate
      startDate
      endDate
      getTotalStudents
      getTotalAllergens
      getTotalDietaryRestrictions
      getTotalStudentNotes
      getWeekName
      studentList {
        id
        name
      }
      schoolList {
        id
        name
      }
      location {
        id
        name
        slug
      }
    }
  }`;

const FieldTripListScroller = compose(
  graphql(MY_FIELDTRIPS, {
    options: {
      pollInterval: 4000,
      variables: {
        locationSlug: localStorage.locationSlug,
        timeline: 'upcoming'
      }
    }
  })
)(FieldTripListScrollerContainer);

export default FieldTripListScroller;
