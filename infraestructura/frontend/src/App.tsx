import {  useState, useEffect } from 'react'
import { obtenerClimas } from './services/clima.service'

interface Clima {
  id: number
  ciudad: string
  temperatura: number
  humedad: number
  velocidadViento: number
  estado: string
}

function App() {
  const [climas, setClimas] = useState([])
  
  useEffect(() => {
    async function fetchClimas() {
      try {
        const data = await obtenerClimas()
        setClimas(data)
      } catch (error) {
        console.error('Error fetching climas:', error)
      }
    };

    fetchClimas();
  }, []);
  
  const imagenEstado = (estado: string) => {
    if(estado === 'soleado') {
      return <img src='/assets/soleado.png' className='w-15 h-15'/>
    } else if (estado === 'nublado') {
      return <img src='/assets/nublado.png' className='w-15 h-15'/>
    } else if (estado === 'lluvioso') {
      return <img src='/assets/lluvioso.png' className='w-15 h-15'/>
    }
    else if (estado === 'tormenta') {
      return <img src='/assets/tormenta.png' className='w-15 h-15'/>
    } else if (estado === 'nieve') {
      return <img src='/assets/nevado.png' className='w-15 h-15'/>
    }
    else if (estado === 'viento') {
      return <img src='/assets/ventoso.png' className='w-15 h-15'/>
    }
    else if (estado === 'neblina') {
      return <img src='/assets/neblina.png' className='w-15 h-15'/>
    }
    else {
      return <p>NO HAY IMAGEN</p>
    }
  }


  return (
    <div className='bg-slate-50 min-h-screen w-screen flex flex-col  items-center '>
      <h1 className='text-3xl font-bold text-black'>
        Menu Climas
      </h1>
      <div className='flex flex-col gap-4 mt-4'>
        {climas.map((clima:Clima) => (
          <div key={clima.id} className='bg-white text-black p-4 rounded shadow'>
            <h2 className='text-xl  font-semibold'>{clima.ciudad}</h2>
            <p>Temperatura: {clima.temperatura}°C</p>
            <p>Humedad: {clima.humedad}%</p>
            <p>Velocidad del viento: {clima.velocidadViento} km/h</p>
            <p>Estado: {clima.estado}</p>
            {imagenEstado(clima.estado)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
