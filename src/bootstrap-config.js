// Configuration personnalisée pour Bootstrap et Popper.js
import { popperGenerator, defaultModifiers } from "@popperjs/core/lib/popper-lite";
import preventOverflow from "@popperjs/core/lib/modifiers/preventOverflow";
import flip from "@popperjs/core/lib/modifiers/flip";
import offset from "@popperjs/core/lib/modifiers/offset";

// Créer une configuration Popper personnalisée qui utilise offset au lieu de margin CSS
export const createPopper = popperGenerator({
    defaultModifiers: [
        ...defaultModifiers,
        offset,
        preventOverflow,
        flip
    ]
});

// Configuration par défaut pour les dropdowns Bootstrap
export const defaultPopperConfig = {
    placement: "bottom-start",
    modifiers: [
        {
            name: "offset",
            options: {
                offset: [ 0, 2 ] // Remplace les marges CSS avec un offset
            }
        },
        {
            name: "preventOverflow",
            options: {
                padding: 8 // Ajoute du padding pour éviter les débordements
            }
        },
        {
            name: "flip",
            options: {
                padding: 8 // Ajoute du padding pour le basculement
            }
        }
    ]
};
