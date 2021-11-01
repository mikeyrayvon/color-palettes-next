import type { NextPage } from 'next'
import { createClient } from '@supabase/supabase-js'

import { useStore } from '../utils/store'
import Layout from '../components/Layout'
import Container from '../components/Container'
import { Color } from '../utils/types'
import ColorPicker from '../components/ColorPicker'
import NewColor from '../components/NewColor'
import { initialColor, supabaseUrl } from '../utils/constants'
import { assignPaletteNewOrder, hexToRGB, sortPaletteByOrder, uniqueId } from '../utils/tools'
import { postData } from '../utils/api'
import { useEffect, useState } from 'react'

const supabaseKey = process.env.SUPABASE_KEY ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface Props {
  palette:[]
  error: {}
}

const Landing: NextPage<Props> = ({data, error}) => {
  //const { state, dispatch } = useStore()
  const [palette, setPalette] = useState<Color[]>([])
  useEffect(() => {
    if (data && data.length > 0) {
      setPalette(sortPaletteByOrder(data))
    }
  }, [])

  const addColor = () => {
    const newColor = {
      ...initialColor,
      id: uniqueId(),
      order: palette.length + 1
    }
    setPalette((prevPalette) => {
      return [
        ...prevPalette,
        newColor
      ]
    })
    postData('api/upsertColor', { color: newColor })
  }

  const updateValues = (color: Color, hex: string) => {
    const rgb: number[] | boolean = hexToRGB(hex.slice(1))
    const updatedColor: Color = {
      ...color,
      name: '...',
      hex,
      rgb: rgb ? rgb.toString() : ''
    }    
    setPalette(prevPalette => {
      return prevPalette.map(c => c.order === updatedColor.order ? updatedColor : c)
    })
  }

  const updateColor = (color: Color) => {
    postData('api/getColorName', {
      hex: color.hex.slice(1)
    })
      .then((response) => {
        const updatedColor = {
          ...color, 
          name: response.name ? response.name : 'New Color'
        }
        console.log(response)
        setPalette(prevPalette => {
          return prevPalette.map(c => c.order === updatedColor.order ? updatedColor : c)
        })
        postData('api/upsertColor', { color: updatedColor })
      })
      .catch((error) => {
        console.error('updateColor error', error)
        alert(error.message)
      })
  }

  const deleteColor = (id: number) => {
    const filtered = palette.filter(color => color.id !== id)
    console.log('filtered',filtered)
    const updated = assignPaletteNewOrder(filtered)
    console.log('updated',updated)
    setPalette(updated)
    postData('api/deleteColor', { id })
  } 

  const reorderColor = (id: number, oldOrder: number, newOrder: number) => {
    const reordered = palette.map((c): Color => {
      if (c.order === newOrder && c.id !== id) {
        const updatedColor = {
          ...c, 
          order: oldOrder
        }
        postData('api/upsertColor', { color: updatedColor })
        return updatedColor
      } else if (c.id === id) {
        const updatedColor = {
          ...c, 
          order: newOrder
        }
        postData('api/upsertColor', { color: updatedColor })
        return updatedColor
      }
      return c
    })
    const sorted = sortPaletteByOrder(reordered)
    const updated = assignPaletteNewOrder(sorted)
    setPalette(updated)
  }

  return (
    <Layout>
      <Container>
        <div className='py-32'>
          <h1 className='text-3xl font-bold mb-12'>Colors</h1>
          <div className='flex flex-wrap'>
            {palette.map(color => <ColorPicker 
              key={color.id}
              color={color} 
              updateValues={updateValues} 
              updateColor={updateColor}
              deleteColor={deleteColor}
              reorderColor={reorderColor}
              paletteLength={palette.length}
              />)}
            <NewColor addColor={addColor} />
          </div>
        </div>
      </Container>
    </Layout>
  )
}

export const getServerSideProps = async () => {
  let { data: Palette, error } = await supabase
  .from('Palette')
  .select('*')

  return {
    props: {
      data: Palette,
      error
    }
  }
}

export default Landing


/*
const addColor = async () => {
    const newColor = {
      ...initialColor,
      id: uniqueId(),
      order: state.colors.length + 1
    }

    dispatch({type: 'add color', payload: newColor})
    
    try {
      const { data, error } = await supabase
      .from('Palette')
      .insert([newColor], { upsert: true })
      if (error) {
        console.error(error)
      }
    } catch(error) {
      console.error(error)
    }

    //postData('api/upsertColor', newColor)
  }

  const updateColor = async (color: Color, hex: string) => {
    const rgb: number[] | boolean = hexToRGB(hex.slice(1))
    const updated: Color = {
      ...color,
      name: '...',
      hex,
      rgb: rgb ? rgb.toString() : ''
    }
    dispatch({type: 'update color', payload: updated})
  }

  const updateName = (color: Color) => {
    postData('api/getColorName', {
      hex: color.hex.slice(1)
    })
      .then((response) => {
        return {
          ...color,
          name: response.name ? response.name : 'No name',
        }
      })
      .then((updatedColor: Color) => {
        dispatch({type: 'update color', payload: updatedColor})
        return updatedColor
      })
      .then((updatedColor: Color) => {
        postData('api/upsertColor', updatedColor)
      })
      .catch(err => {
        console.error('Update Error', err)
      })

    /*const updated: Color = {
      ...color,
      name: colorName.name ? colorName.name : 'No name',
    }
    dispatch({type: 'update color', payload: updated})
  }
  */