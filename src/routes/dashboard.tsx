import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchMe } from "./login";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchContainers } from "@/features/containers/api/fetch-containers";
import type { ContainerInfo } from "@/features/containers/types";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

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

function ContainerCard({ container }: { container: ContainerInfo }) {
	const stateStyles = getStateStyles(container.state);

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

			{/* Ports */}
			{container.ports.length > 0 && (
				<div className="mb-4">
					<div className="flex flex-wrap gap-1.5">
						{container.ports.map((port, idx) => (
							<span
								key={idx}
								className="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
							>
								{port.public > 0
									? `${port.public}:${port.private}`
									: port.private}
								<span className="text-slate-400 dark:text-slate-500">
									/{port.type}
								</span>
							</span>
						))}
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="pt-4 border-t border-slate-100 dark:border-slate-800">
				<p className="text-xs font-mono text-slate-400 dark:text-slate-600">
					{container.id.substring(0, 12)}
				</p>
			</div>
		</div>
	);
}

function RouteComponent() {
	const { queryOptions, auth } = Route.useRouteContext();
	const query = useSuspenseQuery(queryOptions);
	const [searchQuery, setSearchQuery] = useState("");

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
						<div>
							<h1 className="text-xl font-semibold text-slate-900 dark:text-white">
								Containers
							</h1>
							<p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
								{auth.username}
							</p>
						</div>
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
							<ContainerCard key={container.id} container={container} />
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
