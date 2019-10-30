import React from 'react';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
// import { Button } from 'react-bootstrap';

const name = props => (
  props.value
);

const renderPhotoWaiverCell = props => (
  <span>
    {props.value
      ? <FontAwesome name="camera" fixedWidth style={{ color: '#1ac354' }} />
      : <FontAwesome name="camera" fixedWidth style={{ color: '#ff6a2a' }} /> }
  </span>
);

const renderName = props => (
  props.value &&
    <span>
      <FontAwesome name="user" fixedWidth />{' '}
      {props.value}
    </span>
);

const renderFirstName = props => (
  props.value &&
    <span>
      <FontAwesome name="user" fixedWidth />{' '}
      {props.value}
    </span>
);

const renderLastName = props => (
  props.value &&
    <span>
      {props.value}
    </span>
);

const renderDobAsAge = props => (
  <span>
    {moment().diff(props.value, 'years')}
  </span>
);

// renderViewDetail: props => {
//   return (
//     <Button bsSize="sm">
//       <FontAwesome name="search" fixedWidth />{' '}
//       View Details
//     </Button>
//   )
// }

const renderHasAllergies = props => {
  // console.log(props);
  return (
    props.value === 'true'
      ? <span>Yes (<span style={{ color: 'red' }}>{parseInt(props.record.allergenCount, 10) + parseInt(props.record.foodAllergenCount, 10)}</span>)</span>
      : <span>No</span>
  );
};

const renderHasFoodAllergens = props => {
  // console.log(props);
  return (
    props.value === 'true'
      ? <span>Yes (<span style={{ color: 'red' }}>{props.record.foodAllergenCount}</span>)</span>
      : <span>No</span>
  );
};

const renderLastUpdated = props => {
  // console.log(props);
  return (
    <span>{moment(props.value).format('L')}</span>
  );
};

const renderSchoolName = props => (
  props.value && props.value.name &&
    <span>
      {props.value.name}
    </span>
);

const renderFileName = props => (
  props.value &&
    <span>
      {props.value}
    </span>
);

export {
  name,
  renderPhotoWaiverCell,
  renderName,
  renderDobAsAge,
  renderHasAllergies,
  renderHasFoodAllergens,
  renderLastUpdated,
  renderFirstName,
  renderLastName,
  renderSchoolName,
  renderFileName
};
