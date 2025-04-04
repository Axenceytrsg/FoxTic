/**
 * Mixin pour gérer les modaux de manière cohérente et éviter les problèmes de backdrop
 */
import { Modal } from "bootstrap";

export default {
    data() {
        return {
            modalInstance: null,
            // Accéder au thème directement pour éviter les erreurs TypeScript
            currentTheme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            themeObserver: null
        };
    },

    mounted() {
        // Si le composant possède une référence 'modal', initialiser Bootstrap Modal
        if (this.$refs.modal) {
            this.modalInstance = new Modal(this.$refs.modal, {
                backdrop: true, // Permet de fermer en cliquant à l'extérieur
                keyboard: true  // Permet de fermer avec la touche Echap
            });
            // Ajouter un écouteur d'événement pour la fermeture du modal
            if (this.$refs.modal) {
                this.$refs.modal.addEventListener("hidden.bs.modal", this.onModalHidden);
            }
        }
        // Observer les changements de thème du document
        this.setupThemeObserver();
    },

    beforeUnmount() {
        // Nettoyer le modal avant de détruire le composant
        this.cleanupModal();
        // Nettoyer l'observateur de thème
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
        // Supprimer l'écouteur d'événement
        if (this.$refs.modal) {
            this.$refs.modal.removeEventListener("hidden.bs.modal", this.onModalHidden);
        }
    },

    methods: {
        /**
         * Configuration de l'observateur pour détecter les changements de thème
         * @returns {void}
         */
        setupThemeObserver() {
            // Observer les changements de classe sur document.documentElement
            this.themeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "class") {
                        this.currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
                    }
                });
            });
            this.themeObserver.observe(document.documentElement, { attributes: true });
        },

        /**
         * Gestionnaire pour l'événement de fermeture du modal
         * @returns {void}
         */
        onModalHidden() {
            // Mettre à jour l'état du modal dans le composant
            if (this.visible !== undefined) {
                this.visible = false;
            }
            // Réactiver le défilement du document principal
            document.body.classList.remove("modal-open");
            // Nettoyer les backdrops
            this.cleanupBackdrops();
        },

        /**
         * Afficher le modal
         * @returns {void}
         */
        showModal() {
            // Nettoyer d'abord tous les backdrops existants
            this.cleanupBackdrops();

            if (this.modalInstance) {
                // Utiliser l'API Bootstrap Modal
                this.modalInstance.show();
            } else if (this.visible !== undefined) {
                // Pour les modaux personnalisés qui utilisent une variable 'visible'
                this.visible = true;
            }

            // Empêcher le défilement du document principal
            document.body.classList.add("modal-open");
        },

        /**
         * Masquer le modal
         * @returns {void}
         */
        hideModal() {
            if (this.modalInstance) {
                // Utiliser l'API Bootstrap Modal
                this.modalInstance.hide();
            } else if (this.visible !== undefined) {
                // Pour les modaux personnalisés qui utilisent une variable 'visible'
                this.visible = false;
            }

            // Réactiver le défilement du document principal
            document.body.classList.remove("modal-open");

            // Nettoyer les backdrops
            this.cleanupBackdrops();
        },

        /**
         * Nettoyer le modal complètement (utilisé lors de la destruction du composant)
         * @returns {void}
         */
        cleanupModal() {
            this.hideModal();
            this.modalInstance = null;
        },

        /**
         * Supprimer tous les backdrops modaux qui pourraient être restés dans le DOM
         * @returns {void}
         */
        cleanupBackdrops() {
            // Récupérer tous les backdrops
            const backdrops = document.getElementsByClassName("modal-backdrop");
            // Convertir en tableau pour éviter les problèmes de collection dynamique
            const backdropArray = Array.from(backdrops);
            
            // Supprimer chaque backdrop directement sans setTimeout
            backdropArray.forEach(backdrop => {
                // Appliquer le style sans utiliser setAttribute qui peut être lourd
                if (backdrop && backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            });
        }
    }
};
