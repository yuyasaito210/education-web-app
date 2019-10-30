import React from 'react';
import { Link } from 'react-router';

export default function NavLink(props) {
  return (
    <Link
      activeStyle={{ color: '#33b778' }}
      activeClassName="active-nav"
      {...props}
    />
  );
}
