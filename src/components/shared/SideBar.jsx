import React from 'react'
import { Link } from 'react-router-dom'
import { NotebookTabs,CreditCardIcon,HomeIcon,SettingsIcon,Users,Settings2, GalleryHorizontal} from 'lucide-react'
import { useUser } from '@clerk/clerk-react'

export const Sidebar = () => {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || user?.privateMetadata?.role

  return (
    <aside className="md:w-64 bg-white p-4 rounded-lg shadow">
      <nav className="space-y-1">
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/donations"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <CreditCardIcon className="h-5 w-5" />
          <span>Donations</span>
        </Link>

        {role === 'admin' && (
          <>
            <Link
              to="/admin/visitation-planner"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <NotebookTabs className="h-5 w-5" />
              <span>Visitation Planner</span>
            </Link>

            <Link
              to="/admin/visitation-mgt"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <Settings2 className="h-5 w-5" />
              <span>Visit Management</span>
            </Link>
            <Link
              to="/admin/gallery-upload"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <GalleryHorizontal className="h-5 w-5" />
              <span>Gallery</span>
            </Link>

            <Link
              to="/admin/user-management"
              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </Link>
          </>
        )}

        <Link
          to="/admin/settings"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <SettingsIcon className="h-5 w-5" />
          <span>Settings</span>
        </Link>

        <Link
          to="/user/home"
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Visit Website</span>
        </Link>
      </nav>
    </aside>
  )
}
