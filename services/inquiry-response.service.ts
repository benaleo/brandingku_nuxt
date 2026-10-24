import { useGql } from '~/composables/useGql'
import type { EmailAttachmentInput, InquiryResponse } from '~/types/admin-smtp.type'

const RESPONSE_FIELDS = `
    id inquiry_id from_email to_email subject body status error_message sent_by created_at
    attachments { id file_name content_type size path }
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

    return { getInquiryResponses, respondInquiry }
}
