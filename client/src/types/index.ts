export interface IAttachment {
    url: string;
    contentType: string;
    title: string;
}

export type ApiKey = {
    name: string;
    origin: string;
    apiKey: string;
    publicKey: string;
};
