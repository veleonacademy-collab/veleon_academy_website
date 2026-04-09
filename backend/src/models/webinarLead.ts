export interface WebinarLead {
    id?: number;
    name: string;
    email: string;
    phone: string;
    topic: string;
    cohort: string;
    createdAt?: string;
}

export interface CreateWebinarLeadPayload {
    name: string;
    email: string;
    phone: string;
    topic: string;
    cohort: string;
}
