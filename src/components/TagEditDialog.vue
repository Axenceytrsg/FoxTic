<template>
    <form @submit.prevent="submit">
        <div ref="modal" class="modal fade custom-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content" :class="[currentTheme]">
                    <div class="modal-header">
                        <h5 id="exampleModalLabel" class="modal-title">{{ $t("Edit Tag") }}</h5>
                        <button type="button" class="btn-close" aria-label="Close" @click="hideModal" />
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="tag-name" class="form-label">{{ $t("Name") }}</label>
                            <input id="tag-name" v-model="tag.name" type="text" class="form-control" :class="{'is-invalid': nameInvalid}" required />
                            <div class="invalid-feedback">{{ $t("Tag with this name already exist.") }}</div>
                        </div>

                        <div class="mb-3">
                            <label for="tag-color" class="form-label">{{ $t("color") }}</label>
                            <div class="d-flex">
                                <div class="col-8 pe-1">
                                    <vue-multiselect v-model="selectedColor" :options="colorOptions" :multiple="false" :searchable="true" :placeholder="$t('color')" track-by="color" label="name" select-label="" deselect-label="">
                                        <template #option="{ option }">
                                            <div class="mx-2 py-1 px-3 rounded d-inline-flex" style="height: 24px; color: white;" :style="{ backgroundColor: option.color + ' !important' }">
                                                <span>{{ option.name }}</span>
                                            </div>
                                        </template>
                                        <template #singleLabel="{ option }">
                                            <div class="py-1 px-3 rounded d-inline-flex" style="height: 24px; color: white;" :style="{ backgroundColor: option.color + ' !important' }">
                                                <span>{{ option.name }}</span>
                                            </div>
                                        </template>
                                    </vue-multiselect>
                                </div>
                                <div class="col-4 ps-1">
                                    <input id="tag-color-hex" v-model="tag.color" type="text" class="form-control" />
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="tag-monitors" class="form-label">{{ $tc("Monitor", selectedMonitors.length) }}</label>
                            <div class="tag-monitors-list">
                                <router-link v-for="monitor in selectedMonitors" :key="monitor.id" class="d-flex align-items-center justify-content-between text-decoration-none tag-monitors-list-row py-2 px-3" :to="monitorURL(monitor.id)" @click="hideModal()">
                                    <span>{{ monitor.name }}</span>
                                    <button type="button" class="btn-rm-monitor btn btn-outline-danger ms-2 py-1" @click.stop.prevent="removeMonitor(monitor.id)">
                                        <font-awesome-icon class="" icon="times" />
                                    </button>
                                </router-link>
                            </div>
                            <div v-if="allMonitorList.length > 0" class="pt-3">
                                <label class="form-label">{{ $t("Add a monitor") }}:</label>
                                <VueMultiselect v-model="selectedAddMonitor" :options="allMonitorList" :multiple="false" :searchable="true" :placeholder="$t('Add a monitor')" label="name" trackBy="name" class="mt-1">
                                    <template #option="{ option }">
                                        <div class="d-inline-flex">
                                            <span>{{ option.name }}
                                                <template v-if="option.tags && option.tags.length > 0">
                                                    <Tag v-for="monitorTag in option.tags" :key="monitorTag" :item="monitorTag" :size="'sm'" />
                                                </template>
                                            </span>
                                        </div>
                                    </template>
                                </VueMultiselect>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button v-if="tag && tag.id !== null" type="button" class="btn btn-danger" :disabled="processing" @click="deleteConfirm">{{ $t("Delete") }}</button>
                        <button type="submit" class="btn btn-primary" :disabled="processing">
                            <div v-if="processing" class="spinner-border spinner-border-sm me-1"></div>
                            {{ $t("Save") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <Confirm ref="confirmDelete" btn-style="btn-danger" :yes-text="$t('Yes')" :no-text="$t('No')" @yes="deleteTag">{{ $t("confirmDeleteTagMsg") }}</Confirm>
</template>

<script>
import Confirm from "./Confirm.vue";
import Tag from "./Tag.vue";
import VueMultiselect from "vue-multiselect";
import { colorOptions } from "../util-frontend";
import { getMonitorRelativeURL } from "../util.ts";
import modalMixin from "../mixins/modal";

export default {
    components: {
        VueMultiselect,
        Confirm,
        Tag,
    },
    mixins: [modalMixin],
    props: {
        updated: {
            type: Function,
            default: () => {},
        },
        existingTags: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            processing: false,
            selectedColor: {
                name: null,
                color: null,
            },
            tag: {
                id: null,
                name: "",
                color: "",
                value: "",
            },
            monitors: [],
            removingMonitor: [],
            addingMonitor: [],
            selectedAddMonitor: null,
            nameInvalid: false,
        };
    },

    computed: {
        colorOptions() {
            if (!colorOptions(this).find(option => option.color === this.tag.color)) {
                return colorOptions(this).concat({
                    name: "custom",
                    color: this.tag.color,
                });
            } else {
                return colorOptions(this);
            }
        },
        selectedMonitors() {
            return this.monitors
                .concat(Object.values(this.$root.monitorList).filter(monitor => this.addingMonitor.includes(monitor.id)))
                .filter(monitor => !this.removingMonitor.includes(monitor.id));
        },
        allMonitorList() {
            return Object.values(this.$root.monitorList).filter(monitor => !this.selectedMonitors.includes(monitor));
        },
    },

    watch: {
        "tag.color"(to, from) {
            if (to !== "" && colorOptions(this).find(x => x.color === to) == null) {
                this.selectedColor.name = this.$t("Custom");
                this.selectedColor.color = to;
            }
        },
        "tag.name"(to, from) {
            if (to != null) {
                this.validate();
            }
        },
        selectedColor(to, from) {
            if (to) {
                this.tag.color = to.color;
            }
        },
        selectedAddMonitor(monitor) {
            if (monitor) {
                if (!this.monitors.find(m => m.id === monitor.id)) {
                    if (!this.addingMonitor.includes(monitor.id)) {
                        this.addingMonitor.push(monitor.id);
                    }
                    if (this.removingMonitor.includes(monitor.id)) {
                        this.removingMonitor = this.removingMonitor.filter(id => id !== monitor.id);
                    }
                }
                this.selectedAddMonitor = null;
            }
        },
    },

    methods: {
        deleteConfirm() {
            const tagRef = this.$refs.confirmDelete;
            if (tagRef) {
                tagRef.show();
            }
        },

        reset() {
            this.tag = {
                id: null,
                name: "",
                color: "",
                value: "",
            };

            this.selectedColor = {
                name: this.$t("Primary"),
                color: "#0d6efd",
            };

            this.monitors = [];
            this.removingMonitor = [];
            this.addingMonitor = [];
            this.nameInvalid = false;
        },

        validate() {
            this.nameInvalid = false;

            const tagName = this.tag.name.toLowerCase();
            if (tagName === "") {
                return false;
            }

            const tagExists = this.existingTags.find(tag => tag.id !== this.tag.id && tag.name.toLowerCase() === tagName);
            this.nameInvalid = !!tagExists;
            return !tagExists;
        },

        show(tag) {
            this.reset();

            if (tag) {
                this.tag = JSON.parse(JSON.stringify(tag));
                this.monitors = this.monitorsByTag(tag.id);

                const foundColor = colorOptions(this).find(x => x.color === tag.color);
                if (foundColor) {
                    this.selectedColor = foundColor;
                } else if (tag.color) {
                    this.selectedColor = {
                        name: this.$t("Custom"),
                        color: tag.color,
                    };
                }
            }

            this.showModal();
        },

        async submit() {
            if (!this.validate()) {
                return;
            }

            this.processing = true;

            try {
                let tagId = this.tag.id;

                if (!tagId) {
                    const newTag = {
                        name: this.tag.name,
                        color: this.tag.color,
                    };

                    await this.addTagAsync(newTag);
                    const tagList = await this.$root.getTagList();
                    tagId = tagList.find(t => t.name === this.tag.name).id;
                } else {
                    const updatedTag = {
                        id: tagId,
                        name: this.tag.name,
                        color: this.tag.color,
                    };

                    await this.$root.editTag(updatedTag);
                }

                for (const monitorId of this.addingMonitor) {
                    await this.addMonitorTagAsync(tagId, monitorId, "");
                }

                for (const monitorId of this.removingMonitor) {
                    await this.deleteMonitorTagAsync(tagId, monitorId, "");
                }

                await this.$root.getMonitorList();
                const tagList = await this.$root.getTagList();

                this.updated(tagList);

                this.hideModal();
                this.processing = false;
            } catch (error) {
                console.error("Error updating tag:", error);
                this.processing = false;
            }
        },

        async deleteTag() {
            this.processing = true;

            try {
                await this.deleteTagAsync(this.tag.id);
                await this.$root.getMonitorList();
                const tagList = await this.$root.getTagList();
                this.updated(tagList);
                this.hideModal();
                this.processing = false;
            } catch (error) {
                console.error("Error deleting tag:", error);
                this.processing = false;
            }
        },

        removeMonitor(id) {
            const monitor = this.monitors.find(m => m.id === id);
            if (monitor) {
                this.removingMonitor.push(id);
            } else {
                this.addingMonitor = this.addingMonitor.filter(monitId => monitId !== id);
            }
        },

        monitorsByTag(tagId) {
            return Object.values(this.$root.monitorList).filter(monitor => {
                return Array.isArray(monitor.tags) && monitor.tags.some(t => {
                    return (typeof t === "object" && t.id === tagId) ||
                        (typeof t === "string" && parseInt(t) === tagId);
                });
            });
        },

        monitorURL(id) {
            return getMonitorRelativeURL(this.$root.monitorList[id]);
        },

        addTagAsync(newTag) {
            return new Promise((resolve, reject) => {
                this.$root.getSocket().emit("addTag", newTag, (res) => {
                    if (res.ok) {
                        resolve();
                    } else {
                        reject(new Error(res.msg));
                    }
                });
            });
        },

        deleteTagAsync(tagId) {
            return new Promise((resolve, reject) => {
                this.$root.getSocket().emit("deleteTag", tagId, (res) => {
                    if (res.ok) {
                        resolve();
                    } else {
                        reject(new Error(res.msg));
                    }
                });
            });
        },

        addMonitorTagAsync(tagId, monitorId, value) {
            return new Promise((resolve, reject) => {
                this.$root.getSocket().emit("addMonitorTag", {
                    monitorID: monitorId,
                    tagID: tagId,
                    value,
                }, (res) => {
                    if (res.ok) {
                        resolve();
                    } else {
                        reject(new Error(res.msg));
                    }
                });
            });
        },

        deleteMonitorTagAsync(tagId, monitorId, value) {
            return new Promise((resolve, reject) => {
                this.$root.getSocket().emit("deleteMonitorTag", {
                    monitorID: monitorId,
                    tagID: tagId,
                    value,
                }, (res) => {
                    if (res.ok) {
                        resolve();
                    } else {
                        reject(new Error(res.msg));
                    }
                });
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

.tag-monitors-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
}

.tag-monitors-list-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    color: inherit;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
}

.btn-rm-monitor {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem !important;
}

.dark {
    .tag-monitors-list-row {
        border-color: rgba(255, 255, 255, 0.125);

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
    }

    .tag-monitors-list {
        border-color: rgba(255, 255, 255, 0.125);
    }
}
</style>
