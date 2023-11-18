<template>
    <div class="result-container">
        <div class="result-header">{{ name }} {{ directionText }}</div>
        <v-divider />
        <div class="pa-2">
            <div
                v-for="debt in props.debts"
                :key="debt[props.direction].id"
                class="d-flex"
            >
                <span class="debt-container debt-name">
                    {{ debt[props.direction].name }}
                </span>
                <span class="debt-container">
                    &nbsp;- {{ debt.amount }} &#8381;
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Debt, DebtDirections } from '@/types'

const props = defineProps<{
    debts: Debt[]
    direction: DebtDirections
    name: string
}>()

const directionText = computed(() => {
    if (props.direction === 'to') {
        return 'должен(а)'
    }
    if (props.direction === 'from') {
        return 'ждёт выплаты от'
    }
    return ''
})
</script>

<style scoped lang="scss">
.result-container {
    border: 1px solid rgb(158, 158, 158);
    border-radius: 4px;
    background-color: #dbdbdb7a;
    .result-header {
        text-align: center;
        font-size: 18px;
        font-weight: 500;
        padding: 8px;
    }
    .debt-container {
        flex: 1;
        &.debt-name {
            text-align: right;
        }
    }
}
</style>
