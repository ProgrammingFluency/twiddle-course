import { fetchUser } from "@/lib/actions/user.actions"

interface Props {
    currentUserId: string,
    accountId: string,
    accountType: string,
    user: {
      id: string
    }
}

interface Result {
    name: string;
    image: string;
    id: string;
    tweets: {
      _id: string;
      text: string;
      parentId: string | null;
      author: {
        name: string;
        image: string;
        id: string;
      };

      group: {
        id: string;
        name: string;
        image: string;
      } | null;
      createdAt: string;
      children: {
        author: {
          id: string;
          image: string;
        };
      }[];
      retweetOf?: {
        _id: string;
        text: string;
        parentId: string | null;
        author: {
          name: string;
          image: string;
          id: string;
        };
        group: {
          id: string;
          name: string;
          image: string;
        } | null;
        createdAt: string;
        children: {
          author: {
            id: string;
            image: string;
          };
        };
      } | null;
      likes: number;
    }[];
  }


const TweetsTab = async ({ currentUserId, accountId, accountType, user }: Props) => {
    const userInfo = await fetchUser(user.id)
    let result: Result;
    if (accountType === "Group") {
        result = await fetchGroupPosts(accountId);
      } else {
        result = await fetchUserPosts(accountId);
      }

}

export default TweetsTab

