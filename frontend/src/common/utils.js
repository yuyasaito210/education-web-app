import { browserHistory } from 'react-router';

const handleTeacherClick = () => {
  browserHistory.push('/montessori/faculty-staff');
};

export default { handleTeacherClick };
