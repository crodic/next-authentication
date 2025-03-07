import { getUser } from '@/actions/get-user';
import { cookies } from 'next/headers';
import Link from 'next/link';
import FormAction from './_components/form-actions';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const token = cookies().get('accessToken')?.value || '';
    const data = await getUser(token);
    console.log('>>> Server Component Dynamic /me => Get Data', data);
    return (
        <div className="flex justify-center items-center flex-col gap-4 h-screen p-10">
            <Link href="/profile" className="flex flex-col flex-wrap text-blue-500 hover:underline">
                Hello {data.user.username} - (Click me to go to profile - get user using xior client)
            </Link>
            {JSON.stringify(data)}
            {new Date().toLocaleString()}
            <FormAction />
        </div>
    );
}
