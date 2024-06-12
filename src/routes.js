import Intro from './containers/intro/intro';
import ProjectsPro from './containers/projects-pro/projects-pro';
import ProjectsInd from './containers/projects-ind/projects-ind';
import Achievements from './containers/achievements/achievements';
import Skills from './containers/skills/skills';
import Contact from './containers/contact/contact';

export const routes = [
  { path: '/', component: Intro, title: 'Intro' },
  { path: '/projects-professional', component: ProjectsPro, title: 'Projects - Professional' },
  { path: '/projects-individual', component: ProjectsInd, title: 'Projects - Individual' },
  { path: '/achievements', component: Achievements, title: 'Achievements' },
  { path: '/skills', component: Skills, title: 'Skills' },
  { path: '/contact', component: Contact, title: 'Contact' }
];

export const routeOrder = {
  '/': 0,
  '/projects-professional': 1,
  '/projects-individual': 2,
  '/achievements': 3,
  '/skills': 4,
  '/contact': 5
}