const getRandId = () => (
  Math.floor(Math.random() * (99999999 - 9999)) + 9999
);

export default getRandId;
