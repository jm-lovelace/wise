<template>
<div>
    <LoginScreen v-if="!userId" />
    <div v-else>
        Hi, {{ user?.displayName || '' }}!
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoginScreen from './LoginScreen.vue';
import { useAppStore } from '../stores/app-store';
import useFirebase from '../composables/useFirebase';

const { user, userId } = useFirebase();
</script>