<template>
    <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login_methods">
        <div class="row flex flex-center q-my-md">
            <q-btn color="primary" label="Sign in with Email" @click="tab='login'" icon="fa-solid fa-envelope" />
        </div>
        <div class="row flex flex-center q-my-md">
            <q-btn color="primary" label="Sign in with Google" @click="signInWithGoogle" icon="fa-brands fa-google" />
        </div>
        <div class="row flex flex-center q-my-md" v-if="false">
            <q-btn color="primary" label="Sign in with Facebook" @click="signInWithFacebook" icon="fa-brands fa-facebook" />
        </div>
        </q-tab-panel>
        <q-tab-panel name="login">
        <div class="row flex flex-center">
            <q-btn flat @click="tab='login_methods'" icon="arrow_back">Back</q-btn>
        </div>
        <div class="row text-center text-red text-subtitle2" v-if="errorMessage != null">
            {{ errorMessage }}
        </div>
        <div class="row flex flex-center">
            <div class="col-12">
            <q-input v-model="email" label="Email" style="width: 100%" />
            </div>
        </div>
        <div class="row flex flex-center">
            <q-input v-model="password" label="Password" type="password" style="width: 100%;" />
            <q-btn color="black" flat label="Forgot password?" @click="forgotPassword" class="q-mt-sm" />
        </div>
        <div class="row flex flex-center q-mt-lg">
            <q-btn color="primary" label="Sign in" @click="signUserInEmail" style="width: 200px" :loading="loading" />
        </div>
        <div class="row flex flex-center">
            <q-btn color="black" flat label="Don't have an account? Sign Up" @click="tab='signup'" class="q-mt-md" />
        </div>
        </q-tab-panel>
        <q-tab-panel name="signup">
        <div class="row flex flex-center">
            <q-btn flat @click="tab='login_methods'" icon="arrow_back">Back</q-btn>
        </div>
        <div class="row text-center text-red text-subtitle2" v-if="errorMessage != null">
            {{ errorMessage }}
        </div>
        <q-form @submit="signUserUpEmail">
            <div class="row flex flex-center">
                <q-input v-model="email" label="Email" lazy-rules :rules="[ val => val && val.length > 0  && val.length < 100|| 'You must provide an email']" style="width: 100%" />
            </div>
            <div class="row flex flex-center">
                <q-input v-model="password" label="Password" type="password" lazy-rules :rules="[ val => val && val.length > 6 || 'You must provide a password greater than 6 characters']" style="width: 100%" />
            </div>
            <div class="row flex flex-center">
                <q-input v-model="passwordRetype" label="Retype Password" type="password" lazy-rules :rules="[ val => val && val===password || 'Passwords must match']" style="width: 100%" />
            </div>
            <div class="row flex flex-center">
                <q-input v-model="displayName" label="Display Name" :rules="[ val => val && val.length > 0 && val.length < 30 || 'You must provide a display name between 1 and 30 characters']" style="width: 100%" />
            </div>
            <div class="row flex flex-center q-mt-lg" >
                <q-btn color="primary" label="Sign Up!" type="submit" style="width: 200px" :loading="loading" />
            </div>
            <div class="row flex flex-center">
                <q-btn color="black" flat label="Already have an account? Sign In" @click="tab='login'" class="q-mt-md" />
            </div>
        </q-form>
        </q-tab-panel>
    </q-tab-panels>
</template>

<script setup lang="ts">
import useFirebase from '../composables/useFirebase'
import { ref, watch } from 'vue'

const { signInWithFacebook, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, sendPasswordReset } = useFirebase();

const emit = defineEmits<{
    'signed-in': [value: boolean]
}>();

const tab = ref('login_methods');

const loading = ref(false);

const email = ref('');
const password = ref('');
const passwordRetype = ref('');
const displayName = ref('');

const errorMessage = ref<string | null>(null);

const forgotPassword = async() => {
if (email.value.length == 0)
{
    errorMessage.value = 'You must provide an email';
    return;
}

await sendPasswordReset(email.value);
    errorMessage.value = 'Password reset email sent';
}

const signUserInEmail = async() => {
    loading.value = true;
    const response = await signInWithEmailPassword(email.value, password.value); 

    if (!response?.success)
    {
        errorMessage.value = response?.message ?? null;
    }

    loading.value = false;

    emit('signed-in', true);
}

const signUserUpEmail = async() => {
    loading.value = true;

    const response = await signUpWithEmailPassword(email.value, password.value, displayName.value); 

    if (!response?.success)
    {
        errorMessage.value = response?.message ?? null;
    }

    loading.value = false;

    emit('signed-in', true);
}

watch(tab, () => {
    errorMessage.value = null;
});

</script>
  