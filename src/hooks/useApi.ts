import axios from 'axios';

export function useApi() {
    return axios.create({
      baseURL: import.meta.env.VITE_APIURL,
      withCredentials: true,
      timeout: 10000
    });
}