'use client'

import clsx from 'clsx'
import type React from 'react'
import { createContext, useContext, useState } from 'react'
import { Link } from './link'

const TableContext = createContext<{ bleed: boolean; dense: boolean; grid: boolean; striped: boolean }>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false,
})

const TableRowContext = createContext<{ href?: string; target?: string; title?: string }>({
  href: undefined,
  target: undefined,
  title: undefined,
})

const Table = (props: React.ComponentPropsWithoutRef<'table'>) => {
  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table {...props} className={clsx('min-w-full divide-y divide-zinc-200 dark:divide-zinc-700', props.className)} />
        </div>
      </div>
    </div>
  )
}

const TableHead = ({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) => {
  return (
    <thead
      {...props}
      className={clsx(
        'border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50',
        className
      )}
    />
  )
}

const TableHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) => {
  return (
    <th
      {...props}
      className={clsx(
        'px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100',
        className
      )}
    />
  )
}

const TableBody = (props: React.ComponentPropsWithoutRef<'tbody'>) => {
  return <tbody {...props} className={clsx('divide-y divide-zinc-200 dark:divide-zinc-700', props.className)} />
}

const TableRow = ({
  href,
  target,
  title,
  className,
  ...props
}: { href?: string; target?: string; title?: string } & React.ComponentPropsWithoutRef<'tr'>) => {
  const { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider value={{ href, target, title }}>
      <tr
        {...props}
        className={clsx(
          className,
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
          striped && 'even:bg-zinc-50/50 dark:even:bg-zinc-800/25'
        )}
      />
    </TableRowContext.Provider>
  )
}

const TableCell = ({ className, children, ...props }: React.ComponentPropsWithoutRef<'td'>) => {
  const { bleed, dense, grid, striped } = useContext(TableContext)
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={clsx(
        'whitespace-nowrap px-3 py-4 text-sm text-zinc-600 dark:text-zinc-400',
        className
      )}
    >
      {href && (
        <Link
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-none"
        />
      )}
      {children}
    </td>
  )
}

export {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
}
