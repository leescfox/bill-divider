<template>
    <div class="description">
        <slot name="icon"></slot>
        <slot></slot>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.description {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 65%;
    margin: 0 auto;
    text-align: center;
}
</style>
