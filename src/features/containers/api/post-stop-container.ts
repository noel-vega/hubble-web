export async function postStopContainer({ id }: { id: string }) {
  await fetch(`/api/containers/${id}/stop`, {
    method: "POST",
  })
}
