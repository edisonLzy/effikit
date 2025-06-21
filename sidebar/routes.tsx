import { createMemoryRouter, RouteObject } from "react-router";
import { Layout } from "./layout";
import { Home } from "./home";
import { NotebookLLM } from "./tools/NotebookLLM";
import { Smile } from "lucide-react";
import { ReactNode } from "react";

type RouteHandle = {
    label: string;
    icon: ReactNode;
    description: string;
}

export const toolRoutes: RouteObject[] = [
    {
      path:'NotebookLLM',
      element: <NotebookLLM />,
      handle: {
        label: 'NotebookLLM',
        description: 'NotebookLLM is a tool that allows you to create and edit notebooks.',
        icon: <Smile className="w-4 h-4" />,
      } satisfies RouteHandle
    }
]

export const router = createMemoryRouter([
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
           children: toolRoutes
         }
       ]
    }
])