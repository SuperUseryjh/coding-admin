<template>
  <div id="app" class="font-sans bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
    <router-view />

    <!-- Loading Screen Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div class="flex flex-col items-center">
        <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p class="text-white text-lg">加载中...</p>
      </div>
    </div>

    <!-- Developer Info Footer (Moved here to be consistent across all pages) -->
    <footer class="mt-8 py-4 text-center text-gray-600 text-sm">
        <div class="container mx-auto">
            <p class="mt-2">&copy; 2026 C++ Coding组题目审核系统. All rights reserved.</p>
        </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';

const isLoading = ref(false);

const showLoading = () => {
  isLoading.value = true;
};

const hideLoading = () => {
  isLoading.value = false;
};

provide('showLoading', showLoading);
provide('hideLoading', hideLoading);
</script>

<style>
/* Global styles from original HTML files */
body {
    font-family: 'Inter', sans-serif;
    background-color: #f3f4f6; /* 浅灰色背景 */
}

/* Tailwind CSS configuration (if not already in tailwind.config.js) */
/* This is usually handled by a postcss.config.js and tailwind.config.js setup in a real Vue project */
/* For CDN, it's included directly in public/index.html or here if using a build step */

/* Custom loader for loading screen */
.loader {
  border-top-color: #3498db; /* Blue color for the spinner */
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>