'use client';

import { updateUser } from '@/actions/get-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useFormState } from 'react-dom';

export default function FormAction() {
    const [value, setValue] = useState('');
    const [state, formAction] = useFormState(updateUser, null);
    return (
        <form action={formAction}>
            <Input type="text" name="username" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button type="submit">Update User</Button>
            {state && <div>{state.message ? 'Success' : 'Error'}</div>}
        </form>
    );
}
