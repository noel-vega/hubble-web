import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ProjectComposeService } from "@/features/projects/types";

const parentRoute = getRouteApi("/projects/$name/services");
import {
	Layers,
	Package,
	Network,
	HardDrive,
	Settings,
	PlayCircle,
} from "lucide-react";
import z from "zod";

export const Route = createFileRoute("/projects/$name/services/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { name } = Route.useParams();
	const { queryOptions } = parentRoute.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const services = (
		data as { services: z.infer<typeof ProjectComposeService>[] }
	).services;

	return (
		<div>
			<div className="flex items-center gap-2 mb-6">
				<div className="p-2 rounded-lg bg-purple-500/10">
					<Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
				</div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
					Services
				</h2>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{services.map((service) => (
					<Link
						key={service.name}
						to="/projects/$name/services/$service"
						params={{ name, service: service.name }}
						className="block p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
					>
						<div className="flex items-center gap-2 mb-4">
							<span className="w-2 h-2 rounded-full bg-purple-500" />
							<h3 className="text-base font-semibold text-slate-900 dark:text-white">
								{service.name}
							</h3>
						</div>

						<div className="space-y-3 text-sm">
							{/* Image */}
							{service.image && (
								<div className="flex items-start gap-3">
									<Package className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Image
										</p>
										<p className="font-mono text-xs text-slate-900 dark:text-white break-all">
											{service.image}
										</p>
									</div>
								</div>
							)}

							{/* Build */}
							{service.build && (
								<div className="flex items-start gap-3">
									<Package className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Build
										</p>
										<p className="font-mono text-xs text-slate-900 dark:text-white break-all">
											{service.build}
										</p>
									</div>
								</div>
							)}

							{/* Ports */}
							{service.ports && service.ports.length > 0 && (
								<div className="flex items-start gap-3">
									<Network className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Ports
										</p>
										<div className="flex flex-wrap gap-1">
											{service.ports.map((port, idx) => (
												<span
													key={idx}
													className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-xs font-mono"
												>
													{port}
												</span>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Volumes */}
							{service.volumes && service.volumes.length > 0 && (
								<div className="flex items-start gap-3">
									<HardDrive className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Volumes ({service.volumes.length})
										</p>
										<div className="space-y-1">
											{service.volumes.map((volume, idx) => (
												<p
													key={idx}
													className="font-mono text-xs text-slate-900 dark:text-white break-all"
												>
													{volume}
												</p>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Environment Variables */}
							{service.environment &&
								Object.keys(service.environment).length > 0 && (
									<div className="flex items-start gap-3">
										<Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-xs text-slate-500 dark:text-slate-400">
												Environment Variables (
												{Object.keys(service.environment).length})
											</p>
										</div>
									</div>
								)}

							{/* Networks */}
							{service.networks && service.networks.length > 0 && (
								<div className="flex items-start gap-3">
									<Network className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Networks
										</p>
										<div className="flex flex-wrap gap-1">
											{service.networks.map((network, idx) => (
												<span
													key={idx}
													className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded text-xs font-mono"
												>
													{network}
												</span>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Depends On */}
							{service.depends_on && service.depends_on.length > 0 && (
								<div className="flex items-start gap-3">
									<Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Depends On
										</p>
										<div className="flex flex-wrap gap-1">
											{service.depends_on.map((dep, idx) => (
												<span
													key={idx}
													className="inline-block px-2 py-0.5 bg-slate-500/10 text-slate-700 dark:text-slate-400 rounded text-xs font-mono"
												>
													{dep}
												</span>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Restart Policy */}
							{service.restart && (
								<div className="flex items-start gap-3">
									<PlayCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Restart Policy
										</p>
										<p className="font-mono text-xs text-slate-900 dark:text-white">
											{service.restart}
										</p>
									</div>
								</div>
							)}

							{/* Command */}
							{service.command && (
								<div className="flex items-start gap-3">
									<PlayCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Command
										</p>
										<p className="font-mono text-xs text-slate-900 dark:text-white break-all">
											{service.command}
										</p>
									</div>
								</div>
							)}
						</div>
					</Link>
				))}

				{services.length === 0 && (
					<div className="col-span-full text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
							<Layers className="w-8 h-8 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							No services found
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
