import { redirect } from "next/navigation";
import { getPathname, getUserAuth } from "@/lib/auth";
import { api } from "@/lib/trpc/api";
import { User } from "@/lib/db/schema/users"

export async function fetchUserWithPrivyId(privyId: string): Promise<User | null> {
	try {
		const response = await api.users.getUserByPrivyId.query({ privyId });
		return response.user;
	} catch (error) {
		console.error('Error fetching user data:', error);
		return null;
	}
}

export async function getUserAndUserData() {
	const { user } = await getUserAuth();
	const userData = user ? await fetchUserWithPrivyId(user.id) : null;
	return { user, userData };
}

export async function validateUserRoute() {
	const { user, userData } = await getUserAndUserData();
	
	// Must be authenticated
	if (!user) {
		redirect("/login");
	}

	// Must be onboarded
	if (!userData) {
		redirect("/onboarding");
	}

	return { user, userData };
}

export async function validateGuestRoute() {
	const { user, userData } = await getUserAndUserData();
	const path = await getPathname();

	// If user is authenticated but not onboarded, must complete onboarding
	if (user && !userData && path !== '/onboarding') {
		redirect("/onboarding");
	}

	// If fully authenticated and onboarded user tries to access login/onboarding
	if (user && userData && (path === '/login' || path === '/onboarding')) {
		redirect("/dashboard");
	}

	return { user, userData };
}
