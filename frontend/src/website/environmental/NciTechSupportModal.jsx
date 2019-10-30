import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-jsonschema-form';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Modal } from 'react-bootstrap';

class NciTechSupportModal extends React.Component {
  static propTypes = {
    submitTechSupportMessage: PropTypes.func.isRequired,
    handleCloseModal: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
  }

  handleSubmit = ({ formData }) => {
    const i = this;
    const { submitTechSupportMessage } = this.props;
    submitTechSupportMessage({ variables: formData })
      .then(({ data }) => {
        i.setState({ success: true });
      }).catch((error) => {
        i.setState({ err: 'Unable to send your message at this time. Try again later.' });
      });
  }

  render() {
    const { showModal, handleCloseModal } = this.props;
    const formSchema = {
      type: 'object',
      required: ['message', 'token'],
      properties: {
        message: {
          type: 'string',
          title: 'Message'
        },
        token: {
          type: 'string',
          default: localStorage.token
        }
      }
    };
    const UiSchema = {
      message: {
        'ui:widget': 'textarea',
        classNames: 'message-textarea'
      },
      token: {
        'ui:widget': 'hidden'
      }
    };

    return (
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>

          <Modal.Title>
            Help / Support
          </Modal.Title>

        </Modal.Header>
        <Modal.Body>

          <p style={{ marginBottom: 15, fontFamily: 'Helvetica, sans-serif', fontSize: '1em' }}>
            Send us a message if you need help or experience an issue using our website. We&apos;ll reply as quickly as we can.
          </p>

          <Form
            schema={formSchema}
            uiSchema={UiSchema}
            onSubmit={this.handleSubmit}
            // fields={fields}
            // formData={this.state.profileInstance}
          />

        </Modal.Body>
      </Modal>
    );
  }
}

const SUBMIT_TECH_SUPPORT_MESSAGE = gql`
  mutation SubmitTechSupportMessage($token: String!, $message: String!) {
    submitTechSupportMessage(message: $message, token: $token) {
      success
    }
  }
`;

export default graphql(SUBMIT_TECH_SUPPORT_MESSAGE, {
  name: 'submitTechSupportMessage',
  options: {
    variables: {
      token: localStorage.token
    }
  }
})(NciTechSupportModal);
