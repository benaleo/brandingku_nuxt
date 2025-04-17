import axios from 'axios';

export default {

    login(email: string, password: string) {
        const config = useRuntimeConfig()
        const BASE_URL = config.public.API_URL
        const url = `${BASE_URL}/api/auth/login`
        return axios.post(url, {
            email,
            password
        });
    }
};
