import ProfileHeader from "@/components/shared/ProfileHeader"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { profileTabs } from "@/constants";
import Image from "next/image";
import TweetsTab from "@/components/shared/TweetsTab";
import RepliesTab from "@/components/shared/RepliesTab";


const Page = async ( {params}: {params: {id: string}} ) => {
    const user = await currentUser()
    if(!user) return null

    const userInfo = await fetchUser(params.id)

    if(!userInfo?.onboarded) redirect('/onboarding')
    return (
        <>
        <section>
            <ProfileHeader
                accountId = {userInfo.id}
                authUserId = {user.id}
                name = {userInfo.name}
                username = {userInfo.username}
                imgUrl = {userInfo.image}
                bio = {userInfo.bio}
                type='User'
            />


            <div className='mt-9'>
                <Tabs defaultValue='Twiddle' className='w-full'>
                    <TabsList className='tab'>
                        {profileTabs.map(tab => (
                            <TabsTrigger 
                                key={tab.label}
                                value={tab.value}
                                className='tab'
                            >
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                                <p className='max-sm:hidden'>{tab.label}</p>
                                {tab.label === 'Tweets' && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2 '>
                                        {userInfo?.tweets?.length}
                                    </p>

                                )} 

                                {tab.label === 'Replies' && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2 '>
                                        {userInfo?.replies?.length}
                                    </p>

                                )} 
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent 
                            value={'tweets'}
                            className='w-full text-light-1'
                            >
                            <TweetsTab 
                                currentUserId={user.id}
                                accountId={userInfo.id}
                                accountType="User"
                                user={user}
                            />
                    </TabsContent>

                    <TabsContent 
                            value={'replies'}
                            className='w-full text-light-1'
                            >
                            <RepliesTab 
                                currentUserId={user.id}
                                accountId={userInfo.id}
                                user={user}
                            />
                    </TabsContent>
                    
                </Tabs>
            </div>

            
            </section>
        </>
    )
}

export default Page