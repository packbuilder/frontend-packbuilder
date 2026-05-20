import axios from 'axios';

export function useApi() {
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      timeout: 10000
    });
}