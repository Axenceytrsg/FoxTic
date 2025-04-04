<template>
    <div class="form-container">
        <div class="form">
            <form @submit.prevent="submit">
                <h1 class="h3 mb-3 fw-normal" />

                <div v-if="!tokenRequired" class="form-floating">
                    <input id="floatingInput" v-model="username" type="text" class="form-control" placeholder="Username" autocomplete="username" required>
                    <label for="floatingInput">{{ $t("Username") }}</label>
                </div>

                <div v-if="!tokenRequired" class="form-floating mt-3">
                    <input id="floatingPassword" v-model="password" type="password" class="form-control" placeholder="Password" autocomplete="current-password" required>
                    <label for="floatingPassword">{{ $t("Password") }}</label>
                </div>

                <div v-if="tokenRequired">
                    <div class="form-floating mt-3">
                        <input id="otp" v-model="token" type="text" maxlength="6" class="form-control" placeholder="123456" autocomplete="one-time-code" required>
                        <label for="otp">{{ $t("Token") }}</label>
                    </div>
                </div>

                <div class="form-check mb-3 mt-3 d-flex justify-content-center pe-4">
                    <div class="form-check">
                        <input id="remember" v-model="$root.remember" type="checkbox" value="remember-me" class="form-check-input">

                        <label class="form-check-label" for="remember">
                            {{ $t("Remember me") }}
                        </label>
                    </div>
                </div>
                <button class="w-100 btn btn-primary" type="submit" :disabled="processing">
                    {{ $t("Login") }}
                </button>

                <div v-if="res && !res.ok" class="alert alert-danger mt-3" role="alert">
                    {{ $t(res.msg) }}
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            processing: false,
            username: "",
            password: "",
            token: "",
            res: null,
            tokenRequired: false,
        };
    },

    mounted() {
        document.title += " - Login";
    },

    unmounted() {
        document.title = document.title.replace(" - Login", "");
    },

    methods: {
        /**
         * Submit the user details and attempt to log in
         * @returns {void}
         */
        submit() {
            this.processing = true;

            this.$root.login(this.username, this.password, this.token, (res) => {
                this.processing = false;

                if (res.tokenRequired) {
                    this.tokenRequired = true;
                } else {
                    this.res = res;
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.form-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: 80vh;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.form {
    width: 100%;
    max-width: 380px;
    padding: 30px;
    margin: auto;
    text-align: center;
    background-color: #24293e;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-floating {
    position: relative;
    margin-bottom: 15px;

    > label {
        padding-left: 1.3rem;
        color: rgba(255, 255, 255, 0.6);
    }

    > .form-control {
        padding-left: 1.3rem;
        height: calc(3.5rem + 2px);
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:focus {
            border-color: #4c8c64;
            box-shadow: 0 0 0 0.25rem rgba(76, 140, 100, 0.25);
        }
    }
}

.btn-primary {
    background-color: #4c8c64;
    color: white;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    margin-top: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #3a6b4d;
    }

    &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
}

.form-check-input {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:checked {
        background-color: #4c8c64;
        border-color: #4c8c64;
    }
}

.form-check-label {
    color: rgba(255, 255, 255, 0.8);
}

.alert-danger {
    background-color: rgba(220, 53, 69, 0.1);
    color: #ff6b6b;
    border-color: rgba(220, 53, 69, 0.2);
    border-radius: 8px;
}

// Responsive adjustments for smaller screens
@media (max-width: 768px) {
    .form {
        max-width: 320px;
        padding: 20px;
    }
}
</style>
