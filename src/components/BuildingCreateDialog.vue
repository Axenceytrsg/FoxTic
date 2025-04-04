<template>
    <!-- Utilisation de la structure standard pour les modaux avec notre mixin -->
    <div ref="modal" class="modal fade custom-modal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered building-modal">
            <div class="modal-content" :class="[ currentTheme ]">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $t("Créer un nouveau bâtiment") }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="hideModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="building-name" class="form-label">{{ $t("Nom") }}</label>
                        <input id="building-name" v-model="building.name" type="text" class="form-control" :class="{'is-invalid': nameInvalid}" required>
                        <div v-if="nameInvalid" class="invalid-feedback">{{ $t("Un bâtiment avec ce nom existe déjà.") }}</div>
                    </div>

                    <div class="mb-3">
                        <label for="building-description" class="form-label">{{ $t("Description") }}</label>
                        <textarea id="building-description" v-model="building.description" class="form-control" rows="3"></textarea>
                    </div>

                    <div class="form-check mb-3">
                        <input id="create-group" v-model="createGroup" class="form-check-input" type="checkbox" checked>
                        <label class="form-check-label" for="create-group">{{ $t("Créer automatiquement un groupe pour ce bâtiment") }}</label>
                    </div>

                    <div v-if="createGroup" class="mb-3 group-section">
                        <label for="group-name" class="form-label">{{ $t("Nom du groupe") }}</label>
                        <input id="group-name" v-model="groupName" type="text" class="form-control" :placeholder="building.name ? building.name : $t('Nom du groupe')">
                        <div class="form-text text-muted">{{ $t("Si laissé vide, le nom du bâtiment sera utilisé") }}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" :disabled="processing" @click="hideModal">{{ $t("Annuler") }}</button>
                    <button type="button" class="btn btn-primary create-btn" :disabled="processing" @click="submit">
                        <span v-if="!processing">{{ $t("Créer") }}</span>
                        <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from "vue-toastification";
import modalMixin from "../mixins/modal";

export default {
    mixins: [ modalMixin ],
    emits: [ "building-created" ],
    data() {
        return {
            processing: false,
            nameInvalid: false,
            building: {
                name: "",
                description: "",
                accepted_statuscodes: []
            },
            createGroup: true,
            groupName: "",
            errors: { },
            toast: useToast()
        };
    },
    watch: {
        "building.name"(to) {
            if (to !== null) {
                this.validate();
                if (!this.groupName || this.groupName === this.building.name) {
                    this.groupName = to;
                }
            }
        }
    },
    created() {
        // Ajouter un écouteur pour la touche Escape
        document.addEventListener("keydown", this.handleKeydown);
    },
    unmounted() {
        // Nettoyer l'écouteur lors de la destruction du composant
        document.removeEventListener("keydown", this.handleKeydown);
    },
    methods: {
        // Gérer les touches clavier
        handleKeydown(event) {
            if (event.key === "Escape" && this.modalInstance) {
                this.hideModal();
            }
        },
        // Afficher le modal avec le mixin
        show() {
            this.reset();
            // Appeler showModal du mixin qui s'occupera de nettoyer les backdrops correctement
            this.showModal();
        },
        // Masquer le modal avec le mixin
        hide() {
            // Utiliser la méthode du mixin pour nettoyer correctement le backdrop
            this.hideModal();
            // Réinitialiser le formulaire après la fermeture
            setTimeout(() => {
                this.reset();
            }, 300); // Délai pour s'assurer que le modal est complètement fermé avant de réinitialiser
        },
        reset() {
            this.building = {
                name: "",
                description: "",
                accepted_statuscodes: []
            };
            this.createGroup = true;
            this.groupName = "";
            this.nameInvalid = false;
        },
        validate() {
            this.nameInvalid = false;
            const existingNames = Object.values(this.$root.monitorList || {}).map(monitor => monitor.name.toLowerCase());
            if (existingNames.includes(this.building.name.toLowerCase())) {
                this.nameInvalid = true;
                return false;
            }
            return true;
        },
        async submit() {
            if (!this.validate()) {
                return;
            }
            this.processing = true;
            try {
                const buildingData = {
                    name: this.building.name,
                    description: this.building.description,
                    interval: 60,
                    retryInterval: 60,
                    accepted_statuscodes: this.building.accepted_statuscodes,
                    kafkaProducerBrokers: [],
                    kafkaProducerSaslOptions: {},
                    conditions: [],
                    rabbitmqNodes: []
                };
                this.$root.getSocket().emit("add", buildingData, async (res) => {
                    if (res.ok) {
                        const buildingId = res.monitorID;
                        if (this.createGroup) {
                            const groupName = this.groupName || this.building.name;
                            this.$root.getSocket().emit("addMonitorGroup", {
                                name: groupName,
                                monitors: [
                                    buildingId
                                ]
                            }, (groupRes) => {
                                if (groupRes.ok) {
                                    this.toast.success(`${this.$t("Bâtiment créé")} avec le groupe ${groupName}`);
                                } else {
                                    this.toast.warning(`${this.$t("Bâtiment créé mais erreur lors de la création du groupe")}: ${groupRes.msg}`);
                                }
                                this.processing = false;
                                this.hide();
                                this.$emit("building-created", buildingId);
                            });
                        } else {
                            this.toast.success(this.$t("Bâtiment créé avec succès"));
                            this.processing = false;
                            this.hide();
                            this.$emit("building-created", buildingId);
                        }
                    } else {
                        this.toast.error(`${this.$t("Erreur lors de la création du bâtiment")}: ${res.msg}`);
                        this.processing = false;
                    }
                });
            } catch (error) {
                this.toast.error(`${this.$t("Erreur lors de la création du bâtiment")}: ${error.message}`);
                this.processing = false;
            }
        }
    }
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

/* Style pour s'assurer que les éléments du modal sont interactifs */
.modal-content {
  position: relative;
  pointer-events: auto !important;
  input, textarea, select, button, .form-check-input {
    position: relative;
    z-index: 1103 !important;
    pointer-events: auto !important;
  }
}

.building-modal {
  max-width: 600px;
}

.group-section {
  padding: 15px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.03);
  margin-top: 15px;
}

textarea.form-control {
  min-height: 80px;
  line-height: 1.5;
}

/* Thèmes spécifiques */
.dark {
  .modal-dialog .form-text, .modal-dialog p {
    color: $dark-font-color;
  }
  .group-section {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
