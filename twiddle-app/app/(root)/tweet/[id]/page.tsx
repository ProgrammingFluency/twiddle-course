import { fetchTweetById } from "@/lib/actions/tweet.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const Page = async ({params}: {params: {id: string}}) => {
    const user = await currentUser()
    if(!user) return null
    
    const userInfo = await fetchUser(user.id)
    if(!userInfo?.onboarded) redirect('/onboarding')

    const tweet = await fetchTweetById(params.id)

}

export default Page
