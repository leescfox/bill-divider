<template>
    <v-card>
        <PageTitle>
            <template #default>
                <span>Делим счёт!</span>
                <v-icon icon="mdi-currency-usd" size="large" />
            </template>
        </PageTitle>
        <v-divider />
        <PageDescription>
            <template #icon>
                <v-icon icon="mdi-set-split" size="100" />
            </template>
            <template #default>
                Данное приложение поможет вам быстро и удобно разделить счёт
                после приятно проведённого времени!
            </template>
        </PageDescription>
        <v-btn
            @click="redirectToPersons()"
            class="text-none mt-2"
            variant="tonal"
            block
        >
            Начать!
        </v-btn>
    </v-card>
</template>

<script setup lang="ts">
import router from '@/router'
import PageTitle from '@/components/PageTitle.vue'
import PageDescription from '@/components/PageDescription.vue'

function redirectToPersons() {
    router.push({ name: 'persons' })
}
</script>

<style lang="scss" scoped></style>
