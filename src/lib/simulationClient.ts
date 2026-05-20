import axios, { AxiosInstance } from 'axios';

const SIMULATION_BASE_URL = 'https://aen3hxp5ex.us-east-1.awsapprunner.com';
const API_KEY = process.env.NEXT_PUBLIC_SIMULATION_API_KEY || 'test-api-key';

const simulationClient: AxiosInstance = axios.create({
  baseURL: SIMULATION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

simulationClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error?.response?.data?.error || error?.message || 'Simulation API error';
    console.error('[SimulationClient]', msg);
    return Promise.reject(error);
  }
);

export default simulationClient;
