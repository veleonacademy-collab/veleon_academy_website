import { http } from './http';

export interface WebinarLeadPayload {
    name: string;
    email: string;
    phone: string;
    topic: string;
    cohort: string;
}

export const captureWebinarLead = async (payload: WebinarLeadPayload) => {
    const response = await http.post('/webinar/leads', payload);
    return response.data;
};
