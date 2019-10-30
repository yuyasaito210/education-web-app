import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Moment from 'react-moment';
import moment from 'moment';
import gql from 'graphql-tag';
import FilterableTable from 'react-filterable-table';
import { graphql, compose } from 'react-apollo';
import {
  Button, Table, Label, FormGroup, ControlLabel, FormControl
} from 'react-bootstrap';

import NciTeacherRequestFieldTripModal from './NciTeacherRequestFieldTripModal';
import NciTeacherFieldTripDetailModal from './NciTeacherFieldTripDetailModal';
import StudentDetailModal from './StudentDetailModal';
import {
  renderFirstName, renderLastName, renderDobAsAge, renderHasAllergies, renderPhotoWaiverCell, renderLastUpdated,
  renderSchoolName, renderFileName
} from '../../common/TableCellFormatters';

class TeacherDashboard extends React.Component {
  static propTypes = {
    me: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      accountType: PropTypes.string,
      title: PropTypes.string,
      bio: PropTypes.string
    }).isRequired,
    myFieldTrips: PropTypes.shape({
      loading: PropTypes.bool,
      myFieldTrips: PropTypes.arrayOf(
        PropTypes.shape({
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
          )
        })
      )
    }).isRequired,
    myStudents: PropTypes.shape({
      myStudents: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
          dob: PropTypes.string,
          getClassroomDisplay: PropTypes.string,
          modified: PropTypes.string
        })
      )
    }).isRequired,
    myFiles: PropTypes.shape({
      myFiles: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          file: PropTypes.object,
          fileName: PropTypes.string,
          isPublic: PropTypes.number,
          school: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
          })
        })
      )
    }).isRequired
  }

  state = {
    showStudentDetail: false,
    showFieldTripDetail: false,
    showRequestFieldTrip: false,
    selectedstudentObj: null,
    classroomFilter: 0
  };

  openRequestFieldTrip = () => this.setState({
    showRequestFieldTrip: true
  });

  closeRequestFieldTrip = () => this.setState({
    showRequestFieldTrip: false
  });

  openFieldTripDetail = fieldTripId => this.setState({
    showFieldTripDetail: true,
    fieldTripId
  });

  closeFieldTripDetail = () => this.setState({
    showFieldTripDetail: false,
    fieldTripId: null
  });

  openStudentDetail = studentObj => this.setState({
    showStudentDetail: true,
    selectedstudentObj: studentObj,
    selectedStudentId: studentObj.id
  });

  closeStudentDetail = () => this.setState({
    showStudentDetail: false,
    selectedstudentObj: null
  });

  handleSelectTicket = (e) => {
    this.setState({ classroomFilter: parseInt(e.target.value, 10) });
  }

  downloadSchoolFile = value => {
    const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;
    if (backendUrl) {
      var win = window.open(`${backendUrl}/media/${value}`, '_blank');
      win.focus();  
    }
  }

  renderViewDetail = props => (
    <Button bsSize="sm" onClick={() => this.openStudentDetail(props.record)}>
      <FontAwesome name="search" fixedWidth />
      {' '}
      View Details
    </Button>
  )

  renderViewDownload = props => (
    <Button bsSize="sm" onClick={() => this.downloadSchoolFile(props.value)}>
      <FontAwesome name="download" fixedWidth />
      {' '}
      Download
    </Button>
  )


  render() {
    // Fields to show in the table, and what object properties in the data they bind to
    const fields = [
      { name: 'firstName', displayName: 'First Name', inputFilterable: true, sortable: true, render: renderFirstName },
      { name: 'lastName', displayName: 'Last Name', inputFilterable: true, sortable: true, render: renderLastName },
      { name: 'dob', displayName: 'Age', inputFilterable: true, sortable: true, render: renderDobAsAge },
      { name: 'getClassroomDisplay', displayName: 'Classroom', inputFilterable: true, sortable: true },
      { name: 'hasAllergies', displayName: 'Allergies', inputFilterable: true, sortable: true, render: renderHasAllergies },
      { name: 'photoWaiver', displayName: 'Photo', sortable: true, render: renderPhotoWaiverCell },
      { name: 'modified', displayName: 'Last Updated', sortable: true, render: renderLastUpdated },
      { name: 'id', displayName: '', inputFilterable: false, sortable: false, render: this.renderViewDetail }
    ];
    // Our model shape for our table fields.
    // We use Lodash's `pick()` to inflate with data.
    const model = {
      id: null,
      firstName: null,
      lastName: null,
      dob: null,
      getClassroomDisplay: null,
      photoWaiver: null,
      hasAllergies: null,
      hasFoodAllergens: null,
      allergenCount: null,
      foodAllergenCount: null,
      modified: null
    };

    const classroomFilterOptions = (
      _.sortBy(
        _.uniqBy(
          _.map(this.props.myStudents.myStudents, student => (
            { id: student.classroom, name: student.getClassroomDisplay }
          )
        ), 'id')
      , 'id')
    );

    const fileModel = {
      // id: null,
      file: null,
      fileName: null,
      school: {
        id: null,
        name: null
      }
    }

    const fileFields = [
      { name: 'school', displayName: 'School Name', inputFilterable: false, sortable: true, render: renderSchoolName },
      { name: 'fileName', displayName: 'File Name', inputFilterable: true, sortable: true, render: renderFileName },
      { name: 'file', displayName: '', inputFilterable: false, sortable: false, render: this.renderViewDownload }
    ];
    
    return (
      <div>
        <h3>Field Trips</h3>

        <Table striped>
          <thead style={{ background: '#e4e4e4' }}>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Location</th>
              <th />
            </tr>
          </thead>
          <tbody>

            {this.props.myFieldTrips.myFieldTrips
              ? _.map(this.props.myFieldTrips.myFieldTrips, fieldtrip => (
                <tr key={fieldtrip.id}>

                  <td><strong><Moment date={fieldtrip.startDate} format="L" /></strong> <i><Moment date={fieldtrip.startDate} format="(dddd)" /></i></td>
                  <td><strong><Moment date={fieldtrip.endDate} format="L" /></strong> <i><Moment date={fieldtrip.endDate} format="(dddd)" /></i></td>

                  <td>
                    {moment(fieldtrip.endDate).diff(fieldtrip.startDate, 'days') + 1} days / {moment(fieldtrip.endDate).diff(fieldtrip.startDate, 'days')} nights{' '}
                    {moment().isBetween(fieldtrip.startDate, fieldtrip.endDate, null, '[]') && <Label bsStyle="success">In-Progress</Label>}
                  </td>

                  <td>{fieldtrip.location.name}</td>

                  <td style={{ textAlign: 'right' }}>
                    {moment(fieldtrip.startDate).isSameOrAfter() &&
                      <i><Moment date={fieldtrip.startDate} fromNow style={{ marginRight: 10, color: '#7d7d7d' }} /></i>
                    }
                    <Button bsSize="sm" onClick={() => this.openFieldTripDetail(fieldtrip.id)}>
                      <FontAwesome name="search" fixedWidth /> View Details
                    </Button>{' '}
                  </td>

                </tr>
              ))
              : <tr>
                <td colSpan={3}>
                  <span style={{ display: 'block', padding: 20 }}>No field trip information to display at this time.</span>
                </td>
              </tr>
            }

            {/* <tr>
              <td colSpan={3}>
                <Button onClick={this.openRequestFieldTrip} bsSize="sm" style={{ fontFamily: 'Helvetica, sans-serif' }}>
                  <FontAwesome name="plus" fixedWidth /> Book a Fieldtrip
                </Button>
              </td>
            </tr> */}

          </tbody>
        </Table>

        <h3 style={{ marginTop: 40 }}>My Files</h3>

        <p style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>This is a list of <strong>all</strong> the public files from your school.</p>

        {this.props.myFiles.myFiles &&
          <FilterableTable
            namespace="File"
            initialSort="school"
            data={_.map(
              this.props.myFiles.myFiles,
              file => _.pick(file, _.keys(fileModel))
            )}
            fields={fileFields}
            noRecordsMessage="There are no public files to display"
            noFilteredRecordsMessage="No public files match your filters"
            // topPagerVisible={false}
            // headerVisible={true}
            pagersVisible={false}
          />
        }


        <h3 style={{ marginTop: 40 }}>My Students</h3>

        <p style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>This is a list of <strong>all</strong> the students from your school.</p>

        {classroomFilterOptions.length > 1 &&
        <FormGroup controlId="classroomFilter">
          <ControlLabel>Classroom Filter:</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={this.handleSelectTicket}
            value={this.state.classroomFilter}
            style={{ width: 213 }}
          >
            <option value={0}>All Grades/Levels</option>
            {classroomFilterOptions.length > 1 &&
              _.map(classroomFilterOptions, classroom => (
                <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
              ))
            }
          </FormControl>
          <FormControl.Feedback />
        </FormGroup>
        }

        {this.props.myStudents.myStudents &&
          <FilterableTable
            namespace="Students"
            initialSort="lastName"
            data={_.map(
              this.state.classroomFilter > 0
                ? _.filter(this.props.myStudents.myStudents, {
                  classroom: this.state.classroomFilter
                })
                : this.props.myStudents.myStudents,
              student => _.pick(student, _.keys(model))
            )}
            fields={fields}
            noRecordsMessage="There are no students to display"
            noFilteredRecordsMessage="No students match your filters"
            // topPagerVisible={false}
            // headerVisible={true}
            pagersVisible={false}
          />
        }

        {this.state.showStudentDetail &&
          <StudentDetailModal
            onHide={this.closeStudentDetail}
            showStudentDetail={this.state.showStudentDetail}
            studentObj={this.state.selectedstudentObj ? this.state.selectedstudentObj : {}}
            studentId={this.state.selectedStudentId && this.state.selectedStudentId}
          />
        }

        <NciTeacherRequestFieldTripModal
          onHide={this.closeRequestFieldTrip}
          showRequestFieldTrip={this.state.showRequestFieldTrip}
          me={this.props.me}
        />

        {this.state.fieldTripId &&
          <NciTeacherFieldTripDetailModal
            onHide={this.closeFieldTripDetail}
            showFieldTripDetail={this.state.showFieldTripDetail}
            fieldTripId={this.state.fieldTripId}
          />
        }

        </div>
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
      location {
        id
        name
        slug
      }
      studentList {
        id
        firstName
        lastName
        name
      }
      schoolList {
        id
        name
        schooladdressSet {
          id
          streetAddress
        }
      }
    }
  }`;
const MY_STUDENTS = gql`
  query MyStudentsQuery {
    myStudents {
      id
      firstName
      lastName
      name
      dob
      classroom
      getClassroomDisplay
      photoWaiver
      hasAllergies
      hasFoodAllergens
      allergenCount
      foodAllergenCount
      modified
      guardianList {
        name
        email
        phone
      }
      currentSchool {
        id
        name
      }
    }
  }`;
const MY_FILES = gql`
  query MyFilesQuery {
    myFiles {
      id
      file
      fileName
      isPublic
      school {
        id
        name
      }
    }
  }`;

const NciDashboardTeacher = compose(
  graphql(MY_STUDENTS, {
    name: 'myStudents'
  }),
  graphql(MY_FIELDTRIPS, {
    name: 'myFieldTrips',
    options: {
      pollInterval: 4000,
      variables: {
        timeline: 'upcoming'
      }
    }
  }),
  graphql(MY_FILES, {
    name: 'myFiles',
  })
)(TeacherDashboard);

export default NciDashboardTeacher;
