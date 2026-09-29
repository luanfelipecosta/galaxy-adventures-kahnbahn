import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/utils'

type KanbanMarkdownDescriptionFieldProps = {
  errorMessage?: string
  value: string
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

const tabClassName =
  'inline-flex min-h-8 items-center justify-center rounded-md px-3 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-sm'

export const KanbanMarkdownDescriptionField = ({ errorMessage, value, textareaProps }: KanbanMarkdownDescriptionFieldProps) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const previewValue = value.trim()

  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <span>Description</span>
      <div className={cn('overflow-hidden rounded-md border border-input bg-card', errorMessage && 'border-destructive')}>
        <div className="flex border-b border-border bg-muted/40 p-1" role="tablist" aria-label="Description mode">
          <button
            type="button"
            className={tabClassName}
            role="tab"
            data-active={activeTab === 'write'}
            aria-selected={activeTab === 'write'}
            onClick={() => setActiveTab('write')}
          >
            Write
          </button>
          <button
            type="button"
            className={tabClassName}
            role="tab"
            data-active={activeTab === 'preview'}
            aria-selected={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
        {activeTab === 'write' ? (
          <textarea
            {...textareaProps}
            className={cn(
              'min-h-32 w-full resize-y border-0 bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20',
              textareaProps.className,
            )}
            aria-invalid={Boolean(errorMessage)}
          />
        ) : (
          <div className="min-h-32 px-3 py-2 text-sm leading-6 text-foreground">
            {previewValue ? (
              <ReactMarkdown
                components={{
                  a: ({ children, ...props }) => (
                    <a className="font-medium text-primary-foreground underline underline-offset-4" {...props}>
                      {children}
                    </a>
                  ),
                  code: ({ children, ...props }) => (
                    <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] text-foreground" {...props}>
                      {children}
                    </code>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="my-2 list-decimal space-y-1 pl-5" {...props}>
                      {children}
                    </ol>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="my-2 first:mt-0 last:mb-0" {...props}>
                      {children}
                    </p>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs leading-5 text-foreground" {...props}>
                      {children}
                    </pre>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="my-2 list-disc space-y-1 pl-5" {...props}>
                      {children}
                    </ul>
                  ),
                }}
              >
                {previewValue}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Nothing to preview.</p>
            )}
          </div>
        )}
      </div>
      {errorMessage ? <span className="text-xs font-medium text-destructive">{errorMessage}</span> : null}
    </div>
  )
}
