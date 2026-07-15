import axios from 'axios';

const VITE_APIURL = import.meta.env.VITE_APIURL;

export function useApi() {
    return axios.create({
      baseURL: VITE_APIURL,
      withCredentials: true,
      timeout: 10000
    });
}