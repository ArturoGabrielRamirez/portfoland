import { prisma } from "@/lib/prisma"
import { getUserDashboardStats } from "./getUserDashboardStats.data"
import type { PortfolioMode } from "@/features/portfolio/types/portfolio"
import type { DashboardStats } from "@/features/dashboard/types/dashboard"

export interface DashboardPageUser {
  id: string
  name: string
  email: string
  username: string | null
  image: string | null
  portfolioMode: PortfolioMode
  bio: string | null
}

export interface DashboardPageData {
  user: DashboardPageUser
  stats: DashboardStats
}

/**
 * Shared data fetcher for all dashboard pages.
 * Returns user profile + cached dashboard stats in a single call.
 */
export async function getDashboardPageData(userId: string): Promise<DashboardPageData> {
  const [dbUser, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        portfolioMode: true,
        bio: true,
      },
    }),
    getUserDashboardStats(userId),
  ])

  return {
    user: {
      id: userId,
      name: dbUser?.name ?? "User",
      email: dbUser?.email ?? "",
      username: dbUser?.username ?? null,
      image: dbUser?.image ?? null,
      portfolioMode: (dbUser?.portfolioMode ?? "classic") as PortfolioMode,
      bio: dbUser?.bio ?? null,
    },
    stats,
  }
}
