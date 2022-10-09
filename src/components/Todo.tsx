import Head from 'next/head'
import Link from 'next/link'
import { ReactElement, ReactNode } from 'react'

type Props = {
  children: ReactNode
  inline?: boolean
}

export function Todo({ inline, children }: Props) {
  if (inline) {
    return (
      <span className="bg-violet-200 px-2 text-violet-600">
        TODO {children}
      </span>
    )
  }

  return (
    <div className="my-2 bg-violet-200 py-10 px-10 text-violet-600">
      TODO {children}
    </div>
  )
}
