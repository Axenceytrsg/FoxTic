<template>
    <div v-if="show" class="setup-container">
        <div class="setup-card">
            <div class="setup-header">
                <object width="64" height="64" data="/icon.svg"></object>
                <div class="setup-title">FoxTic</div>
            </div>

            <div v-if="info.runningSetup" class="setup-loading">
                <div class="alert alert-success" role="alert">
                    <div class="d-flex align-items-center">
                        <strong>{{ $t("settingUpDatabaseMSG") }}</strong>
                        <div class="ms-3 pt-1">
                            <div class="spinner-border" role="status" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
            </div>

            <template v-if="!info.runningSetup">
                <div class="setup-form">
                    <div class="form-floating language-select">
                        <select id="language" v-model="$root.language" class="form-select">
                            <option v-for="(lang, i) in $i18n.availableLocales" :key="`Lang${i}`" :value="lang">
                                {{ $i18n.messages[lang].languageName }}
                            </option>
                        </select>
                        <label for="language" class="form-label">{{ $t("Language") }}</label>
                    </div>

                    <p class="setup-section-title">
                        {{ $t("setupDatabaseChooseDatabase") }}
                    </p>

                    <div class="db-selection-group" role="group" aria-label="Database selection group">
                        <template v-if="info.isEnabledEmbeddedMariaDB">
                            <input id="btnradio3" v-model="dbConfig.type" type="radio" class="btn-check" autocomplete="off" value="embedded-mariadb">
                            <label class="db-option" for="btnradio3">
                                <i class="fa fa-database"></i>
                                <span>MariaDB Embedded</span>
                            </label>
                        </template>

                        <input id="btnradio2" v-model="dbConfig.type" type="radio" class="btn-check" autocomplete="off" value="mariadb">
                        <label class="db-option" for="btnradio2">
                            <i class="fa fa-server"></i>
                            <span>MariaDB/MySQL</span>
                        </label>

                        <input id="btnradio1" v-model="dbConfig.type" type="radio" class="btn-check" autocomplete="off" value="sqlite">
                        <label class="db-option" for="btnradio1">
                            <i class="fa fa-file-o"></i>
                            <span>SQLite</span>
                        </label>
                    </div>

                    <div class="db-description">
                        <div v-if="dbConfig.type === 'embedded-mariadb'">
                            {{ $t("setupDatabaseEmbeddedMariaDB") }}
                        </div>

                        <div v-if="dbConfig.type === 'mariadb'">
                            {{ $t("setupDatabaseMariaDB") }}
                        </div>

                        <div v-if="dbConfig.type === 'sqlite'">
                            {{ $t("setupDatabaseSQLite") }}
                        </div>
                    </div>

                    <template v-if="dbConfig.type === 'mariadb'">
                        <div class="mariadb-config">
                            <div class="form-floating">
                                <input id="hostname" v-model="dbConfig.hostname" type="text" class="form-control" required>
                                <label for="hostname">{{ $t("Hostname") }}</label>
                            </div>

                            <div class="form-floating">
                                <input id="port" v-model="dbConfig.port" type="text" class="form-control" required>
                                <label for="port">{{ $t("Port") }}</label>
                            </div>

                            <div class="form-floating">
                                <input id="username" v-model="dbConfig.username" type="text" class="form-control" required>
                                <label for="username">{{ $t("Username") }}</label>
                            </div>

                            <div class="form-floating">
                                <input id="password" v-model="dbConfig.password" type="password" class="form-control" required>
                                <label for="password">{{ $t("Password") }}</label>
                            </div>

                            <div class="form-floating">
                                <input id="dbName" v-model="dbConfig.dbName" type="text" class="form-control" required>
                                <label for="dbName">{{ $t("dbName") }}</label>
                            </div>
                        </div>
                    </template>

                    <button class="setup-button" type="submit" :disabled="disabledButton" @click.prevent="submit">
                        {{ $t("Next") }}
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";
import { sleep } from "../util.ts";
const toast = useToast();

export default {
    data() {
        return {
            show: false,
            dbConfig: {
                type: "sqlite",
                port: 3306,
                hostname: "",
                username: "",
                password: "",
                dbName: "kuma",
            },
            info: {
                needSetup: false,
                runningSetup: false,
                isEnabledEmbeddedMariaDB: false,
            },
        };
    },
    computed: {
        disabledButton() {
            return this.dbConfig.type === undefined || this.info.runningSetup;
        },
    },
    async mounted() {
        let res = await axios.get("/setup-database-info");
        this.info = res.data;

        if (this.info && this.info.needSetup === false) {
            location.href = "/setup";
        } else {
            this.show = true;
        }
    },
    methods: {
        async submit() {
            this.info.runningSetup = true;

            try {
                await axios.post("/setup-database", {
                    dbConfig: this.dbConfig,
                });
                await sleep(2000);
                await this.goToMainServerWhenReady();
            } catch (e) {
                toast.error(e.response.data);
            } finally {
                this.info.runningSetup = false;
            }
        },

        async goToMainServerWhenReady() {
            try {
                console.log("Trying...");
                let res = await axios.get("/setup-database-info");
                if (res.data && res.data.needSetup === false) {
                    this.show = false;
                    location.href = "/setup";
                } else {
                    if (res.data) {
                        this.info = res.data;
                    }
                    throw new Error("not ready");
                }
            } catch (e) {
                console.log("Not ready yet");
                await sleep(2000);
                await this.goToMainServerWhenReady();
            }
        },

        test() {
            this.$root.toastError("not implemented");
        }
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
    text-align: center;
    padding: 30px 20px;
    background: rgba(30, 30, 45, 0.7);
}

.setup-title {
    font-size: 28px;
    font-weight: bold;
    margin-top: 15px;
    color: white;
    letter-spacing: 0.5px;
}

.setup-loading {
    padding: 20px 30px;
}

.setup-form {
    padding: 20px 30px 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: center;
}

.language-select {
    width: 100%;
    max-width: 200px;
    margin-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
}

.form-select {
    border-radius: 8px;
}

.setup-section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
}

.db-selection-group {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    justify-content: center;
}

.db-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border-radius: 8px;
    background: rgba(45, 45, 60, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    text-align: center;

    &:hover {
        background: rgba(55, 55, 70, 0.6);
        transform: translateY(-2px);
    }
}

.btn-check:checked + .db-option {
    background: rgba(80, 140, 100, 0.3);
    border-color: #4c8c64;
    box-shadow: 0 0 0 2px rgba(76, 140, 100, 0.25);
}

.db-description {
    background: rgba(30, 30, 45, 0.5);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    text-align: center;
}

.mariadb-config {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    text-align: left;
}

.setup-button {
    background: #6c5ce7;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 500;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 10px;
    align-self: center;

    &:hover {
        background: #7d6df0;
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
}

@media (max-width: 768px) {
    .setup-container {
        padding-left: 20px;
    }

    .mariadb-config {
        grid-template-columns: 1fr;
    }

    .db-selection-group {
        flex-direction: column;
    }
}
</style>
