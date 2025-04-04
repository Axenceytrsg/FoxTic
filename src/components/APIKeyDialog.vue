<template>
    <form @submit.prevent="submit">
        <!-- Premier modal pour ajouter une clé API -->
        <div ref="keyaddmodal" class="modal fade custom-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content" :class="[ currentTheme ]">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ $t("Add API Key") }}
                        </h5>
                        <button type="button" class="btn-close" aria-label="Close" @click="hideAddModal" />
                    </div>
                    <div class="modal-body">
                        <!-- Name -->
                        <div class="mb-3">
                            <label for="name" class="form-label">{{ $t("Name") }}</label>
                            <input
                                id="name" v-model="key.name" type="text" class="form-control"
                                required
                            >
                        </div>

                        <!-- Expiry -->
                        <div class="my-3">
                            <label class="form-label">{{ $t("Expiry date") }}</label>
                            <div class="d-flex flex-row align-items-center">
                                <div class="col-6">
                                    <Datepicker
                                        v-model="key.expires"
                                        :dark="currentTheme === 'dark'"
                                        :monthChangeOnScroll="false"
                                        :minDate="minDate"
                                        format="yyyy-MM-dd HH:mm"
                                        modelType="yyyy-MM-dd HH:mm:ss"
                                        :required="!noExpire"
                                        :disabled="noExpire"
                                    />
                                </div>
                                <div class="col-6 ms-3">
                                    <div class="form-check mb-0">
                                        <input
                                            id="no-expire" v-model="noExpire" class="form-check-input"
                                            type="checkbox"
                                        >
                                        <label class="form-check-label" for="no-expire">{{
                                            $t("Don't expire")
                                        }}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="hideAddModal">
                            {{ $t("Cancel") }}
                        </button>
                        <button
                            id="monitor-submit-btn" class="btn btn-primary" type="submit"
                            :disabled="processing"
                        >
                            {{ $t("Generate") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Second modal pour afficher la clé générée -->
        <div ref="keymodal" class="modal fade custom-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content" :class="[ currentTheme ]">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ $t("Key Added") }}
                        </h5>
                        <button type="button" class="btn-close" aria-label="Close" @click="hideKeyModal" />
                    </div>

                    <div class="modal-body">
                        <div class="mb-3">
                            {{ $t("apiKeyAddedMsg") }}
                        </div>
                        <div class="mb-3">
                            <CopyableInput v-model="clearKey" disabled="disabled" />
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="hideKeyModal">
                            {{ $t('Continue') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script lang="ts">
import dayjs from "dayjs";
import Datepicker from "@vuepic/vue-datepicker";
import CopyableInput from "./CopyableInput.vue";
import modalMixin from "../mixins/modal";
import { Modal } from "bootstrap";

export default {
    components: {
        CopyableInput,
        Datepicker
    },
    mixins: [ modalMixin ],
    props: {},
    data() {
        return {
            // Instances des modaux
            keyaddModalInstance: null,
            keyModalInstance: null,
            // État du formulaire
            processing: false,
            key: {
                name: "",
                expires: "",
                active: 1
            },
            minDate: dayjs().format("YYYY-MM-DD HH:mm"),
            clearKey: "",
            noExpire: false,
        };
    },

    mounted() {
        // Initialiser les deux modaux avec Bootstrap
        this.keyaddModalInstance = new Modal(this.$refs.keyaddmodal, {
            backdrop: "static",
            keyboard: false
        });
        this.keyModalInstance = new Modal(this.$refs.keymodal, {
            backdrop: "static",
            keyboard: false
        });
    },

    methods: {
        /**
         * Afficher le modal d'ajout de clé API
         * @returns {void}
         */
        show() {
            // Réinitialiser les données
            this.clearForm();
            // Nettoyer les backdrops avant d'afficher le modal
            this.cleanupBackdrops();
            this.keyaddModalInstance.show();
        },
        /**
         * Masquer le modal d'ajout de clé API
         * @returns {void}
         */
        hideAddModal() {
            this.keyaddModalInstance.hide();
            this.cleanupBackdrops();
        },
        /**
         * Masquer le modal affichant la clé générée
         * @returns {void}
         */
        hideKeyModal() {
            this.keyModalInstance.hide();
            this.cleanupBackdrops();
        },
        /**
         * Envoyer les données au serveur
         * @returns {Promise<void>}
         */
        async submit() {
            this.processing = true;

            if (this.noExpire) {
                this.key.expires = "";
            }

            this.$root.addAPIKey(this.key, async (res) => {
                this.hideAddModal();
                this.processing = false;
                if (res.ok) {
                    this.clearKey = res.key;
                    // Nettoyer les backdrops avant d'afficher le second modal
                    this.cleanupBackdrops();
                    this.keyModalInstance.show();
                    this.clearForm();
                } else {
                    this.$root.toastError(res.msg);
                }
            });
        },
        /**
         * Réinitialiser le formulaire
         * @returns {void}
         */
        clearForm() {
            this.key = {
                name: "",
                expires: this.minDate,
                active: 1,
            };
            this.noExpire = false;
        }
    }
};
</script>

<style lang="scss">
@import "../assets/vars.scss";

/* Styles pour assurer que les modaux s'affichent correctement */
.custom-modal {
    z-index: 1100 !important;
}

.custom-modal .modal-dialog {
    z-index: 1101 !important;
}

.custom-modal .modal-content {
    z-index: 1102 !important;
}

/* Styles spécifiques au thème */
.dark {
    .modal-dialog .form-text, .modal-dialog p {
        color: $dark-font-color;
    }
}

.shadow-box {
    padding: 20px;
}

textarea {
    min-height: 150px;
}

.dark-calendar::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
</style>
