import React from "react";
import Barcode from "react-barcode";
import PropTypes from "prop-types";
import "../../styles/print-labels.css";

/**
 * Componente que representa el diseño físico de una etiqueta térmica (50mm x 25mm)
 */
export const LabelItem = ({ data }) => {
  const {
    productName = "PRODUCTO",
    variantColor = "",
    variantSize = "",
    price = 0,
    barcode = "000000000000",
    sku = ""
  } = data;

  // Formato de variante legible (ej: "M / AZUL")
  const variantDetails = [variantSize, variantColor].filter(Boolean).join(" / ");

  return (
    <div className="label-card">
      {/* Encabezado: Nombre corto y Precio */}
      <div className="label-header">
        <span className="label-title" title={productName}>
          {productName.toUpperCase()}
        </span>
        <span className="label-price">
          ${Number(price).toFixed(2)}
        </span>
      </div>

      {/* Código de Barras (CODE128 vectorial) */}
      <div className="label-barcode-container">
        <Barcode
          value={barcode || "000000000000"}
          format="CODE128"
          width={1.2}             /* Ancho de las barras */
          height={28}             /* Altura del gráfico */
          displayValue={true}     /* Muestra los números debajo */
          fontSize={8}            /* Tamaño del número impreso */
          fontOptions="bold"
          margin={0}
          marginTop={1}
          marginBottom={1}
          background="transparent"
        />
      </div>

      {/* Pie de Etiqueta: Detalles de Variante y SKU */}
      <div className="label-footer">
        <span>{variantDetails || "UNICA"}</span>
        <span>{sku}</span>
      </div>
    </div>
  );
};

LabelItem.propTypes = {
  data: PropTypes.shape({
    productName: PropTypes.string,
    variantColor: PropTypes.string,
    variantSize: PropTypes.string,
    price: PropTypes.number,
    barcode: PropTypes.string,
    sku: PropTypes.string
  }).isRequired
};

export default LabelItem;