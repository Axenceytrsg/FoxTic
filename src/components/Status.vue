<template>
    <span class="badge rounded-pill" :class=" 'bg-' + color ">{{ text }}</span>
</template>

<script>
export default {
    props: {
        /** Current status of monitor */
        status: {
            type: Number,
            default: 0,
        }
    },

    computed: {
        color() {
            if (this.status === 0) {
                return "danger";
            }

            if (this.status === 1) {
                return "primary";
            }

            if (this.status === 2) {
                return "warning";
            }

            return "secondary";
        },

        text() {
            if (this.status === 0) {
                return this.$t("Down");
            }

            if (this.status === 1) {
                return this.$t("Up");
            }

            if (this.status === 2) {
                return this.$t("Pending");
            }

            return this.$t("Unknown");
        }
    }
};
</script>

<style scoped>
    span {
        min-width: 64px;
    }

    /* Bootstrap étend automatiquement ces classes avec nos couleurs personnalisées */
    .bg-primary {
        background-color: #0A7075 !important;
    }
    .bg-danger {
        background-color: #274D60 !important;
    }
    .bg-warning {
        background-color: #0C969C !important;
    }
    .bg-secondary {
        background-color: #6BA3BE !important;
    }
</style>
