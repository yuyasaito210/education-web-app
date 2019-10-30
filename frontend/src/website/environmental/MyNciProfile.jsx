import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-jsonschema-form';
import fields from 'react-jsonschema-form-extras';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Alert, Modal } from 'react-bootstrap';

class ModalUpdateMyProfile extends React.Component {

  static propTypes = {
    closeMyProfile: PropTypes.func.isRequired,
    updateMyProfile: PropTypes.func.isRequired,
    showMyProfile: PropTypes.bool.isRequired,
    me: PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      phone: PropTypes.string,
      title: PropTypes.string,
      // bio: PropTypes.string
    }).isRequired
  }

  state = {
    profileInstance: {
      email: this.props.me.email,
      name: this.props.me.name,
      phone: this.props.me.phone,
      title: this.props.me.title,
      // bio: this.props.me.bio
    },
    mutationSuccess: null,
    err: null
  }

  handleSubmit = ({ formData }) => {
    const i = this;
    this.props.updateMyProfile({ variables: formData })
      .then(({ data }) => {
        i.setState({
          mutationSuccess: true,
          profileInstance: data.updateMyProfile.account
        });
      }).catch((error) => {
        i.setState({ err: 'Error adding insurance details. Try again.' });
      });
  }

  render() {
    const props = this.props;

    const formSchema = {
      type: 'object',
      required: ['email', 'name', 'token'],
      properties: {
        email: {
          type: 'string',
          title: 'Your Email Address'
        },
        name: {
          type: 'string',
          title: 'Your Full Name'
        },
        phone: {
          type: 'string',
          title: 'Phone Number'
        },
        title: {
          type: 'string',
          title: 'Job Title'
        },
        // current_password: {
        //   type: 'string'
        // },
        // password: {
        //   type: 'string'
        // },
        // bio: {
        //   type: 'string',
        //   title: 'Short bio'
        // },
        token: {
          type: 'string',
          default: localStorage.token
        }
      }
    };
    const UiSchema = {
      // bio: {
      //   'ui:widget': 'textarea'
      // },
      // current_password: {
      //   'ui:widget': 'password'
      // },
      // password: {
      //   'ui:widget': 'password'
      // },
      token: {
        'ui:widget': 'hidden'
      }
    };

    return (
      <Modal show={props.showMyProfile} onHide={props.closeMyProfile} backdrop="static">

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">My NCI Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {this.state.err &&
            <Alert bsStyle="warning">{this.state.err}</Alert>
          }

          {this.state.mutationSuccess &&
            <Alert bsStyle="success">Your profile has been updated.</Alert>
          }

          <Form
            schema={formSchema}
            uiSchema={UiSchema}
            onSubmit={this.handleSubmit}
            fields={fields}
            formData={this.state.profileInstance}
          />

        </Modal.Body>
      </Modal>
    );
  }
}

const SUBMIT_UPDATE_MY_PROFILE = gql`
  mutation updateMyProfileMutation(
    $token: String!
    $email: String!
    $name: String!
    $phone: String
    $title: String
    # $bio: String
  ) {
    updateMyProfile(
      token: $token
      email: $email
      name: $name
      phone: $phone
      title: $title
      # bio: $bio
    ) {
      account {
        email
        name
        phone
        title
        # bio
      }
    }
  }
`;

const NciDashboardModalUpdateMyProfile = compose(
  graphql(SUBMIT_UPDATE_MY_PROFILE, { name: 'updateMyProfile' }),
)(ModalUpdateMyProfile);

export default NciDashboardModalUpdateMyProfile;
