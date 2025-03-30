import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreateSurveyView.vue')
  },
  {
    path: '/my-surveys',
    name: 'my-surveys',
    component: () => import('@/views/MySurveysView.vue')
  },
  {
    path: '/survey/:id',
    name: 'survey-detail',
    component: () => import('@/views/SurveyDetailView.vue'),
    props: true
  },
  {
    path: '/survey/:id/answers',
    name: 'survey-answers',
    component: () => import('@/views/SurveyAnswersView.vue'),
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active-link'
})

export default router 