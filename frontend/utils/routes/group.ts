import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';
import { StringResponseWithStatus } from '../responses';

export type CreateGroupRequest = {
    name: string,
    currency: string,
    description: string | null,
}

export type InviteToGroupRequest = {
    user_id: string,
}

export type Group = {
    id: string,
    name: string,
    currency: string,
    description: string | null,
    updated_at: string,
}

export const createGroup = (group: CreateGroupRequest): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/group`, group);
}

export const getGroup = (groupId: string): Promise<AxiosResponse<Group>> => {
    return axios.get(`${url}/group/${groupId}`);
}

export const getGroupsByUser = (): Promise<AxiosResponse<Array<Group>>> => {
    return axios.get(`${url}/group/`);
}