'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';

const authUser = (WrappedComponent: React.FC) => {
    return function AuthenticatedComponent(props: any) {
        const [isAuthorized, setIsAuthorized] = useState(false);
        const router = useRouter();
        const pathname = usePathname();

        console.log(`Pathname: ${pathname}`)

        useEffect(() => {
            const token = sessionStorage.getItem('authToken');

            if (token && pathname == '/') {
                sessionStorage.clear()
                router.push('/');
            }

            if (token || pathname == "/") {
                setIsAuthorized(true); // Allow user to continue using the system
            } else {
                router.push('/');
            }
        }, [pathname]);



        if (!isAuthorized) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};

export default authUser;
