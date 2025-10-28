<template>
    <div v-if="isVisible" class="comment-input-overlay"></div>
    <div v-if="isVisible" class="comment-input-modal">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ title }}</h3>
        <textarea v-model="commentInput" class="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500" rows="4" placeholder="请输入意见（可选）..."></textarea>
        <div class="flex justify-center space-x-4">
            <button @click="confirmComment" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">确认</button>
            <button @click="cancelComment" class="px-6 py-2 bg-gray-400 text-white font-semibold rounded-md shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-150 ease-in-out">取消</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const isVisible = ref(false);
const title = ref('');
const commentInput = ref('');
let resolvePromise;
let rejectPromise;

const show = (modalTitle) => {
    title.value = modalTitle;
    commentInput.value = ''; // Clear previous input
    isVisible.value = true;
    return new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
};

const confirmComment = () => {
    isVisible.value = false;
    if (resolvePromise) {
        resolvePromise(commentInput.value);
    }
};

const cancelComment = () => {
    isVisible.value = false;
    if (rejectPromise) {
        rejectPromise(new Error('Comment input cancelled.'));
    }
};

defineExpose({ show });
</script>

<style scoped>
.comment-input-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    text-align: center;
    width: 90%;
    max-width: 500px;
}
.comment-input-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Darker overlay */
    z-index: 1000;
}
</style>
