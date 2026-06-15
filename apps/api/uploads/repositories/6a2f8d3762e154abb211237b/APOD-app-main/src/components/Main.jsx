import React from 'react'

export default function Main(props) {
  const{data} = props
  return (
    <div className='bgContainer'>
      <img src={data.hdurl} alt={data.title || 'bg-image'} className='bgImage'/>
    </div>
  )
}
