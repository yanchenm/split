import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';
import { StringResponseWithStatus } from '../responses';

export type Split = {
    address: string,
    share: string,
}

export type Transaction = {
    name: string,
    group: string,
    total: string,
    currency: string,
    image: string | null,
    splits: Array<Split>
}

export type DbTransaction = {
    id: string,
    group: string,
    amount: number,
    currency: string,
    paid_by: string,
    name: string,
    date: string,
    updated_at: string,
}

export const createTransaction = (transaction: Transaction): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.post(`${url}/transaction`, transaction);
}


export const updateTransaction = (transaction: Transaction, tx_id: string): Promise<AxiosResponse<StringResponseWithStatus>> => {
    return axios.put(`${url}/transaction/${tx_id}`, transaction);
}

export const getTransactionsByGroup = (groupId: string): Promise<AxiosResponse<Array<DbTransaction>>> => {
    return axios.get(`${url}/transaction/group/${groupId}`);
}
