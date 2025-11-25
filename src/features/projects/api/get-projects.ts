import z from "zod";

export const ProjectInfoSchema = z.object({
	name: z.string(),
	path: z.string(),
	service_count: z.number(),
	containers_running: z.number(),
	containers_stopped: z.number(),
});

const ResponseSchema = z.object({
	count: z.number(),
	projects: ProjectInfoSchema.array(),
});

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

export type ProjectsResponse = z.infer<typeof ResponseSchema>;

export async function getProjects() {
	const response = await fetch("/api/projects");
	const data = await response.json();
	console.log(data);
	return ResponseSchema.parse(data);
}
