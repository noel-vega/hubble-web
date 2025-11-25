import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	getProject,
	type ProjectDetail,
} from "@/features/projects/api/get-project";
import { fetchMe } from "@/features/auth/api/fetchMe";
import {
	ArrowLeft,
	FolderGit2,
	Server,
	Play,
	Square,
	Layers,
	FileCode2,
	Copy,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/$name")({
	beforeLoad: async ({ context }) => {
		const auth = await context.queryClient.ensureQueryData({
			queryKey: ["auth", "me"],
			queryFn: fetchMe,
		});

		if (!auth.authenticated) {
			throw redirect({ to: "/login" });
		}

		return { auth };
	},
	loader: async ({ context, params }) => {
		const queryOptions = {
			queryKey: ["project", params.name],
			queryFn: () => getProject({ name: params.name }),
		};
		const project = await context.queryClient.ensureQueryData(queryOptions);
		return { queryOptions, project };
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

function RouteComponent() {
	const { queryOptions } = Route.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);
	const [isComposeExpanded, setIsComposeExpanded] = useState(false);

	const project = data as ProjectDetail;

	const runningContainers = project.containers.filter(
		(c) => c.state.toLowerCase() === "running",
	).length;
	const stoppedContainers = project.containers.length - runningContainers;

	return (
		<div className="bg-slate-50 dark:bg-[#0d1117] min-h-screen">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/projects"
						className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to projects
					</Link>

					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 shadow-sm">
						<div className="flex items-start justify-between gap-4 flex-wrap mb-6">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-blue-500/10">
										<FolderGit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
									<h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
										{project.name}
									</h1>
								</div>
								<p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
									{project.path}
								</p>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-purple-500/10">
									<Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Services
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{Object.keys(project.services).length}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-emerald-500/10">
									<Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Running
									</p>
									<p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
										{runningContainers}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-red-500/10">
									<Square className="w-4 h-4 text-red-600 dark:text-red-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Stopped
									</p>
									<p className="text-sm font-semibold text-red-600 dark:text-red-400">
										{stoppedContainers}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-blue-500/10">
									<Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Total Containers
									</p>
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{project.containers.length}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Services */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-5">
							<div className="p-2 rounded-lg bg-purple-500/10">
								<Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
							</div>
							<h2 className="text-base font-semibold text-slate-900 dark:text-white">
								Services
							</h2>
						</div>

						<div className="space-y-4">
							{Object.entries(project.services).map(([name, service]) => (
								<div
									key={name}
									className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
								>
									<h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
										{name}
									</h3>
									<div className="space-y-2 text-xs">
										<div className="flex items-start gap-2">
											<span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
												Image:
											</span>
											<span className="font-mono text-slate-900 dark:text-white break-all">
												{service.image}
											</span>
										</div>
										{service.ports && (
											<div className="flex items-start gap-2">
												<span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
													Ports:
												</span>
												<span className="font-mono text-slate-900 dark:text-white">
													{service.ports}
												</span>
											</div>
										)}
										{service.volumes && (
											<div className="flex items-start gap-2">
												<span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
													Volumes:
												</span>
												<span className="font-mono text-slate-900 dark:text-white break-all">
													{service.volumes}
												</span>
											</div>
										)}
										{Object.keys(service.environment).length > 0 && (
											<div className="flex items-start gap-2">
												<span className="text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
													Env:
												</span>
												<span className="font-mono text-slate-900 dark:text-white">
													{Object.keys(service.environment).length} variables
												</span>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Containers */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6">
						<div className="flex items-center gap-2 mb-5">
							<div className="p-2 rounded-lg bg-blue-500/10">
								<Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
							</div>
							<h2 className="text-base font-semibold text-slate-900 dark:text-white">
								Containers
							</h2>
						</div>

						<div className="space-y-3">
							{project.containers.map((container) => {
								const stateStyles = getStateStyles(container.state);
								return (
									<Link
										key={container.id}
										to="/containers/$id"
										params={{ id: container.id }}
										className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
									>
										<div className="flex items-start justify-between gap-3 mb-2">
											<h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
												{container.name}
											</h3>
											<span
												className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${stateStyles.bg} ${stateStyles.text} whitespace-nowrap`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${stateStyles.dot}`}
												/>
												{container.state}
											</span>
										</div>
										<div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
											<span className="font-mono">
												{container.id.substring(0, 12)}
											</span>
											<span>•</span>
											<span>{container.service}</span>
										</div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
											{container.status}
										</p>
									</Link>
								);
							})}

							{project.containers.length === 0 && (
								<div className="text-center py-8">
									<p className="text-sm text-slate-500 dark:text-slate-400">
										No containers found
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Docker Compose File */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl lg:col-span-2">
						<button
							onClick={() => setIsComposeExpanded(!isComposeExpanded)}
							className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
						>
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-lg bg-slate-500/10">
									<FileCode2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
								</div>
								<h2 className="text-base font-semibold text-slate-900 dark:text-white">
									docker-compose.yml
								</h2>
							</div>
							{isComposeExpanded ? (
								<ChevronUp className="w-5 h-5 text-slate-400" />
							) : (
								<ChevronDown className="w-5 h-5 text-slate-400" />
							)}
						</button>

						{isComposeExpanded && (
							<div className="border-t border-slate-200 dark:border-slate-800 p-6">
								<div className="flex items-center justify-end mb-3">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											navigator.clipboard.writeText(project.compose_content);
										}}
										className="text-xs h-7 px-2 gap-1.5"
									>
										<Copy className="w-3.5 h-3.5" />
										Copy
									</Button>
								</div>
								<pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
									{project.compose_content}
								</pre>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
