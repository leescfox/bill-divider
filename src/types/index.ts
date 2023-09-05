export interface ModalContent {
    title: string
    text: string
}

export interface Person {
    name: string
    id: symbol
}

export interface Item {
    name: string
    price: number
    payer: Person | undefined
    consumers: Person[]
    id: symbol
}

export interface Debt {
    from: Person
    to: Person
    amount: number
}

export type ValidationRule = true | string

export type FormValidation = boolean | null

export type ErrorType =
    | 'UnknownError'
    | 'FewPositionsError'
    | 'InvalidDataError'
