'use client';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { httpClient } from '@/lib/httpClient';
import { User } from '@/types/apis';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import xior, { XiorError } from 'xior';

export default function ProfileView() {
    const router = useRouter();
    const signOut = async () => {
        await xior.post<{ message: string }>('http://localhost:3000/api/auth/logout', {
            credentials: 'same-origin',
        });
        router.push('/auth/login');
    };

    useEffect(() => {
        async function getUser() {
            try {
                const res = await httpClient.get<User>('/user');
                console.log('Next Client Get User on useEffect', res.data);
            } catch (error) {
                if (error instanceof XiorError) console.log(error.message);
            }
        }

        getUser();
    }, []);

    return (
        <Card>
            <CardHeader>
                <Link href={'/'} className="text-blue-500 hover:underline">
                    Go to home page (get user form server component)
                </Link>
            </CardHeader>
            <CardFooter>
                <Button onClick={signOut}>Logout</Button>
            </CardFooter>
        </Card>
    );
}
