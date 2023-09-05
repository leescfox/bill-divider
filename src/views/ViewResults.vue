<template>
    <v-card>
        <div class="d-flex justify-center">
            <v-card-title>
                <span>Результаты</span>
                <v-icon icon="mdi-cash-sync" size="large" />
            </v-card-title>
        </div>
        <v-divider />
        <template v-if="billStore.hasResults">
            <v-tabs v-model="currentTab" grow>
                <v-tab :value="tabs[0]">Кто - кому</v-tab>
                <v-tab :value="tabs[1]">Кому - кто</v-tab>
            </v-tabs>
            <v-window v-model="currentTab">
                <v-window-item :value="tabs[0]">
                    <div
                        v-for="debtsFromPerson in billStore.debtsFromPersons"
                        :key="debtsFromPerson[0].from.id"
                        class="result-container mt-2"
                    >
                        <div class="debt-header pa-2">
                            {{ debtsFromPerson[0].from.name }} должен(а)
                        </div>
                        <v-divider />
                        <div class="pa-2">
                            <div
                                v-for="debt in debtsFromPerson"
                                :key="debt.to.id"
                                class="d-flex"
                            >
                                <span class="debt-container debt-name">
                                    {{ debt.to.name }}
                                </span>
                                <span class="debt-container">
                                    &nbsp;- {{ debt.amount }} &#8381;
                                </span>
                            </div>
                        </div>
                    </div>
                </v-window-item>
                <v-window-item :value="tabs[1]">
                    <div
                        v-for="debtsToPerson in billStore.debtsToPersons"
                        :key="debtsToPerson[0].to.id"
                        class="result-container mt-2"
                    >
                        <div class="debt-header pa-2">
                            {{ debtsToPerson[0].to.name }} ждёт выплаты от
                        </div>
                        <v-divider />
                        <div class="pa-2">
                            <div
                                v-for="debt in debtsToPerson"
                                :key="debt.from.id"
                                class="d-flex"
                            >
                                <span class="debt-container debt-name">
                                    {{ debt.from.name }}
                                </span>
                                <span class="debt-container">
                                    &nbsp;- {{ debt.amount }} &#8381;
                                </span>
                            </div>
                        </div>
                    </div>
                </v-window-item>
            </v-window>
        </template>
        <div v-else class="empty-list-wrapper d-flex flex-column align-center">
            <v-icon icon="mdi-party-popper" size="100" />
            <span class="empty-list-text">
                Ого! Никто никому ничего не должен!
            </span>
        </div>
        <v-divider class="mt-2" />
        <div class="annotation">
            <div>Результаты округляются до двух знаков после запятой!</div>
            <div>
                Если результат получился меньше копейки - он отбрасывается!
            </div>
        </div>
        <v-btn
            @click="startFromPersons()"
            class="text-none"
            variant="tonal"
            block
        >
            Начать заново
        </v-btn>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useBillStore } from '@/store/billStore'

export default defineComponent({
    setup() {
        const billStore = useBillStore()
        return { billStore }
    },
    data() {
        return {
            tabs: ['from-to', 'to-from'] as string[],
            currentTab: null as null | string,
        }
    },
    methods: {
        startFromPersons(): void {
            this.billStore.resetData()
            this.$router.push({ name: 'persons' })
        },
    },
})
</script>

<style lang="scss" scoped>
.result-container {
    border: 1px solid rgb(158, 158, 158);
    border-radius: 4px;
    background-color: #dbdbdb7a;
    .debt-header {
        text-align: center;
        font-size: 18px;
        font-weight: 500;
    }
    .debt-container {
        flex: 1;
        &.debt-name {
            text-align: right;
        }
    }
}
.empty-list-wrapper {
    width: 70%;
    margin: 0 auto;
    .empty-list-text {
        text-align: center;
    }
}
.annotation {
    width: 90%;
    margin: 0 auto;
    text-align: center;
    font-size: 10px;
    color: rgb(0, 0, 0, 0.7);
}
</style>
