import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { Alert, Button } from 'react-bootstrap';

import { MedicationFormItem } from './MedicationFormItem';

const MedicationForm = props => (
  <div>

    {props.formError &&
      <Alert bsStyle="danger">
        Please ensure that all fields are filled in correctly.
      </Alert>
    }

    {props.items &&
      props.items.map(item => (
        <MedicationFormItem
          key={item.id}
          item={item}
          handleRemove={props.handleRemove}
          handleMedMedicationName={props.handleMedMedicationName}
          handleMedAmountHuman={props.handleMedAmountHuman}
          handleMedNotes={props.handleMedNotes}
          handleMedAdministrationTimes={props.handleMedAdministrationTimes}
          handleMedAdministrationTimesOther={props.handleMedAdministrationTimesOther}
        />
      ))
    }

    <div style={{ marginTop: 5 }}>
      <Button bsStyle="primary" onClick={props.handleAdd}>
        <FontAwesome name="plus" fixedWidth /> Add another Medication
      </Button>
    </div>

  </div>
);

MedicationForm.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      medicationName: PropTypes.string,
      amountHuman: PropTypes.string,
      notes: PropTypes.string,
      administrationTimes: PropTypes.arrayOf(PropTypes.number),
      administrationTimesOther: PropTypes.string
    })
  ).isRequired,
  handleAdd: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleMedMedicationName: PropTypes.func.isRequired,
  handleMedAmountHuman: PropTypes.func.isRequired,
  handleMedNotes: PropTypes.func.isRequired,
  handleMedAdministrationTimes: PropTypes.func.isRequired,
  handleMedAdministrationTimesOther: PropTypes.func.isRequired,
  formError: PropTypes.bool.isRequired
};

export default MedicationForm;
