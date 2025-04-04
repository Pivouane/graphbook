'use server';

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function fetchPosts(userId: string) {

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      privacy: true
    }
  })

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (userId !== session?.user?.id) {
    return []
  }

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      author: {
        select: {
          name: true,
          email: true,
        }
      },
      title: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
    where: {
      authorId: session?.user?.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return posts
}

export async function createPost({ title, content, userId }: { title: string, content: string, userId: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  
  console.log('Creating post with data:', { title, content, userId, session });
  
  let post: Prisma.PostCreateInput = {
    title,
    content,
    author: {
      connect: {
        id: session?.user?.id
      }
    },
    user: {
      connect: {
        id: userId
      }
    }
  }

  console.log('Creating post with data:', post);


  const createPost = await prisma.post.create({
    data: post
  })

  console.log('Post created successfully:', createPost);


  return createPost
}
