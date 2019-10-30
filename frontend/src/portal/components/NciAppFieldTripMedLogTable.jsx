import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Link } from 'react-router';
import { graphql, compose } from 'react-apollo';
import { Grid, Row, Col, Table } from 'react-bootstrap';

const medTimeSlots = [
  { id: 1, slug: 'breakfast', color: '#FEF396', start_hour: 6, end_hour: 10 },
  { id: 2, slug: 'lunch', color: '#FDBC75', start_hour: 11, end_hour: 3 },
  { id: 3, slug: 'dinner', color: '#FB8CBF', start_hour: 5, end_hour: 7 },
  { id: 4, slug: 'bedtime', color: '#ACE6FD', start_hour: 8, end_hour: 10 },
  { id: 5, slug: 'other', color: '#92E595' }
];

class NciAppFieldTripMedLogContainer extends React.Component {

  static propTypes = {
    fieldTripDetails: PropTypes.shape({
      loading: PropTypes.bool,
      fieldtrip: PropTypes.shape({
        id: PropTypes.number
      })
    }).isRequired,
    medicationsByFieldTrip: PropTypes.shape({
      loading: PropTypes.bool,
      medications: PropTypes.arrayOf(
        PropTypes.shape({

        })
      )
    }).isRequired,
    logAdministeredMed: PropTypes.func.isRequired
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  handleClick = (medicationId) => {
    this.props.logAdministeredMed({
      variables: {
        medicationId,
        fieldTripId: this.props.fieldTripDetails.fieldtrip.id
      }
    }).then(({ data }) => {
      console.log('handleClick Returned data:', data);
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

  render() {
    console.log('props ', this.props);

    const medications = this.props.medicationsByFieldTrip.medications &&
      this.props.medicationsByFieldTrip.medications;

    const fieldtrip = this.props.fieldTripDetails.fieldtrip &&
      this.props.fieldTripDetails.fieldtrip;

    const medicationsByStudent = medications &&
      _(medications).groupBy(e => [e.medicalRecord.student.id, e.medicalRecord.student.name]).map(
        (value, key) => ({ name: key, medications: value })
      ).value();

    return (
      <Grid>

        {fieldtrip &&
          <span style={{ textAlign: 'center' }}>
            <h1 style={{ marginBottom: 0 }}>Field Trip Med Log Administration Table</h1>
            <h3>{fieldtrip.name}</h3>
            <h4>Today: <Moment format="L" /></h4>
          </span>
        }

        {this.props.medicationsByFieldTrip.loading
          ? <Row>Loading field trip details...</Row>
          : <Row>
            <Col>
              {_.map(medicationsByStudent, student => (
                <span key={student.name}>

                  <h3 style={{ marginBottom: 5 }}>
                    <Link to={`/app/student/${student.name.split(',')[0]}`}>{student.name.split(',')[1]}</Link>
                  </h3>

                  <Table bordered hover striped style={{ marginBottom: 20 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 250 }}>Medication</th>
                        <th>Dosage</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, background: '#FEF396' }}>Breakfast</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, background: '#FDBC75' }}>Lunch</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, background: '#FB8CBF' }}>Dinner</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, background: '#ACE6FD' }}>Bedtime</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, background: '#92E595' }}>Other</th>
                      </tr>
                    </thead>

                    <tbody>
                      {_.map(student.medications, med => (
                        <tr key={med.id}>
                          <td>
                            {med.inPossession
                              ? <FontAwesome name="bullseye" style={{ color: '#56c62f' }} />
                              : <FontAwesome name="close" style={{ color: '#c6452e' }} />
                            }{' '}
                            {med.medicationName}
                          </td>

                          <td>
                            {med.amountHuman !== ''
                              ? `${med.amount} ${med.getAmountUnitDisplay}`
                              : med.amountHuman
                            }
                            {med.notes !== '' &&
                              <div style={{ fontSize: '0.9em', borderLeft: '3px solid #2899d1', margin: '10px 10px 10px 5px', paddingLeft: 10, color: '#4a4a4a' }}>
                                {med.notes}
                              </div>
                            }
                          </td>

                          {_.map(medTimeSlots, timeSlot => (
                            <td style={{ textAlign: 'center', background: timeSlot.color }}>
                              {_.has(med.administrationTimes.map(Number), timeSlot.id) &&
                                <span>

                                  <input
                                    type="checkbox"
                                    onClick={() => this.handleClick(med.id)}
                                    checked={_.filter(med.administeredmedSet, v => (
                                      _.has(v.medication.administrationTimes, timeSlot.id)
                                    ).length > 0) && true}
                                  />{' '}

                                  {_.filter(med.administeredmedSet, v => (
                                    _.has(v.medication.administrationTimes.map(Number), 1)
                                  )).length}

                                  {timeSlot.id === 5 &&
                                    med.administrationTimesOther &&
                                      <span title={med.administrationTimesOther}>
                                        <FontAwesome name="info-circle" fixedWidth />
                                      </span>
                                  }

                                </span>
                              }
                            </td>
                          ))}

                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </span>
              ))}
            </Col>
          </Row>
        }
      </Grid>
    );
  }
}

const MEDICATIONS_BY_FIELD_TRIP = gql`
  query MedicationByFieldTrip($fieldTripId: Int!) {
    medications(fieldTripId: $fieldTripId) {
      id
      medicationName
      amount
      amountUnit
      amountHuman
      getAmountUnitDisplay
      administrationTimes
      getAdministrationTimesDisplay
      administrationTimesOther
      inPossession
      notes
      administeredmedSet {
        created
      }
      medicalRecord {
        id
        student {
          id
          name
        }
      }
    }
  }`;
const FIELD_TRIP = gql`
  query FieldTrip($id: Int!) {
    fieldtrip(id: $id) {
      id
      name
      startDate
      endDate
      getTotalStudents
      getTotalAllergens
      getTotalDietaryRestrictions
    }
  }`;
const LOG_ADMINISTERED_MED = gql`
  mutation LogAdministeredMed(
    $medicationId: Int!,
    $fieldTripId: Int!,
    $notes: String
  ) {
    logAdministeredMed(
      medicationId: $medicationId,
      fieldTripId: $fieldTripId,
      notes: $notes
    ) {
      success,
      administeredMed {
        id
        medication {
          medicationName
          medicalRecord {
            student {
              name
            }
          }
        }
      }
    }
  }`;

const NciAppFieldTripMedLog = compose(
  graphql(MEDICATIONS_BY_FIELD_TRIP, {
    name: 'medicationsByFieldTrip',
    options: ownProps => ({
      pollInterval: 2000,
      variables: {
        fieldTripId: ownProps.params.id
      }
    })
  }),
  graphql(FIELD_TRIP, {
    name: 'fieldTripDetails',
    options: ownProps => ({
      variables: {
        id: ownProps.params.id
      }
    })
  }),
  graphql(LOG_ADMINISTERED_MED, { name: 'logAdministeredMed' })
)(NciAppFieldTripMedLogContainer);

export default NciAppFieldTripMedLog;
