export const generateSKU = (

    productName,

    colorName,

    sizeName

) => {

    const product = productName

        ?.substring(0,3)

        .toUpperCase()

        .replace(/\s/g,"");

    const color = colorName

        ?.substring(0,3)

        .toUpperCase();

    const size = sizeName

        ?.toUpperCase();

    return `${product}-${color}-${size}`;

};