import { ref } from "vue";
import { useGql } from "~/composables/useGql";

export const useWebContactService = () => {
  const { gqlFetch } = useGql();

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const createInquiry = async (vars: {
    name: string;
    email: string;
    subject: string;
    message: string;
    model: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const mutation = `
        mutation createInquiry($name: String!, $email: String!, $subject: String!, $message: String!, $model: String!) {
          createInquiries(
            name: $name
            email: $email
            subject: $subject
            message: $message
            model: $model
          ) {
            name
            email
            subject
            message
            model
            status
            created_at
            created_by
          }
        }
      `;

      const data = await gqlFetch<{
        createInquiries: {
          name: string;
          email: string;
          subject: string;
          message: string;
          model: string;
          status: string;
          created_at: string;
          created_by: string;
        };
      }>(mutation, vars);

      return data.createInquiries;
    } catch (e: any) {
      console.error("[web-contact] createInquiry error:", e);
      error.value = e?.message || "Failed to send inquiry";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    createInquiry,
  };
};
