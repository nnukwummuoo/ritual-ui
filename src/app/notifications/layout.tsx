import React from 'react'
import { Creatornotify } from './Notitification'
import { Allview } from './components/Allview'

export default function layout({children}: {children: React.ReactNode}) {
  return <Creatornotify>
    {children}
  </Creatornotify>
}
