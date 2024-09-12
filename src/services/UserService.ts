import axios from 'axios';

const API_URL = 'http://localhost:5000/users';

export const getUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const addUser = async (user: any) => {
    const response = await axios.post(API_URL, user);
    return response.data;
}

export const updateUser = async (user: any) => {
    const response = await axios.put(`${API_URL}/${user.id}`, user);
    return response.data;
}

export const deleteUser = async (id: any) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
}