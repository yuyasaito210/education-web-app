import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
// import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import FilterableTable from 'react-filterable-table';
import {
  Modal, Label, Tabs, Tab
} from 'react-bootstrap';

import { renderDobAsAge, renderHasAllergies } from '../../common/TableCellFormatters';


import FieldTripMedicationOverview from './FieldTripMedicationOverview';

class TeacherFieldTripDetail extends React.Component {
  static propTypes = {
    showFieldTripDetail: PropTypes.bool.isRequired,
    onlyMyStudentsOnFieldTrip: PropTypes.shape({
      onlyMyStudentsOnFieldTrip: PropTypes.array
    }).isRequired,
    fieldTripDetail: PropTypes.shape({
      loading: PropTypes.bool,
      fieldtrip: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        regStartDate: PropTypes.string,
        regEndDate: PropTypes.string,
        startdDate: PropTypes.string,
        endDate: PropTypes.string,
        location: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
          address: PropTypes.string
        }),
        studentList: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string
          })
        ),
        schoolList: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string
          })
        )
      })
    }).isRequired,
    onHide: PropTypes.func.isRequired
  }

  state = {
    key: 1
  }

  handleSelect = (key) => {
    this.setState({ key });
  }

  render() {
    // console.log('NciTeacherFieldTripDetailModal props @@@@', this.props);

    const fieldtrip = this.props.fieldTripDetail.fieldtrip;
    const myStudentsOnly = this.props.onlyMyStudentsOnFieldTrip.onlyMyStudentsOnFieldTrip;

    // Fields to show in the table, and what object properties in the data they bind to
    const fields = [
      { name: 'firstName', displayName: 'First Name', inputFilterable: true, sortable: true },
      { name: 'lastName', displayName: 'Last Name', inputFilterable: true, sortable: true },
      { name: 'dob', displayName: 'Age', inputFilterable: true, sortable: true, render: renderDobAsAge },
      { name: 'hasAllergies', displayName: 'Allergies', inputFilterable: true, sortable: true, render: renderHasAllergies },
      // { name: 'hasFoodAllergens', displayName: 'Food Allergens', inputFilterable: true, sortable: true, render: renderHasFoodAllergens }
      // { name: 'id', displayName: null, render: renderViewDetail }
    ];

    const model = {
      id: null,
      firstName: null,
      lastName: null,
      dob: null,
      hasAllergies: null,
      hasFoodAllergens: null,
      allergenCount: null,
      foodAllergenCount: null
    };

    return (
      typeof fieldtrip !== 'undefined' && typeof myStudentsOnly !== 'undefined' &&
        <Modal show={this.props.showFieldTripDetail} onHide={this.props.onHide} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">Field Trip Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {/* <li><strong>Name</strong>: {fieldtrip.name}</li> */}
              <li><strong>Location</strong>: {fieldtrip.location.name}</li>
              <li><strong>Registration period</strong>: <Moment date={fieldtrip.regStartDate} format="MMM Do (ddd)" /> to <Moment date={fieldtrip.regEndDate} format="MMM Do (ddd)" /> {moment().isBetween(fieldtrip.regStartDate, fieldtrip.regEndDate, null, '[]') ? <Label bsStyle="success">Open</Label> : <Label>Closed</Label>} </li>
              <li><strong>Field trip duration ({moment(fieldtrip.endDate).diff(fieldtrip.startDate, 'days')} Days)</strong>: <Moment date={fieldtrip.startDate} format="MMM Do (ddd)" /> to <Moment date={fieldtrip.endDate} format="MMM Do (ddd)" />
                {' '}{moment().isBetween(fieldtrip.startDate, fieldtrip.endDate, null, '[]') && <Label bsStyle="success">In-Progress</Label>}</li>
              {/* <li><strong>Schools in attendence ({fieldtrip.schoolList.length})</strong>: {_.map(fieldtrip.schoolList, school => (
                <span key={school.id}><a href="#">{school.name}</a></span>))}{' '}</li> */}
              <li><strong>My Student count</strong>: {myStudentsOnly.length}</li>
            </ul>

            <Tabs
              activeKey={this.state.key}
              onSelect={this.handleSelect}
              id="controlled-tab-example"
            >
              <Tab eventKey={1} title="Student Manifest">

                {/* fieldtrip.schoolList.length > 1 &&
                  <p style={{ marginBottom: 15, fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>
                    <FontAwesome name="info-circle" fixedWidth /> Only students belonging to your own school are displayed below.
                  </p>
                */}

                <FilterableTable
                  namespace="Students"
                  initialSort="name"
                  data={_.map(_.sortBy(myStudentsOnly, 'lastName'), student => _.pick(student, _.keys(model)))}
                  fields={fields}
                  noRecordsMessage="There are no students to display"
                  noFilteredRecordsMessage="No students match your filters"
                  // topPagerVisible={false}
                  headerVisible={false}
                  pagersVisible={false}
                />

              </Tab>
              <Tab eventKey={2} title="Medical Overview">
                <FieldTripMedicationOverview studentList={typeof myStudentsOnly !== 'undefined' && myStudentsOnly} />
              </Tab>
              {/* <Tab eventKey={3} title="Housing" disabled>
                Housing
              </Tab> */}
            </Tabs>

          </Modal.Body>
        </Modal>
    );
  }
}

const FIELD_TRIP_DETAIL = gql`
  query FieldTripDetailQuery($id: Int!) {
    fieldtrip(
      id: $id
    ) {
      id
      name
      regStartDate
      regEndDate
      startDate
      endDate
      modified
      studentList {
        id
        hasAllergies
        hasAllergies
        hasFoodAllergens
        allergenCount
        foodAllergenCount
      }
      schoolList {
        id
        name
        modified
      }
      location {
        id
        name
        slug
      }
    }
  }`;
const ONLY_MY_STUDENTS_ON_FIELD_TRIP = gql`
  query OnlyMyStudentsOnFieldTrip($fieldTripId: Int!) {
    onlyMyStudentsOnFieldTrip(
      fieldTripId: $fieldTripId
    ) {
      id
      name
      firstName
      lastName
      dob
      hasAllergies
      hasAllergies
      hasFoodAllergens
      allergenCount
      foodAllergenCount
      modified
      medicalrecord {
        id
        allergies
        allergiesExpanded
        nonRxType
        nonRxNotes
        modified
        medicationSet {
          id
          medicationName
          administrationTimes
          administrationTimesOther
          amount
          amountUnit
        }
      }
      guardianList {
        id
        name
        email
        phone
      }
    }
  }`;

const NciTeacherFieldTripDetailModal = compose(
  graphql(FIELD_TRIP_DETAIL, {
    name: 'fieldTripDetail',
    options: ownProps => ({
      // pollInterval: 4800,
      variables: {
        id: ownProps.fieldTripId
      }
    })
  }),
  graphql(ONLY_MY_STUDENTS_ON_FIELD_TRIP, {
    name: 'onlyMyStudentsOnFieldTrip',
    options: ownProps => ({
      pollInterval: 4500,
      variables: {
        fieldTripId: ownProps.fieldTripId
      }
    })
  })
)(TeacherFieldTripDetail);

export default NciTeacherFieldTripDetailModal;
