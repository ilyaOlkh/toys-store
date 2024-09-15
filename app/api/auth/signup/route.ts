import { AppRouteHandlerFnContext, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: AppRouteHandlerFnContext) {
    return handleLogin(req, ctx, {
        authorizationParams: {
            screen_hint: 'signup',
        },
    });
}