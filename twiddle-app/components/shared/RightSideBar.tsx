import { fetchUsers } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import UserCard from "../cards/UserCard"
import { fetchGroups } from "@/lib/actions/group.actions"
import GroupCard from "../cards/GroupCard"

const RightSideBar = async () => {
    const user = await currentUser()
    if(!user) return null

    const similarMinds = await fetchUsers({
        userId: user.id,
        pageSize: 4
    })

    const suggestedGroups = await fetchGroups( { pageSize: 4 } )


    return (
        <>
            <section className="custom-scrollbar rightsidebar">
                <div className="flex flex-1 flex-col justify-start">
                    <h3 className="text-heading4-medium text-light-1">
                        Suggestions
                    </h3>
                </div>
                <div className="flex flex-col flex-1 justify-start">
                    <h3 className="text-heading4-medium text-light-1">
                        Groups
                    </h3>
                    <div className="mt-7 flex w-[350px] flex-col gap-10">
                        {
                            suggestedGroups.groups.length > 0 ? (
                                <>
                                    { suggestedGroups.groups.map( ( group ) => 
                                        <GroupCard
                                            key = { group.id }
                                            id = { group.id }
                                            name = { group.name }
                                            username = { group.username }
                                            imgUrl = { group.image }
                                            members={ group.members }
                                        />
                                    ) }
                                </>
                            ) : (
                                <>
                                    <p className="!text-base-regular text-light-3">
                                        No Groups yet
                                    </p>
                                </>
                            )
                        }
                    </div>
                </div>

                <div className="flex flex-col flex-1 justify-start">
                    <h3 className="text-heading4-medium text-light-1">
                        Users
                    </h3>
                    <div className="mt-7 flex w-[350px] flex-col gap-10">
                        {
                            similarMinds.users.length > 0 ? (
                                <>
                                    { similarMinds.users.map( ( person ) => 
                                        <UserCard
                                            key = { person.id }
                                            id = { person.id }
                                            name = { person.name }
                                            username = { person.username }
                                            imgUrl = { person.image }
                                        />
                                    ) }
                                </>
                            ) : (
                                <>
                                    <p className="!text-base-regular text-light-3">
                                        No users yet
                                    </p>
                                </>
                            )
                        }
                    </div>
                </div>
            </section>
        </>
    )
}

export default RightSideBar