/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { User } from '@/types/apis';
import { cookies } from 'next/headers';
import xior from 'xior';

export const getUser = async (token: string) => {
    console.log('>>> Call getUser on server with token: ', token);
    const res = await xior.get<{ status: number; user: User }>(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });
    return res.data;
};

export const updateUser = async (prevState: any, formData: FormData) => {
    const token = cookies().get('accessToken')?.value || '';
    console.log('>>> Server action Call updateUser on server');
    try {
        const res = await xior.put<{ success: boolean }>(
            `${process.env.NEXT_PUBLIC_API_URL}/user`,
            { username: formData.get('username') },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return { message: res.data.success };
    } catch (error) {
        console.log(error);
        return { message: false };
    }
};
