import type { AxiosResponse } from 'axios';
import { StringResponseWithStatus } from '../responses';
import axios from 'axios';
import { url } from '../constants';

export type RequestUser = {
    username: string,
    email: string | null,
}

export type User = {
    address: string,
    username: string,
    email: string | null,
}

export const createUser = (user: RequestUser): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/user`, user);
}

export const getUser = (): Promise<AxiosResponse<StringResponseWithStatus>> => {
    console.log(process.env.BACKEND_URL);
    return axios.get(`${url}/user`);
}