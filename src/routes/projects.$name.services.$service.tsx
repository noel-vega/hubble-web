import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ProjectComposeService } from "@/features/projects/types";
import {
	ArrowLeft,
	Package,
	Network,
	HardDrive,
	Settings,
	PlayCircle,
	Layers,
	Terminal,
	Edit2,
	Check,
	X,
	Plus,
	Trash2,
} from "lucide-react";
import z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const parentRoute = getRouteApi("/projects/$name/services");

export const Route = createFileRoute("/projects/$name/services/$service")({
	component: RouteComponent,
});

type EditingSection =
	| "image"
	| "build"
	| "ports"
	| "networks"
	| "volumes"
	| "environment"
	| "dependencies"
	| "restart"
	| "command"
	| null;

function RouteComponent() {
	const { name, service: serviceName } = Route.useParams();
	const { queryOptions } = parentRoute.useLoaderData();
	const { data } = useSuspenseQuery(queryOptions);

	const services = (
		data as { services: z.infer<typeof ProjectComposeService>[] }
	).services;

	const service = services.find((s) => s.name === serviceName);

	const [editingSection, setEditingSection] = useState<EditingSection>(null);
	const [editData, setEditData] = useState<any>({});

	if (!service) {
		return (
			<div className="text-center py-12">
				<p className="text-slate-500 dark:text-slate-400">Service not found</p>
				<Link
					to="/projects/$name/services"
					params={{ name }}
					className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
				>
					Back to services
				</Link>
			</div>
		);
	}

	const startEditing = (section: EditingSection, initialData: any) => {
		setEditingSection(section);
		setEditData(initialData);
	};

	const cancelEditing = () => {
		setEditingSection(null);
		setEditData({});
	};

	const saveEditing = (section: EditingSection) => {
		console.log(`Saving ${section}:`, editData);
		setEditingSection(null);
		setEditData({});
	};

	return (
		<div>
			{/* Back Button */}
			<Link
				to="/projects/$name/services"
				params={{ name }}
				className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
			>
				<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
				Back to services
			</Link>

			{/* Service Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2.5 rounded-lg bg-purple-500/10">
						<Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						{service.name}
					</h1>
				</div>
				<p className="text-sm text-slate-500 dark:text-slate-400">
					Docker Compose service configuration
				</p>
			</div>

			{/* Content Grid */}
			<div className="space-y-4">
				{/* Image & Build */}
				{(service.image || service.build || editingSection === "image") && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									IMAGE & BUILD
								</h2>
							</div>
							{editingSection === "image" ? (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => saveEditing("image")}
										className="h-7 px-2 gap-1"
									>
										<Check className="w-3.5 h-3.5" />
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={cancelEditing}
										className="h-7 px-2 gap-1"
									>
										<X className="w-3.5 h-3.5" />
										Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										startEditing("image", {
											image: service.image,
											build: service.build,
										})
									}
									className="h-7 px-2 gap-1"
								>
									<Edit2 className="w-3.5 h-3.5" />
									Edit
								</Button>
							)}
						</div>

						{editingSection === "image" ? (
							<div className="space-y-3">
								<div>
									<label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
										Image
									</label>
									<Input
										value={editData.image || ""}
										onChange={(e) =>
											setEditData({ ...editData, image: e.target.value })
										}
										placeholder="e.g., nginx:latest"
										className="font-mono text-sm"
									/>
								</div>
								<div>
									<label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
										Build Context
									</label>
									<Input
										value={editData.build || ""}
										onChange={(e) =>
											setEditData({ ...editData, build: e.target.value })
										}
										placeholder="e.g., ./app"
										className="font-mono text-sm"
									/>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								{service.image && (
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Image
										</p>
										<p className="font-mono text-sm text-slate-900 dark:text-white">
											{service.image}
										</p>
									</div>
								)}
								{service.build && (
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
											Build Context
										</p>
										<p className="font-mono text-sm text-slate-900 dark:text-white">
											{service.build}
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Ports */}
				{(service.ports?.length > 0 || editingSection === "ports") && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									PORTS
								</h2>
							</div>
							{editingSection === "ports" ? (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => saveEditing("ports")}
										className="h-7 px-2 gap-1"
									>
										<Check className="w-3.5 h-3.5" />
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={cancelEditing}
										className="h-7 px-2 gap-1"
									>
										<X className="w-3.5 h-3.5" />
										Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										startEditing("ports", { ports: service.ports || [] })
									}
									className="h-7 px-2 gap-1"
								>
									<Edit2 className="w-3.5 h-3.5" />
									Edit
								</Button>
							)}
						</div>

						{editingSection === "ports" ? (
							<div className="space-y-2">
								{editData.ports?.map((port: string, idx: number) => (
									<div key={idx} className="flex gap-2">
										<Input
											value={port}
											onChange={(e) => {
												const newPorts = [...editData.ports];
												newPorts[idx] = e.target.value;
												setEditData({ ...editData, ports: newPorts });
											}}
											placeholder="e.g., 8080:80"
											className="font-mono text-sm"
										/>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												const newPorts = editData.ports.filter(
													(_: any, i: number) => i !== idx,
												);
												setEditData({ ...editData, ports: newPorts });
											}}
											className="h-9 px-2"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setEditData({
											...editData,
											ports: [...(editData.ports || []), ""],
										});
									}}
									className="w-full gap-2"
								>
									<Plus className="w-4 h-4" />
									Add Port
								</Button>
							</div>
						) : (
							<div className="flex flex-wrap gap-2">
								{service.ports?.map((port, idx) => (
									<div
										key={idx}
										className="px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md border border-blue-500/20 font-mono text-sm"
									>
										{port}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Environment Variables */}
				{(Object.keys(service.environment || {}).length > 0 ||
					editingSection === "environment") && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									ENVIRONMENT VARIABLES
								</h2>
							</div>
							{editingSection === "environment" ? (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => saveEditing("environment")}
										className="h-7 px-2 gap-1"
									>
										<Check className="w-3.5 h-3.5" />
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={cancelEditing}
										className="h-7 px-2 gap-1"
									>
										<X className="w-3.5 h-3.5" />
										Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										startEditing("environment", {
											environment: service.environment || {},
										})
									}
									className="h-7 px-2 gap-1"
								>
									<Edit2 className="w-3.5 h-3.5" />
									Edit
								</Button>
							)}
						</div>

						{editingSection === "environment" ? (
							<div className="space-y-2">
								{Object.entries(editData.environment || {}).map(
									([key, value], idx) => (
										<div key={idx} className="flex gap-2">
											<Input
												value={key}
												onChange={(e) => {
													const newEnv = { ...editData.environment };
													delete newEnv[key];
													newEnv[e.target.value] = value;
													setEditData({ ...editData, environment: newEnv });
												}}
												placeholder="KEY"
												className="font-mono text-sm flex-1"
											/>
											<Input
												value={value as string}
												onChange={(e) => {
													const newEnv = { ...editData.environment };
													newEnv[key] = e.target.value;
													setEditData({ ...editData, environment: newEnv });
												}}
												placeholder="value"
												className="font-mono text-sm flex-1"
											/>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => {
													const newEnv = { ...editData.environment };
													delete newEnv[key];
													setEditData({ ...editData, environment: newEnv });
												}}
												className="h-9 px-2"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									),
								)}
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setEditData({
											...editData,
											environment: {
												...editData.environment,
												[`NEW_VAR_${Date.now()}`]: "",
											},
										});
									}}
									className="w-full gap-2"
								>
									<Plus className="w-4 h-4" />
									Add Variable
								</Button>
							</div>
						) : (
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{Object.entries(service.environment || {}).map(
									([key, value]) => (
										<div
											key={key}
											className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800"
										>
											<p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
												{key}
											</p>
											<p className="text-sm font-mono text-slate-900 dark:text-white break-words">
												{value || "—"}
											</p>
										</div>
									),
								)}
							</div>
						)}
					</div>
				)}

				{/* Volumes */}
				{(service.volumes?.length > 0 || editingSection === "volumes") && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									VOLUMES
								</h2>
							</div>
							{editingSection === "volumes" ? (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => saveEditing("volumes")}
										className="h-7 px-2 gap-1"
									>
										<Check className="w-3.5 h-3.5" />
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={cancelEditing}
										className="h-7 px-2 gap-1"
									>
										<X className="w-3.5 h-3.5" />
										Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										startEditing("volumes", { volumes: service.volumes || [] })
									}
									className="h-7 px-2 gap-1"
								>
									<Edit2 className="w-3.5 h-3.5" />
									Edit
								</Button>
							)}
						</div>

						{editingSection === "volumes" ? (
							<div className="space-y-2">
								{editData.volumes?.map((volume: string, idx: number) => (
									<div key={idx} className="flex gap-2">
										<Input
											value={volume}
											onChange={(e) => {
												const newVolumes = [...editData.volumes];
												newVolumes[idx] = e.target.value;
												setEditData({ ...editData, volumes: newVolumes });
											}}
											placeholder="e.g., ./data:/app/data"
											className="font-mono text-sm"
										/>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												const newVolumes = editData.volumes.filter(
													(_: any, i: number) => i !== idx,
												);
												setEditData({ ...editData, volumes: newVolumes });
											}}
											className="h-9 px-2"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setEditData({
											...editData,
											volumes: [...(editData.volumes || []), ""],
										});
									}}
									className="w-full gap-2"
								>
									<Plus className="w-4 h-4" />
									Add Volume
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								{service.volumes?.map((volume, idx) => (
									<div
										key={idx}
										className="font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800 break-all"
									>
										{volume}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Command */}
				{(service.command || editingSection === "command") && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
								<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
									COMMAND
								</h2>
							</div>
							{editingSection === "command" ? (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => saveEditing("command")}
										className="h-7 px-2 gap-1"
									>
										<Check className="w-3.5 h-3.5" />
										Save
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={cancelEditing}
										className="h-7 px-2 gap-1"
									>
										<X className="w-3.5 h-3.5" />
										Cancel
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										startEditing("command", { command: service.command })
									}
									className="h-7 px-2 gap-1"
								>
									<Edit2 className="w-3.5 h-3.5" />
									Edit
								</Button>
							)}
						</div>

						{editingSection === "command" ? (
							<Input
								value={editData.command || ""}
								onChange={(e) =>
									setEditData({ ...editData, command: e.target.value })
								}
								placeholder="e.g., npm start"
								className="font-mono text-sm"
							/>
						) : (
							<p className="font-mono text-sm text-slate-900 dark:text-white">
								{service.command}
							</p>
						)}
					</div>
				)}

				{/* Networks & Restart Policy - Read Only for now */}
				{service.networks && service.networks.length > 0 && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center gap-2 mb-3">
							<Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
							<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
								NETWORKS
							</h2>
						</div>
						<div className="flex flex-wrap gap-2">
							{service.networks.map((network, idx) => (
								<div
									key={idx}
									className="px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md border border-purple-500/20 font-mono text-sm"
								>
									{network}
								</div>
							))}
						</div>
					</div>
				)}

				{service.restart && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center gap-2 mb-3">
							<PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
							<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
								RESTART POLICY
							</h2>
						</div>
						<div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-mono text-sm inline-block">
							{service.restart}
						</div>
					</div>
				)}

				{service.depends_on && service.depends_on.length > 0 && (
					<div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5 shadow-sm">
						<div className="flex items-center gap-2 mb-3">
							<Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
							<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
								DEPENDENCIES
							</h2>
						</div>
						<div className="space-y-2">
							{service.depends_on.map((dep, idx) => (
								<Link
									key={idx}
									to="/projects/$name/services/$service"
									params={{ name, service: dep }}
									className="block px-3 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 font-mono text-sm transition-colors"
								>
									→ {dep}
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
