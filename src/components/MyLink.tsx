import Link, { LinkProps } from 'next/link'
import { CSSProperties, ReactNode } from 'react'

export function MyLink({
  href,
  children,
  className,
  style,
  targetBlank,
}: {
  href: string
  children: ReactNode
  className?: string
  targetBlank?: boolean
  style?: CSSProperties | undefined
}) {
  return (
    <Link {...{ href }}>
      <a
        className={`text-blue-800 underline-offset-4 hover:underline ${
          className ?? ''
        }`}
        {...{ style }}
        target={targetBlank ? '_blank' : undefined}
      >
        {children}
      </a>
    </Link>
  )
}
