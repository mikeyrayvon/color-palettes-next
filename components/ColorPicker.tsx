import { useState } from 'react'
import type { Color } from '../utils/types'

interface Props {
  color: Color
  updateValues(color: Color, hex: string): void
  updateColor(color: Color): void
  deleteColor(id: number): void
  handleDrag(e: React.DragEvent): void
  handleDrop(e: React.DragEvent): void
}

const ColorPicker: React.FC<Props> = ({ 
  color, 
  updateColor, 
  updateValues, 
  deleteColor, 
  handleDrag,
  handleDrop
}) => {
  const [hovered, setHovered] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValues(color, e.target.value)
  }

  return (
    <div 
      className='flex flex-col text-center items-center py-4 w-32 relative h-[190px]'
      id={color.id.toString()}
      draggable={true}
      onDragOver={(e) => e.preventDefault()}
      onDragStart={handleDrag}
      onDrop={handleDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
      <input 
        className='w-0 h-0 opacity-0 absolute left-0' 
        type='color' 
        id={`color_${color.id}`}
        name={`color_${color.id}`}
        value={color?.hex} 
        onInput={handleChange} 
        onBlur={() => updateColor(color)}
        />
      <label 
        className='block w-24 h-24 rounded-full shadow-xl mb-4' 
        style={{
          backgroundColor: color?.hex
        }} 
        htmlFor={`color_${color.id}`} 
        />
      {hovered &&
        <div className='absolute top-0 right-0 flex'>
          <button onClick={() => deleteColor(color.id)}>X</button>
        </div>
      }
      <div className='text-xs flex flex-col justify-between flex-grow'>
        {color?.name && 
          <div className='flex-grow flex flex-col justify-center'><span className='mb-2 font-bold text-gray-800'>{color.name}</span></div>
        }
        <div className='block'>
          {color?.hex && 
            <div><span className='text-gray-500'>{color.hex}</span></div>
          }
          {color?.rgb && 
            <div><span className='text-gray-500'>rgb({color.rgb})</span></div>
          }
        </div>
      </div>
    </div>
  )
}

export default ColorPicker