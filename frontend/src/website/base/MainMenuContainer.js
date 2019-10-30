import _ from 'lodash';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';
import { Navbar, NavDropdown, MenuItem } from 'react-bootstrap';

import { getQueryParams } from '../../common/utils/index';
import { loggedIn } from '../../common/auth';
import NavLink from './NavLink';

import { locations } from '../db';

export default class MainMenuContainer extends React.Component {
  state = {
    isReady: false
  };

  componentWillMount() {
    this.setState({ isReady: true });
  }

  userMenuItems = () => (this.state.isReady && loggedIn()
    ? <li><a key={3} href="/dashboard"><FontAwesome name="lock" fixedWidth /> My NCI Dashboard</a></li>
    : <li><a key={3584} href="/dashboard"><FontAwesome name="lock" fixedWidth /> Sign into NCI</a></li>
  );

  render() {
    return (
      <Navbar collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand className="brandItem">
            <a key={1} href="https://discovernci.org/" target="_self" style={{ margin: '5px 0 0 0', padding: '0 21px' }}>
              <img src="/logo.png" className="navbar-logo" alt="NCI" />
              <span
                style={{
                  fontSize: 15,
                  color: 'white',
                  display: 'inline-block',
                  marginLeft: 13,
                  marginTop: 14
                }}
              >
                Nature&apos;s Classroom Institute
              </span>
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <ul className="nav navbar-nav">
            <li className="hidden-xs hidden-sm hidden-md"><a href="https://discovernci.org/" target="_self">Home</a></li>

            <NavDropdown title="Outdoor Environmental Edu" id="basic-nav-dropdown">

              <li href="https://discovernci.org/environmental" target="_self"><NavLink url="https://discovernci.org/environmental" target="_self" onlyActiveOnIndex>Environmental Edu Overview</NavLink></li>

              <MenuItem divider />

              <li><NavLink url="https://discovernci.org/environmental/prepare" target="_self" onlyActiveOnIndex>Prepare for NCI</NavLink></li>
              <li><NavLink url="https://discovernci.org/environmental/a-day-in-the-life" target="_self" onlyActiveOnIndex>A day in the life...</NavLink></li>
              <li><NavLink url="https://discovernci.org/environmental/visit" target="_self" onSelect={() => document.dispatchEvent(new MouseEvent('click'))} onlyActiveOnIndex>Schedule a visit</NavLink></li>

              <MenuItem divider />

              <li className="menuLabel">
                Locations
              </li>

              {_.map(locations, location => (
                <li key={location.id}>
                  <NavLink href={`https://discovernci.org/environmental/${location.slug}`} target="_self">
                    <FontAwesome name="map-marker" fixedWidth />
                    {' '}
                    {location.name}
                  </NavLink>
                </li>
              ))}

              <MenuItem divider />

              {this.userMenuItems()}

            </NavDropdown>

            <li><NavLink href="https://discovernci.org/curriculum" target="_self">Curriculum</NavLink></li>

            <li className="hidden-xs hidden-sm">
              <Link href="https://discovernci.org/" style={{ margin: '5px 0 0 0', padding: '0 21px' }} target="_self">
                <img src="/logo.png" className="navbar-logo" alt="NCI" />
              </Link>
            </li>

            <NavDropdown title="Montessori School" id="basic-nav-dropdown">
              <li><NavLink href="https://discovernci.org/montessori" target="_self" onlyActiveOnIndex>NCI Montessori Overview</NavLink></li>
              {getQueryParams().preview
                && <li><NavLink href="https://discovernci.org/montessori/this-week/" target="_self">This Week at NCIM</NavLink></li>
              }
              <MenuItem divider />
              <li className="menuLabel">Classrooms</li>
              <li><NavLink href="https://discovernci.org/montessori/childrens-house" target="_self">Children&apos;s House <span className="dim">(Ages 3-6)</span></NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/lower-elementary" target="_self">Lower Elementary <span className="dim">(Ages 6-9)</span></NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/upper-elementary" target="_self">Upper Elementary <span className="dim">(Ages 9-12)</span></NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/adolescent" target="_self">Adolescent <span className="dim">(Ages 12-18)</span></NavLink></li>
              <MenuItem divider />
              <li><NavLink href="https://discovernci.org/montessori/faculty-staff" target="_self"><FontAwesome name="users" fixedWidth /> Faculty and Staff</NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/calendar" target="_self"><FontAwesome name="calendar-o" fixedWidth /> School Calendar</NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/parents" target="_self"><FontAwesome name="commenting" fixedWidth /> Parents Corner / PABC</NavLink></li>
              <MenuItem divider />
              <li><NavLink href="https://discovernci.org/montessori/visit" target="_self">Visit our School</NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/tuition" target="_self">Tuition and Fees</NavLink></li>
              <li><NavLink href="https://discovernci.org/montessori/enrollment" target="_self">Enrollment</NavLink></li>
            </NavDropdown>

            <li className="hidden-xs hidden-sm hidden-md"><NavLink href="https://discovernci.org/events" target="_self">Events</NavLink></li>
            <li className="hidden-xs hidden-sm hidden-md"><NavLink href="https://discovernci.org/donate" target="_self">Donate</NavLink></li>
            <li><NavLink href="https://discovernci.org/contact" target="_self">Contact</NavLink></li>
          </ul>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
