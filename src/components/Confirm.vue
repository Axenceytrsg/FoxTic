<template>
    <div ref="modal" class="modal fade custom-modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content" :class="[currentTheme]">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title || $t("Confirm") }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="hideModal" />
                </div>
                <div class="modal-body">
                    <slot />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" :class="btnStyle" @click="confirmYes">
                        {{ yesText }}
                    </button>
                    <button type="button" class="btn btn-secondary" @click="confirmNo">
                        {{ noText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import modalMixin from "../mixins/modal";

export default {
    mixins: [ modalMixin ],
    props: {
        /** Style of button */
        btnStyle: {
            type: String,
            default: "btn-primary"
        },
        /** Text to use as yes */
        yesText: {
            type: String,
            default: "Yes"
        },
        /** Text to use as no */
        noText: {
            type: String,
            default: "No"
        },
        /** Title to show on modal. Defaults to translated version of "Config" */
        title: {
            type: String,
            default: null
        }
    },
    emits: ["yes", "no"],
    methods: {
        /**
         * Show the confirm dialog
         * @returns {void}
         */
        show() {
            this.showModal();
        },
        /**
         * @fires string "yes" Notify the parent when Yes is pressed
         * @returns {void}
         */
        confirmYes() {
            this.hideModal();
            this.$emit("yes");
        },
        /**
         * @fires string "no" Notify the parent when No is pressed
         * @returns {void}
         */
        confirmNo() {
            this.hideModal();
            this.$emit("no");
        }
    }
};
</script>

<style>
.custom-modal {
    z-index: 2000 !important;
}

.custom-modal .modal-dialog {
    z-index: 2001 !important;
}

.custom-modal .modal-content {
    z-index: 2002 !important;
}

.modal-content.dark {
    background-color: #343a40;
    color: #f8f9fa;
}

.modal-content.dark .modal-header {
    border-bottom-color: #495057;
}

.modal-content.dark .modal-footer {
    border-top-color: #495057;
}

.modal-content.dark .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
}
</style>
