
// type ProjectInfo struct {
// 	Name            string `json:"name"`
// 	Path            string `json:"path"`
// 	ComposeFilePath string `json:"compose_file_path"`
// 	ComposeContent  string `json:"compose_content"`
// }
//

import z from "zod"

const ProjectInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  composeFilePath: z.string(),
  composeContent: z.string()
})


export async function getProjects() {
  const response = await fetch("/api/projects")
  const data = await response.json()
  console.log(data)
  return ProjectInfoSchema.array().parse(data)
}
