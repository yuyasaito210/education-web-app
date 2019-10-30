import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import Moment from 'react-moment';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Modal, Table } from 'react-bootstrap';

class StudentDetailModalContainer extends React.Component {
  state = {
    newStatus: true
  }

  getMedTimeDisplay = medAdminTimes => (
    _.map(medAdminTimes, (med) => {
      if (med === '1') { return 'Breakfast '; }
      if (med === '2') { return 'Lunch '; }
      if (med === '3') { return 'Dinner '; }
      if (med === '4') { return 'Bedtime '; }
      if (med === '5') { return 'Other'; }
      return undefined;
    })
  );

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
    const { studentProfile, showStudentDetail, onHide } = this.props;
    const student = studentProfile.student
      && studentProfile.student;

    return (
      <Modal show={showStudentDetail} onHide={onHide} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Student Details</Modal.Title>
        </Modal.Header>
        {student
          && (
            <Modal.Body>

              <div style={{ borderTop: '1px solid #e4e4e4' }}>
                <h5 style={{ textTransform: 'uppercase' }}>General</h5>
                <ul style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                  <li><strong>{student.name}</strong></li>
                  <li>{student.dob} ({moment().diff(student.dob, 'years')} y/o)</li>
                  <li>{student.getClassroomDisplay}</li>
                  <li>{student.photoWaiver}</li>
                  <li>Height: {student.medicalrecord && student.medicalrecord.height}</li>
                  <li>Weight: {student.medicalrecord && student.medicalrecord.weight}</li>
                </ul>
              </div>


              {student.medicalrecord && student.hasAllergies
                && (
                  <div style={{ marginTop: 20, borderTop: '1px solid #e4e4e4' }}>
                    <h5 style={{ textTransform: 'uppercase' }}>Allergies</h5>
                    <ul style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                      <li><strong>Allergies ({student.allergenCount})</strong>: {student.medicalrecord.getAllergiesDisplay}</li>
                      {student.hasFoodAllergens &&
                        <li><strong>Food Allergens ({student.foodAllergenCount})</strong>: {student.medicalrecord.getFoodAllergensDisplay}</li>
                      }
                      {student.medicalrecord.allergiesExpanded &&
                        <li style={{ marginTop: 15 }}><strong>Further details & instructions</strong>: {student.medicalrecord.allergiesExpanded}</li>
                      }
                    </ul>
                  </div>
                )
              }

              {student.medicalrecord &&
                <div style={{ marginTop: 20, borderTop: '1px solid #e4e4e4' }}>
                  <h5 style={{ textTransform: 'uppercase' }}>Dietary</h5>
                  <ul style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                    {student.medicalrecord.dietaryNeeds && <li style={{ marginBottom: 10 }}><strong>Dietary needs</strong>: {student.medicalrecord.dietaryNeeds}</li>}
                    {student.medicalrecord.restrictions && <li><strong>Restrictions</strong>: {student.medicalrecord.restrictions}</li>}
                  </ul>
                </div>
              }

              {student.medicalrecord &&
                <div style={{ marginTop: 20, borderTop: '1px solid #e4e4e4' }}>
                  <h5 style={{ textTransform: 'uppercase' }}>Medication</h5>
                  <ul style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                    {student.medicalrecord.getNonRxTypeDisplay && <li>OTC pain relief: {student.medicalrecord.getNonRxTypeDisplay}</li>}
                    {student.medicalrecord.nonRxNotes && <li>OTC instructions: {student.medicalrecord.nonRxNotes}</li>}
                    <li>Last Tetanus: {student.medicalrecord.lastTetanus ? student.medicalrecord.lastTetanus : 'N/A'}</li>
                  </ul>

                  {student.medicalrecord.medicationSet.length > 0 &&
                    <div style={{ marginLeft: 15, marginTop: 15 }}>
                      <Table striped bordered condensed hover>
                        <thead style={{ background: '#fffeeb' }}>
                          <tr>
                            <th>Medication</th>
                            <th>Dosage</th>
                            <th>Times to administer</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {_.map(student.medicalrecord.medicationSet, medication => (
                            <tr key={medication.id}>
                              <td>{medication.medicationName}</td>
                              <td>{medication.amountHuman}</td>
                              <td>
                                {this.getMedTimeDisplay(medication.administrationTimes)}
                                {' '}
                                {medication.administrationTimesOther
                                  && `(${medication.administrationTimesOther})`}
                              </td>
                              <td>
                                {medication.note
                                  && <span title={medication.note}><FontAwesome name="sticky-note" /></span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  }
                </div>
              }

              {student.medicalrecord &&
                <div style={{ marginTop: 20, borderTop: '1px solid #e4e4e4' }}>
                  <h5 style={{ textTransform: 'uppercase' }}>Guardians/Parents</h5>
                  {_.map(student.guardianList, parent => (
                    <ul key={parent.id} style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                      <li>{parent.name}</li>
                      <li><a href={`mailto:${parent.email}`}>{parent.email}</a></li>
                      {parent.phone && <li><a href={`tel:${parent.phone}`}>{parent.phone}</a></li>}
                    </ul>
                  ))}
                </div>
              }

              {student.studentnoteSet.length > 0 &&
                <div style={{ marginTop: 20, borderTop: '1px solid #e4e4e4' }}>
                  <h5 style={{ textTransform: 'uppercase' }}>Notes / Indicent Response</h5>
                  {_.map(student.studentnoteSet, note => (
                    <ul key={note.id} style={{ listStyleType: 'none', margin: 0, padding: '0 0 0 15px' }}>
                      <li>{note.staff.name} <span style={{ color: '#9d9d9d' }}><Moment date={note.created} fromNow /></span></li>
                      <li>{note.note}</li>
                    </ul>
                  ))}
                </div>
              }

            </Modal.Body>
          )
        }

        <Modal.Footer>
          Last modified:
          {' '}
          <Moment fromNow>{student && student.modified}</Moment>

          <button
            onClick={() => this.handleToggleStudentActivation(student.id)}
            style={{ marginLeft: 10, color: 'red', background: 'none', border: 'none' }}
          >
            {this.state.newStatus ? 'Delete Student' : 'Student Deleted. [Undo]'}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const TOGGLE_STUDENT_ACTIVATION = gql`
  mutation ToggleStudentActivation($id: Int!) {
    toggleStudentActivation(id: $id) {
      newStatus
    }
}`;
const STUDENT_PROFILE = gql`
  query StudentProfile($id: Int!) {
  student(id: $id) {
    id
    name
    dob
    isActive
    classroom
    getClassroomDisplay
    photoWaiver
    hasAllergies
    hasFoodAllergens
    allergenCount
    foodAllergenCount
    modified
    guardianList {
      id
      name
      email
      phone
    }
    studentnoteSet {
      id
      note
      created
      staff {
        id
        name
      }
    }
    medicalrecord {
      id
      guid
      height
      weight
      dietaryNeeds
      foodAllergens
      foodAllergenCount
      nonRxType
      getNonRxTypeDisplay
      nonRxNotes
      lastTetanus
      restrictions
      noTetanusVaccine
      allergies
      getAllergiesDisplay
      allergiesExpanded
      foodAllergens
      getFoodAllergensDisplay
      medicationSet {
        id
        guid
        medicationName
        amount
        amountUnit
        amountHuman
        administrationTimes
        administrationTimesOther
        getAmountUnitDisplay
        notes
      }
    }
  }
}`;

const StudentDetailModal = compose(
  graphql(STUDENT_PROFILE, {
    name: 'studentProfile',
    options: ownProps => ({
      pollInterval: 2000,
      variables: {
        id: ownProps.studentId
      }
    })
  }),
  graphql(TOGGLE_STUDENT_ACTIVATION, { name: 'toggleStudentActivation' })
)(StudentDetailModalContainer);

export default StudentDetailModal;
