import { z } from 'zod'

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>
}

export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(160, 'Bio must be at most 160 characters').nullable().optional(),
  website: z.url('Invalid URL').nullable().optional(),
  location: z.string().max(100).nullable().optional(),
})

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(280, 'Post must be at most 280 characters'),
  image_url: z.url().nullable().optional(),
})

export const updatePostSchema = z.object({
  content: z.string().min(1).max(280).optional(),
  image_url: z.url().nullable().optional(),
})

export const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(280, 'Comment must be at most 280 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
