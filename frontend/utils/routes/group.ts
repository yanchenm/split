import type { AxiosResponse } from 'axios';
import { StringResponseWithStatus } from '../responses';
import { User } from './user';
import axios from 'axios';
import { url } from '../constants';

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

export const inviteToGroup = (groupId: string, invite: InviteToGroupRequest): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/group/${groupId}/invite`, invite);
}

export const acceptInviteToGroup = (groupId: string): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/group/${groupId}/accept`);
}

export const getGroup = (groupId: string): Promise<AxiosResponse<Group>> => {
    return axios.get(`${url}/group/${groupId}`);
}

export const getGroupsByUser = (): Promise<AxiosResponse<Array<Group>>> => {
    return axios.get(`${url}/group/`);
}

export const getUsersInGroup = (groupId: string): Promise<AxiosResponse<Array<User>>> => {
    return axios.get(`${url}/group/${groupId}/users`);
}