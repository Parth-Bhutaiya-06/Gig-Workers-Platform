import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const response = await axios.post(API_URL + 'token/refresh/', {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed, logging out:", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const response = await api.post('login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
};

export const signup = async (userData) => {
    const response = await api.post('signup/', userData);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('profile/');
    return response.data;
};

export const getDashboard = async () => {
    const response = await api.get('dashboard/');
    return response.data;
};

export const getJobs = async (params) => {
    const response = await api.get('jobs/', { params });
    return response.data;
};

export const postJob = async (jobData) => {
    const response = await api.post('jobs/', jobData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const applyJob = async (jobId) => {
    const response = await api.post('applications/', { job: jobId });
    return response.data;
};

export const getApplications = async () => {
    const response = await api.get('applications/');
    return response.data;
};

export const sendMessage = async (applicationId, message) => {
    const response = await api.post('chat/', { application: applicationId, message });
    return response.data;
};

export const getMessages = async (applicationId) => {
    const response = await api.get('chat/', { params: { application: applicationId } });
    return response.data;
};


export const deleteJob = async (id) => {
    const response = await api.delete(`jobs/${id}/`);
    return response.data;
};

export const updateJob = async (id, data) => {
    const response = await api.patch(`jobs/${id}/`, data);
    return response.data;
};

export const updateApplicationWage = async (id, wage) => {
    const response = await api.patch(`applications/${id}/`, { negotiated_wage: wage });
    return response.data;
};

export const updateApplicationStatus = async (id, status) => {
    const response = await api.patch(`applications/${id}/`, { status });
    return response.data;
};

export const submitReview = async (reviewData) => {
    const response = await api.post('reviews/', reviewData);
    return response.data;
};

export default api;
