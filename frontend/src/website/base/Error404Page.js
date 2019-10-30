import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col } from 'react-bootstrap';

export default class Error404 extends React.Component {

  componentWillMount() {
    document.body.style.backgroundImage = 'url(/discovernci_media/bg6.jpg)';
  }

  render() {
    return (
      <Grid style={{ background: '#fffffc', marginTop: 130 }} className="grid-container">
        <Helmet title="Error 404 - Nature&apos;s Classroom Institute and Montessori School" />
        <Row>
          <Col md={6} mdOffset={3}>
            <h1 className="center top-30 bottom-30">Error 404 - File Not Found</h1>
          </Col>
        </Row>
      </Grid>
    );
  }

}
