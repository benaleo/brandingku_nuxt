interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

export const useUserProfile = () => {
  const { gqlFetch } = useGql();
  const router = useRouter();
  const token = useCookie<string | null>('token', { sameSite: 'lax' });

  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getUserProfile = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Check if user is authenticated
      if (!token.value) {
        router.push('/console/auth');
        return null;
      }

      const query = `
        query GetUserProfile($id: String!) {
          getUserProfile(secure_id: $id) {
            id
            name
            email
            phone
            address
            avatar
          }
        }
      `;

      const data = await gqlFetch<{ getUserProfile: UserProfile }>(query, { id }, { auth: true });
      
      profile.value = data.getUserProfile;
      return profile.value;

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user profile';
      
      // If unauthorized, redirect to login
      if (err.message?.includes('403') || err.message?.includes('unauthorized')) {
        token.value = null;
        router.push('/console/auth');
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearProfile = () => {
    profile.value = null;
    error.value = null;
  };

  return {
    profile,
    loading,
    error,
    getUserProfile,
    clearProfile,
  };
};
