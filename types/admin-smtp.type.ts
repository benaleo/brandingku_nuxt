export type AdminSmtp = {
    id: number
    email: string
    provider: string
    branch?: string | null
    sender_name?: string | null
    host: string
    port: number
    quota: number
    available_today: number
    quota_date?: string | null
    is_active: boolean
    has_app_password: boolean
    has_secret: boolean
    created_at: string
    updated_at: string
}

export type AdminSmtpInput = {
    email: string
    // empty on update keeps the stored password
    app_password?: string | null
    provider?: string | null
    branch?: string | null
    sender_name?: string | null
    host?: string | null
    port?: number | null
    secret?: string | null
    quota?: number | null
    available_today?: number | null
    is_active?: boolean | null
}

export type InquiryResponseAttachment = {
    id: number
    file_name: string
    content_type: string
    size: number
    path: string
}

export type InquiryResponse = {
    id: number
    inquiry_id: number
    from_email: string
    to_email: string
    subject: string
    body: string
    status: 'sent' | 'failed' | string
    error_message?: string | null
    sent_by: string
    attachments: InquiryResponseAttachment[]
    created_at: string
}

export type EmailAttachmentInput = {
    file_name: string
    content_type?: string
    content: string
}
