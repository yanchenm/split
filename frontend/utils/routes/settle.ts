import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { url } from '../constants';

export type Debt = {
    debtor: string, // Person who owes money
    creditor: string, // Person who is owed money
    net_owed: number, // Amount owed in group's base currency
    net_owed_ones: number, // Amount owed in ONE
}

export const getSettlementsForGroup = (groupId: string): Promise<AxiosResponse<Array<Debt>>> => {
    return axios.get(`${url}/settle/${groupId}`);
}
