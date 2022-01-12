import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';

export type Debt = {
    debtor: string, // Person who owes money
    creditor: string, // Person who is owed money
    net_owed: string, // Amount owed in group's base currency
    net_owed_ones: string, // Amount owed in ONE
}

export type Settlement = {
    group_id: string,
    debts: Array<Debt>
}

export const getSettlementsForGroup = (groupId: string): Promise<AxiosResponse<Settlement>> => {
    return axios.get(`${url}/settle/${groupId}`);
}
