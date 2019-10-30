import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Table, Label } from 'react-bootstrap';

FieldTripTableContainer.propTypes = {
  data: PropTypes.shape({
    myFieldTrips: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        regStartDate: PropTypes.string,
        regEndDate: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        location: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
          shortName: PropTypes.string
        })
      })
    )
  }).isRequired
};

function FieldTripTableContainer({ data }) {
  const { myFieldTrips } = data;
  return (myFieldTrips && (myFieldTrips.length > 0)
    ? (
      <div>

        <Table>
          <thead>
            <tr>
              <th />
              <th>First Day</th>
              <th>Last Day</th>
              <th>Duration</th>
              <th>Location</th>
              <th />
            </tr>
          </thead>
          <tbody>

            {myFieldTrips
              ? _.map(myFieldTrips, fieldtrip => (
                <tr key={fieldtrip.id}>

                  <td style={{ paddingRight: 20, textAlign: 'left' }}>
                    {moment().isBetween(fieldtrip.startDate, fieldtrip.endDate, null, '[]')
                      ? <Label bsStyle="success" style={{ display: 'block', minWidth: 80 }}>In-Progress</Label>
                      : moment(fieldtrip.startDate).isSameOrAfter()
                          && (
                            <Label style={{ display: 'block', minWidth: 80 }}>
                              <Moment
                                date={fieldtrip.startDate}
                                fromNow
                              />
                            </Label>
                          )
                    }
                  </td>

                  <td>
                    <Moment date={fieldtrip.startDate} format="L" />
                    {' '}
                    <i>
                      <Moment date={fieldtrip.startDate} format="(ddd)" />
                    </i>
                  </td>

                  <td>
                    <Moment date={fieldtrip.endDate} format="L" />
                    {' '}
                    <i>
                      <Moment date={fieldtrip.endDate} format="(ddd)" />
                    </i>
                  </td>

                  <td>
                    {moment(fieldtrip.endDate).diff(fieldtrip.startDate, 'days') + 1}
                    {' '}
                    days,
                    {' '}
                    {moment(fieldtrip.endDate).diff(fieldtrip.startDate, 'days')}
                    {' '}
                    nights
                  </td>

                  <td>
                    {fieldtrip.location.shortName}
                  </td>

                </tr>

              ))
              : (
                <tr>
                  <td colSpan={3}>
                    <span style={{ display: 'block', padding: 20 }}>
                      No field trip information to display at this time.
                    </span>
                  </td>
                </tr>
              )
            }

          </tbody>

        </Table>

      </div>
    )
    : <span>No upcoming field trips to display at this time.</span>
  );
}

const MY_FIELD_TRIPS = gql`
  query MyFieldTrips($timeline: String) {
    myFieldTrips(timeline: $timeline) {
      id
      name
      regStartDate
      regEndDate
      startDate
      endDate
      modified
      location {
        id
        shortName
      }
    }
  }`;

const FieldTripTable = compose(
  graphql(MY_FIELD_TRIPS, {
    options: {
      variables: {
        timeline: 'upcoming'
      }
    }
  })
)(FieldTripTableContainer);

export default FieldTripTable;
