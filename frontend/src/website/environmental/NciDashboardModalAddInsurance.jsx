import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import Form from 'react-jsonschema-form';
import fields from 'react-jsonschema-form-extras';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Alert, Button, Modal } from 'react-bootstrap';

class ModalAddInsurance extends React.Component {

  static propTypes = {
    addInsurance: PropTypes.func.isRequired,
    showAddInsurance: PropTypes.bool.isRequired,
    instanceObj: PropTypes.shape({
      id: PropTypes.number,
      companyName: PropTypes.string,
      policyNum: PropTypes.string,
      groupNum: PropTypes.string,
      holderName: PropTypes.string,
      dependentsList: PropTypes.array
    }),
    deleteInsurance: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    dependentsList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    )
  }

  static defaultProps = {
    dependentsList: [],
    instanceObj: null
  }

  state = {
    success: null,
    err: null,
    formInstance: null
  }

  componentWillReceiveProps(nextProps) {
    nextProps.instanceObj &&
      this.setState({ formInstance: {
        id: nextProps.instanceObj.id,
        companyName: nextProps.instanceObj.companyName,
        policyNum: nextProps.instanceObj.policyNum,
        groupNum: nextProps.instanceObj.groupNum,
        holderName: nextProps.instanceObj.holderName,
        dependentsList: _.map(nextProps.instanceObj.dependentsList, 'id')
      } });
  }

  onHide = () => {
    this.setState({
      formInstance: null
    });
    this.props.onHide();
  }
  handleSubmit = ({ formData }) => {
    const i = this;
    this.props.addInsurance({ variables: formData })
      .then(({ data }) => {
        i.setState({
          success: true,
          formInstance: data.addInsurance
        });
        this.props.onHide();
      }).catch((error) => {
        i.setState({ err: 'Error adding insurance details. Try again.' });
      });
  }
  handleDeleteInsurnace = (objectId) => {
    const i = this;
    this.props.deleteInsurance({
      variables: { id: objectId, token: localStorage.token }
    }).then(({ data }) => {
      i.setState({
        formInstance: null,
        success: null,
        err: null
      });
      this.props.onHide();
    }).catch((error) => {
      i.setState({ err: 'Error removing record' });
    });
  }

  render() {
    const dependentsList = this.props.dependentsList;
    const dependentsListIds = _.map(dependentsList, dependent => dependent.id);

    const formSchema = {
      type: 'object',
      required: ['companyName', 'policyNum', 'groupNum', 'holderName'],
      properties: {
        companyName: {
          type: 'string',
          title: 'Name of Insurance Company'
        },
        policyNum: {
          type: 'string',
          title: 'Policy Number'
        },
        groupNum: {
          type: 'string',
          title: 'Group Number'
        },
        holderName: {
          type: 'string',
          title: 'Policy Holder\'s Name'
        },
        dependentsList: {
          title: 'Dependents',
          type: 'array',
          default: dependentsListIds,
          items: {
            type: 'number',
            enum: dependentsListIds,
            enumNames: _.map(dependentsList, dependent => dependent.name)
          },
          uniqueItems: true
        },
        token: {
          type: 'string',
          default: localStorage.token
        }
      }
    };

    const UiSchema = {
      dependentsList: {
        'ui:widget': 'checkboxes'
      },
      token: {
        'ui:widget': 'hidden'
      }
    };

    return (
      <Modal show={this.props.showAddInsurance} onHide={this.onHide} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Add Insurance</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {this.state.err &&
            <Alert bsStyle="warning">{this.state.err}</Alert>
          }

          <Form
            schema={formSchema}
            uiSchema={UiSchema}
            onSubmit={this.handleSubmit}
            fields={fields}
            formData={this.state.formInstance && this.state.formInstance}
          >
            <Button type="submit" bsStyle="info">Save</Button>
            {this.state.formInstance && this.state.formInstance.id > 0 &&
              <Button
                bsStyle="link"
                style={{ color: 'red' }}
                onClick={() => this.handleDeleteInsurnace(this.state.formInstance.id)}
              >
                Delete
              </Button>}

            {this.state.success &&
              this.state.formInstance &&
                <span style={{ fontStyle: 'italic', paddingLeft: 10, fontSize: '0.9em', color: '#868686' }}>
                  Last saved <Moment date={this.state.formInstance.modified} fromNow ago /> ago
                </span>
            }
          </Form>

        </Modal.Body>
      </Modal>
    );
  }
}

const SUBMIT_ADD_INSURANCE = gql`
  mutation addInsuranceMutation(
    $token: String!
    $companyName: String!
    $policyNum: String!
    $groupNum: String!
    $holderName: String!
    $dependentsList: String
  ) {
    addInsurance(
      token: $token
      companyName: $companyName
      policyNum: $policyNum
      groupNum: $groupNum
      holderName: $holderName
      dependentsList: $dependentsList
    ) {
      insurance {
        id
        policyNum
        policyNum
        holderName
        groupNum
        modified
        dependentsList {
          id
          firstName
        }
      }
    }
  }`;
const DELETE_INSURANCE = gql`
  mutation deleteInsuranceMutation(
    $token: String!
    $id: Int!
  ) {
    deleteInsurance(
      token: $token
      id: $id
    ) {
      insurance {
        id
      }
    }
  }`;

const NciDashboardModalAddInsurance = compose(
  graphql(SUBMIT_ADD_INSURANCE, { name: 'addInsurance' }),
  graphql(DELETE_INSURANCE, { name: 'deleteInsurance' }),
)(ModalAddInsurance);

export default NciDashboardModalAddInsurance;
