<template>
    <div class="shadow-box mb-3" :style="boxStyle">
        <div class="list-header">
            <div class="header-top">
                <button class="btn btn-outline-normal ms-2" :class="{ 'active': selectMode }" type="button" @click="selectMode = !selectMode">
                    {{ $t("Select") }}
                </button>

                <div class="placeholder"></div>
                <div class="search-wrapper">
                    <a v-if="searchText == ''" class="search-icon">
                        <font-awesome-icon icon="search" />
                    </a>
                    <a v-if="searchText != ''" class="search-icon" @click="clearSearchText">
                        <font-awesome-icon icon="times" />
                    </a>
                    <form>
                        <input
                            v-model="searchText"
                            class="form-control search-input"
                            :placeholder="$t('Search...')"
                            :aria-label="$t('Search monitored sites')"
                            autocomplete="off"
                        />
                    </form>
                </div>
            </div>
            <div class="header-filter">
                <MonitorListFilter :filterState="filterState" @update-filter="updateFilter" />
            </div>

            <!-- Slideshow Controls -->
            <div class="slideshow-controls px-2 pt-2">
                <button
                    :title="slideshowActive ? $t('Pause Slideshow') : $t('Start Slideshow')"
                    class="btn-outline-normal"
                    @click="toggleSlideshow"
                >
                    <font-awesome-icon :icon="slideshowActive ? 'pause' : 'play'" size="sm" />
                    {{ slideshowActive ? $t("Pause") : $t("Play") }}
                </button>

                <div class="progress-container">
                    <div class="progress">
                        <div
                            class="progress-bar"
                            role="progressbar"
                            :style="{ width: `${slideshowProgress}%` }"
                            :aria-valuenow="slideshowProgress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                        ></div>
                    </div>
                </div>

                <div class="current-building">
                    {{ currentDisplayIndex + 1 }}/{{ displayableMonitors.length }}
                </div>
                <button
                    title="Configurer les bâtiments"
                    class="btn-outline-normal ms-2"
                    @click="configureBuildingsDialog"
                >
                    <font-awesome-icon icon="cog" size="sm" />
                </button>
                <!-- Nouveaux boutons pour éditer et ajouter des bâtiments -->
                <button
                    v-if="displayableMonitors.length > 0"
                    title="Éditer le bâtiment actuel"
                    class="btn-outline-normal ms-2"
                    @click="editCurrentBuilding"
                >
                    <font-awesome-icon icon="edit" size="sm" />
                </button>
                <button
                    title="Ajouter un nouveau bâtiment"
                    class="btn-outline-normal ms-2"
                    @click="addNewBuilding"
                >
                    <font-awesome-icon icon="plus" size="sm" />
                </button>
                <button
                    title="Ouvrir les paramètres avancés"
                    class="btn-outline-normal ms-2"
                    @click="goToAdvancedSettings"
                >
                    <font-awesome-icon icon="cogs" size="sm" />
                </button>
                <button
                    v-if="displayableMonitors.length > 0"
                    title="Supprimer tous les bâtiments"
                    class="btn-outline-danger ms-2"
                    @click="confirmDeleteAllMonitors"
                >
                    <font-awesome-icon icon="trash" size="sm" />
                </button>
            </div>

            <!-- Selection Controls -->
            <div v-if="selectMode" class="selection-controls px-2 pt-2">
                <input
                    v-model="selectAll"
                    class="form-check-input select-input"
                    type="checkbox"
                />

                <button class="btn-outline-normal" @click="pauseDialog"><font-awesome-icon icon="pause" size="sm" /> {{ $t("Pause") }}</button>
                <button class="btn-outline-normal" @click="resumeSelected"><font-awesome-icon icon="play" size="sm" /> {{ $t("Resume") }}</button>

                <span v-if="selectedMonitorCount > 0">
                    {{ $t("selectedMonitorCount", [ selectedMonitorCount ]) }}
                </span>
            </div>
        </div>
        <div ref="monitorList" class="monitor-list" :class="{ scrollbar: scrollbar }" :style="monitorListStyle" data-testid="monitor-list">
            <div v-if="Object.keys($root.monitorList).length === 0" class="text-center mt-3">
                {{ $t("No Monitors, please") }} <router-link to="/add">{{ $t("add one") }}</router-link>
            </div>

            <div v-else-if="slideshowActive && displayableMonitors.length > 0">
                <MonitorListItem
                    :monitor="displayableMonitors[currentDisplayIndex]"
                    :isSelectMode="selectMode"
                    :isSelected="isSelected"
                    :select="select"
                    :deselect="deselect"
                    :filter-func="filterFunc"
                    :sort-func="sortFunc"
                />
            </div>
            <template v-else>
                <MonitorListItem
                    v-for="(item, index) in sortedMonitorList"
                    :key="index"
                    :monitor="item"
                    :isSelectMode="selectMode"
                    :isSelected="isSelected"
                    :select="select"
                    :deselect="deselect"
                    :filter-func="filterFunc"
                    :sort-func="sortFunc"
                />
            </template>
        </div>
    </div>

    <Confirm ref="confirmPause" :yes-text="$t('Yes')" :no-text="$t('No')" @yes="pauseSelected">
        {{ $t("pauseMonitorMsg") }}
    </Confirm>
    <!-- Référence au composant de dialogue de création de bâtiment -->
    <BuildingCreateDialog ref="buildingCreateDialog" @building-created="onBuildingCreated" />
</template>

<script>
import Confirm from "../components/Confirm.vue";
import MonitorListItem from "../components/MonitorListItem.vue";
import MonitorListFilter from "./MonitorListFilter.vue";
import BuildingCreateDialog from "./BuildingCreateDialog.vue";
import { getMonitorRelativeURL } from "../util.ts";

export default {
    components: {
        Confirm,
        MonitorListItem,
        MonitorListFilter,
        BuildingCreateDialog,
    },
    props: {
        /** Should the scrollbar be shown */
        scrollbar: {
            type: Boolean,
        },
    },
    data() {
        return {
            searchText: "",
            selectMode: false,
            selectAll: false,
            disableSelectAllWatcher: false,
            selectedMonitors: {},
            windowTop: 0,
            filterState: {
                status: null,
                active: null,
                tags: null,
            },
            // Variables pour le défilement automatique
            slideshowActive: false,      // Indique si le défilement auto est actif
            slideshowInterval: null,     // Stocke l'identifiant de l'intervalle
            currentDisplayIndex: 0,      // Index du bâtiment actuellement affiché
            slideshowProgress: 0,        // Progression de la barre (0-100%)
            progressInterval: null,      // Intervalle pour la mise à jour de la barre de progression
            // Configuration des bâtiments à afficher dans le diaporama
            configuredBuildingIds: [],  // IDs des bâtiments à afficher
            // Variables pour les dialogues d'édition et d'ajout
            showEditDialog: false,       // Contrôle l'affichage du dialogue d'édition
            showAddDialog: false,        // Contrôle l'affichage du dialogue d'ajout
            currentBuildingEdit: null,   // Stocke les données du bâtiment en cours d'édition
            newBuilding: {               // Modèle pour un nouveau bâtiment
                name: "",
                description: ""
            },
            monitorsAvailable: 0,        // Nombre de moniteurs disponibles
        };
    },
    computed: {
        /**
         * Improve the sticky appearance of the list by increasing its
         * height as user scrolls down.
         * Not used on mobile.
         * @returns {object} Style for monitor list
         */
        boxStyle() {
            if (window.innerWidth > 550) {
                return {
                    height: `calc(100vh - 160px + ${this.windowTop}px)`,
                };
            } else {
                return {
                    height: "calc(100vh - 160px)",
                };
            }

        },

        /**
         * Returns a sorted list of monitors based on the applied filters and search text.
         * @returns {Array} The sorted list of monitors.
         */
        sortedMonitorList() {
            let result = [];

            // Vérifier si monitorList existe
            if (!this.$root.monitorList) {
                console.error("monitorList n'est pas défini dans $root");
                return [];
            }

            // Créer une fonction de filtre sécurisée
            const safeFilterFunc = typeof this.filterFunc === "function"
                ? this.filterFunc
                : () => true; // Filtre par défaut qui accepte tout

            // Créer une fonction de tri sécurisée
            const safeSortFunc = typeof this.sortFunc === "function"
                ? this.sortFunc
                : (a, b) => a.name.localeCompare(b.name); // Tri par défaut par nom

            if (this.searchText) {
                const searchTextLower = this.searchText.toLowerCase();
                Object.values(this.$root.monitorList).forEach((monitor) => {
                    if (monitor.name.toLowerCase().includes(searchTextLower) && safeFilterFunc(monitor)) {
                        result.push(monitor);
                    }
                });
            } else {
                // Utiliser filter avec une fonction sécurisée
                result = Object.values(this.$root.monitorList).filter(safeFilterFunc);
            }

            // Trier avec une fonction sécurisée
            result.sort(safeSortFunc);

            return result;
        },

        /**
         * Liste des moniteurs qui peuvent être affichés dans le diaporama
         * @returns {Array} Liste des moniteurs filtrés pour le diaporama
         */
        displayableMonitors() {
            console.log("Évaluation des moniteurs affichables");

            // Vérifier si sortedMonitorList existe et n'est pas vide
            if (!this.sortedMonitorList || this.sortedMonitorList.length === 0) {
                console.log("Aucun moniteur disponible dans sortedMonitorList");
                return [];
            }

            // Afficher toujours tous les moniteurs pour résoudre le problème d'écran vide
            console.log("Nombre total de moniteurs:", this.sortedMonitorList.length);
            return this.sortedMonitorList;
        },

        isDarkTheme() {
            return document.body.classList.contains("dark");
        },

        monitorListStyle() {
            let listHeaderHeight = 107;

            if (this.selectMode) {
                listHeaderHeight += 42;
            }

            if (this.slideshowActive) {
                listHeaderHeight += 42;
            }

            return {
                "height": `calc(100% - ${listHeaderHeight}px)`
            };
        },

        selectedMonitorCount() {
            return Object.keys(this.selectedMonitors).length;
        },

        /**
         * Determines if any filters are active.
         * @returns {boolean} True if any filter is active, false otherwise.
         */
        filtersActive() {
            return this.filterState.status != null || this.filterState.active != null || this.filterState.tags != null || this.searchText !== "";
        }
    },
    watch: {
        searchText() {
            this.cancelSelectMode();
        },
        selectAll() {
            if (this.disableSelectAllWatcher) {
                return;
            }

            // do not trigger watch when select mode is disabled
            if (!this.selectMode) {
                return;
            }

            if (this.selectAll) {
                Object.values(this.$root.monitorList).filter(this.filterFunc).forEach((monitor) => {
                    this.selectedMonitors[monitor.id] = true;
                });
            } else {
                this.selectedMonitors = {};
            }
        },
        selectMode() {
            if (!this.selectMode) {
                this.selectAll = false;
                this.selectedMonitors = {};
            }
        },
        /**
         * Surveillance de displayableMonitors pour réinitialiser l'index si nécessaire
         * @returns {boolean} Retourne toujours vrai pour compatibilité
         */
        displayableMonitors() {
            console.log("Moniteurs affichables:", this.displayableMonitors.length);
            if (this.currentDisplayIndex >= this.displayableMonitors.length) {
                this.currentDisplayIndex = 0;
            }
            return true;
        },
    },
    mounted() {
        window.addEventListener("scroll", this.onScroll);

        // Débogage: afficher les moniteurs disponibles dans la console
        const moniteurs = Object.values(this.$root.monitorList || {});
        console.log("Nombre de moniteurs disponibles:", moniteurs.length);
        console.log("Moniteurs disponibles:", moniteurs.map(m => ({
            id: m.id,
            name: m.name
        })));

        // Si aucun moniteur n'est disponible, ajouter un message et essayer de les charger
        if (moniteurs.length === 0) {
            console.log("ATTENTION: Aucun moniteur n'est disponible dans $root.monitorList");
            console.log("$root:", this.$root);

            // Essayer de charger les moniteurs
            this.loadMonitors();
        }

        // Utiliser tous les moniteurs pour le diaporama sans filtrage
        this.configuredBuildingIds = moniteurs.map(m => m.id ? m.id.toString() : "");

        console.log("Bâtiments configurés:", this.configuredBuildingIds);

        // Démarrer automatiquement le diaporama seulement s'il y a des moniteurs disponibles
        setTimeout(() => {
            // Vérifier s'il y a des moniteurs avant de démarrer le diaporama
            if (this.monitorsAvailable > 0) {
                this.toggleSlideshow();
                console.log("Diaporama démarré automatiquement - " + this.monitorsAvailable + " moniteurs disponibles");
            } else {
                console.log("Diaporama non démarré - aucun moniteur disponible");
            }
        }, 1000);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.onScroll);
        this.stopSlideshow(); // Arrêter le diaporama avant de démonter le composant
    },
    methods: {
        /**
         * Handle user scroll
         * @returns {void}
         */
        onScroll() {
            if (window.top.scrollY <= 133) {
                this.windowTop = window.top.scrollY;
            } else {
                this.windowTop = 133;
            }
        },
        /**
         * Get URL of monitor
         * @param {number} id ID of monitor
         * @returns {string} Relative URL of monitor
         */
        monitorURL(id) {
            return getMonitorRelativeURL(id);
        },
        /**
         * Clear the search bar
         * @returns {void}
         */
        clearSearchText() {
            this.searchText = "";
        },
        /**
         * Update the MonitorList Filter
         * @param {object} newFilter Object with new filter
         * @returns {void}
         */
        updateFilter(newFilter) {
            this.filterState = newFilter;
        },
        /**
         * Deselect a monitor
         * @param {number} id ID of monitor
         * @returns {void}
         */
        deselect(id) {
            delete this.selectedMonitors[id];
        },
        /**
         * Select a monitor
         * @param {number} id ID of monitor
         * @returns {void}
         */
        select(id) {
            this.selectedMonitors[id] = true;
        },
        /**
         * Determine if monitor is selected
         * @param {number} id ID of monitor
         * @returns {bool} Is the monitor selected?
         */
        isSelected(id) {
            return id in this.selectedMonitors;
        },
        /**
         * Disable select mode and reset selection
         * @returns {void}
         */
        cancelSelectMode() {
            this.selectMode = false;
            this.selectedMonitors = {};
        },
        /**
         * Show dialog to confirm pause
         * @returns {void}
         */
        pauseDialog() {
            this.$refs.confirmPause.show();
        },
        /**
         * Pause each selected monitor
         * @returns {void}
         */
        pauseSelected() {
            Object.keys(this.selectedMonitors)
                .filter(id => this.$root.monitorList[id].active)
                .forEach(id => this.$root.getSocket().emit("pauseMonitor", id, () => {}));

            this.cancelSelectMode();
        },
        /**
         * Resume each selected monitor
         * @returns {void}
         */
        resumeSelected() {
            Object.keys(this.selectedMonitors)
                .filter(id => !this.$root.monitorList[id].active)
                .forEach(id => this.$root.getSocket().emit("resumeMonitor", id, () => {}));

            this.cancelSelectMode();
        },
        /**
         * Démarrer le défilement automatique des bâtiments
         * @returns {void}
         */
        startSlideshow() {
            this.slideshowActive = true;

            // Démarrer l'intervalle principal (changement de bâtiment toutes les 30 secondes)
            this.slideshowInterval = setInterval(() => {
                if (this.displayableMonitors.length > 0) {
                    this.currentDisplayIndex = (this.currentDisplayIndex + 1) % this.displayableMonitors.length;
                    this.slideshowProgress = 0; // Réinitialiser la progression
                }
            }, 30000); // 30 secondes

            // Démarrer l'intervalle pour la mise à jour de la barre de progression
            const updateFrequency = 300; // Mise à jour tous les 300ms
            const totalUpdates = 30000 / updateFrequency;
            const progressIncrement = 100 / totalUpdates;

            this.progressInterval = setInterval(() => {
                this.slideshowProgress += progressIncrement;
                if (this.slideshowProgress > 100) {
                    this.slideshowProgress = 0;
                }
            }, updateFrequency);
        },

        /**
         * Arrêter le défilement automatique
         * @returns {void}
         */
        stopSlideshow() {
            this.slideshowActive = false;

            // Nettoyer les intervalles
            if (this.slideshowInterval) {
                clearInterval(this.slideshowInterval);
                this.slideshowInterval = null;
            }

            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }

            this.slideshowProgress = 0;
        },

        /**
         * Basculer entre démarrage et arrêt du défilement
         * @returns {void}
         */
        toggleSlideshow() {
            if (this.slideshowActive) {
                this.stopSlideshow();
            } else {
                this.startSlideshow();
            }
        },
        /**
         * Ouvre une boîte de dialogue pour configurer les bâtiments du diaporama
         * @returns {void}
         */
        configureBuildingsDialog() {
            this.$root.vtoast.show({
                type: "info",
                title: "Configuration des bâtiments",
                text: "Bâtiments configurés : " + this.configuredBuildingIds.join(", ")
            });

            // Dans une implémentation réelle, on ouvrirait un dialogue comme celui-ci:
            /*
            this.$dialog
                .prompt({
                    title: "Configuration des bâtiments",
                    body: "Entrez les identifiants des bâtiments séparés par des virgules:",
                    value: this.configuredBuildingIds.join(", "),
                    okText: "Configurer",
                    cancelText: "Annuler"
                })
                .then(value => {
                    if (value) {
                        // Diviser la chaîne et nettoyer les espaces
                        this.configuredBuildingIds = value.split(",").map(id => id.trim());
                        this.currentDisplayIndex = 0; // Réinitialiser l'index
                    }
                });
            */
            this.currentDisplayIndex = 0;
        },
        /**
         * Éditer le bâtiment actuel
         * @returns {void}
         */
        editCurrentBuilding() {
            if (this.displayableMonitors.length > 0 && this.displayableMonitors[this.currentDisplayIndex]) {
                // Copier le bâtiment actuel pour l'édition
                this.currentBuildingEdit = JSON.parse(
                    JSON.stringify(this.displayableMonitors[this.currentDisplayIndex])
                );

                // Dans une vraie application, cela ouvrirait une modale d'édition
                // Pour l'instant, nous affichons une notification
                this.$root.vtoast.show({
                    message: `Édition du bâtiment: ${this.currentBuildingEdit.name}`,
                    type: "info",
                    position: "top-center"
                });

                console.log("Édition du bâtiment:", this.currentBuildingEdit);

                // Ici, on pourrait naviguer vers une page d'édition avec l'ID du moniteur
                // this.$router.push(`/edit/${this.currentBuildingEdit.id}`);
            }
        },

        /**
         * Ajouter un nouveau bâtiment
         * @returns {void}
         */
        addNewBuilding() {
            // Afficher le modal de création de bâtiment
            this.$refs.buildingCreateDialog.show();
        },

        /**
         * Gestion de l'événement de création d'un bâtiment
         * @param {string} buildingId - ID du bâtiment créé
         * @returns {void}
         */
        onBuildingCreated(buildingId) {
            console.log(`Bâtiment créé avec l'ID: ${buildingId}`);
            // Ici on pourrait ajouter des actions supplémentaires après la création du bâtiment
        },
        /**
         * Ouvrir les paramètres avancés
         * @returns {void}
         */
        goToAdvancedSettings() {
            this.$router.push("/advanced-settings");
        },

        /**
         * Demander confirmation avant de supprimer tous les moniteurs
         * @returns {void}
         */
        confirmDeleteAllMonitors() {
            if (confirm(this.$t("Êtes-vous sûr de vouloir supprimer tous les bâtiments ? Cette action est irréversible."))) {
                this.deleteAllMonitors();
            }
        },

        /**
         * Supprimer tous les moniteurs
         * @returns {void}
         */
        deleteAllMonitors() {
            // Envoyer une requête au serveur pour supprimer tous les moniteurs
            this.$root.getSocket().emit("deleteAllMonitors", (res) => {
                if (res.ok) {
                    this.$root.vtoast.show({
                        message: "Tous les bâtiments ont été supprimés",
                        type: "success",
                        position: "top-center"
                    });

                    // Réinitialiser la liste des moniteurs
                    this.$root.monitorList = {};
                } else {
                    this.$root.vtoast.show({
                        message: `Erreur lors de la suppression des bâtiments: ${res.msg}`,
                        type: "error",
                        position: "top-center"
                    });
                }
            });
        },
        /**
         * Charge les moniteurs depuis le serveur
         * @returns {void}
         */
        loadMonitors() {
            console.log("Tentative de chargement des moniteurs...");

            // S'assurer que le socket est disponible
            if (!this.$root.getSocket) {
                console.error("Socket non disponible");
                return;
            }

            // Demander la liste des moniteurs au serveur
            this.$root.getSocket().emit("getMonitorList", (res) => {
                if (res.ok) {
                    console.log("Liste des moniteurs reçue:", res);

                    // Mettre à jour monitorList s'il est défini comme une propriété réactive
                    if (this.$root.monitorList !== undefined) {
                        // Si $root.monitorList est déjà un proxy Vue, on met à jour les valeurs
                        Object.keys(res.monitorList || {}).forEach(key => {
                            this.$root.$set(this.$root.monitorList, key, res.monitorList[key]);
                        });
                    } else {
                        // Sinon, on définit la propriété
                        console.log("Définition de monitorList via $set");
                        this.$root.$set(this.$root, "monitorList", res.monitorList || {});
                    }
                    // Mettre à jour l'interface
                    this.$forceUpdate();

                    // Mettre à jour les IDs pour le diaporama
                    this.configuredBuildingIds = Object.values(res.monitorList || {})
                        .map(m => m.id ? m.id.toString() : "");

                    // Vérifier s'il y a des moniteurs et démarrer le diaporama si nécessaire
                    const monitorCount = Object.keys(res.monitorList || {}).length;
                    console.log("Moniteurs chargés avec succès, nombre:", monitorCount);
                    // Si aucun moniteur n'est disponible, afficher un message plus explicite
                    if (monitorCount === 0) {
                        console.log("Aucun moniteur trouvé. Veuillez ajouter des bâtiments pour commencer.");
                    }
                    // Mettre à jour le nombre de moniteurs disponibles
                    this.monitorsAvailable = monitorCount;
                } else {
                    console.error("Erreur lors du chargement des moniteurs:", res.msg);
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.shadow-box {
    position: fixed;
    height: calc(85vh - 40px) !important; /* Hauteur fixe avec espace en bas */
    bottom: 10px !important; /* Exactement 10px du bas */
    width: 30%; /* Largeur relative */
    overflow: visible;
    display: flex;
    flex-direction: column;
    margin-bottom: 0 !important;
}

.monitor-list {
    overflow-y: auto !important;
    overflow-x: hidden;
    position: absolute;
    top: 150px; /* Ajusté pour tenir compte des nouveaux contrôles */
    bottom: 0 !important; /* S'étend jusqu'au bas de sa boîte parente */
    left: 0;
    right: 0;
    padding: 0 10px;
    height: auto !important;
    max-height: none !important;
}

/* Styles pour les contrôles de diaporama */
.slideshow-controls {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-left: 10px;
}

.progress-container {
    flex-grow: 1;
    margin: 0 10px;
}

.progress {
    height: 6px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar {
    background-color: #4c8c64;
    transition: width 0.3s linear;
}

.dark .progress {
    background-color: rgba(255, 255, 255, 0.1);
}

.current-building {
    min-width: 40px;
    text-align: right;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.6);
}

.dark .current-building {
    color: rgba(255, 255, 255, 0.6);
}

.monitor-list.scrollbar::-webkit-scrollbar {
    width: 8px;
}

.monitor-list.scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.monitor-list.scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.dark .monitor-list.scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.dark .monitor-list.scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
}

.list-header {
    border-bottom: 1px solid #dee2e6;
    border-radius: 10px 10px 0 0;
    margin: -10px;
    margin-bottom: 10px;
    padding: 10px;

    .dark & {
        background-color: $dark-header-bg;
        border-bottom: 0;
    }
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-filter {
    display: flex;
    align-items: center;
}

@media (max-width: 1199px) {
    .shadow-box {
        width: 40%;
    }
}

@media (max-width: 767px) {
    .shadow-box {
        position: relative;
        width: 100%;
        top: 0;
        height: auto !important;
    }
    .monitor-list {
        position: relative;
        top: 0;
        max-height: 60vh;
    }
}

.search-wrapper {
    display: flex;
    align-items: center;
}

.search-icon {
    padding: 10px;
    color: #c0c0c0;

    // Clear filter button (X)
    svg[data-icon="times"] {
        cursor: pointer;
        transition: all ease-in-out 0.1s;

        &:hover {
            opacity: 0.5;
        }
    }
}

.search-input {
    max-width: 15em;
}

.monitor-item {
    width: 100%;
}

.tags {
    margin-top: 4px;
    padding-left: 67px;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
}

.bottom-style {
    padding-left: 67px;
    margin-top: 5px;
}

.selection-controls {
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
