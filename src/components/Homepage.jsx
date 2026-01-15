import { Notebook } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { SignInButton } from '@clerk/clerk-react'
import hero from '../assets/hero.png'

export default function Homepage() {
  return (
    <div className='min-h-screen flex items-center justify-center text-center bg-gray-100'>
      <div className='max-w-7xl px-4 py-20 grid gap-8'>
        <article>
          <h1 className='text-4xl lg:text-7xl font-bold flex items-center justify-center gap-2'>
            <Notebook className='size-10 lg:size-20' /> Notes.io
          </h1>
          <p className='lg:text-lg text-neutral-500 mt-6 max-w-2xl mx-auto'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias iste esse, reprehenderit provident repudiandae eum ipsum! Recusandae iste est excepturi.
          </p>

          <div className='flew items-center justify-center mt-6'>
            <Button variant="default" className="bg-teal-500 hover:bg-teal-600">
              <SignInButton mode='modal'>
                Get started for free
              </SignInButton>
            </Button>
          </div>
        </article>

        <article>
          <img src={hero} alt='App illustration' className='max-w-full'/>
        </article>
      </div>
    </div>
  )
}
