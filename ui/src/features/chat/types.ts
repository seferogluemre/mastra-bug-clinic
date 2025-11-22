export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string | any;
    createdAt?: string;
}

export interface Thread {
    threadId: string;
    title: string;
    createdAt: string;
    messages?: Message[];
}
