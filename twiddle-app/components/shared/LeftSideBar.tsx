'use client'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';



const LeftSideBar = () => {
    const pathname = usePathname()
    const { userId } = useAuth()
    return (
        <>
        <section className="leftsidebar custom-scrollbar">
            <div className="flex w-full flex-1 flex-col gap-6 px-6">
                {
                    sidebarLinks.map(( link ) => { 
                        const isActive = ( pathname.includes(link.route) && link.route.length > 1 || pathname === link.route)

                        if(link.route === '/profile') {
                            link.route = `${link.route}/${userId}`
                        }

                        return (
                            <Link
                                href={link.route}
                                key={link.label}
                                className={` leftsidebar_link ${isActive &&
                                    'bg-primary-500'
                                }`}
                            >
                                <Image
                                    src={link.imgURL}
                                    alt={link.label}
                                    width={24}
                                    height={24}
                                />
                                <p className='text-light-1'>
                                    {link.label}
                                </p>
                            </Link>
                        )
                    }
                )
                }
            </div>

        </section>
        </>
    )
}

export default LeftSideBar