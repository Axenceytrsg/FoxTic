<template>
    <form @submit.prevent="submit">
        <div ref="modal" class="modal fade custom-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content" :class="[ currentTheme ]">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ $t("Setup 2FA") }}
                            <span v-if="twoFAStatus == true" class="badge bg-primary">{{ $t("Active") }}</span>
                            <span v-if="twoFAStatus == false" class="badge bg-primary">{{ $t("Inactive") }}</span>
                        </h5>
                        <button :disabled="processing" type="button" aria-label="Close" class="btn-close" @click="hideModal" />
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <div v-if="uri && twoFAStatus == false" class="mx-auto text-center" style="width: 210px;">
                                <vue-qrcode :key="uri" :value="uri" type="image/png" :quality="1" :color="{ light: '#ffffffff' }" />
                                <button v-show="!showURI" type="button" class="btn btn-outline-primary btn-sm mt-2" @click="showURI = true">{{ $t("Show URI") }}</button>
                            </div>
                            <p v-if="showURI && twoFAStatus == false" class="text-break mt-2">{{ uri }}</p>

                            <div v-if="!(uri && twoFAStatus == false)" class="mb-3">
                                <label for="current-password" class="form-label">
                                    {{ $t("Current Password") }}
                                </label>
                                <input
                                    id="current-password"
                                    v-model="currentPassword"
                                    type="password"
                                    class="form-control"
                                    autocomplete="current-password"
                                    required
                                />
                            </div>

                            <button v-if="uri == null && twoFAStatus == false" class="btn btn-primary" type="button" @click="prepare2FA()">
                                {{ $t("Enable 2FA") }}
                            </button>

                            <button v-if="twoFAStatus == true" class="btn btn-danger" type="button" :disabled="processing" @click="confirmDisableTwoFA()">
                                {{ $t("Disable 2FA") }}
                            </button>

                            <div v-if="uri && twoFAStatus == false" class="mt-3">
                                <label for="basic-url" class="form-label">{{ $t("twoFAVerifyLabel") }}</label>
                                <div class="input-group">
                                    <input v-model="token" type="text" maxlength="6" class="form-control" autocomplete="one-time-code" required>
                                    <button class="btn btn-outline-primary" type="button" @click="verifyToken()">{{ $t("Verify Token") }}</button>
                                </div>
                                <p v-show="tokenValid" class="mt-2" style="color: green;">{{ $t("tokenValidSettingsMsg") }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="uri && twoFAStatus == false" class="modal-footer">
                        <button type="submit" class="btn btn-primary" :disabled="processing || tokenValid == false" @click="confirmEnableTwoFA()">
                            <div v-if="processing" class="spinner-border spinner-border-sm me-1"></div>
                            {{ $t("Save") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <Confirm ref="confirmEnableTwoFA" btn-style="btn-danger" :yes-text="$t('Yes')" :no-text="$t('No')" @yes="save2FA">
        {{ $t("confirmEnableTwoFAMsg") }}
    </Confirm>

    <Confirm ref="confirmDisableTwoFA" btn-style="btn-danger" :yes-text="$t('Yes')" :no-text="$t('No')" @yes="disable2FA">
        {{ $t("confirmDisableTwoFAMsg") }}
    </Confirm>
</template>

<script lang="ts">
import Confirm from "./Confirm.vue";
import VueQrcode from "vue-qrcode";
import modalMixin from "../mixins/modal";

export default {
    components: {
        Confirm,
        VueQrcode,
    },
    mixins: [ modalMixin ],
    props: {},
    data() {
        return {
            currentPassword: "",
            processing: false,
            uri: null,
            tokenValid: false,
            twoFAStatus: null,
            token: null,
            showURI: false,
        };
    },
    mounted() {
        this.getStatus();
    },
    methods: {
        /**
         * Show the dialog
         * @returns {void}
         */
        show() {
            this.showModal();
        },

        /**
         * Hide the dialog
         * @returns {void}
         */
        hide() {
            this.hideModal();
        },

        /**
         * Show dialog to confirm enabling 2FA
         * @returns {void}
         */
        confirmEnableTwoFA() {
            this.$refs.confirmEnableTwoFA.show();
        },

        /**
         * Show dialog to confirm disabling 2FA
         * @returns {void}
         */
        confirmDisableTwoFA() {
            this.$refs.confirmDisableTwoFA.show();
        },

        /**
         * Prepare 2FA configuration
         * @returns {void}
         */
        prepare2FA() {
            this.processing = true;

            this.$root.getSocket().emit("prepare2FA", this.currentPassword, (res) => {
                this.processing = false;

                if (res.ok) {
                    this.uri = res.uri;
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Save the current 2FA configuration
         * @returns {void}
         */
        save2FA() {
            this.processing = true;

            this.$root.getSocket().emit("save2FA", this.currentPassword, (res) => {
                this.processing = false;

                if (res.ok) {
                    this.$root.toastRes(res);
                    this.getStatus();
                    this.currentPassword = "";
                    this.hide();
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Disable 2FA for this user
         * @returns {void}
         */
        disable2FA() {
            this.processing = true;

            this.$root.getSocket().emit("disable2FA", this.currentPassword, (res) => {
                this.processing = false;

                if (res.ok) {
                    this.$root.toastRes(res);
                    this.getStatus();
                    this.currentPassword = "";
                    this.hide();
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Verify the token generated by the user
         * @returns {void}
         */
        verifyToken() {
            this.$root.getSocket().emit("verifyToken", this.token, this.currentPassword, (res) => {
                if (res.ok) {
                    this.tokenValid = res.valid;
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },

        /**
         * Get current status of 2FA
         * @returns {void}
         */
        getStatus() {
            this.$root.getSocket().emit("get2FAStatus", (res) => {
                if (res.ok) {
                    this.twoFAStatus = res.status;
                }
            });
        },
    },
};
</script>

<style lang="scss">
@import "../assets/vars.scss";

.custom-modal {
    z-index: 1100 !important;
}

.custom-modal .modal-dialog {
    z-index: 1101 !important;
}

.custom-modal .modal-content {
    z-index: 1102 !important;
}

/* Thèmes spécifiques */
.dark {
    .modal-dialog .form-text, .modal-dialog p {
        color: $dark-font-color;
    }
}
</style>
