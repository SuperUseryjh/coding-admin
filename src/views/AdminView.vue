<template>
    <div class="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl">
        <h1 class="text-3xl font-bold text-center mb-4 text-gray-800">C++ Coding组题目审核后台</h1>
        <p class="text-center text-gray-600 mb-8">管理员可以在这里审核提交的题目。</p>

        <AdminLogin v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
        <AdminDashboard v-else />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLogin from '../components/AdminLogin.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const isLoggedIn = ref(false);

const checkLoginStatus = () => {
    // Check for jwt_token cookie to determine login status
    const jwtToken = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
    isLoggedIn.value = !!jwtToken;
};

const handleLoginSuccess = () => {
    isLoggedIn.value = true;
};

onMounted(() => {
    checkLoginStatus();
});
</script>
