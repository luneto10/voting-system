import { useParams } from 'react-router-dom'

export default function FormView() {
  const { id } = useParams()
  
  return (
    <div className="flex w-full h-full justify-center items-center">
      <h1 className="text-3xl">Form {id}</h1>
    </div>
  )
} 