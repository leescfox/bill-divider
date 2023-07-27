<template>
    <v-app>
        <v-main class="main">
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style lang="scss">
.main {
    width: 100%;
    margin: 0 auto;
}
@media screen and (600px <= width < 960px) {
    .main {
        width: 65%;
        max-width: 530px !important;
    }
}
@media screen and (960px <= width < 1280px) {
    .main {
        width: 50%;
        max-width: 600px !important;
    }
}
@media screen and (1280px <= width) {
    .main {
        width: 40%;
        max-width: 720px !important;
    }
}
</style>
