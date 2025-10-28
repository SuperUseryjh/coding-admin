<template>
    <div class="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl">
        <h1 class="text-3xl font-bold text-center mb-2 text-gray-800">C++ Coding组题目审核系统</h1>
        <p class="text-center text-gray-600 text-lg mb-4">限审核C++ Coding组题目，其他一律打回</p>
        <p class="text-center text-gray-600 mb-8">公平 · 公正 · 公开</p>

        <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">提交题目申请</h2>
        <QuestionSubmission />

        <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">查询题目审核状态</h2>
        <QuestionQuery />
    </div>
</template>

<script setup>
import QuestionSubmission from '../components/QuestionSubmission.vue';
import QuestionQuery from '../components/QuestionQuery.vue';
</script>

<style scoped>
/* You can add specific styles for HomeView here if needed */
</style>
