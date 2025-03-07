/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTPayload } from 'jose';
import xior from 'xior';
import { decodeToken } from './lib/utils';

const AUTH_ROUTE = ['/auth/login', '/auth/register'];
const PRIVATE_ROUTE = ['/profile', '/'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const refreshToken = request.cookies.get('refreshToken')?.value || '';
    const accessToken = request.cookies.get('accessToken')?.value || '';

    console.log('Trigger Middleware');

    if (AUTH_ROUTE.includes(pathname) && refreshToken) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    if (PRIVATE_ROUTE.includes(pathname)) {
        // TODO: Case 1: Access hết hạn cần refresh thì refresh ngay (Trường hợp đang dùng website mà hết hạn)
        if (refreshToken && !accessToken) {
            console.log('>>> Case 1: Không có access token nhưng có refresh >>> Refresh ngay');
            return await refreshTokenMiddleware(request);
        }

        // TODO: Case 2: Logout khi không có refresh token (Trường hợp lâu ngày không đăng nhập)
        if (!refreshToken) {
            console.log('>>> Case 2: Không có refresh token >>> Logout');
            const msg = encodeURIComponent('Vui lòng đăng nhập!');
            const response = NextResponse.redirect(new URL(`/auth/login?msg=${msg}`, request.url));
            response.cookies.delete('accessToken');
            return response;
        }

        // TODO: Case 3: Refresh token khi access gần hết hạn (Cần refresh trước khi vào server components)
        if (accessToken && refreshToken) {
            const payload = decodeToken(accessToken);
            if (payload === null) {
                const msg = encodeURIComponent('Phiên đăng nhập hết hạn!');
                const response = NextResponse.redirect(new URL(`/auth/login?msg=${msg}`, request.url));
                response.cookies.delete('accessToken');
                response.cookies.delete('refreshToken');
                return response;
            }

            if ((payload.exp as number) * 1000 < Date.now() + 1 * 60 * 1000) {
                console.log('>>> Case 3: Access gần hết hạn >>> Refresh');
                return await refreshTokenMiddleware(request);
            }

            console.log('>>> Case 4: Không refresh');
        }
    }

    return NextResponse.next();
}

const refreshTokenMiddleware = async (request: NextRequest) => {
    console.log('>>> Middleware chuẩn bị refresh token');
    const refreshToken = request.cookies.get('refreshToken')?.value || '';
    try {
        console.log(
            '>>> Middleware gọi api express refresh token: ',
            `${process.env.NEXT_PUBLIC_API_URL}/refresh-token`
        );
        const { data } = await xior.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, {
            refreshToken,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
        console.log('>>> Middleware Refresh token thành công', data);
        const payload = {
            access: decodeToken(newAccessToken) as JWTPayload,
            refresh: decodeToken(newRefreshToken) as JWTPayload,
        };
        const expAt = payload.access.exp as number;
        const expRt = payload.refresh.exp as number;

        console.log('>>> Middleware kiểm tra refresh token cũ và mới', refreshToken === newRefreshToken);

        const response = NextResponse.next();
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            path: '/',
            expires: new Date(expAt * 1000),
        });
        response.cookies.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            path: '/',
            expires: new Date(expRt * 1000),
        });

        return response;
    } catch (_error: any) {
        console.log('>>> Refresh token lỗi:', _error);
        const errorResponse = NextResponse.redirect(new URL('/auth/login', request.url));
        errorResponse.cookies.delete('accessToken');
        errorResponse.cookies.delete('refreshToken');
        return errorResponse;
    }
};

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
