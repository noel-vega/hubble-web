import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import {
	useSuspenseQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { ProjectComposeService } from "@/features/projects/types";
import { postServiceStart } from "@/features/projects/api/post-service-start";
import { postServiceStop } from "@/features/projects/api/post-service-stop";

const parentRoute = getRouteApi("/projects/$name/services");
import {
	Layers,
	Play,
	Square,
	MoreVertical,
	Box,
	Plus,
	Loader2,
} from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/$name/services/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { name } = Route.useParams();
	const { queryOptions } = parentRoute.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);
	const queryClient = useQueryClient();

	const services = (
		data as { services: z.infer<typeof ProjectComposeService>[] }
	).services;

	const startService = useMutation({
		mutationFn: postServiceStart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});

	const stopService = useMutation({
		mutationFn: postServiceStop,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});

	return (
		<div className="px-6 py-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
						Services
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Manage your Docker Compose services
					</p>
				</div>
				<Button
					onClick={() => console.log("Add service clicked")}
					className="gap-2"
				>
					<Plus className="w-4 h-4" />
					Add Service
				</Button>
			</div>

			{/* Services Table */}
			{services.length > 0 ? (
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
					<div className="divide-y divide-slate-200 dark:divide-slate-800">
						{services.map((service) => (
							<div
								key={service.name}
								className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
							>
								{/* Service Icon & Name */}

								<Link
									to="/projects/$name/services/$service"
									params={{ name, service: service.name }}
									className="text-sm font-semibold flex-1 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
												<Box className="w-5 h-5 text-slate-600 dark:text-slate-400" />
											</div>
										</div>
										<div className="flex-1 min-w-0">
											{service.name}
											<div className="flex items-center gap-2 mt-0.5">
												{service.image && (
													<p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
														{service.image}
													</p>
												)}
											</div>
										</div>
									</div>
								</Link>
								{/* Ports */}
								<div className="hidden md:flex items-center gap-1 flex-shrink-0">
									{service.ports && service.ports.length > 0 ? (
										service.ports.slice(0, 2).map((port, idx) => (
											<span
												key={idx}
												className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-mono"
											>
												{port}
											</span>
										))
									) : (
										<span className="text-xs text-slate-400">No ports</span>
									)}
									{service.ports && service.ports.length > 2 && (
										<span className="text-xs text-slate-400">
											+{service.ports.length - 2}
										</span>
									)}
								</div>

								{/* Status */}
								<div className="flex items-center gap-1.5 flex-shrink-0 min-w-[100px]">
									<span
										className={`w-2 h-2 rounded-full flex-shrink-0 ${
											service.status === "running"
												? "bg-green-500"
												: service.status === "stopped"
													? "bg-red-500"
													: "bg-slate-400"
										}`}
									/>
									<span
										className={`text-xs font-medium ${
											service.status === "running"
												? "text-green-600 dark:text-green-400"
												: service.status === "stopped"
													? "text-red-600 dark:text-red-400"
													: "text-slate-600 dark:text-slate-400"
										}`}
									>
										{service.status === "running"
											? "Running"
											: service.status === "stopped"
												? "Stopped"
												: "Not Created"}
									</span>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1 flex-shrink-0">
									{service.status !== "running" && (
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												startService.mutate({
													projectName: name,
													serviceName: service.name,
												});
											}}
											disabled={
												startService.isPending &&
												startService.variables?.serviceName === service.name
											}
											className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800"
											title="Start service"
										>
											{startService.isPending &&
											startService.variables?.serviceName === service.name ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Play className="w-4 h-4" />
											)}
										</Button>
									)}
									{service.status === "running" && (
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												stopService.mutate({
													projectName: name,
													serviceName: service.name,
												});
											}}
											disabled={
												stopService.isPending &&
												stopService.variables?.serviceName === service.name
											}
											className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
											title="Stop service"
										>
											{stopService.isPending &&
											stopService.variables?.serviceName === service.name ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Square className="w-4 h-4" />
											)}
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
									>
										<MoreVertical className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
						<Layers className="w-8 h-8 text-slate-400" />
					</div>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						No services found
					</p>
				</div>
			)}
		</div>
	);
}
