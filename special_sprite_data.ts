
/**
* Use this file to define custom functions and blocks.
* Read more at https://arcade.makecode.com/blocks/custom
*/

/**
 * Custom Util Functions
 */
//% weight=100 color=#0fbc11 icon=""
namespace customUtils {
    /**
     * Stores image array in the data of a sprite
     * @param sprite sprite you want to store the data in
     * @param name text key that you store the image array in, eg: "data name"
     * @param data array of images
     */
    //% block
    export function setDataImageArray(sprite: Sprite, name: string, data: Array<Image>): void {
        if (!sprite || !name) return;
        const d = sprite.data;
        d[name] = data;
    }

    /**
     * Stores image array in the data of a sprite
     * @param sprite sprite you want to read the data from
     * @param name text key that you want to get the data from, eg: "data name"
     */
    //% block
    export function readDataImageArray(sprite: Sprite, name: string): Array<Image> {
        if (!sprite || !name) return null;
        const d = sprite.data;
        return d[name];
    }
}
