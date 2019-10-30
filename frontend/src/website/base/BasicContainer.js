import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-bootstrap';

BasicContainer.propTypes = {
  children: PropTypes.node
};

BasicContainer.defaultProps = {
  children: []
};

export default function BasicContainer(props) {
  return (
    <Grid className="grid-container">
      <div className="row-wrapper">
        {props.children}
      </div>
    </Grid>
  );
}
