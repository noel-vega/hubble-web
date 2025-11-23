import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v3';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

const PostLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export type PostLoginParams = z.infer<typeof PostLoginSchema>


const postLogin = async (params: PostLoginParams) => {
  await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(params)
  })
}


const FetchMeResponseSchema = z.object({
  authenticated: z.boolean(),
  username: z.string()
})

export const fetchMe = async () => {
  const response = await fetch("/api/auth/me")
  const data = await response.json()
  console.log(data)
  return FetchMeResponseSchema.parse(data)
}

function RouteComponent() {
  const login = useMutation({
    mutationFn: postLogin,
  })

  const form = useForm<PostLoginParams>({ resolver: zodResolver(PostLoginSchema), defaultValues: { username: "", password: "" } })

  return <div>
    <form onSubmit={form.handleSubmit(data => login.mutate(data))}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Username
              </FieldLabel>
              <Input required {...field} />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Password
              </FieldLabel>
              <Input type="password" required {...field} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit">Login</Button>
    </form>
  </div>

}
