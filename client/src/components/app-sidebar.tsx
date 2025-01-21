import { useQuery } from "@tanstack/react-query";
import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation } from "react-router";
import { type UUID } from "@elizaos/core";
import { Book, Cog, User, KeyRound } from "lucide-react";
import ConnectionStatus from "./connection-status";
import { useStoredApiKeys } from "@/hooks/use-localstorage-apikeys";

export function AppSidebar() {
    const location = useLocation();
    const [storedKeys] = useStoredApiKeys();

    const query = useQuery({
        queryKey: [],
        queryFn: () => apiClient.getAgents(storedKeys),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.flatMap(
        (a) =>
            a.result?.agents?.map((agent) => ({
                ...agent,
                origin: a.origin,
            })) || []
    );

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <NavLink to="/">
                                <img
                                    src="/elizaos-icon.png"
                                    width="100%"
                                    height="100%"
                                    className="size-7"
                                />

                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">
                                        ElizaOS
                                    </span>
                                    <span className="">v{info?.version}</span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Agents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {query?.isPending ? (
                                <div>
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <SidebarMenuItem key={index}>
                                                <SidebarMenuSkeleton />
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {agents?.map(
                                        (agent: {
                                            id: UUID;
                                            name: string;
                                            origin: string;
                                        }) => (
                                            <SidebarMenuItem key={agent.id}>
                                                <NavLink
                                                    to={`/chat/${agent.id}${
                                                        agent.origin
                                                            ? `?origin=${agent.origin}`
                                                            : ""
                                                    }`}
                                                >
                                                    <SidebarMenuButton
                                                        isActive={location.pathname.includes(
                                                            agent.id
                                                        )}
                                                    >
                                                        <User />
                                                        <span>
                                                            {agent.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            </SidebarMenuItem>
                                        )
                                    )}
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <NavLink
                            to="https://elizaos.github.io/eliza/docs/intro/"
                            target="_blank"
                        >
                            <SidebarMenuButton>
                                <Book /> Documentation
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink to="/api_keys">
                            <SidebarMenuButton>
                                <KeyRound /> Api Keys
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton disabled>
                            <Cog /> Settings
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <ConnectionStatus />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
