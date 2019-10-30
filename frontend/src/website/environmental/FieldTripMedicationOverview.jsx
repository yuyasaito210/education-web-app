import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

export default class FieldTripMedicationOverview extends React.Component {

  static propTypes = {
    studentList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    ).isRequired
  }

  render() {
    return (
      <Table striped>
        {_.map(this.props.studentList, student => (
          student.medicalrecord && student.medicalrecord.medicationSet.length > 0 &&
            <tbody key={student.id}>
              <tr key={student.id}>
                <td>

                  <strong>{student.name}</strong>

                  <ul>
                    {_.map(student.medicalrecord.medicationSet, medication => (
                      <li key={medication.id}>
                        {medication.medicationName} {medication.amount} {medication.getAmountUnitDisplay} every {medication.administrationTimes}
                      </li>
                    ))}
                  </ul>

                </td>
                <td>
                  {student.dob}
                </td>
              </tr>
            </tbody>
        ))}
      </Table>
    );
  }
}
