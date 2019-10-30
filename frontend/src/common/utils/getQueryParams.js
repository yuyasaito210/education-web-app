// parse a URL's GET parameters and return them as an object

function getQueryParams() {
  const prmstr = window.location.search.substr(1);
  return prmstr !== null && prmstr !== '' ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
  const params = {};
  const prmarr = prmstr.split('&');
  for (let i = 0; i < prmarr.length; i += 1) {
    const tmparr = prmarr[i].split('=');
    params[tmparr[0]] = tmparr[1];
  }
  return params;
}

export default getQueryParams;
