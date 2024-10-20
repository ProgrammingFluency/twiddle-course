'use client'

import { CommentValidation } from "@/lib/validations/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { addCommentToTweet } from "@/lib/actions/tweet.actions";


interface Props {
    tweetId: string,
    currentUserImg: string,
    currentUserId: string
}

const Comment = ({tweetId, currentUserImg, currentUserId}: Props) => {
    const pathname = usePathname();
    const form = useForm<z.infer<typeof CommentValidation >>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
          tweet: "",
        },
      });

      const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToTweet(tweetId, values.tweet, JSON.parse(currentUserId), pathname) 
        form.reset()
        }

      return (
        <>
            <Form {...form}>
                <form
                    className='comment-form'
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                    control={form.control}
                    name='tweet'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                        <FormLabel>
                            <Image
                                src={currentUserImg} 
                                alt="Current User"
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                            />
                        </FormLabel>
                        <FormControl className='border-none bg-transparent'>
                            <Input 
                                type="text"
                                placeholder="Comment..."
                                className="no-focus text-light-1 outline-none "
                                {...field} />
                        </FormControl>
                        </FormItem>
                    )}
                    />

                    <Button type='submit' className='comment-form_btn'>
                        Reply
                    </Button>
                </form>
            </Form>
        </>
    )

}

export default Comment
