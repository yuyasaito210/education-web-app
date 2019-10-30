import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-jsonschema-form';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Button, Modal } from 'react-bootstrap';

class NciTeacherRequestFieldTripModal extends React.Component {

  static propTypes = {
    showRequestFieldTrip: PropTypes.bool.isRequired,
    fieldtripRequest: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  }

  state = {
    success: null,
    err: null
  }

  onHide = () => {
    this.setState({ success: null });
    this.props.onHide();
  }

  handleSubmitFieldtripRequest = ({ formData }) => {
    const i = this;
    this.props.fieldtripRequest({ variables: formData })
      .then(({ data }) => {
        i.setState({ success: data.fieldtripRequest.success });
      }).catch((error) => {
        console.log(error);
        i.setState({ err: 'Error adding insurance details. Try again.' });
      });
  }

  render() {
    // console.log('NciTeacherRequestFieldTripModal props @@@@', this.props);
    // console.log('NciTeacherRequestFieldTripModal state @@@@', this.state);

    const requestFieldTripFormSchema = {
      type: 'object',
      properties: {
        prefferedContactMethod: {
          title: 'How would you like us to contact you?',
          type: 'number',
          uniqueItems: true,
          default: 1,
          enum: [1, 2],
          enumNames: [
            `Email (${this.props.me.email})`,
            `Phone (${this.props.me.phone})`
            // 'Other (please specify)'
          ]
        },
        token: {
          type: 'string',
          default: localStorage.token
        }
      }
    };

    const requestFieldTripUiSchema = {
      token: {
        'ui:widget': 'hidden'
      }
    };


    return (
      <Modal show={this.props.showRequestFieldTrip} onHide={this.props.onHide} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Book Your Next Field Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.success
            ? <div style={{ margin: '0 8px' }}>
              <p style={{ marginBottom: 15, fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>
                Your request has been submitted. We'll be in touch soon!
              </p>
              <Button onClick={this.onHide} style={{ marginBottom: 15 }}>Close</Button>
            </div>
            : <div style={{ margin: '0 8px' }}>
              <p style={{ marginBottom: 15, fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>
                Our NCI scheduling is always very busy so we typically start with a request/inquiry from you in which we follow up on to work out the details.
              </p>
              <Form
                schema={requestFieldTripFormSchema}
                uiSchema={requestFieldTripUiSchema}
                onSubmit={this.handleSubmitFieldtripRequest}
              >
                <p style={{ fontSize: '0.9em', color: '#969696', fontFamily: 'Helvetica, sans-serif' }}>
                  Note: Your email and phone can be updated via your Account Profile.
                </p>
                <Button bsStyle="info" type="submit" style={{ marginBottom: 15 }}>Submit Request</Button>
              </Form>
            </div>
          }
        </Modal.Body>
      </Modal>
    );
  }
}

const SUBMIT_FIELDTRIP_REQUEST = gql`
  mutation SubmitFieldTripRequestMutation($token: String!) {
    fieldtripRequest(token: $token) {
      success
    }
  }`;

export default graphql(SUBMIT_FIELDTRIP_REQUEST, {
  name: 'fieldtripRequest',
  options: {
    variables: {
      token: localStorage.token
    }
  }
})(NciTeacherRequestFieldTripModal);
