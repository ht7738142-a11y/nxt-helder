import React from 'react'
import { Bar } from 'react-chartjs-2'

export default function ChartBox({ title, labels = [], data = [], color = '#5C9D9D' }){
  const cfg = {
    labels,
    datasets: [{ label: title, data, backgroundColor: color }]
  }
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Bar data={cfg} />
    </div>
  )
}
