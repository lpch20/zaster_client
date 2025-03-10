import api from "./RULE_index";

export const loginAuth = async (username: string, password: string) => {
    const url = `/login`;
    try {
        const response = await api.post(url, { username, password });
        return response.data;
    } catch (error: any) {
        throw error.response.data.error;
    }
};
