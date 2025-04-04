<template>
    <div class="advanced-settings-container" :class="[ $root.theme ]">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <h1>{{ $t("Paramètres avancés") }}</h1>
                    <hr />
                    <!-- Section pour les bâtiments -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>{{ $t("Gestion des bâtiments") }}</h3>
                        </div>
                        <div class="card-body">
                            <h4>{{ $t("Importer une liste de bâtiments") }}</h4>
                            <p class="text-muted">{{ $t("Importez une liste de bâtiments au format JSON") }}</p>
                            <div class="form-group mb-3">
                                <label for="buildingsFile">{{ $t("Fichier JSON des bâtiments") }}</label>
                                <input
                                    id="buildingsFile"
                                    type="file"
                                    class="form-control"
                                    accept=".json"
                                    @change="onBuildingsFileChange"
                                >
                            </div>
                            <button
                                class="btn btn-primary import-btn"
                                :disabled="!buildingsFile"
                                @click="importBuildings"
                            >
                                {{ $t("Importer les bâtiments") }}
                            </button>

                            <hr />
                            <h4 class="mt-4">{{ $t("Modèle de fichier pour les bâtiments") }}</h4>
                            <p>{{ $t("Utilisez ce modèle pour créer votre fichier d'importation") }}</p>
                            <pre class="bg-light p-3 template-code">{{ buildingsTemplate }}</pre>

                            <button class="btn btn-outline-secondary" @click="downloadBuildingsTemplate">
                                {{ $t("Télécharger le modèle") }}
                            </button>

                            <hr />

                            <h4 class="mt-4 text-danger">{{ $t("Supprimer tous les bâtiments") }}</h4>
                            <p class="text-muted">{{ $t("Cette action supprimera définitivement tous les bâtiments. Cette action est irréversible.") }}</p>

                            <button class="btn btn-danger" @click="confirmDeleteAll">
                                {{ $t("Supprimer tous les bâtiments") }}
                            </button>
                        </div>
                    </div>

                    <!-- Section pour les sondes -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>{{ $t("Gestion des sondes") }}</h3>
                        </div>
                        <div class="card-body">
                            <h4>{{ $t("Importer une liste de sondes") }}</h4>
                            <p class="text-muted">{{ $t("Importez une liste de sondes au format JSON") }}</p>

                            <div class="form-group mb-3">
                                <label for="probesFile">{{ $t("Fichier JSON des sondes") }}</label>
                                <input
                                    id="probesFile"
                                    type="file"
                                    class="form-control"
                                    accept=".json"
                                    @change="onProbesFileChange"
                                >
                            </div>

                            <button
                                class="btn btn-primary import-btn"
                                :disabled="!probesFile"
                                @click="importProbes"
                            >
                                {{ $t("Importer les sondes") }}
                            </button>

                            <hr />

                            <h4 class="mt-4">{{ $t("Modèle de fichier pour les sondes") }}</h4>
                            <p>{{ $t("Utilisez ce modèle pour créer votre fichier d'importation") }}</p>
                            <pre class="bg-light p-3 template-code">{{ probesTemplate }}</pre>

                            <button class="btn btn-outline-secondary" @click="downloadProbesTemplate">
                                {{ $t("Télécharger le modèle") }}
                            </button>
                        </div>
                    </div>

                    <!-- Bouton retour -->
                    <button class="btn btn-secondary back-btn" @click="goBack">
                        <i class="fas fa-arrow-left"></i> {{ $t("Retour") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // Variables pour les fichiers d'importation
            buildingsFile: null,     // Stocke le fichier de bâtiments sélectionné
            probesFile: null,        // Stocke le fichier de sondes sélectionné

            // Templates (modèles) pour l'exportation
            buildingsTemplate: JSON.stringify([
                {
                    "name": "Exemple de bâtiment 1",
                    "description": "Description du bâtiment 1",
                    "interval": 60,
                    "retryInterval": 60
                },
                {
                    "name": "Exemple de bâtiment 2",
                    "description": "Description du bâtiment 2",
                    "interval": 120,
                    "retryInterval": 60
                }
            ], null, 2),

            probesTemplate: JSON.stringify([
                {
                    "name": "Sonde Switch Principal",
                    "type": "ping",
                    "hostname": "192.168.1.1",
                    "port": 0,
                    "timeout": 2000,
                    "interval": 60,
                    "retries": 3,
                    "description": "Switch principal du réseau",
                    "establishment": "Siège Social"
                },
                {
                    "name": "Sonde Switch Étage 1",
                    "type": "ping",
                    "hostname": "192.168.1.2",
                    "port": 0,
                    "timeout": 2000,
                    "interval": 60,
                    "retries": 3,
                    "description": "Switch de l'étage 1",
                    "establishment": "Siège Social"
                },
                {
                    "name": "Sonde SNMP Switch",
                    "type": "tcp",
                    "hostname": "192.168.1.3",
                    "port": 161,
                    "timeout": 5000,
                    "interval": 120,
                    "retries": 2,
                    "description": "Vérification SNMP du switch de distribution",
                    "establishment": "Site Secondaire"
                }
            ], null, 2)
        };
    },
    methods: {
        /**
         * Gérer le changement de fichier pour les bâtiments
         * @param {Event} event - Événement de changement de fichier
         * @returns {void}
         */
        onBuildingsFileChange(event) {
            this.buildingsFile = event.target.files[ 0 ];
            console.log("Fichier de bâtiments sélectionné:", this.buildingsFile.name);
        },

        /**
         * Gérer le changement de fichier pour les sondes
         * @param {Event} event - Événement de changement de fichier
         * @returns {void}
         */
        onProbesFileChange(event) {
            this.probesFile = event.target.files[ 0 ];
            console.log("Fichier de sondes sélectionné:", this.probesFile.name);
        },

        /**
         * Importer la liste des bâtiments
         * @returns {void}
         */
        importBuildings() {
            if (!this.buildingsFile) {
                this.$root.vtoast.show({
                    message: this.$t("Veuillez sélectionner un fichier"),
                    type: "error",
                    position: "top-center"
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const buildings = JSON.parse(e.target.result);

                    if (!Array.isArray(buildings)) {
                        throw new Error("Le format du fichier est invalide. Attendu: tableau de bâtiments.");
                    }

                    // Vérifier chaque bâtiment
                    for (const building of buildings) {
                        if (!building.name || !building.description || !building.interval || !building.retryInterval) {
                            throw new Error("Certains bâtiments manquent des champs requis (nom, description, interval, retryInterval).");
                        }
                    }

                    // Ajouter les bâtiments via l'API
                    this.addBuildingsSequentially(buildings, 0);

                } catch (error) {
                    this.$root.vtoast.show({
                        message: `${this.$t("Erreur lors de l'importation")}: ${error.message}`,
                        type: "error",
                        position: "top-center"
                    });
                }
            };

            reader.readAsText(this.buildingsFile);
        },

        /**
         * Importer la liste des sondes
         * @returns {void}
         */
        importProbes() {
            if (!this.probesFile) {
                this.$root.vtoast.show({
                    message: this.$t("Veuillez sélectionner un fichier"),
                    type: "error",
                    position: "top-center"
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const probes = JSON.parse(e.target.result);

                    if (!Array.isArray(probes)) {
                        throw new Error("Le format du fichier est invalide. Attendu: tableau de sondes.");
                    }

                    // Vérifier chaque sonde
                    for (const probe of probes) {
                        if (!probe.name || !probe.type || !probe.hostname) {
                            throw new Error("Certaines sondes manquent des champs requis (nom, type, hostname).");
                        }

                        // Vérifier si l'établissement est défini
                        if (!probe.establishment) {
                            throw new Error("Veuillez spécifier l'établissement pour chaque sonde.");
                        }
                    }

                    // Ajouter les sondes via l'API
                    this.addProbesSequentially(probes, 0);

                } catch (error) {
                    this.$root.vtoast.show({
                        message: `${this.$t("Erreur lors de l'importation")}: ${error.message}`,
                        type: "error",
                        position: "top-center"
                    });
                }
            };

            reader.readAsText(this.probesFile);
        },

        /**
         * Télécharger le modèle de bâtiments
         * @returns {void}
         */
        downloadBuildingsTemplate() {
            this.downloadTemplate(this.buildingsTemplate, "buildings_template.json");
        },

        /**
         * Télécharger le modèle de sondes
         * @returns {void}
         */
        downloadProbesTemplate() {
            this.downloadTemplate(this.probesTemplate, "probes_template.json");
        },

        /**
         * Utilitaire pour télécharger un fichier
         * @param {string} content - Contenu du fichier
         * @param {string} filename - Nom du fichier
         * @returns {void}
         */
        downloadTemplate(content, filename) {
            const element = document.createElement("a");
            element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(content));
            element.setAttribute("download", filename);

            element.style.display = "none";
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        },

        /**
         * Confirmer et supprimer tous les bâtiments
         * @returns {void}
         */
        confirmDeleteAll() {
            if (confirm(this.$t("Êtes-vous sûr de vouloir supprimer tous les bâtiments ? Cette action est irréversible."))) {
                // Ici, vous implémenteriez la logique pour supprimer tous les bâtiments
                // Par exemple, appel à une API de suppression en masse

                this.$root.getSocket().emit("deleteAllMonitors", (res) => {
                    if (res.ok) {
                        this.$root.vtoast.show({
                            message: this.$t("Tous les bâtiments ont été supprimés avec succès"),
                            type: "success",
                            position: "top-center"
                        });
                    } else {
                        this.$root.vtoast.show({
                            message: `${this.$t("Erreur lors de la suppression")}: ${res.msg}`,
                            type: "error",
                            position: "top-center"
                        });
                    }
                });
            }
        },

        /**
         * Ajouter les bâtiments de manière séquentielle
         * @param {Array} buildings - Liste des bâtiments à ajouter
         * @param {number} index - Index actuel dans la liste
         * @returns {void}
         */
        addBuildingsSequentially(buildings, index) {
            if (index >= buildings.length) {
                // Tous les bâtiments ont été ajoutés
                this.$root.vtoast.show({
                    message: this.$t("Tous les bâtiments ont été importés avec succès"),
                    type: "success",
                    position: "top-center"
                });
                return;
            }

            const building = buildings[index];

            // Envoi de la requête pour ajouter le bâtiment
            this.$root.getSocket().emit("createMonitor", building, (res) => {
                if (res.ok) {
                    // Continuer avec le bâtiment suivant
                    this.addBuildingsSequentially(buildings, index + 1);
                } else {
                    this.$root.vtoast.show({
                        message: `${this.$t("Erreur lors de l'ajout du bâtiment")} "${building.name}": ${res.msg}`,
                        type: "error",
                        position: "top-center"
                    });
                }
            });
        },

        /**
         * Ajouter les sondes de manière séquentielle
         * @param {Array} probes - Liste des sondes à ajouter
         * @param {number} index - Index actuel dans la liste
         * @returns {void}
         */
        addProbesSequentially(probes, index) {
            if (index >= probes.length) {
                // Toutes les sondes ont été ajoutées
                this.$root.vtoast.show({
                    message: this.$t("Toutes les sondes ont été importées avec succès"),
                    type: "success",
                    position: "top-center"
                });
                return;
            }

            const probe = probes[index];

            // Envoi de la requête pour ajouter la sonde
            this.$root.getSocket().emit("createProbe", probe, (res) => {
                if (res.ok) {
                    // Continuer avec la sonde suivante
                    this.addProbesSequentially(probes, index + 1);
                } else {
                    this.$root.vtoast.show({
                        message: `${this.$t("Erreur lors de l'ajout de la sonde")} "${probe.name}": ${res.msg}`,
                        type: "error",
                        position: "top-center"
                    });
                }
            });
        },

        /**
         * Retourner à la page précédente
         * @returns {void}
         */
        goBack() {
            this.$router.go(-1);
        }
    }
};
</script>

<style lang="scss" scoped>
.advanced-settings-container {
    padding: 30px;
    transition: all 0.3s ease;
    min-height: calc(100vh - 110px);

    /* Styles pour le thème clair (par défaut) */
    h1 {
        margin-bottom: 30px;
        font-weight: 600;
        color: #333;
    }

    hr {
        border-color: #dee2e6;
        margin: 25px 0;
    }

    .card {
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #eaeaea;
        overflow: hidden;
        margin-bottom: 30px;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
            transform: translateY(-3px);
        }

        .card-header {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-bottom: 1px solid #dee2e6;
            padding: 18px 25px;

            h3 {
                margin: 0;
                font-weight: 600;
                font-size: 1.35rem;
                color: #2d3748;
            }
        }

        .card-body {
            padding: 25px;
            background-color: #fff;
        }
    }

    pre.template-code {
        max-height: 300px;
        overflow-y: auto;
        border-radius: 8px;
        background-color: #f7f9fc !important;
        border: 1px solid #e4e9f2;
        padding: 15px;
        font-family: 'Consolas', monospace;
        font-size: 0.9rem;
        color: #3d4852;
    }

    .form-group {
        margin-bottom: 1.5rem;

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #4a5568;
        }
    }

    .form-control {
        border-radius: 8px;
        padding: 10px 15px;
        border: 1px solid #dfe3e9;
        background-color: #f9fafb;
        transition: all 0.25s ease;

        &:focus {
            border-color: #4a6cf7;
            box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
            background-color: white;
        }
    }

    .btn {
        margin-right: 10px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }
    }

    .btn-primary {
        background: linear-gradient(135deg, #4a6cf7, #2945c3);
        border: none;
        box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);

        &:hover:not(:disabled) {
            background: linear-gradient(135deg, #3a5ce6, #1e39b3);
            box-shadow: 0 6px 15px rgba(74, 108, 247, 0.3);
        }
    }

    .btn-danger {
        background: linear-gradient(135deg, #f56565, #c53030);
        border: none;
        box-shadow: 0 4px 10px rgba(245, 101, 101, 0.2);

        &:hover:not(:disabled) {
            background: linear-gradient(135deg, #e53e3e, #9b2c2c);
            box-shadow: 0 6px 15px rgba(245, 101, 101, 0.3);
        }
    }

    .btn-outline-secondary {
        border-color: #dfe3e9;
        color: #5a6474;

        &:hover:not(:disabled) {
            background-color: #f1f3f5;
            border-color: #dfe3e9;
            color: #374151;
        }
    }

    .back-btn {
        margin-top: 20px;
        margin-bottom: 30px;
        padding: 12px 25px;
    }

    /* Styles pour le thème sombre */
    &.dark {
        background-color: #1a202c;
        color: #e2e8f0;

        h1 {
            color: #e2e8f0;
        }

        h4 {
            color: #e2e8f0;
        }

        p {
            color: #cbd5e0;
        }

        p.text-muted {
            color: #a0aec0 !important;
        }

        hr {
            border-color: #2d3748;
        }

        .card {
            background-color: #2d3748;
            border-color: #4a5568;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

            .card-header {
                background: linear-gradient(135deg, #2d3748, #1a202c);
                border-bottom: 1px solid #4a5568;

                h3 {
                    color: #e2e8f0;
                }
            }

            .card-body {
                background-color: #2d3748;
            }
        }

        pre.template-code {
            background-color: #1a202c !important;
            border-color: #4a5568;
            color: #e2e8f0;
        }

        .form-group label {
            color: #e2e8f0;
        }

        .form-control {
            background-color: #1a202c;
            border-color: #4a5568;
            color: #e2e8f0;

            &:focus {
                border-color: #4299e1;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                background-color: #2d3748;
            }
        }

        .btn-outline-secondary {
            border-color: #4a5568;
            color: #cbd5e0;

            &:hover:not(:disabled) {
                background-color: #4a5568;
                border-color: #4a5568;
                color: #e2e8f0;
            }
        }

        .text-danger {
            color: #fc8181 !important;
        }
    }
}

/* Animation lorsque le contenu se charge */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeIn 0.5s ease-out forwards;
}
</style>
