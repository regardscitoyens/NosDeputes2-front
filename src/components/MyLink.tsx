import Link from 'next/link'
import { CSSProperties, ReactNode } from 'react'

export function MyLink({
  href,
  children,
  className,
  style,
  targetBlank,
  title,
}: {
  href: string
  children: ReactNode
  className?: string
  targetBlank?: boolean
  style?: CSSProperties
  title?: string
}) {
  const targetAttributes = targetBlank
    ? {
        target: '_blank',
        rel: 'noreferrer noopener',
      }
    : null
  return (
    <Link
      {...{ href }}
      className={`text-blue-800 underline-offset-4 hover:underline ${
        className ?? ''
      }`}
      {...{ style, targetAttributes, title }}
    >
      {children}
    </Link>
  )
}
