import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  Login,
  Logout,
  PasswordReset,
  PasswordResetConfirm,
  CreateAccount,
  requireAuth
} from './common';

import {
  WebsiteWrapper,
  Error404Page,
  NciDashboard
} from './website';

import {
  NciApp,
  NciAppFieldTripDetail,
  NciAppFieldTripMedLog,
  NciAppFieldTripDietary,
  NciAppFieldTripMedLogTable,
  NciAppStudentDetail,
  NciAppGuardianDetail,
  NciAppStudentWaiver,
  NciAppAddMedication,
  ApproveAccountProfile
} from './portal';

export default (
  <div>

    <Route path="/" component={WebsiteWrapper}>
      <IndexRoute component={NciDashboard} />

      <Route path="/dashboard" component={NciDashboard} onEnter={requireAuth} />

      <Route path="/login" component={Login} />
      <Route path="/logout" component={Logout} />
      <Route path="/signup" component={CreateAccount} />
      <Route path="/reset" component={PasswordReset} />
      <Route path="/reset/:uidb64/:token" component={PasswordResetConfirm} />
      <Route path="/approve/:token/:school" component={ApproveAccountProfile} />

    </Route>

    <Route path="/app" component={NciApp} onEnter={requireAuth} />
    <Route path="/app/fieldtrip/:id" component={NciAppFieldTripDetail} onEnter={requireAuth} />
    <Route path="/app/fieldtrip/:id/medlog" component={NciAppFieldTripMedLog} onEnter={requireAuth} />
    <Route path="/app/fieldtrip/:id/dietary" component={NciAppFieldTripDietary} onEnter={requireAuth} />
    <Route path="/app/fieldtrip/:id/medlog/table" component={NciAppFieldTripMedLogTable} onEnter={requireAuth} />
    <Route path="/app/student/:id" component={NciAppStudentDetail} onEnter={requireAuth} />
    <Route path="/app/student/:id/add-medication" component={NciAppAddMedication} onEnter={requireAuth} />
    <Route path="/app/student/:id/waiver" component={NciAppStudentWaiver} onEnter={requireAuth} />
    <Route path="/app/guardian/:id" component={NciAppGuardianDetail} onEnter={requireAuth} />

    <Route path="*" component={Error404Page} />

  </div>
);
