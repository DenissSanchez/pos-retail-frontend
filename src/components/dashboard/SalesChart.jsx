import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function SalesChart({ salesData }) {
  // Si nos pasan datos por props los usamos, si no, usamos ceros por defecto
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const chartValues = salesData || [0, 0, 0, 0, 0, 0, 0];

  const data = {
    labels: days,
    datasets: [
      {
        label: "Ventas ($)",
        data: chartValues,
        backgroundColor: "rgba(91, 44, 131, 0.8)", // El morado #5B2C83 de tu app
        borderColor: "#5B2C83",
        borderWidth: 1,
        borderRadius: 8, // Bordes redondeados en las barras
        hoverBackgroundColor: "#4a236d",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda si solo hay una serie de datos para más limpieza
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Total: $${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Quita las líneas verticales de fondo
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
}