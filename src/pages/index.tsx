import { SignInButton, useUser } from '@clerk/nextjs'
import { api } from '~/utils/api'
import type { RouterOutputs } from '~/utils/api'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from 'next/image'
import { LoadingPage, LoadingSpinner } from '~/components/loading'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { PageLayout } from '~/components/layout'

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser()

  const [input, setInput] = useState('')

  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput('')
      void ctx.posts.getAll.invalidate()
    },
    onError: e => {
      const errorMessage = e.data?.zodError?.fieldErrors.content

      if (errorMessage?.[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error('Failed to post! Please try again later.')
      }
    },
  })

  if (!user) return null

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (input !== '') {
              mutate({ content: input })
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== '' && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
}

type PostWithAuthor = RouterOutputs['posts']['getAll'][number]

const PostView = (props: PostWithAuthor) => {
  const { post, author } = props

  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="rounded-full"
        alt={`@${author.username}'s profile image`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username} `}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery()

  if (isLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong!</div>

  return (
    <div className="flex flex-col">
      {data?.map(fullPost => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  )
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()

  // Start fetching asap
  api.posts.getAll.useQuery()

  // Return empty div if user isn't loaded
  if (!isLoaded) return <div />

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  )
}
