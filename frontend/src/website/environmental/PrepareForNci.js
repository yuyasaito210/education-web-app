import React from 'react';
import Helmet from 'react-helmet';
import { Row, Col } from 'react-bootstrap';

export default class PrepareForNci extends React.Component {

  componentWillMount() {
    document.body.style.backgroundImage = 'url(/discovernci_media/NapaCaliforniaBg2.jpg)';
  }

  render() {
    return (
      <div>

        <Helmet
          title="Preparing for your Nature's Classroom experience"
          link={[
              { rel: 'canonical', href: 'https://discovernci.org/environmental/prepare' }
          ]}
          meta={[
              { property: 'og:url', content: 'https://discovernci.org/environmental/prepare' },
              { property: 'og:title', content: "Preparing for your Nature's Classroom experience" },
              { property: 'og:image', content: '/discovernci_media/nci-og-ee-prepare-camp.jpg' },
              { property: 'og:description', content: 'Outdoor environmental education uses the natural world to give students a learning experience that cannot take place in a classroom. The Nature’s Classroom Institute program will help students understand the natural environment; participate in ecosystem exploration; and study and work together with their peers and teachers as a community.' }
          ]}
        />

        <Row>
          <Col className="center bottom-30">
            <h1>Preparing for Nature&apos;s Classroom Institute</h1>
          </Col>
        </Row>

        <Row>
          <Col md={6} mdOffset={1} className="top-10 bottom-30">
            <ul>
              <li><a href="/documents/prepare/Statement%20of%20Nature&apos;s%20Classroom%20Institute%20Security%20Policy.pdf">Statement of Nature&apos;s Classroom Institute Security Policy</a></li>
            </ul>

            <h3>Parents ~ Here&apos;s What You&apos;ll Need</h3>
            <ul>
              <li><a href="/documents/prepare/Student_prep.pdf">Preparing your child for NCI</a></li>
              <li><a href="/documents/prepare/NCI_Parents_Welcome_Letter.pdf">Visiting School Parent Package ~ Northern Region</a></li>
              <li><a href="/documents/prepare/Visiting%20School%20Parent%20Package%20-%20Southern%20Region.pdf">Visiting School Parent Package ~ Southern Region</a></li>
              <li><a href="/documents/prepare/Visiting School Parent Package - Western Region.pdf">Visiting School Parent Package ~ Western Region</a></li>
              <li><a href="/documents/NCI Parent Letter and Packing List updated 2018.pdf">Parent Letter and Packing List</a></li>
              <li><a href="/documents/prepare/NCI_Parent_tutorial.pdf">NCI Online Registration - Parent Tutorial</a></li>
              <li><a href="https://discovernci.org/dashboard" target="_blank" rel="noopener noreferrer">Access NCI Online Registration Portal</a></li>
            </ul>

            <h3>Teachers ~ Here&apos;s What You&apos;ll Need</h3>
            <ul>
              <li><a href="/documents/prepare/Visiting%20Teachers%20Role_revised10_17_16.pdf">Visiting Teachers Role at NCI</a></li>
              <li><a href="/documents/prepare/NCI_Teacher_tutorial.pdf">NCI Online Registration - Teacher Tutorial</a></li>
              <li><a href="/documents/prepare/Roommate%20Selection%20Form_revised10_17_16.pdf">NCI Roommate Selection Form</a></li>
              <li><a href="/documents/prepare/NCI%20Field%20Group%20Assignment%20Form_revised10_17_16.pdf">NCI Field Group Assignment Form</a></li>
              <li><a href="/documents/prepare/NCI - Curriculum Concept Overview.pdf">NCI Curriculum Concept Overview</a></li>
              <li><a href="http://www.lgyc.org/directions/" target="_blank" rel="noopener noreferrer">Directions to NCI - Lake Geneva (aka Lake Geneva Youth Camp)</a></li>
            </ul>

          </Col>
        </Row>
      </div>
    );
  }
}
