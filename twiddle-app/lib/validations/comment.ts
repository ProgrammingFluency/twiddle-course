import * as z from "zod";

export const CommentValidation = z.object({
    tweet: z.string().min(3, {
        message: 'Minimum 3 characters!!!'
    })
})