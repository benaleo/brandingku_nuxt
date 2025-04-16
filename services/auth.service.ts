import axios from 'axios';

export default {
  login(email, password) {
    return axios.post('http://localhost:8080/api/auth/login', {
      email,
      password
    });
  }
};
