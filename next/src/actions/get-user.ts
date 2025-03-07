'use server';

import { User } from '@/types/apis';
import xior from 'xior';

export const getUser = async (token: string) => {
    const res = await xior.get<{ status: number; user: User }>(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });
    return res.data;
};
