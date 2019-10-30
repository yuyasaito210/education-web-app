import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import { Table } from 'react-bootstrap';
// import PropTypes from 'prop-types';

import { schoolClassroomListPublic, schoolClassroomListMontessori, genderChoices, nonRxTypeChoices, allergyChoices, medicationAdminTimeChoices, foodAllergenChoices } from './formFieldChoices';

const StudentFormReview = ({ student, myInsuranceListQuery}) => {
  const allClassroomTypes = schoolClassroomListPublic.concat(schoolClassroomListMontessori);
  const getClassroomDisplay = _.find(allClassroomTypes, { id: student.classroom });
  const getGenderDisplay = _.find(genderChoices, { id: student.gender });
  const getNonRxTypeDisplay = _.find(nonRxTypeChoices, { id: student.nonRxType });

  // DIARY: Took a bit to figure out...
  const getAllergyChoices = _.filter(allergyChoices, v => _.includes(String(student.allergies).split(',').map(Number), v.id));
  const getFoodAllergenChoices = _.filter(foodAllergenChoices, v => _.includes(String(student.foodAllergens).split(',').map(Number), v.id));

  // const getExistingInsuranceById = myInsuranceListQuery &&
  //   _.filter(myInsuranceListQuery.me.insuranceSet, function(o) { return o.id === student.insId; });

  return (
    <div style={{ marginBottom: 20 }}>
      <Table className="student-form-review" condensed striped>
        <thead>
          <tr>
            <th colSpan={2}>Basic Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{student.name}</td>
          </tr>
          <tr>
            <td>Birth Date</td>
            <td>{moment([student.dobYear, student.dobMonth - 1, student.dobDay]).format('YYYY-MM-DD')} ({moment().diff([student.dobYear, student.dobMonth, student.dobDay], 'years')} Years old)</td>
          </tr>
          <tr>
            <td>School</td>
            <td>{(student.currentSchool.length > 0) && student.currentSchool[0].label}</td>
          </tr>
          <tr>
            <td>Classroom</td>
            <td>{getClassroomDisplay && getClassroomDisplay.label}</td>
          </tr>
        </tbody>

        {/* Medical ******************************************************* */}

        <thead>
          <tr>
            <th colSpan={2}>Medical Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gender</td>
            <td>{getGenderDisplay && getGenderDisplay.label}</td>
          </tr>
          <tr>
            <td>Height</td>
            <td>{student.height}</td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>{student.weight}</td>
          </tr>
          <tr>
            <td>Last Tetanus</td>
            <td>
              {student.noTetanusVaccine
                ? 'NO TETANUS'
                : moment([student.lastTetanusYear, student.lastTetanusMonth - 1, student.lastTetanusDay]).format('YYYY-MM-DD')
              }
            </td>
          </tr>
          <tr>
            <td>Health Insurance</td>
            <td>{student.insId && (student.insId > 0) && student.insId} {student.insCompanyName}</td>
          </tr>
          <tr>
            <td>Recent Trauma</td>
            <td>{student.recentTrauma}</td>
          </tr>
          <tr>
            <td>Restrictions</td>
            <td>{student.restrictions}</td>
          </tr>
        </tbody>

        {/* Medication **************************************************** */}

        <thead>
          <tr>
            <th colSpan={2}>Medication</th>
          </tr>
        </thead>
        <tbody>

          <tr>
            <td>Non-Rx Preference</td>
            <td>{getNonRxTypeDisplay && getNonRxTypeDisplay.label}</td>
          </tr>

          {student.nonRxNotes !== '' &&
            <tr>
              <td>Non-Rx Notes</td>
              <td>{student.nonRxNotes}</td>
            </tr>
          }

          {student.medicationSet && student.medicationSet.length > 0 &&
            <tr>
              <td>Medications</td>
              <td>
                <ul style={{ paddingLeft: 20 }}>
                  {_.map(student.medicationSet, med => {
                    const medAdminTimeAsArr = _.pull(String(med.administrationTimes).split(',').map(Number), 0);
                    const getMedicationAdminTimes = _.filter(medicationAdminTimeChoices, v => _.includes(medAdminTimeAsArr, v.id));
                    return (
                      <li key={med.id}>
                        {med.medicationName} ({med.amountHuman} every {_.map(getMedicationAdminTimes, timeChoice => (
                          timeChoice.id !== 5 &&
                            <span key={timeChoice.id}>{timeChoice.label},{' '}</span>
                        ))} {med.administrationTimesOther !== '' && `and ${med.administrationTimesOther}`})
                      </li>
                    )
                  })}
                </ul>
              </td>
            </tr>
          }

        </tbody>


        {/* Dietary ******************************************************* */}

        <thead>
          <tr>
            <th colSpan={2}>Allergies</th>
          </tr>
        </thead>
        <tbody>
          {student.allergies !== '' &&
            <tr>
              <td>Allergies:</td>
              <td>
                <ul style={{ paddingLeft: 20 }}>
                  {_.map(getAllergyChoices, allergyChoice => (
                    <li key={allergyChoice.id}>{allergyChoice.label}</li>
                  ))}
                </ul>
              </td>
            </tr>
          }
          {student.foodAllergens !== '' &&
            <tr>
              <td>Food Allergens:</td>
              <td>
                <ul style={{ paddingLeft: 20 }}>
                  {_.map(getFoodAllergenChoices, foodAllergenChoice => (
                    <li key={foodAllergenChoice.id}>{foodAllergenChoice.label}</li>
                  ))}
                </ul>
              </td>
            </tr>
          }
          {student.allergiesExpanded !== '' &&
            <tr>
              <td>Allergy Notes</td>
              <td>{student.allergiesExpanded}</td>
            </tr>
          }
        </tbody>

        {/* Dietary ******************************************************* */}

        {(student.dietaryNeeds !== '' || student.dietaryCaution) &&
          <thead>
            <tr>
              <th colSpan={2}>Dietary</th>
            </tr>
          </thead>
        }
        <tbody>
          {student.dietaryNeeds !== '' &&
            <tr>
              <td>Dietary Needs / Details</td>
              <td>{student.dietaryNeeds}</td>
            </tr>
          }
          {student.dietaryCaution &&
            <tr>
              <td>NCI to contact me about meals</td>
              <td>Yes</td>
            </tr>
          }
        </tbody>

      </Table>
    </div>
  );
};

export default StudentFormReview;
