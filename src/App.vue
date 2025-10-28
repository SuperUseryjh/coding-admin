<template>
  <div id="app" class="font-sans bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
    <router-view />

    <!-- Developer Info Footer (Moved here to be consistent across all pages) -->
    <footer class="mt-8 py-4 text-center text-gray-600 text-sm">
        <div class="container mx-auto">
            <p>开发者信息：Mr_Onion</p>
            <p>联系邮箱：admin@mr-onion-blog.fun</p>
            <p>开发者首页：<a href="https://mr-onion-blog.fun" target="_blank" class="text-blue-600 hover:underline">Mr_Onion's Blog</a></p>
            <p class="mt-2">&copy; 2025 C++ Coding组题目审核系统. All rights reserved.</p>
        </div>
    </footer>
  </div>
</template>

<script setup>
// No script logic needed here for a simple router-view wrapper
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
</style>