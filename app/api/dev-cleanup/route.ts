/**
 * DEV-ONLY cleanup route — delete this file after use.
 * Lists GitHub accounts and lets you delete orphan ones (users with no other OAuth provider).
 *
 * GET  /api/dev-cleanup        — list all GitHub accounts
 * POST /api/dev-cleanup        — delete the orphan GitHub Account records
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Guard: only accessible in development
function devOnly() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const guard = devOnly()
  if (guard) return guard

  const githubAccounts = await prisma.account.findMany({
    where: { providerId: 'github' },
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  const result = await Promise.all(
    githubAccounts.map(async (a) => {
      const others = await prisma.account.findMany({
        where: { userId: a.userId, providerId: { not: 'github' } },
      })
      return {
        accountDbId: a.id,
        githubUserId: a.accountId,
        linkedUserId: a.userId,
        userEmail: a.user?.email,
        userName: a.user?.name,
        isOrphan: others.length === 0,
        otherProviders: others.map((o) => o.providerId),
      }
    })
  )

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json({ githubAccounts: result, allUsers })
}

export async function POST() {
  const guard = devOnly()
  if (guard) return guard

  const githubAccounts = await prisma.account.findMany({
    where: { providerId: 'github' },
  })

  const deleted: string[] = []

  for (const a of githubAccounts) {
    const others = await prisma.account.findMany({
      where: { userId: a.userId, providerId: { not: 'github' } },
    })
    if (others.length === 0) {
      // Orphan — no other provider. Delete the Account record only.
      await prisma.account.delete({ where: { id: a.id } })
      deleted.push(a.id)
    }
  }

  return NextResponse.json({
    deleted,
    message: deleted.length
      ? `Deleted ${deleted.length} orphan GitHub account record(s). Try linking GitHub again.`
      : 'No orphan accounts found.',
  })
}
