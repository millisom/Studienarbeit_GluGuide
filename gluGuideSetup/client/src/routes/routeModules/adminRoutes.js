import { lazy } from 'react';

const AdminDashboard = lazy(() => import('../../pages/AdminDashboard.jsx'));
const AdminCreateUser = lazy(() => import('../../pages/AdminCreateUser.jsx'));
const AdminEditUser = lazy(() => import('../../pages/AdminEditUser.jsx'));
const AdminEditPost = lazy(() => import('../../pages/AdminEditPost.jsx'));
const AdminCreateKnowledge = lazy(() => import('../../pages/AdminCreateKnowledge.jsx'));
const AdminEditKnowledge = lazy(() => import('../../pages/AdminEditKnowledge.jsx'));

export const adminRoutes = [
  { path: "/admin", element: AdminDashboard },
  { path: "/admin/createUser", element: AdminCreateUser },
  { path: "/admin/editUser/:id", element: AdminEditUser },
  { path: "/admin/editPost/:id", element: AdminEditPost },
  { path: "/admin/createKnowledge", element: AdminCreateKnowledge },
  { path: "/admin/editKnowledge/:id", element: AdminEditKnowledge },
];