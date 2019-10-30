import _ from 'lodash';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';

/* Helps keep things a little more DRY */
const ListItem = ({ label, content }) => (
  <li>
    {label}
    {' '}
    <span className="pull-right">
      {content}
    </span>
  </li>
);

class NciAppStudentDetailContainer extends React.Component {
  componentWillMount() {
    document.body.style.background = '#fff';
  }

  getAllergy = (id) => {
    const allergy = {
      1: () => ({ id: 1, value: 'Food Allergy' }),
      2: () => ({ id: 2, value: 'Skin Allergy' }),
      3: () => ({ id: 3, value: 'Dust Allergy' }),
      4: () => ({ id: 4, value: 'Insect Sting Allergy' }),
      5: () => ({ id: 5, value: 'Pet Allergies' }),
      6: () => ({ id: 6, value: 'Eye Allergy' }),
      7: () => ({ id: 7, value: 'Drug Allergies' }),
      8: () => ({ id: 8, value: 'Allergic Rhinitis (hay fever)' }),
      9: () => ({ id: 9, value: 'Latex Allergy' }),
      10: () => ({ id: 10, value: 'Mold Allergy' }),
      11: () => ({ id: 11, value: 'Pollen Allergy' }),
      12: () => ({ id: 12, value: 'Sinus Infection' }),
      13: () => ({ id: 13, value: 'Other (please specify)' })
    };
    return (allergy[id]() || allergy[0]());
  }

  handleToggleStudentActivation = (studentId) => {
    const i = this;
    const { toggleStudentActivation } = this.props;
    toggleStudentActivation({
      variables: { id: studentId }
    }).then(({ data }) => {
      i.setState({
        newStatus: data.toggleStudentActivation.newStatus,
        err: null
      });
    }).catch(error => console.log(error));
  }

  render() {
    const { data } = this.props;
    const { student, loading, error } = data;
    return (
      <div className="nciapp-fieldtrip-detail">
        {loading
          ? <span>Loading student trip details...</span>
          : (
            <span>
              {error && <span>{String(error.message).replace('GraphQL error:', '')}</span>}
              {!error && student && (
                <span>
                  <div className="nci-navbar-header">
                    <div className="nci-navbar-header-back">

                      <button
                        type="button"
                        onClick={() => window.history.back()}
                        style={{ background: 'none', padding: 0, border: 'none' }}
                      >
                        <FontAwesome name="chevron-left" fixedWidth />
                        {' '}
                        Back
                      </button>

                    </div>
                    <div className="nci-navbar-header-title">

                      <h2>Student Profile</h2>

                    </div>
                    {/* <div className="nci-navbar-header-share">
                      <a href=""><FontAwesome name="share-square-o" fixedWidth /></a>
                    </div> */}
                  </div>

                  <div className="student-profile-header">
                    <div className="profile-photo-fa">
                      <FontAwesome name="user-circle" />
                    </div>
                    <h2>{student.name}</h2>
                    <p style={{ marginBottom: 10 }}>
                      {student.currentSchool.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => window.open(`tel:${student.guardianList[0].phone}`)}
                      className="outline-btn"
                      style={{ marginRight: 8 }}
                    >
                      <FontAwesome name="phone" />
                      {' '}
                      Call Primary Contact
                    </button>

                    {/* <button className="outline-btn">
                      <FontAwesome name="pencil" />
                      {' '}
                      Add Note
                    </button> */}

                  </div>

                  <ul className="display-list">
                    <ListItem label="Age" content={moment().diff(student.dob, 'years')} />
                    <ListItem label="Birthday" content={<Moment date={student.dob} format="MMMM Do, YYYY" />} />
                    {student.medicalrecord
                      && <ListItem label="Weight" content={student.medicalrecord.weight} />
                    }
                    {student.medicalrecord
                      && <ListItem label="Height" content={student.medicalrecord.height} />
                    }
                    {student.medicalrecord
                      && <ListItem label="Gender" content={student.medicalrecord.getGenderDisplay} />
                    }
                  </ul>

                  <div
                    style={{
                      marginBottom: 7,
                      fontWeight: 'bold',
                      fontSize: '1.1em',
                      padding: 10,
                      background: '#3F7FB3',
                      color: 'white'
                    }}
                  >
                    Parents / Guardians
                  </div>

                  <ul className="display-list">
                    {_.map(student.guardianList, guardian => (
                      <ListItem
                        key={guardian.id}
                        label={(
                          <Link to={`/app/guardian/${guardian.id}`}>
                            {guardian.name}
                          </Link>
                        )}
                        content={(
                          guardian.phone
                            && (
                              <a href="tel:{guardian.phone}">
                                {guardian.phone}
                                <FontAwesome
                                  name="angle-right"
                                  style={{
                                    lineHeight: 0,
                                    fontSize: '1.8em',
                                    position: 'relative',
                                    top: 3,
                                    left: 7
                                  }}
                                />
                              </a>
                            )
                        )}
                      />
                    ))}
                  </ul>

                  <div className="display-list-header">
                    Dietary Preferences
                  </div>

                  {student.medicalrecord && (
                    <ul className="display-list">
                      <li>
                        Restrictions
                        <span className="pull-right">
                          {student.medicalrecord.dietaryNeeds ? 'Yes' : 'None'}
                        </span>
                        {student.medicalrecord.dietaryNeeds && (
                          <div style={{ marginTop: 10, marginBottom: 10, color: 'red' }}>
                            {student.medicalrecord.dietaryNeeds}
                          </div>
                        )}
                      </li>
                      <li>NCI to contact me about meals <span className="pull-right">{student.medicalrecord.dietaryCaution}</span></li>
                    </ul>
                  )}

                  <div className="display-list-header">
                    Medical
                  </div>

                  {student.medicalrecord
                    ? <ul className="display-list">
                      <li>OTC Pain Relief <span className="pull-right">{student.medicalrecord.getNonRxTypeDisplay}</span></li>
                      <li>OTC Notes / Instructions
                        {student.medicalrecord.nonRxNotes ? <div className="non-rx-notes">{student.medicalrecord.nonRxNotes}</div> : <span className="pull-right">None</span>}
                      </li>
                      <li>Last Tetanus <span className="pull-right"><Moment date={student.medicalrecord.lastTetanus} format="L" /></span></li>
                      {parseInt(student.allergenCount, 10) > 0
                        ? <li>Allergies <span className="pull-right">{student.allergenCount}</span>

                          <ul className="allergy-list">
                            {_.map(JSON.parse(student.medicalrecord.allergies), allergy => (
                              <li key={this.getAllergy(allergy).id}>
                                {this.getAllergy(allergy).value}
                                {this.getAllergy(allergy).id === 1 && <div style={{ fontSize: '0.9em', color: '#717171', marginLeft: 10, fontWeight: 'bold' }}><i>{student.medicalrecord.getFoodAllergensDisplay}</i></div>}
                              </li>
                            ))}
                          </ul>

                          {student.medicalrecord.allergiesExpanded &&
                            <div className="allergies-expanded">{student.medicalrecord.allergiesExpanded}</div>
                          }
                        </li>
                        : <li>Allergies <span className="pull-right">None</span></li>
                      }

                      <li><Link to={`/app/student/${student.id}/waiver`}><FontAwesome name="print" fixedWidth /> Print Waiver</Link></li>

                    </ul>
                    : <ul className="display-list">
                      <li><span style={{ color: '#d74026' }}>No Medical Record information on-file</span> <span className="pull-right"><FontAwesome name="exclamation-triangle" style={{ color: '#FECB2F' }} /></span></li>
                    </ul>
                  }

                  <div className="display-list-header">
                    Medications
                  </div>

                  <ul className="display-list">
                    {student.medicalrecord && student.medicalrecord.medicationSet.length > 0
                      ? _.map(student.medicalrecord.medicationSet, med => (
                        <li key={med.id} className="medication-item">

                          <span className="pull-right">
                            <FontAwesome name="angle-right" style={{ fontSize: '1.1em' }} />
                          </span>

                          {med.inPossession === true && <FontAwesome name="check-circle" fixedWidth style={{ color: '#62B664' }} />}{' '}
                          <a href={`/app/student/${student.id}`}>{med.medicationName}</a>{' '}
                          {(_.isNil(med.getAdministrationTimesDisplay) || med.getAdministrationTimesDisplay !== 'Other...') &&
                            <span style={{ color: '#c1bdbd', fontSize: '0.87em', paddingLeft: 5 }}>{med.amount !== 0 && med.amount}{' '}{med.amount !== 0 && med.getAmountUnitDisplay} at {med.getAdministrationTimesDisplay && med.getAdministrationTimesDisplay !== 'Other...' && med.getAdministrationTimesDisplay}</span>
                          }

                        </li>
                      ))
                      : <li className="">No medications on-file</li>
                    }
                    <li><Link to={`/app/student/${student.id}/add-medication`} ><FontAwesome name="plus" fixedWidth /> Add New Medication</Link></li>
                  </ul>

                  {student && student.studentnoteSet.length > 0 &&
                    <div style={{ marginTop: 20, marginLeft: 35, marginBottom: 20 }}>
                      <strong style={{ marginBottom: 0, display: 'block', color: '#a8a795', textTransform: 'uppercase' }}>Notes / Indicent Response</strong>
                      {_.map(student.studentnoteSet, note => (
                        <ul key={note.id} className="student-note">
                          <li>{note.staff.name} <span style={{ color: '#9d9d9d' }}><Moment date={note.created} fromNow /></span></li>
                          <li style={{ marginLeft: 15, marginTop: 10 }}>{note.note}</li>
                        </ul>
                      ))}
                    </div>
                  }

                </span>

              )}
            </span>
          )
        }
      </div>
    );
  }
}

const STUDENT_DETAIL = gql`
  query StudentDetail($id: Int!) {
    student(id: $id) {
      id
      name
      lastName
      dob
      isActive
      hasAllergies
      hasFoodAllergens
      allergenCount
      currentSchool {
        id
        name
      }
      medicalrecord {
        id
        getNonRxTypeDisplay
        nonRxNotes
        restrictions
        weight
        height
        getGenderDisplay
        allergies
        getAllergiesDisplay
        allergenCount
        foodAllergenCount
        allergiesExpanded
        foodAllergens
        getFoodAllergensDisplay
        dietaryNeeds
        recentTrauma
        dietaryCaution
        medicationSet {
          id
          medicationName
          amount
          amountUnit
          getAmountUnitDisplay
          administrationTimes
          getAdministrationTimesDisplay
          administrationTimesOther
          inPossession
          notes
        }
      }
      guardianList {
        id
        name
        phone
        email
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
  }`;
const CHECK_IN_MEDICATION = gql`
  mutation CheckInMedication($id: Int!) {
    checkInMedication(id: $id) {
      success
    }
}`;
const TOGGLE_STUDENT_ACTIVATION = gql`
  mutation ToggleStudentActivation($id: Int!) {
    toggleStudentActivation(id: $id) {
      newStatus
    }
}`;
const SAVE_MEDICATION = gql`
  mutation SaveMedication(
    $studentId: Int!
    $medicationName: String!
    $medicationId: Int
    $amount: Int!
    $amountUnit: Int!
    $administrationTimes: [Int]
    $administrationTimesOther: String
    $notes: String
  ) {
    saveMedication(
      studentId: $studentId
      medicationName: $medicationName
      medicationId: $medicationId
      amount: $amount
      amountUnit: $amountUnit
      administrationTimes: $administrationTimes
      administrationTimesOther: $administrationTimesOther
      notes: $notes
    ) {
      medication {
        id
        medicationName
        amount
        amountUnit
        administrationTimes
        administrationTimesOther
        getAmountUnitDisplay
        notes
        modified
      }
    }
  }`;

const NciAppStudentDetail = compose(
  graphql(STUDENT_DETAIL, {
    options: ownProps => ({
      pollInterval: 2000,
      variables: {
        id: ownProps.params.id
      }
    })
  }),
  graphql(CHECK_IN_MEDICATION, { name: 'checkInMedication' }),
  graphql(SAVE_MEDICATION, { name: 'saveMedication' }),
  graphql(TOGGLE_STUDENT_ACTIVATION, { name: 'toggleStudentActivation' })
)(NciAppStudentDetailContainer);

export default NciAppStudentDetail;
