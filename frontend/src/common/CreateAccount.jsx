import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Link } from 'react-router';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  Row, Col, Button, Alert, FormGroup, ControlLabel, FormControl, Checkbox
} from 'react-bootstrap';

import BasicContainer from '../website/base/BasicContainer';
import {
  getEmailValidationState, getPasswordValidationState, getFullNameValidationState, getPhoneValidationState
} from './utils/formValidators';

class CreateAccountContainer extends React.Component {
  static propTypes = {
    schoolList: PropTypes.shape({
      schools: PropTypes.array
    }).isRequired,
    submitCreateAccount: PropTypes.func.isRequired
  }

  state = {
    csrftoken: Cookies.get('csrftoken'),
    accountType: 'parent',
    currentSchool: [],
    email: '',
    password: '',
    name: '',
    phone: '',
    newsletterSignup: true,

    btnDisabled: false,

    err: null,
    signupSuccessTeacher: false
  }

  handleChangeAccountType = e => this.setState({ accountType: e.target.value })
  handleChangeEmail = e => this.setState({ email: e.target.value })
  handleChangePassword = e => this.setState({ password: e.target.value })
  handleChangename = e => this.setState({ name: e.target.value })
  handleChangePhone = e => this.setState({ phone: e.target.value })
  handleChangeNewsletterSubscribe = () => (
    this.setState({ newsletterSignup: !this.state.newsletterSignup })
  )

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ btnDisabled: true, err: null });

    if (_.isEmpty(this.state.accountType)) {
      this.setState({
        btnDisabled: false,
        err: 'You must select an account type'
      });
      return false;
    }

    if (_.isEmpty(this.state.currentSchool)) {
      this.setState({
        btnDisabled: false,
        err: 'You must select your current school'
      });
      return false;
    }

    const i = this;
    this.props.submitCreateAccount({
      variables: {
        accountType: this.state.accountType,
        email: this.state.email,
        password: this.state.password,
        name: this.state.name,
        phone: this.state.phone,
        newsletterSignup: this.state.newsletterSignup,
        currentSchool: this.state.currentSchool[0].id,
        csrftoken: this.state.csrftoken
      }
    })
      .then(({ data }) => {
        if (data.createAccountProfile.account.accountType === 'TEACHER' &&
            data.createAccountProfile.account.isActive === false) {
          i.setState({
            accountType: '',
            currentSchool: [],
            email: '',
            password: '',
            name: '',
            phone: '',
            newsletterSignup: true,
            btnDisabled: false,
            signupSuccessTeacher: true
          });
        } else {
          localStorage.token = data.createAccountProfile.account.guid;
          window.location.href = '/dashboard';
        }
      }).catch((error) => {
        i.setState({
          btnDisabled: false,
          err: String(error).replace('GraphQL error:', '')
        });
      });
  }

  handleAlertDismiss = () => {
    this.setState({ signupSuccessTeacher: false, err: null });
  }

  render() {
    return (
      <BasicContainer>
        <Row className="newrow" style={{ marginRight: 0 }}>
          <Col xs={12} sm={8} smOffset={2} md={6} mdOffset={3} lg={4} lgOffset={4}>

            <h1 className="top-50">Create Your Account</h1>

            <p>Already have an account? <Link to="/login">Sign in</Link></p>

            {this.state.err &&
              <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                {this.state.err}
              </Alert>
            }

            {this.state.signupSuccessTeacher
              ? <Alert bsStyle="success" onDismiss={this.handleAlertDismiss}>
                Your <strong>Teacher</strong> account has been created but requires NCI staff approval before you can log in. This can take up to 24 hours. If you're in a rush however, do not hesitate to <Link to="/contact">contact us</Link>.
              </Alert>
              : <form onSubmit={this.handleSubmit}>

                <input type="hidden" name="csrftoken" value={this.state.csrftoken} />

                <FormGroup controlId="accountTypeSelect">
                  <ControlLabel>Account Type*</ControlLabel>
                  <FormControl
                    componentClass="select"
                    value={this.state.accountType}
                    onChange={this.handleChangeAccountType}
                    required
                  >
                    <option disabled>Please select a type...</option>
                    <option value="parent">I'm a Parent sending my child(ren) to NCI</option>
                    <option value="teacher">I'm a Teacher bringing my classroom to NCI</option>
                  </FormControl>
                </FormGroup>

                <ControlLabel>Current School*</ControlLabel>
                <Typeahead
                  placeholder="Search Schools..."
                  onChange={currentSchool => this.setState({ currentSchool })}
                  options={
                    _.map(this.props.schoolList.schools, school => (
                      { id: school.id, label: school.name }
                    ))
                  }
                  selected={this.state.currentSchool.id && this.state.currentSchool}
                />
                <p className="help-block" style={{ marginTop: 5 }}>
                  NOTE: You can add additional schools once you've created your account if necessary.
                </p>

                <FormGroup
                  controlId="emailInput"
                  validationState={getEmailValidationState(this.state.email)}
                  style={{ marginBottom: 0 }}
                >
                  <ControlLabel>Your Email Address*</ControlLabel>
                  <FormControl
                    name="email"
                    type="email"
                    placeholder="me@example.com"
                    value={this.state.email}
                    onChange={this.handleChangeEmail}
                    minLength={5}
                    maxLength={75}
                    autoComplete="off"
                    required
                  />
                </FormGroup>
                <p className="help-block" style={{ marginTop: 5, marginBottom: 35 }}>
                  You'll use this to sign into NCI.
                </p>

                <FormGroup
                  controlId="passwordInput"
                  validationState={getPasswordValidationState(this.state.password)}
                  style={{ marginBottom: 35 }}
                >
                  <ControlLabel>Choose a Password*</ControlLabel>
                  <FormControl
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleChangePassword}
                    minLength={1}
                    maxLength={75}
                    autoComplete="off"
                    required
                  />
                </FormGroup>

                <FormGroup
                  controlId="nameInput"
                  validationState={getFullNameValidationState(this.state.name)}
                >
                  <ControlLabel>Your Full Name*</ControlLabel>
                  <FormControl
                    name="name"
                    type="text"
                    placeholder="Both first and last name..."
                    value={this.state.name}
                    onChange={this.handleChangename}
                    minLength={5}
                    maxLength={75}
                    required
                  />
                </FormGroup>

                <FormGroup
                  controlId="phoneInput"
                  validationState={getPhoneValidationState(this.state.phone)}
                >
                  <ControlLabel>Phone Number</ControlLabel>
                  <FormControl
                    name="name"
                    type="text"
                    placeholder="(555) 555-5555"
                    value={this.state.phone}
                    onChange={this.handleChangePhone}
                    minLength={7}
                    maxLength={25}
                  />
                </FormGroup>

                <FormGroup style={{ marginTop: 40, padding: '10px 10px 0 10px', border: '1px solid #dfdfdf', borderRadius: 4 }}>
                  <Checkbox
                    inline
                    checked={this.state.newsletterSignup}
                    onChange={this.handleChangeNewsletterSubscribe}
                  >
                    <span style={{ paddingLeft: 5 }}>I'd like to receive the NCI Newsletter</span>
                  </Checkbox>{' '}
                  <p className="help-block">
                    Subscribe to our monthly newsletter to stay up-to-date on all things NCI and outdoor environmental education!
                  </p>
                </FormGroup>

                <Button
                  type="submit"
                  bsSize="lg"
                  bsStyle="success"
                  style={{ marginTop: 20, marginRight: 15 }}
                  disabled={this.state.btnDisabled}
                  block
                >
                  Sign In
                </Button>

              </form>
            }

          </Col>
        </Row>
      </BasicContainer>
    );
  }
}

const SCHOOL_LIST = gql`
  query SchoolList{
    schools {
      id
      name
    }
  }`;

const SUBMIT_CREATE_ACCOUNT = gql`
  mutation SubmitCreateAccount(
    $email: String!
    $password: String!
    $accountType: String!
    $currentSchool: Int!
    $name: String!
    $phone: String!
    $newsletterSignup: Boolean
  ) {
     createAccountProfile(
      accountType: $accountType
      currentSchool: $currentSchool
      email: $email
      password: $password
      name: $name
      phone: $phone
      newsletterSignup: $newsletterSignup
    ) {
      account {
        id
        email
        isActive
        accountType
        guid
        assocSchoolList {
          id
          name
        }
      }
    }
  }`;

const CreateAccount = compose(
  graphql(SCHOOL_LIST, { name: 'schoolList' }),
  graphql(SUBMIT_CREATE_ACCOUNT, { name: 'submitCreateAccount' })
)(CreateAccountContainer);

export default CreateAccount;
