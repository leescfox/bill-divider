<template>
    <v-card>
        <PageTitle>
            <template #default>
                <span>Результаты</span>
                <v-icon icon="mdi-cash-sync" size="large" />
            </template>
        </PageTitle>
        <v-divider />
        <template v-if="billStore.hasDebts">
            <v-tabs v-model="currentTab" grow>
                <v-tab :value="tabs[0]">Кто - кому</v-tab>
                <v-tab :value="tabs[1]">Кому - кто</v-tab>
            </v-tabs>
            <v-window v-model="currentTab">
                <v-window-item :value="tabs[0]">
                    <DebtBlock
                        v-for="debtsFromPerson in billStore.debtsFromPersons"
                        :key="debtsFromPerson[0].from.id"
                        :name="debtsFromPerson[0].from.name"
                        :debts="debtsFromPerson"
                        direction="to"
                        class="debt-block"
                    />
                </v-window-item>
                <v-window-item :value="tabs[1]">
                    <DebtBlock
                        v-for="debtsToPerson in billStore.debtsToPersons"
                        :key="debtsToPerson[0].to.id"
                        :name="debtsToPerson[0].to.name"
                        :debts="debtsToPerson"
                        direction="from"
                        class="debt-block"
                    />
                </v-window-item>
            </v-window>
        </template>
        <PageDescription v-else>
            <template #icon>
                <v-icon icon="mdi-party-popper" size="100" />
            </template>
            <template #default>Ого! Никто никому ничего не должен!</template>
        </PageDescription>
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

<script setup lang="ts">
import { ref, reactive } from 'vue'
import router from '@/router'
import { useBillStore } from '@/store/billStore'
import PageTitle from '@/components/PageTitle.vue'
import PageDescription from '@/components/PageDescription.vue'
import DebtBlock from '@/components/DebtBlock.vue'

const billStore = useBillStore()

const tabs = reactive(['from-to', 'to-from'])
const currentTab = ref<string | null>(null)

function startFromPersons() {
    billStore.resetData()
    router.push({ name: 'persons' })
}
</script>

<style lang="scss" scoped>
.debt-block {
    margin-top: 8px;
}
.annotation {
    width: 90%;
    margin: 0 auto;
    text-align: center;
    font-size: 10px;
    color: rgb(0, 0, 0, 0.7);
}
</style>
