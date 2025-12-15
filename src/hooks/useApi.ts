import axios from 'axios';

export function useApi() {
    return axios.create({
      baseURL: 'http://localhost:5013',
      withCredentials: true,
      timeout: 10000
    });
}