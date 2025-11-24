import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchContainers } from "@/features/containers/api/fetch-containers";
import { postStartContainer } from "@/features/containers/api/post-start-container";
import { postStopContainer } from "@/features/containers/api/post-stop-container";
import type { ContainerInfo } from "@/features/containers/types";
import { LogOut, Search, Play, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchMe } from "@/features/auth/api/fetchMe";
import { postLogout } from "@/features/auth/api/postLogout";
import { ModeToggle } from "@/components/mode-toggle";
import { getRepositories } from "@/features/registry/api/get-repositories";
import { getRepositoryTags } from "@/features/registry/api/get-repository-tags";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    try {
      const auth = await context.queryClient.ensureQueryData({
        queryKey: ["auth", "me"],
        queryFn: fetchMe,
      });
      if (!auth.authenticated) {
        throw redirect({ to: "/login" });
      }

      const queryOptions = {
        queryKey: ["containers"],
        queryFn: fetchContainers,
      };
      await context.queryClient.ensureQueryData(queryOptions);
      const reposistories = await getRepositories()
      const tags = await getRepositoryTags({ repositoryName: reposistories.repositories[0] })
      console.log("REPOSITORIES:", reposistories)
      console.log("TAGS:", tags)
      return { auth, queryOptions };
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function getStateStyles(state: string) {
  const stateMap: Record<string, { dot: string; text: string; bg: string }> = {
    running: {
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    exited: {
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    paused: {
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    restarting: {
      dot: "bg-blue-500 animate-pulse",
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
  };
  return (
    stateMap[state.toLowerCase()] || {
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/20",
    }
  );
}

function ContainerCard({
  container,
  onStart,
  onStop,
  isStarting,
  isStopping,
}: {
  container: ContainerInfo;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  isStarting: boolean;
  isStopping: boolean;
}) {
  const stateStyles = getStateStyles(container.state);
  const isRunning = container.state.toLowerCase() === "running";
  const isExited = container.state.toLowerCase() === "exited";

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1 truncate">
            {container.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {container.image}
          </p>
        </div>
        <span
          className={`ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${stateStyles.bg} ${stateStyles.text} whitespace-nowrap`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${stateStyles.dot}`} />
          {container.state}
        </span>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 dark:text-slate-500">
          {container.status}
        </p>
      </div>

      {/* Footer with Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-slate-400 dark:text-slate-600">
            {container.id.substring(0, 12)}
          </p>
          <div className="flex gap-2">
            {isExited && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStart(container.id)}
                disabled={isStarting}
                className="h-7 px-2 gap-1.5 text-xs hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Play
                  className={`w-3.5 h-3.5 ${isStarting ? "animate-pulse" : ""}`}
                />
                {isStarting ? "Starting..." : "Start"}
              </Button>
            )}
            {isRunning && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStop(container.id)}
                disabled={isStopping}
                className="h-7 px-2 gap-1.5 text-xs hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                <Square
                  className={`w-3.5 h-3.5 ${isStopping ? "animate-pulse" : ""}`}
                />
                {isStopping ? "Stopping..." : "Stop"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { queryOptions, auth } = Route.useRouteContext();
  const query = useSuspenseQuery(queryOptions);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingContainers, setLoadingContainers] = useState<
    Record<string, "start" | "stop">
  >({});

  const startContainer = useMutation({
    mutationFn: postStartContainer,
    onMutate: async ({ id }) => {
      setLoadingContainers((prev) => ({ ...prev, [id]: "start" }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
    onError: (error) => {
      console.error("Failed to start container:", error);
    },
    onSettled: (_, __, { id }) => {
      setLoadingContainers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
  });

  const stopContainer = useMutation({
    mutationFn: postStopContainer,
    onMutate: async ({ id }) => {
      setLoadingContainers((prev) => ({ ...prev, [id]: "stop" }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    },
    onError: (error) => {
      console.error("Failed to stop container:", error);
    },
    onSettled: (_, __, { id }) => {
      setLoadingContainers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
  });

  const logout = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  const filteredContainers = useMemo(() => {
    if (!searchQuery.trim()) {
      return query.data.containers;
    }
    return query.data.containers.filter((container) =>
      container.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [query.data.containers, searchQuery]);

  const stats = useMemo(() => {
    return {
      running: filteredContainers.filter(
        (c) => c.state.toLowerCase() === "running",
      ).length,
      stopped: filteredContainers.filter(
        (c) => c.state.toLowerCase() === "exited",
      ).length,
      total: filteredContainers.length,
    };
  }, [filteredContainers]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔭</span>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Containers
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
                  {auth.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.running} running
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.stopped} stopped
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {stats.total} total
                </div>
              </div>
              <ModeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                {logout.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search containers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Containers Grid */}
        {filteredContainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContainers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                onStart={(id) => startContainer.mutate({ id })}
                onStop={(id) => stopContainer.mutate({ id })}
                isStarting={loadingContainers[container.id] === "start"}
                isStopping={loadingContainers[container.id] === "stop"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-500">
              {searchQuery
                ? "No containers found matching your search"
                : "No containers found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
