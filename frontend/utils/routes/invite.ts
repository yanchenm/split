import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';
import { StringResponseWithStatus } from '../responses';

export const createInvite = (groupId: string): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/invite/${groupId}`);
}

export const acceptInviteToGroup = (invite_code: string): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/invite/${invite_code}/accept`);
}
