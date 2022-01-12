import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';
import { StringResponseWithStatus } from '../responses';

export type User = {
    address: string,
    username: string,
    email: string | null,
}

export const createUser = (user: User): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/user`, user);
}

export const getUser = (): Promise<AxiosResponse<StringResponseWithStatus>> => {
    console.log(process.env.BACKEND_URL);
    return axios.get(`${url}/user`);
}