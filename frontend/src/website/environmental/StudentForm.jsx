/* eslint no-eval: 0 */

import _ from 'lodash';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  Row, Col, Radio, Button, FormControl, FormGroup, ControlLabel, Checkbox
} from 'react-bootstrap';

import { genRandId } from '../../common/utils/index';
import { DateField } from '../../common/DateField';
import StudentFormReview from './StudentFormReview';
import MedicationForm from './MedicationForm';
import {
  schoolClassroomListPublic,
  schoolClassroomListMontessori,
  medicationAdminTimeChoices
} from './formFieldChoices';

const nonRxTypeList = [
  { id: 1, label: 'None' },
  { id: 2, label: 'Tylenol' },
  { id: 3, label: 'Ibuprofen' },
  { id: 4, label: 'Tylenol or Ibuprofen' }
];

class StudentFormContainer extends React.Component {
  static defaultProps = {
    selectedstudentObj: null
  }

  state = {
    // Form State, Helpers...
    step: 1,
    showStepError: false,

    // Step 1 ***********************************
    name: '',
    dobMonth: null,
    dobDay: null,
    dobYear: null,
    currentSchool: [],
    classroom: 0,
    photoWaiver: true,

    // Step 2 ***********************************
    gender: 0,
    lastTetanusMonth: null,
    lastTetanusDay: null,
    lastTetanusYear: null,
    noTetanusVaccine: false,
    height: '',
    weight: 0,
    insId: 0,
    insCompanyName: '',
    insPolicyNum: '',
    insGroupNum: '',
    insHolderName: '',
    deferIns: false,

    // Step 3 ***********************************
    recentTrauma: '',
    restrictions: '',

    // Step 4 ***********************************
    hasFoodAllergy: false,
    hasFoodAllergyMilk: false,
    hasFoodAllergyEggs: false,
    hasFoodAllergyPeanuts: false,
    hasFoodAllergySoy: false,
    hasFoodAllergyWheat: false,
    hasFoodAllergyTreeNuts: false,
    hasFoodAllergyFish: false,
    hasFoodAllergyShellfish: false,
    hasFoodAllergyOther: false,
    hasSkinAllergy: false,
    hasDustAllergy: false,
    hasInsectStingAllergy: false,
    hasAnimalAllergy: false,
    hasEyeAllergy: false,
    hasDrugAllergy: false,
    hasAllergicRhinitis: false,
    hasLatexAllergy: false,
    hasMoldAllergy: false,
    hasPollenAllergy: false,
    hasSinusAllergy: false,
    hasOtherAllergy: false,
    allergiesExpanded: '',
    allergies: [],
    foodAllergens: [],

    // Step 5 ***********************************
    nonRxType: 0,
    nonRxNotes: '',
    medicationSet: [],

    // Step 6 ***********************************
    dietaryNeeds: '',
    dietaryCaution: false,

    // Step 7 ***********************************
    waiverAgreement: false,
    medicalAgreement: false

  }

  // Check if we need to bind the form to an existing student object
  componentDidMount() {
    const nextProps = this.props;
    const { selectedstudentObj: s } = nextProps;
    if (!_.isEmpty(s) && (s.id > 0)) {
      // Existing student object found, lets set state with their details.
      // state properties are grouped in form steps to make it easier on us humans.
      this.setState({

        // Step 1 *******************************
        name: s.name,
        dobMonth: (parseInt(moment(s.dob).format('M'), 10)),
        dobDay: parseInt(moment(s.dob).format('D'), 10),
        dobYear: parseInt(moment(s.dob).format('YYYY'), 10),
        currentSchool: [{
          id: s.currentSchool.id,
          label: s.currentSchool.name
        }],
        classroom: s.classroom,
        photoWaiver: s.photoWaiver,

        // Step 2 *******************************
        gender: s.medicalrecord.gender,
        height: s.medicalrecord.height,
        weight: s.medicalrecord.weight,
        lastTetanusMonth: parseInt(moment(s.medicalrecord.lastTetanus).format('M'), 10),
        lastTetanusDay: parseInt(moment(s.medicalrecord.lastTetanus).format('D'), 10),
        lastTetanusYear: parseInt(moment(s.medicalrecord.lastTetanus).format('YYYY'), 10),
        noTetanusVaccine: s.medicalrecord.noTetanusVaccine,
        insId: (s.insuranceDependentsList.length > 0)
          && s.insuranceDependentsList[0].id, // FIXME It's an array...
        recentTrauma: s.medicalrecord.recentTrauma,
        restrictions: s.medicalrecord.restrictions,
        nonRxType: s.medicalrecord.nonRxType,
        nonRxNotes: s.medicalrecord.nonRxNotes,

        medicationSet: s.medicalrecord.medicationSet
        && (s.medicalrecord.medicationSet.length > 0)
          ? _.map(s.medicalrecord.medicationSet, med => ({
            id: med.id,
            administrationTimes: med.administrationTimes,
            administrationTimesOther: med.administrationTimesOther,
            medicationName: med.medicationName,
            amount: med.amount,
            amountHuman: med.amountHuman,
            amountUnit: med.amountUnit,
            getAmountUnitDisplay: med.getAmountUnitDisplay,
            notes: med.notes
          }))
          : [],
        // medicationSet: [
        //   ...s.medicalrecord.medicationSet
        // ],
        allergies: s.medicalrecord.allergies && eval(JSON.parse(s.medicalrecord.allergies)).join(','),

        hasFoodAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 1),
        hasSkinAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 2),
        hasDustAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 3),
        hasInsectStingAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 4),
        hasAnimalAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 5),
        hasEyeAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 6),
        hasDrugAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 7),
        hasAllergicRhinitis: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 8),
        hasLatexAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 9),
        hasMoldAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 10),
        hasPollenAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 11),
        hasSinusAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 12),
        hasOtherAllergy: s.medicalrecord.allergies && _.includes(JSON.parse(s.medicalrecord.allergies), 13),

        hasFoodAllergyMilk: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 1),
        hasFoodAllergyEggs: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 2),
        hasFoodAllergyPeanuts: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 3),
        hasFoodAllergySoy: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 4),
        hasFoodAllergyWheat: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 5),
        hasFoodAllergyTreeNuts: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 6),
        hasFoodAllergyFish: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 7),
        hasFoodAllergyShellfish: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 8),
        hasFoodAllergyOther: s.medicalrecord.foodAllergens && _.includes(JSON.parse(s.medicalrecord.foodAllergens), 9),

        allergiesExpanded: s.medicalrecord.allergiesExpanded,
        dietaryNeeds: s.medicalrecord.dietaryNeeds,
        dietaryCaution: s.medicalrecord.dietaryCaution
      });
    }
  }

  prevFormStep = () => {
    let { step } = this.state;
    this.setState({ step: step -= 1 });
  }

  nextFormStep = () => {
    let { step } = this.state;
    const {
      name,
      dobMonth,
      dobDay,
      dobYear,
      currentSchool,
      classroom,

      gender,
      height,
      weight,
      insId,

      nonRxType
    } = this.state;

    if (step === 1) {
      if (name === '') { this.setState({ nameValid: 'error' }); }
      if (dobMonth === null) { this.setState({ dobMonthValid: 'error' }); }
      if (dobDay === null) { this.setState({ dobDayValid: 'error' }); }
      if (dobYear === null) { this.setState({ dobYearValid: 'error' }); }
      if (currentSchool === 0) { this.setState({ currentSchoolValid: 'error' }); }

      if ((name === '') || (dobMonth === null) || (dobDay === null) || (dobYear === null) || (currentSchool.length === 0) || (classroom === 0)) {
        this.setState({ showStepError: true });
        return;
      }
      this.setState({ showStepError: false });
    }

    if (step === 2) {
      if (
        (gender === 0)
        || (height === '')
        || (weight === 0)
        // @TODO conditional checking between date val and no-vacine bool
        // || ((lastTetanusMonth === null) || (lastTetanusDay === null) || (lastTetanusYear === null) || noTetanusVaccine === false)
        || (insId === 0)
      ) {
        this.setState({ showStepError: true });
        return;
      }
      this.setState({ showStepError: false });
    }

    if (step === 4) {
      if (
        (gender === 0)
        || (height === '')
        || (weight === 0)
        || (insId === 0)
      ) {
        this.setState({ showStepError: true });
        return;
      }
      this.setState({ showStepError: false });
    }

    if (step === 5) {
      this.handleGetAllergySelection();
      this.handleGetFoodAllergenSelection();

      if (nonRxType === 0) {
        this.setState({ showStepError: true });
        return;
      }
      this.setState({ showStepError: false });
    }
    if (step === 7) {
      this.handleSubmit();
    } else {
      this.setState({ step: step += 1 });
    }
  }

  gotoStep = step => this.setState({ step });

  // Step 1
  handleInputName = e => this.setState({ name: e.target.value });
  handleDobMonth = e => this.setState({ dobMonth: parseInt(e.target.value, 10) });
  handleDobDay = e => this.setState({ dobDay: parseInt(e.target.value, 10) });
  handleDobYear = e => this.setState({ dobYear: parseInt(e.target.value, 10) });
  handleDobClear = () => this.setState({ dobMonth: null, dobDay: null, dobYear: null });
  handleClassroom = e => this.setState({ classroom: parseInt(e.target.value, 10) });

  // Step 2
  handleGender = e => this.setState({ gender: parseInt(e.target.value, 10) });
  handleHeight = e => this.setState({ height: e.target.value });
  handleWeight = e => this.setState({ weight: e.target.value });
  handleLastTetanusMonth = e => this.setState({ lastTetanusMonth: parseInt(e.target.value, 10) });
  handleLastTetanusDay = e => this.setState({ lastTetanusDay: parseInt(e.target.value, 10) });
  handleLastTetanusYear = e => this.setState({ lastTetanusYear: parseInt(e.target.value, 10) });
  handleLastTetanusClear = () => this.setState({ lastTetanusMonth: null, lastTetanusDay: null, lastTetanusYear: null });
  handleNoTetanusVaccine = e => this.setState({ noTetanusVaccine: e.target.checked });
  handleSelectedInsOption = e => this.setState({ insId: parseInt(e.target.value, 10) });
  handleInsCompanyName = e => this.setState({ insCompanyName: e.target.value });
  handleInsPolicyNum = e => this.setState({ insPolicyNum: e.target.value });
  handleInsGroupNum = e => this.setState({ insGroupNum: e.target.value });
  handleInsHolderName = e => this.setState({ insHolderName: e.target.value });
  handleDeferIns = e => this.setState({ deferIns: e.target.checked });
  handleRecentTrauma = e => this.setState({ recentTrauma: e.target.value });
  handleRestrictions = e => this.setState({ restrictions: e.target.value });
  handleNonRxType = e => this.setState({ nonRxType: parseInt(e.target.value, 10) });
  handleNonRxNotes = e => this.setState({ nonRxNotes: e.target.value });

  // The medicationSet is an empty array by default.
  handleInitMedicationList = () => {
    this.setState(
      state => ({
        medicationSet: state.medicationSet.concat(
          {
            id: genRandId(),
            medicationName: '',
            amountHuman: '',
            notes: '',
            administrationTimes: [],
            administrationTimesOther: ''
          }
        )
      }),
    );
  }

  handleMedicationAdd = () => {
    this.setState(
      state => ({
        medicationSet: state.medicationSet.concat(
          {
            id: genRandId(),
            medicationName: '',
            amountHuman: '',
            notes: '',
            administrationTimes: [],
            administrationTimesOther: ''
          }
        )
      })
    );
  }

  handleMedMedicationName = (id, medicationName) => {
    const items = this.state.medicationSet.slice();
    const index = items.findIndex(x => x.id === id);
    items[index] = { ...items[index], medicationName };
    this.setState({ medicationSet: items });
  }

  handleMedAmountHuman = (id, amountHuman) => {
    const items = this.state.medicationSet.slice();
    const index = items.findIndex(x => x.id === id);
    items[index] = { ...items[index], amountHuman };
    this.setState({ medicationSet: items });
  }

  /*
   * Push and pull Numbers out of an array representing administration times
   * of a particular medication item, updating state payload.
   */
  handleMedAdministrationTimes = (id, label, checked) => {
    // All the medication items this student has on-file, as an Array
    const items = this.state.medicationSet.slice();
    // Find the medication item in question and get it's index position
    const index = items.findIndex(x => x.id === id);
    // The medications admin times (an Array of Numbers)
    const x = items[index].administrationTimes;
    // Iterate through a helper object (see formFieldChoices.js) to match up
    // label to choice value. We then push it in, or pull it out of the array
    _.map(medicationAdminTimeChoices, (choice) => {
      if (label === String(choice.label).toLowerCase()) {
        checked
          ? x.push(choice.id)
          : _.pull(x, choice.id);
      }
    });
    // ...and inject the updated Array back into the medication item
    items[index] = { ...items[index], administrationTimes: x };
    // Update state; this.handleSubmit() will take it from there
    this.setState({ medicationSet: items });
  }

  handleMedAdministrationTimesOther = (id, administrationTimesOther) => {
    const items = this.state.medicationSet.slice();
    const index = items.findIndex(x => x.id === id);
    items[index] = { ...items[index], administrationTimesOther };
    this.setState({ medicationSet: items });
  }

  handleMedNotes = (id, notes) => {
    const items = this.state.medicationSet.slice();
    const index = items.findIndex(x => x.id === id);
    items[index] = { ...items[index], notes };
    this.setState({ medicationSet: items });
  }

  handleMedicationRemove = (id) => {
    this.setState({
      medicationSet: this.state.medicationSet.filter(item => item.id !== id)
    });
    // Now make a call to the backend to delete this record from the database
    const i = this;
    this.props.deleteMedication({
      variables: { id }
    }).then(({ data }) => {
      // this.props.closeModal();
      return;
    }).catch((error) => {
      i.setState({ err: 'Error removing record' });
    });
  }

  handleHasFoodAllergy = e => this.setState({ hasFoodAllergy: e.target.checked });
  handleSkinAllergy = e => this.setState({ hasSkinAllergy: e.target.checked });
  handleDustAllergy = e => this.setState({ hasDustAllergy: e.target.checked });
  handleInsectStingAllergy = e => this.setState({ hasInsectStingAllergy: e.target.checked });
  handleAnimalAllergy = e => this.setState({ hasAnimalAllergy: e.target.checked });
  handleEyeAllergy = e => this.setState({ hasEyeAllergy: e.target.checked });
  handleDrugAllergy = e => this.setState({ hasDrugAllergy: e.target.checked });
  handleAllergicRhinitis = e => this.setState({ hasAllergicRhinitis: e.target.checked });
  handleLatexAllergy = e => this.setState({ hasLatexAllergy: e.target.checked });
  handlePollenAllergy = e => this.setState({ hasPollenAllergy: e.target.checked });
  handleMoldAllergy = e => this.setState({ hasMoldAllergy: e.target.checked });
  handleSinusAllergy = e => this.setState({ hasSinusAllergy: e.target.checked });
  handleOtherAllergy = e => this.setState({ hasOtherAllergy: e.target.checked });
  handleAllergiesExpanded = e => this.setState({ allergiesExpanded: e.target.value });
  handleHasFoodMilk = e => this.setState({ hasFoodAllergyMilk: e.target.checked });
  handleHasFoodEggs = e => this.setState({ hasFoodAllergyEggs: e.target.checked });
  handleHasFoodPeanuts = e => this.setState({ hasFoodAllergyPeanuts: e.target.checked });
  handleHasFoodSoy = e => this.setState({ hasFoodAllergySoy: e.target.checked });
  handleHasFoodWheat = e => this.setState({ hasFoodAllergyWheat: e.target.checked });
  handleHasFoodTreeNuts = e => this.setState({ hasFoodAllergyTreeNuts: e.target.checked });
  handleHasFoodFish = e => this.setState({ hasFoodAllergyFish: e.target.checked });
  handleHasFoodShellfish = e => this.setState({ hasFoodAllergyShellfish: e.target.checked });
  handleHasFoodOther = e => this.setState({ hasFoodAllergyOther: e.target.checked });

  handleGetAllergySelection = () => {
    const { state } = this;
    const x = [];
    if (state.hasFoodAllergy === true) { x.push(1); }
    if (state.hasSkinAllergy === true) { x.push(2); }
    if (state.hasDustAllergy === true) { x.push(3); }
    if (state.hasInsectStingAllergy === true) { x.push(4); }
    if (state.hasAnimalAllergy === true) { x.push(5); }
    if (state.hasEyeAllergy === true) { x.push(6); }
    if (state.hasDrugAllergy === true) { x.push(7); }
    if (state.hasAllergicRhinitis === true) { x.push(8); }
    if (state.hasLatexAllergy === true) { x.push(9); }
    if (state.hasMoldAllergy === true) { x.push(10); }
    if (state.hasPollenAllergy === true) { x.push(11); }
    if (state.hasSinusAllergy === true) { x.push(12); }
    if (state.hasOtherAllergy === true) { x.push(13); }
    this.setState({ allergies: x.join() });
  }

  handleGetFoodAllergenSelection = () => {
    const { state } = this;
    const x = [];
    if (state.hasFoodAllergyMilk === true) { x.push(1); }
    if (state.hasFoodAllergyEggs === true) { x.push(2); }
    if (state.hasFoodAllergyPeanuts === true) { x.push(3); }
    if (state.hasFoodAllergySoy === true) { x.push(4); }
    if (state.hasFoodAllergyWheat === true) { x.push(5); }
    if (state.hasFoodAllergyTreeNuts === true) { x.push(6); }
    if (state.hasFoodAllergyFish === true) { x.push(7); }
    if (state.hasFoodAllergyShellfish === true) { x.push(8); }
    if (state.hasFoodAllergyOther === true) { x.push(9); }
    this.setState({ foodAllergens: x.join() });
  }
  handledietaryCaution = e => this.setState({ dietaryCaution: e.target.checked });
  handleDietaryNeeds = e => this.setState({ dietaryNeeds: e.target.value });
  handlePhotoWaiver = e => this.setState({ photoWaiver: e.target.checked });
  handleWaiverAgreement = e => this.setState({ waiverAgreement: e.target.checked });
  handleMedicationAgreement = e => this.setState({ medicalAgreement: e.target.checked });

  handleSubmit = () => {
    const { state } = this;
    const tetanusShot = moment([state.lastTetanusYear, state.lastTetanusMonth - 1, state.lastTetanusDay]).format('YYYY-MM-DD');
    // Fixes issue where tetanus shot could not be updated
    if (tetanusShot === 'Invalid date') {
        this.setState({ lastTetanus: null })
    } else {
        this.setState({ lastTetanus: tetanusShot })
    }
    const i = this;
    this.props.addOrModifyStudentMutation({
      variables: {
        id: this.props.selectedstudentObj && this.props.selectedstudentObj.id,
        isParentGuardian: true,

        name: i.state.name,
        dob: moment([this.state.dobYear, this.state.dobMonth - 1, this.state.dobDay]).format('YYYY-MM-DD'),
        currentSchoolId: i.state.currentSchool[0].id,
        classroom: i.state.classroom,

        // Medical Fields
        gender: i.state.gender,
        height: i.state.height,
        weight: i.state.weight,
        lastTetanus: (tetanusShot !== 'Invalid date') ? tetanusShot : null,
        noTetanusVaccine: i.state.noTetanusVaccine,
        recentTrauma: i.state.recentTrauma,
        restrictions: i.state.restrictions,

        // Health Insurance Fields
        insId: (parseInt(i.state.insId, 10) !== -1) && i.state.insId,
        insCompanyName: i.state.insCompanyName,
        insPolicyNum: i.state.insPolicyNum,
        insGroupNum: i.state.insGroupNum,
        insHolderName: i.state.insHolderName,

        // Medications (Non-Rx) Fields
        nonRxType: i.state.nonRxType,
        nonRxNotes: i.state.nonRxNotes,
        medicationSet: i.state.medicationSet,

        // Allery Fields
        allergies: this.state.allergies,
        foodAllergens: this.state.foodAllergens,
        allergiesExpanded: i.state.allergiesExpanded,

        // Dietary Fields
        dietaryNeeds: i.state.dietaryNeeds,
        dietaryCaution: i.state.dietaryCaution,

        // Opt-ins, Outs
        photoWaiver: i.state.photoWaiver,
        waiverAgreement: i.state.waiverAgreement,
        medicalAgreement: i.state.medicalAgreement
      }
    })
      .then(({ data }) => {
        i.setState({ step: 8, data });
      }).catch((error) => {
        const err = String(error).replace('GraphQL error:', '');
        i.setState({ err });
      });
  }

  handleDelete = () => {
    const i = this;
    this.props.deleteStudent({
      variables: { id: this.props.selectedstudentObj.id }
    }).then(({ data }) => {
      this.props.closeModal();
    }).catch((error) => {
      i.setState({ err: 'Error removing record' });
    });
  }

  render() {
    const { selectedstudentObj: studentObj, schoolList, closeModal } = this.props;
    const {
      step,
      showStepError,
      name,
      nameValid,
      dobMonth,
      dobDay,
      dobYear,
      currentSchool,
      currentSchoolValid,
      classroom,
      // classroomSchoolValid
    } = this.state;

    const currentSchoolType = (currentSchool.length > 0)
      && _.find(schoolList.schools, { id: currentSchool[0].id }).schoolType;

    const schoolTypeClassroomOptions = currentSchoolType === 'MONTESSORI'
      ? schoolClassroomListMontessori
      : schoolClassroomListPublic;

    return (
      <div className="student-form">

        <button onClick={closeModal} className="close-btn" type="button">
          <FontAwesome name="close" />
        </button>

        {/* Display section header for all steps but the final */}
        {(step !== 8)
          && (
            <span>
              <h3 className="center modal-header" onClick={() => console.log(this.state)}>
                {studentObj ? name : 'Add Your Child'}
              </h3>

              <div className="step-bar">
                <ul>
                  <li className={step === 1 && 'active'}>Basic</li>
                  <li className={(step === 2 || step === 3) && 'active'}>Medical</li>
                  <li className={step === 4 && 'active'}>Allergies</li>
                  <li className={step === 5 && 'active'}>Medications</li>
                  <li className={step === 6 && 'active'}>Dietary</li>
                </ul>
              </div>
            </span>
          )
        }

        {/* Step 1 ************************** */}
        {(step === 1)
          && (
            <div className="form-step">

              <FormGroup controlId="name" validationState={nameValid}>
                <ControlLabel>Child's name<span style={{ color: 'red' }}>*</span></ControlLabel>
                <FormControl
                  type="text"
                  placeholder="First and Last name..."
                  onChange={this.handleInputName}
                  value={name}
                  required
                  autoFocus
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="birthdate">
                <DateField
                  handleMonth={this.handleDobMonth}
                  handleDay={this.handleDobDay}
                  handleYear={this.handleDobYear}
                  handleClear={this.handleDobClear}
                  minYear={2000}
                  maxYear={2015}
                  month={dobMonth}
                  day={dobDay}
                  year={dobYear}
                  displayBirthdayMessage
                  displayAgeCalc
                  required
                />
              </FormGroup>

              <FormGroup controlId="currentSchool" validationState={currentSchoolValid}>
                <ControlLabel>Current School<span style={{ color: 'red' }}>*</span></ControlLabel>
                <Typeahead
                  placeholder="Search Schools..."
                  onChange={currentSchoolSelected => this.setState({ currentSchool: currentSchoolSelected })}
                  selected={currentSchool}
                  options={_.map(schoolList.schools, school => (
                    { id: school.id, label: school.name }
                  ))}
                />
              </FormGroup>

              <FormGroup controlId="accountTypeSelect">
                <ControlLabel>Classroom/Grade Level<span style={{ color: 'red' }}>*</span></ControlLabel>
                <FormControl
                  componentClass="select"
                  value={classroom}
                  onChange={this.handleClassroom}
                  required
                >
                  <option value={0} disabled>Please select a class...</option>
                  {_.map(schoolTypeClassroomOptions, classroom => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.label}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>

              <FormGroup style={{ marginTop: 30, padding: '10px 10px 0 10px', border: '1px solid #dfdfdf', borderRadius: 4 }}>
                <Checkbox
                  inline
                  checked={this.state.photoWaiver}
                  onChange={this.handlePhotoWaiver}
                >
                  <span style={{ paddingLeft: 5, fontWeight: 'bold' }}>Photo waiver</span>
                </Checkbox>{' '}
                <p className="help-block">
                  Keep this checked if you are ok with your child being cited in photos we sometimes post to our website or use in presentations. Your child's name and other personal information are never cited.
                </p>
              </FormGroup>

              {showStepError && (
                <div style={{ background: '#ffe1e1', margin: '15px 0', padding: 15 }}>
                  Please check the required form fields before continuing
                </div>
              )}

              <div className="step-footer">
                {this.props.selectedstudentObj &&
                  <Button bsStyle="link" className="btn-form-step-prev btn-link-delete" onClick={this.handleDelete}>
                    <FontAwesome name="trash" /> Delete
                  </Button>
                }
                <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">
                  Next
                </Button>
              </div>

            </div>
          )
        }

        {/* Step 2 ************************** */}
        {(step === 2) &&
          <div className="form-step">

            <Row>

              <Col sm={7} md={7}>

                <FormGroup>
                  <ControlLabel>Gender<span style={{ color: 'red' }}>*</span></ControlLabel>
                  <FormControl
                    componentClass="select"
                    value={this.state.gender}
                    onChange={this.handleGender}
                    style={{ maxWidth: 290 }}
                    required
                  >
                    <option value={0} disabled>Choose...</option>
                    <option value={1}>Female</option>
                    <option value={2}>Male</option>
                    <option value={3}>Gender fluid</option>
                    <option value={4}>Non-binary / Third gender</option>
                    <option value={5}>Prefer to self-describe</option>
                    <option value={6}>Prefer not to say</option>
                  </FormControl>
                </FormGroup>

                <FormGroup>
                  <DateField
                    label="Last Tetanus"
                    minYear={2000}
                    style={{ opacity: this.state.noTetanusVaccine && 0.5 }}
                    handleMonth={this.handleLastTetanusMonth}
                    handleDay={this.handleLastTetanusDay}
                    handleYear={this.handleLastTetanusYear}
                    handleClear={this.handleLastTetanusClear}
                    month={this.state.lastTetanusMonth}
                    day={this.state.lastTetanusDay}
                    year={this.state.lastTetanusYear}
                    disabled={this.state.noTetanusVaccine}
                    required
                  />

                  <Checkbox
                    checked={this.state.noTetanusVaccine}
                    onChange={this.handleNoTetanusVaccine}
                  >
                    Not vaccinated for Tetanus
                  </Checkbox>
                </FormGroup>

              </Col>

              <Col sm={5} md={5}>

                <FormGroup controlId="name">
                  <ControlLabel>Height (feet and inches)<span style={{ color: 'red' }}>*</span></ControlLabel>
                  <FormControl
                    type="text"
                    placeholder="e.g. 4' 3&quot;"
                    onChange={this.handleHeight}
                    value={this.state.height}
                    style={{ maxWidth: 290 }}
                  />
                  <FormControl.Feedback />
                </FormGroup>

                <FormGroup controlId="name">
                  <ControlLabel>Weight (lbs)<span style={{ color: 'red' }}>*</span></ControlLabel>
                  <FormControl
                    type="number"
                    placeholder="e.g. 65lbs"
                    onChange={this.handleWeight}
                    value={this.state.weight}
                    style={{ maxWidth: 290 }}
                  />
                  <FormControl.Feedback />
                </FormGroup>

              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <FormGroup controlId="accountTypeSelect" style={{ marginTop: 15 }}>
                  <ControlLabel style={{ marginBottom: 10 }}>Health Insurance Provider<span style={{ color: 'red' }}>*</span></ControlLabel>
                  <FormControl
                    componentClass="select"
                    value={this.state.insId}
                    onChange={this.handleSelectedInsOption}
                    required
                  >
                    <option value={0} disabled>New or existing provider...</option>
                    {this.props.myInsuranceListQuery && _.map(this.props.myInsuranceListQuery.me.insuranceSet, ins => (
                      <option key={ins.id} value={ins.id}>{ins.companyName} ({ins.policyNum})</option>
                    ))}
                    <option value={-1}>Add New Provider{this.state.name && ` for ${this.state.name}`}...</option>
                  </FormControl>

                  <p className="help-block top-10" style={{ marginBottom: 0 }}>
                    Having your insurance information on-file will help us communicate with your health provider more effecively. Should we ever have to use this information, all correspondence will be recorded and reported back to you.
                  </p>
                </FormGroup>

                {this.state.insId === -1 &&
                  <span>

                    {this.state.deferIns !== true &&
                      <FormGroup controlId="name" validationState={this.state.nameValid} style={{ marginBottom: 15, padding: '10px 15px 20px 15px', border: '1px solid #dfdfdf', background: '#FFFDF2', borderRadius: 4 }}>
                        <ControlLabel>Name of Insurance Company</ControlLabel>
                        <FormControl type="text" onChange={this.handleInsCompanyName} value={this.state.insCompanyName} />
                        <FormControl.Feedback />

                        <ControlLabel style={{ marginTop: 10 }}>Policy Number</ControlLabel>
                        <FormControl type="text" onChange={this.handleInsPolicyNum} value={this.state.insPolicyNum} />
                        <FormControl.Feedback />

                        <ControlLabel style={{ marginTop: 10 }}>Group Number</ControlLabel>
                        <FormControl type="text" onChange={this.handleInsGroupNum} value={this.state.insGroupNum} />
                        <FormControl.Feedback />

                        <ControlLabel style={{ marginTop: 10 }}>Policy Holder's Name</ControlLabel>
                        <FormControl type="text" onChange={this.handleInsHolderName} value={this.state.insHolderName} />
                        <FormControl.Feedback />
                      </FormGroup>
                    }

                    <Checkbox checked={this.state.deferIns} onChange={this.handleDeferIns}>
                      I'll provide this information at a later time.
                    </Checkbox>

                  </span>
                }
              </Col>
            </Row>

            {showStepError && (
              <div style={{ background: '#ffe1e1', margin: '15px 0', padding: 15 }}>
                Please check the required form fields before continuing
              </div>
            )}

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">Next</Button>
            </div>
          </div>
        }

        {/* Step 3 ************************** */}
        {(step === 3) &&
          <div className="form-step">
            <FormGroup controlId="recentTrauma">
              <ControlLabel>Has anything happened recently in your child’s life that may affect him/her emotionally or physically while at Nature’s Classroom Institute? If yes, please explain.</ControlLabel>
              <FormControl
                componentClass="textarea"
                onChange={this.handleRecentTrauma}
                value={this.state.recentTrauma}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup controlId="restrictions">
              <ControlLabel>Are there any restrictions on your child’s activities? Please include any special health concerns (i.e. recent hospitalizations, fractured bones, etc.)</ControlLabel>
              <FormControl
                componentClass="textarea"
                onChange={this.handleRestrictions}
                value={this.state.restrictions}
              />
              <FormControl.Feedback />
            </FormGroup>

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">Next</Button>
            </div>
          </div>
        }

        {/* Step 4 ************************** */}
        {(step === 4) &&
          <div className="form-step">

            <Row>
              <Col sm={6} md={6}>
                <Checkbox checked={this.state.hasFoodAllergy} onChange={this.handleHasFoodAllergy}>Food Allergy</Checkbox>
                {this.state.hasFoodAllergy &&
                  <span style={{ display: 'block', marginLeft: 20, paddingLeft: 10, borderLeft: '3px solid #c8c8c8' }}>
                    <Checkbox checked={this.state.hasFoodAllergyMilk} onChange={this.handleHasFoodMilk}>Milk</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyEggs} onChange={this.handleHasFoodEggs}>Eggs</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyPeanuts} onChange={this.handleHasFoodPeanuts}>Peanuts</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergySoy} onChange={this.handleHasFoodSoy}>Soy</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyWheat} onChange={this.handleHasFoodWheat}>Wheat</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyTreeNuts} onChange={this.handleHasFoodTreeNuts}>Tree nuts</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyFish} onChange={this.handleHasFoodFish}>Fish</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyShellfish} onChange={this.handleHasFoodShellfish}>Shellfish</Checkbox>
                    <Checkbox checked={this.state.hasFoodAllergyOther} onChange={this.handleHasFoodOther}>Other</Checkbox>
                  </span>
                }
                <Checkbox checked={this.state.hasSkinAllergy} onChange={this.handleSkinAllergy}>Skin Allergy</Checkbox>
                <Checkbox checked={this.state.hasDustAllergy} onChange={this.handleDustAllergy}>Dust Allergy</Checkbox>
                <Checkbox checked={this.state.hasInsectStingAllergy} onChange={this.handleInsectStingAllergy}>Insect Sting Allergy</Checkbox>
                <Checkbox checked={this.state.hasAnimalAllergy} onChange={this.handleAnimalAllergy}>Animal Allergies</Checkbox>
                <Checkbox checked={this.state.hasEyeAllergy} onChange={this.handleEyeAllergy}>Eye Allergy</Checkbox>
                <Checkbox checked={this.state.hasOtherAllergy} onChange={this.handleOtherAllergy}>Other</Checkbox>
              </Col>
              <Col sm={6} md={6}>
                <Checkbox checked={this.state.hasDrugAllergy} onChange={this.handleDrugAllergy}>Drug Allergies</Checkbox>
                <Checkbox checked={this.state.hasAllergicRhinitis} onChange={this.handleAllergicRhinitis}>Allergic Rhinitis (hay fever)</Checkbox>
                <Checkbox checked={this.state.hasLatexAllergy} onChange={this.handleLatexAllergy}>Latex Allergy</Checkbox>
                <Checkbox checked={this.state.hasMoldAllergy} onChange={this.handleMoldAllergy}>Mold Allergy</Checkbox>
                <Checkbox checked={this.state.hasPollenAllergy} onChange={this.handlePollenAllergy}>Pollen Allergy</Checkbox>
                <Checkbox checked={this.state.hasSinusAllergy} onChange={this.handleSinusAllergy}>Sinus Infection</Checkbox>
              </Col>
            </Row>

            <FormGroup style={{ marginTop: 20 }}>
              <ControlLabel>Details / additional comments...</ControlLabel>
              <FormControl
                componentClass="textarea"
                onChange={this.handleAllergiesExpanded}
                value={this.state.allergiesExpanded}
              />
              <FormControl.Feedback />
            </FormGroup>

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">Next</Button>
            </div>
          </div>
        }

        {/* Step 5 ************************** */}
        {(step === 5) &&
          <div className="form-step">

            <FormGroup>
              <ControlLabel><span style={{ color: 'red' }}>*</span> If necessary, NCI can provide over-the-counter pain relief. Which of these pain relief choices do you prefer administered if your child becomes ill, gets a headache, catches a cold or older *minor* medical or dental issues.</ControlLabel>
              {nonRxTypeList.map(i => (
                <Radio
                  key={i.id}
                  onChange={this.handleNonRxType}
                  value={i.id}
                  name="nonRxType"
                  checked={this.state.nonRxType === i.id}
                >
                  {i.label}
                </Radio>
              ))}
            </FormGroup>


            <FormGroup controlId="nonRxNotes" style={{ marginTop: 25 }}>
              <ControlLabel>Any non-prescrition medical instructions, conditions or comments?</ControlLabel>
              <FormControl
                componentClass="textarea"
                onChange={this.handleNonRxNotes}
                value={this.state.nonRxNotes}
              />
              <FormControl.Feedback />
            </FormGroup>

            {_.isEmpty(this.state.medicationSet)
              ? <Button bsStyle="primary" onClick={this.handleInitMedicationList}>
                <FontAwesome name="plus" fixedWidth /> Add Medication
              </Button>
              : <MedicationForm
                items={this.state.medicationSet}
                handleAdd={this.handleMedicationAdd}
                handleRemove={this.handleMedicationRemove}
                handleMedMedicationName={this.handleMedMedicationName}
                handleMedAmountHuman={this.handleMedAmountHuman}
                handleMedNotes={this.handleMedNotes}
                handleMedAdministrationTimes={this.handleMedAdministrationTimes}
                handleMedAdministrationTimesOther={this.handleMedAdministrationTimesOther}
              />
            }

            {showStepError && (
              <div style={{ background: '#ffe1e1', margin: '15px 0', padding: 15 }}>
                Please check a pain relief option above.
              </div>
            )}

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">Next</Button>
            </div>
          </div>
        }

        {/* Step 6 ************************** */}
        {(step === 6) &&
          <div className="form-step">

            <FormGroup controlId="dietaryNeeds">
              <ControlLabel>Dietary Needs / Details</ControlLabel>
              <FormControl
                componentClass="textarea"
                onChange={this.handleDietaryNeeds}
                value={this.state.dietaryNeeds}
              />
              <FormControl.Feedback />
            </FormGroup>

            <Checkbox checked={this.state.dietaryCaution} onChange={this.handledietaryCaution}>
              Please have NCI contact me about my child's diet
            </Checkbox>

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsSize="lg" bsStyle="success">Review</Button>
            </div>
          </div>
        }

        {/* Step 7 ************************** */}
        {(step === 7) &&
          <div className="form-step">

            <StudentFormReview
              student={this.state}
              myInsuranceListQuery={this.props.myInsuranceListQuery}
            />

            <FormGroup style={{ background: '#fff6b5', padding: '10px 10px 0 10px', border: '1px solid #dfdfdf', borderRadius: 4 }}>
              <Checkbox
                inline
                checked={this.state.waiverAgreement}
                onChange={this.handleWaiverAgreement}
              >
                <span style={{ paddingLeft: 5, fontWeight: 'bold' }}>Medical Authorization, Youth Waiver & Release of Liability</span>
              </Checkbox>{' '}
              <p className="help-block">
                I have read the medical authorization, waiver and release, and understand my rights by signing it and sign it voluntarily. <a href="/discovernci_media/waiver.pdf" target="_blank" rel="noopener noreferrer">View Waiver and Release of Liability Agreement</a>.
              </p>
            </FormGroup>

            <FormGroup style={{ background: '#fff6b5', padding: '10px 10px 0 10px', border: '1px solid #dfdfdf', borderRadius: 4 }}>
              <Checkbox
                inline
                checked={this.state.medicationAgreement}
                onChange={this.handleMedicationAgreement}
              >
                <span style={{ paddingLeft: 5, fontWeight: 'bold' }}>Permission to Dispense Medication</span>
              </Checkbox>{' '}
              <p className="help-block">
                I hereby certify that the medical information I have provided in this form, for my student, is true and correct. By checking this box, I am giving express permission to Nature’s Classroom Institute Environmental Education, Inc. to dispense medications to my student or work with my student’s school and school’s policy to dispense medications as per the instructions I have provided in this online registration form.
              </p>
            </FormGroup>

            {this.state.err
              && (
                <div style={{ background: '#ffe1e1', padding: 10 }}>
                  {this.state.err}
                </div>
              )
            }

            <div className="step-footer">
              <Button bsStyle="link" className="btn-form-step-prev" onClick={this.prevFormStep}>Back</Button>
              <Button className="btn-form-step-next" onClick={this.nextFormStep} bsStyle="success" disabled={(!this.state.waiverAgreement || !this.state.medicalAgreement)}>Save</Button>
            </div>
          </div>
        }

        {/* Step 8 ************************** */}
        {(step === 8) &&
          <div className="form-step center">

            <span style={{ display: 'block', marginTop: 50, fontSize: '7em', color: '#5cc700', lineHeight: 0 }}><FontAwesome name="check-circle" /></span>
            <h3 style={{ lineHeight: '1.3em' }}>{this.state.name}
              <br />has been added successfully.</h3>
            <div className="step-footer">
              <Button className="btn-form-step-next" onClick={this.props.closeModal}>Close</Button>
            </div>
          </div>
        }

      </div>
    );
  }
}

const MY_INSURANCE_LIST_QUERY = gql`
  query {
    me {
      id
      insuranceSet {
        id
        companyName
        policyNum
      }
    }
  }`;

const ADD_STUDENT_MUTATION = gql`
  mutation AddStudentQuery(
    $id: Int
    $isParentGuardian: Boolean
    $parentGuardianEmail: String

    $name: String!
    $dob: String!
    $currentSchoolId: Int!
    $classroom: Int!

    $gender: Int
    $height: String
    $weight: String
    $lastTetanus: String
    $noTetanusVaccine: Boolean
    $recentTrauma: String
    $restrictions: String

    $insId: Int
    $insCompanyName: String
    $insGroupNum: String
    $insPolicyNum: String
    $insHolderName: String

    $nonRxType: Int!
    $nonRxNotes: String
    $medicationSet: String

    $allergies: String
    $foodAllergens: String
    $allergiesExpanded: String

    $dietaryNeeds: String
    $dietaryCaution: Boolean

    $photoWaiver: Boolean
    $waiverAgreement: Boolean!
    $medicalAgreement: Boolean!
  ) {
    addOrModifyStudent(
      id: $id
      isParentGuardian: $isParentGuardian
      parentGuardianEmail: $parentGuardianEmail

      name: $name
      dob: $dob
      currentSchoolId: $currentSchoolId
      classroom: $classroom

      gender: $gender
      height: $height
      weight: $weight
      lastTetanus: $lastTetanus
      noTetanusVaccine: $noTetanusVaccine
      recentTrauma: $recentTrauma
      restrictions: $restrictions

      insId: $insId
      insCompanyName: $insCompanyName
      insGroupNum: $insGroupNum
      insPolicyNum: $insPolicyNum
      insHolderName: $insHolderName

      nonRxType: $nonRxType
      nonRxNotes: $nonRxNotes
      medicationSet: $medicationSet

      allergies: $allergies
      foodAllergens: $foodAllergens
      allergiesExpanded: $allergiesExpanded

      dietaryNeeds: $dietaryNeeds
      dietaryCaution: $dietaryCaution

      photoWaiver: $photoWaiver
      waiverAgreement: $waiverAgreement
      medicalAgreement: $medicalAgreement
    ) {
      student {
        id
        name
        guid
        created
        dob
        photoWaiver
        modified
        waiverAgreement
        medicalAgreement
        guardianList {
          id
          email
        }
      }
      medicalRecord {
        id
        gender
        height
        weight
        lastTetanus
        noTetanusVaccine
        recentTrauma
        restrictions
        created
        nonRxType
        nonRxNotes
        allergies
        foodAllergens
        allergiesExpanded
        dietaryNeeds
        dietaryCaution
        modified
      }
      insurance {
        id
        companyName
        groupNum
        policyNum
        holderName
        modified
        dependentsList {
          id
          firstName
        }
        account {
          id
          name
        }
      }
    }
  }`;

const DELETE_STUDENT = gql`
  mutation DeleteStudentMutation(
    $id: Int!
  ) {
    deleteStudent(
      id: $id
    ) {
      success
    }
  }`;

const DELETE_MEDICATION = gql`
  mutation DeleteMedicationMutation(
    $id: Int!
  ) {
    deleteMedication(
      id: $id
    ) {
      success
    }
  }`;

const StudentForm = compose(
  graphql(ADD_STUDENT_MUTATION, { name: 'addOrModifyStudentMutation' }),
  graphql(MY_INSURANCE_LIST_QUERY, { name: 'myInsuranceListQuery' }),
  graphql(DELETE_STUDENT, { name: 'deleteStudent' }),
  graphql(DELETE_MEDICATION, { name: 'deleteMedication' })
)(StudentFormContainer);

export default StudentForm;
