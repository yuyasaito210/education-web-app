import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-client-preset';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Router, browserHistory } from 'react-router';
import * as Sentry from '@sentry/browser';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'font-awesome/css/font-awesome.min.css';

import './website/style.css';

// react-router v3 routes
import routes from './routes';

Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

// GraphQL via Apollo Client
const httpLink = new HttpLink({
  credentials: 'same-origin'
});

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken'),
      'X-CSRF-Token': Cookies.get('csrftoken')
    }
  });
  return forward(operation);
});

const httpLinkWithCsrfToken = middlewareAuthLink.concat(httpLink);

const client = new ApolloClient({
  // link: httpLink,
  link: httpLinkWithCsrfToken,
  cache: new InMemoryCache(),
  queryDeduplication: true,
  shouldBatch: true
});

// On every internal route change, scroll the user back to the top of the page.
function handleUpdate() {
  if (this.state.location.action === 'PUSH') { window.scrollTo(0, 0); }
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router
      history={browserHistory}
      routes={routes}
      onUpdate={handleUpdate}
    />
  </ApolloProvider>,
  document.getElementById('root')
);
