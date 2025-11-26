import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Session } from 'next-auth';

type ApiHandler = (
    req: NextRequest,
    context: { params: any; session: Session }
) => Promise<NextResponse>;

interface RouteOptions {
    roles?: string[]; // Allowed roles, e.g., ['ADMIN', 'TRAINER']
}

export function authorizedRoute(handler: ApiHandler, options: RouteOptions = {}) {
    return async (req: NextRequest, context: { params: any }) => {
        try {
            const session = await auth();

            // 1. Check Authentication
            if (!session || !session.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // 2. Check Role Authorization
            if (options.roles && options.roles.length > 0) {
                const userRole = session.user.role;
                if (!userRole || !options.roles.includes(userRole)) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }

            // 3. Execute Handler
            return await handler(req, { ...context, session });
        } catch (error) {
            console.error('[API Error]:', error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            );
        }
    };
}
