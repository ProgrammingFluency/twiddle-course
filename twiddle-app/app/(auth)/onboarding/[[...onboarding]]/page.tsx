import AccountInfo from "@/components/forms/AccountInfo"
import { fetchUser } from "@/lib/actions/user.actions"
import { UserProfile } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { dark } from "@clerk/themes"
import { redirect } from "next/navigation"

const Page = async () => {
    const user = await currentUser()
    if(!user) return null
    const userInfo = await fetchUser(user.id)
    if(userInfo?.onboarded) redirect('/')
    
    const userData = {
        id: user?.id,
        objectID: userInfo?._id,
        userName: userInfo ? userInfo?.username : user?.username,
        name: userInfo ? userInfo?.name : user?.firstName || '',
        bio: userInfo ? userInfo?.bio : '',
        image: userInfo ? userInfo?.image : user?.imageUrl
    }

    return (
        <>
            <main className="mx-auto flex flex-col justify-start px-10 py-20"> 
                <div className="text-center">
                    <h1 className="head-text">Welcome to Twiddle</h1>
                    <p className="mt-3 text-base-regular text-light-2">
                        Complete your profile now to use Twiddle</p>
                </div>

                <div className="mt-10">
                    <UserProfile
                        appearance={{
                            baseTheme: dark,
                        }}
                        //routing="hash"
                    />
                </div>

                <AccountInfo
                    user={userData}
                />
            </main>
        </>
    )
}

export default Page