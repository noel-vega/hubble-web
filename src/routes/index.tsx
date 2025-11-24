import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchMe } from "@/features/auth/api/fetchMe";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		try {
			const auth = await context.queryClient.fetchQuery({
				queryKey: ["auth", "me"],
				queryFn: fetchMe,
			});

			if (auth.authenticated) {
				throw redirect({ to: "/containers" });
			} else {
				throw redirect({ to: "/login" });
			}
		} catch (error) {
			// If auth check fails, redirect to login
			throw redirect({ to: "/login" });
		}
	},
});
