<template>
    <div class="loader">
        <div class="loader__wrapper">
            <p class="loader__content" data-text="Chargement..."></p>
        </div>
    </div>
</template>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .loader {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        vertical-align: middle;
        background-color: rgba($black-color, .8);
        z-index: 1000;

        .loader__wrapper {
            position: relative;
            width: 100%;
            height: 100%;

            .loader__content {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                transform: translate3d(-50%, -50%, 0);
                border: 6px solid rgba($white-color, .25);
                height: 60px;
                border-radius: 60px;

                &::before {
                    content: '';
                    position: absolute;
                    box-sizing: border-box;
                    top: -6px;
                    right: -6px;
                    bottom: -6px;
                    left: -6px;
                    border-radius: 50%;
                    width: inherit;
                    height: inherit;
                    border: 6px solid transparent;
                    border-top-color: $main-color;
                    animation: rotate 1.7s infinite;
                }

                &::after {
                    position: absolute;
                    content: attr(data-text);
                    height: 20px;
                    bottom: -40px;
                    left: -50%;
                }
            }
        }
    }
    @keyframes rotate {
        from { transform: rotate(0) }
        to { transform: rotate(360deg) }
    }
</style>

