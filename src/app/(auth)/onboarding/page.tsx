import UserOnboard from "@/components/users/UserOnboard"
import { getUserAuth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Onboarding() {
	const { user } = await getUserAuth();

	if (!user) {
		redirect("/login");
	}

  return <UserOnboard user={user} />
}