import PageTitle from "@/components/page-title";
import SolanaWallet from "@/components/solana-wallet";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStoredApiKeys } from "@/hooks/use-localstorage-apikeys";
import { useToast } from "@/hooks/use-toast";
import { ApiKey } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, Plus, Save } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ApiKeys() {
    const { toast } = useToast();
    const [storedKeys, updateStoredKeys] = useStoredApiKeys();
    const { publicKey } = useWallet();

    const [isEditMode, setIsEditMode] = useState(false);
    const [newApiKey, setNewApiKey] = useState<ApiKey>({
        name: "",
        origin: "",
        apiKey: "",
        publicKey: "",
    });

    const generateApiKey = () => {
        setNewApiKey((prev) => ({ ...prev, apiKey: uuidv4() }));
    };

    const updateNewApiKey = (key: keyof typeof newApiKey, value: string) => {
        setNewApiKey((prev) => ({ ...prev, [key]: value }));
    };

    const saveNewApiKey = () => {
        if (!newApiKey.name) {
            toast({
                title: "Please enter a name for your API key",
                description: "The name is required to save the API key",
                variant: "destructive",
            });
            return;
        }
        const domainRegex = /^https?:\/\/[^\s]+$/;
        if (!newApiKey.origin || !domainRegex.test(newApiKey.origin)) {
            toast({
                title: "Please enter a valid domain as origin",
                description:
                    "The origin domain is required to save the API key",
                variant: "destructive",
            });
            return;
        }
        if (!publicKey) {
            toast({
                title: "No wallet connected",
                description: "Please connect a wallet to generate an API key",
                variant: "destructive",
            });
        }

        updateStoredKeys([
            ...storedKeys,
            { ...newApiKey, publicKey: publicKey!.toBase58() },
        ]);
        setIsEditMode(false);
        setNewApiKey({ name: "", origin: "", apiKey: "", publicKey: "" });
    };

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <PageTitle title="Api Keys" />

            <div className="flex justify-end">
                <SolanaWallet />
            </div>

            {publicKey ? (
                isEditMode ? (
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-1 sm:flex sm:flex-wrap">
                        <div className="col-span-3 sm:w-full">
                            <Label className="mt-4">Name</Label>
                            <Input
                                className="mt-2"
                                value={newApiKey.name}
                                onChange={(e) =>
                                    updateNewApiKey("name", e.target.value)
                                }
                            />
                        </div>

                        <div className="col-span-3 sm:w-full">
                            <Label className="mt-4">Origin Domain</Label>
                            <Input
                                className="mt-2"
                                placeholder="https://example.com"
                                value={newApiKey.origin}
                                onChange={(e) =>
                                    updateNewApiKey("origin", e.target.value)
                                }
                            />
                        </div>

                        <div className="col-span-3 sm:w-full">
                            <Label className="mt-4">Key</Label>
                            <Input
                                className="mt-2 pointer-events-none"
                                value={newApiKey.apiKey}
                                disabled
                                readOnly
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="mt-8"
                            onClick={() => {
                                saveNewApiKey();
                            }}
                        >
                            <Save /> Save
                        </Button>
                    </div>
                ) : !storedKeys?.length ? (
                    <div>
                        <Button
                            variant="outline"
                            className="w-full grow mb-4"
                            onClick={() => {
                                setIsEditMode(true);
                                generateApiKey();
                            }}
                        >
                            <Plus /> Add Key
                        </Button>

                        <Label>No API keys found</Label>
                    </div>
                ) : (
                    <div>
                        <Button
                            variant="outline"
                            className="w-full grow mb-4"
                            onClick={() => {
                                setIsEditMode(true);
                                generateApiKey();
                            }}
                        >
                            <Plus /> Add Key
                        </Button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {storedKeys?.map((apiKey: ApiKey) => (
                                <Card key={apiKey.apiKey}>
                                    <CardHeader>
                                        <CardTitle>{apiKey?.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="col-span-3 sm:w-full">
                                            <Label className="mt-4">
                                                Origin Domain
                                            </Label>
                                            <Input
                                                className="mt-2 pointer-events-none"
                                                placeholder="https://example.com"
                                                value={apiKey.origin}
                                                disabled
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-span-3 sm:w-full">
                                            <Label className="mt-4">Key</Label>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Input
                                                    className="pointer-events-none"
                                                    value={apiKey.apiKey}
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    apiKey.apiKey,
                                                );
                                                toast({
                                                    title: "API key copied",
                                                });
                                            }}
                                        >
                                            <Copy /> Copy Key
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div>No wallet connected</div>
            )}
        </div>
    );
}
