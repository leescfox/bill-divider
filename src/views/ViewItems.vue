<template>
    <v-card>
        <v-card-item>
            <div class="d-flex flex-column align-center">
                <v-card-title>Что и как делить?</v-card-title>
                <v-btn @click="billStore.addItem()" class="text-none ma-2">
                    Добавить продукт
                </v-btn>
            </div>
        </v-card-item>
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
                                :rules="productNameValidation"
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
                                :rules="priceValidation"
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
                        :rules="payerValidation"
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
                        :rules="consumersValidation"
                        chips
                        variant="outlined"
                        placeholder="Пользовались"
                        density="compact"
                        bg-color="inputBG"
                        class="mt-2"
                    />
                </div>
            </template>
            <div
                v-else
                class="empty-list-wrapper d-flex flex-column align-center"
            >
                <v-icon icon="mdi-receipt-text-check-outline" size="100" />
                <span class="empty-list-text">
                    Добавьте то, что будем делить, а также тех, кто платил, и
                    тех, кто пользовался
                </span>
            </div>
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

<script lang="ts">
import { defineComponent } from 'vue'
import { useBillStore } from '@/store/billStore'
import {
    ModalContent,
    Person,
    ValidationRule,
    FormValidation,
    ErrorType,
} from '@/types'

export default defineComponent({
    setup() {
        const billStore = useBillStore()
        return { billStore }
    },
    data() {
        return {
            isFormValid: null as FormValidation,
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
            showModal: false as boolean,
            error: 'UnknownError' as ErrorType,
        }
    },
    computed: {
        itemsModalContent(): ModalContent {
            const content: ModalContent = {
                title: '',
                text: '',
            }
            switch (this.error) {
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
        },
    },
    methods: {
        async validateForm(): Promise<boolean> {
            if (!this.billStore.hasItems) {
                this.error = 'FewPositionsError'
            } else {
                try {
                    await (
                        this.$refs['itemsForm'] as HTMLFormElement
                    ).validate()
                    if (this.isFormValid) {
                        return true
                    }
                    this.error = 'InvalidDataError'
                } catch {
                    this.error = 'UnknownError'
                }
            }
            return false
        },
        redirectToResults(): void {
            this.$router.push({ name: 'results' })
        },
        hideModal(): void {
            this.showModal = false
        },
    },
    async beforeRouteLeave(to) {
        if (to.name !== 'results') return true
        if (!(await this.validateForm())) {
            this.showModal = true
            return false
        }
        this.billStore.calculateResults()
    },
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

.empty-list-wrapper {
    width: 70%;
    margin: 0 auto;
    .empty-list-text {
        text-align: center;
    }
}

.action-btn-container {
    width: 100%;
}
</style>
