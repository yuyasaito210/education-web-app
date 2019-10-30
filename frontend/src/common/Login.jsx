import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Row, Col, Button, Alert, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Link } from 'react-router';

import { validateEmail } from './utils/index';
import BasicContainer from '../website/base/BasicContainer';

class Login extends React.Component {

  static propTypes = {
    mutate: PropTypes.func.isRequired,
    location: PropTypes.shape({
      state: PropTypes.shape({
        nextPathname: PropTypes.string
      })
    }).isRequired
  }

  state = {
    email: '',
    password: '',
    err: null
  }

  getEmailValidationState = () => (
    (validateEmail(this.state.email) === true) ? 'success' : null
  )

  getPasswordValidationState = () => (
    (this.state.password.length >= 8) ? 'success' : null
  )

  handleChangeEmail = e => this.setState({ email: e.target.value })

  handleChangePassword = e => this.setState({ password: e.target.value })

  handleSubmit = (e) => {
    e.preventDefault();
    const i = this;
    this.props.mutate({
      variables: {
        email: this.state.email,
        password: this.state.password
      }
    })
      .then(({ data }) => {
        localStorage.token = data.login.account.guid;
        if (!_.isNil(i.props.location.state)) {
          if (i.props.location.state.nextPathname !== '') {
            window.location.assign(i.props.location.state.nextPathname);
          }
        } else {
          window.location.assign('/dashboard');
        }
        // ? browserHistory.push(i.props.location.state.nextPathname)
        // : browserHistory.push('/dashboard');
      }).catch((error) => {
        i.setState({ password: '', err: error });
      });
  }

  handleAlertDismiss = () => {
    this.setState({ err: null });
  }

  render() {
    return (
      <BasicContainer>
        <Row className="newrow">
          <Col md={4} mdOffset={4}>

            <h1 className="top-50">NCI Login</h1>

            <p><span>First time at NCI? <Link to="/signup">Create Your Account</Link></span></p>

            {this.state.err &&
              <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss} style={{ paddingTop: 5, paddingBottom: 5 }}>
                {String(this.state.err).replace('GraphQL error: ', '')}
              </Alert>
            }

            <form onSubmit={this.handleSubmit}>

              <FormGroup controlId="emailInput" validationState={this.getEmailValidationState()}>
                <ControlLabel>Your Email Address</ControlLabel>
                <FormControl
                  name="email"
                  type="email"
                  placeholder="me@example.com"
                  value={this.state.email}
                  onChange={this.handleChangeEmail}
                  minLength={5}
                  maxLength={75}
                  required
                  autoFocus
                  autoComplete={'off'}
                />
              </FormGroup>

              <FormGroup
                controlId="passwordInput"
                validationState={this.getPasswordValidationState()}
                style={{ marginBottom: 25 }}
              >
                <ControlLabel>Password</ControlLabel>
                <FormControl
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChangePassword}
                  minLength={1}
                  maxLength={75}
                  required
                  autoComplete={'off'}
                />
              </FormGroup>

              <Button type="submit" bsStyle="success" style={{ marginRight: 15 }}>
                Sign In
              </Button>

              <Link to="/reset">Forgot Your Password?</Link>

            </form>

          </Col>
        </Row>
      </BasicContainer>
    );
  }
}

const SUBMIT_LOGIN = gql`
  mutation SubmitLogin(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      account {
        id
        guid
      }
    }
  }`;

export default graphql(SUBMIT_LOGIN)(Login);
