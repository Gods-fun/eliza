import { ApiKey } from "@/types";
import { useEffect, useState } from "react";

export const useStoredApiKeys = (): [ApiKey[], (newKeys: ApiKey[]) => void] => {
    const [storedKeys, setStoredKeys] = useState<ApiKey[]>([]);

    useEffect(() => {
        const storedValue = localStorage.getItem("api-keys");
        if (storedValue) {
            try {
                const parsedValue = JSON.parse(storedValue);
                setStoredKeys(parsedValue);
            } catch (error) {
                console.error("Invalid JSON in local storage:", error);
            }
        }
    }, []);

    const updateStoredKeys = (newKeys: ApiKey[]) => {
        setStoredKeys(newKeys);
        localStorage.setItem("api-keys", JSON.stringify(newKeys));
    };

    return [storedKeys, updateStoredKeys] as const;
};
