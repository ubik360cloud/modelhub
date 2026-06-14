import { useAuth } from '../../hooks/useAuth'
import ModelSchedule from './ModelSchedule'
import StudioSchedule from './StudioSchedule'

export default function Schedule() {
  const { profile } = useAuth()
  if (profile?.role === 'studio') return <StudioSchedule />
  return <ModelSchedule />
}
