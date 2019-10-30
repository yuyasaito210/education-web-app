import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import {Table} from 'react-bootstrap';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';


const medTimeSlots = [
    {id: 1, slug: 'breakfast', color: '#FEF396', start_hour: 6, end_hour: 10},
    {id: 2, slug: 'lunch', color: '#FDBC75', start_hour: 11, end_hour: 3},
    {id: 3, slug: 'dinner', color: '#FB8CBF', start_hour: 5, end_hour: 7},
    {id: 4, slug: 'bedtime', color: '#ACE6FD', start_hour: 8, end_hour: 10},
    {id: 5, slug: 'other', color: '#92E595'}
];


class NciAppFieldTripMedLogContainer extends React.Component {


    static propTypes = {
        checkInMedication: PropTypes.func.isRequired,
        logAdministeredMed: PropTypes.func.isRequired,
        data: PropTypes.shape({
            fieldtrip: PropTypes.object
        }).isRequired
    }

    componentWillMount() {
        document.body.style.background = '#fff';
    }

    handleCheckInMedication = (medicationId) => {
        const i = this;
        this.props.checkInMedication({
            variables: {id: medicationId}
        }).then(({data}) => {
            i.setState({
                success: data.checkInMedication.success,
                err: null
            });
        }).catch((error) => {
            console.log('could not check-in medication: ', error);
            // i.setState({ err: 'Error removing record' });
        });
    }

    handleCheckOutMedication = (medicationId) => {
        const i = this;
        this.props.checkOutMedication({
            variables: {id: medicationId}
        }).then(({data}) => {
            i.setState({
                success: data.checkOutMedication.success,
                err: null
            });
        }).catch((error) => {
            console.log('could not check-out medication: ', error);
            // i.setState({ err: 'Error removing record' });
        });
    }

    handleLogAdministeredMedClick = (medicationId) => {

        this.props.logAdministeredMed({
            variables: {
                medicationId,
                fieldTripId: this.props.data.fieldtrip.id
            }
        }).then(({data}) => {
            console.log('handleClick Returned data:', data);
            alert("Medication logged.");
        }).catch((error) => {
            console.log('error: ', error);
        });
    }

    render() {
        const fieldtrip = this.props.data.fieldtrip &&
            this.props.data.fieldtrip;

        return (
            <div className="nciapp-fieldtrip-detail">
                {this.props.data.loading
                    ? <span>Loading field trip details...</span>
                    : <span>

            <div className="nci-navbar-header" style={{position: 'fixed', zIndex: 999}}>
              <div className="nci-navbar-header-back">
                <button type="button" onClick={() => {
                    window.history.back();
                }} className="btn-nostyle">
                  <FontAwesome name="chevron-left" fixedWidth/>
                    {' '}
                    Back
                </button>
              </div>
              <div className="nci-navbar-header-title">
                <h2>Medication Overview</h2>
                <p>{fieldtrip.getWeekName} (<span style={{textTransform: 'uppercase'}}><Moment
                    date={fieldtrip.startDate} format="MMM D"/></span>-<Moment date={fieldtrip.endDate}
                                                                               format="Do\, YYYY"/>)</p>
              </div>
              <div className="nci-navbar-header-share">
                   <a href={`/app/fieldtrip/${fieldtrip.id}/medlog/table`}>
                       <FontAwesome name="book" fixedWidth />
                   </a>
              </div>
            </div>

            <Table striped className="sticky-header">
              <thead>
                <tr>
                  <th>First</th>
                  <th>Last</th>
                  <th>DOB</th>
                  <th>OTC</th>
                  <th>OTC Med Choice</th>
                </tr>
              </thead>
                {_.map(_.filter(_.sortBy(fieldtrip.studentList, 'lastName')), student => (
                    <tbody className="medTableBg" key={student.id}>
                    <tr className="medTableBgPar">
                        <td><a href={`/app/student/${student.id}`}>{student.firstName}</a></td>
                        <td>{student.lastName}</td>
                        <td style={{whiteSpace: 'nowrap'}}>{student.dob}</td>
                        <td>{student.medicalrecord && student.medicalrecord.nonRxType > 1
                            ? <span style={{color: '#249f1d'}}>Yes</span>
                            : <span style={{color: '#de472c'}}>No</span>
                        }</td>
                        <td style={{whiteSpace: 'nowrap'}}>{student.medicalrecord && student.medicalrecord.getNonRxTypeDisplay}</td>
                    </tr>
                    {student.medicalrecord && student.medicalrecord.medicationSet && student.medicalrecord.medicationSet.length > 0 &&
                    <tr className="medTableBgCell">
                        <td colSpan={1} style={{padding: '0 0 30px 0'}}>&nbsp;</td>
                        <td colSpan={4} style={{padding: '0 0 30px 0'}}>
                            <Table hover condensed striped bordered
                                   style={{borderLeft: '3px solid #bbbbbb', margin: 0, padding: 0, fontSize: '0.9em'}}>
                                <thead>
                                <tr>
                                    <th style={{width: 70}}>Check-in</th>
                                    <th>Medication</th>
                                    <th>Dosage</th>
                                    <th>Instructions</th>
                                    <th style={{whiteSpace: 'nowrap', width: 80, background: '#FEF396'}}>Breakfast</th>
                                    <th style={{whiteSpace: 'nowrap', width: 80, background: '#FDBC75'}}>Lunch</th>
                                    <th style={{whiteSpace: 'nowrap', width: 80, background: '#FB8CBF'}}>Dinner</th>
                                    <th style={{whiteSpace: 'nowrap', width: 80, background: '#ACE6FD'}}>Bedtime</th>
                                    <th style={{whiteSpace: 'nowrap', width: 80, background: '#92E595'}}>Other</th>
                                </tr>
                                </thead>
                                <tbody>
                                {_.map(student.medicalrecord.medicationSet, med => (
                                    <tr key={med.id}>

                                        {med.inPossession
                                            ? <td
                                                onClick={() => this.handleCheckOutMedication(med.id)}
                                                style={{textAlign: 'center', background: '#C9E6CE'}}
                                            >
                                                <input type="checkbox" checked/>
                                            </td>
                                            : <td
                                                onClick={() => this.handleCheckInMedication(med.id)}
                                                style={{textAlign: 'center', background: '#FAE7E3'}}
                                            >
                                                <input type="checkbox" checked={false}/>
                                            </td>
                                        }

                                        <td className="med-name" style={{whiteSpace: 'nowrap'}}>
                                            {med.medicationName}{' '}
                                        </td>
                                        <td className="med-amount">{med.amountHuman}</td>
                                        <td className="med-admin-times">{med.notes && med.notes}</td>

                                        {med.inPossession
                                            ? _.map(medTimeSlots, timeSlot => (
                                                <td key={timeSlot.id}
                                                    style={{textAlign: 'center', background: timeSlot.color}}>
                                                    {_.includes(med.administrationTimes.map(Number), timeSlot.id) &&
                                                    <span>

                                        {_.filter(med.administeredmedSet, {
                                            medication: {
                                                administrationTimes: [String(timeSlot.id)]  // FIXME: techdebt, should be int
                                            }
                                        }).length < 1
                                            ? <input
                                                type="button"
                                                value="Administer"
                                                onClick={() => this.handleLogAdministeredMedClick(med.id)}
                                            />
                                            : <FontAwesome name="check" fixedWidth
                                                           style={{color: '#0d7700', fontSize: '1.1em'}}/>
                                        }

                                                        {timeSlot.id === 5 &&
                                                        <span><small>
                                              {med.administrationTimesOther}
                                            </small>
                                            </span>
                                                        }

                                      </span>
                                                    }
                                                </td>
                                            ))
                                            : <td colSpan={5}
                                                  style={{fontSize: '0.9em', fontStyle: 'italic', color: '#9a9a8c'}}>
                                                <FontAwesome name="exclamation-triangle"/> Check-in medication to
                                                display schedule </td>
                                        }

                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </td>
                    </tr>
                    }
                    </tbody>
                ))}
            </Table>
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
    getTotalAllergens
    studentList {
      id
      name
      firstName
      lastName
      dob
      hasAllergies
      hasFoodAllergens
      medicalrecord {
        id
        nonRxType
        nonRxNotes
        weight
        getNonRxTypeDisplay
        lastTetanus
        getGenderDisplay
        restrictions
        allergies
        getAllergiesDisplay
        allergiesExpanded
        foodAllergens
        getFoodAllergensDisplay
        allergenCount
        foodAllergenCount
        recentTrauma
        medicationSet {
          id
          medicationName
          amount
          amountUnit
          amountHuman
          inPossession
          getAmountUnitDisplay
          administrationTimes
          getAdministrationTimesDisplay
          administrationTimesOther
          administeredmedSet {
            id
            created
            medication {
              id
              administrationTimes
            }
          }
          notes
        }
      }
      studentnoteSet {
        id
        note
        created
        modified
        staff {
          id
          name
        }
      }
    }
  }
}`;
const CHECK_IN_MEDICATION = gql`
  mutation CheckInMedication($id: Int!) {
  checkInMedication(id: $id) {
    success
  }
}`;
const CHECK_OUT_MEDICATION = gql`
  mutation CheckOutMedication($id: Int!) {
  checkOutMedication(id: $id) {
    success
  }
}`;
// const SAVE_MEDICATION = gql`
//   mutation SaveMedication(
//     $studentId: Int!
//     $medicationName: String!
//     $medicationId: Int
//     $amount: Int!
//     $amountUnit: Int!
//     $administrationTimes: [Int]
//     $administrationTimesOther: String
//     $notes: String
//   ) {
//     saveMedication(
//       studentId: $studentId
//       medicationName: $medicationName
//       medicationId: $medicationId
//       amount: $amount
//       amountUnit: $amountUnit
//       administrationTimes: $administrationTimes
//       administrationTimesOther: $administrationTimesOther
//       notes: $notes
//     ) {
//       medication {
//         id
//         medicationName
//         amount
//         amountUnit
//         administrationTimes
//         administrationTimesOther
//         getAmountUnitDisplay
//         notes
//         modified
//       }
//     }
//   }`;
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
    graphql(FIELD_TRIP_MED_LOG, {
        options: ownProps => ({
            pollInterval: 1500,
            variables: {
                id: ownProps.params.id
            }
        })
    }),
    graphql(CHECK_IN_MEDICATION, {name: 'checkInMedication'}),
    graphql(CHECK_OUT_MEDICATION, {name: 'checkOutMedication'}),
    graphql(LOG_ADMINISTERED_MED, {name: 'logAdministeredMed'})
)(NciAppFieldTripMedLogContainer);

export default NciAppFieldTripMedLog;
