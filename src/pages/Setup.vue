<template>
    <div v-if="true" class="setup-container" data-cy="setup-form">
        <div class="setup-card">
            <div class="setup-header">
                <object width="64" height="64" data="/icon.svg"></object>
                <div class="setup-title">FoxTic</div>
            </div>

            <div class="setup-form">
                <p class="setup-section-title">
                    {{ $t("Create your admin account") }}
                </p>

                <div class="form-floating language-select">
                    <select id="language" v-model="$root.language" class="form-select">
                        <option v-for="(lang, i) in $i18n.availableLocales" :key="`Lang${i}`" :value="lang">
                            {{ $i18n.messages[lang].languageName }}
                        </option>
                    </select>
                    <label for="language" class="form-label">{{ $t("Language") }}</label>
                </div>

                <div class="form-floating mt-3">
                    <input id="floatingInput" v-model="username" type="text" class="form-control" :placeholder="$t('Username')" required data-cy="username-input">
                    <label for="floatingInput">{{ $t("Username") }}</label>
                </div>

                <div class="form-floating mt-3">
                    <input id="floatingPassword" v-model="password" type="password" class="form-control" :placeholder="$t('Password')" required data-cy="password-input">
                    <label for="floatingPassword">{{ $t("Password") }}</label>
                </div>

                <div class="form-floating mt-3">
                    <input id="repeat" v-model="repeatPassword" type="password" class="form-control" :placeholder="$t('Repeat Password')" required data-cy="password-repeat-input">
                    <label for="repeat">{{ $t("Repeat Password") }}</label>
                </div>

                <button class="setup-button" type="submit" :disabled="processing" data-cy="submit-setup-form" @click.prevent="submit">
                    {{ $t("Create") }}
                </button>
            </div>
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
            repeatPassword: "",
        };
    },
    watch: {

    },
    mounted() {
        // TODO: Check if it is a database setup

        this.$root.getSocket().emit("needSetup", (needSetup) => {
            if (! needSetup) {
                this.$router.push("/");
            }
        });
    },
    methods: {
        /**
         * Submit form data for processing
         * @returns {void}
         */
        submit() {
            this.processing = true;

            if (this.password !== this.repeatPassword) {
                this.$root.toastError("PasswordsDoNotMatch");
                this.processing = false;
                return;
            }

            this.$root.getSocket().emit("setup", this.username, this.password, (res) => {
                this.processing = false;
                this.$root.toastRes(res);

                if (res.ok) {
                    this.processing = true;

                    this.$root.login(this.username, this.password, "", () => {
                        this.processing = false;
                        this.$router.push("/");
                    });
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.setup-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 100vh;
    background: #1a202c;
    padding: 20px;
    padding-left: 15%;
    position: relative;
    overflow: hidden;
}

.setup-card {
    display: flex;
    flex-direction: column;
    background-color: #24293e;
    border-radius: 16px;
    overflow: hidden;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.setup-header {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    background-color: rgba(0, 0, 0, 0.1);

    .setup-title {
        font-size: 28px;
        font-weight: bold;
        margin-top: 15px;
        color: #fff;
    }
}

.setup-form {
    padding: 30px;
    width: 100%;
    text-align: center;
}

.setup-section-title {
    font-size: 1.2rem;
    margin-bottom: 20px;
    text-align: center;
    color: #fff;
}

.language-select {
    margin-bottom: 20px;
}

.setup-button {
    background-color: #4c8c64;
    color: white;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    margin-top: 20px;
    width: 100%;
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

.form-floating {
    position: relative;
    margin-bottom: 15px;

    > .form-select {
        padding-left: 1.3rem;
        padding-top: 1.525rem;
        line-height: 1.35;
        height: calc(3.5rem + 2px);
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:focus {
            border-color: #4c8c64;
            box-shadow: 0 0 0 0.25rem rgba(76, 140, 100, 0.25);
        }

        ~ label {
            padding-left: 1.3rem;
            color: rgba(255, 255, 255, 0.6);
        }
    }

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

// Responsive adjustments for smaller screens
@media (max-width: 768px) {
    .setup-container {
        padding-left: 20px;
        justify-content: center;
    }
}
</style>
