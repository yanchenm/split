import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { url } from '../constants';

export const getSupportedCurrencies = (): Promise<AxiosResponse<Array<string>>> => {
    return axios.get(`${url}/currency/supported`);
}
