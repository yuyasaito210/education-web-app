import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import gql from 'graphql-tag';
import SearchInput, { createFilter } from 'react-search-input';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const KEYS_TO_FILTERS = ['name', 'currentSchool.name'];

class NciAppFieldTripDetailContainer extends React.Component {

  static propTypes = {
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }

  state = {
    searchTerms: ''
  }

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  handleFilterList = (e) => {
    // console.log(e)
    this.setState({ searchTerms: e });
  }

  render() {
    const fieldtrip = this.props.data.fieldtrip &&
      this.props.data.fieldtrip;

    const filteredList = !_.isEmpty(fieldtrip) && fieldtrip.studentList.filter(createFilter(this.state.searchTerms, KEYS_TO_FILTERS));

    const studentListBySchool = fieldtrip &&
      _(filteredList).groupBy(e => e.currentSchool.name).map(
        (value, key) => ({ name: key, students: value })
      ).value();

    const dataSet1 = filteredList && filteredList.map(i => (
      {
        id: i.id,
        firstName: i.firstName,
        lastName: i.lastName,
        dob: i.dob,
        hasAllergies: i.hasAllergies,
        allergenCount: i.allergenCount,
        getNonRxTypeDisplay: i.medicalrecord.getNonRxTypeDisplay,
        nonRxNotes: i.medicalrecord.nonRxNotes,
        restrictions: i.medicalrecord.restrictions,
        weight: i.medicalrecord.weight,
        height: i.medicalrecord.height,
        getGenderDisplay: i.medicalrecord.getGenderDisplay,
        getAllergiesDisplay: i.medicalrecord.getAllergiesDisplay,
        getFoodAllergensDisplay: i.medicalrecord.getFoodAllergensDisplay,
        allergiesExpanded: i.medicalrecord.allergiesExpanded,
        dietaryNeeds: i.medicalrecord.dietaryNeeds,
        recentTrauma: i.medicalrecord.recentTrauma,
        dietaryCaution: i.medicalrecord.dietaryCaution,
        photoWaiver: i.photoWaiver
      }
    ));

    return (
      <div className="nciapp-fieldtrip-detail">

          {this.props.data.loading
            ? <span>Loading field trip details...</span>
            : <span>

              <div className="nci-navbar-header" style={{ position: 'sticky', top: 0, zIndex: 102 }}>
                <div className="nci-navbar-header-back">
                  <a href="/app"><FontAwesome name="chevron-left" fixedWidth /> Home</a>
                </div>
                <div className="nci-navbar-header-title">
                  <h2>Field Trip</h2>
                </div>
                <div className="nci-navbar-header-share">
                  {/* <a href=""><FontAwesome name="share-square-o" fixedWidth /></a> */}
                </div>
              </div>

              <div className="search-box" style={{ position: 'sticky', top: 50, zIndex: 102 }}>
                <FontAwesome name="search" />
                <SearchInput
                  className="search-input"
                  onChange={this.handleFilterList}
                  placeholder="Search this field trip..."
                  style={{ border: '1px solid #cccccc', padding: '5px 5px 5px 30px' }}
                />
              </div>

              <div className="fieldtrip-name-list-item" style={{ textAlign: 'center', color: '#5d5d5d' }}>
                {fieldtrip && fieldtrip.name}
                {/* <span className="pull-right">
                  <a href=""><FontAwesome name="sticky-note" /></a>
                  <FontAwesome name="chevron-right" style={{ color: '#cccccc' }} />
                </span> */}
              </div>

              <div className="fieldtrip-hud">
                <ul className="big-counts">
                  <li><span>{fieldtrip && fieldtrip.getTotalStudents}</span>Students</li>
                  <li><span>{fieldtrip && fieldtrip.getTotalAllergens}</span>Allergens</li>
                  <li><span>{fieldtrip && fieldtrip.getTotalDietaryRestrictions}</span>Dietary</li>
                  <li><span>{fieldtrip && fieldtrip.getTotalStudentNotes}</span>Notes</li>
                </ul>
              </div>

              {fieldtrip &&
                <div className="fieldtrip-menu-bar">
                  <ul>
                    <li>
                      <Link to={`/app/fieldtrip/${fieldtrip.id}/medlog`}>Med Log</Link>
                    </li>
                    <li>
                      <Link to={`/app/fieldtrip/${fieldtrip.id}/dietary`}>Dietary</Link>
                    </li>
                    <li>

                    <ExcelFile element={<button style={{ background: 'none', fontWeight: 'bold', display: 'block', width: '100%', color: '#337ab7', padding: 5, borderRadius: 6, border: '1px solid #377BB5' }}><FontAwesome name ="file-excel-o" /> Download as Excel File</button>}>
                        <ExcelSheet data={dataSet1} name="Students">
                            <ExcelColumn label="First Name" value="firstName"/>
                            <ExcelColumn label="Last Name" value="lastName"/>
                            <ExcelColumn label="Birth date" value="dob"/>
                            <ExcelColumn label="Allergies" value={(col) => col.hasAllergies === 'true' ? 'Yes' : ''} />
                            <ExcelColumn label="Allergen Count" value={(col) => col.allergenCount > 0 ? col.allergenCount : ''}/>
                            <ExcelColumn label="Non-Rx Type" value="getNonRxTypeDisplay"/>
                            <ExcelColumn label="Non-Rx Notes" value="nonRxNotes" />
                            <ExcelColumn label="Restrictions" value="restrictions" />
                            <ExcelColumn label="Weight" value="weight" />
                            <ExcelColumn label="Height" value="height" />
                            <ExcelColumn label="Gender" value="getGenderDisplay" />
                            <ExcelColumn label="Allergies" value="getAllergiesDisplay" />
                            <ExcelColumn label="Food Allergens" value="getFoodAllergensDisplay" />
                            <ExcelColumn label="Allergies Expanded" value="allergiesExpanded" />
                            <ExcelColumn label="Dietary Needs" value="dietaryNeeds" />
                            <ExcelColumn label="Recent Trauma" value="recentTrauma" />
                            <ExcelColumn label="Dietary Caution" value="dietaryCaution" />
                            <ExcelColumn label="Photo Waiver" value="photoWaiver" />
                        </ExcelSheet>
                    </ExcelFile>


                    </li>
                  </ul>
                </div>
              }

              <div className="student-list-by-school">
                <ul className="item-list">
                  {_.map(studentListBySchool, school => (
                    <ul key={school.name} className="item-list">
                      <li className="header" style={{ position: 'sticky', top: 102, zIndex: 101 }}>
                        {school.name}
                        <div className="pull-right">
                          <span className="header-badge"><FontAwesome name="user" />{school.students.length}</span>
                          {/* <FontAwesome name="chevron-right" style={{ marginLeft: 10, color: '#BDE5D2' }} /> */}
                        </div>
                      </li>
                      {_.map(school.students, student => (
                        <li key={student.id}>
                          <div className="pull-right">
                            {student.hasAllergies === 'true' && <FontAwesome name="exclamation-triangle" style={{ color: '#FECB2F', marginRight: 10 }} />}
                            <FontAwesome name="chevron-right" style={{ color: '#cccccc' }} />
                          </div>
                          <Link to={`/app/student/${student.id}`}>{student.name}</Link>
                          <div className=""></div>
                        </li>
                      ))}
                    </ul>
                  ))}
                  {this.state.searchTerms !== '' && <div className="center top-20">
                    <button onClick={() => this.setState({ searchTerms: '' })}>Clear Search</button>
                    </div>}
                </ul>
              </div>


            </span>
          }
      </div>
    );
  }
}

const FIELD_TRIP_DETAIL = gql`
  query NciAppFieldTripDetail($id: Int!) {
    fieldtrip(id: $id) {
      id
      name
      regStartDate
      regEndDate
      startDate
      endDate
      getWeekName
      getTotalStudents
      getTotalAllergens
      getTotalStudentNotes
      getTotalDietaryRestrictions
      location {
        id
        name
        foodMenuFile
      }
      studentList {
        id
        name
        firstName
        lastName
        dob
        hasAllergies
        hasFoodAllergens
        allergenCount
        photoWaiver
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
      }
    }
  }`;

const NciAppFieldTripDetail = compose(
  graphql(FIELD_TRIP_DETAIL, {
    options: ownProps => ({
      variables: {
        id: ownProps.params.id
      }
    })
  }),
  // graphql(DELETE_INSURANCE, { name: 'deleteInsurance' }),
)(NciAppFieldTripDetailContainer);

export default NciAppFieldTripDetail;
