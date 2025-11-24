import z from "zod"

export const RepositoryInfoSchema = z.object({
  name: z.string(),
  tags: z.string().array()
})

export const ResponseSchema = z.object({
  repositories: RepositoryInfoSchema.array(),
  count: z.number()
})

export async function getRegistryCatalog() {
  const response = await fetch("/api/registry/repositories")
  return ResponseSchema.parse(await response.json())
}
