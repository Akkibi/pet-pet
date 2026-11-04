import Blog from './Blog'
import Chat from './Chat'
import Dashboard from './Dashboard'
import Form from './Form'
import Gallery from './Gallery'
import Landing from './Landing'
import Playground from './Playground'
import Todo from './Todo'

export const PAGES = [
  { id: 'landing', label: 'Accueil', component: Landing },
  { id: 'dashboard', label: 'Tableau de bord', component: Dashboard },
  { id: 'todo', label: 'Tâches', component: Todo },
  { id: 'form', label: 'Formulaire', component: Form },
  { id: 'blog', label: 'Blog', component: Blog },
  { id: 'chat', label: 'Chat', component: Chat },
  { id: 'gallery', label: 'Galerie', component: Gallery },
  { id: 'playground', label: 'Bac à sable', component: Playground },
] as const
