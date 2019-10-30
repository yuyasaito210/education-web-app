import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Button } from 'react-bootstrap';

import { genRandId } from '../../common/utils/index';
import { medicationAdminTimeChoices } from '../../website/environmental/formFieldChoices';
import { MedicationFormItem } from '../../website/environmental/MedicationFormItem';

class NciAppAddMedicationContainer extends React.Component {
  static propTypes = {
    addOrModifyMedicationMutation: PropTypes.func.isRequired,
    data: PropTypes.shape({
      loading: PropTypes.bool,
      student: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    }).isRequired
  }

  state = {
    submitDisabled: false,
    id: genRandId(),
    medicationName: '',
    amountHuman: '',
    notes: '',
    administrationTimes: [],
    administrationTimesOther: ''
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  handleMedMedicationName = (medId, v) => this.setState({ medicationName: v });
  handleMedAmountHuman = (medId, v) => this.setState({ amountHuman: v });
  handleMedAdministrationTimesOther = (medId, v) => this.setState({ administrationTimesOther: v });
  handleMedNotes = (medId, v) => this.setState({ notes: v });

  handleMedAdministrationTimes = (id, label, checked) => {
    const x = this.state.administrationTimes;
    _.map(medicationAdminTimeChoices, (choice) => {
      if (label === String(choice.label).toLowerCase()) {
        checked
          ? x.push(choice.id)
          : _.pull(x, choice.id);
      }
    });
    this.setState({
      administrationTimes: x
    });
  }

  handleSubmit = () => {
    const i = this;
    this.setState({ submitDisabled: true });
    this.props.addOrModifyMedicationMutation({
      variables: {
        // id: this.state.id,
        studentId: this.props.data.student.id,
        medicationName: this.state.medicationName,
        amountHuman: this.state.amountHuman,
        notes: this.state.notes,
        administrationTimes: this.state.administrationTimes,
        administrationTimesOther: this.state.administrationTimesOther
      }
    })
      .then(({ data }) => {
        window.history.back();
      }).catch((error) => {
        const err = String(error).replace('Error: GraphQL error:', '');
        i.setState({ err: `Error adding student: ${err}` });
      });
  }

  render() {
    const student = this.props.data.student && this.props.data.student;
    return (
      <div className="nciapp-fieldtrip-detail">
        {this.props.data.loading
          ? <span>Loading student trip details...</span>
          : this.props.data.error
            ? <span>{String(this.props.data.error.message).replace('GraphQL error:', '')}</span>
            : <span>
              <div className="nci-navbar-header">
                <div className="nci-navbar-header-back">
                  <button onClick={() => window.history.back()} style={{ background: 'none', padding: 0, border: 'none' }}>
                    <FontAwesome name="chevron-left" fixedWidth />{' '}Back
                  </button>
                </div>
                <div className="nci-navbar-header-title">
                  <h2>Add Medication</h2>
                </div>
                <div className="nci-navbar-header-share">
                  {/* <a href=""><FontAwesome name="share-square-o" fixedWidth /></a> */}
                </div>
              </div>

              <div className="student-profile-header">
                <div className="profile-photo-fa">
                  <FontAwesome name="user-circle" />
                </div>
                <h2>{student.name}</h2>
                <p style={{ marginBottom: 10 }}>
                  {moment().diff(student.dob, 'years')} y/o, {student.medicalrecord.getGenderDisplay}
                </p>
              </div>

              <div style={{ margin: '0 20px' }}>
                <MedicationFormItem
                  item={{
                    id: this.state.id,
                    medicationName: this.state.medicationName,
                    amountHuman: this.state.amountHuman,
                    notes: this.state.notes,
                    administrationTimes: this.state.administrationTimes,
                    administrationTimesOther: this.state.administrationTimesOther
                  }}
                  handleRemove={this.handleRemove}
                  handleMedMedicationName={this.handleMedMedicationName}
                  handleMedAmountHuman={this.handleMedAmountHuman}
                  handleMedNotes={this.handleMedNotes}
                  handleMedAdministrationTimes={this.handleMedAdministrationTimes}
                  handleMedAdministrationTimesOther={this.handleMedAdministrationTimesOther}
                  showCloseBtn={false}
                />

                <Button bsStyle="primary" onClick={this.handleSubmit} disabled={this.state.submitDisabled}>
                  Submit
                </Button>
              </div>
            </span>
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
      dob
      classroom
      currentSchool {
        id
        name
      }
      medicalrecord {
        id
        getGenderDisplay
      }
    }
  }`;
const SAVE_MEDICATION = gql`
  mutation AddOrModifyMedicationMutation(
    $studentId: Int!
    $medicationName: String!
    $medicationId: Int
    $amountHuman: String!
    $administrationTimes: [Int]
    $administrationTimesOther: String
    $notes: String
  ) {
    addOrModifyMedication(
      studentId: $studentId
      medicationName: $medicationName
      medicationId: $medicationId
      amountHuman: $amountHuman
      administrationTimes: $administrationTimes
      administrationTimesOther: $administrationTimesOther
      notes: $notes
    ) {
      medication {
        id
        medicationName
        amountHuman
        administrationTimes
        administrationTimesOther
        getAmountUnitDisplay
        notes
        modified
      }
    }
  }`;

const NciAppAddMedication = compose(
  graphql(STUDENT_DETAIL, {
    options: ownProps => ({
      variables: {
        id: ownProps.params.id
      }
    })
  }),
  graphql(SAVE_MEDICATION, {
    name: 'addOrModifyMedicationMutation',
    options: ownProps => ({
      variables: {
        studentId: ownProps.params.id
      }
    })
  }),
)(NciAppAddMedicationContainer);

export default NciAppAddMedication;
