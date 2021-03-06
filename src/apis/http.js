import axios from 'axios';
import store from '../store';
import router from '../router';

const refreshURL = '/auth/refresh';
const errorHandle = (response) => {
    let status = response.status;
    let msg = response.data.error;
    let data = response.data;
    switch (status) {
        case 500:
            alert(`server side error: ${msg}`);
            store.dispatch("logout");
            router.push("/");
            break;
        case 401:
            if (data.message == '認證失敗') {
                alert("請登入後再執行")
                store.dispatch("logout");
                router.push("/");
            } else if (data.refreshToken) {
                let test = refreshJwtToken(data.refreshToken, response);
                return test;
            }
            else {
                alert(data);
            }
            break;
        case 403:
            console.log(`invalid user: ${msg}`);
            if (msg == 'Expired JWT token') {
                alert('請重新登入');
            }
            router.push("/");
            break;
    }
}

const refreshJwtToken = (refreshToken, response) => {
    store.dispatch('cleanToken');
    const userId = store.getters.getUserId;
    const refresh = instance.post(refreshURL, { refreshToken: refreshToken, userId: userId });
    return refresh.then(resp => {
        const jwtToken = resp.data.jwtToken
        if (jwtToken) {
            store.dispatch('updateToken', { token: jwtToken });
            const originalRequest = response.config;
            originalRequest.headers.Authorization = jwtToken;
            return instance(originalRequest);
        }
    })
};




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
        const callback = errorHandle(response);
        if (callback) {
            return callback;
        } else {
            return Promise.reject(error);
        }
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