import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export const DateField = (props) => {
  const {
    handleMonth,
    handleDay,
    handleYear,
    handleClear,
    minYear,
    maxYear,
    displayAgeCalc,
    displayBirthdayMessage,
    displayClearBtn,
    disabled,
    label,
    month,
    day,
    year,
    required
  } = props;

  const isValidDate = () => ((year >= minYear)
    && (year <= maxYear)
    && (month >= 1) && (month <= 12)
    && (day >= 1) && (day <= 31)
    && true
  );

  const calcAge = () => ((year >= minYear)
    && (year <= maxYear)
    && (month >= 0)
    && (month <= 11)
    && (day >= 1)
    && (day <= 31)
    ? moment().diff(moment([year, month, day], 'YYYY-MM-DD'), 'years')
    : null
  );

  const birthdayMessage = () => (
    isValidDate
      && (moment([year, month - 1, day]).format('MM-DD') === moment().format('MM-DD'))
      && (
        <span>
          Hey, Happy Birthday!
          {' '}
          <span role="img" aria-label="Party Popper">
            🎉
          </span>
        </span>
      )
  );

  return (
    <div className="rdf-wrapper">

      <label htmlFor="rdf-fieldset">
        {label}{required && <span style={{ color: 'red' }}>*</span>}
      </label>

      <fieldset id="rdf-fieldset">

        <select
          className="rdf-input-month"
          onChange={handleMonth}
          value={month || 0}
          disabled={disabled}
        >
          <option value={0} disabled>Month</option>
          {_.map(moment.months(), (mont, index) => (
            <option key={index} value={index + 1}>
              {mont}
            </option>
          ))}
        </select>

        <input
          className="rdf-input-day"
          type="number"
          placeholder="Day"
          onChange={handleDay}
          min="1"
          max="31" // @TODO adjust to month currently selected
          maxLength="2"
          required
          value={day}
          disabled={disabled}
        />

        <input
          className="rdf-input-year"
          type="number"
          placeholder="Year"
          onChange={handleYear}
          min={minYear}
          max={maxYear}
          maxLength="4"
          required
          value={year}
          disabled={disabled}
        />

        {displayClearBtn && isValidDate() && (
          <button type="button" onClick={() => handleClear()} className="rdf-btn-clear">
            Clear
          </button>
        )}

      </fieldset>

      {displayAgeCalc && isValidDate() && (
        <span className="rdf-age-display">
          {calcAge()}
          {' '}
          Years old
          {' '}
          {displayBirthdayMessage && birthdayMessage()}
        </span>
      )}

    </div>
  );
};

DateField.propTypes = {
  handleMonth: PropTypes.func.isRequired,
  handleDay: PropTypes.func.isRequired,
  handleYear: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
  minYear: PropTypes.number, // Set minimum year allowed
  maxYear: PropTypes.number, // Set maximum year allowed
  displayAgeCalc: PropTypes.bool, // display the calculated age
  displayBirthdayMessage: PropTypes.bool, // display the calculated age
  displayClearBtn: PropTypes.bool, // display the 'clear' button
  disabled: PropTypes.bool,
  label: PropTypes.string,
  month: PropTypes.number,
  day: PropTypes.number,
  year: PropTypes.number
};

DateField.defaultProps = {
  minYear: parseInt(moment().subtract(100, 'years').format('YYYY'), 10),
  maxYear: parseInt(moment().format('YYYY'), 10),
  displayAgeCalc: false,
  displayBirthdayMessage: false,
  displayClearBtn: true,
  disabled: false,
  label: 'Birth date',
  month: null,
  day: null,
  year: null
};
