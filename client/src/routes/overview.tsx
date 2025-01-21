import Overview from "@/components/overview";
import { useStoredApiKeys } from "@/hooks/use-localstorage-apikeys";
import { apiClient } from "@/lib/api";
import { type UUID } from "@elizaos/core";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";

export default function AgentRoute() {
    const { agentId } = useParams<{ agentId: UUID }>();

    const [searchParams] = useSearchParams();
    const origin = searchParams.get("origin") ?? undefined;

    const [storedKeys] = useStoredApiKeys();

    const query = useQuery({
        queryKey: ["agent", agentId],
        queryFn: () => apiClient.getAgent(agentId as UUID, origin, storedKeys),
        refetchInterval: 5_000,
    });

    const character = query?.data?.character;

    if (!character) return null;

    return <Overview character={character} />;
}
