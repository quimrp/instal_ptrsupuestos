'use client'

import { Avatar } from '@/components/catalyst/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/catalyst/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/catalyst/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/catalyst/sidebar'
import { SidebarLayout } from '@/components/catalyst/sidebar-layout'
import Link from 'next/link'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  UsersIcon,
  CubeIcon
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { Fragment, useState } from 'react'
import { Dialog, Transition, Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const presupuestosSubmenu = [
  { href: '/presupuestos/nuevo', label: 'Nuevo Presupuesto' },
  { href: '/presupuestos/estadisticas', label: 'Estadísticas' },
]

const clientesSubmenu = [
  { href: '/clientes/nuevo', label: 'Nuevo Cliente' },
]

const productosSubmenu = [
  { href: '/dashboard/productos', label: 'Gestionar Productos' },
]

export function Example({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          <Disclosure as="div" defaultOpen={pathname.startsWith('/presupuestos')}>
                            {({ open }) => (
                              <>
                                <div className="flex items-center">
                                  <SidebarItem 
                                    href="/presupuestos/lista" 
                                    current={pathname === '/presupuestos/lista'}
                                    className="flex-1"
                                  >
                                    <SidebarLabel>Presupuestos</SidebarLabel>
                                  </SidebarItem>
                                  <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                                    {open ? (
                                      <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                      <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                    )}
                                  </Disclosure.Button>
                                </div>
                                <Disclosure.Panel className="mt-1 space-y-1">
                                  {presupuestosSubmenu.map((item) => (
                                    <SidebarItem
                                      key={item.href}
                                      href={item.href}
                                      current={pathname === item.href}
                                      className="pl-8"
                                    >
                                      <SidebarLabel>{item.label}</SidebarLabel>
                                    </SidebarItem>
                                  ))}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                          
                          <Disclosure as="div" defaultOpen={pathname.startsWith('/clientes')}>
                            {({ open }) => (
                              <>
                                <div className="flex items-center">
                                  <SidebarItem 
                                    href="/clientes" 
                                    current={pathname === '/clientes'}
                                    className="flex-1"
                                  >
                                    <SidebarLabel>Clientes</SidebarLabel>
                                  </SidebarItem>
                                  <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                                    {open ? (
                                      <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                      <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                    )}
                                  </Disclosure.Button>
                                </div>
                                <Disclosure.Panel className="mt-1 space-y-1">
                                  {clientesSubmenu.map((item) => (
                                    <SidebarItem
                                      key={item.href}
                                      href={item.href}
                                      current={pathname === item.href}
                                      className="pl-8"
                                    >
                                      <SidebarLabel>{item.label}</SidebarLabel>
                                    </SidebarItem>
                                  ))}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>

                          <Disclosure as="div" defaultOpen={pathname.startsWith('/dashboard/productos')}>
                            {({ open }) => (
                              <>
                                <div className="flex items-center">
                                  <SidebarItem 
                                    href="/dashboard/productos" 
                                    current={pathname === '/dashboard/productos'}
                                    className="flex-1"
                                  >
                                    <CubeIcon className="h-5 w-5 mr-2" />
                                    <SidebarLabel>Productos</SidebarLabel>
                                  </SidebarItem>
                                  <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                                    {open ? (
                                      <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                      <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                    )}
                                  </Disclosure.Button>
                                </div>
                                <Disclosure.Panel className="mt-1 space-y-1">
                                  {productosSubmenu.map((item) => (
                                    <SidebarItem
                                      key={item.href}
                                      href={item.href}
                                      current={pathname === item.href}
                                      className="pl-8"
                                    >
                                      <SidebarLabel>{item.label}</SidebarLabel>
                                    </SidebarItem>
                                  ))}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                          
                          <SidebarItem href="/events" current={pathname === '/events'}>
                            <SidebarLabel>Eventos</SidebarLabel>
                          </SidebarItem>
                          <SidebarItem href="/orders" current={pathname === '/orders'}>
                            <SidebarLabel>Pedidos</SidebarLabel>
                          </SidebarItem>
                          <SidebarItem href="/settings" current={pathname === '/settings'}>
                            <SidebarLabel>Configuración</SidebarLabel>
                          </SidebarItem>
                          <SidebarItem href="/broadcasts" current={pathname === '/broadcasts'}>
                            <SidebarLabel>Transmisiones</SidebarLabel>
                          </SidebarItem>
                        </ul>
                      </li>
                      <li>
                        <div className="text-xs font-semibold leading-6 text-zinc-400">Eventos próximos</div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          <SidebarItem href="/events/upcoming" current={pathname === '/events/upcoming'}>
                            <SidebarLabel>Próximos eventos</SidebarLabel>
                          </SidebarItem>
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <SidebarItem href="/profile" current={pathname === '/profile'}>
                          <SidebarLabel>Tu perfil</SidebarLabel>
                        </SidebarItem>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-zinc-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <Disclosure as="div" defaultOpen={pathname.startsWith('/presupuestos')}>
                    {({ open }) => (
                      <>
                        <div className="flex items-center">
                          <SidebarItem 
                            href="/presupuestos/lista" 
                            current={pathname === '/presupuestos/lista'}
                            className="flex-1"
                          >
                            <SidebarLabel>Presupuestos</SidebarLabel>
                          </SidebarItem>
                          <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                            {open ? (
                              <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </Disclosure.Button>
                        </div>
                        <Disclosure.Panel className="mt-1 space-y-1">
                          {presupuestosSubmenu.map((item) => (
                            <SidebarItem
                              key={item.href}
                              href={item.href}
                              current={pathname === item.href}
                              className="pl-8"
                            >
                              <SidebarLabel>{item.label}</SidebarLabel>
                            </SidebarItem>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  
                  <Disclosure as="div" defaultOpen={pathname.startsWith('/clientes')}>
                    {({ open }) => (
                      <>
                        <div className="flex items-center">
                          <SidebarItem 
                            href="/clientes" 
                            current={pathname === '/clientes'}
                            className="flex-1"
                          >
                            <SidebarLabel>Clientes</SidebarLabel>
                          </SidebarItem>
                          <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                            {open ? (
                              <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </Disclosure.Button>
                        </div>
                        <Disclosure.Panel className="mt-1 space-y-1">
                          {clientesSubmenu.map((item) => (
                            <SidebarItem
                              key={item.href}
                              href={item.href}
                              current={pathname === item.href}
                              className="pl-8"
                            >
                              <SidebarLabel>{item.label}</SidebarLabel>
                            </SidebarItem>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  <Disclosure as="div" defaultOpen={pathname.startsWith('/dashboard/productos')}>
                    {({ open }) => (
                      <>
                        <div className="flex items-center">
                          <SidebarItem 
                            href="/dashboard/productos" 
                            current={pathname === '/dashboard/productos'}
                            className="flex-1"
                          >
                            <CubeIcon className="h-5 w-5 mr-2" />
                            <SidebarLabel>Productos</SidebarLabel>
                          </SidebarItem>
                          <Disclosure.Button className="p-1.5 hover:bg-zinc-100 rounded">
                            {open ? (
                              <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </Disclosure.Button>
                        </div>
                        <Disclosure.Panel className="mt-1 space-y-1">
                          {productosSubmenu.map((item) => (
                            <SidebarItem
                              key={item.href}
                              href={item.href}
                              current={pathname === item.href}
                              className="pl-8"
                            >
                              <SidebarLabel>{item.label}</SidebarLabel>
                            </SidebarItem>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  
                  <SidebarItem href="/events" current={pathname === '/events'}>
                    <SidebarLabel>Eventos</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/orders" current={pathname === '/orders'}>
                    <SidebarLabel>Pedidos</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/settings" current={pathname === '/settings'}>
                    <SidebarLabel>Configuración</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/broadcasts" current={pathname === '/broadcasts'}>
                    <SidebarLabel>Transmisiones</SidebarLabel>
                  </SidebarItem>
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-zinc-400">Eventos próximos</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <SidebarItem href="/events/upcoming" current={pathname === '/events/upcoming'}>
                    <SidebarLabel>Próximos eventos</SidebarLabel>
                  </SidebarItem>
                </ul>
              </li>
              <li className="mt-auto">
                <SidebarItem href="/profile" current={pathname === '/profile'}>
                  <SidebarLabel>Tu perfil</SidebarLabel>
                </SidebarItem>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-zinc-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-zinc-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown */}
              <div className="relative">
                <button type="button" className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full bg-zinc-50"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-zinc-900" aria-hidden="true">
                      Tom Cook
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}