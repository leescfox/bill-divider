<template>
    <v-card>
        <PageTitle>
            <template #default>Что и как делить?</template>
            <template #button>
                <v-btn @click="billStore.addItem()" class="text-none">
                    Добавить продукт
                </v-btn>
            </template>
        </PageTitle>
        <v-divider />
        <v-form
            v-model="isFormValid"
            ref="itemsForm"
            @submit.prevent="redirectToResults()"
        >
            <template v-if="billStore.hasItems">
                <div
                    v-for="item in billStore.items"
                    :key="item.id"
                    class="item-container pa-2 mt-2"
                >
                    <div class="d-flex">
                        <div class="side-container">
                            <v-text-field
                                v-model.trim="item.name"
                                :rules="validation.productNameValidation"
                                counter
                                maxlength="30"
                                variant="outlined"
                                placeholder="Продукт"
                                density="compact"
                                bg-color="inputBG"
                            />
                        </div>
                        <div class="d-flex side-container">
                            <v-text-field
                                v-model.trim="item.price"
                                :rules="validation.priceValidation"
                                append-inner-icon="mdi-currency-rub"
                                type="number"
                                min="0"
                                variant="outlined"
                                placeholder="Цена"
                                density="compact"
                                bg-color="inputBG"
                            />
                            <v-btn
                                @click="billStore.deleteItem(item.id)"
                                icon="mdi-trash-can-outline"
                                elevation="1"
                            />
                        </div>
                    </div>
                    <v-select
                        v-model="item.payer"
                        :items="billStore.persons"
                        item-title="name"
                        return-object
                        :rules="validation.payerValidation"
                        variant="outlined"
                        placeholder="Оплатил(а)"
                        density="compact"
                        bg-color="inputBG"
                        class="mt-2"
                    />
                    <v-select
                        v-model="item.consumers"
                        :items="billStore.persons"
                        item-title="name"
                        return-object
                        multiple
                        :rules="validation.consumersValidation"
                        chips
                        variant="outlined"
                        placeholder="Пользовались"
                        density="compact"
                        bg-color="inputBG"
                        class="mt-2"
                    />
                </div>
            </template>
            <PageDescription v-else>
                <template #icon>
                    <v-icon icon="mdi-receipt-text-check-outline" size="100" />
                </template>
                <template #default>
                    Добавьте то, что будем делить, а также тех, кто платил, и
                    тех, кто пользовался
                </template>
            </PageDescription>
            <v-btn type="submit" class="text-none mt-2" variant="tonal" block>
                Продолжить
            </v-btn>
        </v-form>
    </v-card>
    <v-dialog v-model="showModal" width="auto">
        <v-card>
            <v-card-title>{{ itemsModalContent.title }}</v-card-title>
            <v-card-text>{{ itemsModalContent.text }}</v-card-text>
            <v-card-actions>
                <div class="action-btn-container d-flex justify-end">
                    <v-btn @click="hideModal()" class="text-none">
                        Хорошо
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import router from '@/router'
import { useBillStore } from '@/store/billStore'
import {
    ModalContent,
    Person,
    ValidationRule,
    FormValidation,
    ErrorType,
} from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import PageDescription from '@/components/PageDescription.vue'

const billStore = useBillStore()

const validation = reactive({
    productNameValidation: [
        (value: string): ValidationRule => {
            return value.length > 0 ? true : 'Введите название!'
        },
    ],
    priceValidation: [
        (value: string | undefined): ValidationRule => {
            return value !== undefined && value.length > 0
                ? true
                : 'Введите цену!'
        },
        (value: number): ValidationRule => {
            return value > 0 ? true : 'Неверное значение!'
        },
    ],
    consumersValidation: [
        (value: Person[]): ValidationRule => {
            return value.length > 0 ? true : 'Добавьте пользовавшихся!'
        },
    ],
    payerValidation: [
        (value: Person | null): ValidationRule => {
            return value !== null ? true : 'Кто платил?'
        },
    ],
})

const itemsForm = ref<HTMLFormElement | null>(null)
const isFormValid = ref<FormValidation>(null)
const error = ref<ErrorType>('UnknownError')
async function validateForm() {
    if (!billStore.hasItems) {
        error.value = 'FewPositionsError'
    } else {
        try {
            if (!itemsForm.value) {
                error.value = 'UnknownError'
                return
            }
            await itemsForm.value.validate()
            if (isFormValid.value) {
                return true
            }
            error.value = 'InvalidDataError'
        } catch {
            error.value = 'UnknownError'
        }
    }
    return false
}

const itemsModalContent = computed(() => {
    const content: ModalContent = {
        title: '',
        text: '',
    }
    switch (error.value) {
        case 'FewPositionsError':
            content.title = 'Слишком мало позиций!'
            content.text = 'Должна быть хотя бы одна позиция!'
            break
        case 'InvalidDataError':
            content.title = 'Данные введены неверно!'
            content.text =
                'Пожалуйста, проверьте корректность введённых данных.'
            break
        case 'UnknownError':
        default:
            content.title = 'Неизвестная ошибка!'
            content.text = 'Произошла неизвестная ошибка!'
            break
    }
    return content
})
const showModal = ref(false)
function hideModal() {
    showModal.value = false
}

function redirectToResults() {
    router.push({ name: 'results' })
}

onBeforeRouteLeave(async (to) => {
    if (to.name !== 'results') return true
    if (!(await validateForm())) {
        showModal.value = true
        return false
    }
    billStore.calculateResults()
})
</script>

<style lang="scss" scoped>
.item-container {
    border: 1px solid rgb(158, 158, 158);
    border-radius: 4px;
    background-color: #dbdbdb7a;
    .side-container {
        flex: 1;
    }
}
.action-btn-container {
    width: 100%;
}
</style>
