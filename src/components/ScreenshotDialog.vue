<template>
    <div ref="modal" class="modal fade custom-modal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content" :class="[ currentTheme ]">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ $t("Browser Screenshot") }}
                    </h5>
                    <button type="button" aria-label="Close" class="btn-close" @click="hideModal" />
                </div>
                <div class="modal-body">
                    <img :src="imageURL" alt="screenshot of the website">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import modalMixin from "../mixins/modal";

export default {
    mixins: [ modalMixin ],
    props: {
        imageURL: {
            type: String,
            required: true,
        },
    },
    methods: {
        show() {
            this.showModal();
        },
        hide() {
            this.hideModal();
        }
    },
};
</script>

<style lang="scss">
@import "../assets/vars.scss";

/* Assurer que le z-index est suffisamment élevé pour être au-dessus des autres éléments */
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
