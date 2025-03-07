import { cookies } from 'next/headers';

export const POST = async () => {
    const cookieStore = cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    return Response.json({ message: 'Success' }, { status: 200 });
};
