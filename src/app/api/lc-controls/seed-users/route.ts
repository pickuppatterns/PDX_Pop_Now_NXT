import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const projectRoot = path.resolve(process.cwd())

    const { stdout, stderr } = await execAsync(
      'npx dotenv -e .env -- tsx src/seed/seedListeners.ts',
      {
        cwd: projectRoot,
        timeout: 120000, // 2 min timeout
        env: { ...process.env },
      },
    )

    console.log('[seed-users] stdout:', stdout)
    if (stderr) console.warn('[seed-users] stderr:', stderr)

    return NextResponse.json({ success: true, output: stdout })
  } catch (err: unknown) {
    const error = err as { message?: string; stdout?: string; stderr?: string }
    console.error('[/api/lc-controls/seed-users] Error:', error.message)
    return NextResponse.json(
      {
        message: 'Seed failed.',
        error: error.message,
        output: error.stdout,
      },
      { status: 500 },
    )
  }
}
