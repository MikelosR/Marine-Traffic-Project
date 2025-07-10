import axios from 'axios';
// TEMP
const apiUrl = 'http://localhost:8080'

const publicAxios = axios.create({
    baseURL: apiUrl,
});


export default publicAxios;