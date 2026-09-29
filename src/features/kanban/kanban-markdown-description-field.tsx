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
const markdownPreviewClassName =
  'min-h-32 px-3 py-2 text-sm leading-6 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:font-medium [&_a]:text-primary-foreground [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-foreground [&_em]:italic [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:my-3 [&_hr]:border-border [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs [&_pre]:leading-5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5'

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
          <div className={markdownPreviewClassName}>
            {previewValue ? (
              <ReactMarkdown>{previewValue}</ReactMarkdown>
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
