import GroupCard from "@/components/cards/GroupCard"
import { fetchGroups } from "@/lib/actions/group.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const Page = async () => {
    const user = await currentUser()
    if(!user) return null

    const userInfo = await fetchUser(user.id)
    if(!userInfo.onboarded) redirect('/onboarding')

    const result = await fetchGroups({
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })

    return (
        <>
            <section>

                <div className='mt-14 flex flex-col gap-9'>
                    {result.groups.length === 0 ? (
                        <p className='no-result'>No Groups yet</p>
                    ) : (
                        <>
                            {result.groups.map(group => (
                                <GroupCard
                                    key= {group.id}
                                    id={group.id}
                                    name={group.name}
                                    username={group.username}
                                    imgUrl={group.image}
                                    members={group.members}
                                />
                            ))}
                        </>
                    )}
                </div>
            </section>
        </>
    ) 
}

export default Page