<template>
    <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">管理员登录</h2>
    <form @submit.prevent="loginAdmin" class="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col gap-4 max-w-md mx-auto">
        <div>
            <label for="adminEmail" class="block text-sm font-medium text-gray-700 mb-1">管理员邮箱</label>
            <input type="email" id="adminEmail" v-model="adminEmail" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>

        <div>
            <label for="adminPassword" class="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
            <input type="password" id="adminPassword" v-model="adminPassword" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>

        <button type="submit"
                class="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition duration-150 ease-in-out">
            登录
        </button>
    </form>

    <MessageBox ref="messageBoxRef" />
</template>

<script setup>
import { ref, inject } from 'vue';
import MessageBox from './MessageBox.vue';

const WORKER_BASE_URL = "https://codingapi.yaoonion.fun"; // <<< 请在此处替换为您的 Cloudflare Worker URL

const emit = defineEmits(['login-success']);

const messageBoxRef = ref(null);
const adminEmail = ref('');
const adminPassword = ref('');
const isLoading = ref(false); // Local loading state for the button

const showLoadingGlobal = inject('showLoading');
const hideLoadingGlobal = inject('hideLoading');

const loginAdmin = async () => {
    if (!adminEmail.value || !adminPassword.value) {
        messageBoxRef.value.show('请输入管理员邮箱和密码。');
        return;
    }

    isLoading.value = true; // Disable button
    showLoadingGlobal(); // Show global loading screen

    const fetchURL = `${WORKER_BASE_URL}/admin/login`;
    console.log('Attempting login to:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: adminEmail.value, password: adminPassword.value }),
            credentials: 'include' // Crucial for sending and receiving cookies
        });

        const data = await response.json();

        if (response.ok && data.success) {
            messageBoxRef.value.show('登录成功！');
            emit('login-success');
        } else {
            messageBoxRef.value.show(data.message || '登录失败，请检查邮箱和密码。');
        }
    } catch (error) {
        console.error('Login error:', error);
        messageBoxRef.value.show('登录过程中发生错误。错误详情: ' + error.message);
    } finally {
        isLoading.value = false; // Re-enable button
        hideLoadingGlobal(); // Hide global loading screen
    }
};
</script>


