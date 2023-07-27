<template>
    <v-card>
        <div class="d-flex justify-center">
            <v-card-title>
                <span>Делим счёт!</span>
                <v-icon icon="mdi-currency-usd" size="large" />
            </v-card-title>
        </div>
        <v-divider />
        <div class="main-wrapper d-flex flex-column align-center">
            <v-icon icon="mdi-set-split" size="100" />
            <span class="main-text">
                Данное приложение поможет вам быстро и удобно разделить счёт
                после приятно проведённого времени!
            </span>
        </div>
        <v-btn @click="begin" class="text-none mt-2" variant="tonal" block>
            Начать!
        </v-btn>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    methods: {
        begin(): void {
            this.$router.push({ name: 'persons' })
        },
    },
})
</script>

<style lang="scss" scoped>
.main-wrapper {
    width: 70%;
    margin: 0 auto;
    .main-text {
        text-align: center;
    }
}
</style>
