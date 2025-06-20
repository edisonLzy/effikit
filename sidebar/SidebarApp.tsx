import React from 'react';
import {  createMemoryRouter, RouterProvider } from 'react-router';
import { Home } from './home';
import { Layout } from './layout';
import { NotebookLLM } from './tools/NotebookLLM';

export default function SidebarApp() {
  return <RouterProvider router={useRouter()} />
} 

function useRouter(){
   const router = createMemoryRouter([
     {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />
          },
          {
            path: 'tool',
            children: [
              {
                path:'NotebookLLM',
                element: <NotebookLLM />
              }
            ]
          }
        ]
     }
   ])
   return router
}