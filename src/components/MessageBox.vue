<template>
    <div v-if="isVisible" class="message-box-overlay"></div>
    <div v-if="isVisible" class="message-box">
        <p class="text-lg font-medium text-gray-800 mb-4">{{ message }}</p>
        <button @click="close"
                class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition duration-150 ease-in-out">
            确定
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const isVisible = ref(false);
const message = ref('');
let resolvePromise;

const show = (msg) => {
    message.value = msg;
    isVisible.value = true;
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
};

const close = () => {
    isVisible.value = false;
    if (resolvePromise) {
        resolvePromise(true);
    }
};

// Expose show method to parent components
defineExpose({ show });
</script>

<style scoped>
.message-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    text-align: center;
}
.message-box-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}
</style>
