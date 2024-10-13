import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { dark } from '@clerk/themes'

const TopBar = () => {
    return (
        <>
            <nav className="topbar">
                <Link
                    href='/'
                    className="flex items-center gap-4"
                >
                    <Image
                        src='/assets/logo.svg'
                        alt="logo"
                        width={75}
                        height={75}
                    />
                </Link>

                <div className="flex items-center gap-3">
                    <SignedIn>
                        <OrganizationSwitcher
                            appearance={
                                {
                                    baseTheme: dark,
                                    elements: {
                                        organizationSwitcherTrigger: 'py-2 px-4'
                                    }
                                }
                            }
                        />

                        <UserButton />
                    </SignedIn>
                </div>
            </nav>
        </>
    )
}

export default TopBar