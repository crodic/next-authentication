import { getUser } from '@/actions/get-user';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const data = await getUser(cookies().get('accessToken')?.value || '');
    console.log(data);
    return (
        <div className="flex justify-center items-center flex-col gap-4 h-screen p-10">
            <Link href="/profile" className="flex flex-col flex-wrap text-blue-500 hover:underline">
                Hello {data.user.username} - (Click me to go to profile - get user using xior client)
                <br />
            </Link>
            {JSON.stringify(data)}
        </div>
    );
}
