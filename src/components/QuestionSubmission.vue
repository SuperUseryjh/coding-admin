<template>
    <div class="section mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 class="text-xl font-medium mb-4 text-gray-700">负责人信息 & 题目信息</h3>
        <form @submit.prevent="submitQuestion" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <!-- 负责人信息 -->
            <div>
                <label for="ojName" class="block text-sm font-medium text-gray-700 mb-1">OJ昵称</label>
                <input type="text" id="ojName" v-model="formData.ojName" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div>
                <label for="uid" class="block text-sm font-medium text-gray-700 mb-1">UID</label>
                <input type="text" id="uid" v-model="formData.uid" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input type="email" id="email" v-model="formData.email" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div class="md:col-span-2">
                <label for="awards" class="block text-sm font-medium text-gray-700 mb-1">获奖经历</label>
                <textarea id="awards" v-model="formData.awards" rows="3"
                          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>

            <!-- 题目信息 -->
            <div>
                <label for="questionTitle" class="block text-sm font-medium text-gray-700 mb-1">题目标题</label>
                <input type="text" id="questionTitle" v-model="formData.questionTitle" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div>
                <label for="questionAuthor" class="block text-sm font-medium text-gray-700 mb-1">出题人</label>
                <input type="text" id="questionAuthor" v-model="formData.questionAuthor" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div class="md:col-span-2">
                <label for="questionDifficulty" class="block text-sm font-medium text-gray-700 mb-1">难度</label>
                <select id="questionDifficulty" v-model="formData.questionDifficulty"
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="easy">入门</option>
                    <option value="medium">普及-</option>
                    <option value="hard">普及/提高-</option>
                    <option value="qwe">普及+/提高</option>
                    <option value="df">提高+/省选-</option>
                    <option value="noi">省选/NOI-</option>
                    <option value="ctsc">NOI/NOI+CTSC</option>
                </select>
            </div>

            <div class="md:col-span-2">
                <label for="questionDescription" class="block text-sm font-medium text-gray-700 mb-1">题目描述（善用MarkDown）</label>
                <textarea id="questionDescription" v-model="formData.questionDescription" rows="5" required
                          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>

            <div class="md:col-span-2">
                <label for="dataPackage" class="block text-sm font-medium text-gray-700 mb-1">数据包（请上传zip文件，大小不得超过10KB）</label>
                <input type="file" id="dataPackage" @change="handleFileUpload" accept=".zip" required
                       class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0 file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>

            <div class="md:col-span-2 flex justify-center">
                <button type="submit"
                        class="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md
                               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                               transition duration-150 ease-in-out">
                    提交题目申请
                </button>
            </div>
        </form>
    </div>

    <MessageBox ref="messageBoxRef" />
</template>

<script setup>
import { ref, inject } from 'vue';
import MessageBox from './MessageBox.vue';

const WORKER_BASE_URL = "https://codingapi.yaoonion.fun"; // <<< 请在此处替换为您的 Cloudflare Worker URL

const messageBoxRef = ref(null);
const formData = ref({
    ojName: '',
    uid: '',
    email: '',
    awards: '',
    questionTitle: '',
    questionAuthor: '',
    questionDifficulty: 'easy',
    questionDescription: '',
    dataPackage: null,
});

const isLoading = ref(false); // Local loading state for the button

const showLoadingGlobal = inject('showLoading');
const hideLoadingGlobal = inject('hideLoading');

const handleFileUpload = (event) => {
    formData.value.dataPackage = event.target.files[0];
};

const submitQuestion = async () => {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    if (!formData.value.dataPackage) {
        messageBoxRef.value.show('请上传数据包文件。');
        return;
    }

    isLoading.value = true; // Disable button
    showLoadingGlobal(); // Show global loading screen

    const data = new FormData();
    for (const key in formData.value) {
        if (key === 'dataPackage' && formData.value[key]) {
            data.append(key, formData.value[key]);
        } else if (key !== 'dataPackage') {
            data.append(key, formData.value[key]);
        }
    }

    const fetchURL = `${WORKER_BASE_URL}/submit`;
    console.log('Submitting question to:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            body: data,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        messageBoxRef.value.show(result.message);
        // Clear form after successful submission
        formData.value = {
            ojName: '',
            uid: '',
            email: '',
            awards: '',
            questionTitle: '',
            questionAuthor: '',
            questionDifficulty: 'easy',
            questionDescription: '',
            dataPackage: null,
        };
        document.getElementById('dataPackage').value = ''; // Clear file input manually

    } catch (error) {
        console.error('Error:', error);
        messageBoxRef.value.show('提交过程中发生错误。错误详情: ' + error.message);
    } finally {
        isLoading.value = false; // Re-enable button
        hideLoadingGlobal(); // Hide global loading screen
    }
};
</script>
