import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput, InquiryResponse, InquiryThread } from '~/types/admin-smtp.type'

const RESPONSE_FIELDS = `
    id inquiry_id direction from_email to_email subject body status error_message sent_by reply_expires_at created_at
    attachments { id file_name content_type size path }
`

const THREAD_FIELDS = `
    name subject message status can_reply expires_at
    messages { id direction subject body created_at attachments { id file_name content_type size path } }
`

export const useInquiryResponseService = () => {
    const { gqlFetch } = useGql()

    const getInquiryResponses = async (inquiryId: number | string) => {
        const query = `query getInquiryResponses($inquiry_id: Int!) { getInquiryResponses(inquiry_id: $inquiry_id) { ${RESPONSE_FIELDS} } }`
        const res = await gqlFetch<{ getInquiryResponses: InquiryResponse[] }>(query, { inquiry_id: Number(inquiryId) }, { auth: true })
        return res?.getInquiryResponses || []
    }

    // SMTP delivery plus attachment storage can take a while, so allow up to a minute
    const respondInquiry = async (inquiryId: number | string, subject: string, body: string, attachments: EmailAttachmentInput[]) => {
        const mutation = `
            mutation respondInquiry($inquiry_id: Int!, $subject: String!, $body: String!, $attachments: [EmailAttachmentInput!]) {
                respondInquiry(inquiry_id: $inquiry_id, subject: $subject, body: $body, attachments: $attachments) { ${RESPONSE_FIELDS} }
            }
        `
        const res = await gqlFetch<{ respondInquiry: InquiryResponse }>(mutation, {
            inquiry_id: Number(inquiryId),
            subject,
            body,
            attachments,
        }, { auth: true, timeout: 60000 })
        return res?.respondInquiry
    }

    // public: the customer reaches these through the reply link token, no login
    const getInquiryThread = async (token: string) => {
        const query = `query getInquiryThread($token: String!) { getInquiryThread(token: $token) { ${THREAD_FIELDS} } }`
        const res = await gqlFetch<{ getInquiryThread: InquiryThread }>(query, { token })
        return res?.getInquiryThread
    }

    const replyInquiry = async (token: string, message: string, close: boolean) => {
        const mutation = `
            mutation replyInquiry($token: String!, $message: String, $close: Boolean!) {
                replyInquiry(token: $token, message: $message, close: $close) { ${THREAD_FIELDS} }
            }
        `
        const res = await gqlFetch<{ replyInquiry: InquiryThread }>(mutation, { token, message, close })
        return res?.replyInquiry
    }

    return { getInquiryResponses, respondInquiry, getInquiryThread, replyInquiry }
}
