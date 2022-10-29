import Link, { LinkProps } from 'next/link'
import { CSSProperties, ReactNode } from 'react'

export function MyLink({
  href,
  children,
  className,
  style,
}: {
  href: string
  children: ReactNode
  className?: string
  style?: CSSProperties | undefined
}) {
  return (
    <Link {...{ href }}>
      <a
        className={`underline underline-offset-4 ${className ?? ''}`}
        {...{ style }}
      >
        {children}
      </a>
    </Link>
  )
}
