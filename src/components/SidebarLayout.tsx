'use client'

import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  SignalIcon,
  DocumentTextIcon,
  ChartPieIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'

import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection } from '@/components/catalyst/sidebar'

export function SidebarLayout() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black">
            <HomeIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarBody>
        <SidebarSection>
          <SidebarItem 
            href="/presupuestos" 
            current={pathname.startsWith('/presupuestos')}
          >
            <ClipboardDocumentListIcon className="size-4" />
            Presupuestos
          </SidebarItem>
          
          <SidebarItem 
            href="/clientes" 
            current={pathname.startsWith('/clientes')}
          >
            <UsersIcon className="size-4" />
            Clientes
          </SidebarItem>
          
          <SidebarItem 
            href="/eventos" 
            current={pathname === '/eventos'}
          >
            <ChartBarIcon className="size-4" />
            Eventos
          </SidebarItem>
          
          <SidebarItem 
            href="/pedidos" 
            current={pathname === '/pedidos'}
          >
            <ShoppingCartIcon className="size-4" />
            Pedidos
          </SidebarItem>
        </SidebarSection>
        
        <SidebarSection>
          <SidebarItem 
            href="/configuracion" 
            current={pathname === '/configuracion'}
          >
            <CogIcon className="size-4" />
            Configuración
          </SidebarItem>
          
          <SidebarItem 
            href="/transmisiones" 
            current={pathname === '/transmisiones'}
          >
            <SignalIcon className="size-4" />
            Transmisiones
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      
      <SidebarFooter>
        <div className="px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          © 2024 Dashboard
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 