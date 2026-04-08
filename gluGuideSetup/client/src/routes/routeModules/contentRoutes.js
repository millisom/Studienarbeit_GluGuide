import { lazy } from 'react';

const Blogs = lazy(() => import('../../pages/blogs.jsx'));
const ViewPost = lazy(() => import('../../components/viewPost.jsx'));
const EditPost = lazy(() => import('../../components/editPost.jsx'));
const CreatePost = lazy(() => import('../../pages/createPost.jsx'));
const MyBlogs = lazy(() => import('../../pages/myBlogs.jsx'));
const UserProfile = lazy(() => import('../../components/UserProfile.jsx'));
const KnowledgeBasePage = lazy(() => import('../../pages/KnowledgeBasePage.jsx'));
// const ArticleView = lazy(() => import('../../pages/ArticleView.jsx')); // We'll uncomment this when we build it!


export const contentRoutes = [
  { path: "/blogs", element: Blogs },
  { path: "/blogs/view/:id", element: ViewPost },
  { path: "/blogs/edit/:id", element: EditPost },
  { path: "/create/post", element: CreatePost },
  { path: "/myBlogs", element: MyBlogs },
  { path: "/viewPost/:id", element: ViewPost },
  { path: "/profile/:username", element: UserProfile },
  { path: "/knowledge", element: KnowledgeBasePage },
  // { path: "/knowledge/:id", element: ArticleView }, // We'll uncomment this when we build it!
];