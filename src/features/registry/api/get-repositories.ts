import z from "zod"

export const ResponseSchema = z.object({
  repositories: z.string().array(),
  count: z.number()
})

export async function getRepositories() {
  const response = await fetch("/api/registry/repositories")
  return ResponseSchema.parse(await response.json())
}
