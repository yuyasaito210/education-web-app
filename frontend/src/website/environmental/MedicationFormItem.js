import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { Row, Col, FormControl, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';

import { medicationAdminTimeChoices } from './formFieldChoices';

export const MedicationFormItem = ({
  showCloseBtn,
  handleRemove,
  item,
  handleMedMedicationName,
  handleMedNotes,
  handleMedAmountHuman,
  handleMedAdministrationTimes,
  handleMedAdministrationTimesOther
}) => (
  <Row className="inline-formset-wrapper">

    {showCloseBtn && (
      <button
        onClick={() => handleRemove(item.id)}
        className="btn-close"
      >
        <FontAwesome name="close" fixedWidth />
      </button>
    )}

    <Col sm={6} md={6}>

      <FormGroup controlId="medicationNameInput">
        <ControlLabel>Name of Medication</ControlLabel>
        <FormControl
          type="text"
          placeholder="e.g. Claritin"
          onChange={e => handleMedMedicationName(item.id, e.target.value)}
          value={item.medicationName}
          autoFocus
        />
      </FormGroup>

      <FormGroup controlId="medicationNotes">
        <ControlLabel>Details / Addition instructions</ControlLabel>
        <FormControl
          componentClass="textarea"
          onChange={e => handleMedNotes(item.id, e.target.value)}
          value={item.notes}
          style={{ maxWidth: '100%', fontSize: '0.9em', minHeight: item.administrationTimes.includes(5) ? 184 : 127 }}
        />
        <FormControl.Feedback />
      </FormGroup>

    </Col>

    <Col sm={6} md={6}>

      <FormGroup controlId="medicationNameInput">
        <ControlLabel>Dosage amount</ControlLabel>
        <FormControl
          type="text"
          placeholder="e.g. '10 mL' or '2 puffs'..."
          onChange={e => handleMedAmountHuman(item.id, e.target.value)}
          value={item.amountHuman}
        />
      </FormGroup>

      <FormGroup controlId="administrationTimesArray">
        <ControlLabel>To be taken at:</ControlLabel>
        {_.map(medicationAdminTimeChoices, adminTime => (
          <Checkbox
            key={adminTime.id}
            checked={item.administrationTimes.length > 0 &&
              item.administrationTimes.includes(adminTime.id)
            }
            onChange={e => handleMedAdministrationTimes(
              item.id,
              String(adminTime.label).toLowerCase(),
              e.target.checked
            )}
          >{adminTime.label}</Checkbox>
        ))}
      </FormGroup>

      {item.administrationTimes.includes(5) && (
        <FormGroup controlId="administrationTimesOtherInput">
          <FormControl
            type="text"
            placeholder="e.g. 'As needed'..."
            onChange={e => handleMedAdministrationTimesOther(item.id, e.target.value)}
            value={item.administrationTimesOther}
          />
        </FormGroup>
      )}

    </Col>

  </Row>
);

MedicationFormItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    medicationName: PropTypes.string,
    amountHuman: PropTypes.string,
    notes: PropTypes.string,
    administrationTimes: PropTypes.arrayOf(PropTypes.number),
    administrationTimesOther: PropTypes.string
  }).isRequired,
  handleRemove: PropTypes.func,
  handleMedMedicationName: PropTypes.func.isRequired,
  handleMedAmountHuman: PropTypes.func.isRequired,
  handleMedNotes: PropTypes.func.isRequired,
  handleMedAdministrationTimes: PropTypes.func.isRequired,
  handleMedAdministrationTimesOther: PropTypes.func.isRequired,
  showCloseBtn: PropTypes.bool
};

MedicationFormItem.defaultProps = {
  handleRemove: null,
  showCloseBtn: true
};