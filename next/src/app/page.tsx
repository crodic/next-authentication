import { getUser } from '@/actions/get-user';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const token = cookies().get('accessToken')?.value || '';
    const data = await getUser(token);
    console.log('>>> Server Component Get Data', data);
    return (
        <div className="flex justify-center items-center flex-col gap-4 h-screen p-10">
            <Link href="/profile" className="flex flex-col flex-wrap text-blue-500 hover:underline">
                Hello {data.user.username} - (Click me to go to profile - get user using xior client)
                <br />
            </Link>
            {JSON.stringify(data)}
            <Link href="/me" className="flex flex-col flex-wrap text-blue-500 hover:underline">
                Hello {data.user.username} - (Click me to go to me - get user on server component)
                <br />
            </Link>
            {new Date().toLocaleString()}
        </div>
    );
}
