import type { UUID, Character } from "@elizaos/core";
import { ApiKey } from "@/types";

const BASE_URL =
    import.meta.env.VITE_DIRECT_CLIENT_API_URL ??
    `http://localhost:${import.meta.env.VITE_SERVER_PORT ?? 3000}`;

const fetcher = async ({
    baseUrl = BASE_URL,
    url,
    method,
    body,
    headers,
}: {
    baseUrl?: string;
    url: string;
    method?: "GET" | "POST";
    body?: object | FormData;
    headers?: HeadersInit;
}) => {
    const options: RequestInit = {
        method: method ?? "GET",
        headers: headers
            ? headers
            : {
                  Accept: "application/json",
                  "Content-Type": "application/json",
              },
    };

    if (method === "POST") {
        if (body instanceof FormData) {
            // @ts-expect-error - Supressing potentially undefined options header
            delete options.headers["Content-Type"];
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    return fetch(`${baseUrl}${url}`, options).then(async (resp) => {
        if (resp.ok) {
            const contentType = resp.headers.get("Content-Type");

            if (contentType === "audio/mpeg") {
                return await resp.blob();
            }
            return resp.json();
        }

        const errorText = await resp.text();
        console.error("Error: ", errorText);

        let errorMessage = "An error occurred.";
        try {
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.message || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
    });
};

export const apiClient = {
    sendMessage: (
        agentId: string,
        message: string,
        selectedFile?: File | null,
        origin?: string,
        storedKeys?: ApiKey[],
    ) => {
        const formData = new FormData();
        formData.append("text", message);
        formData.append("user", "user");

        if (selectedFile) {
            formData.append("file", selectedFile);
        }
        if (origin && storedKeys) {
            const apiKey = storedKeys.find((k) => k.origin === origin);
            if (apiKey) {
                return fetcher({
                    url: `/${agentId}/message`,
                    baseUrl: origin,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey.apiKey}`,
                    },
                });
            }
        }
        return fetcher({
            url: `/${agentId}/message`,
            method: "POST",
            body: formData,
        });
    },
    getAgents: async (
        storedKeys?: ApiKey[],
    ): Promise<
        { origin: string; result: { agents: { id: UUID; name: string }[] } }[]
    > => {
        const requests: Promise<{
            origin: string;
            result: { agents: { id: UUID; name: string }[] };
        }>[] = [];

        requests.push(
            fetcher({ url: "/agents" }).then((result) => ({
                origin: BASE_URL,
                result,
            })),
        );
        if (storedKeys) {
            for (const apiKey of storedKeys) {
                requests.push(
                    fetcher({
                        url: "/agents",
                        baseUrl: apiKey.origin,
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey.apiKey}`,
                        },
                    }).then((result) => ({ origin: apiKey.origin, result })),
                );
            }
        }

        return Promise.allSettled(requests)
            .then((responses) => {
                return responses
                    .filter((r) => r.status === "fulfilled")
                    .map((r) => r.value);
            })
            .catch((error) => {
                console.error("Request failed: ", error);
                return [];
            });
    },
    getAgent: async (
        agentId: string,
        origin?: string,
        storedKeys?: ApiKey[],
    ): Promise<{ id: UUID; character: Character }> => {
        try {
            if (origin && storedKeys) {
                const apiKey = storedKeys.find((k) => k.origin === origin);
                if (apiKey) {
                    const result = await fetcher({
                        url: `/agents/${agentId}`,
                        baseUrl: origin,
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey.apiKey}`,
                        },
                    });
                    return result;
                }
            }
            return fetcher({ url: `/agents/${agentId}` });
        } catch (error) {
            console.error("Request failed: ", error);
            throw error;
        }
    },
    tts: (
        agentId: string,
        text: string,
        origin?: string,
        storedKeys?: ApiKey[],
    ) => {
        const headers = {
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
            "Transfer-Encoding": "chunked",
        };

        if (origin && storedKeys) {
            const apiKey = storedKeys.find((k) => k.origin === origin);
            if (apiKey) {
                return fetcher({
                    url: `/${agentId}/tts`,
                    baseUrl: origin,
                    method: "POST",
                    body: { text },
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${apiKey.apiKey}`,
                    },
                });
            }
        }

        return fetcher({
            url: `/${agentId}/tts`,
            method: "POST",
            body: { text },
            headers,
        });
    },
    whisper: async (
        agentId: string,
        audioBlob: Blob,
        origin?: string,
        storedKeys?: ApiKey[],
    ) => {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");

        if (origin && storedKeys) {
            const apiKey = storedKeys.find((k) => k.origin === origin);
            if (apiKey) {
                return fetcher({
                    url: `/${agentId}/whisper`,
                    baseUrl: origin,
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey.apiKey}`,
                    },
                });
            }
        }

        return fetcher({
            url: `/${agentId}/whisper`,
            method: "POST",
            body: formData,
        });
    },
};
