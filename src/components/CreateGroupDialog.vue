<template>
    <div ref="modal" class="modal fade custom-modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content" :class="[ currentTheme ]">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ $t("New Group") }}
                    </h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="hideModal" />
                </div>
                <div class="modal-body">
                    <form @submit.prevent="confirm">
                        <div>
                            <label for="draftGroupName" class="form-label">{{ $t("Group Name") }}</label>
                            <input id="draftGroupName" v-model="groupName" type="text" class="form-control">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="hideModal">
                        {{ $t("Cancel") }}
                    </button>
                    <button type="button" class="btn btn-primary" :disabled="groupName == '' || groupName == null" @click="confirm">
                        {{ $t("Confirm") }}
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
    props: {},
    emits: [ "added" ],
    data() {
        return {
            groupName: null,
        };
    },
    methods: {
        /**
         * Afficher le modal de création de groupe
         * @returns {void}
         */
        show() {
            // Réinitialiser avant d'afficher
            this.groupName = null;
            // Utiliser la méthode du mixin qui nettoie les backdrops correctement
            this.showModal();
        },
        /**
         * Gérer la confirmation du dialogue
         * @returns {void}
         */
        confirm() {
            if (this.groupName) {
                this.$emit("added", this.groupName);
                // Utiliser la méthode du mixin pour masquer le modal et nettoyer le backdrop
                this.hideModal();
            }
        },
    },
};
</script>

<style lang="scss">
@import "../assets/vars.scss";

/* S'assurer que les modaux ont un z-index suffisamment élevé */
.custom-modal {
    z-index: 1100 !important;
}

.custom-modal .modal-dialog {
    z-index: 1101 !important;
}

.custom-modal .modal-content {
    z-index: 1102 !important;
}
</style>
