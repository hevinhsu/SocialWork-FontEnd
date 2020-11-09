import axios from 'axios';
import store from '../store';


const errorHandle = (status, msg) => {
    switch (status) {
        case 500:
            alert(`server side error: ${msg}`);
            break;
    }
}






var instance = axios.create({
    baseURL: 'http://localhost:8079',
    headers: { 'Content-Type': 'application/json' },
})


// request 攔截器
instance.interceptors.request.use((config) => {
    //判斷是否有token
    const token = store.state.auth.token;
    token && (config.headers.Authorization = token);
    return config;
}, (error) => {
    return Promise.reject(error);
})

// response 攔截器
instance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const { response } = error;
    if (response) {
        errorHandle(response.status, response.data.error);
        return Promise.reject(error);
    } else {
        if (!window.navigator.onLine) {
            alert(`網路發生問題，請檢查網路連線狀態後再重新嘗試`);
        } else {
            return Promise.reject(error)
        }
    }
});

export default function (method, url, data = null) {
    method = method.toLowerCase();
    if (method == 'post') {
        return instance.post(url, data);
    } else if (method == 'get') {
        return instance.get(url, data);
    } else if (method == 'put') {
        return instance.put(url, data);
    } else if (method == 'delete') {
        return instance.delete(url, data);
    } else {
        console.error(`undefined method ${method}`);
        return false;
    }
}